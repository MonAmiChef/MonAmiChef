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
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ShoppingCart,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { groceriesApi, MergedIngredient } from '@/services/groceries.api';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const capitalizeFull = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(/([ -])/)
    .map((word) => {
      if (word === ' ' || word === '-') return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
};

const formatData = (items: MergedIngredient[], expandedSections: string[]) => {
  const groups = items.reduce(
    (acc, item) => {
      const cat = item.category || 'AUTRE';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, MergedIngredient[]>,
  );

  const flatList: any[] = [];
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
      <Animated.View style={containerStyle} className="flex-row items-center py-3 px-2">
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
            {item.recipes.map((recipeName: string, index: number) => (
              <Box
                key={index}
                className="bg-slate-100 px-2 py-0.5 rounded-md mr-1 mb-1 border border-slate-200"
              >
                <Text
                  className="text-[9px] text-slate-500 font-inter-medium italic"
                  numberOfLines={1}
                >
                  {recipeName}
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

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title],
    );
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['groceries'],
    queryFn: () => groceriesApi.getUserGroceries(session!),
    enabled: !!session,
  });

  const router = useRouter();

  const formattedData = data ? formatData(data, expandedSections) : [];

  const { t } = useTranslation();

  const toggleMutation = useMutation({
    mutationFn: ({ ids, bought }: { ids: string[]; bought: boolean }) =>
      groceriesApi.toggleIngredientsStatus(session!, ids, bought),
    onMutate: async ({ ids, bought }) => {
      await queryClient.cancelQueries({ queryKey: ['groceries'] });
      const previousData = queryClient.getQueryData<MergedIngredient[]>(['groceries']);
      queryClient.setQueryData<MergedIngredient[]>(['groceries'], (old) =>
        old?.map((item) =>
          item.ingredientIds.some((id) => ids.includes(id))
            ? { ...item, isBought: bought }
            : item,
        ) ?? [],
      );
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['groceries'], context?.previousData);
      Toast.show({
        text1: t('toast.error'),
        text2: t('toast.error_togling_item'),
        type: 'error',
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['groceries'] });
    },
  });

  if (isLoading)
    return <ActivityIndicator className="flex-1" color="#ff6900" />;

  return (
    <Box className="flex-1 bg-[#fffdfb] p-4">
      {formattedData?.length > 0 && (
        <Text className="text-2xl px-4 text-black font-inter-medium">
          {t('saved_recipes.subtitle')}
        </Text>
      )}
      <Animated.FlatList
        data={formattedData}
        keyExtractor={(item: any) =>
          item.type === 'HEADER'
            ? `header-${item.title}`
            : `item-${item.ingredientIds.join('-')}`
        }
        itemLayoutAnimation={LinearTransition}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={async () => {
              setIsManualRefreshing(true);
              await refetch();
              setIsManualRefreshing(false);
            }}
            colors={['#ff6900']}
          />
        }
        ListEmptyComponent={() => (
          <Box className="flex h-[75%] bg-[#fffdfb] px-2 justify-center items-center gap-6">
            <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center">
              <ShoppingCart size={48} color="#f97316" strokeWidth={1.5} />
            </View>

            <Text className="font-inter-bold text-2xl text-slate-900 text-center">
              {t('groceries.empty')}
            </Text>

            <Pressable
              onPress={() => router.push('/(main)/chat')}
              className="bg-orange-500 px-8 py-4 rounded-2xl active:bg-orange-600 shadow-sm shadow-orange-200"
            >
              <Text className="font-inter-semibold text-white text-lg">
                {t('groceries.go_to_chat')}
              </Text>
            </Pressable>
          </Box>
        )}
        renderItem={({ item }: { item: any }) => {
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
    </Box>
  );
}
