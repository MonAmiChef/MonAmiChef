import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Pill({
  item,
  isSelected,
  isDisabled,
  onToggle,
}: {
  item: PillItem;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (key: string) => void;
}) {
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
    onToggle(item.key);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className={`flex flex-row gap-1.5 items-center border py-1.5 px-3 rounded-full ${
        isSelected
          ? 'bg-orange-500 border-orange-500'
          : isDisabled
            ? 'bg-transparent border-slate-200 opacity-25'
            : 'bg-transparent border-slate-200'
      }`}
    >
      {isSelected && <Check strokeWidth={3} color="#fff" size={13} />}
      <Text
        className={`font-inter-medium text-sm ${
          isSelected ? 'text-white' : 'text-slate-600'
        }`}
      >
        {item.label}
      </Text>
    </AnimatedPressable>
  );
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
    <VStack className="gap-2.5">
      {title ? (
        <HStack className="justify-between items-center">
          <Text className="text-xs font-inter-bold text-slate-400 uppercase tracking-widest">
            {title}
          </Text>
          {limit !== undefined && (
            <Text
              className={`text-xs font-inter-medium ${
                limitReached
                  ? 'text-orange-500 font-inter-bold'
                  : 'text-slate-300'
              }`}
            >
              {selected.length} / {limit}
            </Text>
          )}
        </HStack>
      ) : null}
      {subLabel && (
        <Text className="text-xs text-slate-400 font-inter-medium uppercase tracking-widest -mt-0.5">
          {subLabel}
        </Text>
      )}
      <HStack className="flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.key);
          const isDisabled = limitReached && !isSelected;
          return (
            <Pill
              key={item.key}
              item={item}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onToggle={onToggle}
            />
          );
        })}
      </HStack>
    </VStack>
  );
};
