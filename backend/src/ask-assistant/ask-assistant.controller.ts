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
  @ApiOperation({
    summary: 'Expert culinary advice for recipes and techniques',
    description:
      'A direct line to a specialized culinary AI expert. Use this endpoint to generate complex cooking instructions, ask for professional wine pairings, or get advice on how to fix a recipe. It understands culinary techniques and flavor profiles at a professional level.',
    operationId: 'ask-assistant',
  })
  async askAssistant(
    @Body() body: AskAssistantRequestDto,
  ): Promise<AskAssistantResponse> {
    return this.askAssistantService.askAssistant({ text: body.text });
  }
}
