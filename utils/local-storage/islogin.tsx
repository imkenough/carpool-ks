// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to set the value to 'true'
export async function performLogin(): Promise<void> {
  try {
    console.log('User logged in, setting flag in AsyncStorage.');
    await AsyncStorage.setItem('isLoggedIn', 'true');
  } catch (error) {
    console.error('Failed to save login state:', error);
    throw error;
  }
}

// Function to set the value to 'false'
export async function performLogout(): Promise<void> {
  try {
    console.log('User logged out, clearing flag in AsyncStorage.');
    await AsyncStorage.setItem('isLoggedIn', 'false');
  } catch (error) {
    console.error('Failed to save logout state:', error);
    throw error;
  }
}

// Function to read the value
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    
    // AsyncStorage returns null if the key doesn't exist
    // Convert string to boolean, default to false
    return isLoggedIn === 'true';
  } catch (error) {
    console.error('Failed to read auth status:', error);
    return false;
  }
}