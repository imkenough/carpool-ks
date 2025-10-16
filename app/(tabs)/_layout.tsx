import { Tabs } from 'expo-router';
import { Home, Car, SunIcon, MoonStarIcon } from 'lucide-react-native';
import { DateProvider } from '@/lib/date-context';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  return (
    <DateProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Carpool',
            headerTransparent: true,
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ color }) => <Home color={color} />,
          }}
        />
        <Tabs.Screen
          name="rides"
          options={{
            title: 'Rides',
            headerTransparent: true,
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ color }) => <Car color={color} />,
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
