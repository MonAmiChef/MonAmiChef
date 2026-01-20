import { RapidapiThrottlerGuard } from './rapidapi-throttler.guard';

describe('RapidapiThrottlerGuard', () => {
  it('should be defined', () => {
    expect(new RapidapiThrottlerGuard()).toBeDefined();
  });
});
