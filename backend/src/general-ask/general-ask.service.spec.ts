import { Test, TestingModule } from '@nestjs/testing';
import { GeneralAskService } from './general-ask.service';

describe('GeneralAskService', () => {
  let service: GeneralAskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneralAskService],
    }).compile();

    service = module.get<GeneralAskService>(GeneralAskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
