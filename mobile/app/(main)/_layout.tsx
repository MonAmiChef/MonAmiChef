import { Drawer } from 'expo-router/drawer';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import {
  User,
  Menu,
  MessageCirclePlus,
  ChevronRight,
} from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { chatApi } from '@/services/chat.api';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ActivityIndicator } from 'react-native';
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
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, gap: 20 }}
    >
      <Box className="flex px-4 py-3">
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

      <Box className="px-5 py-2">
        <Pressable
          onPress={() => router.push('/savedrecipes')}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            className={`text-lg font-inter-medium ${
              pathname === '/savedrecipes' ? 'text-orange-600' : 'text-slate-700'
            }`}
          >
            {t('drawer.saved_recipes')}
          </Text>
          <ChevronRight
            size={18}
            color={pathname === '/savedrecipes' ? '#ea580c' : '#475569'}
          />
        </Pressable>
      </Box>

      <Box className="px-5 py-2">
        <Pressable
          onPress={() => router.push('/groceries')}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            className={`text-lg font-inter-medium ${
              pathname === '/groceries' ? 'text-orange-600' : 'text-slate-700'
            }`}
          >
            {t('drawer.groceries')}
          </Text>
          <ChevronRight
            size={18}
            color={pathname === '/groceries' ? '#ea580c' : '#475569'}
          />
        </Pressable>
      </Box>

      <Box className="flex-1 py-1">
        <Box className="px-5 py-2 border-slate-100">
          <Text className="text-lg font-inter-medium text-slate-700">
            {t('drawer.chats')}
          </Text>
        </Box>
        {isLoading ? (
          <ActivityIndicator className="mt-4" />
        ) : sessions ? (
          sessions.map((chat, index) => {
            return (
              <Box key={index}>
                <Pressable
                  key={chat.id}
                  onPress={() => {
                    router.navigate(`/chat/${chat.id}`);
                  }}
                  className={`px-5 py-3`}
                >
                  <Text
                    numberOfLines={1}
                    className={`${pathname.split('/')[2] === chat.id ? 'bg-orange-100 border border-orange-300 rounded-lg text-orange-600' : 'text-slate-600'} px-5 py-3 font-inter-medium`}
                  >
                    {chat.title || 'Nouvelle discussion'}
                  </Text>
                </Pressable>
              </Box>
            );
          })
        ) : (
          <Box className="flex-1 justify-center items-center">
            <Text>{t('drawer.failed_retrieving_sessions')}</Text>
          </Box>
        )}
      </Box>
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const { session } = useAuth();
  const { t } = useTranslation();

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
            <Pressable
              onPress={() => {
                setShowProfile(true);
              }}
              style={{ marginRight: 15, zIndex: 10 }}
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
          ),
          drawerStyle: {
            width: '80%',
            backgroundColor: '#fffdfb',
          },
          headerTitleAlign: 'center',
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

        <Drawer.Screen
          name="savedrecipes"
          options={{
            drawerLabel: 'Saved Recipes',
            title: t('saved_recipes.title'),
          }}
        />

        <Drawer.Screen
          name="groceries"
          options={{
            drawerLabel: 'Groceries',
            title: t('groceries.title'),
          }}
        />

        <Drawer.Screen
          name="recipe-details"
          options={{
            drawerItemStyle: { display: 'none' },
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
