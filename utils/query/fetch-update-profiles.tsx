import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { supabase } from '../supabase';

//--------------------------------------------------Types------------------------------------------------------------------------//
interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  // Add other profile fields as needed
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

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

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
      phone_number: phoneNumber 
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
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
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
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

      // Return context object with the snapshotted value
      return { previousProfile };
    },
    
    // Update with actual server response on success
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data);
      console.log('Profile updated successfully:', data);
    },
    
    // Rollback to the previous value on error
    onError: (error, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile'], context.previousProfile);
      }
      console.error('Profile update failed:', error);
      // You can add toast notification here
      // toast.error('Failed to update profile. Please try again.');
    },
    
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};