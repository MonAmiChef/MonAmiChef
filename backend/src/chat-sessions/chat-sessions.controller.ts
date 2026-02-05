import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatSessionsService } from './chat-sessions.service';
import {
  CreateChatSessionRequestDto,
  CreateChatSessionResponseDto,
  GetAllChatsSessionResponseDto,
  GetChatSessionResponseDto,
  UpdateChatSessionRequestDto,
  UpdateChatSessionResponseDto,
} from './chat-sessions.dto';
import { ZodResponse } from 'nestjs-zod';
import {
  type AuthenticatedRequest,
  SupabaseGuard,
} from '../supabase-guard/supabase.guard';

@Controller('chat-sessions')
@UseGuards(SupabaseGuard)
export class ChatSessionsController {
  constructor(private chatSessionsService: ChatSessionsService) {}

  @Get(':id')
  @ZodResponse({
    status: 200,
    type: GetChatSessionResponseDto,
  })
  async getChat(@Param('id') chatId: string) {
    return this.chatSessionsService.getChat({ chatId });
  }

  @Get()
  @ZodResponse({
    status: 200,
    type: GetAllChatsSessionResponseDto,
  })
  async getAllUserChats(@Req() req: AuthenticatedRequest) {
    return this.chatSessionsService.getAllUserChats({
      userId: req.user.id,
    });
  }

  @Post()
  @ZodResponse({
    status: 200,
    type: CreateChatSessionResponseDto,
  })
  async createChat(
    @Body() body: CreateChatSessionRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chatSessionsService.createChat({
      userId: req.user.id,
      message: body.firstMessage,
      preferences: body.preferences,
      exclude: body.exclude,
    });
  }

  @Post(':id/messages')
  @ZodResponse({
    status: 200,
    type: UpdateChatSessionResponseDto,
  })
  async updateChat(
    @Param('id') chatId: string,
    @Body() body: UpdateChatSessionRequestDto,
  ) {
    return this.chatSessionsService.updateChat({
      chatId,
      message: body.message,
      preferences: body.preferences,
      exclude: body.exclude,
    });
  }
}
