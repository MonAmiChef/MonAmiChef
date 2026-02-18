import { Injectable } from '@nestjs/common';
import { ParseGroceriesService } from '../parse-groceries/parse-groceries.service';
import { SubstituteService } from '../substitute/substitute.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { GeneralAskService } from '../general-ask/general-ask.service';
import {
  AskAssistantData,
  AskAssistantResponse,
  AskAssistantResponseSchema,
} from './ask-assistant.dto';

@Injectable()
export class AskAssistantService {
  constructor(
    private parseGroceriesService: ParseGroceriesService,
    private substituteService: SubstituteService,
    private generalAskService: GeneralAskService,
    private aiAssistantService: AiAssistantService,
  ) {}

  async askAssistant({
    text,
  }: {
    text: string;
  }): Promise<AskAssistantResponse> {
    const { intent } = await this.aiAssistantService.inferIntent({ text });

    let data: AskAssistantData;

    switch (intent) {
      case 'PARSER':
        data = await this.parseGroceriesService.parseGroceries({ text });
        return AskAssistantResponseSchema.parse({ intent: 'PARSER', data });
      case 'SUBSTITUTE':
        data = await this.substituteService.substituteIngredients({ text });
        return AskAssistantResponseSchema.parse({ intent: 'SUBSTITUTE', data });
      case 'GENERAL':
        data = await this.generalAskService.generalAsk({ text });
        return AskAssistantResponseSchema.parse({ intent: 'GENERAL', data });
      default:
        data = await this.generalAskService.generalAsk({ text });
        return AskAssistantResponseSchema.parse({ intent: 'GENERAL', data });
    }
  }
}
