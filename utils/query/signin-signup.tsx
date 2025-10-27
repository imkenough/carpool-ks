// In your main App.js or index.js
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

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
    const userInfo = await GoogleSignin.signIn();

    // 3. Check for the ID token (FIXED: it's userInfo.idToken, not userInfo.data.idToken)
    if (userInfo.data?.idToken) {
      // 4. Sign in to Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Successfully signed in
      return data;
    } else {
      throw new Error('Google Sign-In failed: No ID token returned.');
    }
  } catch (error: any) {
    // 5. Improved Error Handling
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google Sign-In cancelled by user.');
      // Don't throw an error, just return null as the user cancelled
      return null; 
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.warn('Google Sign-In is already in progress.');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Error', 'Google Play Services is not available or outdated.');
      throw new Error('Play Services not available.');
    } else {
      // Some other unknown error
      console.error('Google Sign-In Error:', error.message, error.code);
      throw new Error(error.message || 'An unknown error occurred during sign-in.');
    }
  }
}



/**
 * Custom hook to manage the Google Sign-In mutation state.
 */
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleSignin,
    onSuccess: (data) => {
      if (data) {
        // Invalidate queries that depend on the user's auth state
        // 'user' or 'session' is more common than 'signin'
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['session'] });
        console.log('✅ Google Sign-In Successful');
      }
      // If data is null (e.g., user cancelled), we don't need to do anything
    },
    onError: (error: Error) => {
      // Show user-facing alert
      Alert.alert('Sign-In Failed', error.message);
      console.error('❌ Error signing in with Google:', error.message);
    },
  });
};