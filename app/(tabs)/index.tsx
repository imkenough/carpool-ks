import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Loader2 } from 'lucide-react-native';
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
  const [travelDirection, setTravelDirection] = React.useState('to-college');
  const [location, setLocation] = React.useState('airport');
  const [customLocation, setCustomLocation] = React.useState('');
  const [debouncedCustomLocation, setDebouncedCustomLocation] = React.useState('');
  const { date, setDate } = useDate();
  const router = useRouter();
  const [pickerState, setPickerState] = React.useState<'idle' | 'spinning'>('idle');
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

  // Calculate the final location value
  const rideLocation = location === 'custom' ? debouncedCustomLocation.trim() : location;

  // Check if the picker is active
  const isPickerSpinning = pickerState !== 'idle';

  // Validate custom location input
  const isCustomLocationInvalid = location === 'custom' && rideLocation === '';

  // Combine disabled states for clarity
  const isFindDisabled = isPickerSpinning || isCustomLocationInvalid;
  const isPostDisabled = isPickerSpinning || isCustomLocationInvalid || isPending;

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

        <View className="my-2" />

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
        {/* This wrapper centers the date picker */}
        <View className="items-center">
          <DatePicker
            date={date}
            onDateChange={setDate}
            mode="datetime"
            minuteInterval={15}
            onStateChange={(val) => setPickerState(val)}
          />
        </View>

        <View className="mb-4" />

        <Button
          disabled={isFindDisabled}
          onPress={() => {
            router.push({
              pathname: '/rides',
              params: { travelDirection, location: rideLocation },
            });
          }}>
          <Text>Find Rides</Text>
        </Button>

        <View className="h-4" />

        <Button
          disabled={isPostDisabled}
          onPress={() => {
            console.log(date);
            postRide({
              name: 'haaaa', // TODO: Replace hardcoded name
              destination: travelDirection,
              from: rideLocation,
              date: date,
            });
          }}>
          {isPending ? (
            <Loader2 className="animate-spin text-foreground" />
          ) : (
            <Text>Post Ride</Text>
          )}
        </Button>
      </View>
    </>
  );
}
