import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Platform, Pressable, type TextInput, View } from 'react-native';

export function SignInForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);
  const platform = Platform.OS == 'ios';

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
          <CardTitle className="text-center text-xl sm:text-left">Sign in to Carpool</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          {/* <View className="flex-row items-center rounded-md border border-input">
            <Text className="pl-3 text-muted-foreground">+91</Text>
            <Input
              className="flex-1 border-0 bg-transparent"
              returnKeyType="send"
              keyboardType="numeric"
              placeholder="Phone Number"
              maxLength={10}
            />
          </View>
          <Input
            returnKeyType="send"
            keyboardType="default"
            placeholder="Name"
            autoCapitalize="words"
          /> */}
          <SocialConnections />
          <View className="flex-row items-center justify-center gap-x-1">
            <Text className="text-sm text-muted-foreground">Already have an account?</Text>
            <Pressable onPress={() => router.replace('../auth/sign-up')}>
              <Text className="text-sm font-semibold text-primary">Sign Up </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
