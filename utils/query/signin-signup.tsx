// In your main App.js or index.js
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Configure this once when your app starts!
GoogleSignin.configure({
  // We recommend setting 'profile' and 'email' as default scopes
  // Only add 'drive.readonly' if you ABSOLUTELY need it,
  // as it asks the user for a scary permission.
  scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  
  // Get this from your .env file
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_ID, 
});



/**
 * Handles the Google Sign-In process and Supabase authentication.
 * Note: Assumes GoogleSignin.configure() has already been called on app startup.
 */
async function googleSignin() {
  try {
    // 1. Check for Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // 2. Get user info from Google
    // This line is failing because your webClientId is wrong.
    const userInfo = await GoogleSignin.signIn();

    // 3. This line is where your console.log was, it's never reached
    console.log('✅ Google UserInfo:', userInfo); 
    
    // 4. CHECK FOR THE ID TOKEN (THIS IS THE FIX)
    if (userInfo.data?.idToken) { 
      // 5. Sign in to Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken, // Use userInfo.idToken directly
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          avatar_url: userInfo.data.user.photo,
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          throw new Error(`Failed to save user profile: ${upsertError.message}`);
        }

        // Check if the user's profile is complete
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no row was found, which is expected for new users
          throw new Error(`Failed to check user profile: ${profileError.message}`);
        }

        const isProfileComplete = !!(profile?.full_name && profile?.phone_number);

        return { ...data, isProfileComplete };
      }
      
      // Successfully signed in
      return data;
    } else {
      throw new Error('Google Sign-In failed: No ID token returned.');
    }
  } catch (error: any) {
    // 5. Improved Error Handling
    
    // --- THIS IS WHERE YOUR CODE IS GOING ---
    console.error('--- GOOGLE SIGN-IN FAILED ---');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('-----------------------------');

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google Sign-In cancelled by user.');
      return null; 
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.warn('Google Sign-In is already in progress.');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Error', 'Google Play Services is not available or outdated.');
      throw new Error('Play Services not available.');
    } else {
      // This is likely the error you are seeing (e.g., DEVELOPER_ERROR or code 10)
      throw new Error(error.message || 'An unknown error occurred during sign-in.');
    }
  }
}



/**
 * Custom hook to manage the Google Sign-In mutation state.
 */
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: googleSignin,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['session'] });
        console.log('✅ Google Sign-In Successful');

        if (data.isProfileComplete) {
          router.replace('/(tabs)');
        } else {
          router.replace('../auth/sign-up');
        }
      }
    },
    onError: (error: Error) => {
      // Show user-facing alert
      Alert.alert('Sign-In Failed', error.message);
      console.error('❌ Error signing in with Google:', error.message);
    },
  });
};