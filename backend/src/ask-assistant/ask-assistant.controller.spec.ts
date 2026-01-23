import { Test, TestingModule } from '@nestjs/testing';
import { AskAssistantController } from './ask-assistant.controller';

describe('AskAssistantController', () => {
  let controller: AskAssistantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AskAssistantController],
    }).compile();

    controller = module.get<AskAssistantController>(AskAssistantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
