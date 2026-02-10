import z from 'zod';

const askIntent = ['PARSER', 'SUBSTITUTE', 'GENERAL'] as const;

export const AssistantInferIntentResponseSchema = z.object({
  intent: z.enum(askIntent),
});

export const AssistantInferIntentResponseJson = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: askIntent,
    },
  },
};
