import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

export interface UserAddress {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  profilePhoto?: string;
  addresses?: UserAddress[];
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  register: (userData: User, token: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
      register: (user, token) => {
        set({ user, token, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          delete axios.defaults.headers.common['Authorization'];
        }
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }) as any),
    }
  )
);

export default useAuthStore;
