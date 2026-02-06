import { PreferenceActionSheet } from '@/components/chat/PreferenceActionSheet';
import { Slot } from 'expo-router';
import { useState } from 'react';

export default function ChatLayout() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <>
      <Slot />
      <PreferenceActionSheet
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}
