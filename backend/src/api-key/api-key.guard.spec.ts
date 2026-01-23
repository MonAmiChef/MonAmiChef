/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApikeyGuard } from './api-key.guard';

describe('ApikeyGuard', () => {
  let guard: ApikeyGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApikeyGuard],
    }).compile();

    guard = module.get<ApikeyGuard>(ApikeyGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: any;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
        }),
      };
    });

    it('should return true when x-rapidapi-proxy-secret matches RAPIDAPI_PROXY_SECRET', async () => {
      process.env.RAPIDAPI_PROXY_SECRET = 'valid-secret';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          'x-rapidapi-proxy-secret': 'valid-secret',
        },
      });

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return true in development mode with local-test-api-key', async () => {
      process.env.NODE_ENV = 'development';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          'x-api-key': 'local-test-api-key',
        },
      });

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when no valid headers in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAPIDAPI_PROXY_SECRET = 'valid-secret';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          'x-rapidapi-proxy-secret': 'invalid-secret',
        },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Missing or invalid API Key',
      );
    });

    it('should throw UnauthorizedException when no headers provided', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAPIDAPI_PROXY_SECRET = 'some-secret';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException in development with wrong local key', async () => {
      process.env.NODE_ENV = 'development';
      process.env.RAPIDAPI_PROXY_SECRET = 'some-secret';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          'x-api-key': 'wrong-key',
        },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should prioritize rapidapi secret over local key', async () => {
      process.env.RAPIDAPI_PROXY_SECRET = 'valid-secret';
      process.env.NODE_ENV = 'development';

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          'x-rapidapi-proxy-secret': 'valid-secret',
          'x-api-key': 'local-test-api-key',
        },
      });

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    afterEach(() => {
      delete process.env.RAPIDAPI_PROXY_SECRET;
      delete process.env.NODE_ENV;
    });
  });
});
