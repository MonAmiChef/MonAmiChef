/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { mealPlanApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { t } from 'i18next';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // (Écran - padding latéral - gap) / 2

export default function MealPlanPage() {
  const { session } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => mealPlanApi.getMealPlan(session!),
    enabled: !!session,
  });

  if (isLoading)
    return <ActivityIndicator className="flex-1" color="#ff6900" />;

  return (
    <Box className="flex-1 bg-[#fffdfb] p-4 gap-8">
      <Text className="text-2xl text-black font-inter-medium">
        {t('meal_plan.subtitle')}
      </Text>
      <FlatList
        data={data}
        contentContainerStyle={{ flex: 1 }}
        keyExtractor={(item) => item.recipeId}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            colors={['#ff6900']}
          />
        }
        ListEmptyComponent={() => (
          <Box className="mt-20 items-center px-10">
            <Text className="text-slate-400 text-center font-inter-medium">
              Ton assiette est vide...
            </Text>
          </Box>
        )}
        renderItem={({ item }) => {
          const r = item.recipe;
          const hasHighProtein = (r.proteins ?? 0) >= 40;

          return (
            <Box
              style={{ width: COLUMN_WIDTH }}
              className="bg-white rounded-[24px] mb-4 shadow-sm overflow-hidden border border-slate-100"
            >
              {/* Image plus petite pour la grille */}
              {r.imagePath && (
                <Image
                  source={{ uri: r.imagePath }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
              )}

              <Box className="p-3">
                <Text
                  numberOfLines={2}
                  className="font-inter-bold text-sm text-slate-900 h-10"
                >
                  {r.name}
                </Text>

                {/* Badge Protéines compact */}
                <Box
                  className={`mt-2 self-start px-2 py-1 rounded-full ${
                    hasHighProtein ? 'bg-orange-500' : 'bg-orange-100'
                  }`}
                >
                  <Text
                    className={`font-inter-bold text-[10px] ${
                      hasHighProtein ? 'text-white' : 'text-orange-700'
                    }`}
                  >
                    {r.proteins}g Pro {hasHighProtein ? '🔥' : '💪'}
                  </Text>
                </Box>

                <Box className="flex-row justify-between items-center mt-2">
                  <Text className="text-slate-400 text-[10px] font-inter-medium">
                    {r.calories} kcal
                  </Text>
                  <Text className="text-slate-400 text-[10px] font-inter-medium">
                    {r.prepTimeMin} min
                  </Text>
                </Box>
              </Box>
            </Box>
          );
        }}
      />
    </Box>
  );
}
