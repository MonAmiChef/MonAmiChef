import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = 'Écris ton message...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom || 20 }} className="px-4 py-3">
      <View className="flex-row items-center rounded-full px-4 py-2 border border-orange-200 bg-white">
        <TextInput
          className="flex-1 text-base py-2 text-slate-900"
          placeholderTextColor="#888"
          style={{ minHeight: 40 }}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable
          onPress={() => {
            onSend(text);
            setText('');
          }}
          disabled={!text.trim() || isLoading}
          className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${text.trim() ? 'bg-orange-500' : 'bg-slate-300'}`}
        >
          <Send size={18} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
