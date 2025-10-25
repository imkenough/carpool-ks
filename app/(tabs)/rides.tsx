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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/* -------------------- TYPES -------------------- */
type RideScreenParams = {
  travelDirection?: string;
  location?: string;
  date?: string;
};

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
  }
);

/* -------------------- SKELETON & FOOTER -------------------- */
const ListFooter = () => <View className="h-[20px]" />;

const RideCardSkeleton = React.memo(() => (
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
));

/* -------------------- POST RIDE UI -------------------- */
const PostRideUi = React.memo(
  ({
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
    // Check if we have the necessary data to post a ride
    const canPost = !!travelDirection && !!location && !!traveldate;

    // Memoize formatted strings to avoid recalculating on every render
    const formattedDate = React.useMemo(
      () => traveldate.toLocaleDateString(),
      [traveldate]
    );
    const formatedTime = React.useMemo(
      () =>
        traveldate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      [traveldate]
    );

    const handlePress = () => {
      postRide({
        name: 'haaaa', // TODO: Replace hardcoded name with actual user name from auth
        destination: travelDirection,
        from: location,
        date: traveldate,
      });
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
       {!canPost && <Text className='mb-2' variant={'destructive'}> Find rides in home to post a rides </Text>}
        {/* Alert Box */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canPost || isPending}>
              {isPending ? (
                <Loader2 className="animate-spin text-foreground" />
              ) : (
                <Text>Post Ride</Text>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Do you want to post this ride?
              </AlertDialogTitle>
              <AlertDialogDescription>
                We will be posting a ride from {location} to {travelDirection} on{' '}
                {formattedDate} at {formatedTime}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handlePress}>
                <Text>Continue</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <View className="h-[20px]" />
      </>
    );
  }
);

/* -------------------- MAIN SCREEN -------------------- */
export default function RidesScreen() {
  const {
    travelDirection,
    location,
    date: dateString,
  } = useLocalSearchParams<RideScreenParams>();

  // Memoize the traveldate object
  const traveldate = React.useMemo(
    () => new Date(dateString || Date.now()),
    [dateString]
  );

  // --- Filter Logic ---
  const [filtersCleared, setFiltersCleared] = React.useState(false);
  // Check if all required filter params are present
  const hasFilterParams = !!travelDirection && !!location && !!dateString;
  // Filters are applied if params exist AND the user hasn't cleared them
  const filtersApplied = hasFilterParams && !filtersCleared;

  // --- Data Fetching ---
  const { mutate: postRide, isPending } = usePostRide();
  const { data: database, isLoading } = filtersApplied
    ? useRides(travelDirection!, location!, traveldate)
    : useAllRides();

  // Reset filter state when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setFiltersCleared(false);
    }, [])
  );

  // --- FlatList Optimization ---
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

  const keyExtractor = React.useCallback(
    (item: CardParams) => item.id.toString(),
    []
  );

  const renderSkeletonItem = React.useCallback(
    () => <RideCardSkeleton />,
    []
  );
  const skeletonData = React.useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <View className="flex-1 px-4">
      
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
          // You might want to add a ListEmptyComponent here
          // ListEmptyComponent={<Text>No rides found.</Text>}
        />
      )}

      {/* Post Button UI */}
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