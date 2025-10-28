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

export function SignUpForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);
  const platform = Platform.OS == 'ios';
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');

  const handelSignup = () => {};

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
          <Button disabled={phoneNumber.length !== 10 || name.length < 3}>
            <Text>Continue</Text>
          </Button>
          {/* <SocialConnections /> */}
          <View className="flex-row items-center justify-center gap-x-1">
            <Text className="text-sm text-muted-foreground">temporary development links - </Text>
            <Pressable onPress={() => router.replace('../auth/sign-in')}>
              <Text className="text-sm font-semibold text-primary">Sign in page </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
