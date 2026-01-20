import { Test, TestingModule } from '@nestjs/testing';
import { GroceryParserController } from './parser.controller';
import { GroceryParserService } from './parser.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';

describe('GroceryParserController', () => {
  let controller: GroceryParserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroceryParserController],
      providers: [
        RecipeCacheRepository,
        PrismaService,
        AiAssistantService,
        RecipeCacheService,
        GroceryParserService,
        HashingService,
      ],
    }).compile();

    controller = module.get<GroceryParserController>(GroceryParserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
