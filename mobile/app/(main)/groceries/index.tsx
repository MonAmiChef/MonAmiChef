/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { groceriesApi, MergedIngredient } from '@/services/groceries.api';

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
        // --- TRI STABLE ICI ---
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

export default function GroceriesPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'VEGETABLES',
    'MEAT',
    'DAIRY',
    'PANTRY',
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title],
    );
  };

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['groceries'],
    queryFn: () => groceriesApi.getUserGroceries(session!),
    enabled: !!session,
  });

  const formattedData = data ? formatData(data, expandedSections) : [];

  const toggleMutation = useMutation({
    mutationFn: ({ ids, bought }: { ids: string[]; bought: boolean }) =>
      groceriesApi.toggleIngredientsStatus(session!, ids, bought),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groceries'] });
    },
    onError: () => {
      Toast.show({
        text1: 'Erreur',
        text2: "Impossible de mettre à jour l'article.",
        type: 'error',
      });
    },
  });

  if (isLoading && !isRefetching)
    return <ActivityIndicator className="flex-1" color="#ff6900" />;

  return (
    <Box className="flex-1 bg-white p-4">
      <Text className="text-2xl font-inter-bold mb-6">Ma Liste</Text>

      <FlashList
        data={formattedData}
        keyExtractor={(item) =>
          item.type === 'HEADER'
            ? `header-${item.title}`
            : `item-${item.ingredientIds.join('-')}`
        }
        renderItem={({ item }) => {
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
                  {item.title}
                </Text>

                {item.isCompleted && (
                  <Box className="ml-auto bg-emerald-500 px-2 py-0.5 rounded-full">
                    <Text className="text-[8px] text-white font-inter-bold">
                      COMPLET
                    </Text>
                  </Box>
                )}
              </Pressable>
            );
          }

          return (
            <Pressable
              onPress={() =>
                toggleMutation.mutate({
                  ids: item.ingredientIds,
                  bought: !item.isBought,
                })
              }
              className={`flex-row items-center py-3 px-2 ${item.isBought ? 'opacity-40' : ''}`}
            >
              <Box className="mr-3">
                {item.isBought ? (
                  <CheckCircle2 size={22} color="#f97316" />
                ) : (
                  <Circle size={22} color="#cbd5e1" />
                )}
              </Box>
              <Box className="flex-1">
                <Text
                  className={`text-base font-inter-medium ${item.isBought ? 'line-through text-slate-400' : 'text-slate-800'}`}
                >
                  {capitalizeFull(item.name)}
                </Text>

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
            </Pressable>
          );
        }}
        getItemType={(item) => item.type}
        // estimatedItemSize={60}
      />
    </Box>
  );
}
