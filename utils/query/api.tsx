// src/hooks/useProfiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase'; // your initialized Supabase client
import { CardParams } from '@/components/mycard';

// Fetch rides filtered by destination AND from
const fetchRides = async (destination: string, from: string ): Promise<CardParams[]> => {
  const { data, error } = await supabase
    .from('Rides')
    .select('*')
    .eq('destination', destination)
    .eq('from', from); // filter both fields

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

const postRide = async (name: string, destination: string, from: string): Promise<void> => {
  const { data, error } = await supabase
    .from('Rides')
    .insert([{ name, destination, from }]);

  if (error) throw new Error(error.message);

  console.log('Ride posted successfully:', data);
};


// Custom hook using TanStack Query
export const getRides = (destination: string, from: string) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', { destination, from }], // cache per filter combo
    queryFn: () => fetchRides(destination, from),
    staleTime: 1000 * 60 * 5, // optional: cache for 5 minutes
  });
};

// ✅ Custom hook to post rides (MUTATION)
export const usePostRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, destination, from }: { name: string; destination: string; from: string }) =>
      postRide(name, destination, from ),

    // Invalidate or refetch rides after posting
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },

    onError: (error) => {
      console.error('Error posting ride:', error);
    },
  });
};
