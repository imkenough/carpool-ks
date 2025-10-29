// login-zus.tsx
import { create } from 'zustand';
import { checkAuthStatus } from '../local-storage/islogin';

type StoreState = {
  Log: boolean;
  isHydrated: boolean;
  setLog: (value: boolean) => void;
  login: () => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

const loginStore = create<StoreState>((set) => ({
  Log: false,
  isHydrated: false,

  setLog: (value) => {
    set({ Log: value });
  },

  login: () => {
    set({ Log: true });
  },

  logout: () => {
    set({ Log: false });
  },

  hydrate: async () => {
    const isLoggedIn = await checkAuthStatus();
    set({ Log: isLoggedIn, isHydrated: true });
  },
}));

// Hydrate immediately when store is created
loginStore.getState().hydrate();

export default loginStore;