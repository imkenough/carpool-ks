// src/hooks/useProfiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { CardParams } from '@/components/mycard';

// --------------------
// Fetch functions
// --------------------

// Fetch rides filtered by destination and from
const fetchRides = async (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
): Promise<CardParams[]> => {
  // 2. If 'time' is null or undefined, default to [0, 0, 0, 0]
  const hoursToSet = time || [0, 0, 0, 0];

  // 3. Create the start of the day
  const startDate = new Date(date);
  // 4. Use the spread operator (...) to pass the array as arguments
  startDate.setHours(...hoursToSet);

  // 5. Create the end date (start of the next day)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);

  // 6. Convert to ISO strings for Supabase
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  const { data, error } = await supabase
    .from('Rides')
    .select('*')
    .eq('destination', destination)
    .eq('from', from)
    // Find all records from the specified time until the end of the day
    .gte('date', startDateString) // >= start time
    .lt('date', endDateString); // < start of next day

  if (error) throw new Error(error.message);
  return data ?? [];
};

// Fetch all rides (no filters)
const fetchAllRides = async (): Promise<CardParams[]> => {
  const { data, error } = await supabase.from('Rides').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchRidesByDate = async (date: Date): Promise<CardParams[]> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1); // Set to the beginning of the next day

  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  const { data, error } = await supabase
    .from('Rides')
    .select('*')
    .gte('date', startDateString)
    .lt('date', endDateString);

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
export const useRides = (
  destination: string,
  from: string,
  date: Date,
  time?: [number, number, number, number] | null
) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', destination, from, date, time],
    queryFn: () => fetchRides(destination, from, date, time),
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

export const useRidesByDate = (date: Date) => {
  return useQuery<CardParams[], Error>({
    queryKey: ['rides', 'byDate', date],
    queryFn: () => fetchRidesByDate(date),
    enabled: Boolean(date),
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
