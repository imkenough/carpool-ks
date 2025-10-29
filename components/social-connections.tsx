import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useColorScheme } from 'nativewind';
import { Image, Platform, View } from 'react-native';
import { useGoogleSignIn } from '@/utils/query/signin-signup';
import { useEffect } from 'react';
import loginStore from '@/utils/states/login-zus';

// Define the base social connection strategies
const BASE_SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: 'oauth_google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
  // Add other common strategies here if needed
  // {
  //   type: 'oauth_github',
  //   source: { uri: 'https://img.clerk.com/static/github.png?width=160' },
  //   useTint: true,
  // },
];

// Define platform-specific strategies
const PLATFORM_SPECIFIC_STRATEGIES = Platform.select({
  ios: [
    {
      type: 'oauth_apple',
      source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
      useTint: true,
    },
  ],
  // Add other platform-specific strategies if needed
  // android: [ ... ],
  // web: [ ... ],
});

// Combine base and platform-specific strategies
const SOCIAL_CONNECTION_STRATEGIES = [
  ...(PLATFORM_SPECIFIC_STRATEGIES || []), // Include platform-specific if they exist
  ...BASE_SOCIAL_CONNECTION_STRATEGIES,
];

export function SocialConnections() {
  const { colorScheme } = useColorScheme();
  

  useEffect(() => {
    // Initialize auth status when app loads
    
  }, []);
  const { mutate: handleGoogleSignup, isPending, error } = useGoogleSignIn()
 

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
                    <Button
                      key={strategy.type}
                      variant="outline"
                      size="sm"
                      className="sm:flex-1"
                      onPress={() => {
                        if (strategy.type === 'oauth_google') {
                          handleGoogleSignup();
                        }
                      }}
                      loading={strategy.type === 'oauth_google' && isPending}
                    >
                      <Image
                        className={cn('size-4', strategy.useTint && Platform.select({ web: 'dark:invert' }))}
                        tintColor={Platform.select({
                          native: strategy.useTint ? (colorScheme === 'dark' ? 'white' : 'black') : undefined,
                        })}
                        source={strategy.source}
                      />
                    </Button>        );
      })}
    </View>
  );
}
