import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';

export default function Index() {
  const router = useRouter();
  const { signInAnonymously } = useAuth();

  useEffect(() => {
    async function prepareApp() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          await signInAnonymously();
        }
        router.replace('/(main)');
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: "Erreur de démarrage de l'application",
          text2: (e as Error).message,
        });
        router.replace('/(auth)/login');
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    void prepareApp();
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
