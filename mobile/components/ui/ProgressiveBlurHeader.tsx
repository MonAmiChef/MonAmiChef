import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface BlurLayerProps {
  intensity: number;
  startFade: number; // 0 to 1
  endFade: number; // 0 to 1
  overlayOpacity: number;
}

const BlurLayer = ({
  intensity,
  startFade,
  endFade,
  overlayOpacity,
}: BlurLayerProps) => (
  <MaskedView
    style={StyleSheet.absoluteFill}
    maskElement={
      <LinearGradient
        colors={['black', 'transparent']}
        locations={[startFade, endFade]}
        style={StyleSheet.absoluteFill}
      />
    }
  >
    <BlurView
      intensity={intensity}
      tint="light"
      style={StyleSheet.absoluteFill}
    />
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: `rgba(255, 253, 251, ${overlayOpacity})` },
      ]}
    />
  </MaskedView>
);

export function ProgressiveBlurHeader() {
  if (Platform.OS === 'android') {
    // 100% Stable Version for Android Expo Go
    return (
      <View style={StyleSheet.absoluteFill}>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={['black', 'rgba(0,0,0,0.95)', 'transparent']}
              locations={[0, 0.7, 1]}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255, 253, 251, 0.99)' },
            ]}
          />
        </MaskedView>
      </View>
    );
  }

  // Premium Multi-Layered Blur (Standard for iOS)
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Layer 1: Base blur - full height */}
      <BlurLayer
        intensity={50}
        startFade={0.7}
        endFade={1.0}
        overlayOpacity={0.15}
      />
      {/* Layer 2: Medium-High intensity */}
      <BlurLayer
        intensity={80}
        startFade={0.5}
        endFade={0.9}
        overlayOpacity={0.25}
      />
      {/* Layer 3: High intensity */}
      <BlurLayer
        intensity={100}
        startFade={0.3}
        endFade={0.7}
        overlayOpacity={0.35}
      />
      {/* Layer 4: Maximum intensity at the very top */}
      <BlurLayer
        intensity={100}
        startFade={0.0}
        endFade={0.5}
        overlayOpacity={0.5}
      />
    </View>
  );
}
