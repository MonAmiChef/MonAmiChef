import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_600SemiBold,
  useFonts,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import '../global.css';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';
import '../i18n';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <RootLayoutNav />
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const [colorMode] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <GluestackUIProvider mode={colorMode}>
        <Stack>
          <Stack.Screen
            name="(auth)"
            options={{ animation: 'fade', headerShown: false }}
          />
          <Stack.Screen
            name="(main)"
            options={{ animation: 'fade', headerShown: false }}
          />
        </Stack>
        <Toast />
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
