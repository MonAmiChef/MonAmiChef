import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { session, signInAnonymously, isReady } = useAuth();

  useEffect(() => {
    async function prepareApp() {
      if (!isReady) return;

      try {
        if (!session) {
          await signInAnonymously();
        }

        const hasSeenOnboarding = await AsyncStorage.getItem(
          'HAS_SEEN_ONBOARDING',
        );

        if (hasSeenOnboarding === 'true') {
          router.replace('/(main)');
        } else {
          router.replace('/(auth)/onboarding');
        }
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
  }, [isReady, session]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <ActivityIndicator size="large" color="#ff6900" />
    </View>
  );
}
