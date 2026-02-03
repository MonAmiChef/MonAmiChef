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
import { useTranslation } from 'react-i18next';

export default function NewChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { t } = useTranslation();

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
            <View className="flex-1 justify-start">
              <View className="bg-orange-500 self-end p-4 rounded-2xl rounded-tr-none mb-4 max-w-[80%]">
                <Text className="text-white text-[15px] font-inter-medium">
                  {optimisticMessage}
                </Text>
              </View>

              <View className="flex-row gap-3 items-center mb-8">
                <ActivityIndicator size="small" color="#ff6900" />
                <WaveText
                  text={t('chat.chef_typing')}
                  color="#FF9800"
                  fontSize={14}
                />
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-2xl font-bold text-slate-800 text-center">
                {t('monamichef')}
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                {t('new_chat')}
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
