import { Drawer } from 'expo-router/drawer';
import { Pressable } from 'react-native-gesture-handler';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { User, Menu, Plus } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { chatApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDrawerContent(props: any) {
  const { session } = useAuth();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      if (!session) throw new Error('Session not found');
      const { chats } = await chatApi.getAllUserSessions(session);
      return chats;
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <Box className="px-4 py-3">
        <Pressable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          onPress={() => props.navigation.navigate('chat/index')}
          className="flex-row items-center justify-center bg-slate-900 p-3 rounded-xl active:opacity-80"
        >
          <Plus size={20} color="white" strokeWidth={2.5} />
          <Text className="font-semibold ml-2">Nouveau Chat</Text>
        </Pressable>
      </Box>

      <Box className="px-5 py-2 border-slate-100">
        <Text className="text-xl font-inter-medium text-black">Chats</Text>
      </Box>

      <Box className="flex-1 p-5 gap-y-4">
        {isLoading ? (
          <ActivityIndicator className="mt-4" />
        ) : sessions ? (
          sessions.map((chat) => (
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
