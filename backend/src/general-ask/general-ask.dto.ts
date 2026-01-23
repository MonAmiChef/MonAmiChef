import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GeneralAskResponseSchema = z.object({
  answer: z.string(),
});

export class GeneralAskResponseDto extends createZodDto(
  GeneralAskResponseSchema,
) {}

export type GeneralAskResponse = z.output<typeof GeneralAskResponseSchema>;

export const GeneralAskResponseJson = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
    },
  },
};
