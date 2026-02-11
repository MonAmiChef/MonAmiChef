/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { t } from 'i18next';
import { Check, Ellipsis, ShoppingCart, Trash2, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { mealPlanApi } from '@/services/meal-plan.api';
import { capitalizeFull } from '../groceries';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@/components/ui/modal';

export default function MealPlanPage() {
  const { session } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => mealPlanApi.getMealPlan(session!),
    enabled: !!session,
  });
  const [showModal, setShowModal] = useState(false);

  const { data: recipesInGroceries } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => mealPlanApi.getGroceriesRecipes(session!),
    enabled: !!session,
  });

  const isAlreadyInGroceries = (recipeId: string) => {
    return recipesInGroceries?.some((item: any) => item.recipeId === recipeId);
  };

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

  const handleOpenMenu = (id: string, name: string) => {
    setSelectedRecipe({ id, name });
    setShowModal(true);
  };

  const handleDelete = () => {
    if (selectedRecipe) {
      removeFromPlanMutation.mutate(selectedRecipe.id);
      setShowModal(false);
      void refetch();
    }
  };

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
          <Box className="mt-20 items-center px-10">
            <Text className="text-slate-400 text-center font-inter-medium">
              Ton assiette est vide...
            </Text>
          </Box>
        )}
        renderItem={({ item }) => {
          const r = item.recipe;
          const isInGroceries = isAlreadyInGroceries(item.recipeId);

          console.log(item.recipeId, isInGroceries);
          return (
            <Box className="flex-row items-center bg-white py-3 px-4 border-b border-slate-50">
              <Box className="h-12 w-12 bg-slate-900 rounded-xl items-center justify-center mr-4">
                <Text className="text-white font-inter-bold text-xs">
                  {r.proteins}g
                </Text>
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
                  {r.calories} kcal • {r.prepTime} min
                </Text>
              </Box>

              <Box className="flex-row items-center gap-1">
                {isInGroceries ? (
                  <Pressable
                    onPress={() => addTogroceriesMutation.mutate(item.recipeId)}
                    className="p-3 active:bg-orange-50 rounded-full"
                  >
                    <Check size={20} color="green" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => addTogroceriesMutation.mutate(item.recipeId)}
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
            </Box>
          );
        }}
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalBackdrop />
        {/* On force le contenu en bas avec justify-end et on arrondit seulement le haut */}
        <ModalContent className="mb-0 mt-auto rounded-b-none rounded-t-[32px] pb-10 shadow-2xl border-0">
          <ModalHeader className="border-b border-slate-100 pb-4">
            <Box>
              <Text className="text-sm text-slate-400 font-inter-medium">
                Options de recette
              </Text>
              <Text
                className="text-lg text-slate-900 font-inter-bold"
                numberOfLines={1}
              >
                {selectedRecipe?.name}
              </Text>
            </Box>
            <ModalCloseButton>
              <X size={20} color="#94a3b8" />
            </ModalCloseButton>
          </ModalHeader>

          <ModalBody className="mt-6">
            <Pressable
              onPress={handleDelete}
              className="flex-row items-center gap-3 bg-red-50 p-4 rounded-2xl active:bg-red-100 border border-red-100"
            >
              <Trash2 size={20} color="#dc2626" />
              <Text className="text-red-600 font-inter-bold text-base">
                Supprimer du plan
              </Text>
            </Pressable>

            <Text className="text-center text-slate-400 text-xs mt-6">
              Cette action retirera le repas de ton planning hebdomadaire.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
