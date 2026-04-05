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
  Heart,
  Calendar,
  ShoppingBag,
} from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { chatApi } from '@/services/chat.api';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileActionSheet } from '@/components/profile/ProfileActionSheet';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ProgressiveBlurHeader } from '@/components/ui/ProgressiveBlurHeader';

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

  const isActive = (path: string) => pathname.startsWith(path);

  const NavItem = ({
    path,
    label,
    icon: Icon,
  }: {
    path: string;
    label: string;
    icon: any;
  }) => {
    const active = isActive(path);
    return (
      <Box className="px-3 py-1">
        <Pressable
          onPress={() => router.push(path as any)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: active ? '#fff7ed' : 'transparent',
            borderRadius: 12,
            borderLeftWidth: active ? 4 : 0,
            borderLeftColor: '#f97316',
          }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon size={20} color={active ? '#f97316' : '#64748b'} />
            <Text
              className={`text-[16px] font-inter-${active ? 'semibold' : 'medium'} ${
                active ? 'text-orange-600' : 'text-slate-600'
              }`}
            >
              {label}
            </Text>
          </Box>
          <ChevronRight
            size={16}
            color={active ? '#f97316' : '#cbd5e1'}
            strokeWidth={2}
          />
        </Pressable>
      </Box>
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <Box className="px-6 py-6 pt-8">
        <Pressable
          onPress={() => {
            router.push({ pathname: '/', params: { openPreferences: 'true' } });
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingVertical: 14,
            backgroundColor: '#ff6900',
            borderRadius: 16,
            shadowColor: '#ff6900',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MessageCirclePlus size={20} color="white" strokeWidth={2.5} />
          <Text className="text-lg text-white font-inter-bold">
            {t('drawer.new_chat')}
          </Text>
        </Pressable>
      </Box>

      <Box className="mt-2">
        <NavItem
          path="/recipes/saved"
          label={t('drawer.saved_recipes')}
          icon={Heart}
        />
        <NavItem
          path="/meal-plan"
          label={t('drawer.meal_plan')}
          icon={Calendar}
        />
        <NavItem
          path="/groceries"
          label={t('drawer.groceries')}
          icon={ShoppingBag}
        />
      </Box>

      <Box className="flex-1 mt-8">
        <Box className="px-7 py-3">
          <Text className="text-xs font-inter-bold text-slate-400 uppercase tracking-widest">
            {t('drawer.recent_chats')}
          </Text>
        </Box>
        <Box className="px-3">
          {isLoading ? (
            <ActivityIndicator className="mt-4" color="#f97316" />
          ) : sessions ? (
            [...sessions]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              )
              .map((chat, index) => {
                const active = pathname.split('/')[2] === chat.id;

                return (
                  <Pressable
                    key={chat.id || index}
                    onPress={() => {
                      router.navigate(`/chat/${chat.id}` as any);
                    }}
                    style={{
                      flexDirection: 'column',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor: active ? '#fff7ed' : 'transparent',
                      borderRadius: 12,
                      marginBottom: 4,
                      gap: 4,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-[14px] font-inter-${active ? 'semibold' : 'medium'} ${
                        active ? 'text-orange-600' : 'text-slate-600'
                      }`}
                    >
                      {chat.title || 'Nouvelle discussion'}
                    </Text>
                    {chat.preferences && chat.preferences.length > 0 && (
                      <Text
                        numberOfLines={1}
                        className="text-[12px] text-slate-400 font-inter-medium"
                      >
                        {(chat.preferences || [])
                          .slice(0, 2)
                          .map((tag: any) => t(`preferences.tags.${tag}`))
                          .join(', ') +
                          ((chat.preferences || []).length > 2
                            ? ` +${(chat.preferences || []).length - 2}`
                            : '')}
                      </Text>
                    )}
                  </Pressable>
                );
              })
          ) : (
            <Box className="flex-1 justify-center items-center py-10">
              <Text className="text-slate-400 italic">
                {t('drawer.failed_retrieving_sessions')}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const { session } = useAuth();
  const { t } = useTranslation();

  usePushNotifications();

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
            borderWidth: 0,
            height: 115, // Compacted slightly from 130
          },
        })}
      >
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: t('drawer.chats'),
            headerTitle: () => (
              <Box className="flex-row items-center gap-2">
                <Text className="text-xl font-inter-bold text-slate-900">
                  MonAmiChef
                </Text>
              </Box>
            ),
            headerTransparent: true,
            headerBackground: () => <ProgressiveBlurHeader />,
          }}
        />

        <Drawer.Screen
          name="recipes"
          options={{
            drawerLabel: t('drawer.saved_recipes'),
            title: t('saved_recipes.title'),
          }}
        />

        <Drawer.Screen
          name="groceries"
          options={{
            drawerLabel: t('drawer.groceries'),
            title: t('groceries.title'),
          }}
        />

        <Drawer.Screen
          name="meal-plan"
          options={{
            drawerLabel: t('drawer.meal_plan'),
            title: t('meal_plan.title'),
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
