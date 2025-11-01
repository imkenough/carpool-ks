import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before complete authentication check
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const queryClient = new QueryClient();

  useEffect(() => {
    // Hide splash screen once the layout is mounted
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Slot
          screenOptions={{
            animation: 'none',
            headerShown: false
          }}
        />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}