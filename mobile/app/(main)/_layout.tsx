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

function CustomDrawerContent(props: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <Box className="p-5 border-b border-background-200">
        <Text className="text-xl font-inter-bold">MonAmiChef</Text>
        <Text className="text-xs text-gray-500">Assistant Culinaire IA</Text>
      </Box>

      {/* ICI : Affiche les écrans définis dans le Drawer (Nouveau Chat) */}
      <Box className="flex-1 mt-4">
        <DrawerItemList {...props} />
      </Box>

      <Box className="p-5 border-t border-background-200">
        <Button
          size="sm"
          variant="outline"
          action="negative"
          onPress={() => void handleLogout()}
        >
          <ButtonText>Déconnexion</ButtonText>
        </Button>
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
        headerStatusBarHeight: 70,
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
