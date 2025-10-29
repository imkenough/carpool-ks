import { Redirect, Tabs } from 'expo-router';
import { Home, Car, User, SunIcon, MoonStarIcon } from 'lucide-react-native';
import { DateProvider } from '@/lib/date-context';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from 'nativewind';
import loginStore from '@/utils/states/login-zus';
import { checkAuthStatus } from '@/utils/local-storage/islogin';




export default function TabLayout() {
  const { Log, isHydrated } = loginStore();

  // Wait for hydration
  if (!isHydrated) {
    return null; // Or a splash screen
  }

  if (!Log) {
    return <Redirect href="../auth/sign-in" />;
  }
  
  return (
    <DateProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: 'hsl(var(--background))' },
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ color }) => <Home color={color} />,
          }}
        />
        <Tabs.Screen
          name="rides"
          options={{
            title: 'Rides',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: 'hsl(var(--background))' },
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ color }) => <Car color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: 'hsl(var(--background))' },
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      </Tabs>
    </DateProvider>
  );
}

const THEME_ICONS = {
  dark: SunIcon,
  light: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
