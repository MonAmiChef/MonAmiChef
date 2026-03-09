import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  limitedCategories,
  preferencesTags,
  PreferenceTag,
} from '@/constants/PreferencesTags';
import { Check, Plus, X } from 'lucide-react-native';
import { VStack } from '../ui/vstack';
import { Box } from '../ui/box';

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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isDisabled) return;
    scale.value = withSequence(
      withSpring(0.95, { damping: 50 }),
      withSpring(1, { damping: 50 }),
    );
    onToggle(tag);
  };

  const bgColor = isSelected
    ? 'bg-orange-500'
    : isExclude
      ? 'bg-red-500'
      : 'bg-orange-[#f000fb]';
  const borderColor = isSelected
    ? 'border-orange-500'
    : isExclude
      ? 'border-red-500'
      : 'border-slate-200';
  const textColor = isSelected || isExclude ? 'text-white' : 'text-slate-700';

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className={`flex flex-row gap-2 items-center border ${borderColor} py-1.5 px-3 rounded-full ${bgColor} ${isDisabled && !isSelected && !isExclude ? 'opacity-30' : ''}`}
    >
      {isSelected && <Check strokeWidth={3} color="#fff" size={14} />}
      {isExclude && <X strokeWidth={3} color="#fff" size={14} />}
      <Text className={`font-inter-medium text-sm ${textColor}`}>
        {t(`preferences.tags.${tag}`)}
      </Text>
    </AnimatedPressable>
  );
}

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
    <View className="flex flex-row gap-x-2 bg-[#fffdfb]">
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

      <Pressable
        onPress={onOpenSelector}
        className="mr-4 bg-orange-100 border border-orange-300 p-1 rounded-full active:bg-orange-200"
      >
        <Plus size={20} color="#ff6900" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};
