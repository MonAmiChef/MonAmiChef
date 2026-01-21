/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import {
  APP_PIPE,
  APP_INTERCEPTOR,
  APP_FILTER,
  BaseExceptionFilter,
  APP_GUARD,
} from '@nestjs/core';
import { ZodError } from 'zod';
import {
  Module,
  HttpException,
  ArgumentsHost,
  Logger,
  Catch,
} from '@nestjs/common';
import { ParseGroceriesService } from './parse-groceries/parse-groceries.service';
import { ParserController } from './parse-groceries/parse-groceries.controller';
import { AiAssistantService } from './ai-assistant/ai-assistant.service';
import { ConfigModule } from '@nestjs/config';
import { HashingService } from './hashing/hashing.service';
import { RecipeCacheModule } from './recipe-cache/recipe-cache.module';
import { HashingModule } from './hashing/hashing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { RapidapiThrottlerGuard } from './rapidapi-throttler/rapidapi-throttler.guard';
import { SubstituteService } from './substitute/substitute.service';
import { SubstituteController } from './substitute/substitute.controller';

@Catch()
class GlobalExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.logger.error(exception instanceof Error ? exception.stack : exception);

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
    } else if (exception instanceof ZodError) {
      status = 400;
      message = 'Zod validation failed';
    }

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message: Array.isArray(message) ? message[0] : message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    RecipeCacheModule,
    HashingModule,
  ],
  controllers: [ParserController, SubstituteController],
  providers: [
    ParseGroceriesService,
    AiAssistantService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RapidapiThrottlerGuard,
    },
    HashingService,
    SubstituteService,
  ],
})
export class AppModule {}
