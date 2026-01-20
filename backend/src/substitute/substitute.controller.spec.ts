import { Test, TestingModule } from '@nestjs/testing';
import { SubstituteController } from './substitute.controller';

describe('SubstituteController', () => {
  let controller: SubstituteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstituteController],
    }).compile();

    controller = module.get<SubstituteController>(SubstituteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
