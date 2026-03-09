import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable, ScrollView } from 'react-native';
import { LogOut, User } from 'lucide-react-native';
import { Box } from '../ui/box';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { PreferenceSection } from '@/components/profile/PreferenceSection';
import type { GoalType } from '@/services/user-preferences.api';

export const ProfileActionSheet = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const { data: prefs, upsert } = useUserPreferences(session);

  // Local state for instant UI — avoids waiting on React Query refetch cycles
  const [goal, setGoal] = useState<string | null>(null);
  const [ingredientRestrictions, setIngredientRestrictions] = useState<string[]>([]);
  const [dietRestrictions, setDietRestrictions] = useState<string[]>([]);
  const [aversions, setAversions] = useState<string[]>([]);

  // Seed local state from server data whenever it changes
  useEffect(() => {
    if (prefs !== undefined) {
      setGoal(prefs?.goal ?? null);
      setIngredientRestrictions(prefs?.ingredientRestrictions ?? []);
      setDietRestrictions(prefs?.dietRestrictions ?? []);
      setAversions(prefs?.aversions ?? []);
    }
  }, [prefs]);

  const handleLanguageChange = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

  const handleLogOut = async () => {
    onClose();
    await supabase.auth.signOut();
    router.navigate('/(auth)/login');
  };

  const handleGoalToggle = (key: string) => {
    const newGoal = goal === key ? null : (key as GoalType);
    setGoal(newGoal);
    upsert({ goal: newGoal });
  };

  const handleIngredientRestrictionToggle = (key: string) => {
    const next = ingredientRestrictions.includes(key as never)
      ? ingredientRestrictions.filter((k) => k !== key)
      : [...ingredientRestrictions, key as never];
    setIngredientRestrictions(next);
    upsert({ ingredientRestrictions: next });
  };

  const handleDietRestrictionToggle = (key: string) => {
    const next = dietRestrictions.includes(key as never)
      ? dietRestrictions.filter((k) => k !== key)
      : [...dietRestrictions, key as never];
    setDietRestrictions(next);
    upsert({ dietRestrictions: next });
  };

  const handleAversionToggle = (key: string) => {
    const next = aversions.includes(key as never)
      ? aversions.filter((k) => k !== key)
      : [...aversions, key as never];
    setAversions(next);
    upsert({ aversions: next });
  };

  const goalItems = (['bulking', 'cutting', 'body_recomposition'] as const).map(
    (key) => ({ key, label: t(`profile.goals.${key}`) }),
  );

  const ingredientItems = (
    [
      'gluten_free',
      'dairy_free',
      'peanut_free',
      'tree_nut_free',
      'shellfish_free',
      'egg_free',
      'soy_free',
    ] as const
  ).map((key) => ({ key, label: t(`profile.restrictions.${key}`) }));

  const dietItems = (
    [
      'vegetarian',
      'vegan',
      'pescetarian',
      'keto',
      'paleo',
      'no_pork',
      'no_beef',
    ] as const
  ).map((key) => ({ key, label: t(`profile.restrictions.${key}`) }));

  const aversionItems = (
    [
      'no_cilantro',
      'no_onions',
      'no_garlic',
      'no_spicy_food',
      'no_mushrooms',
      'no_seafood',
    ] as const
  ).map((key) => ({ key, label: t(`profile.aversions.${key}`) }));

  const activeGoalNote = goal ? t(`profile.goals.note_${goal}`) : null;

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="max-h-[90%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ScrollView
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <VStack className="w-full p-4 gap-4" space="md">
            <VStack className="w-full bg items-center my-2  gap-4">
              <VStack className="gap-2 items-center">
                <Box className="bg-slate-500 h-16 w-16 items-center justify-center rounded-full">
                  {session?.user.is_anonymous ? (
                    <User size={35} color="white" />
                  ) : (
                    <Text className="text-white font-inter-bold">
                      {session?.user.email?.at(0)?.toLocaleUpperCase()}
                    </Text>
                  )}
                </Box>
                <Text className="text-xl font-inter-semibold">
                  {session?.user.is_anonymous
                    ? t('profile_action_sheet.guest')
                    : session?.user.email}
                </Text>
              </VStack>
              {session?.user.is_anonymous && (
                <VStack className="gap-3 w-full">
                  <Text className="text-sm text-slate-500 text-center font-inter-regular">
                    {t('profile_action_sheet.guest_upsell')}
                  </Text>
                  <HStack className="gap-2">
                    <Link asChild href="/(auth)/login">
                      <Pressable
                        onPress={onClose}
                        className={`p-3 bg-orange-500 flex-1 items-center rounded-lg`}
                      >
                        <Text className={`font-inter-medium text-white`}>
                          {t('auth.login')}
                        </Text>
                      </Pressable>
                    </Link>
                    <Link asChild href="/(auth)/register">
                      <Pressable
                        onPress={onClose}
                        className={`p-3 bg-slate-50 border-slate-600 flex-1 border items-center rounded-lg`}
                      >
                        <Text className={`text-slate-600 font-inter-medium`}>
                          {t('auth.register')}
                        </Text>
                      </Pressable>
                    </Link>
                  </HStack>
                </VStack>
              )}
            </VStack>

            <VStack className="gap-4">
              <Text className="text-sm font-bold font-inter-medium uppercase">
                {t('language')}
              </Text>

              <HStack className="gap-2">
                {['fr', 'en'].map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => handleLanguageChange(lang)}
                    className={`flex-1 p-3 rounded-lg border items-center ${
                      i18n.language === lang
                        ? 'bg-orange-50 border border-orange-500'
                        : 'bg-slate-50 border-outline-200'
                    }`}
                  >
                    <Text
                      className={`font-inter-medium ${i18n.language === lang ? 'text-orange-500' : 'text-slate-500'}`}
                    >
                      {lang === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {!session?.user.is_anonymous && (
              <>
                <VStack className="gap-3">
                  <PreferenceSection
                    title={t('profile.goals.title')}
                    items={goalItems}
                    selected={goal ? [goal] : []}
                    onToggle={handleGoalToggle}
                    limit={1}
                  />
                  {activeGoalNote && (
                    <Text className="text-xs italic text-slate-400">
                      {activeGoalNote}
                    </Text>
                  )}
                </VStack>

                <VStack className="gap-3">
                  <Text className="text-sm font-bold font-inter-medium uppercase">
                    {t('profile.restrictions.title')}
                  </Text>
                  <PreferenceSection
                    title=""
                    subLabel={t('profile.restrictions.ingredients')}
                    items={ingredientItems}
                    selected={ingredientRestrictions}
                    onToggle={handleIngredientRestrictionToggle}
                  />
                  <PreferenceSection
                    title=""
                    subLabel={t('profile.restrictions.diets')}
                    items={dietItems}
                    selected={dietRestrictions}
                    onToggle={handleDietRestrictionToggle}
                  />
                </VStack>

                <PreferenceSection
                  title={t('profile.aversions.title')}
                  items={aversionItems}
                  selected={aversions}
                  onToggle={handleAversionToggle}
                />
              </>
            )}

            {!session?.user.is_anonymous && (
              <ActionsheetItem
                onPress={() => void handleLogOut()}
                className="rounded-lg bg-red-600 mt-4 p-3"
              >
                <LogOut size={18} color="#fff" />
                <ActionsheetItemText className="text-white text-md font-inter-medium">
                  {t('auth.logout')}
                </ActionsheetItemText>
              </ActionsheetItem>
            )}
          </VStack>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};
