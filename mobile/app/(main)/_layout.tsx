import { Drawer } from 'expo-router/drawer';
import { Pressable } from 'react-native-gesture-handler';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Link, usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { User, Menu, MessageCirclePlus } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { chatApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileActionSheet } from '@/components/profile/ProfileActionSheet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDrawerContent(props: any) {
  const { session } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const { chats } = await chatApi.getAllUserSessions(session!);
      return chats;
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <Box className="flex px-4 py-3 mb-2">
        <Pressable
          onPress={() => {
            router.push({ pathname: '/', params: { openPreferences: 'true' } });
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingVertical: 8,
            borderRadius: 38,
            borderColor: '#ff6900',
            borderWidth: 2,
            borderStyle: 'dashed',
          }}
        >
          <MessageCirclePlus size={20} color="#ff6900" strokeWidth={2.5} />
          <Text className="text-lg text-orange-500 font-inter-bold ml-2">
            {t('drawer.new_chat')}
          </Text>
        </Pressable>
      </Box>

      <Box className="px-5 py-2 border-slate-100">
        <Text className="text-lg font-inter-medium text-black">
          {t('drawer.chats')}
        </Text>
      </Box>

      <Box className="flex-1 py-1">
        {isLoading ? (
          <ActivityIndicator className="mt-4" />
        ) : sessions ? (
          sessions.map((chat) => {
            return (
              <Pressable
                key={chat.id}
                onPress={() => {
                  router.navigate(`/chat/${chat.id}`);
                }}
                className={`px-5 py-3`}
              >
                <Text
                  numberOfLines={1}
                  className={`${pathname.split('/')[2] === chat.id ? 'bg-orange-600 rounded-full text-white' : 'text-slate-700'} px-5 py-3 font-inter-medium`}
                >
                  {chat.title || 'Nouvelle discussion'}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text>{t('drawer.failed_retrieving_sessions')}</Text>
        )}
      </Box>
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const { session } = useAuth();

  return (
    <>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerShown: true,
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
              <Pressable
                onPress={() => setShowProfile(true)}
                style={{ marginRight: 15 }}
              >
                <Box className="bg-slate-500 h-10 w-10 items-center justify-center rounded-full">
                  {session?.user.is_anonymous ? (
                    <User size={15} color="white" />
                  ) : (
                    <Text className="text-white font-inter-bold">
                      {session?.user.email?.at(0)?.toLocaleUpperCase()}
                    </Text>
                  )}
                </Box>
              </Pressable>
            </Link>
          ),
          drawerStyle: {
            width: '80%',
            backgroundColor: '#fffdfb',
          },
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#fffdfb',
            borderWidth: 0,
            boxShadow: 'none',
            height: 120,
          },
        })}
      >
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: 'Conversation',
            title: 'Chat',
          }}
        />
      </Drawer>
      <ProfileActionSheet
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
