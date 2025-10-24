import * as React from 'react';
import { View, FlatList } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MyCard, CardParams } from '@/components/mycard';
import { useAllRides, useRides, useRidesByDate } from '@/utils/query/api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

type RideScreenParams = {
  travelDirection?: string;
  location?: string;
  date?: string;
};

const RidesListHeader = ({
  filtersApplied,
  date,
  onClearFilters,
}: {
  filtersApplied: boolean;
  date: Date;
  onClearFilters: () => void;
}) => {
  if (filtersApplied) {
    return (
      <View className="my-4 flex-row items-center justify-between">
        <Text className="shrink text-lg font-bold" accessible>
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

const ListFooter = () => <View className="h-[20px]" />;

const RideCardSkeleton = () => (
  <Card className="my-1.5 w-full max-w-sm">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <View className="flex flex-row items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="ml-2 h-4 w-1/2" />
      </View>
      <View className="mt-2 flex flex-row items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="ml-2 h-4 w-1/2" />
      </View>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

export default function RidesScreen() {
  const { travelDirection, location, date: dateString } = useLocalSearchParams<RideScreenParams>();

  const traveldate = React.useMemo(
    () => new Date(dateString || new Date()),
    [dateString]
  );

  const [filtersCleared, setFiltersCleared] = React.useState(false);

  const hasLocationFilters = !!travelDirection && !!location;
  const isDateFilterPresent = !!dateString;

  let queryResult;
  if (hasLocationFilters && !filtersCleared) {
    queryResult = useRides(travelDirection!, location!, traveldate);
  } else if (isDateFilterPresent && !filtersCleared) {
    queryResult = useRidesByDate(traveldate);
  } else {
    queryResult = useAllRides();
  }

  const { data: database, isLoading } = queryResult;

  useFocusEffect(
    React.useCallback(() => {
      setFiltersCleared(false);
    }, [])
  );

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

  const keyExtractor = React.useCallback((item: CardParams) => item.id.toString(), []);

  return (
    <View className="flex-1 px-4">
      <RidesListHeader
        filtersApplied={isDateFilterPresent && !filtersCleared}
        date={traveldate}
        onClearFilters={() => setFiltersCleared(true)}
      />
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <RideCardSkeleton />}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        />
      ) : (
        <FlatList
          data={database}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
}
