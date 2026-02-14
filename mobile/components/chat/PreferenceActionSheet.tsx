import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { preferencesTags, PreferenceTag } from '@/constants/PreferencesTags';
import { Pressable, ScrollView } from 'react-native';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';
import { Check, X } from 'lucide-react-native';

export const PreferenceActionSheet = ({
  selectedPreferences,
  selectedExclude,
  isOpen,
  onToggle,
  onClose,
}: {
  selectedPreferences: PreferenceTag[];
  selectedExclude: PreferenceTag[];
  onToggle: (tag: PreferenceTag) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const categories: { name: string; limit: number }[] = [
    { name: 'nutrition', limit: 3 },
    { name: 'cuisines', limit: 2 },
    { name: 'occasion', limit: 1 },
    { name: 'timing', limit: 1 },
    { name: 'meat', limit: 1 },
    { name: 'vegetables', limit: 4 },
  ];

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="max-h-[75%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ScrollView
          className="flex w-full p-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20 }}
        >
          {categories.map((category, cIndex) => {
            const categoryTags = preferencesTags[category.name] || [];

            const currentCount = [
              ...selectedPreferences,
              ...selectedExclude,
            ].filter((tag) => categoryTags.includes(tag)).length;

            const isLimitReached = currentCount >= category.limit;

            return (
              <VStack className="gap-y-4" key={cIndex}>
                <HStack className="justify-between">
                  <Text className="text-xl font-inter-semibold">
                    {category.name[0].toUpperCase() + category.name.slice(1)}
                  </Text>
                  <Text
                    className={`text-sm ${isLimitReached ? 'text-orange-600 font-inter-bold' : 'text-slate-400'}`}
                  >
                    {currentCount} / {category.limit}
                  </Text>
                </HStack>
                <Box className="flex flex-wrap flex-row max-w-[100%] gap-2">
                  {preferencesTags[category.name].map((tag, index) => {
                    const isSelected = selectedPreferences.includes(tag);
                    const isExclude = selectedExclude.includes(tag);
                    const isActive = isSelected || isExclude;

                    // Bloquer si limite atteinte ET que le tag n'est pas déjà actif
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
      </ActionsheetContent>
    </Actionsheet>
  );
};
