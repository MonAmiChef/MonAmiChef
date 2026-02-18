import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  ParseGroceriesResponse,
  ParseGroceriesResponseSchema,
} from '../parse-groceries/parse-groceries.dto';
import {
  SubstituteIngredientsResponse,
  SubstituteIngredientsResponseSchema,
} from '../substitute/substitute.dto';
import {
  GeneralAskResponse,
  GeneralAskResponseSchema,
} from '../general-ask/general-ask.dto';

const AskAssistantRequestSchema = z.object({
  text: z
    .string()
    .min(1)
    .describe(
      'The user input text of ingredients to substitute + possible context',
    ),
});

export class AskAssistantRequestDto extends createZodDto(
  AskAssistantRequestSchema,
) {}

export const AskAssistantResponseSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('PARSER'),
    data: ParseGroceriesResponseSchema,
  }),
  z.object({
    intent: z.literal('SUBSTITUTE'),
    data: SubstituteIngredientsResponseSchema,
  }),
  z.object({
    intent: z.literal('GENERAL'),
    data: GeneralAskResponseSchema,
  }),
]);

export type AskAssistantData =
  | ParseGroceriesResponse
  | SubstituteIngredientsResponse
  | GeneralAskResponse;

export type AskAssistantResponse = z.output<typeof AskAssistantResponseSchema>;
