import * as React from 'react';
import { View, FlatList } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MyCard, CardParams } from '@/components/mycard'; // Assuming CardParams defines the shape of a ride item
// import { useDate } from '@/lib/date-context'; // No longer used, date comes from params
import { useAllRides, useRides } from '@/utils/query/api';

// Define types for your screen parameters for better type-safety
type RideScreenParams = {
  travelDirection?: string;
  location?: string;
  date?: string; // Date comes as a string from URL params
};

/**
 * A dedicated header component for cleaner logic in the main screen.
 */
const RidesListHeader = ({
  filtersApplied,
  date,
  onClearFilters,
}: {
  filtersApplied: boolean;
  date: Date; // This component correctly receives a Date object
  onClearFilters: () => void;
}) => {
  if (filtersApplied) {
    return (
      <View className="my-4 flex-row items-center justify-between">
        <Text className="shrink text-lg font-bold" accessible>
          {/* Check if date is valid before trying to format it */}
          Displaying rides on {date.toLocaleDateString()}
        </Text>
        <Button onPress={onClearFilters} variant="outline">
          <Text>Clear</Text>
        </Button>
      </View>
    );
  }

  return <Text className="my-4 text-lg font-bold">Showing all rides</Text>;
};

/**
 * A simple spacer component for the list footer.
 */
const ListFooter = () => <View className="h-[20px]" />;

/**
 * Main screen component for displaying rides.
 */
export default function RidesScreen() {
  const { travelDirection, location, date: dateString } = useLocalSearchParams<RideScreenParams>();

  // Safely create the date object.
  // If dateString is not provided in the URL, default to the current date.
  // new Date(undefined) or new Date('') results in "Invalid Date".
  // This logic ensures 'traveldate' is always a valid Date.
  const traveldate = React.useMemo(
    () => new Date(dateString || new Date()),
    [dateString]
  );

  const [filtersCleared, setFiltersCleared] = React.useState(false);

  // Determine if filter parameters were actually provided
  const hasFilterParams = !!travelDirection && !!location && !!dateString;

  // Filters are considered active only if params exist AND the user hasn't cleared them
  const filtersApplied = hasFilterParams && !filtersCleared;

  // Fetch data based on whether filters are currently active
  const { data: database } = filtersApplied
    ? useRides(travelDirection!, location!, traveldate) // Use filtered hook
    : useAllRides(); // Use general hook

  // Reset the 'cleared' state every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setFiltersCleared(false);
    }, [])
  );

  // Memoize the renderItem function for FlatList performance
  const renderItem = React.useCallback(
    ({ item }: { item: CardParams }) => (
      <MyCard
        id={item.id}
        name={item.name}
        destination={item.destination}
        date={item.date}
        from={item.from}
      />
    ),
    []
  );

  // Memoize the keyExtractor function for FlatList performance
  const keyExtractor = React.useCallback((item: CardParams) => item.id.toString(), []);

  return (
    <View className="flex-1 px-4">
      <RidesListHeader
        filtersApplied={filtersApplied}
        date={traveldate} // 'traveldate' is guaranteed to be a valid Date
        onClearFilters={() => setFiltersCleared(true)}
      />
      <FlatList
        data={database}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        // Use ListFooterComponent for bottom spacing instead of an extra View
        ListFooterComponent={ListFooter}
      />
    </View>
  );
}
