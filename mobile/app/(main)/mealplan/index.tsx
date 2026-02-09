/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { mealPlanApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { components } from '@/types/api';

// Note : Si ton Swagger n'a pas encore le GET, on définit un type local temporaire
// qui correspond à ce que ton backend renvoie (id + recipe)
interface MealPlanItem {
  id: string;
  recipe: components['schemas']['ParseGroceriesResponseDto_Output'];
}

export default function MealPlanPage() {
  const { session } = useAuth();

  const {
    data: meals,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => mealPlanApi.getMealPlan(session!),
    enabled: !!session,
  });

  if (isLoading)
    return <ActivityIndicator className="flex-1" color="#ff6900" />;

  return (
    <Box className="flex-1 bg-[#fffdfb] p-4">
      <Text className="text-2xl font-inter-bold mb-4">Mon Programme</Text>

      <FlatList
        data={meals}
        keyExtractor={(item: MealPlanItem) => item.id.toString()}
        // Ajout du refresh pour voir la recette apparaître après l'IA
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
          <Box className="mt-10 items-center px-10">
            <Text className="text-slate-500 text-center">
              Aucune recette pour aujourd'hui.
            </Text>
            <Text className="text-orange-500 font-inter-medium mt-2 text-center">
              Dis à l'assistant ce que tu as dans ton frigo ! 🥦
            </Text>
          </Box>
        )}
        renderItem={({ item }) => {
          // On utilise les vrais champs de ton OpenAPI : recipe_name et macros_per_servings
          const { recipe_name, macros_per_servings } = item.recipe;

          return (
            <Box className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-50">
              <Text className="font-inter-bold text-xl text-slate-900">
                {recipe_name || 'Recette sans nom'}
              </Text>

              <Box className="flex-row items-center mt-3 gap-2">
                <Box className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-700 font-inter-bold text-sm">
                    {macros_per_servings?.proteins || 0}g Protéines 💪
                  </Text>
                </Box>

                <Box className="bg-slate-100 px-3 py-1 rounded-full">
                  <Text className="text-slate-600 font-inter-medium text-sm">
                    {macros_per_servings?.calories || 0} kcal
                  </Text>
                </Box>
              </Box>

              {/* Petit rappel de ton objectif perso */}
              {macros_per_servings?.proteins >= 40 && (
                <Text className="text-green-600 text-xs font-inter-medium mt-2">
                  Objectif shaker atteint ! ✨
                </Text>
              )}
            </Box>
          );
        }}
      />
    </Box>
  );
}
