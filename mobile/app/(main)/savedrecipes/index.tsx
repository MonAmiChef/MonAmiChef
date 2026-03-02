/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
  View,
} from 'react-native';
import { t } from 'i18next';
import { Check, Ellipsis, Notebook, ShoppingCart } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import { capitalizeFull } from '../groceries';
import { useRouter } from 'expo-router';
import SavedRecipesOptionsSheet from '@/components/saved-recipes/SavedRecipesOptionsSheet';
import ConfirmRemoveModal from '@/components/saved-recipes/ConfirmRemoveModal';

export default function SavedRecipesPage() {
  const { session } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['saved-recipes'],
    queryFn: () => savedRecipesApi.getSavedRecipes(session!),
    enabled: !!session,
  });
  const [showSheet, setShowSheet] = useState(false);
  const router = useRouter();
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const queryClient = useQueryClient();

  const { data: recipesInGroceries } = useQuery({
    queryKey: ['groceries-recipes'],
    queryFn: () => savedRecipesApi.getGroceriesRecipes(session!),
    enabled: !!session,
  });

  const isAlreadyInGroceries = (recipeId: string) => {
    return recipesInGroceries?.some((item: any) => item.recipeId === recipeId);
  };

  const removeFromSavedMutation = useMutation({
    mutationFn: (recipeId: string) =>
      savedRecipesApi.removeFromSavedRecipes(session!, recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
      await queryClient.invalidateQueries({ queryKey: ['groceries-recipes'] });
      Toast.show({
        text1: t('toast.success'),
        text2: t('toast.removed_from_plan'),
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_removed_from_plan'),
        type: 'error',
      });
    },
  });

  const addTogroceriesMutation = useMutation({
    mutationFn: ({
      recipeId,
      newState,
    }: {
      recipeId: string;
      newState: boolean;
    }) => savedRecipesApi.addToGroceries(session!, recipeId, newState),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['groceries-recipes'] });
      Toast.show({
        text1: t('toast.success'),
        text2: `${t('toast.recipe_was')} ${variables.newState === true ? t('toast.added') : t('toast.removed')}`,
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_add_grocery'),
        type: 'error',
      });
    },
  });

  const handleOpenMenu = (id: string, name: string) => {
    setSelectedRecipe({ id, name });
    setShowSheet(true);
  };

  const handleDelete = () => {
    if (selectedRecipe) {
      removeFromSavedMutation.mutate(selectedRecipe.id);
      setShowSheet(false);
    }
  };

  if (isLoading)
    return <ActivityIndicator className="flex-1" color="#ff6900" />;

  return (
    <Box className="flex-1 bg-[#fffdfb] p-4 gap-8">
      {data?.length > 0 && (
        <Text className="text-2xl px-4 text-black font-inter-medium">
          {t('saved_recipes.subtitle')}
        </Text>
      )}
      <FlatList
        data={data}
        contentContainerStyle={{ flex: 1 }}
        keyExtractor={(item) => item.recipeId}
        numColumns={1}
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
          <Box className="flex h-[75%] bg-[#fffdfb] px-2 justify-center items-center gap-6">
            <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center">
              <Notebook size={48} color="#f97316" strokeWidth={1.5} />
            </View>

            <Text className="font-inter-bold text-2xl text-slate-900 text-center">
              {t('saved_recipes.empty')}
            </Text>

            <Pressable
              onPress={() => router.push('/(main)/chat')}
              className="bg-orange-500 px-8 py-4 rounded-2xl active:bg-orange-600 shadow-sm shadow-orange-200"
            >
              <Text className="font-inter-semibold text-white text-lg">
                {t('saved_recipes.go_to_chat')}
              </Text>
            </Pressable>
          </Box>
        )}
        renderItem={({ item }) => {
          const r = item.recipe;
          const isInGroceries = isAlreadyInGroceries(item.recipeId);

          return (
            <Pressable
              onPress={() => router.push(`/recipe-details/${item.recipeId}`)}
              className="flex-row items-center bg-white py-3 px-4 border-b border-slate-50"
            >
              <Box className="h-12 w-12 bg-slate-700 rounded-xl items-center justify-center mr-4">
                <Text className="text-white font-inter-bold text-xs">
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  {r.proteins}g
                </Text>
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Text className="text-slate-400 text-[8px] uppercase">
                  Prot
                </Text>
              </Box>

              <Box className="flex-1">
                <Text
                  numberOfLines={1}
                  className="font-inter-semibold text-slate-900 text-base"
                >
                  {capitalizeFull(r.name)}
                </Text>
                <Text className="text-slate-500 text-xs">
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  {r.calories} kcal • {r.prepTimeMin} min
                </Text>
              </Box>

              <Box className="flex-row items-center gap-1">
                {isInGroceries ? (
                  <Pressable
                    onPress={() => {
                      setSelectedRecipe({
                        id: item.recipeId,
                        name: r.name,
                      });
                      setShowConfirmRemove(true);
                    }}
                    className="p-3 active:bg-orange-50 rounded-full"
                  >
                    <Check size={20} color="green" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() =>
                      addTogroceriesMutation.mutate({
                        recipeId: item.recipeId,
                        newState: true,
                      })
                    }
                    className="p-3 active:bg-orange-50 rounded-full"
                  >
                    <ShoppingCart size={20} color="#f97316" />
                  </Pressable>
                )}

                <Pressable
                  onPress={() => handleOpenMenu(item.recipeId, r.name)}
                  className="p-2 active:bg-slate-100 rounded-full"
                >
                  <Ellipsis size={20} color="#94a3b8" />
                </Pressable>
              </Box>
            </Pressable>
          );
        }}
      />
      <SavedRecipesOptionsSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        handleDelete={handleDelete}
      />
      <ConfirmRemoveModal
        bodyText={t('remove_modal.confirm_text_groceries')}
        showModal={showConfirmRemove}
        onClose={() => setShowConfirmRemove(false)}
        onConfirm={() => {
          addTogroceriesMutation.mutate({
            recipeId: selectedRecipe?.id ?? '',
            newState: false,
          });
        }}
      />
    </Box>
  );
}
