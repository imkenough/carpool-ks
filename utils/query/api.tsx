// src/hooks/useProfiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';

// --------------------
// Fetch functions
// --------------------

// Fetch rides filtered by destination and from
const fetchRides = async (destination: string, from: string): Promise<CardParams[]> => {
  const { data, error } = await supabase
    .from('Rides')
    .select('*')
    .eq('destination', destination)
    .eq('from', from);

  if (error) throw new Error(error.message);
  return data ?? [];
};

// Fetch all rides (no filters)
const fetchAllRides = async (): Promise<CardParams[]> => {
  const { data, error } = await supabase.from('Rides').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
};

// Add a new ride
const postRide = async (ride: {
  name: string;
  destination: string;
  from: string;
  date: Date;
}): Promise<void> => {
  const { error } = await supabase.from('Rides').insert([ride]);
  if (error) throw new Error(error.message);
};

// --------------------
// React Query Hooks
// --------------------

// Get rides filtered by destination and from
export const useRides = (destination: string, from: string) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', destination, from],
    queryFn: () => fetchRides(destination, from),
    enabled: Boolean(destination && from), // avoids running query with empty filters
    staleTime: 1000 * 60 * 5,
  });
};

// Get all rides
export const useAllRides = () => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'all'],
    queryFn: fetchAllRides,
    staleTime: 1000 * 60 * 5,
  });
};

// Post a new ride (mutation)
export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRide,
    onSuccess: () => {
      // Invalidate both filtered and all ride queries
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
    onError: (error: Error) => {
      console.error('❌ Error posting ride:', error.message);
    },
  });
};
