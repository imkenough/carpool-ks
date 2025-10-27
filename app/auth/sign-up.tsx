import { SignUpForm } from '@/components/sign-up-form';
import { View } from 'react-native';

export default function SignUp() {
  return (
    <View className="flex-1 justify-center bg-background p-4">
      <SignUpForm />
    </View>
  );
}
