import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

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
        text1: t('toast.fail_guest'),
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
        text1: t('toast.error_login'),
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
        text1: t('toast.error_register'),
        text2: error.message,
      });
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      Toast.show({
        type: 'success',
        text1: t('toast.success_register'),
        text2: t('toast.please_login'),
      });
      router.replace('/(auth)/login');
    } else {
      Toast.show({
        type: 'success',
        text1: t('toast.success_register'),
      });
      router.replace('/(main)');
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
