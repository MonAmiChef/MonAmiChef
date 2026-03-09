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
  ProfilePreferences,
  UpdateChatResponse,
  UpdateChatSessionResponseJson,
} from '../chat-sessions/chat-sessions.dto';
import {
  ParseRecipeResponseJson,
  ParseRecipeResponseSchema,
} from '../recipes/recipes.types';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

function buildProfileContext(p: ProfilePreferences): string {
  if (!p) return '';
  const lines: string[] = [];

  if (p.goal === 'bulking')
    lines.push(
      'USER GOAL: Bulking — prioritize recipes ≥400 kcal and ≥30g protein per serving.',
    );
  if (p.goal === 'cutting')
    lines.push(
      'USER GOAL: Cutting — keep recipes under 500 kcal per serving, prioritize high satiety.',
    );
  if (p.goal === 'body_recomposition')
    lines.push(
      'USER GOAL: Body recomposition — balanced macros, ≥25g protein, 350–500 kcal per serving.',
    );

  if (p.ingredientRestrictions?.length)
    lines.push(
      `STRICT ALLERGIES (never use these ingredients): ${p.ingredientRestrictions.join(', ')}.`,
    );

  if (p.dietRestrictions?.length)
    lines.push(
      `DIET: ${p.dietRestrictions.join(', ')}. All recipes must comply strictly.`,
    );

  if (p.aversions?.length)
    lines.push(
      `DISLIKES (omit entirely, do not mention as optional): ${p.aversions.join(', ')}.`,
    );

  return lines.length ? `\nUSER PROFILE CONSTRAINTS:\n${lines.join('\n')}` : '';
}

@Injectable()
export class AiAssistantService {
  private ai = new GoogleGenAI({});

  async parseRecipe({ language, text }: { language: string; text: string }) {
    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate the response in this language: ${language}\n\nContent to parse:\n${text}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: process.env.PARSE_RECIPE_PROMPT,
        responseJsonSchema: ParseRecipeResponseJson,
        temperature: 0.3,
      },
    });

    return ParseRecipeResponseSchema.parse(JSON.parse(result.text ?? ''));
  }

  async createChatWithTitle({
    message,
    preferences,
    exclude,
    fallbackLanguage,
    profilePreferences,
  }: {
    message: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    fallbackLanguage: string;
    profilePreferences?: ProfilePreferences;
  }): Promise<CreateChatWithTitleServiceResponse> {
    const userQuery =
      message.trim().length > 0
        ? message
        : `Please suggest a recipe or cooking advice based on my preferences.`;

    const prefContext = `
      RESPONSE_LANGUAGE: ${fallbackLanguage}
      PREFERENCES: ${preferences?.join(', ') ?? 'None'}
      EXCLUDE: ${exclude?.join(', ') ?? 'None'}
    `;

    const languageRule = `\nLANGUAGE RULE: You MUST write the 'text' field entirely in ${fallbackLanguage}. This is a hard constraint — do not switch to another language unless the user explicitly asks you to in their message.\n`;

    const result = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
      contents: userQuery,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `${process.env.GENERATE_CHAT_WITH_TITLE_PROMPT}${languageRule}\nUser Context:${prefContext}${buildProfileContext(profilePreferences)}`,
        responseJsonSchema: CreateChatSessionResponseJson,
        temperature: 0.3,
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
    language,
  }: {
    messages: Pick<Message, 'role' | 'content'>[];
    newMessage: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    language: string;
  }): Promise<UpdateChatResponse> {
    const prefContext = `
    RESPONSE_LANGUAGE: ${language}
    PREFERENCES: ${preferences?.join(', ') || 'None'}
    EXCLUDE: ${exclude?.join(', ') || 'None'}
  `;

    const languageRule = `\nLANGUAGE RULE: You MUST write the 'text' field entirely in ${language}. This is a hard constraint — do not switch to another language unless the user explicitly asks you to in their message.\n`;

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
        systemInstruction: `${process.env.GENERATE_CHAT_RESPONSE_PROMPT}${languageRule}\nUser Context:\n${prefContext}`,
        responseJsonSchema: UpdateChatSessionResponseJson,
        temperature: 0.3,
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
        ingredients: jsonResponse.ingredients ?? [],
        servings: jsonResponse.servings,
      };
    } catch (e) {
      console.error('Erreur parsing JSON AI:', e);
      try {
        const raw = JSON.parse(result.text ?? '{}') as Record<string, unknown>;
        const text =
          typeof raw.text === 'string' && raw.text.length > 0
            ? raw.text
            : 'Error';
        return { text, isRecipe: false, imagePrompt: '', ingredients: [], servings: undefined };
      } catch {
        return { text: 'Error', isRecipe: false, imagePrompt: '', ingredients: [], servings: undefined };
      }
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
