import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useColorScheme } from 'nativewind';
import { Image, View } from 'react-native';
import { useGoogleSignIn } from '@/utils/query/signin-signup';
import { useEffect } from 'react';
import loginStore from '@/utils/states/login-zus';

// ✅ Single social connection strategy (Google only)
const SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: 'oauth_google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
];

export function SocialConnections() {
  const { colorScheme } = useColorScheme();
  const { mutate: handleGoogleSignup, isPending } = useGoogleSignIn();

  useEffect(() => {
    // Initialize or track auth state if needed
  }, []);

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => (
        <Button
          key={strategy.type}
          variant="outline"
          size="sm"
          className="sm:flex-1"
          onPress={() => handleGoogleSignup()}
          loading={isPending}>
          <Image
            className={cn('size-4', strategy.useTint && 'dark:invert')}
            tintColor={strategy.useTint ? (colorScheme === 'dark' ? 'white' : 'black') : undefined}
            source={strategy.source}
          />
        </Button>
      ))}
    </View>
  );
}
