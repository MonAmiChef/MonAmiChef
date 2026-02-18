import React from 'react';
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
import { Pressable } from 'react-native';
import { LogOut, User } from 'lucide-react-native';
import { Box } from '../ui/box';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'expo-router';
import { supabase } from '@/services/supabase';

export const ProfileActionSheet = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();

  const handleLanguageChange = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

  const handleLogOut = async () => {
    onClose();
    await supabase.auth.signOut();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

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
      </ActionsheetContent>
    </Actionsheet>
  );
};
