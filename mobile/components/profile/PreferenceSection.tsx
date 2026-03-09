import React from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

interface PillItem {
  key: string;
  label: string;
}

interface PreferenceSectionProps {
  title: string;
  items: PillItem[];
  selected: string[];
  onToggle: (key: string) => void;
  singleSelect?: boolean;
  subLabel?: string;
}

export const PreferenceSection = ({
  title,
  items,
  selected,
  onToggle,
  singleSelect = false,
  subLabel,
}: PreferenceSectionProps) => {
  return (
    <VStack className="gap-3">
      <Text className="text-sm font-bold font-inter-medium uppercase">
        {title}
      </Text>
      {subLabel && (
        <Text className="text-xs text-slate-500 font-inter-medium uppercase -mt-1">
          {subLabel}
        </Text>
      )}
      <HStack className="flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.key);
          return (
            <Pressable
              key={item.key}
              onPress={() => onToggle(item.key)}
              className={`px-3 py-2 rounded-lg border ${
                isSelected
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Text
                className={`font-inter-medium text-sm ${
                  isSelected ? 'text-orange-500' : 'text-slate-500'
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
