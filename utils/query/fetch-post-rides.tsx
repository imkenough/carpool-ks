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

const fetchRides = async (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
): Promise<CardParams[]> => {
  const hoursToSet = time || [0, 0, 0, 0];
  const startDate = new Date(date);
  startDate.setHours(...hoursToSet);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)')
    .ilike('destination', `%${destination}%`)
    .ilike('from', `%${from}%`)
    .gte('date', startDate.toISOString())
    .lt('date', endDate.toISOString())
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchAllRides = async (): Promise<CardParams[]> => {
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(phone_number)')
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchRidesByUserId = async (userId: string): Promise<CardParams[] | null> => {
  const { data, error } = await supabase.from('rides').select('*').eq('user_id', userId);

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data || null;
};

// =============================================================================
// POST FUNCTIONS - Database operations for rides
// =============================================================================

const postRide = async (ride: NewRide): Promise<CardParams> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated. Cannot post ride.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.full_name) {
    throw new Error('Could not find user profile or name. Please complete your profile.');
  }

  const newRide = {
    ...ride,
    user_id: user.id,
    name: profile.full_name,
  };

  const { data, error } = await supabase
    .from('rides')
    .insert([newRide])
    .select('*, profiles(phone_number)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

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

export const useRides = (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', destination, from, date, time],
    queryFn: () => fetchRides(destination, from, date, time),
    enabled: Boolean(destination && from),
    staleTime: 0, // Always refetch on mount
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
  });
};

export const useRidesByUserId = (id: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<CardParams[] | null, Error>({
    queryKey: ['rides', 'byUser', id],
    queryFn: () => fetchRidesByUserId(id as string),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useAllRides = () => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'all'],
    queryFn: fetchAllRides,
    staleTime: 0, // Always refetch on mount
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// =============================================================================
// MUTATIONS - Hooks for creating and deleting rides
// =============================================================================

export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRide,

    onSuccess: (newRide) => {
      // Update 'all rides' cache
      queryClient.setQueryData<CardParams[]>(['rides', 'all'], (old) => {
        if (!old) return [newRide];
        return [...old, newRide].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });

      console.log('✅ Ride posted successfully:', newRide);
    },

    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error posting ride:', error.message);
    },

    onSettled: () => {
      // Invalidate all ride queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['rides'],
        refetchType: 'all', // Force refetch even if query is inactive
      });
    },
  });
};

export const usedeleteRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRide,

    onSuccess: (deletedId) => {
      // Immediately remove from all caches
      queryClient.setQueryData<CardParams[]>(['rides', 'all'], (old) => {
        if (!old) return [];
        return old.filter((ride) => ride.id !== deletedId);
      });

      console.log('✅ Ride deleted successfully:', deletedId);
    },

    onError: (error: Error) => {
      Alert.alert('Error', error.message);
      console.error('❌ Error deleting ride:', error.message);
    },

    onSettled: () => {
      // Invalidate all ride queries
      queryClient.invalidateQueries({
        queryKey: ['rides'],
        refetchType: 'all',
      });
    },
  });
};
