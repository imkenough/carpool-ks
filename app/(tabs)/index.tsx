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
import { usePostRide } from '@/utils/query/api';

const travelOptions = [
  { label: 'Going to College', value: 'to-college' },
  { label: 'Leaving College', value: 'from-college' },
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
  const { mutate: postRide, isPending } = usePostRide();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomLocation(customLocation);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customLocation]);

  const locationTitle =
    travelDirection === 'to-college' ? 'Where are you coming from?' : 'Where are you going to?';

  return (
    <>
      <View className="flex-1 p-4">
        <Text className="mb-4" variant="h4">
          Create a Ride Request
        </Text>
        <ButtonGroup
          options={travelOptions}
          value={travelDirection}
          onValueChange={setTravelDirection}
        />

        <View className="my-4" />

        <Text className="mb-4" variant="h4">
          {locationTitle}
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

        <Text className="mb-4" variant="h4">
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
              const rideLocation = location === 'custom' ? debouncedCustomLocation : location;
              router.push({
                pathname: '/rides',
                params: { travelDirection, location: rideLocation },
              });
            }}>
            <Text>Find Rides</Text>
          </Button>
        ) : (
          <Button disabled>
            <Text>Find Rides</Text>
          </Button>
        )}
        <View className='h-4'/>
        <Button
            onPress={() => {postRide({ name: 'kenny', destination: travelDirection, from: location });}}>
            <Text>Post Rides </Text>
          </Button>
      </View>
    </>
  );
}
