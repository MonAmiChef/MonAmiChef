import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable, ScrollView, View } from 'react-native';
import { LogOut, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { PreferenceSection } from '@/components/profile/PreferenceSection';
import type {
  Aversion,
  DietRestriction,
  GoalType,
  IngredientRestriction,
} from '@/services/user-preferences.api';

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

  const [goal, setGoal] = useState<GoalType | null>(null);
  const [ingredientRestrictions, setIngredientRestrictions] = useState<
    IngredientRestriction[]
  >([]);
  const [dietRestrictions, setDietRestrictions] = useState<DietRestriction[]>(
    [],
  );
  const [aversions, setAversions] = useState<Aversion[]>([]);

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
    const next = ingredientRestrictions.includes(key as IngredientRestriction)
      ? ingredientRestrictions.filter((k) => k !== key)
      : [...ingredientRestrictions, key as IngredientRestriction];
    setIngredientRestrictions(next);
    upsert({ ingredientRestrictions: next });
  };

  const handleDietRestrictionToggle = (key: string) => {
    const next = dietRestrictions.includes(key as DietRestriction)
      ? dietRestrictions.filter((k) => k !== key)
      : [...dietRestrictions, key as DietRestriction];
    setDietRestrictions(next);
    upsert({ dietRestrictions: next });
  };

  const handleAversionToggle = (key: string) => {
    const next = aversions.includes(key as Aversion)
      ? aversions.filter((k) => k !== key)
      : [...aversions, key as Aversion];
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

  const isGuest = session?.user.is_anonymous;
  const initial = session?.user.email?.at(0)?.toLocaleUpperCase();

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="max-h-[90%] bg-white">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ScrollView
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Avatar */}
          <VStack className="items-center pt-4 pb-6 gap-2">
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isGuest ? '#94a3b8' : '#f97316',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isGuest ? '#94a3b8' : '#f97316',
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              {isGuest ? (
                <User size={32} color="white" />
              ) : (
                <Text className="text-white text-2xl font-inter-bold">
                  {initial}
                </Text>
              )}
            </View>
            <VStack className="items-center gap-0.5">
              <Text className="text-base font-inter-semibold text-slate-800">
                {isGuest
                  ? t('profile_action_sheet.guest')
                  : session?.user.email}
              </Text>
              {!isGuest && (
                <Text className="text-xs text-slate-400 font-inter-regular">
                  {t('monamichef')}
                </Text>
              )}
            </VStack>
          </VStack>

          {/* Guest CTA */}
          {isGuest && (
            <VStack className="mx-4 mb-4 gap-3 bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <Text className="text-sm text-slate-600 font-inter-regular text-center leading-5">
                {t('profile_action_sheet.guest_upsell')}
              </Text>
              <HStack className="gap-2">
                <Link asChild href="/(auth)/login">
                  <Pressable
                    onPress={onClose}
                    className="p-3 bg-orange-500 flex-1 items-center rounded-xl"
                  >
                    <Text className="font-inter-semibold text-white text-sm">
                      {t('auth.login')}
                    </Text>
                  </Pressable>
                </Link>
                <Link asChild href="/(auth)/register">
                  <Pressable
                    onPress={onClose}
                    className="p-3 bg-white border border-slate-200 flex-1 items-center rounded-xl"
                  >
                    <Text className="font-inter-semibold text-slate-600 text-sm">
                      {t('auth.register')}
                    </Text>
                  </Pressable>
                </Link>
              </HStack>
            </VStack>
          )}

          <VStack className="px-2 gap-5">
            {/* Language */}
            <VStack className="gap-3 bg-slate-50 rounded-2xl p-4">
              <Text className="text-xs font-inter-bold text-slate-400 uppercase tracking-widest">
                {t('language')}
              </Text>
              <HStack className="gap-2">
                {['fr', 'en'].map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => handleLanguageChange(lang)}
                    className={`flex-1 py-2.5 rounded-xl border items-center ${
                      i18n.language === lang
                        ? 'bg-white border-orange-400'
                        : 'bg-transparent border-transparent'
                    }`}
                  >
                    <Text
                      className={`font-inter-medium text-sm ${
                        i18n.language === lang
                          ? 'text-orange-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {lang === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* Preferences — authenticated only */}
            {!isGuest && (
              <>
                {/* Goal */}
                <VStack className="gap-3 bg-slate-50 rounded-2xl p-4">
                  <PreferenceSection
                    title={t('profile.goals.title')}
                    items={goalItems}
                    selected={goal ? [goal] : []}
                    onToggle={handleGoalToggle}
                    limit={1}
                  />
                  {activeGoalNote && (
                    <Text className="text-xs italic text-slate-400 leading-4">
                      {activeGoalNote}
                    </Text>
                  )}
                </VStack>

                {/* Dietary Restrictions */}
                <VStack className="gap-3 bg-slate-50 rounded-2xl p-4">
                  <Text className="text-xs font-inter-bold text-slate-400 uppercase tracking-widest">
                    {t('profile.restrictions.title')}
                  </Text>
                  <View className="h-px bg-slate-200" />
                  <PreferenceSection
                    title=""
                    subLabel={t('profile.restrictions.ingredients')}
                    items={ingredientItems}
                    selected={ingredientRestrictions}
                    onToggle={handleIngredientRestrictionToggle}
                  />
                  <View className="h-px bg-slate-200" />
                  <PreferenceSection
                    title=""
                    subLabel={t('profile.restrictions.diets')}
                    items={dietItems}
                    selected={dietRestrictions}
                    onToggle={handleDietRestrictionToggle}
                  />
                </VStack>

                {/* Aversions */}
                <VStack className="gap-3 bg-slate-50 rounded-2xl p-4">
                  <PreferenceSection
                    title={t('profile.aversions.title')}
                    items={aversionItems}
                    selected={aversions}
                    onToggle={handleAversionToggle}
                  />
                </VStack>

                {/* Logout */}
                <Pressable
                  onPress={() => void handleLogOut()}
                  className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-3.5"
                >
                  <LogOut size={16} color="#ef4444" />
                  <Text className="text-red-500 font-inter-semibold text-sm">
                    {t('auth.logout')}
                  </Text>
                </Pressable>
              </>
            )}
          </VStack>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};
