import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import {
  ParseGroceriesResponse,
  ParseGroceriesResponseJson,
  ParseGroceriesResponseSchema,
} from '../parse-groceries/parse-groceries.dto';
import {
  SubstituteIngredientsResponse,
  SubstituteIngredientsResponseJson,
  SubstituteIngredientsResponseSchema,
} from '../substitute/substitute.dto';
import {
  AssistantInferIntentResponseJson,
  AssistantInferIntentResponseSchema,
} from './ai-assistant.dto';
import {
  GeneralAskResponseJson,
  GeneralAskResponseSchema,
} from 'src/general-ask/general-ask.dto';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

@Injectable()
export class AiAssistantService {
  private ai = new GoogleGenAI({});

  async parseGroceries({
    text,
  }: {
    text: string;
  }): Promise<ParseGroceriesResponse> {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.PARSE_GROCERIES_PROMPT,
        responseJsonSchema: ParseGroceriesResponseJson,
      },
    });

    return ParseGroceriesResponseSchema.parse(JSON.parse(result.text ?? ''));
  }

  async substituteIngredients({
    text,
  }: {
    text: string;
  }): Promise<SubstituteIngredientsResponse> {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.SUBSTITUTE_INGREDIENTS_PROMPT,
        responseJsonSchema: SubstituteIngredientsResponseJson,
      },
    });

    return SubstituteIngredientsResponseSchema.parse(
      JSON.parse(result.text ?? ''),
    );
  }

  async generalAsk({ text }: { text: string }) {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.GENERAL_ASK_PROMPT,
        responseJsonSchema: GeneralAskResponseJson,
      },
    });

    return GeneralAskResponseSchema.parse(JSON.parse(result.text ?? ''));
  }

  async inferIntent({ text }: { text: string }) {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.ASSISTANT_INFER_INTENT_PROMPT,
        responseJsonSchema: AssistantInferIntentResponseJson,
      },
    });

    const parsedBody: unknown = JSON.parse(result.text ?? '{}');

    const validatedData = AssistantInferIntentResponseSchema.parse(parsedBody);

    return {
      intent: validatedData.intent.trim().toUpperCase(),
    };
  }
}
