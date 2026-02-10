/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mealPlanApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { t } from 'i18next';
import { Ellipsis, ShoppingCart } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // (Écran - padding latéral - gap) / 2

export default function MealPlanPage() {
  const { session } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => mealPlanApi.getMealPlan(session!),
    enabled: !!session,
  });

  // const { data: groceries } = useQuery({
  //   queryKey: ['chat-sessions'],
  //   queryFn: async () => {
  //     const result = await mealPlanApi.getGroceriesRecipes(session!);
  //     console.log('res', result);
  //     return result;
  //   },
  //   enabled: !!session,
  //   staleTime: 1000 * 60 * 5,
  // });

  const removeFromPlanMutation = useMutation({
    mutationFn: (recipeId: string) =>
      mealPlanApi.removeFromMealPlan(session!, recipeId),
    onSuccess: () => {
      Toast.show({
        text1: 'Succès',
        text2: 'La recette à été retirée du plan',
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: 'Erreur',
        text2: 'Impossible de supprimer le repas.',
        type: 'error',
      });
    },
  });

  const addTogroceriesMutation = useMutation({
    mutationFn: (recipeId: string) =>
      mealPlanApi.addToGroceries(session!, recipeId),
    onSuccess: () => {
      Toast.show({
        text1: 'Succès!',
        text2: 'La recette a été ajoutée à la liste de courses.',
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: 'Erreur',
        text2: "Impossible d'ajouter le repas.",
        type: 'error',
      });
    },
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

          return (
            <Box
              style={{ width: COLUMN_WIDTH }}
              className="bg-white rounded-[24px] mb-4 shadow-sm overflow-hidden border border-slate-100"
            >
              <Box className="absolute flex flex-row self-end mr-2 mt-2 gap-2 z-10">
                <Pressable
                  onPress={() => {
                    if (!removeFromPlanMutation.isPending) {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      removeFromPlanMutation.mutate(item.recipeId);
                      void refetch();
                    }
                  }}
                  className="justify-center items-center h-6 w-6 bg-white rounded-full"
                >
                  <Ellipsis size={14} />
                </Pressable>
              </Box>
              {r.imagePath && (
                <Image
                  source={{ uri: r.imagePath }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
              )}

              <Box className="p-3 gap-4">
                <Text
                  numberOfLines={2}
                  className="font-inter-bold text-sm text-slate-900 h-10"
                >
                  {r.name}
                </Text>

                <Pressable
                  onPress={() => {
                    if (!addTogroceriesMutation.isPending) {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      addTogroceriesMutation.mutate(item.recipeId);
                    }
                  }}
                  className="flex flex-row gap-2 w-full bg-orange-50 border border-orange-100 justify-center items-center rounded-full py-2 mb-4 mt-2"
                >
                  <Text className="font-inter-medium text-orange-500">
                    Ajouter
                  </Text>
                  <ShoppingCart color="#ff6900" size={16} />
                </Pressable>
              </Box>
            </Box>
          );
        }}
      />
    </Box>
  );
}
