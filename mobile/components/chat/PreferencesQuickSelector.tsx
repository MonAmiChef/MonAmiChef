import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  LinearTransition,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  limitedCategories,
  preferencesTags,
  PreferenceTag,
} from '@/constants/PreferencesTags';
import { Check, Sliders, X } from 'lucide-react-native';
import { VStack } from '../ui/vstack';
import { Box } from '../ui/box';


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
      : 'bg-slate-100/80';
  const borderColor = isSelected
    ? 'border-orange-600'
    : isExclude
      ? 'border-red-600'
      : 'border-slate-200';
  const textColor = isSelected || isExclude ? 'text-white' : 'text-slate-600';

  return (
    <Animated.View layout={LinearTransition.duration(200)}>
      <Pressable
        onPress={handlePress}
        className={`flex flex-row gap-1.5 items-center border ${borderColor} py-1.5 px-3 rounded-full ${bgColor} ${
          isDisabled && !isSelected && !isExclude ? 'opacity-30' : ''
        }`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {isSelected && <Check strokeWidth={3} color="#fff" size={13} />}
        {isExclude && <X strokeWidth={3} color="#fff" size={12} />}
        <Text className={`font-krub-medium text-[12px] ${textColor}`}>
          {t(`preferences.tags.${tag}`)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface PreferencesQuickSelectorProps {
  selectedPreferences: PreferenceTag[];
  selectedExclude: PreferenceTag[];
  onToggle: (tag: PreferenceTag) => void;
  onOpenSelector: () => void;
}

import { LinearGradient } from 'expo-linear-gradient';

export const PreferencesQuickSelector = ({
  selectedPreferences,
  selectedExclude,
  onToggle,
  onOpenSelector,
}: PreferencesQuickSelectorProps) => {
  return (
    <View className="flex flex-row items-center pt-3 pb-1">
      <View className="flex-1 relative">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 12,
            paddingRight: 32, // More padding to allow fading over tags
            gap: 6,
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
              <View className="flex-row gap-2" key={cIndex}>
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
              </View>
            );
          })}
        </ScrollView>

        {/* Right Gradient Fade */}
        <LinearGradient
          colors={['transparent', 'rgba(255, 253, 251, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            pointerEvents: 'none',
          }}
        />
      </View>

      <Pressable
        onPress={onOpenSelector}
        className="mr-3 ml-1 bg-slate-50/50 w-8 h-8 items-center justify-center border border-slate-200/50 rounded-full active:bg-slate-100"
      >
        <Sliders size={15} color="#64748b" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};
