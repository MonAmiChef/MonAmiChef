import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { chatApi } from '@/services/api'; // Ton service NestJS
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function NewChat() {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
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

  const handleSend = () => {
    console.log('click!');
    if (!text.trim() || mutation.isPending) return;
    mutation.mutate(text);
  };

  return (
    // On utilise flex-1 ici pour que l'écran occupe tout l'espace
    <View className="flex-1 bg-white">
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

      {/* 2. KeyboardAvoidingView enveloppe UNIQUEMENT la partie basse */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // keyboardVerticalOffset doit correspondre à la hauteur du header (env. 60-90)
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View
          style={{ paddingBottom: insets.bottom || 20 }}
          className="px-4 py-3 bg-white border-t border-slate-100"
        >
          <View className="flex-row items-center bg-slate-100 rounded-3xl px-4 py-2 border border-slate-200">
            <TextInput
              ref={inputRef}
              className="flex-1 text-base py-2 text-slate-900"
              style={{ minHeight: 40 }}
              placeholder="Écris ton message..."
              placeholderTextColor="#94a3b8"
              value={text}
              onChangeText={setText}
              multiline
            />

            <Pressable
              onPress={handleSend}
              disabled={!text.trim()}
              className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
                text.trim() ? 'bg-black' : 'bg-slate-300'
              }`}
            >
              <Send size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
