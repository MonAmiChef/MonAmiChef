import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private expo: Expo;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendMorningInspiration() {
    this.logger.log('Running Morning Inspiration Cron');
    const todayStr = new Date().toISOString().split('T')[0];

    const usersWithPlans = await this.prisma.user.findMany({
      where: {
        pushToken: { not: null },
        mealPlanEntries: { some: { date: { equals: new Date(todayStr + 'T00:00:00.000Z') } } },
      },
      include: {
        mealPlanEntries: {
          where: { date: { equals: new Date(todayStr + 'T00:00:00.000Z') } },
          include: { recipe: true },
        },
      },
    });

    for (const user of usersWithPlans) {
      if (!user.pushToken) continue;
      const mealNames = user.mealPlanEntries.map((e) => e.recipe.name).join(', ');
      await this.sendPushNotification(
        user.id,
        "🍳 Inspiration du matin",
        `Aujourd'hui au menu: ${mealNames}. Bonne journée!`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async sendDinnerPrepAlert() {
    this.logger.log('Running Dinner Prep Alert Cron');
    const todayStr = new Date().toISOString().split('T')[0];

    const usersWithDinner = await this.prisma.user.findMany({
      where: {
        pushToken: { not: null },
        mealPlanEntries: {
          some: {
            date: { equals: new Date(todayStr + 'T00:00:00.000Z') },
            mealType: 'DINNER',
          },
        },
      },
      include: {
        mealPlanEntries: {
          where: {
            date: { equals: new Date(todayStr + 'T00:00:00.000Z') },
            mealType: 'DINNER',
          },
          include: { recipe: true },
        },
      },
    });

    for (const user of usersWithDinner) {
      const dinner = user.mealPlanEntries[0]; // Take first dinner
      if (!dinner) continue;

      await this.sendPushNotification(
        user.id,
        "👨‍🍳 On prépare le dîner?",
        `C'est l'heure de préparer votre ${dinner.recipe.name}. Prêt?`,
      );
    }
  }

  async updatePushToken(userId: string, token: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: token },
    });
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) {
      this.logger.warn(`User ${userId} has no push token registered.`);
      return;
    }

    if (!Expo.isExpoPushToken(user.pushToken)) {
      this.logger.error(`Push token ${user.pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data,
      },
    ];

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        this.logger.log(`Sent push notification to ${userId}: ${title}`);
        // Handle tickets if needed (receipts)
      }
    } catch (error) {
      this.logger.error(`Error sending push notification to ${userId}:`, error);
    }
  }

  async sendToAllUsers(title: string, body: string, data?: any) {
    const users = await this.prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { id: true, pushToken: true },
    });

    const messages: ExpoPushMessage[] = users
      .filter((u) => Expo.isExpoPushToken(u.pushToken!))
      .map((u) => ({
        to: u.pushToken!,
        sound: 'default',
        title,
        body,
        data,
      }));

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        this.logger.error('Error sending bulk push notifications:', error);
      }
    }
  }
}
