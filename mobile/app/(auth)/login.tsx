import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Blob from '@/assets/images/auth_bg.svg';
import { Image } from 'expo-image';
import Logo from '@/assets/images/monamichef_bg_less.png';
import { HStack } from '@/components/ui/hstack';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signInWithEmail } = useAuth();
  const { t } = useTranslation();

  return (
    <Box className="flex-1 bg-background-0 justify-center p-6">
      <Image
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={Blob}
        contentFit="fill"
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
        }}
      />
      <VStack space="xl" className="space-y-22 w-full mb-4 self-center">
        <Box className="items-center text-nowrap">
          <Image
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={Logo}
            contentFit="contain"
            style={{
              display: 'flex',
              width: 150,
              height: 150,
              marginBottom: -20,
            }}
          />
          <Text className="text-3xl font-inter-extrabold text-primary-500">
            {t('auth.welcome_back')}
          </Text>
        </Box>

        <VStack className="mt-8" space="md">
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
              placeholder={t('auth.password')}
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
            className="bg-orange-500 rounded-full"
          >
            {loading ? (
              <ButtonSpinner />
            ) : (
              <ButtonText>
                <Text className="text-white font-inter-bold">
                  {t('auth.login')}
                </Text>
              </ButtonText>
            )}
          </Button>
        </VStack>

        <VStack className="items-center gap-2">
          <HStack className="flex gap-x-2 items-center gap-2 justify-center align-middle">
            <Text className="font-inter-normal text-typography-500">
              {t('auth.no_account_yet')}
            </Text>
            <Link
              href="/(auth)/register"
              className="font-inter-medium text-typography-500 underline"
            >
              {t('auth.register')}
            </Link>
          </HStack>

          <Text className="font-inter-semibold text-typography-500">OR</Text>
          <Link
            href="/(main)"
            className="font-inter-medium text-typography-500 underline"
          >
            {t('auth.continue_as_guest')}
          </Link>
        </VStack>

        {/* <Text className="text-center text-xs text-typography-400 mt-4">
          En continuant, tu acceptes de cuisiner des trucs incroyables.
        </Text> */}
      </VStack>
    </Box>
  );
}
