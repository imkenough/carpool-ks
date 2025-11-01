// src/hooks/useRides.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';
import { Alert } from 'react-native';

// =============================================================================
// TYPES
// =============================================================================

interface NewRide {
  destination: string;
  from: string;
  date: Date;
}

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
  const { data, error } = await supabase.from('rides').select('*').eq('user_id', userId);

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
const postRide = async (ride: NewRide): Promise<CardParams> => {
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

  const { data, error } = await supabase.from('rides').insert([newRide]).select('*, profiles(phone_number)').single();
  
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Deletes a specific ride from the database by its ID.
 */
const deleteRide = async (rideId: string): Promise<string> => {
  const { error } = await supabase.from('rides').delete().eq('id', rideId);
  if (error) {
    console.error('Error deleting ride:', error);
    throw new Error(error.message);
  }
  return rideId;
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
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    retry: 2,
  });
};

/**
 * Hook to fetch all rides posted by a specific user.
 */
export const useRidesByUserId = (id: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<CardParams[] | null, Error>({
    queryKey: ['rides', 'byUser', id],
    queryFn: () => fetchRidesByUserId(id as string),
    // Only run if id is provided AND the caller's enabled flag is true (or not set)
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch all rides without filters.
 */
export const useAllRides = () => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'all'],
    queryFn: fetchAllRides,
    staleTime: 30 * 1000,
    retry: 2,
  });
};

// =============================================================================
// MUTATIONS - Hooks for creating and deleting rides
// =============================================================================

/**
 * Hook to create a new ride (mutation) with optimistic updates.
 * Automatically updates the UI before the server responds.
 */
export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRide,
    
    // Optimistically add the ride before server responds
    onMutate: async (newRide: NewRide) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rides'] });

      // Snapshot previous values for all ride queries
      const previousAllRides = queryClient.getQueryData<CardParams[]>(['rides', 'all']);
      const previousFilteredRides = queryClient.getQueriesData<CardParams[]>({ queryKey: ['rides'] });

      // Get current user info for optimistic update
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Create optimistic ride object with temporary ID
        const optimisticRide = {
          id: `temp-${Date.now()}`, // Temporary ID
          destination: newRide.destination,
          from: newRide.from,
          date: newRide.date,
          user_id: user.id,
          name: 'Loading...', // Will be replaced by server response
          profiles: { phone_number: '' },
          created_at: new Date().toISOString(),
        };

        // Optimistically update 'all rides' cache
        queryClient.setQueryData<any[]>(['rides', 'all'], (old) => {
          if (!old) return [optimisticRide];
          return [...old, optimisticRide];
        });

        // Optimistically update filtered rides caches
        previousFilteredRides.forEach(([queryKey, oldData]) => {
          if (Array.isArray(oldData) && queryKey[0] === 'rides' && queryKey.length > 2) {
            queryClient.setQueryData(queryKey, [...oldData, optimisticRide]);
          }
        });
      }

      return { previousAllRides, previousFilteredRides };
    },

    // Update with actual server response
    onSuccess: (data) => {
      // Replace the optimistic ride with the real one from the server
      queryClient.setQueryData<CardParams[]>(['rides', 'all'], (old) => {
        if (!old) return [data];
        // Remove temp ride and add real one
        return [...old.filter(ride => !ride.id.startsWith('temp-')), data];
      });

      console.log('✅ Ride posted successfully:', data);
    },

    // Rollback on error
    onError: (error: Error, variables, context) => {
      // Restore previous state
      if (context?.previousAllRides) {
        queryClient.setQueryData(['rides', 'all'], context.previousAllRides);
      }
      
      if (context?.previousFilteredRides) {
        context.previousFilteredRides.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }

      Alert.alert('Error', error.message);
      console.error('❌ Error posting ride:', error.message);
    },

    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });
};

/**
 * Hook to delete a ride (mutation) with optimistic updates.
 * Automatically removes the ride from UI before server responds.
 */
export const usedeleteRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRide,
    
    // Optimistically remove the ride before server responds
    onMutate: async (rideId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rides'] });

      // Snapshot previous values
      const previousAllRides = queryClient.getQueryData<CardParams[]>(['rides', 'all']);
      const previousFilteredRides = queryClient.getQueriesData<CardParams[]>({ queryKey: ['rides'] });

      // Optimistically remove the ride from all caches
      queryClient.setQueryData<CardParams[]>(['rides', 'all'], (old) => {
        if (!old) return [];
        return old.filter(ride => ride.id !== rideId);
      });

      // Update all filtered ride queries
      previousFilteredRides.forEach(([queryKey, oldData]) => {
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(
            queryKey,
            oldData.filter(ride => ride.id !== rideId)
          );
        }
      });

      return { previousAllRides, previousFilteredRides, deletedRideId: rideId };
    },

    // On success, just log
    onSuccess: (deletedId) => {
      console.log('✅ Ride deleted successfully:', deletedId);
    },

    // Rollback on error
    onError: (error: Error, variables, context) => {
      // Restore previous state
      if (context?.previousAllRides) {
        queryClient.setQueryData(['rides', 'all'], context.previousAllRides);
      }
      
      if (context?.previousFilteredRides) {
        context.previousFilteredRides.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }

      Alert.alert('Error', error.message);
      console.error('❌ Error deleting ride:', error.message);
    },

    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });
};