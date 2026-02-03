import React from 'react';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Center className="flex-1">
        <Text className="text-secondary-200">{t('not_found.screen')}</Text>
        <Link href="/" style={{ marginTop: 10 }}>
          <Text className="text-primary-500">{t('not_found.go_to_home')}</Text>
        </Link>
      </Center>
    </>
  );
}
