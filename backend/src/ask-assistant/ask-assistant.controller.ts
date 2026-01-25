import { Body, Controller, Post } from '@nestjs/common';
import { AskAssistantService } from './ask-assistant.service';
import {
  AskAssistantRequestDto,
  AskAssistantResponse,
} from './ask-assistant.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('MonAmiChef')
@Controller('ask-assistant')
export class AskAssistantController {
  constructor(private askAssistantService: AskAssistantService) {}

  @Post()
  @ApiOperation({ operationId: 'ask-assistant' })
  async askAssistant(
    @Body() body: AskAssistantRequestDto,
  ): Promise<AskAssistantResponse> {
    return this.askAssistantService.askAssistant({ text: body.text });
  }
}
