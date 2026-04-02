import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Plus, X, User, LucideIcon, Croissant, Sun, Moon } from 'lucide-react-native';
import { MealPlanEntry, MealType } from '@/services/meal-plan.api';
import { capitalizeFull } from '@/utils/text';
import { useTranslation } from 'react-i18next';

interface MealSlotProps {
  mealType: MealType;
  entry: MealPlanEntry | undefined;
  onAddPress: () => void;
  onRemovePress: (id: string) => void;
  onServingChange: (id: string, delta: number) => void;
  isReadOnly?: boolean;
}

const mealTypeIcons: Record<MealType, LucideIcon> = {
  BREAKFAST: Croissant,
  LUNCH: Sun,
  DINNER: Moon,
};

const mealTypeColors: Record<MealType, { bg: string; border: string; text: string; accent: string }> = {
  BREAKFAST: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', accent: '#f59e0b' },
  LUNCH: { bg: '#fed7aa', border: '#fdba74', text: '#9a3412', accent: '#f97316' },
  DINNER: { bg: '#e0e7ff', border: '#a5b4fc', text: '#3730a3', accent: '#6366f1' },
};

export default function MealSlot({
  mealType,
  entry,
  onAddPress,
  onRemovePress,
  onServingChange,
  isReadOnly = false,
}: MealSlotProps) {
  const { t } = useTranslation();
  const colors = mealTypeColors[mealType];
  const Icon: LucideIcon = mealTypeIcons[mealType];

  const mealLabel = t(`meal_plan.${mealType.toLowerCase()}`);

  if (!entry) {
    return (
      <Pressable
        onPress={isReadOnly ? undefined : onAddPress}
        style={{
          borderWidth: 2,
          borderColor: isReadOnly ? '#f1f5f9' : '#e2e8f0',
          borderStyle: 'dashed',
          borderRadius: 20,
          paddingVertical: 24,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
        }}
        className="active:bg-slate-100"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color="#666" />
          <View>
            <Text className="font-inter-semibold text-slate-700 text-base">
              {mealLabel}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {t('meal_plan.empty_slot')}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isReadOnly ? '#f8fafc' : '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!isReadOnly && <Plus size={20} color="#94a3b8" />}
        </View>
      </Pressable>
    );
  }

  const r = entry.recipe;
  const accentColor = r.isVegan
    ? '#10b981'
    : r.isVegetarian
      ? '#4ade80'
      : colors.accent;

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      {/* Header bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon color={colors.text} />
          <Text
            style={{ color: colors.text }}
            className="font-inter-semibold text-sm"
          >
            {mealLabel}
          </Text>
        </View>
        {!isReadOnly && (
          <Pressable
            onPress={() => onRemovePress(entry.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="active:bg-red-100"
          >
            <X size={16} color="#ef4444" />
          </Pressable>
        )}
      </View>

      {/* Recipe content */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Left accent bar */}
          <View
            style={{
              width: 3,
              borderRadius: 2,
              backgroundColor: accentColor,
              marginRight: 12,
              alignSelf: 'stretch',
            }}
          />

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              className="font-inter-semibold text-slate-900 text-base"
            >
              {capitalizeFull(r.name)}
            </Text>

            {/* Macros row */}
            <View
              style={{
                flexDirection: 'row',
                gap: 16,
                marginTop: 8,
              }}
            >
              {[
                { value: r.calories, label: 'kcal' },
                { value: `${r.proteins}g`, label: 'prot' },
                { value: `${r.carbs}g`, label: 'carbs' },
                { value: `${r.fat}g`, label: 'fat' },
              ].map((macro, idx) => (
                <View key={idx} style={{ alignItems: 'center' }}>
                  <Text className="font-inter-semibold text-xs text-slate-700">
                    {macro.value}
                  </Text>
                  <Text className="text-[9px] text-slate-400 uppercase tracking-wide">
                    {macro.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Servings row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: 20,
                  paddingHorizontal: 2,
                }}
              >
                <Pressable
                  onPress={() => onServingChange(entry.id, -1)}
                  disabled={isReadOnly}
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                  }}
                  className={isReadOnly ? '' : 'active:bg-slate-200'}
                >
                  {!isReadOnly && (
                    <Text className="text-slate-500 text-base font-inter-medium">
                      −
                    </Text>
                  )}
                </Pressable>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    width: isReadOnly ? 36 : 44,
                    justifyContent: 'center',
                  }}
                >
                  <User size={10} color="#64748b" />
                  <Text className="text-slate-700 font-inter-semibold text-xs">
                    {entry.servings}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onServingChange(entry.id, 1)}
                  disabled={isReadOnly}
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                  }}
                  className={isReadOnly ? '' : 'active:bg-slate-200'}
                >
                  {!isReadOnly && (
                    <Text className="text-slate-500 text-base font-inter-medium">
                      +
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
