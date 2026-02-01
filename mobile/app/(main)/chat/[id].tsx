import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: isAuthLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-session', id],
    queryFn: async () => {
      // console.log('se', session, id);
      if (!session?.access_token) throw new Error('Session manquante');
      const queryData = await chatApi.getSession(id, session);
      // console.log('querysData', queryData);
      return queryData;
    },
    // IMPORTANT : La requête ne part que si on a l'ID et la SESSION
    enabled: !!id && !!session,
  });

  // 1. On gère l'attente de l'auth ou du chargement API
  if (isAuthLoading || (isLoading && !!session)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#000" />
        <Text className="mt-2 text-slate-500">
          Chargement de la conversation...
        </Text>
      </View>
    );
  }

  // 2. On gère l'absence de session (redirection ou message)
  if (!session && !isAuthLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Veuillez vous connecter pour voir ce chat.</Text>
      </View>
    );
  }

  if (error) {
    return <Text>Erreur : {(error as Error).message}</Text>;
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Écran de Chat</Text>
    </View>
  );
}
