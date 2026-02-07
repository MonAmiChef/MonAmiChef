import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PreferenceTag } from '@prisma/client';

// SERVICE

export const CreateChatWithTitleServiceResponseSchema = z.object({
  title: z.string(),
  text: z.string(),
  isRecipe: z.boolean(),
});

export type CreateChatWithTitleServiceResponse = z.output<
  typeof CreateChatWithTitleServiceResponseSchema
>;

// ----------------------------------------------------------

const PreferenceTagEnum = z.enum(
  Object.values(PreferenceTag) as [string, ...string[]],
);

const CreateChatSessionRequestSchema = z.object({
  firstMessage: z.string(),
  preferences: z.array(PreferenceTagEnum).default([]),
  exclude: z.array(PreferenceTagEnum).default([]),
  language: z.string().optional().default('english'),
});

export type CreateChatSessionRequest = z.output<
  typeof CreateChatSessionRequestSchema
>;

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

export type ChatMessage = z.output<typeof ChatMessageSchema>;

const CreateChatSessionResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateChatSessionResponseJson = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    text: { type: 'string' },
    isRecipe: { type: 'boolean' },
    imagePrompt: { type: 'string' },
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
});

export const updateChatResponseSchema = z.object({
  text: z.string(),
  isRecipe: z.boolean().default(false),
  imagePrompt: z.string().default(''),
});

export type UpdateChatResponse = z.output<typeof updateChatResponseSchema>;

export const UpdateChatSessionResponseJson = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    isRecipe: { type: 'boolean' },
    imagePrompt: { type: 'string' },
  },
  required: ['text', 'isRecipe'],
};

const UpdateChatSessionRequestSchema = z.object({
  message: z.string(),
  preferences: z.array(PreferenceTagEnum).default([]),
  exclude: z.array(PreferenceTagEnum).default([]),
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
