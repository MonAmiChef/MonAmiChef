import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import {
  ParseGroceriesResponse,
  ParseGroceriesResponseJson,
  ParseGroceriesResponseSchema,
} from '../parser/parser.dto';

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
        systemInstruction: `You are a culinary data extractor.
Focus on extracting the base ingredient name (e.g., "Carrot" instead of "Big organic washed carrot").
If a category is unclear, use "Pantry".`,
        responseJsonSchema: ParseGroceriesResponseJson,
      },
    });

    return ParseGroceriesResponseSchema.parse(JSON.parse(result.text ?? ''));
  }
}
