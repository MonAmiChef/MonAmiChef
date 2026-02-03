import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiText } from 'moti';

interface WaveTextProps {
  text: string;
  fontSize?: number;
  color?: string;
}

export const WaveText = ({
  text,
  fontSize = 16,
  color = '#666',
}: WaveTextProps) => {
  const letters = text.split('');

  return (
    <View style={styles.container}>
      {letters.map((letter, index) => (
        <MotiText
          key={`${letter}-${index}`}
          from={{ translateY: 0 }}
          animate={{ translateY: -6 }}
          transition={{
            type: 'timing',
            duration: 700,
            loop: true,
            repeatReverse: true,
            delay: index * 50,
          }}
          style={{
            fontSize,
            color,
            fontWeight: '500',
            fontFamily: 'Inter_600SemiBold',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </MotiText>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
