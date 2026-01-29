import { Injectable } from '@nestjs/common';
import { ChatSession, Message, MessageRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatSessionsRepository {
  constructor(private prismaService: PrismaService) {}

  async getAllUserChats({
    userId,
  }: {
    userId: string;
  }): Promise<ChatSession[]> {
    return this.prismaService.chatSession.findMany({
      where: {
        userId,
      },
    });
  }

  async getChat({
    chatId,
  }: {
    chatId: string;
  }): Promise<(ChatSession & { messages: Message[] }) | null> {
    return this.prismaService.chatSession.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });
  }

  async createChat({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }): Promise<ChatSession> {
    const chat = await this.prismaService.chatSession.create({
      data: {
        userId,
        messages: {
          create: [{ content: message, role: 'user' }],
        },
      },
    });
    return chat;
  }

  async updateChat({
    id,
    message,
    role,
  }: {
    id: string;
    message: string;
    role: MessageRole;
  }): Promise<(ChatSession & { messages: Message[] }) | null> {
    await this.prismaService.message.create({
      data: {
        chatId: id,
        content: message,
        role,
      },
    });

    return this.getChat({ chatId: id });
  }
}
