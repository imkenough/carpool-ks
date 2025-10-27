import { VerifyEmailForm } from '@/components/verify-email-form';
import { ScrollView } from 'react-native';

export default function VerifyEmail() {
  return (
    <ScrollView contentContainerClassName="flex-1 justify-center p-4">
      <VerifyEmailForm />
    </ScrollView>
  );
}
