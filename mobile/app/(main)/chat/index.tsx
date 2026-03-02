/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { chatApi } from '@/services/chat.api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import { ChatInput } from '@/components/chat/ChatInput';
import { WaveText } from '@/components/chat/WaveText';
import { useTranslation } from 'react-i18next';
import { PreferenceTag } from '@/constants/PreferencesTags';
import { PreferencesQuickSelector } from '@/components/chat/PreferencesQuickSelector';
import { PreferenceActionSheet } from '@/components/chat/PreferenceActionSheet';
import Logo from '@/assets/images/monamichef_bg_less.png';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const default_prompts: Array<{
  text: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = [
  {
    text: 'quick',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  {
    text: 'prot',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    text: 'healthy',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    text: 'veggie',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  {
    text: 'spicy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
];

export default function NewChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const [kbKey, setKbKey] = useState(0);

  useEffect(() => {
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKbKey((k) => k + 1);
    });
    return () => hide.remove();
  }, []);

  const [selectedPreferences, setSelectedPreferences] = useState<
    PreferenceTag[]
  >([]);
  const [selectedExclude, setSelectedExclude] = useState<PreferenceTag[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

  const [optimisticMessage, setOptimisticMessage] = React.useState<
    string | null
  >(null);

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (!session?.access_token) throw new Error('Pas de token');

      return await chatApi.createSession(
        message,
        session,
        selectedPreferences,
        selectedExclude,
        i18n.language,
      );
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.setQueryData(['chat-session', data.id], data);
      setOptimisticMessage(null);
      router.replace(`/(main)/chat/${data.id}`);
    },
    onError: () => {
      setOptimisticMessage(null);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_send_message'),
        type: 'error',
      });
    },
  });

  const handleSend = (msg: string) => {
    if (mutation.isPending) return;

    if (msg === '') {
      msg = t('chat.suggest_recipe', {
        preferences: selectedPreferences.join(', '),
      });
      if (selectedExclude.length > 0) {
        msg +=
          ' ' +
          t('chat.suggest_recipe_exclusions', {
            exclusions: selectedExclude.join(', '),
          });
      }
    }

    Keyboard.dismiss();
    setOptimisticMessage(msg);
    mutation.mutate(msg);
  };

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
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          className="flex-1"
          accessible={false}
        >
          <View className="flex-1">
            {optimisticMessage ? (
              <View className="flex-1 justify-start p-6">
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
              <View className="flex flex-1 align-middle self-center justify-center items-center mb-8">
                <Image
                  source={Logo}
                  contentFit="contain"
                  style={{
                    display: 'flex',
                    width: 200,
                    height: 200,
                    opacity: 0.5,
                  }}
                />
                <Text className="font-inter-semibold mb-4">
                  {t('chat.default_prompts.title')}
                </Text>
                <ScrollView
                  style={{ flexGrow: 0 }}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 0,
                    gap: 16,
                    padding: 4,
                    marginLeft: 50,
                  }}
                  horizontal={true}
                >
                  {default_prompts.map((prompt, index) => {
                    return (
                      <Pressable
                        className={`border overflow-hidden ${prompt.borderColor} ${prompt.bgColor} rounded-xl`}
                        onPress={() => {
                          const msg = t(`chat.default_prompts.${prompt.text}`);

                          setMessage(msg.slice(2, msg.length));
                        }}
                        key={index}
                      >
                        <Text
                          className={`${prompt.textColor} text-lg font-inter-medium p-3`}
                        >
                          {t(`chat.default_prompts.${prompt.text}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          key={kbKey}
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 80}
        >
          <PreferencesQuickSelector
            selectedPreferences={selectedPreferences}
            selectedExclude={selectedExclude}
            onToggle={handleTagPress}
            onOpenSelector={() => setShowPreferences(true)}
          />
          <ChatInput
            value={message}
            tagsNumber={selectedPreferences.length}
            onChangeText={setMessage}
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
        isOpen={showPreferences}
        messageEmpty={message.length === 0}
        onSend={() => {
          handleSend(message);
          setMessage('');
        }}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}
