import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Image } from 'expo-image';
import { MotiView, MotiText } from 'moti';

interface OnboardingSlideProps {
  title: string;
  description: string;
  image: any;
  index: number;
}

export function OnboardingSlide({
  title,
  description,
  image,
  index,
}: OnboardingSlideProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width, flex: 1, alignItems: 'center', padding: 24, justifyContent: 'center' }}>
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 1000,
          delay: 100,
        }}
        style={{
          width: width * 0.8,
          height: width * 0.8,
          marginBottom: 48,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={image}
          contentFit="contain"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          cachePolicy="memory-disk"
        />
      </MotiView>

      <Box style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 400,
          }}
          className="text-[32px] font-inter-bold text-slate-900 text-center mb-5 tracking-tight leading-none"
        >
          {title}
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 800,
            delay: 600,
          }}
          className="text-lg font-inter-medium text-slate-500 text-center leading-relaxed"
          style={{ opacity: 0.8 }}
        >
          {description}
        </MotiText>
      </Box>
    </View>
  );
}
