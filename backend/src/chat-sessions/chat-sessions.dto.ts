import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// SERVICE

export const CreateChatWithTitleServiceResponseSchema = z.object({
  title: z.string(),
  text: z.string(),
});

export type CreateChatWithTitleServiceResponse = z.output<
  typeof CreateChatWithTitleServiceResponseSchema
>;

// ----------------------------------------------------------

const CreateChatSessionRequestSchema = z.object({
  firstMessage: z.string(),
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
  content: z.string(),
  createdAt: z.string(),
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
  },
  required: ['title', 'text'],
};

export type CreateChatSessionResponse = z.output<
  typeof CreateChatSessionResponseSchema
>;

export class CreateChatSessionResponseDto extends createZodDto(
  CreateChatSessionResponseSchema,
) {}

// UPDATE

const UpdateChatSessionRequestSchema = z.object({
  message: z.string(),
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
