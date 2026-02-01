import { components } from '@/types/api';
import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CreateChatResponse =
  components['schemas']['CreateChatSessionResponseDto_Output'];

type GetChatResponse =
  components['schemas']['GetChatSessionResponseDto_Output'];

type ChatListItem =
  components['schemas']['GetAllChatsSessionResponseDto_Output'][number];

export const chatApi = {
  getAllUserSessions: async (session: Session): Promise<ChatListItem[]> => {
    const response = await fetch(`${API_URL}/chat-sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to get user sessions');
    const data = (await response.json()) as ChatListItem[];
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
};
