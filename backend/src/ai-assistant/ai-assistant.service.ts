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
} from '../general-ask/general-ask.dto';
import { Message, PreferenceTag } from '@prisma/client';
import {
  chatResponseSchema,
  CreateChatSessionResponseJson,
  CreateChatWithTitleServiceResponse,
  CreateChatWithTitleServiceResponseSchema,
  UpdateChatResponse,
  UpdateChatSessionResponseJson,
} from 'src/chat-sessions/chat-sessions.dto';
import {
  ParseRecipeResponseJson,
  ParseRecipeResponseSchema,
} from 'src/recipes/recipes.dto';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

@Injectable()
export class AiAssistantService {
  private ai = new GoogleGenAI({});

  async parseRecipe({ text }: { text: string }) {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.PARSE_RECIPE_PROMPT,
        responseJsonSchema: ParseRecipeResponseJson,
      },
    });

    return ParseRecipeResponseSchema.parse(JSON.parse(result.text ?? ''));
  }

  async createChatWithTitle({
    message,
    preferences,
    exclude,
    fallbackLanguage,
  }: {
    message: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    fallbackLanguage: string;
  }): Promise<CreateChatWithTitleServiceResponse> {
    const userQuery =
      message.trim().length > 0
        ? message
        : `Please suggest a recipe or cooking advice based on my preferences in the language: ${fallbackLanguage}.`;

    const prefContext = `
      PREFERENCES: ${preferences?.join(', ') ?? 'None'}
      EXCLUDE: ${exclude?.join(', ') ?? 'None'}
    `;

    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: userQuery,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${process.env.GENERATE_CHAT_WITH_TITLE_PROMPT}\n\nUser Context:${prefContext}`,
        responseJsonSchema: CreateChatSessionResponseJson,
      },
    });

    return CreateChatWithTitleServiceResponseSchema.parse(
      JSON.parse(result.text ?? ''),
    );
  }

  async updateChat({
    messages,
    newMessage,
    preferences,
    exclude,
    language = 'francais',
  }: {
    messages: Pick<Message, 'role' | 'content'>[];
    newMessage: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    language?: string;
  }): Promise<UpdateChatResponse> {
    const prefContext = `
    TARGET_LANGUAGE: ${language}
    PREFERENCES: ${preferences?.join(', ') || 'None'}
    EXCLUDE: ${exclude?.join(', ') || 'None'}
  `;

    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [
        ...messages.map((m) => ({
          role: m.role.toLowerCase() === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: newMessage }] },
      ],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${process.env.GENERATE_CHAT_RESPONSE_PROMPT}\n\nUser Context:\n${prefContext}`,
        responseJsonSchema: UpdateChatSessionResponseJson,
      },
    });

    try {
      const jsonResponse = chatResponseSchema.parse(
        JSON.parse(result.text ?? ''),
      );
      return {
        text: jsonResponse.text ?? 'Error',
        isRecipe: jsonResponse.isRecipe ?? false,
        imagePrompt: jsonResponse.imagePrompt ?? '',
      };
    } catch (e) {
      console.error('Erreur parsing JSON AI:', e);
      return {
        text: result.text ?? 'Error',
        isRecipe: false,
        imagePrompt: '',
      };
    }
  }

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
