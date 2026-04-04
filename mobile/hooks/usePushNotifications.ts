import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationsApi } from '@/services/notifications.api';
import { useAuth } from '@/hooks/useAuth';
import Constants from 'expo-constants';

export function usePushNotifications() {
  const { session } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Android Expo Go doesn't support remote notifications (SDK 53/54+)
    // and throws a fatal native error when calling notification methods.
    if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
      console.warn('Push notifications are not supported in Expo Go on Android. Skipping.');
      return;
    }

    if (!session) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        notificationsApi.registerPushToken(session, token).catch((err) => {
          console.error('Failed to register push token with backend:', err);
        });
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
      // You can handle navigation here based on the notification data
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [session]);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.error('Project ID not found in expo config');
      return;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      return token;
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }
}
