import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/useAuth';
import { chatApi, mealPlanApi } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import Markdown from 'react-native-markdown-display';
import { markdownStyles } from '@/constants/MarkdownStyles';
import { ChatInput } from '@/components/chat/ChatInput';
import { useRef, useState } from 'react';
import { components } from '@/types/api';
import Drawer from 'expo-router/drawer';
import { WaveText } from '@/components/chat/WaveText';
import { HStack } from '@/components/ui/hstack';
import { PreferenceTag } from '@/constants/PreferencesTags';
import { PreferencesQuickSelector } from '@/components/chat/PreferencesQuickSelector';
import { PreferenceActionSheet } from '@/components/chat/PreferenceActionSheet';
import { t } from 'i18next';
import { ShoppingCart } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

type ChatSession = components['schemas']['GetChatSessionResponseDto_Output'];
type ChatMessage = ChatSession['messages'][number];

interface MutationContext {
  previousData?: ChatSession;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showPreferences, setShowPreferences] = useState(false);

  const [selectedPreferences, setSelectedPreferences] = useState<
    PreferenceTag[]
  >([]);
  const [selectedExclude, setSelectedExclude] = useState<PreferenceTag[]>([]);

  const flashListRef = useRef<FlashListRef<ChatMessage> | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['chat-session', id],
    queryFn: () => chatApi.getSession(id, session!),
    enabled: !!id && !!session,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutation = useMutation<any, Error, string, MutationContext>({
    mutationFn: (message: string) =>
      chatApi.sendMessageToSession(
        id,
        message,
        session!,
        selectedPreferences,
        selectedExclude,
      ),

    onMutate: async (newMessage: string): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['chat-session', id] });

      const previousData = queryClient.getQueryData<ChatSession>([
        'chat-session',
        id,
      ]);

      const userMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        content: newMessage,
        role: 'user',
        createdAt: new Date().toISOString(),
        isRecipe: false,
        chatId: id,
      };

      const loadingMessage: ChatMessage = {
        id: 'temp-loading-id',
        content: 'Le chef prépare sa réponse...',
        role: 'model',
        isRecipe: false,
        createdAt: new Date().toISOString(),
        chatId: id,
      };

      queryClient.setQueryData<ChatSession>(['chat-session', id], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, userMessage, loadingMessage],
        };
      });

      setTimeout(
        () => flashListRef.current?.scrollToEnd({ animated: true }),
        50,
      );

      return { previousData };
    },

    onError: (err, newMessage, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['chat-session', id], context.previousData);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chat-session', id] });
      await queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
  const handleSend = (msg: string) => {
    if (!msg.trim() || mutation.isPending) return;
    Keyboard.dismiss();
    mutation.mutate(msg);
  };

  const addMealMutation = useMutation({
    mutationFn: (item: { content: string; id: string }) =>
      mealPlanApi.addMealToPlan(item.content, item.id, session!),
    onSuccess: () => {
      Toast.show({
        text1: "C'est prêt !",
        text2: 'La recette a été ajoutée à ton programme.',
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: 'Erreur',
        text2: "Impossible d'ajouter le repas.",
        type: 'error',
      });
    },
  });

  if (isAuthLoading || (isLoading && !!session)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  const handleTagPress = (pref: string) => {
    const isPref = selectedPreferences.includes(pref);
    const isExcl = selectedExclude.includes(pref);

    if (!isPref && !isExcl) {
      setSelectedPreferences((prev) => [...prev, pref]);
    } else if (isPref) {
      setSelectedPreferences((prev) => prev.filter((p) => p !== pref));
      setSelectedExclude((prev) => [...prev, pref]);
    } else {
      setSelectedExclude((prev) => prev.filter((e) => e !== pref));
    }
  };

  return (
    <>
      <View className="flex-1 bg-base-bg">
        <Drawer.Screen
          options={{
            headerTitle: data?.title || 'MonAmiChef',
          }}
        />
        <FlashList
          ref={flashListRef}
          showsVerticalScrollIndicator={false}
          data={data?.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            backgroundColor: '#fffdfb',
          }}
          renderItem={({ item }) => {
            const isModel = item.role === 'model';
            const formattedContent = item.content.replace(/\n/g, '\n\n');
            const messageDate = new Date(item.createdAt);

            if (item.id === 'temp-loading-id') {
              return (
                <Box className="w-full py-6 flex-row gap-3 items-center">
                  <ActivityIndicator size="small" color="#ff6900" />
                  <WaveText
                    text="Le chef prépare sa réponse..."
                    color="#FF9800"
                    fontSize={14}
                  />
                </Box>
              );
            }

            if (isModel) {
              return (
                <Box className="w-full py-6">
                  <Markdown mergeStyle={true} style={markdownStyles}>
                    {formattedContent}
                  </Markdown>
                  {item.isRecipe && (
                    <Pressable
                      onPress={() => {
                        if (!addMealMutation.isPending) {
                          addMealMutation.mutate({
                            content: item.content,
                            id: item.id,
                          });
                        }
                      }}
                      disabled={addMealMutation.isPending}
                      className={`mt-2 flex gap-2 flex-row w-full justify-center items-center rounded-xl border py-2.5 ${
                        addMealMutation.isPending
                          ? 'border-gray-300 bg-gray-100 opacity-70'
                          : 'border-green-300 bg-green-100 active:bg-green-200'
                      }`}
                    >
                      {addMealMutation.isPending ? (
                        <ActivityIndicator size="small" color="#008236" />
                      ) : (
                        <>
                          <ShoppingCart size={18} color="#008236" />
                          <Text className="font-inter-medium text-md text-green-700">
                            {t('chat.add_to_meal_plan')}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </Box>
              );
            }

            return (
              <Box className="bg-orange-500 self-end gap-1 px-4 py-3 rounded-2xl rounded-tr-none mb-2 max-w-[80%]">
                <Text className="text-white text-[15px] font-medium">
                  {item.content}
                </Text>
                <HStack className="self-end gap-1">
                  <Text className="text-orange-200 self-end text-xs font-medium">
                    {messageDate.toLocaleDateString('fr-FR')}
                  </Text>
                  <Text className="text-orange-200 self-end text-xs font-medium">
                    {messageDate.toLocaleTimeString('fr-FR', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </Text>
                </HStack>
              </Box>
            );
          }}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onContentSizeChange={(w, h) => {}}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <PreferencesQuickSelector
            selectedPreferences={selectedPreferences}
            selectedExclude={selectedExclude}
            onToggle={handleTagPress}
            onOpenSelector={() => setShowPreferences(true)}
          />
          <ChatInput
            onSend={(msg) => handleSend(msg)}
            isLoading={mutation.isPending}
          />
        </KeyboardAvoidingView>
      </View>
      <PreferenceActionSheet
        selectedPreferences={selectedPreferences}
        selectedExclude={selectedExclude}
        onToggle={handleTagPress}
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}
