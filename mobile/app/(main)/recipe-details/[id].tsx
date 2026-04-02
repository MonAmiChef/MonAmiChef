/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/services/recipe.api';
import { useAuth } from '@/hooks/useAuth';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Ellipsis,
  Heart,
  Shapes,
  Timer,
  User,
} from 'lucide-react-native';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import { groceriesApi } from '@/services/groceries.api';
import Toast from 'react-native-toast-message';
import { Divider } from '@/components/ui/divider';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
  AccordionContentText,
} from '@/components/ui/accordion';
import SavedRecipesOptionsSheet from '@/components/saved-recipes/SavedRecipesOptionsSheet';
import { useTranslation } from 'react-i18next';
import Drawer from 'expo-router/drawer';

const SpecItem = ({
  icon,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  value: string;
  suffix?: string;
}) => {
  return (
    <Box className="flex flex-1 gap-2 items-center justify-center">
      {icon}
      <Text className="text-lg font-inter-medium text-wrap text-center">
        {value} {suffix}
      </Text>
    </Box>
  );
};

const MacroItem = ({
  value,
  label,
  suffix,
}: {
  value: number;
  label: string;
  suffix?: string;
}) => {
  return (
    <Box className="flex flex-row align-middle justify-between">
      <Text className="text-lg text-slate-500 font-inter-normal">{label}</Text>
      <Box className="flex-1 mx-2 border-b border-slate-300 border-dashed mb-1" />
      <Text className="text-lg text-orange-600 font-inter-medium">
        {value}
        {suffix}
      </Text>
    </Box>
  );
};

export default function RecipeDetailPage() {
  const {
    id,
    savedServings: savedServingsParam,
    isFavorite: isFavoriteParam,
  } = useLocalSearchParams();
  const [servings, setServings] = useState(
    savedServingsParam ? Number(savedServingsParam) : 1,
  );
  const [isFavorite, setIsFavorite] = useState(isFavoriteParam === '1');
  const favoriteScale = useSharedValue(1);
  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
  }));
  const { session } = useAuth();
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [completedIngredients, setCompletedIngredients] = useState<number[]>(
    [],
  );
  const [showSheet, setShowSheet] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.getRecipe(session!, id as string),
    enabled: !!session && !!id,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const isAlreadyInGroceries = false; // logic removed

  const removeFromPlanMutation = useMutation({
    mutationFn: (recipeId: string) =>
      savedRecipesApi.removeFromSavedRecipes(session!, recipeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      await queryClient.invalidateQueries({ queryKey: ['groceries'] });
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

  const handleDelete = () => {
    removeFromPlanMutation.mutate(id as string);
    setShowSheet(false);
    router.back();
  };



  const updateFavoriteMutation = useMutation({
    mutationFn: (newState: boolean) =>
      savedRecipesApi.updateFavorite(session!, id as string, newState),
    onMutate: (newState) => {
      setIsFavorite(newState);
    },
    onError: (_err, newState) => {
      setIsFavorite(!newState);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
  });

  const handleToggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleToggleIngredients = (index: number) => {
    setCompletedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-[#fffdfb]">
        <ActivityIndicator size="large" color="#ff6900" />
        <Text className="mt-4 text-slate-500 font-inter-medium">
          {t('recipe_details.loading')}
        </Text>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex-1 justify-center items-center p-6">
        <Text className="text-red-500 font-inter-bold text-center">
          {t('recipe_details.fail_loading')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 p-3 bg-slate-100 rounded-xl"
        >
          <Text>{t('recipe_details.back_to_plan')}</Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-[#fffdfb]">
      <Drawer.Screen options={{ headerTitle: ' ' }} />
      <Box className="p-4 flex-1 bg-transparent">
        <ScrollView
          contentContainerStyle={{ gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Box className="flex gap-4">
            <Box className="flex flex-row items-center justify-between gap-4">
              <Text className="flex-1 text-2xl font-inter-bold text-slate-900">
                {data.name}
              </Text>

              <Box className="flex flex-row items-center gap-2">
                {savedServingsParam && (
                  <Pressable
                    onPress={() => {
                      favoriteScale.value = withSpring(isFavorite ? 1 : 1.2, {
                        damping: 300,
                      });
                      updateFavoriteMutation.mutate(!isFavorite);
                    }}
                    className={`p-2.5 rounded-full border-2 ${isFavorite ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}
                  >
                    <Animated.View style={favoriteAnimatedStyle}>
                      <Heart
                        strokeWidth={2.5}
                        size={18}
                        color={isFavorite ? '#ef4444' : '#cbd5e1'}
                        fill={isFavorite ? '#ef4444' : 'none'}
                      />
                    </Animated.View>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setShowSheet(true)}
                  className="p-2.5 active:bg-slate-100 rounded-full border-2 border-slate-100"
                >
                  <Ellipsis size={20} color="#64748b" />
                </Pressable>
              </Box>
            </Box>
            <Text className="text-md font-inter-medium text-slate-500">
              {data.description}
            </Text>
          </Box>

          <Divider />

          {/* Body */}
          <Accordion
            size="md"
            defaultValue={['specs', 'ingredients', 'steps']}
            variant="unfilled"
            type="multiple"
            style={{ gap: 16 }}
            isCollapsible={true}
            isDisabled={false}
          >
            {/* Macros */}
            <AccordionItem value="macros">
              <AccordionHeader className="p-0">
                <AccordionTrigger className="px-0 py-2 gap-2">
                  {({ isExpanded }: { isExpanded: boolean }) => {
                    return (
                      <>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} />
                        ) : (
                          <AccordionIcon as={ChevronDownIcon} />
                        )}
                        <AccordionTitleText>
                          <Box className="flex flex-row items-center gap-2">
                            <Text className="text-xl font-inter-semibold">
                              {t('recipe_details.macros')}
                            </Text>
                            <Text className="text-md font-inter-light-italic text-slate-400">
                              ({t('experimental')})
                            </Text>
                          </Box>
                        </AccordionTitleText>
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Box className="mt-4">
                  <AccordionContentText>
                    <Box className="flex flex-1 w-full gap-4">
                      <MacroItem value={data.calories ?? 0} label="Calories" />
                      <MacroItem
                        value={data.proteins ?? 0}
                        suffix="g"
                        label="Proteins"
                      />
                      <MacroItem value={data.carbs ?? 0} suffix="g" label="Carbs" />
                      <MacroItem value={data.fat ?? 0} suffix="g" label="Fat" />
                      <MacroItem
                        value={data.fibers ?? 0}
                        suffix="g"
                        label="Fibers"
                      />
                    </Box>
                  </AccordionContentText>
                </Box>
              </AccordionContent>
            </AccordionItem>

            {/* Specifications */}
            <AccordionItem value="specs">
              <AccordionHeader className="p-0">
                <AccordionTrigger className="px-0 py-2 gap-2">
                  {({ isExpanded }: { isExpanded: boolean }) => {
                    return (
                      <>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} />
                        ) : (
                          <AccordionIcon as={ChevronDownIcon} />
                        )}
                        <AccordionTitleText>
                          <Box className="flex flex-row items-center gap-2">
                            <Text className="text-xl font-inter-semibold">
                              {t('recipe_details.about')}
                            </Text>
                          </Box>
                        </AccordionTitleText>
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Box className="mt-4">
                  <AccordionContentText>
                    <Box className="flex flex-row flex-1 w-full">
                      <SpecItem
                        value={String(data.prepTimeMin ?? 0)}
                        suffix="minutes"
                        icon={<Timer size={36} color="#ff6900" />}
                      />
                      <SpecItem
                        value={data.difficulty ?? ''}
                        icon={<Shapes size={36} color="#ff6900" />}
                      />
                    </Box>
                  </AccordionContentText>
                </Box>
              </AccordionContent>
            </AccordionItem>

            {/* Ingrédients */}
            <AccordionItem value="ingredients">
              <AccordionHeader className="p-0">
                <AccordionTrigger className="px-0 py-2 gap-2">
                  {({ isExpanded }: { isExpanded: boolean }) => {
                    return (
                      <>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} />
                        ) : (
                          <AccordionIcon as={ChevronDownIcon} />
                        )}
                        <AccordionTitleText>
                          <Box className="flex flex-row items-center gap-2">
                            <Text className="text-xl font-inter-semibold">
                              {t('recipe_details.ingredients')}
                            </Text>
                          </Box>
                        </AccordionTitleText>
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Box className="mt-4">
                  <AccordionContentText>
                    <Pressable className="flex flex-1 w-full">
                      {data.ingredients.map((ing: any, index: number) => {
                        const isIngredientCompleted = completedIngredients.some(
                          (s) => s === index,
                        );
                        return (
                          <Pressable
                            onPress={() => handleToggleIngredients(index)}
                            className="my-2"
                            key={index}
                          >
                            <Box className="flex-row items-center justify-between py-3">
                              <Text
                                className={`flex-1 text-lg text-slate-500 font-inter-normal leading-6 mr-4 ${isIngredientCompleted && 'line-through text-green-600'}`}
                              >
                                {ing.name}
                              </Text>

                              <Text
                                className={`text-lg text-orange-600 font-inter-medium shrink-0 ${isIngredientCompleted && 'text-green-500'}`}
                              >
                                {parseFloat(
                                  (ing.quantity * servings).toFixed(2),
                                )}{' '}
                                {ing.unit}
                              </Text>
                            </Box>

                            {index < data.ingredients.length - 1 && (
                              <Divider className="bg-slate-100" />
                            )}
                          </Pressable>
                        );
                      })}
                    </Pressable>
                  </AccordionContentText>
                </Box>
              </AccordionContent>
            </AccordionItem>

            {/* Instructions */}
            <AccordionItem value="steps">
              <AccordionHeader className="p-0">
                <AccordionTrigger className="px-0 py-2 gap-2">
                  {({ isExpanded }: { isExpanded: boolean }) => {
                    return (
                      <>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} />
                        ) : (
                          <AccordionIcon as={ChevronDownIcon} />
                        )}
                        <AccordionTitleText>
                          <Box className="flex flex-row items-center gap-2">
                            <Text className="text-xl font-inter-semibold">
                              {t('recipe_details.steps')}
                            </Text>
                          </Box>
                        </AccordionTitleText>
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Box className="mt-4">
                  <AccordionContentText>
                    <Box className="flex flex-1 w-full gap-1.5">
                      {data.instructions.map((step: any, index: number) => {
                        const isStepCompleted = completedSteps.some(
                          (s) => s === index,
                        );

                        return (
                          <Box className="flex" key={index}>
                            <Pressable
                              onPress={() => {
                                handleToggleStep(index);
                              }}
                              className="flex-row gap-4 items-center justify-between py-1.5"
                            >
                              <Box
                                className={`bg-orange-500 justify-center items-center h-6 w-6 rounded-full ${isStepCompleted && 'bg-green-500'}`}
                              >
                                <Text className="text-md font-inter-semibold text-white">
                                  {index + 1}
                                </Text>
                              </Box>
                              <Text
                                className={`flex-1 text-lg text-slate-500 font-inter-normal leading-6 mr-4 ${isStepCompleted && 'line-through text-green-600'}`}
                              >
                                {step}
                              </Text>
                            </Pressable>
                          </Box>
                        );
                      })}
                    </Box>
                  </AccordionContentText>
                </Box>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollView>
      </Box>
      <SavedRecipesOptionsSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        handleDelete={handleDelete}
                      />
    </SafeAreaView>
  );
}
