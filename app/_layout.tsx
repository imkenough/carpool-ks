import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';

// Prevent the splash screen from auto-hiding before complete authentication check
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// ✅ CREATE QUERYCLIENT ONCE - OUTSIDE COMPONENT
// This ensures a single instance persists across all re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0, // Always refetch
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      // Critical: Allow mutations even if others are pending
      networkMode: 'always',
    },
  },
});

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

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
            headerShown: false,
          }}
        />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
