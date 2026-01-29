import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

@Controller('chat-sessions')
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
  async getAllUserChats() {
    return this.chatSessionsService.getAllUserChats({
      userId: '475ce6c1-38b2-4956-87aa-68aa76958640',
    });
  }

  @Post()
  @ZodResponse({
    status: 200,
    type: CreateChatSessionResponseDto,
  })
  async createChat(@Body() body: CreateChatSessionRequestDto) {
    return this.chatSessionsService.createChat({
      userId: '475ce6c1-38b2-4956-87aa-68aa76958640',
      message: body.firstMessage,
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
      role: 'user',
    });
  }
}
