import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (session) {
          router.replace('/(main)/chat/new');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.log('Erreur check session:', e);
        router.replace('/(auth)/login');
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    checkSession();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
