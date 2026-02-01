import { components } from '@/types/api';
import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CreateChatResponse =
  components['schemas']['CreateChatSessionResponseDto_Output'];

type GetChatResponse =
  components['schemas']['GetChatSessionResponseDto_Output'];

type ChatAllChatsItem =
  components['schemas']['GetAllChatsSessionResponseDto_Output'];

export const chatApi = {
  getAllUserSessions: async (session: Session): Promise<ChatAllChatsItem> => {
    const response = await fetch(`${API_URL}/chat-sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to get user sessions');
    const data = (await response.json()) as ChatAllChatsItem;
    return data;
  },

  getSession: async (
    chatId: string,
    session: Session,
  ): Promise<GetChatResponse> => {
    const response = await fetch(`${API_URL}/chat-sessions/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to create session');
    const data = (await response.json()) as GetChatResponse;
    return data;
  },

  createSession: async (
    firstMessage: string,
    session: Session,
  ): Promise<CreateChatResponse> => {
    const response = await fetch(`${API_URL}/chat-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ firstMessage }),
    });

    if (!response.ok) throw new Error('Failed to create session');
    const data = (await response.json()) as CreateChatResponse;
    return data;
  },

  sendMessageToSession: async (
    chatId: string,
    message: string,
    session: Session,
  ): Promise<CreateChatResponse> => {
    const response = await fetch(
      `${API_URL}/chat-sessions/${chatId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ message }),
      },
    );

    if (!response.ok) throw new Error('Failed to create session');
    const data = (await response.json()) as CreateChatResponse;
    return data;
  },
};
