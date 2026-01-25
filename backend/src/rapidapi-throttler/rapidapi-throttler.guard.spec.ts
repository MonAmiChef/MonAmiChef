/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { RapidapiThrottlerGuard } from './rapidapi-throttler.guard';

// Test class to expose protected method
class TestRapidapiThrottlerGuard extends RapidapiThrottlerGuard {
  public async testGetTracker(req: Record<string, any>): Promise<string> {
    return this.getTracker(req);
  }
}

describe('RapidapiThrottlerGuard', () => {
  let guard: TestRapidapiThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot()],
      providers: [TestRapidapiThrottlerGuard],
    }).compile();

    guard = module.get<TestRapidapiThrottlerGuard>(TestRapidapiThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should return x-rapidapi-user header when present', async () => {
      const mockRequest = {
        headers: {
          'x-rapidapi-user': 'user123',
        },
        ip: '192.168.1.1',
      };

      const tracker = await guard.testGetTracker(mockRequest);
      expect(tracker).toBe('user123');
    });

    it('should return ip when x-rapidapi-user header is not present', async () => {
      const mockRequest = {
        headers: {},
        ip: '192.168.1.1',
      };

      const tracker = await guard.testGetTracker(mockRequest);
      expect(tracker).toBe('192.168.1.1');
    });

    it('should return ip when x-rapidapi-user header is empty', async () => {
      const mockRequest = {
        headers: {
          'x-rapidapi-user': '',
        },
        ip: '192.168.1.1',
      };

      const tracker = await guard.testGetTracker(mockRequest);
      expect(tracker).toBe('192.168.1.1');
    });

    it('should return ip when x-rapidapi-user header uses different case', async () => {
      const mockRequest = {
        headers: {
          'X-RAPIDAPI-USER': 'user456',
        },
        ip: '192.168.1.1',
      };

      const tracker = await guard.testGetTracker(mockRequest);
      expect(tracker).toBe('192.168.1.1');
    });
  });
});
