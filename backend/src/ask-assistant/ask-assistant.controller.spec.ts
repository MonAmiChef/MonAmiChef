import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';
import { AskAssistantController } from './ask-assistant.controller';
import { AskAssistantService } from './ask-assistant.service';
import { ParseGroceriesService } from '../parse-groceries/parse-groceries.service';
import { SubstituteService } from '../substitute/substitute.service';
import { GeneralAskService } from '../general-ask/general-ask.service';

describe('ParserController', () => {
  let controller: AskAssistantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AskAssistantController],
      providers: [
        PrismaService,
        RecipeCacheRepository,
        HashingService,
        AiAssistantService,
        RecipeCacheService,
        AskAssistantService,
        ParseGroceriesService,
        SubstituteService,
        GeneralAskService,
      ],
    }).compile();

    controller = module.get<AskAssistantController>(AskAssistantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
