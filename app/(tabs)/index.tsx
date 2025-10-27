import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-native-date-picker';
import { useDate } from '@/lib/date-context';


const travelOptions = [
  { label: 'Going to College', value: 'to-college' },
  { label: 'Leaving College', value: 'from-college' },
];

const locationOptions = [
  { label: 'Airport', value: 'Airport' },
  { label: 'Station', value: 'Station' },
  { label: 'City', value: 'City' },
  { label: 'Custom', value: 'custom' },
];

const locationLayout = [['Airport', 'Station', 'City'], ['custom']];

export default function Screen() {
  const [destination, setDestination] = React.useState('to-college');
  const [location, setLocation] = React.useState('Airport');
  const [customLocation, setCustomLocation] = React.useState('');
  const [debouncedCustomLocation, setDebouncedCustomLocation] = React.useState('');
  const { date, setDate } = useDate();
  const router = useRouter();
  const [pickerState, setPickerState] = React.useState<'idle' | 'spinning'>('idle');
  const [minDate] = React.useState(new Date());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomLocation(customLocation);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customLocation]);




  const isPastDate = (date: Date): boolean => date < minDate;


  const locationTitle =
    destination === 'to-college' ? 'Where are you coming from?' : 'Where are you going to?';

  // Calculate the final location value
  const rideLocation = location === 'custom' ? debouncedCustomLocation.trim() : location;

  // Check if the picker is active
  const isPickerSpinning = pickerState !== 'idle';

  // Validate custom location input
  const isCustomLocationInvalid = location === 'custom' && rideLocation === '';

  // Combine disabled states for clarity
  const isFindDisabled = isPickerSpinning || isCustomLocationInvalid || isPastDate(date);

  return (
    <>
      <View className="flex-1 p-4">
        <Text className="mb-4" variant="h4">
          Create a Ride Request
        </Text>
        <ButtonGroup options={travelOptions} value={destination} onValueChange={setDestination} />

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

        {isPastDate(date) && <Text className='my-2' variant={'destructive'}>Can't find rides that are in the past</Text>}

        <View className="mb-4" />


        <Button
          disabled={isFindDisabled}
          onPress={() => {
            const finalDestination = destination === 'to-college' ? 'College' : rideLocation;
            const finalFrom = destination === 'to-college' ? rideLocation : 'College';
            router.push({
              pathname: '/rides',
              params: {
                date: date.toString(),
                travelDirection: finalDestination,
                location: finalFrom,
              },
            });
          }}>
          <Text>Find Rides</Text>
        </Button>

        <View className="h-4" />
      </View>
    </>
  );
}
