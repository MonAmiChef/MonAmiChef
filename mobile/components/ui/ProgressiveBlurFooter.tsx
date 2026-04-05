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
        colors={['transparent', 'black']}
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

export function ProgressiveBlurFooter() {
  if (Platform.OS === 'android') {
    // Stable version for Android
    return (
      <View style={{ height: 180, width: '100%', position: 'absolute', bottom: 0 }}>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)', 'black']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255, 253, 251, 0.9)' },
            ]}
          />
        </MaskedView>
      </View>
    );
  }

  // Premium Multi-Layered Blur (Standard for iOS)
  return (
    <View style={{ height: 200, width: '100%', position: 'absolute', bottom: 0 }}>
      {/* Layer 1: Soft base blur */}
      <BlurLayer
        intensity={30}
        startFade={0.0}
        endFade={0.5}
        overlayOpacity={0.05}
      />
      {/* Layer 2: Medium intensity */}
      <BlurLayer
        intensity={60}
        startFade={0.3}
        endFade={0.8}
        overlayOpacity={0.15}
      />
      {/* Layer 3: Maximum intensity at the very bottom */}
      <BlurLayer
        intensity={90}
        startFade={0.6}
        endFade={1.0}
        overlayOpacity={0.25}
      />
    </View>
  );
}
