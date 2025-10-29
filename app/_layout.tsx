import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

// Prevent the splash screen from auto-hiding before complete authentication check
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const queryClient = new QueryClient();
  const router = useRouter();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setInitialRoute('/(tabs)');
      } else {
        setInitialRoute('/auth/sign-in');
      }
      setIsLoading(false);
      SplashScreen.hideAsync();
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading && initialRoute) {
      router.replace(initialRoute);
    }
  }, [isLoading, initialRoute, router]);

  if (isLoading) {
    return null; // Or a loading indicator
  }

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
      <PortalHost />
    </ThemeProvider>
    </QueryClientProvider>
  );
}