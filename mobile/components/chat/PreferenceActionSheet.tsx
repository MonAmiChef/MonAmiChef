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
  const categories = [
    'nutrition',
    'cuisines',
    'occasion',
    'timing',
    'meat',
    'vegetables',
  ];

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="max-h-[65%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ScrollView
          className="flex w-full p-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20 }}
        >
          {categories.map((category, cIndex) => {
            return (
              <VStack className="gap-y-4" key={cIndex}>
                <Text className="text-xl font-inter-semibold">
                  {category[0].toUpperCase() + category.slice(1)}
                </Text>
                <Box className="flex flex-wrap flex-row max-w-[100%] gap-2">
                  {preferencesTags[category].map((tag, index) => {
                    const isPreference = selectedPreferences.includes(tag);
                    const isExclude = selectedExclude.includes(tag);

                    let bgColor = 'bg-transparent';
                    let textColor = 'text-slate-700';
                    let borderColor = 'border-slate-200';

                    if (isPreference) {
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
                        onPress={() => onToggle(tag)}
                        className={`flex border ${borderColor} py-1.5 px-3 rounded-full ${bgColor}`}
                      >
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
