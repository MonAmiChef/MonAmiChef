import { Drawer } from 'expo-router/drawer';
import { Pressable } from 'react-native-gesture-handler';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { User, Menu } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { chatApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { session } = useAuth();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      if (!session) throw new Error('Session not found');
      const chats = await chatApi.getAllUserSessions(session);
      console.log('chasts', chats);
      return chats;
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <Box className="p-5 border-b border-slate-100">
        <Text className="text-xl font-bold">Mes Conversations</Text>
      </Box>

      <Box className="flex-1 mt-2">
        {isLoading ? (
          <ActivityIndicator className="mt-4" />
        ) : sessions && sessions.root ? (
          sessions.root.map((chat) => (
            <Pressable
              key={chat.id}
              onPress={() =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                props.navigation.navigate('chat/[id]', { id: chat.id })
              }
              className="px-5 py-3 active:bg-slate-100"
            >
              <Text numberOfLines={1} className="text-slate-700">
                {chat.title || 'Nouvelle discussion'}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text>Failed to retrieve sessions</Text>
        )}
      </Box>
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitle: 'MonAmiChef',
        overlayColor: 'rgba(0,0,0,0.5)',
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
        },
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 15 }}
          >
            <Menu size={26} color="#000" strokeWidth={2} />
          </Pressable>
        ),
        headerRight: () => (
          <Link href="/(main)" asChild>
            <Pressable style={{ marginRight: 15 }}>
              <User size={26} strokeWidth={2} />
            </Pressable>
          </Link>
        ),
        drawerStyle: {
          width: '80%',
          backgroundColor: '#fff',
        },
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: '#000',
      })}
    >
      <Drawer.Screen
        name="chat/index"
        options={{
          drawerLabel: 'Nouveau Chat',
          title: 'MonAmiChef',
        }}
      />
      <Drawer.Screen
        name="chat/[id]"
        options={{
          drawerLabel: 'Conversation',
          title: 'Chat',
        }}
      />
    </Drawer>
  );
}
