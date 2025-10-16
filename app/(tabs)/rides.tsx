import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { CardParams, MyCard } from '@/components/mycard';
import { FlatList } from 'react-native';
import { useDate } from '@/lib/date-context';
import * as React from 'react';
import { Button } from '@/components/ui/button';

import { getFakeCardData } from '@/lib/fake-card-data';

export default function RidesScreen() {
  const { travelDirection, location } = useLocalSearchParams() as {
    travelDirection: string;
    location: string;
  };
  const { date } = useDate();

  const [filtersCleared, setFiltersCleared] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setFiltersCleared(false);
    }, [])
  );

  const safeLocation = location || '';

  const from =
    travelDirection === 'to-college'
      ? safeLocation.charAt(0).toUpperCase() + safeLocation.slice(1)
      : 'College';
  const destination =
    travelDirection === 'to-college'
      ? 'College'
      : safeLocation.charAt(0).toUpperCase() + safeLocation.slice(1);

  const allRides = getFakeCardData();
  ``;
  const cardData = React.useMemo(() => {
    if (filtersCleared) {
      return allRides;
    }
    const filteredRides = allRides.filter((ride) => {
      const timeDiff = Math.abs(ride.date.getTime() - date.getTime());
      const oneHour = 3600 * 1000;
      return ride.from === from && ride.destination === destination && timeDiff <= oneHour;
    });
    return filteredRides;
  }, [filtersCleared, allRides, from, destination, date]);

  return (
    <View className="flex-1 px-4">
      {filtersCleared ? (
        <Text className="my-4 text-lg font-bold">Showing all rides</Text>
      ) : (
        <View className="my-4 flex-row items-center justify-between">
          <Text className="shrink text-lg font-bold">
            Displaying rides on {date.toLocaleDateString()} around {date.toLocaleTimeString()}
          </Text>
          <Button onPress={() => setFiltersCleared(true)} variant="outline">
            <Text>Clear</Text>
          </Button>
        </View>
      )}
      <View>
        <FlatList
          data={cardData}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              <MyCard
                id={item.id}
                name={item.name}
                destination={item.destination}
                date={item.date}
                from={item.from}
              />
            );
          }}
        />
      </View>
    </View>
  );
}
