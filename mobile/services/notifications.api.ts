import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const notificationsApi = {
  registerPushToken: async (session: Session, token: string) => {
    const response = await fetch(`${API_URL}/user/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register push token');
    }

    return response.json();
  },
};
