import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  useWindowDimensions,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { PaginationDots } from '@/components/onboarding/PaginationDots';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { t } = useTranslation();
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const ONBOARDING_DATA = useMemo(
    () => [
      {
        id: 1,
        title: t('onboarding.slide1.title'),
        description: t('onboarding.slide1.description'),
        image: require('@/assets/images/undraw_chef_yoa7.svg'),
      },
      {
        id: 2,
        title: t('onboarding.slide2.title'),
        description: t('onboarding.slide2.description'),
        image: require('@/assets/images/onboarding_2.png'),
      },
      {
        id: 3,
        title: t('onboarding.slide3.title'),
        description: t('onboarding.slide3.description'),
        image: require('@/assets/images/undraw_groceries_4via.svg'),
      },
      {
        id: 4,
        title: t('onboarding.slide4.title'),
        description: t('onboarding.slide4.description'),
        image: require('@/assets/images/undraw_eating-pasta_96tb.svg'),
      },
    ],
    [t],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('HAS_SEEN_ONBOARDING', 'true');
    router.replace('/(main)');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#fafafa', '#f5f5f5']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Box className="flex-1">
            <Animated.FlatList
              ref={flatListRef}
              data={ONBOARDING_DATA}
              renderItem={({ item, index }) => (
                <OnboardingSlide {...item} index={index} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              bounces={false}
              keyExtractor={(item) => item.id.toString()}
              onScroll={onScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={16}
            />

            <Box className="px-12 pb-14">
              <PaginationDots
                data={ONBOARDING_DATA}
                scrollX={scrollX}
                width={width}
              />

              <Box className="flex-row items-center justify-between mt-14">
                <Pressable onPress={handleFinish}>
                  <Text className="text-slate-400 font-inter-semibold text-lg py-2">
                    {t('onboarding.skip')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleNext}
                  style={{
                    backgroundColor: '#111827', // Claude-style dark button
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 32,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text className="text-white font-inter-semibold text-lg">
                    {currentIndex === ONBOARDING_DATA.length - 1
                      ? t('onboarding.get_started')
                      : t('onboarding.next')}
                  </Text>
                </Pressable>
              </Box>
            </Box>
          </Box>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
