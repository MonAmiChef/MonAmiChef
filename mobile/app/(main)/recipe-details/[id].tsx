/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/services/recipe.api';
import { useAuth } from '@/hooks/useAuth';
import {
  ChevronLeft,
  Ellipsis,
  Heart,
  Shapes,
  Timer,
  Users,
  Beef,
  Flame,
  Wheat,
  Droplet,
  Leaf,
  Check,
  Plus,
  Minus,
} from 'lucide-react-native';
import { savedRecipesApi } from '@/services/saved-recipes.api';
import Toast from 'react-native-toast-message';
import SavedRecipesOptionsSheet from '@/components/saved-recipes/SavedRecipesOptionsSheet';
import { useTranslation } from 'react-i18next';
import Drawer from 'expo-router/drawer';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import RecipeBG from '@/assets/images/recipe_bg.png';
import { ProgressiveBlurHeader } from '@/components/ui/ProgressiveBlurHeader';

const GlassCard = ({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: any }) => (
  <View
    className={`overflow-hidden rounded-[32px] border border-white/50 ${className}`}
    style={[{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 0,
    }, style]}
  >
    <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
    <View className="p-6">{children}</View>
  </View>
);

const SpecItem = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => {
  return (
    <Box className="flex-1 items-center justify-center py-2">
      <Box className="mb-1">{icon}</Box>
      <Text className="text-lg font-krub-bold text-slate-800">
        {value}
      </Text>
      <Text className="text-xs font-krub-medium text-slate-500 uppercase tracking-wider">
        {label}
      </Text>
    </Box>
  );
};

const MacroIconItem = ({
  icon,
  value,
  label,
  color,
  suffix = "",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  suffix?: string;
}) => (
  <Box className="flex-1 items-center">
    <Box className={`p-2.5 rounded-2xl mb-2 items-center justify-center ${color}`}>
      {icon}
    </Box>
    <Text className="text-lg font-krub-bold text-slate-800">
      {Math.round(value)}{suffix}
    </Text>
    <Text className="text-[10px] font-krub-semibold text-slate-400 uppercase tracking-widest">
      {label}
    </Text>
  </Box>
);

export default function RecipeDetailPage() {
  const {
    id,
    servings: servingsParam,
    isFavorite: isFavoriteParam,
  } = useLocalSearchParams();
  const [servings, setServings] = useState(
    servingsParam ? Number(servingsParam) : 1,
  );

  // Sync state if navigation params change
  React.useEffect(() => {
    if (servingsParam) {
      setServings(Number(servingsParam));
    }
  }, [servingsParam]);
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

  const progressStyle = useAnimatedStyle(() => {
    const total = data?.instructions?.length || 1;
    const current = completedSteps.length;
    const percentage = (current / total) * 100;
    
    return {
      width: withTiming(`${percentage}%`, {
        duration: 300,
      }),
    };
  }, [completedSteps.length, data?.instructions?.length]);

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
      <Box className="flex-1 justify-center items-center p-6 bg-[#fffdfb]">
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
    <View className="flex-1 bg-white">
      <Drawer.Screen options={{ 
        headerShown: false, // We'll build our own header
      }} />
      
      {/* Background Image */}
      <View style={StyleSheet.absoluteFill}>
        <Image 
          source={RecipeBG} 
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
        />
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        {/* Dark overlay for contrast */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
      </View>

      <Box style={StyleSheet.absoluteFill} pointerEvents="none">
        <ProgressiveBlurHeader />
      </Box>

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Custom Header */}
        <Box className="px-6 py-4 flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/60 items-center justify-center border border-white/40"
          >
            <ChevronLeft size={24} color="#1e293b" />
          </Pressable>
          
          <Box className="flex-row gap-3">
            {servingsParam && (
              <Pressable
                onPress={() => {
                  favoriteScale.value = withSpring(isFavorite ? 1 : 1.25, {
                    damping: 12,
                    stiffness: 200,
                  });
                  updateFavoriteMutation.mutate(!isFavorite);
                }}
                className={`w-10 h-10 rounded-full items-center justify-center border ${isFavorite ? 'bg-red-500/80 border-red-400' : 'bg-white/60 border-white/40'}`}
              >
                <Animated.View style={favoriteAnimatedStyle}>
                  <Heart
                    size={20}
                    color={isFavorite ? '#ffffff' : '#475569'}
                    fill={isFavorite ? '#ffffff' : 'none'}
                  />
                </Animated.View>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShowSheet(true)}
              className="w-10 h-10 rounded-full bg-white/60 items-center justify-center border border-white/40"
            >
              <Ellipsis size={20} color="#475569" />
            </Pressable>
          </Box>
        </Box>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title and Description */}
          <Box className="mt-8 mb-10 px-2">
            <Text 
              className="text-4xl font-krub-bold text-slate-900 leading-tight"
              style={{ 
                textShadowColor: 'rgba(0, 0, 0, 0.3)', 
                textShadowOffset: { width: 0, height: 1 }, 
                textShadowRadius: 4 
              }}
            >
              {data.name}
            </Text>
            {data.description && (
              <Text className="text-lg font-inter-medium text-slate-700 mt-5 leading-relaxed">
                {data.description}
              </Text>
            )}
          </Box>

          {/* Quick Stats Bar */}
          <GlassCard className="mb-6 py-2 px-1">
            <Box className="flex-row items-center">
              <SpecItem
                value={String(data.prepTimeMin ?? 0)}
                label="MINS"
                icon={<Timer size={22} color="#f97316" />}
              />
              <Box className="h-10 w-[1px] bg-slate-300/30" />
              <SpecItem
                value={data.difficulty ?? 'Easy'}
                label="LEVEL"
                icon={<Shapes size={22} color="#f97316" />}
              />
              <Box className="h-10 w-[1px] bg-slate-300/30" />
              {/* Interactive Servings Stepper */}
              <Box className="flex-1 items-center justify-center py-2">
                <Box className="mb-2">
                  <Users size={22} color="#f97316" />
                </Box>
                <Box className="flex-row items-center bg-slate-100/50 rounded-full px-2 py-1 border border-slate-200/30">
                  <Pressable 
                    onPress={() => setServings(Math.max(1, servings - 1))}
                    className="w-8 h-8 items-center justify-center rounded-full bg-white shadow-sm"
                  >
                    <Minus size={14} color="#f97316" strokeWidth={3} />
                  </Pressable>
                  
                  <Text className="mx-4 text-xl font-krub-bold text-slate-800 min-w-[20px] text-center">
                    {servings}
                  </Text>
                  
                  <Pressable 
                    onPress={() => setServings(servings + 1)}
                    className="w-8 h-8 items-center justify-center rounded-full bg-white shadow-sm"
                  >
                    <Plus size={14} color="#f97316" strokeWidth={3} />
                  </Pressable>
                </Box>
                <Text className="text-[10px] font-krub-medium text-slate-500 uppercase tracking-[0.15em] mt-1.5">
                  {t('recipe_details.people')}
                </Text>
              </Box>
            </Box>
          </GlassCard>

          <Box className="mb-8">
            <Box className="flex-row items-center mb-4 px-2">
              <Flame size={20} color="#f97316" fill="#f97316" />
              <Text className="text-xl font-krub-bold text-slate-900 ml-2">
                {t('recipe_details.macros')}
              </Text>
            </Box>
            
            <GlassCard>
              <Box className="flex-row justify-between">
                <MacroIconItem 
                  icon={<Flame size={20} color="#ffffff" />}
                  value={data.calories ?? 0}
                  label="Cals"
                  color="bg-red-500"
                />
                <MacroIconItem 
                  icon={<Beef size={20} color="#ffffff" />}
                  value={data.proteins ?? 0}
                  suffix="g"
                  label="Prot"
                  color="bg-blue-500"
                />
                <MacroIconItem 
                  icon={<Wheat size={20} color="#ffffff" />}
                  value={data.carbs ?? 0}
                  suffix="g"
                  label="Carbs"
                  color="bg-amber-500"
                />
                <MacroIconItem 
                  icon={<Droplet size={20} color="#ffffff" />}
                  value={data.fat ?? 0}
                  suffix="g"
                  label="Fats"
                  color="bg-emerald-500"
                />
                <MacroIconItem 
                  icon={<Leaf size={20} color="#ffffff" />}
                  value={data.fibers ?? 0}
                  suffix="g"
                  label="Fiber"
                  color="bg-purple-500"
                />
              </Box>
            </GlassCard>
          </Box>

          {/* Ingredients Section */}
          <Box className="mb-8">
            <Box className="flex-row items-center mb-4 px-2">
              <Box className="w-8 h-8 rounded-lg bg-orange-100 items-center justify-center">
                <Text className="text-orange-600 text-lg font-krub-bold">🍴</Text>
              </Box>
              <Text className="text-xl font-krub-bold text-slate-900 ml-3">
                {t('recipe_details.ingredients')}
              </Text>
            </Box>

            <GlassCard>
              <Box className="gap-1">
                {data.ingredients.map((ing: any, index: number) => {
                  const isIngredientCompleted = completedIngredients.includes(index);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleToggleIngredients(index)}
                      className={`flex-row items-center justify-between py-3.5 px-1 ${index < data.ingredients.length - 1 ? 'border-b border-slate-200/20' : ''}`}
                    >
                      <Box className="flex-1 flex-row items-center">
                        <Box className={`w-6 h-6 rounded-lg border-2 mr-4 items-center justify-center ${isIngredientCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                          {isIngredientCompleted && (
                            <Check size={14} color="#ffffff" strokeWidth={4} />
                          )}
                        </Box>
                        <Text
                          className={`text-lg font-inter-medium leading-tight ${isIngredientCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}
                        >
                          {ing.name}
                        </Text>
                      </Box>
                      <Text
                        className={`text-lg font-inter-bold ml-2 ${isIngredientCompleted ? 'text-green-500' : 'text-orange-600'}`}
                      >
                        {parseFloat((ing.quantity * servings).toFixed(2))} {ing.unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </Box>
            </GlassCard>
          </Box>

          {/* Instructions Section */}
          <Box className="mb-8">
            <Box className="flex-row items-center justify-between mb-4 px-2">
              <Box className="flex-row items-center">
                <Box className="w-8 h-8 rounded-lg bg-orange-100 items-center justify-center">
                  <Text className="text-orange-600 text-lg font-krub-bold">📝</Text>
                </Box>
                <Text className="text-xl font-krub-bold text-slate-900 ml-3">
                  {t('recipe_details.steps')}
                </Text>
              </Box>
              
              <Box className="bg-green-100/50 px-3 py-1 rounded-full border border-green-200">
                <Text className="text-[10px] font-krub-bold text-green-700 uppercase tracking-widest">
                  {completedSteps.length} / {data.instructions.length}
                </Text>
              </Box>
            </Box>

            {/* Step Progress Bar */}
            <Box className="h-2 w-full bg-slate-200/30 rounded-full mb-6 overflow-hidden border border-white/40">
              <Animated.View
                style={[
                  { height: '100%', backgroundColor: '#22c55e' },
                  progressStyle,
                ]}
              />
            </Box>

            <Box className="gap-4">
              {data.instructions.map((step: any, index: number) => {
                const isStepCompleted = completedSteps.includes(index);
                return (
                  <Pressable
                    key={index}
                    onPress={() => handleToggleStep(index)}
                  >
                    <GlassCard className={isStepCompleted ? 'opacity-70 bg-green-50/20' : ''}>
                      <Box className="flex-row items-center">
                        <Box
                          className={`h-8 w-8 rounded-full items-center justify-center mr-4 ${isStepCompleted ? 'bg-green-500' : 'bg-orange-500 shadow-sm'}`}
                        >
                          <Text className="text-sm font-krub-bold text-white">
                            {index + 1}
                          </Text>
                        </Box>
                        <Text
                          className={`flex-1 text-lg leading-relaxed font-inter-medium ${isStepCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}
                        >
                          {step}
                        </Text>
                        
                        {/* Ghost Icon Indicator */}
                        <Box className="ml-2">
                          <Check 
                            size={20} 
                            color={isStepCompleted ? '#22c55e' : '#cbd5e1'} 
                            strokeWidth={isStepCompleted ? 3 : 1.5}
                            style={{ opacity: isStepCompleted ? 1 : 0.3 }}
                          />
                        </Box>
                      </Box>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </Box>
          </Box>
        </ScrollView>
      </SafeAreaView>

      <SavedRecipesOptionsSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        handleDelete={handleDelete}
      />
    </View>
  );
}
