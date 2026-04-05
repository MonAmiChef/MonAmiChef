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
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';
import { Check, Send, Sliders, X } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PreferencePill({
  tag,
  isSelected,
  isExclude,
  isDisabled,
  onToggle,
}: {
  tag: PreferenceTag;
  isSelected: boolean;
  isExclude: boolean;
  isDisabled: boolean;
  onToggle: (tag: PreferenceTag) => void;
}) {
  const { t } = useTranslation();

  const handlePress = () => {
    if (isDisabled) return;
    onToggle(tag);
  };

  const bgColor = isSelected
    ? 'bg-orange-500'
    : isExclude
      ? 'bg-red-500'
      : 'bg-slate-50';
  const borderColor = isSelected
    ? 'border-orange-600/50'
    : isExclude
      ? 'border-red-600/50'
      : 'border-slate-100';
  const textColor = isSelected || isExclude ? 'text-white' : 'text-slate-600';

  return (
    <Animated.View layout={LinearTransition.duration(200)}>
      <Pressable
        onPress={handlePress}
        className={`flex flex-row gap-2 items-center border ${borderColor} py-1.5 px-4 rounded-full ${bgColor} ${
          isDisabled && !isSelected && !isExclude ? 'opacity-30' : ''
        }`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {isSelected && <Check strokeWidth={3} color="#fff" size={14} />}
        {isExclude && <X strokeWidth={3} color="#fff" size={12} />}
        <Text className={`font-krub-medium text-[13px] ${textColor}`}>
          {t(`preferences.tags.${tag}`)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

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
            <View className="bg-orange-50/50 p-4 rounded-2xl mb-2 flex-row gap-3 items-center">
              <Sliders size={18} color="#f97316" />
              <Text className="font-krub-medium italic text-slate-500 flex-1 text-sm">
                {t('preferences.info')}
              </Text>
            </View>
          )}
          {limitedCategories.map((category, cIndex) => {
            const categoryTags = preferencesTags[category.name] || [];

            const currentCount = [
              ...selectedPreferences,
              ...selectedExclude,
            ].filter((tag) => categoryTags.includes(tag)).length;

            const isLimitReached = currentCount >= category.limit;

            return (
              <VStack className="gap-y-4 mb-6" key={cIndex}>
                <HStack className="justify-between items-end border-b border-slate-50 pb-2">
                  <Text className="text-xl font-krub-semibold text-slate-800">
                    {t(`preferences.categories.${category.name}`)}
                  </Text>
                  <View className={`px-2 py-0.5 rounded-md ${isLimitReached ? 'bg-orange-100' : 'bg-slate-50'}`}>
                    <Text
                      className={`text-xs font-krub-bold ${isLimitReached ? 'text-orange-600' : 'text-slate-400'}`}
                    >
                      {currentCount} / {category.limit}
                    </Text>
                  </View>
                </HStack>
                <Box className="flex flex-wrap flex-row max-w-[100%] gap-3">
                  {preferencesTags[category.name].map((tag, index) => {
                    const isSelected = selectedPreferences.includes(tag);
                    const isExclude = selectedExclude.includes(tag);
                    const isActive = isSelected || isExclude;
                    const isDisabled = isLimitReached && !isActive;
                    return (
                      <PreferencePill
                        key={index}
                        tag={tag}
                        isSelected={isSelected}
                        isExclude={isExclude}
                        isDisabled={isDisabled}
                        onToggle={onToggle}
                      />
                    );
                   })}
                </Box>
              </VStack>
            );
          })}
        </ScrollView>
        <Box className="w-full px-4 pb-4">
          <Pressable
            onPress={() => {
              if (canSend) {
                onSend();
                onClose();
              }
            }}
            disabled={!canSend}
            className={`flex flex-row bg-orange-500 w-full px-3 py-4 gap-3 rounded-2xl justify-center items-center ${
              canSend ? 'opacity-100' : 'opacity-40'
            }`}
            style={({ pressed }) => ({
              transform: [{ scale: pressed && canSend ? 0.98 : 1 }],
            })}
          >
            <Text className="text-white text-lg font-krub-bold">
              {t('preferences.send')}
            </Text>
            <Send size={20} color="white" />
          </Pressable>
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
};
