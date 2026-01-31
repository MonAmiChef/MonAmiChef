import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';

function CustomDrawerContent(props: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ padding: 16 }}>
      <Box className="p-5 border-b border-background-200">
        <Text className="text-xl font-bold">MonAmiChef</Text>
        <Text className="text-xs text-gray-500">Assistant Culinaire IA</Text>
      </Box>

      <Box className="p-5 border-t border-background-200">
        <Button
          size="sm"
          variant="outline"
          action="negative"
          onPress={handleLogout}
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
      screenOptions={{
        headerShown: true,
        headerTitle: 'MonAmiChef',
        drawerStyle: {
          width: '80%',
          backgroundColor: '#fff',
        },
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#000',
      }}
    >
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
