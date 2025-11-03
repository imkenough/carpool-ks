import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import loginStore from '../states/login-zus';
import { performLogin } from '../local-storage/islogin';

// Configure Google Sign-In on app startup
GoogleSignin.configure({
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
  webClientId: '145706147239-2mc9i578acig3qamvpvhfdrvahtl1rvl.apps.googleusercontent.com', // .ENV GOOGLE SIGN-IN
});

async function googleSignin() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token returned from Google Sign-In');
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    // Update user profile
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      avatar_url: userInfo.data?.user.photo,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) throw upsertError;

    // Check profile completion status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', data.user.id)
      .single();

    // Ignore PGRST116 (no row found) for new users
    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    const isProfileComplete = !!(profile?.full_name && profile?.phone_number);

    return { ...data, isProfileComplete };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error.code || error.message);

    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        console.log('Sign-In cancelled by user');
        return null;

      case statusCodes.IN_PROGRESS:
        console.warn('Sign-In already in progress');
        return null;

      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        Alert.alert('Error', 'Google Play Services is not available or outdated');
        throw new Error('Play Services not available');

      default:
        throw new Error(error.message || 'An unknown error occurred during sign-in');
    }
  }
}

export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { login } = loginStore();
  const handleLogin = async () => {
    login();
    await performLogin();
  };

  return useMutation({
    mutationFn: googleSignin,
    onSuccess: (data: any) => {
      if (!data) return;

      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });

      console.log('✅ Google Sign-In Successful');
      if (data.isProfileComplete) {
        handleLogin();
        router.replace('/');
      }
      router.push('../auth/sign-up');
    },
    onError: (error: Error) => {
      Alert.alert('Sign-In Failed', error.message);
      console.error('❌ Sign-In Error:', error.message);
    },
  });
};
