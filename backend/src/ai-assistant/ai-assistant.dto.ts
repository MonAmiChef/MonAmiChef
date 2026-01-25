import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const askIntent = ['PARSER', 'SUBSTITUTE', 'GENERAL'] as const;

export const AssistantInferIntentResponseSchema = z.object({
  intent: z.enum(askIntent),
});

export class AssistantInferIntentResponseDto extends createZodDto(
  AssistantInferIntentResponseSchema,
) {}

export type AssistantInferIntentResponse = z.output<
  typeof AssistantInferIntentResponseSchema
>;

export const AssistantInferIntentResponseJson = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: askIntent,
    },
  },
};
