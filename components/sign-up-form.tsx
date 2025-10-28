import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, AppState, Platform, Pressable, type TextInput, View } from 'react-native';

// Tells Supabase Auth to continuously refresh the session automatically
// in  background when the app is open., this is the required for OAuth to work
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export function SignUpForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);
  const platform = Platform.OS == 'ios';
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');

  const handelSignup = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name, phone_number: phoneNumber })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        console.error('Error updating profile:', error);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert('Error', 'You are not logged in. Please sign in again.');
      router.replace('../auth/sign-in');
    }
  };

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onSubmit() {
    // TODO: Submit form and navigate to protected screen if successful
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Setup your profile</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Don't worry! you can change these later.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="flex-row items-center rounded-md border border-input">
            <Text className="pl-3 pr-2 text-muted-foreground">+91</Text>
            <Input
              className="flex-1 border-0 bg-transparent"
              returnKeyType="send"
              keyboardType="numeric"
              placeholder="Phone Number"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <Input
            returnKeyType="send"
            keyboardType="default"
            placeholder="Name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <Button disabled={phoneNumber.length !== 10 || name.length < 3} onPress={handelSignup}>
            <Text>Continue</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
