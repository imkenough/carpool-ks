import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

//--------------------------------------------------Types------------------------------------------------------------------------//
interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
}

interface UpdateProfileParams {
  fullName: string;
  phoneNumber: string;
  userId: string;
}

//--------------------------------------------------Functions------------------------------------------------------------------------//
/**
 * Fetches the currently authenticated user's profile details.
 */
const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Updates a user's profile in the database.
 */
const changeUserProfile = async ({
  fullName,
  phoneNumber,
  userId,
}: UpdateProfileParams): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message);
  }

  return data;
};

//--------------------------------------------------Hooks------------------------------------------------------------------------//
/**
 * Hook to fetch the authenticated user's profile.
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes is fine for profile data
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });
};

/**
 * Hook to update the user's profile with optimistic updates.
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserProfile,

    // Optimistically update before the request completes
    onMutate: async (newProfile: UpdateProfileParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-profile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(['user-profile']);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['user-profile'], {
          ...previousProfile,
          full_name: newProfile.fullName,
          phone_number: newProfile.phoneNumber,
        });
      }

      return { previousProfile };
    },

    // Update with actual server response on success
    onSuccess: (data) => {
      // Directly set the data from server
      queryClient.setQueryData(['user-profile'], data);
      console.log('Profile updated successfully:', data);
    },

    // Rollback to the previous value on error
    onError: (error, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile'], context.previousProfile);
      }
      console.error('Profile update failed:', error);
    },

    // Force refetch with refetchType to override staleTime
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-profile'],
        refetchType: 'active', // Only refetch if query is currently being used
      });
    },
  });
};
