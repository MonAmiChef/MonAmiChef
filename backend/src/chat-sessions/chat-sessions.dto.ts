import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PreferenceTag } from '@prisma/client';

// SERVICE

export const ChatIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  category: z.enum([
    'FRUITS',
    'VEGETABLES',
    'MEAT',
    'FISH',
    'DAIRY',
    'PANTRY',
    'BAKERY',
    'FROZEN',
    'DRINKS',
    'OTHER',
  ]),
});
export type ChatIngredient = z.output<typeof ChatIngredientSchema>;

// Lenient version used only when parsing raw AI output — never fails,
// filters out items with missing name or non-positive quantity afterward.
const AiIngredientParseSchema = z
  .array(
    z.object({
      name: z.string().catch(''),
      quantity: z.number().catch(0),
      unit: z.string().catch(''),
      category: z
        .enum([
          'FRUITS',
          'VEGETABLES',
          'MEAT',
          'FISH',
          'DAIRY',
          'PANTRY',
          'BAKERY',
          'FROZEN',
          'DRINKS',
          'OTHER',
        ])
        .catch('OTHER'),
    }),
  )
  .catch([])
  .transform((items) => items.filter((i) => i.quantity > 0 && i.name.length > 0));

export const CreateChatWithTitleServiceResponseSchema = z.object({
  title: z.string(),
  text: z.string(),
  isRecipe: z.boolean(),
  ingredients: AiIngredientParseSchema.optional().default([]),
  servings: z.number().int().positive().optional(),
});

export type CreateChatWithTitleServiceResponse = z.output<
  typeof CreateChatWithTitleServiceResponseSchema
>;

// ----------------------------------------------------------

const PreferenceTagEnum = z.enum(
  Object.values(PreferenceTag) as [string, ...string[]],
);

const ProfilePreferencesSchema = z
  .object({
    goal: z
      .enum(['bulking', 'cutting', 'body_recomposition'])
      .nullable()
      .optional(),
    ingredientRestrictions: z.array(z.string()).optional().default([]),
    dietRestrictions: z.array(z.string()).optional().default([]),
    aversions: z.array(z.string()).optional().default([]),
  })
  .nullable()
  .optional();

export type ProfilePreferences = z.infer<typeof ProfilePreferencesSchema>;

const CreateChatSessionRequestSchema = z.object({
  firstMessage: z.string(),
  preferences: z.array(PreferenceTagEnum).default([]),
  exclude: z.array(PreferenceTagEnum).default([]),
  language: z.string().optional().default('english'),
  profilePreferences: ProfilePreferencesSchema,
});

export class CreateChatSessionRequestDto extends createZodDto(
  CreateChatSessionRequestSchema,
) {}

const ChatMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.enum(['user', 'model']),
  isRecipe: z.boolean().default(false),
  content: z.string(),
  createdAt: z.coerce.string(),
});

const CreateChatSessionResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  ingredients: z.array(ChatIngredientSchema).optional(),
  servings: z.number().int().positive().optional(),
});

export const CreateChatSessionResponseJson = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    text: { type: 'string' },
    isRecipe: { type: 'boolean' },
    imagePrompt: { type: 'string' },
    servings: { type: 'integer' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          category: {
            type: 'string',
            enum: [
              'FRUITS',
              'VEGETABLES',
              'MEAT',
              'FISH',
              'DAIRY',
              'PANTRY',
              'BAKERY',
              'FROZEN',
              'DRINKS',
              'OTHER',
            ],
          },
        },
        required: ['name', 'quantity', 'unit', 'category'],
      },
    },
  },
  required: ['title', 'text', 'isRecipe'],
};

export type CreateChatSessionResponse = z.output<
  typeof CreateChatSessionResponseSchema
>;

export class CreateChatSessionResponseDto extends createZodDto(
  CreateChatSessionResponseSchema,
) {}

// UPDATE

export const chatResponseSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(1, 'Error: text is empty'),
  isRecipe: z.boolean().default(false),
  imagePrompt: z.string().default(''),
  ingredients: AiIngredientParseSchema.optional().default([]),
  servings: z.number().int().positive().optional(),
});

export const updateChatResponseSchema = z.object({
  text: z.string(),
  isRecipe: z.boolean().default(false),
  imagePrompt: z.string().default(''),
  ingredients: z.array(ChatIngredientSchema).optional().default([]),
  servings: z.number().int().positive().optional(),
});

export type UpdateChatResponse = z.output<typeof updateChatResponseSchema>;

export const UpdateChatSessionResponseJson = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    isRecipe: { type: 'boolean' },
    imagePrompt: { type: 'string' },
    servings: { type: 'integer' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          category: {
            type: 'string',
            enum: [
              'FRUITS',
              'VEGETABLES',
              'MEAT',
              'FISH',
              'DAIRY',
              'PANTRY',
              'BAKERY',
              'FROZEN',
              'DRINKS',
              'OTHER',
            ],
          },
        },
        required: ['name', 'quantity', 'unit', 'category'],
      },
    },
  },
  required: ['text', 'isRecipe'],
};

const UpdateChatSessionRequestSchema = z.object({
  message: z.string(),
  preferences: z.array(PreferenceTagEnum).default([]),
  exclude: z.array(PreferenceTagEnum).default([]),
  language: z.string().optional().default('english'),
});

export class UpdateChatSessionRequestDto extends createZodDto(
  UpdateChatSessionRequestSchema,
) {}

const UpdateChatSessionResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  ingredients: z.array(ChatIngredientSchema).optional(),
  servings: z.number().int().positive().optional(),
});

export type UpdateChatSessionResponse = z.output<
  typeof UpdateChatSessionResponseSchema
>;

export class UpdateChatSessionResponseDto extends createZodDto(
  UpdateChatSessionResponseSchema,
) {}

// GET SINGLE CHAT

const GetChatSessionResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  preferences: z.array(z.string()),
  exclude: z.array(z.string()),
});

export type GetChatSessionResponse = z.output<
  typeof GetChatSessionResponseSchema
>;

export class GetChatSessionResponseDto extends createZodDto(
  GetChatSessionResponseSchema,
) {}

// GET ALL USERS CHAT

const GetAllChatsSessionResponseSchema = z.object({
  chats: z.array(
    z.object({
      id: z.uuid(),
      title: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
});

export type GetAllChatsSessionResponse = z.output<
  typeof GetAllChatsSessionResponseSchema
>;

export class GetAllChatsSessionResponseDto extends createZodDto(
  GetAllChatsSessionResponseSchema,
) {}
