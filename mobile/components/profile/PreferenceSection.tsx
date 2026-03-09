import React from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';

interface PillItem {
  key: string;
  label: string;
}

interface PreferenceSectionProps {
  title: string;
  items: PillItem[];
  selected: string[];
  onToggle: (key: string) => void;
  subLabel?: string;
  limit?: number;
}

export const PreferenceSection = ({
  title,
  items,
  selected,
  onToggle,
  subLabel,
  limit,
}: PreferenceSectionProps) => {
  const limitReached = limit !== undefined && selected.length >= limit;

  return (
    <VStack className="gap-3">
      {title ? (
        <HStack className="justify-between items-center">
          <Text className="text-sm font-bold font-inter-medium uppercase">
            {title}
          </Text>
          {limit !== undefined && (
            <Text
              className={`text-xs font-inter-medium ${limitReached ? 'text-orange-500 font-inter-bold' : 'text-slate-400'}`}
            >
              {selected.length} / {limit}
            </Text>
          )}
        </HStack>
      ) : null}
      {subLabel && (
        <Text className="text-xs text-slate-500 font-inter-medium uppercase -mt-1">
          {subLabel}
        </Text>
      )}
      <HStack className="flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.key);
          const isDisabled = limitReached && !isSelected;
          return (
            <Pressable
              key={item.key}
              onPress={() => !isDisabled && onToggle(item.key)}
              className={`flex flex-row gap-2 items-center border py-1.5 px-3 rounded-full ${
                isSelected
                  ? 'bg-orange-500 border-orange-500'
                  : isDisabled
                    ? 'bg-transparent border-slate-200 opacity-30'
                    : 'bg-transparent border-slate-200'
              }`}
            >
              {isSelected && <Check strokeWidth={3} color="#fff" size={14} />}
              <Text
                className={`font-inter-medium text-sm ${
                  isSelected ? 'text-white' : 'text-slate-700'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
};
