import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { useTranslation } from 'react-i18next';
import {
  limitedCategories,
  preferencesTags,
  PreferenceTag,
} from '@/constants/PreferencesTags';
import { Check, Plus, X } from 'lucide-react-native';
import { VStack } from '../ui/vstack';
import { Box } from '../ui/box';

interface PreferencesQuickSelectorProps {
  selectedPreferences: PreferenceTag[];
  selectedExclude: PreferenceTag[];
  onToggle: (tag: PreferenceTag) => void;
  onOpenSelector: () => void;
}

export const PreferencesQuickSelector = ({
  selectedPreferences,
  selectedExclude,
  onToggle,
  onOpenSelector,
}: PreferencesQuickSelectorProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex flex-row gap-x-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          alignItems: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {limitedCategories.map((category, cIndex) => {
          const categoryTags = preferencesTags[category.name] || [];

          const currentCount = [
            ...selectedPreferences,
            ...selectedExclude,
          ].filter((tag) => categoryTags.includes(tag)).length;

          const isLimitReached = currentCount >= category.limit;

          return (
            <VStack className="gap-y-4" key={cIndex}>
              <Box className="flex flex-row gap-2">
                {preferencesTags[category.name].map((tag, index) => {
                  const isSelected = selectedPreferences.includes(tag);
                  const isExclude = selectedExclude.includes(tag);
                  const isActive = isSelected || isExclude;

                  const isDisabled = isLimitReached && !isActive;
                  let bgColor = 'bg-transparent';
                  let textColor = 'text-slate-700';
                  let borderColor = 'border-slate-200';

                  if (isSelected) {
                    bgColor = 'bg-orange-500';
                    textColor = 'text-white';
                    borderColor = 'border-orange-500';
                  } else if (isExclude) {
                    bgColor = 'bg-red-500';
                    textColor = 'text-white';
                    borderColor = 'border-red-500';
                  }

                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        if (!isDisabled || isSelected) {
                          onToggle(tag);
                        }
                      }}
                      className={`flex flex-row gap-2 items-center border ${borderColor} py-1.5 px-3 rounded-full ${bgColor}`}
                    >
                      {isSelected && (
                        <Check strokeWidth={3} color={'#fff'} size={14} />
                      )}
                      {isExclude && (
                        <X strokeWidth={3} color={'#fff'} size={14} />
                      )}
                      <Text
                        className={`font-inter-medium text-sm ${textColor}`}
                      >
                        {t(`preferences.tags.${tag}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </Box>
            </VStack>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onOpenSelector}
        className="mr-4 bg-orange-100 p-2 rounded-full active:bg-orange-200"
      >
        <Plus size={20} color="#ff6900" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};
