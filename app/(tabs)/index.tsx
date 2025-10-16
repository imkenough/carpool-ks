import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Loader2, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-native-date-picker';
import { useDate } from '@/lib/date-context';

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
  const { date, setDate } = useDate();
  const router = useRouter();
  const [disable, setDisable] = React.useState<'idle' | 'spinning'>('idle');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomLocation(customLocation);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customLocation]);

  return (
    <>
      <View className="flex-1 px-8 pb-4 pt-24">
        <Text className="mb-4" variant="h3">
          I want to travel
        </Text>
        <ButtonGroup
          options={travelOptions}
          value={travelDirection}
          onValueChange={setTravelDirection}
        />

        <View className="my-4" />

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

        <View className="my-4" />

        <Text className="mb-4" variant="h3">
          Select Date & Time
        </Text>
        <DatePicker
          date={date}
          onDateChange={setDate}
          mode="datetime"
          minuteInterval={15}
          onStateChange={(val) => setDisable(val)}
        />

        <View className="my-4" />
        {disable === 'idle' ? (
          <Button
            onPress={() => {
              router.push({
                pathname: '/rides',
                params: { travelDirection, location },
              });
            }}>
            <Text>Confirm</Text>
          </Button>
        ) : (
          <Button disabled>
            <Text>Confirm</Text>
          </Button>
        )}
      </View>
    </>
  );
}
