import React, { useEffect } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  value: string;
  tagsNumber: number;
  onChangeText: (text: string) => void;
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  tagsNumber,
  onChangeText,
  onSend,
  isLoading,
  placeholder = 'Écris ton message...',
}: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const canSend = !isLoading && (value.trim().length > 0 || tagsNumber >= 3);

  return (
    <View
      style={{ paddingBottom: insets.bottom || 20, backgroundColor: '#fffdfb' }}
      className="px-4 py-3"
    >
      <View className="flex-row items-center rounded-full px-4 py-2 border border-orange-200 bg-white">
        <TextInput
          className="flex-1 text-base py-2 text-slate-900"
          placeholderTextColor="#888"
          style={{ minHeight: 40 }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <Pressable
          onPress={() => {
            if (canSend) {
              onSend(value);
            }
          }}
          disabled={!canSend}
          className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
            canSend ? 'bg-orange-500' : 'bg-slate-300'
          }`}
        >
          <Send size={18} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
