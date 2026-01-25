import { Body, Controller, Post } from '@nestjs/common';
import { AskAssistantService } from './ask-assistant.service';
import {
  AskAssistantRequestDto,
  AskAssistantResponse,
} from './ask-assistant.dto';

@Controller('ask-assistant')
export class AskAssistantController {
  constructor(private askAssistantService: AskAssistantService) {}

  @Post()
  async askAssistant(
    @Body() body: AskAssistantRequestDto,
  ): Promise<AskAssistantResponse> {
    return this.askAssistantService.askAssistant({ text: body.text });
  }
}
