import { Controller, Post, Body, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseGuard } from '../supabase-guard/supabase.guard';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const RegisterPushTokenSchema = z.object({
  token: z.string(),
});

class RegisterPushTokenDto extends createZodDto(RegisterPushTokenSchema) {}

@Controller('user/push-token')
@UseGuards(SupabaseGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async registerToken(@Request() req: any, @Body() body: RegisterPushTokenDto) {
    const userId = req.user.id as string;
    const username = req.user.user_metadata?.username as string | undefined;

    try {
      await this.notificationsService.updatePushToken(userId, body.token, username);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error updating push token');
    }

  }

}
