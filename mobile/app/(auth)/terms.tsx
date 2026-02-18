/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { Box } from '@/components/ui/box';
import { ScrollView, Pressable, Button } from 'react-native';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { HStack } from '@/components/ui/hstack';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6">
        {/* Header Section */}
        <HStack className="justify-between">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center py-4"
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text className="ml-2 text-slate-500 font-inter-medium">
              {t('back')}
            </Text>
          </Pressable>

          <Menu
            placement="top"
            trigger={({ ...triggerProps }) => {
              return (
                <Button
                  title={i18n.language === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
                  {...triggerProps}
                />
              );
            }}
          >
            <MenuItem
              key="fr"
              textValue="Français"
              onPress={() => handleLanguageChange('fr')}
            >
              <HStack space="sm" items-center>
                <Text>🇫🇷</Text>
                <MenuItemLabel>Français</MenuItemLabel>
              </HStack>
            </MenuItem>
            <MenuItem
              key="en"
              textValue="English"
              onPress={() => handleLanguageChange('en')}
            >
              <HStack space="sm" items-center>
                <Text>🇺🇸</Text>
                <MenuItemLabel>English</MenuItemLabel>
              </HStack>
            </MenuItem>
          </Menu>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Heading size="2xl" className="font-inter-bold text-slate-900 mb-2">
            {t('auth.terms_2')}
          </Heading>
          <Text className="text-slate-400 text-sm mb-8">
            {t('auth.terms_last_updated')}
          </Text>

          <Box className="flex gap-4 mb-10">
            {/* Section 1 */}
            <Box>
              <Heading
                size="md"
                className="font-inter-semibold text-slate-800 mb-2"
              >
                {t('auth.terms_clauses.clause_1')}
              </Heading>
              <Text className="text-slate-600 leading-6 font-inter-normal">
                {t('auth.terms_clauses.clause_1_text')}
              </Text>
            </Box>

            {/* Section 2 - THE PROTEIN/MACRO CLAUSE */}
            <Box>
              <Heading
                size="md"
                className="font-inter-semibold text-slate-800 mb-2"
              >
                {t('auth.terms_clauses.clause_2')}
              </Heading>
              <Text className="text-slate-600 leading-6 font-inter-normal">
                {t('auth.terms_clauses.clause_2_text')}
              </Text>
            </Box>

            {/* Section 3 */}
            <Box>
              <Heading
                size="md"
                className="font-inter-semibold text-slate-800 mb-2"
              >
                {t('auth.terms_clauses.clause_3')}
              </Heading>
              <Text className="text-slate-600 leading-6 font-inter-normal">
                {t('auth.terms_clauses.clause_3_text')}
              </Text>
            </Box>

            {/* Section 4 */}
            <Box>
              <Heading
                size="md"
                className="font-inter-semibold text-slate-800 mb-2"
              >
                {t('auth.terms_clauses.clause_4')}
              </Heading>
              <Text className="text-slate-600 leading-6 font-inter-normal">
                {t('auth.terms_clauses.clause_4_text')}
              </Text>
            </Box>

            {/* Section 5 */}
            <Box>
              <Heading
                size="md"
                className="font-inter-semibold text-slate-800 mb-2"
              >
                {t('auth.terms_clauses.clause_5')}
              </Heading>
              <Text className="text-slate-600 leading-6 font-inter-normal">
                {t('auth.terms_clauses.clause_5_text')}
              </Text>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
