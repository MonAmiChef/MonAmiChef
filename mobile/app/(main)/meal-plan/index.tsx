/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mealPlanApi,
  MealType,
  MealPlanEntry,
} from '@/services/meal-plan.api';
import MealSlot from '@/components/meal-plan/MealSlot';
import RecipePickerModal from '@/components/meal-plan/RecipePickerModal';
import DayPicker from '@/components/meal-plan/DayPicker';
import { CalendarDays } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function formatDisplayDate(date: Date, todayLabel: string): string {
  if (isToday(date)) return todayLabel;
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function MealPlanSkeleton() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          className="w-full h-32 rounded-[20px] bg-slate-100"
        />
      ))}
    </View>
  );
}

export default function MealPlanScreen() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = formatDate(currentDate);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMealType, setPickerMealType] = useState<MealType>('BREAKFAST');

  const {
    data: entries,
    isLoading,
    isRefetching,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['meal-plan', dateStr],
    queryFn: () => mealPlanApi.getMealPlan(session!, dateStr),
    enabled: !!session,
  });


  const createMutation = useMutation({
    mutationFn: (params: {
      recipeId: string;
      mealType: MealType;
      servings: number;
    }) =>
      mealPlanApi.createEntries(session!, [
        {
          recipeId: params.recipeId,
          date: dateStr,
          mealType: params.mealType,
          servings: params.servings,
        },
      ]),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meal-plan', dateStr] });
      Toast.show({
        text1: t('toast.success'),
        text2: t('meal_plan.recipe_added'),
        type: 'success',
      });
    },
    onError: () => {
      Toast.show({
        text1: t('toast.error'),
        text2: t('meal_plan.error_adding'),
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mealPlanApi.deleteEntry(session!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meal-plan', dateStr] });
      Toast.show({
        text1: t('toast.success'),
        text2: t('meal_plan.recipe_removed'),
        type: 'success',
      });
    },
    onError: () => {
      Toast.show({
        text1: t('toast.error'),
        text2: t('meal_plan.error_removing'),
        type: 'error',
      });
    },
  });

  const updateServingsMutation = useMutation({
    mutationFn: ({ id, servings }: { id: string; servings: number }) =>
      mealPlanApi.updateServings(session!, id, servings),
    onMutate: async ({ id, servings }) => {
      await queryClient.cancelQueries({ queryKey: ['meal-plan', dateStr] });
      const previous = queryClient.getQueryData(['meal-plan', dateStr]);
      queryClient.setQueryData(
        ['meal-plan', dateStr],
        (old: MealPlanEntry[] | undefined) =>
          old?.map((e) => (e.id === id ? { ...e, servings } : e)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['meal-plan', dateStr], context?.previous);
    },
  });

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = currentDate < today;


  const getEntryForMealType = (mealType: MealType): MealPlanEntry | undefined => {
    return entries?.find((e) => e.mealType === mealType);
  };

  const handleAddPress = (mealType: MealType) => {
    setPickerMealType(mealType);
    setPickerOpen(true);
  };

  const handleRecipeSelect = (recipeId: string, servings: number) => {
    createMutation.mutate({
      recipeId,
      mealType: pickerMealType,
      servings,
    });
  };

  const handleServingChange = (id: string, delta: number) => {
    const entry = entries?.find((e) => e.id === id);
    if (!entry) return;
    const next = Math.max(1, entry.servings + delta);
    updateServingsMutation.mutate({ id, servings: next });
  };

  const displayDate = formatDisplayDate(currentDate, t('meal_plan.today'));

  // Calculate total macros for the day
  const totalMacros = entries?.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.recipe.calories ?? 0) * entry.servings,
      proteins: acc.proteins + (entry.recipe.proteins ?? 0) * entry.servings,
      carbs: acc.carbs + (entry.recipe.carbs ?? 0) * entry.servings,
      fat: acc.fat + (entry.recipe.fat ?? 0) * entry.servings,
    }),
    { calories: 0, proteins: 0, carbs: 0, fat: 0 },
  );

  return (
    <Box className="flex-1 bg-[#fffdfb]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Day Picker bubbles */}
        <DayPicker
          selectedDate={currentDate}
          onDateChange={handleDateChange}
        />

        {/* Selected Date Label */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 14,
              backgroundColor: '#f8fafc',
              borderRadius: 16,
              alignSelf: 'flex-start',
            }}
          >
            <CalendarDays size={16} color="#64748b" />
            <Text className="font-inter-semibold text-sm text-slate-700">
              {displayDate.charAt(0).toUpperCase() + displayDate.slice(1)}
            </Text>
          </View>
        </View>

        {/* Daily Totals */}
        {entries && entries.length > 0 && totalMacros && (
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              backgroundColor: '#f8fafc',
              paddingVertical: 14,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            {[
              {
                value: Math.round(totalMacros.calories),
                label: 'kcal',
                color: '#f97316',
              },
              {
                value: `${Math.round(totalMacros.proteins)}g`,
                label: 'prot',
                color: '#3b82f6',
              },
              {
                value: `${Math.round(totalMacros.carbs)}g`,
                label: 'carbs',
                color: '#10b981',
              },
              {
                value: `${Math.round(totalMacros.fat)}g`,
                label: 'fat',
                color: '#eab308',
              },
            ].map((macro, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                <Text
                  style={{ color: macro.color }}
                  className="font-inter-bold text-base"
                >
                  {macro.value}
                </Text>
                <Text className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                  {macro.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Meal Slots */}
        {isLoading ? (
          <MealPlanSkeleton />
        ) : (
          <View
            style={{
              paddingHorizontal: 20,
              gap: 12,
              opacity: isFetching ? 0.6 : 1,
            }}
          >
            {MEAL_TYPES.map((mealType) => (
              <MealSlot
                key={mealType}
                mealType={mealType}
                entry={getEntryForMealType(mealType)}
                onAddPress={() => handleAddPress(mealType)}
                onRemovePress={(id) => deleteMutation.mutate(id)}
                onServingChange={handleServingChange}
                isReadOnly={isPastDate}
              />
            ))}
          </View>
        )}
      </ScrollView>


      {/* Recipe Picker Modal */}
      <RecipePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        mealType={pickerMealType}
        onSelect={handleRecipeSelect}
      />
    </Box>
  );
}
