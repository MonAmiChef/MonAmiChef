import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { useAuth } from '@/hooks/useAuth';
import { HStack } from '@/components/ui/hstack';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signInWithEmail } = useAuth();
  const { t } = useTranslation();

  return (
    <Box className="flex-1 bg-background-0 justify-center p-6">
      <VStack space="xl" className="w-full max-w-[400px] self-center">
        <Box className="items-center">
          <Heading size="3xl" className="text-primary-500">
            {t('auth.title')}
          </Heading>
          <Text className="text-typography-500">{t('auth.subtitle')}</Text>
        </Box>

        <VStack space="md">
          <Input variant="outline" size="md">
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </Input>

          <Input variant="outline" size="md">
            <InputField
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Input>
        </VStack>

        <VStack space="sm">
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onPress={() => signInWithEmail(email, password)}
            disabled={loading}
          >
            {loading ? (
              <ButtonSpinner />
            ) : (
              <ButtonText>{t('auth.login')}</ButtonText>
            )}
          </Button>
        </VStack>

        <HStack className="flex gap-x-2 justify-center align-middle">
          <Text className="text-typography-500">
            {t('auth.no_account_yet')}
          </Text>
          <Link
            href="/(auth)/register"
            className="text-typography-500 underline"
          >
            {t('login.create_account')}
          </Link>
        </HStack>

        {/* <Text className="text-center text-xs text-typography-400 mt-4">
          En continuant, tu acceptes de cuisiner des trucs incroyables.
        </Text> */}
      </VStack>
    </Box>
  );
}
