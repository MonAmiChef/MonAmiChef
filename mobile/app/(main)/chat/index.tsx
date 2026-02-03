import React from 'react';
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { chatApi } from '@/services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChatInput } from '@/components/chat/ChatInput';
import { WaveText } from '@/components/chat/WaveText';

export default function NewChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // État pour stocker le message envoyé le temps de la création
  const [optimisticMessage, setOptimisticMessage] = React.useState<
    string | null
  >(null);

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (!session?.access_token) throw new Error('Pas de token');
      return await chatApi.createSession(message, session);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      // On remplit le cache pour éviter le loader sur la page suivante
      queryClient.setQueryData(['chat-session', data.id], data);
      setOptimisticMessage(null);
      router.replace(`/(main)/chat/${data.id}`);
    },
  });

  const handleSend = (msg: string) => {
    if (!msg.trim() || mutation.isPending) return;
    Keyboard.dismiss();
    setOptimisticMessage(msg);
    mutation.mutate(msg);
  };

  return (
    <View className="flex-1 bg-base-bg">
      <Pressable
        onPress={Keyboard.dismiss}
        className="flex-1"
        accessible={false}
      >
        <View className="flex-1 p-6">
          {optimisticMessage ? (
            // --- MODE OPTIMISTE (Dès qu'on envoie) ---
            <View className="flex-1 justify-start">
              {/* Le message de l'utilisateur qui "pop" */}
              <View className="bg-orange-500 self-end p-4 rounded-2xl rounded-tr-none mb-4 max-w-[80%]">
                <Text className="text-white text-[15px] font-inter-medium">
                  {optimisticMessage}
                </Text>
              </View>

              {/* Le loader de l'IA juste en dessous */}
              <View className="flex-row gap-3 items-center mb-8">
                <ActivityIndicator size="small" color="#ff6900" />
                <WaveText
                  text="Le chef prépare sa réponse..."
                  color="#FF9800"
                  fontSize={14}
                />
              </View>
            </View>
          ) : (
            // --- MODE INITIAL (Logo) ---
            <View className="flex-1 justify-center items-center">
              <Text className="text-2xl font-bold text-slate-800 text-center">
                MonAmiChef
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                Pose-moi une question sur une recette...
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ zIndex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
      >
        <ChatInput onSend={handleSend} isLoading={mutation.isPending} />
      </KeyboardAvoidingView>
    </View>
  );
}
