import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { chatApi } from '@/services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChatInput } from '@/components/chat/ChatInput';

export default function NewChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (!session?.access_token) throw new Error('Pas de token');
      return await chatApi.createSession(message, session);
    },
    onSuccess: async (data) => {
      console.log('data', data);
      await queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      router.replace(`/(main)/chat/${data.id}`);
    },
    onError: (err) => {
      console.log('Erreur lors de la création de la session de chat:', err);
    },
  });

  const handleSend = (msg: string) => {
    if (!msg.trim() || mutation.isPending) return;
    mutation.mutate(msg);
  };

  return (
    // On utilise flex-1 ici pour que l'écran occupe tout l'espace
    <View className="flex-1 bg-base-bg">
      {/* 1. Zone de contenu (Messages) - Elle doit être en dehors du KeyboardAvoidingView ou en flex-1 dedans */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-2xl font-bold text-slate-800 text-center">
            MonAmiChef
          </Text>
          <Text className="text-slate-400 text-center mt-2">
            Pose-moi une question sur une recette...
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput
          onSend={(msg) => handleSend(msg)}
          isLoading={mutation.isPending}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
