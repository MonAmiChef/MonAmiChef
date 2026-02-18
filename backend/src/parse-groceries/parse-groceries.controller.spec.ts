import { Test, TestingModule } from '@nestjs/testing';
import { ParserController } from './parse-groceries.controller';
import { ParseGroceriesService } from './parse-groceries.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';

describe('ParserController', () => {
  let controller: ParserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParserController],
      providers: [
        RecipeCacheRepository,
        PrismaService,
        AiAssistantService,
        RecipeCacheService,
        ParseGroceriesService,
        HashingService,
      ],
    }).compile();

    controller = module.get<ParserController>(ParserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
