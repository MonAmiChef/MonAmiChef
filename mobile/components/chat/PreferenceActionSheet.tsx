/* eslint-disable i18next/no-literal-string */
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
import {
  limitedCategories,
  preferencesTags,
  PreferenceTag,
} from '@/constants/PreferencesTags';
import { Pressable, ScrollView } from 'react-native';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';
import { Check, Send, X } from 'lucide-react-native';

export const PreferenceActionSheet = ({
  selectedPreferences,
  selectedExclude,
  isOpen,
  messageEmpty,
  onToggle,
  onSend,
  onClose,
}: {
  selectedPreferences: PreferenceTag[];
  selectedExclude: PreferenceTag[];
  messageEmpty: boolean;
  onToggle: (tag: PreferenceTag) => void;
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}) => {
  const { t } = useTranslation();
  const canSend = selectedPreferences.length >= 3 || !messageEmpty;

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
          {messageEmpty && (
            <Text className="font-inter-normal-italic text-slate-400">
              Select at least 3 preferences
            </Text>
          )}
          {limitedCategories.map((category, cIndex) => {
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
        <Box className="w-full">
          <Pressable
            onPress={() => {
              if (canSend) {
                onSend();
                onClose();
              }
            }}
            disabled={!canSend}
            className={`flex flex-row bg-orange-500 w-full px-3 py-3 gap-2 rounded-full justify-center align-middle items-center text-center ${
              canSend ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <Send size={18} color="white" />
            <Text className="text-white self-center text-lg font-inter-semibold">
              Send
            </Text>
          </Pressable>
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
};
