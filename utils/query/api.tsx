// src/hooks/useRides.ts (Assuming the file is named useRides.ts now)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';
import { Alert } from 'react-native';

// =============================================================================
// FETCH FUNCTIONS - Database operations for rides and profiles
// =============================================================================

/**
 * Fetches rides filtered by destination, origin, date, and optional time range.
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

  // Query rides within the time range, joining with profiles for phone number
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)') // Standard syntax for joining 'profiles'
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
 * @returns Array of all rides in the database
 */
const fetchAllRides = async (): Promise<CardParams[]> => {
  // FIX: Changed 'proflies' to 'profiles'
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)')
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Fetches a single ride by its ID.
 * @param id - The ID of the ride
 * @returns A single ride object or null
 */
const fetchRideById = async (id: number): Promise<CardParams | null> => {
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is 'No rows found'
    throw new Error(error.message);
  }
  return data || null;
};

/**
 * Fetches rides for a specific date (entire day from midnight to midnight).
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

  // Query rides within the full day, joining with profiles for phone number
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)')
    .gte('date', startDate.toISOString())
    .lt('date', endDate.toISOString());

  if (error) throw new Error(error.message);
  return data ?? [];
};

/**
 * Adds a new ride to the database.
 * @param ride - The ride object containing destination, from, and date
 */
const postRide = async (ride: { destination: string; from: string; date: Date }): Promise<void> => {
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
    throw new Error('Could not find user profile or name. Please complete your profile.');
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
 * Fetches the currently authenticated user's profile details.
 */
const fetchUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, phone_number')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
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
 * Hook to fetch a single ride by its ID.
 */
export const useRideById = (id: number | undefined) => {
  return useQuery<CardParams | null, Error>({
    queryKey: ['ride', id],
    queryFn: () => fetchRideById(id as number),
    enabled: Boolean(id), // Only run if id is provided
  });
};

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
 * Hook to fetch rides for a specific date.
 * Only executes when a valid date is provided.
 */
export const useRidesByDate = (date: Date) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'byDate', date],
    queryFn: () => fetchRidesByDate(date),
    enabled: Boolean(date), // Prevent query with invalid date
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
      // Refresh all ride queries (like 'all', 'byDate', and 'filtered' rides)
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      Alert.alert('Success', 'Your ride has been posted!');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error posting ride:', error.message);
    },
  });
};

/**
 * Hook to fetch the authenticated user's profile.
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });
};
