import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';

interface PaginationDotsProps {
  data: any[];
  scrollX: SharedValue<number>;
  width: number;
}

export function PaginationDots({ data, scrollX, width }: PaginationDotsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {data.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [10, 20, 10],
            Extrapolate.CLAMP,
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolate.CLAMP,
          );

          return {
            width: dotWidth,
            opacity,
          };
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[
              {
                height: 3,
                borderRadius: 2,
                backgroundColor: '#ff6900',
                marginHorizontal: 5,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
}
