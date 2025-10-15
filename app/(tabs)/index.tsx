import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';

const SCREEN_OPTIONS = {
  title: 'Carpool',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const travelOptions = [
  { label: 'To College', value: 'to-college' },
  { label: 'From College', value: 'from-college' },
];

const locationOptions = [
  { label: 'Airport', value: 'airport' },
  { label: 'Station', value: 'station' },
  { label: 'Custom', value: 'custom' },
];

const locationLayout = [['airport', 'station'], ['custom']];

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const [travelDirection, setTravelDirection] = React.useState('to-college');
  const [location, setLocation] = React.useState('airport');
  const [customLocation, setCustomLocation] = React.useState('');
  const [debouncedCustomLocation, setDebouncedCustomLocation] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomLocation(customLocation);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customLocation]);

  // You can now use `debouncedCustomLocation` to perform your search

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <View className="flex-1 px-8 pb-4 pt-24">
        <Text className="mb-4" variant="h3">
          I want to travel
        </Text>
        <ButtonGroup
          options={travelOptions}
          value={travelDirection}
          onValueChange={setTravelDirection}
        />

        <View className="my-8" />

        <Text className="mb-4" variant="h3">
          Select Location
        </Text>
        <ButtonGroup
          options={locationOptions}
          value={location}
          onValueChange={setLocation}
          layout={locationLayout}
        />
        {location === 'custom' && (
          <Input
            placeholder="Enter custom location"
            value={customLocation}
            onChangeText={setCustomLocation}
            className="mt-8"
          />
        )}
      </View>
    </>
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
