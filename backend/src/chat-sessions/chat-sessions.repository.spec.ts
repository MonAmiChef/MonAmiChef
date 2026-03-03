/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { PrismaService } from '../prisma.service';

describe('ChatSessionsRepository', () => {
  let repository: ChatSessionsRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatSessionsRepository,
        {
          provide: PrismaService,
          useValue: {
            chatSession: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ChatSessionsRepository>(ChatSessionsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return all user chats', async () => {
    const result = await repository.getAllUserChats({ userId: 'test-user' });
    expect(prismaService.chatSession.findMany).toHaveBeenCalledWith({
      where: { userId: 'test-user' },
    });
    expect(result).toEqual([]);
  });

  it('should return a specific chat', async () => {
    const result = await repository.getChat({
      chatId: 'test-chat',
      userId: 'test-user',
    });
    expect(prismaService.chatSession.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-chat', userId: 'test-user' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    expect(result).toBeNull();
  });
});
