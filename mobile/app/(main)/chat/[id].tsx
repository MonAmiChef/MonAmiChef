/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/chat.api';
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
import { useEffect, useRef, useState } from 'react';
import { components } from '@/types/api';
import Drawer from 'expo-router/drawer';
import { WaveText } from '@/components/chat/WaveText';
import { HStack } from '@/components/ui/hstack';
import { PreferenceTag } from '@/constants/PreferencesTags';
import { PreferencesQuickSelector } from '@/components/chat/PreferencesQuickSelector';
import { PreferenceActionSheet } from '@/components/chat/PreferenceActionSheet';
import { t } from 'i18next';
import { ShoppingCart, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { mealPlanApi } from '@/services/meal-plan.api';
import { useTranslation } from 'react-i18next';
import { getLanguageName } from '@/utils/get-language-name';
import ConfirmRemoveModal from '@/components/meal-plan/ConfirmRemoveModal';

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
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

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

  const { data: mealPlan } = useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => mealPlanApi.getMealPlan(session!),
    enabled: !!session,
  });

  const { i18n } = useTranslation();

  const removeFromPlanMutation = useMutation({
    mutationFn: (recipeId: string) =>
      mealPlanApi.removeFromMealPlan(session!, recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      await queryClient.invalidateQueries({ queryKey: ['groceries-recipes'] });
      Toast.show({
        text1: t('toast.success'),
        text2: t('toast.removed_from_plan'),
        type: 'success',
      });
      setShowConfirmRemove(false);
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_removed_from_plan'),
        type: 'error',
      });
    },
  });

  const mutation = useMutation<any, Error, string, MutationContext>({
    mutationFn: (message: string) =>
      chatApi.sendMessageToSession(
        id,
        message,
        session!,
        selectedPreferences,
        selectedExclude,
        i18n.language,
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

  useEffect(() => {
    if (!data) return;

    if (data.messages?.length) {
      requestAnimationFrame(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      });
    }

    if (data.preferences) {
      setSelectedPreferences(data.preferences);
    }
    if (data.exclude) {
      setSelectedExclude(data.exclude);
    }
  }, [data]);

  const handleSend = (msg: string) => {
    if (mutation.isPending) return;

    if (msg === '') {
      if (i18n.language === 'en') {
        msg = `Please suggest a recipe or cooking advice based on the following preferences: ${selectedPreferences.join(', ')} ${selectedExclude.length > 0 ? `and following exclusions ${selectedExclude.join(',')}` : ''}`;
      } else if (i18n.language === 'fr') {
        msg = `Peux-tu me suggérer une recette ou des conseils de cuisine basés sur les préférences suivantes: ${selectedPreferences.join(', ')} ${selectedExclude.length > 0 ? `et en excluant les ingrédients suivants ${selectedExclude.join(',')}` : ''}`;
      }
    }

    Keyboard.dismiss();
    mutation.mutate(msg);
  };

  const addMealMutation = useMutation({
    mutationFn: (item: { content: string; id: string }) =>
      mealPlanApi.addMealToPlan(
        getLanguageName(i18n.language),
        item.content,
        item.id,
        session!,
      ),
    onSuccess: () => {
      Toast.show({
        text1: t('toast.success'),
        text2: t('toast.added_to_plan'),
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_added_to_plan'),
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
            const isAlreadyInPlan = mealPlan?.find(
              (meal: any) => meal.recipe.messageId === item.id,
            );

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
                  {item.isRecipe &&
                    (isAlreadyInPlan ? (
                      <Pressable
                        onPress={() => {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          setSelectedRecipeId(isAlreadyInPlan.recipeId);
                          setShowConfirmRemove(true);
                        }}
                        className="mt-2 flex gap-2 flex-row w-full justify-center items-center rounded-xl border border-green-300 bg-green-100 py-2.5"
                      >
                        <Check size={18} color="#008236" />
                        <Text className="font-inter-medium text-md text-green-700">
                          {t('chat.already_in_meal_plan')}
                        </Text>
                      </Pressable>
                    ) : (
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
                    ))}
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <PreferencesQuickSelector
            selectedPreferences={selectedPreferences}
            selectedExclude={selectedExclude}
            onToggle={handleTagPress}
            onOpenSelector={() => setShowPreferences(true)}
          />
          <ChatInput
            value={message}
            onChangeText={setMessage}
            tagsNumber={selectedPreferences.length}
            onSend={(msg) => {
              handleSend(msg);
              setMessage('');
            }}
            isLoading={mutation.isPending}
          />
        </KeyboardAvoidingView>
      </View>
      <PreferenceActionSheet
        selectedPreferences={selectedPreferences}
        selectedExclude={selectedExclude}
        onToggle={handleTagPress}
        messageEmpty={message.length === 0}
        onSend={() => {
          handleSend(message);
          setMessage('');
        }}
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
      <ConfirmRemoveModal
        bodyText={t('remove_modal.confirm_text_meal_plan')}
        showModal={showConfirmRemove}
        onClose={() => setShowConfirmRemove(false)}
        onConfirm={() => {
          removeFromPlanMutation.mutate(selectedRecipeId);
        }}
      />
    </>
  );
}
