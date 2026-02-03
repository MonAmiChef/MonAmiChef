import { Injectable } from '@nestjs/common';
import { ChatSession, Message, MessageRole } from '@prisma/client';
import { PrismaService } from '../prisma.service';

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
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async createChat({
    title,
    userId,
    userMessage,
    modelResponse,
  }: {
    title: string;
    userId: string;
    userMessage: string;
    modelResponse: string;
  }) {
    return this.prismaService.chatSession.create({
      data: {
        userId,
        title,
        messages: {
          create: [
            { content: userMessage, role: 'user' },
            { content: modelResponse, role: 'model' },
          ],
        },
      },
      include: {
        messages: true,
      },
    });
  }

  async updateChat({
    chatId,
    messages,
  }: {
    chatId: string;
    messages: { content: string; role: MessageRole }[];
  }): Promise<{ messages: Message[] }> {
    const formatedMessages = messages.map((msg) => ({
      chatId: chatId,
      content: msg.content,
      role: msg.role,
    }));

    const result = await this.prismaService.message.createManyAndReturn({
      data: formatedMessages,
    });

    return {
      messages: result,
    };
  }
}
