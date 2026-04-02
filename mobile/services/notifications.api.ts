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
      let errorMessage = 'Failed to register push token';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Fallback if response is not JSON
        console.error('Error parsing notification API error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();

  },
};
