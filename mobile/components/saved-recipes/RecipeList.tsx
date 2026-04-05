/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  Ellipsis,
  Heart,
  Notebook,
  User,
  CalendarPlus,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import { groceriesApi } from '@/services/groceries.api';
import { capitalizeFull } from '@/utils/text';
import { useRouter, usePathname } from 'expo-router';
import SavedRecipesOptionsSheet from '@/components/saved-recipes/SavedRecipesOptionsSheet';
import DayPickerModal from '@/components/meal-plan/DayPickerModal';
import { Skeleton } from '@/components/ui/skeleton';
import { mealPlanApi, CreateMealPlanEntryInput } from '@/services/meal-plan.api';

function RecipeCardSkeleton() {
  return (
    <Box
      className="bg-white mx-1 rounded-2xl shadow-xs shadow-slate-100 overflow-hidden relative"
      style={{ height: 160 }}
    >
      <Skeleton className="w-[4px] absolute top-0 bottom-0 left-0 bg-orange-100" />
      <Box className="flex-1 pl-6 pr-4 pt-4 pb-2">
        <Box className="flex-row justify-between mb-2">
          <Box className="flex-1 mr-4 gap-2">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-sm" />
          </Box>
          <Box className="flex-row gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </Box>
        </Box>

        <Box className="h-px bg-slate-50 mb-4" />

        <Box className="flex-row mb-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} className="flex-1 items-center gap-1">
              <Skeleton className="h-4 w-8 rounded-sm" />
              <Skeleton className="h-2 w-6 rounded-sm" />
            </Box>
          ))}
        </Box>

        <Box className="h-px bg-slate-50 mb-2" />

        <Box className="flex-row justify-end gap-2">
          <Skeleton variant="circular" className="h-9 w-9" />
          <Skeleton variant="circular" className="h-9 w-9" />
          <Skeleton variant="circular" className="h-9 w-9" />
        </Box>
      </Box>
    </Box>
  );
}

interface RecipeCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  servings: number;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onPlanPress: () => void;
  onMenuPress: () => void;
  t: (key: string) => string;
}

function RecipeCard({
  item,
  servings,
  isFavorite,
  onPress,
  onFavoritePress,
  onPlanPress,
  onMenuPress,
  t,
}: RecipeCardProps) {
  const r = item.recipe;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFavoritePress = () => {
    scale.value = withSpring(isFavorite ? 1 : 1.05, {
      damping: 300,
    });
    onFavoritePress();
  };

  const accentColor = r.isVegan
    ? '#10b981'
    : r.isVegetarian
      ? '#4ade80'
      : '#fb923c';

  return (
    <Pressable
      onPress={onPress}
      className="bg-white mx-1 rounded-2xl shadow-xs shadow-slate-100 overflow-hidden"
    >
      <View
        style={{
          width: 4,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: accentColor,
        }}
      />

      <View className="pl-4 pr-3 pt-3 pb-0">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text
              numberOfLines={2}
              className="font-inter-semibold text-slate-900 text-base leading-snug"
            >
              {capitalizeFull(r.name)}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {/* eslint-disable-next-line i18next/no-literal-string */}
              {r.prepTimeMin} min • {capitalizeFull(r.difficulty ?? '')}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-1 justify-end max-w-[110px]">
            {r.isVegan && (
              <View className="rounded-full bg-green-50 px-2 py-0.5">
                <Text className="text-green-700 text-[10px]">
                  {t('diet.vegan')}
                </Text>
              </View>
            )}
            {r.isVegetarian && !r.isVegan && (
              <View className="rounded-full bg-green-50 px-2 py-0.5">
                <Text className="text-green-700 text-[10px]">
                  {t('diet.vegetarian')}
                </Text>
              </View>
            )}
            {r.isGlutenFree && (
              <View className="rounded-full bg-amber-50 px-2 py-0.5">
                <Text className="text-amber-700 text-[10px]">
                  {t('diet.gluten_free')}
                </Text>
              </View>
            )}
            {r.isDairyFree && (
              <View className="rounded-full bg-sky-50 px-2 py-0.5">
                <Text className="text-sky-700 text-[10px]">
                  {t('diet.dairy_free')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="h-px bg-slate-100 mb-3" />

        <View className="flex-row mb-3">
          {[
            { value: r.calories, label: 'kcal' },
            { value: `${r.proteins}g`, label: 'prot' },
            { value: `${r.carbs}g`, label: 'carbs' },
            { value: `${r.fat}g`, label: 'fat' },
          ].map((macro, idx) => (
            <View key={idx} className="flex-1 items-center">
              <Text className="font-inter-semibold text-sm text-slate-800">
                {macro.value}
              </Text>
              <Text className="text-[10px] text-slate-400 uppercase tracking-wide">
                {macro.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="h-px bg-slate-100 mb-2" />

        <View className="flex-row items-center justify-end py-1">
          <View className="flex-row items-center">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleFavoritePress();
              }}
              className="p-2 active:bg-red-50 rounded-full"
            >
              <Animated.View style={animatedStyle}>
                <Heart
                  size={20}
                  color={isFavorite ? '#ef4444' : '#cbd5e1'}
                  fill={isFavorite ? '#ef4444' : 'none'}
                />
              </Animated.View>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onPlanPress();
              }}
              className="p-2 active:bg-indigo-50 rounded-full"
            >
              <CalendarPlus size={20} color="#6366f1" />
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onMenuPress();
              }}
              className="p-2 active:bg-slate-100 rounded-full"
            >
              <Ellipsis size={20} color="#94a3b8" />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface RecipeListProps {
  filterFavorites?: boolean;
}

export default function RecipeList({
  filterFavorites = false,
}: RecipeListProps) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isFavorites = pathname.endsWith('/favorites');
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
  const [showDayPicker, setShowDayPicker] = useState(false);
  const queryClient = useQueryClient();

  const removeFromSavedMutation = useMutation({
    mutationFn: (recipeId: string) =>
      savedRecipesApi.removeFromSavedRecipes(session!, recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
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



  const updateFavoriteMutation = useMutation({
    mutationFn: ({
      recipeId,
      isFavorite,
    }: {
      recipeId: string;
      isFavorite: boolean;
    }) => savedRecipesApi.updateFavorite(session!, recipeId, isFavorite),
    onMutate: async ({ recipeId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['saved-recipes'] });
      const previous = queryClient.getQueryData(['saved-recipes']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(['saved-recipes'], (old: any) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        old?.map((item: { recipeId: string }) =>
          item.recipeId === recipeId ? { ...item, isFavorite } : item,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['saved-recipes'], context?.previous);
    },
  });

  const planMealMutation = useMutation({
    mutationFn: (entries: CreateMealPlanEntryInput[]) =>
      mealPlanApi.createEntries(session!, entries),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      await queryClient.invalidateQueries({ queryKey: ['groceries'] });
      Toast.show({
        text1: t('toast.success'),
        text2: t('meal_plan.recipe_planned'),
        type: 'success',
      });
    },
    onError: () => {
      Toast.show({
        text1: t('toast.error'),
        text2: t('meal_plan.error_planning'),
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const favoriteCount: number =
    data?.filter((item: { isFavorite: boolean }) => item.isFavorite).length ??
    0;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const displayData: typeof data = filterFavorites
    ? (data?.filter((item: { isFavorite: boolean }) => item.isFavorite) ?? [])
    : (data ?? []);

  const { width } = useWindowDimensions();

  if (isLoading)
    return (
      <Box className="flex-1 bg-[#fffdfb]">
        <View className="px-4 pt-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </View>
        <Box className="flex-1 p-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </Box>
      </Box>
    );

  return (
    <Box className="flex-1 bg-[#fffdfb]">
      {/* Tab bar */}
      <View className="px-4 pt-4">
        <View className="flex-row bg-slate-100 rounded-xl p-1 gap-1">
          <Pressable
            onPress={() => router.replace('/recipes/saved')}
            className={`flex-1 py-2 rounded-lg items-center ${!isFavorites ? 'bg-white shadow-xs' : ''}`}
          >
            <Text
              className={`font-inter-semibold text-sm ${!isFavorites ? 'text-slate-900' : 'text-slate-400'}`}
            >
              {t('saved_recipes.all')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/recipes/favorites')}
            className={`flex-1 py-2 rounded-lg items-center flex-row justify-center gap-1 ${isFavorites ? 'bg-white shadow-xs' : ''}`}
          >
            <Heart
              size={13}
              color={isFavorites ? '#ef4444' : '#94a3b8'}
              fill={isFavorites ? '#ef4444' : 'none'}
            />
            <Text
              className={`font-inter-semibold text-sm ${isFavorites ? 'text-slate-900' : 'text-slate-400'}`}
            >
              {t('saved_recipes.favorites')}
            </Text>
            {favoriteCount > 0 && (
              <View
                className={`rounded-full px-1.5 py-0.5 min-w-[18px] items-center ${isFavorites ? 'bg-red-100' : 'bg-slate-200'}`}
              >
                <Text
                  className={`text-[10px] font-inter-semibold ${isFavorites ? 'text-red-500' : 'text-slate-400'}`}
                >
                  {favoriteCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      <Box className="flex-1 p-4">
        <FlatList
          data={displayData}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
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
          ListEmptyComponent={
            filterFavorites
              ? () => (
                  <Box className="flex h-[75%] bg-[#fffdfb] px-2 justify-center items-center gap-6">
                    <Box style={{ width: width * 0.7, height: width * 0.5 }}>
                      <Image
                        source={require('@/assets/images/undraw_loving-it_hspq.svg')}
                        contentFit="contain"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                    <Text className="font-inter-medium text-lg text-slate-500 text-center px-8">
                      {t('saved_recipes.favorites_empty')}
                    </Text>
                  </Box>
                )
              : () => (
                  <Box className="flex h-[75%] bg-[#fffdfb] px-2 justify-center items-center gap-6">
                    <Box style={{ width: width * 0.7, height: width * 0.5 }}>
                      <Image
                        source={require('@/assets/images/undraw_no-data_ig65.svg')}
                        contentFit="contain"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                    <Text className="font-inter-medium text-lg text-slate-500 text-center px-8">
                      {t('saved_recipes.empty')}
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(main)/chat')}
                      className="bg-orange-500 px-8 py-4 rounded-2xl active:bg-orange-600 shadow-xs shadow-orange-200"
                    >
                      <Text className="font-inter-semibold text-white text-lg">
                        {t('saved_recipes.go_to_chat')}
                      </Text>
                    </Pressable>
                  </Box>
                )
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => {
            const servings = item.servings ?? 1;
            const isFavorite = item.isFavorite as boolean;
            return (
              <RecipeCard
                item={item}
                servings={servings}
                isFavorite={isFavorite}
                onPress={() => {
                  router.push(
                    `/recipe-details/${item.recipeId}?savedServings=${servings}&isFavorite=${item.isFavorite ? '1' : '0'}`,
                  );
                }}
                onFavoritePress={() => {
                  updateFavoriteMutation.mutate({
                    recipeId: item.recipeId,
                    isFavorite: !isFavorite,
                  });
                }}
                onPlanPress={() => {
                  setSelectedRecipe({
                    id: item.recipeId,
                    name: item.recipe.name,
                  });
                  setShowDayPicker(true);
                }}
                onMenuPress={() => {
                  handleOpenMenu(
                    item.recipeId as string,
                    item.recipe.name as string,
                  );
                }}
                t={t}
              />
            );
          }}
        />
        <SavedRecipesOptionsSheet
          isOpen={showSheet}
          onClose={() => setShowSheet(false)}
          handleDelete={handleDelete}
          handlePlanMeal={() => {
            setShowSheet(false);
            setShowDayPicker(true);
          }}
        />

        <DayPickerModal
          isOpen={showDayPicker}
          onClose={() => setShowDayPicker(false)}
          recipeName={capitalizeFull(selectedRecipe?.name ?? '')}
          onConfirm={(selections) => {
            if (!selectedRecipe) return;
            const entries: CreateMealPlanEntryInput[] = selections.map((s) => ({
              recipeId: selectedRecipe.id,
              date: s.date,
              mealType: s.mealType,
              servings: s.servings,
            }));
            planMealMutation.mutate(entries);
          }}
        />
      </Box>
    </Box>
  );
}
