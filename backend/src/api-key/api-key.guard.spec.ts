import { ApikeyGuard } from './api-key.guard';

describe('ApikeyGuard', () => {
  it('should be defined', () => {
    expect(new ApikeyGuard()).toBeDefined();
  });
});
