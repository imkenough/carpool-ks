import {
  useQuery,
  useMutation,
  useQueryClient, // Import useMutation and useQueryClient
} from "@tanstack/react-query";
import { supabase } from "../supabase";

//--------------------------------------------------fuctions------------------------------------------------------------------------//
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
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

/**
 * Updates a user's profile in the database.
 * Note: We accept an object for easier use with useMutation.
 */
const changeUserProfile = async ({
  fullName,
  phoneNumber,
  userId,
}: {
  fullName: string;
  phoneNumber: string;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone_number: phoneNumber })
    .eq("id", userId)
    .select() // Return the updated data
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    // Throw error to be caught by useMutation's onError
    throw new Error(error.message);
  }

  return data;
};


//--------------------------------------------------hooks------------------------------------------------------------------------//
/**
 * Hook to fetch the authenticated user's profile.
 */
export const useUserProfile = () => { // Renamed for clarity
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
};

/**
 * Hook to save the  user's profile.
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      // Optional: handle global error notifications here
      console.error("Profile update failed:", error.message);
    },
  });
};