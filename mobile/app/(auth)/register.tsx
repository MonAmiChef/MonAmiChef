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
import { z } from 'zod';
import { HStack } from '@/components/ui/hstack';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { loading, signUpWithEmail } = useAuth();
  const { t } = useTranslation();

  const registerSchema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwords_do_not_match'),
      path: ['confirmPassword'],
    });

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
        <Box className="items-center">
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
          <Box className="items-center">
            <Heading
              size="3xl"
              className="font-inter-extrabold text-wrap text-center text-primary-500"
            >
              {t('auth.welcome')}
            </Heading>
          </Box>
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
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Input>

          <Input variant="outline" size="md">
            <InputField
              placeholder={t('auth.confirm_password')}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setError(null);
              }}
              secureTextEntry
            />
          </Input>

          {error && (
            <Text className="text-red-500 font-inter-medium">{error}</Text>
          )}
        </VStack>

        <VStack space="sm">
          <Button
            onPress={() => {
              const result = registerSchema.safeParse({
                email,
                password,
                confirmPassword,
              });

              if (!result.success) {
                const issue = result.error.issues[0];

                let translationKey = 'auth.generic_error';

                switch (issue.code) {
                  case 'too_small':
                    translationKey = 'auth.too_short';
                    break;

                  case 'invalid_type':
                    translationKey = 'auth.invalid_field';
                    break;

                  case 'custom':
                    translationKey = issue.message;
                    break;
                }

                setError(t(translationKey));
                return;
              }

              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              signUpWithEmail(email, password);
            }}
            disabled={loading}
            className="bg-orange-500 rounded-full"
          >
            {loading ? (
              <ButtonSpinner />
            ) : (
              <ButtonText>
                <Text className="text-white font-inter-bold">
                  {t('auth.register')}
                </Text>
              </ButtonText>
            )}
          </Button>
        </VStack>

        <HStack className="flex gap-x-2 justify-center gap-2 items-center align-middle">
          <Text className="text-typography-500 font-inter-normal">
            {t('auth.already_signed')}
          </Text>
          <Link
            href="/(auth)/login"
            className="font-inter-medium text-typography-500 underline"
          >
            {t('auth.login')}
          </Link>
        </HStack>

        {/* <Text className="text-center text-xs text-typography-400 mt-4">
          En continuant, tu acceptes de cuisiner des trucs incroyables.
        </Text> */}
      </VStack>

      <Box className="mt-8 px-4">
        <Text className="text-center text-[10px] text-slate-600 leading-4">
          {t('auth.terms_1')}
          <Link href="/(auth)/terms" className="text-orange-500 underline">
            {t('auth.terms_2')}
          </Link>
          {t('auth.terms_3')}
          <Link href="/(auth)/privacy" className="text-orange-500 underline">
            {t('auth.terms_4')}
          </Link>
          {t('auth.terms_5')}
        </Text>
      </Box>
    </Box>
  );
}
