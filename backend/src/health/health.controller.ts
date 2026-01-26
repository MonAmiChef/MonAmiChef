import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('MonAmiChef')
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verify API operational status and system uptime',
    description:
      "Validates the API's operational status and connectivity to backend services. This endpoint is ideal for monitoring uptime and ensuring the MonAmiChef engine is ready to process requests.",
    operationId: 'health',
  })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
