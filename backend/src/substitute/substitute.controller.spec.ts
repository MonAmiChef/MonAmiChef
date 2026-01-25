import { Test, TestingModule } from '@nestjs/testing';
import { SubstituteController } from './substitute.controller';
import { SubstituteService } from './substitute.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';

describe('SubstituteController', () => {
  let controller: SubstituteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstituteController],
      providers: [
        HashingService,
        SubstituteService,
        PrismaService,
        RecipeCacheRepository,
        RecipeCacheService,
        AiAssistantService,
      ],
    }).compile();

    controller = module.get<SubstituteController>(SubstituteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
