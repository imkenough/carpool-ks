// src/hooks/useRides.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';
import { Alert } from 'react-native';

// =============================================================================
// FETCH FUNCTIONS - Database operations for rides 
// =============================================================================

/**
 * Fetches rides based on destination, origin, and a specific date.
 * @param time - Optional time range [startHour, startMinute, endHour, endMinute]
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

  // Query rides within the time range, joining with profiles for phone number
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)') // Join profiles table to get phone_number
    .ilike('destination', `%${destination}%`)
    .ilike('from', `%${from}%`)
    .gte('date', startDate.toISOString())
    .lt('date', endDate.toISOString())
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Fetches all rides without any filters.
 */
const fetchAllRides = async (): Promise<CardParams[]> => {
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)') // Join profiles table to get phone_number
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Fetches all rides for a specific user by their user_id.
 */
const fetchRidesByUserId = async (userId: string): Promise<CardParams[] | null> => {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('user_id', userId);

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is 'No rows found', which is not a critical error here
    throw new Error(error.message);
  }

  return data || null;
};



// =============================================================================
// POST FUNCTIONS - Database operations for rides 
// =============================================================================

/**
 * Adds a new ride to the database.
 * @param ride - The ride object containing destination, from, and date
 */
const postRide = async (ride: {
  destination: string;
  from: string;
  date: Date;
}): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated. Cannot post ride.');
  }

  // Fetch the user's full_name from their profile to populate the 'name' column in 'rides'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.full_name) {
    throw new Error(
      'Could not find user profile or name. Please complete your profile.'
    );
  }

  // Construct the new ride object with the user's name and ID
  const newRide = {
    ...ride,
    user_id: user.id,
    name: profile.full_name,
  };

  const { error } = await supabase.from('rides').insert([newRide]);
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Deletes a specific ride from the database by its ID.
 */
const deleteRide = async (rideId: string) => {
  const { error } = await supabase.from('rides').delete().eq('id', rideId);
  if (error) {
    console.error('Error deleting ride:', error);
    throw new Error(error.message);
  }
};

// =============================================================================
// REACT QUERY HOOKS - Custom hooks for data fetching and mutations
// =============================================================================

/**
 * Hook to fetch rides with filters (destination, origin, date, and optional time)
 * Only executes when both destination and origin are provided.
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
  });
};

/**
 * Hook to fetch all rides posted by a specific user.
 */
export const useRidesByUserId = (
  id: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery<CardParams[] | null, Error>({
    queryKey: ['rides', 'byUser', id],
    queryFn: () => fetchRidesByUserId(id as string),
    // Only run if id is provided AND the caller's enabled flag is true (or not set)
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
};

//--------------------------------------------Mutations-----------------------------------------------------------

/**
 * Hook to fetch all rides without filters.
 */
export const useAllRides = () => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'all'],
    queryFn: fetchAllRides,
  });
};

/**
 * Hook to create a new ride (mutation).
 * Automatically invalidates all ride queries on success to refresh data.
 */

export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRide,
    onSuccess: () => {
      // Refresh all queries starting with 'rides'
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error posting ride:', error.message);
    },
  });
};

/**
 * Hook to delete a ride (mutation).
 * Automatically invalidates all ride queries on success to refresh data.
 */

export const usedeleteRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRide,
    onSuccess: () => {
      // Refresh all queries starting with 'rides'
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error deleting ride:', error.message);
    },
  });
};