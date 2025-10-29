import { SignInForm } from '@/components/sign-in-form';
import { View } from 'react-native';

export default function SignIn() {
  return (
    <View className="flex-1 justify-center bg-background p-4">
      <SignInForm />
    </View>
  );
}