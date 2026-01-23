import { Injectable } from '@nestjs/common';
import { GeneralAskResponse } from './general-ask.dto';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';

@Injectable()
export class GeneralAskService {
  constructor(private assistantService: AiAssistantService) {}

  async generalAsk({ text }: { text: string }): Promise<GeneralAskResponse> {
    const result = await this.assistantService.generalAsk({ text });

    return { answer: result.answer };
  }
}
