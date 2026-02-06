import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { useTranslation } from 'react-i18next';
import {
  PreferenceTag,
  unifiedPreferencesTags,
} from '@/constants/PreferencesTags';
import { Plus } from 'lucide-react-native';

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
        {unifiedPreferencesTags.map((pref) => {
          const isPreference = selectedPreferences.includes(pref);
          const isExclude = selectedExclude.includes(pref);

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
              key={pref}
              onPress={() => onToggle(pref)}
              className={`flex border ${borderColor} py-1.5 px-3 rounded-full ${bgColor}`}
            >
              <Text className={`font-inter-medium text-sm ${textColor}`}>
                {t(`preferences.tags.${pref}`)}
              </Text>
            </Pressable>
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
