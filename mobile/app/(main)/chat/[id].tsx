import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import Markdown from 'react-native-markdown-display';
import { markdownStyles } from '@/constants/MarkdownStyles';
import { ChatInput } from '@/components/chat/ChatInput';
import { useRef } from 'react';
import { components } from '@/types/api';

type ChatSession = components['schemas']['GetChatSessionResponseDto_Output'];
type ChatMessage = ChatSession['messages'][number];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const flashListRef = useRef<FlashListRef<ChatMessage> | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['chat-session', id],
    queryFn: () => chatApi.getSession(id, session!),
    enabled: !!id && !!session,
  });

  const mutation = useMutation({
    mutationFn: (message: string) =>
      chatApi.sendMessageToSession(id, message, session!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['chat-session', id] }),
      ]);

      flashListRef.current?.scrollToEnd({ animated: true });
    },
  });

  const handleSend = (msg: string) => {
    if (!msg.trim() || mutation.isPending) return;
    mutation.mutate(msg);
  };

  if (isAuthLoading || (isLoading && !!session)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlashList
        ref={flashListRef}
        data={data?.messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        renderItem={({ item }) => {
          const isModel = item.role === 'model';
          const formattedContent = item.content.replace(/\n/g, '\n\n');

          if (isModel) {
            // Rendu style Gemini : Pas de bulle, pleine largeur
            return (
              <Box className="w-full py-6 border-b border-slate-100">
                <Markdown mergeStyle={true} style={markdownStyles}>
                  {formattedContent}
                </Markdown>
              </Box>
            );
          }

          // Message Utilisateur : Garde sa petite bulle orange à droite
          return (
            <Box className="bg-orange-500 self-end p-4 rounded-2xl rounded-tr-none mb-2 max-w-[80%]">
              <Text className="text-white text-[15px] font-medium">
                {item.content}
              </Text>
            </Box>
          );
        }}
        // Optionnel : Scroll automatique vers le bas au chargement
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onContentSizeChange={(w, h) => {}}
      />

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
