/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { useEffect, useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  MoreHorizontal,
  RotateCcw,
  User,
  UtensilsCrossed,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { groceriesApi, MergedIngredient } from '@/services/groceries.api';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ConfirmRemoveModal from '@/components/saved-recipes/ConfirmRemoveModal';
import SavedRecipesOptionsSheet from '@/components/saved-recipes/SavedRecipesOptionsSheet';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { capitalizeFull } from '@/utils/text';

export { capitalizeFull };

function GroceriesSkeleton() {
  return (
    <Box className="flex-1 px-1">
      {/* Recipes section skeleton */}
      <Skeleton className="h-14 w-full rounded-xl mt-4 mb-2" />

      {/* Ingredients subtitle */}
      <Skeleton className="h-4 w-32 mt-6 mb-4 rounded-md" />

      {/* Categories and items */}
      {[1, 2, 3].map((i) => (
        <Box key={i} className="mb-4">
          <Skeleton className="h-12 w-full rounded-xl mb-3" />
          <Box className="px-2 gap-3">
            {[1, 2].map((j) => (
              <Box key={j} className="flex-row items-center gap-3 py-1">
                <Skeleton variant="circular" className="h-6 w-6" />
                <Box className="flex-1 gap-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Box className="flex-row gap-2">
                    <Skeleton className="h-3 w-16 rounded-sm" />
                    <Skeleton className="h-3 w-20 rounded-sm" />
                  </Box>
                </Box>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const formatData = (
  items: MergedIngredient[],
  expandedSections: string[],
  recipesSectionExpanded: boolean,
  groceryRecipes: {
    name: string;
    id: string;
    servings: number | undefined;
  }[],
  allData: MergedIngredient[],
  hiddenRecipes: Set<string>,
) => {
  const flatList: any[] = [];

  flatList.push({
    type: 'RECIPES_SECTION_HEADER',
    isExpanded: recipesSectionExpanded,
    count: groceryRecipes.length,
  });

  if (recipesSectionExpanded) {
    console.log('[GroceriesMode] Data items:', allData.length);
    groceryRecipes.forEach(({ name, id: recipeId, servings }) => {
      const hasAnyBought = allData.some(
        (item) => item.recipeDetails.some(rd => rd.name === name) && item.isBought,
      );
      const isHidden = hiddenRecipes.has(name);
      flatList.push({
        type: 'RECIPE_ITEM',
        name,
        recipeId,
        hasAnyBought,
        isHidden,
        servings,
      });
    });
  }

  flatList.push({ type: 'INGREDIENTS_SUBTITLE' });

  const groups = items.reduce(
    (acc, item) => {
      const cat = item.category || 'AUTRE';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, MergedIngredient[]>,
  );

  Object.keys(groups)
    .sort()
    .forEach((cat) => {
      const isExpanded = expandedSections.includes(cat);
      const isCompleted = groups[cat].every((ing) => ing.isBought);

      flatList.push({ type: 'HEADER', title: cat, isExpanded, isCompleted });

      if (isExpanded) {
        const sortedIngredients = [...groups[cat]].sort((a, b) => {
          if (a.isBought !== b.isBought) {
            return a.isBought ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        });

        sortedIngredients.forEach((ing) =>
          flatList.push({ type: 'ITEM', ...ing }),
        );
      }
    });

  return flatList;
};

type GroceryItemProps = {
  item: any;
  onToggle: () => void;
};

function GroceryItem({ item, onToggle }: GroceryItemProps) {
  const strikeProgress = useSharedValue(item.isBought ? 1 : 0);
  const opacity = useSharedValue(item.isBought ? 0.4 : 1);

  useEffect(() => {
    strikeProgress.value = withTiming(item.isBought ? 1 : 0, { duration: 280 });
    opacity.value = withTiming(item.isBought ? 0.4 : 1, { duration: 280 });
  }, [item.isBought]);

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeProgress.value * 100}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={containerStyle}
        className="flex-row items-center py-3 px-2"
      >
        <Box className="mr-3">
          {item.isBought ? (
            <CheckCircle2 size={22} color="#f97316" />
          ) : (
            <Circle size={22} color="#cbd5e1" />
          )}
        </Box>
        <Box className="flex-1">
          <View style={{ position: 'relative' }}>
            <Text
              className={`text-base font-inter-medium ${item.isBought ? 'text-slate-400' : 'text-slate-800'}`}
            >
              {capitalizeFull(item.name)}
            </Text>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  height: 1.5,
                  backgroundColor: '#94a3b8',
                  top: '50%',
                  left: 0,
                },
                strikeStyle,
              ]}
            />
          </View>

          <Box className="flex-row flex-wrap mt-1">
            {item.recipeDetails.map((detail: any, index: number) => (
              <Box
                key={index}
                className="bg-slate-100 px-2 py-0.5 rounded-md mr-1 mb-1 border border-slate-200"
              >
                <Text
                  className="text-[9px] text-slate-500 font-inter-medium italic"
                  numberOfLines={1}
                >
                  {detail.name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <Text className="text-orange-600 font-inter-bold text-sm bg-orange-50 px-2 py-1 rounded-lg">
          {Math.round(item.totalQuantity * 100) / 100} {item.unit}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

type RecipeRowProps = {
  name: string;
  recipeId: string;
  hasAnyBought: boolean;
  isHidden: boolean;
  servings?: number;
  onToggleVisibility: () => void;
  onReset: () => void;
  onEllipsis: () => void;
};

function RecipeRow({
  name,
  hasAnyBought,
  isHidden,
  servings,
  onToggleVisibility,
  onReset,
  onEllipsis,
}: RecipeRowProps) {
  return (
    <View
      className="flex-row items-center px-3 py-3"
      style={{ opacity: isHidden ? 0.4 : 1 }}
    >
      <Text
        className="flex-1 font-inter-medium text-slate-800"
        numberOfLines={1}
      >
        {name}
      </Text>
      {servings != null && (
        <View className="flex-row items-center gap-1 mr-3">
          <User size={12} color="#94a3b8" />
          <Text className="text-slate-500 font-inter-medium text-xs">
            {servings}
          </Text>
        </View>
      )}
      <Pressable onPress={onToggleVisibility} className="p-1">
        {isHidden ? (
          <EyeOff size={20} color="#64748b" />
        ) : (
          <Eye size={20} color="#94a3b8" />
        )}
      </Pressable>
      {hasAnyBought && (
        <Pressable onPress={onReset} className="p-1 ml-1">
          <RotateCcw size={20} color="#94a3b8" />
        </Pressable>
      )}
      <Pressable onPress={onEllipsis} className="p-1 ml-1">
        <MoreHorizontal size={20} color="#94a3b8" />
      </Pressable>
    </View>
  );
}

export default function GroceriesPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'vegetables',
    'meat',
    'dairy',
    'pantry',
  ]);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [recipesSectionExpanded, setRecipesSectionExpanded] = useState(false);
  const [hiddenRecipes, setHiddenRecipes] = useState<Set<string>>(new Set());
  const [ellipsisOpenRecipeId, setEllipsisOpenRecipeId] = useState<
    string | null
  >(null);
  const [confirmRemoveRecipeId, setConfirmRemoveRecipeId] = useState<
    string | null
  >(null);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title],
    );
  };

  const getLocalTodayStr = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalTodayStr();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['groceries', todayStr],
    queryFn: () => {
      console.log('[GroceriesMode] Fetching for today:', todayStr, 'Session:', !!session);
      return groceriesApi.getUserGroceries(session!, todayStr);
    },
    enabled: !!session,
  });

  const { data: savedRecipes } = useQuery({
    queryKey: ['saved-recipes'],
    queryFn: () => savedRecipesApi.getSavedRecipes(session!),
    enabled: !!session,
  });

  const router = useRouter();
  const { t } = useTranslation();

  const allRecipesMap = new Map<string, { id: string; name: string; servings: number }>();
  data?.forEach(item => {
    item.recipeDetails.forEach(rd => {
      allRecipesMap.set(rd.name, rd);
    });
  });

  const groceryRecipes = Array.from(allRecipesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const visibleIngredients = (data ?? []).filter(
    (item) => !item.recipeDetails.every((rd) => hiddenRecipes.has(rd.name)),
  );

  const formattedData =
    (data?.length ?? 0) === 0
      ? []
      : formatData(
          visibleIngredients,
          expandedSections,
          recipesSectionExpanded,
          groceryRecipes,
          data ?? [],
          hiddenRecipes,
        );

  const toggleMutation = useMutation({
    mutationFn: ({ ids, bought }: { ids: string[]; bought: boolean }) =>
      groceriesApi.toggleIngredientsStatus(session!, ids, bought),
    onMutate: async ({ ids, bought }) => {
      await queryClient.cancelQueries({ queryKey: ['groceries', todayStr] });
      const previousData = queryClient.getQueryData<MergedIngredient[]>([
        'groceries',
        todayStr,
      ]);
      queryClient.setQueryData<MergedIngredient[]>(
        ['groceries', todayStr],
        (old) =>
          old?.map((item) =>
            item.ingredientIds.some((id) => ids.includes(id))
              ? { ...item, isBought: bought }
              : item,
          ) ?? [],
      );
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['groceries', todayStr], context?.previousData);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_togling_item'),
        type: 'error',
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['groceries', todayStr] });
    },
  });

  const removeRecipeMutation = useMutation({
    mutationFn: (recipeId: string) =>
      groceriesApi.updateRecipeInGroceries(session!, recipeId, false),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['groceries', todayStr] });
      void queryClient.invalidateQueries({ queryKey: ['groceries-recipes'] });
    },
  });

  const resetRecipeIngredients = (recipeName: string) => {
    const ids = (data ?? [])
      .filter((item) => item.recipeDetails.some(rd => rd.name === recipeName))
      .flatMap((item) => item.ingredientIds);
    if (ids.length) toggleMutation.mutate({ ids, bought: false });
  };

  const { width } = useWindowDimensions();

  if (isLoading)
    return (
      <Box className="flex-1 bg-[#fffdfb] p-4">
        <GroceriesSkeleton />
      </Box>
    );

  return (
    <Box className="flex-1 bg-[#fffdfb] p-4">
      <Animated.FlatList
        showsVerticalScrollIndicator={false}
        data={formattedData}
        keyExtractor={(item: any) => {
          if (item.type === 'RECIPES_SECTION_HEADER')
            return 'recipes-section-header';
          if (item.type === 'RECIPE_ITEM')
            return `recipe-item-${item.recipeId}`;
          if (item.type === 'INGREDIENTS_SUBTITLE')
            return 'ingredients-subtitle';
          if (item.type === 'HEADER') return `header-${item.title}`;
          return `item-${item.ingredientIds.join('-')}`;
        }}
        itemLayoutAnimation={LinearTransition}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={() => {
              setIsManualRefreshing(true);
              void refetch().then(() => setIsManualRefreshing(false));
            }}
            colors={['#ff6900']}
          />
        }
        ListEmptyComponent={() => (
          <Box className="flex h-[75%] bg-[#fffdfb] px-2 justify-center items-center gap-6">
            <Box style={{ width: width * 0.7, height: width * 0.5 }}>
              <Image
                source={require('@/assets/images/undraw_empty-cart_574u.svg')}
                contentFit="contain"
                style={{ width: '100%', height: '100%' }}
              />
            </Box>

            <Text className="font-inter-medium text-lg text-slate-500 text-center px-4">
              {t('groceries.empty')}
            </Text>

            <Box className="w-full gap-3 px-8">
              <Pressable
                onPress={() => router.push('/(main)/meal-plan')}
                className="bg-orange-500 py-4 rounded-2xl active:bg-orange-600 shadow-sm shadow-orange-200 items-center"
              >
                <Text className="font-inter-semibold text-white text-lg">
                  {t('groceries.go_to_plan')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(main)/chat')}
                className="bg-slate-50 py-4 rounded-2xl active:bg-slate-100 border border-slate-100 items-center"
              >
                <Text className="font-inter-semibold text-slate-600 text-lg">
                  {t('groceries.go_to_chat')}
                </Text>
              </Pressable>
            </Box>
          </Box>
        )}
        renderItem={({ item }: { item: any }) => {
          if (item.type === 'RECIPES_SECTION_HEADER') {
            return (
              <Pressable
                onPress={() => setRecipesSectionExpanded((prev) => !prev)}
                className="flex-row items-center p-3 rounded-xl mt-4 mb-2 bg-orange-50 border border-orange-100"
              >
                <UtensilsCrossed size={15} color="#f97316" />
                <Text className="ml-2 font-inter-bold text-xs uppercase tracking-wider text-orange-500 flex-1">
                  {t('groceries.recipes_section')}
                </Text>
                {item.count > 0 && (
                  <Box className="bg-orange-100 px-2 py-0.5 rounded-full mr-2">
                    <Text className="text-[10px] text-orange-600 font-inter-bold">
                      {item.count}
                    </Text>
                  </Box>
                )}
                {item.isExpanded ? (
                  <ChevronDown size={18} color="#f97316" />
                ) : (
                  <ChevronRight size={18} color="#f97316" />
                )}
              </Pressable>
            );
          }

          if (item.type === 'RECIPE_ITEM') {
            return (
              <RecipeRow
                name={item.name}
                recipeId={item.recipeId}
                hasAnyBought={item.hasAnyBought}
                isHidden={item.isHidden}
                servings={item.servings}
                onToggleVisibility={() => {
                  setHiddenRecipes((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.name)) {
                      next.delete(item.name);
                    } else {
                      next.add(item.name);
                    }
                    return next;
                  });
                }}
                onReset={() => resetRecipeIngredients(item.name)}
                onEllipsis={() => setEllipsisOpenRecipeId(item.recipeId)}
              />
            );
          }

          if (item.type === 'INGREDIENTS_SUBTITLE') {
            return (
              <Text className="mt-6 mb-1 px-1 font-inter-bold text-xs uppercase tracking-wider text-slate-400">
                {t('groceries.ingredients_section')}
              </Text>
            );
          }

          if (item.type === 'HEADER') {
            return (
              <Pressable
                onPress={() => toggleSection(item.title)}
                className={`flex-row items-center p-3 rounded-xl mt-4 mb-2 border ${
                  item.isCompleted
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                {item.isExpanded ? (
                  <ChevronDown
                    size={18}
                    color={item.isCompleted ? '#10b981' : '#64748b'}
                  />
                ) : (
                  <ChevronRight
                    size={18}
                    color={item.isCompleted ? '#10b981' : '#64748b'}
                  />
                )}

                <Text
                  className={`ml-2 font-inter-bold text-xs uppercase tracking-wider ${
                    item.isCompleted ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {t(`groceries.categories.${item.title.toLowerCase()}`)}
                </Text>

                {item.isCompleted && (
                  <Box className="ml-auto bg-emerald-500 px-2 py-0.5 rounded-full">
                    <Text className="text-[8px] text-white font-inter-bold">
                      {t('groceries.complete')}
                    </Text>
                  </Box>
                )}
              </Pressable>
            );
          }

          return (
            <GroceryItem
              item={item}
              onToggle={() =>
                toggleMutation.mutate({
                  ids: item.ingredientIds,
                  bought: !item.isBought,
                })
              }
            />
          );
        }}
      />
      <SavedRecipesOptionsSheet
        isOpen={!!ellipsisOpenRecipeId}
        onClose={() => setEllipsisOpenRecipeId(null)}
        handleDelete={() => {
          setConfirmRemoveRecipeId(ellipsisOpenRecipeId);
          setEllipsisOpenRecipeId(null);
        }}
      />
      <ConfirmRemoveModal
        showModal={!!confirmRemoveRecipeId}
        onClose={() => setConfirmRemoveRecipeId(null)}
        onConfirm={() => {
          if (confirmRemoveRecipeId)
            removeRecipeMutation.mutate(confirmRemoveRecipeId);
        }}
        bodyText={t('remove_modal.confirm_text_groceries')}
      />
    </Box>
  );
}
