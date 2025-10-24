import * as React from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MyCard, CardParams } from '@/components/mycard';
import { useAllRides, usePostRide, useRides } from '@/utils/query/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react-native';

/* -------------------- TYPES -------------------- */
type RideScreenParams = {
  travelDirection?: string;
  location?: string;
  date?: string;
};

/* -------------------- HEADER -------------------- */
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

/* -------------------- SKELETON -------------------- */
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

/* -------------------- POST rednder UI-------------------- */
const PostRideUi = ({
  travelDirection,
  location,
  traveldate,
  postRide,
  isPending,
}: {
  travelDirection?: string;
  location?: string;
  traveldate: Date;
  postRide: (data: any) => void;
  isPending: boolean;
}) => {
  const handlePress = () => {
    if (!travelDirection || !location || !traveldate) {
      Alert.alert('Missing Information', 'Please find the rides in home page first.');
      return;
    }

    const formattedDate = new Date(traveldate).toLocaleDateString();
    const formatedTime = new Date(traveldate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    Alert.alert(
      'Confirm Ride',
      `Are you sure you want to post this ride?\n\n📅 Date & Time: ${formattedDate} Time :  ${formatedTime}`,

      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            postRide({
              name: 'haaaa', // TODO: Replace hardcoded name
              destination: travelDirection,
              from: location,
              date: traveldate,
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <View className="h-[20px]" />
      <Text className="mb-4 mt-4" variant="h3">
        Can’t find a ride?
      </Text>
      <Text className="mb-4" variant="h4">
        Post a ride yourself
      </Text>
      <Button onPress={handlePress}>
        {isPending ? <Loader2 className="animate-spin text-foreground" /> : <Text>Post Ride</Text>}
      </Button>
      <View className="h-[20px]" />
    </>
  );
};

/* -------------------- MAIN SCREEN -------------------- */
export default function RidesScreen() {
  const { travelDirection, location, date: dateString } = useLocalSearchParams<RideScreenParams>();

  const traveldate = React.useMemo(() => new Date(dateString || new Date()), [dateString]);

  const [filtersCleared, setFiltersCleared] = React.useState(false);
  const hasFilterParams = !!travelDirection && !!location && !!dateString;
  const filtersApplied = hasFilterParams && !filtersCleared;

  const { mutate: postRide, isPending } = usePostRide();

  const { data: database, isLoading } = filtersApplied
    ? useRides(travelDirection!, location!, traveldate)
    : useAllRides();

  const hasLocationFilters = !!travelDirection && !!location;
  const isDateFilterPresent = !!dateString;

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

      {/* ✅ Post Button outside the main function */}
      <PostRideUi
        travelDirection={travelDirection}
        location={location}
        traveldate={traveldate}
        postRide={postRide}
        isPending={isPending}
      />
    </View>
  );
}
