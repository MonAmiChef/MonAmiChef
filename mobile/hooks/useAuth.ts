import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return { loading, signInWithEmail, signUpWithEmail };
};
