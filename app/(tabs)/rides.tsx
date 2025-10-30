import { View, FlatList, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MyCard, CardParams } from '@/components/mycard';
import { useAllRides, usePostRide, useRides } from '@/utils/query/fetch-post-rides';
import PostRideUi from '@/components/post-ride';
import React, { useRef } from 'react';
import { RideCardSkeleton } from '@/components/card-skeleton';
/* -------------------- TYPES -------------------- */
type RideScreenParams = {
  travelDirection?: string;
  location?: string;
  date?: string;
};
/* -------------------- No RIDES -------------------- */
const RidesListEmpty = () => (
  <View className="flex-1 items-center justify-center py-24">
    <Text className="text-lg text-muted-foreground">No rides found.</Text>
    <Text className="text-sm text-muted-foreground">
      Try adjusting your search or check back later.
    </Text>
  </View>
);

/* -------------------- HEADER -------------------- */
const RidesListHeader = React.memo(
  ({
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
        <View className="my-4 flex-row items-center justify-between px-4">
          <Text className="shrink text-lg font-bold" accessible>
            Displaying rides on {date.toLocaleDateString()}
          </Text>
          <Button onPress={onClearFilters} variant="outline">
            <Text>Clear</Text>
          </Button>
        </View>
      );
    }

    return <Text className="my-4 px-4 text-lg font-bold">Showing all rides</Text>;
  }
);


/* -------------------- MAIN SCREEN -------------------- */
export default function RidesScreen() {
  const {
    travelDirection,
    location,
    date: dateString,
    rideId,
  } = useLocalSearchParams<RideScreenParams & { rideId?: string }>();

  // Memoize the traveldate object
  const traveldate = React.useMemo(() => new Date(dateString || Date.now()), [dateString]);

  const flatListRef = useRef<FlatList>(null);

  // --- Filter Logic ---
  const [filtersCleared, setFiltersCleared] = React.useState(false);
  // Check if all required filter params are present
  const hasFilterParams = !!travelDirection && !!location && !!dateString;
  // Filters are applied if params exist AND the user hasn't cleared them
  const filtersApplied = hasFilterParams && !filtersCleared;

  // --- Data Fetching ---
  const { mutate: postRide, isPending } = usePostRide();
  const {
    data: database,
    isLoading,
    refetch,
    isRefetching,
  } = filtersApplied ? useRides(travelDirection!, location!, traveldate) : useAllRides();

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // Reset filter state when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setFiltersCleared(false);
    }, [])
  );

  React.useEffect(() => {
    if (rideId && database && flatListRef.current) {
      const index = database.findIndex((ride) => ride.id === rideId);
      if (index > -1) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
    console.log(database);
  }, [rideId, database]);

  // --- FlatList Optimization ---
  const renderItem = React.useCallback(
    ({ item }: { item: CardParams }) => (
      <MyCard
        id={item.id}
        name={item.name}
        destination={item.destination}
        date={item.date}
        profiles={item.profiles}
        from={item.from}
      />
    ),
    []
  );

  const keyExtractor = React.useCallback((item: CardParams) => item.id.toString(), []);

  const renderSkeletonItem = React.useCallback(() => <RideCardSkeleton />, []);
  const skeletonData = React.useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <View className="flex-1">
      <RidesListHeader
        filtersApplied={filtersApplied}
        date={traveldate}
        onClearFilters={() => setFiltersCleared(true)}
      />

      {isLoading ? (
        <FlatList
          data={skeletonData}
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pb-52"
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={database}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={true}
          className="flex-1 px-4 pb-52"
          ListFooterComponent={
            <PostRideUi
              travelDirection={travelDirection}
              location={location}
              traveldate={traveldate}
              postRide={postRide}
              isPending={isPending}
            />
          }
          ListEmptyComponent={RidesListEmpty}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}
