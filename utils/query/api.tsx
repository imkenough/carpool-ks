// src/hooks/useProfiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';

// =============================================================================
// FETCH FUNCTIONS - Database operations for rides
// =============================================================================

/**
 * Fetches rides filtered by destination, origin, date, and optional time range
 * @param destination - The destination location
 * @param from - The origin location
 * @param date - The target date
 * @param time - Optional time range [hours, minutes, seconds, milliseconds]
 * @returns Array of rides matching the criteria
 */
const fetchRides = async (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
): Promise<CardParams[]> => {
  // Default to midnight if no specific time provided
  const hoursToSet = time || [0, 0, 0, 0];

  // Set start time based on the provided date and time
  const startDate = new Date(date);
  startDate.setHours(...hoursToSet);

  // Calculate end time (start of next day at midnight)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);

  // Query rides within the time range
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .ilike('destination', `%${destination}%`)
    .ilike('from', `%${from}%`)
    .gte('date', startDate.toISOString()) // Greater than or equal to start
    .lt('date', endDate.toISOString()); // Less than end (exclusive)

  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Fetches all rides without any filters
 * @returns Array of all rides in the database
 */
const fetchAllRides = async (): Promise<CardParams[]> => {
  const { data, error } = await supabase.from('rides').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Fetches rides for a specific date (entire day from midnight to midnight)
 * @param date - The target date
 * @returns Array of rides on that date
 */
const fetchRidesByDate = async (date: Date): Promise<CardParams[]> => {
  // Set to start of day (midnight)
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  // Set to start of next day (midnight)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  // Query rides within the full day
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .gte('date', startDate.toISOString())
    .lt('date', endDate.toISOString());

  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Adds a new ride to the database
 * @param ride - The ride object containing name, destination, from, and date
 */
const postRide = async (ride: {
  destination: string;
  from: string;
  date: Date;
}): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated. Cannot post ride.');
  }

  // Fetch the user's full_name from their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.full_name) {
    throw new Error('Could not find user profile or name. Please complete your profile.');
  }

  // Construct the new ride object with the user's name
  const newRide = {
    ...ride,
    user_id: user.id,
    name: profile.full_name, // Use the name from the profile
  };

  const { error } = await supabase.from('rides').insert([newRide]);
  if (error) {
    throw new Error(error.message);
  }
};

// =============================================================================
// REACT QUERY HOOKS - Custom hooks for data fetching and mutations
// =============================================================================

/**
 * Hook to fetch rides with filters (destination, origin, date, and optional time)
 * Only executes when both destination and origin are provided
 */
export const useRides = (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', destination, from, date, time],
    queryFn: () => fetchRides(destination, from, date, time),
    enabled: Boolean(destination && from), // Prevent unnecessary queries
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to fetch all rides without filters
 * Useful for displaying all available rides
 */
export const useAllRides = () => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'all'],
    queryFn: fetchAllRides,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to fetch rides for a specific date
 * Only executes when a valid date is provided
 */
export const useRidesByDate = (date: Date) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'byDate', date],
    queryFn: () => fetchRidesByDate(date),
    enabled: Boolean(date), // Prevent query with invalid date
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to create a new ride (mutation)
 * Automatically invalidates all ride queries on success to refresh data
 */
export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRide,
    onSuccess: () => {
      // Refresh all ride queries to show the new ride
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error posting ride:', error.message);
    },
  });
};