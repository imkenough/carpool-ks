// login-zus.tsx
import { create } from 'zustand';
import { checkAuthStatus, performLogin, performLogout } from '../local-storage/islogin';

type StoreState = {
  Log: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
};

const loginStore = create<StoreState>((set) => ({
  Log: false,
  isLoading: true,

  // Initialize auth status on app start
  initializeAuth: async () => {
    set({ isLoading: true });
    const status = await checkAuthStatus();
    set({ Log: status, isLoading: false });
  },

  login: async () => {
    try {
      await performLogin();
      set({ Log: true });
    } catch (error) {
      console.error('Login failed:', error);
      // Optionally re-sync from AsyncStorage
      const status = await checkAuthStatus();
      set({ Log: status });
    }
  },

  logout: async () => {
    try {
      await performLogout();
      set({ Log: false });
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally re-sync from AsyncStorage
      const status = await checkAuthStatus();
      set({ Log: status });
    }
  },
}));

export default loginStore;