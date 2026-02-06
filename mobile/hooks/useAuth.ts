import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsReady(true);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Échec de la connexion anonyme',
        text2: error.message,
      });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.message,
      });
    } else {
      router.replace('/(main)');
    }
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const tempUsername = email.split('@')[0];

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: tempUsername,
        },
      },
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de création de compte',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Compte créé avec succès!',
        text2: 'Veuillez vous connecter.',
      });
      router.replace('/(auth)/login');
    }
    setLoading(false);
  };

  return {
    session,
    loading,
    isReady,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
  };
};
