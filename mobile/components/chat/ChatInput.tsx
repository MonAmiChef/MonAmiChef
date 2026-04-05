import React from 'react';
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
  const canSend = !isLoading && (value.trim().length > 0 || tagsNumber >= 3);

  return (
    <View className="px-3 pb-3 pt-1">
      <View className="flex-row items-end px-1 py-1">
        <TextInput
          className="flex-1 text-[16px] font-inter pl-3 pr-2 py-2.5 text-slate-900"
          placeholderTextColor="#94a3b8"
          style={{ minHeight: 40, maxHeight: 120 }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        {canSend && (
          <Pressable
            onPress={() => {
              if (canSend) {
                onSend(value);
              }
            }}
            className="w-10 h-10 rounded-full items-center justify-center bg-orange-500 shadow-sm shadow-orange-300"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Send size={18} color="white" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
