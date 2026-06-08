import { create } from 'zustand';
import { UserProfile, CarbonEntry } from '@carbonsense/shared-types';
import supabase from '../lib/supabase';

interface CarbonState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  carbonEntries: CarbonEntry[];
  setUser: (user: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  setCarbonEntries: (entries: CarbonEntry[]) => void;
  addCarbonEntry: (entry: CarbonEntry) => void;
  loginMock: (username: string) => void;
  logout: () => Promise<void>;
}

export const useCarbonStore = create<CarbonState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  carbonEntries: [],

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setCarbonEntries: (carbonEntries) => set({ carbonEntries }),

  addCarbonEntry: (entry) =>
    set((state) => ({
      carbonEntries: [entry, ...state.carbonEntries],
    })),

  loginMock: (username) => {
    const mockUser: UserProfile = {
      id: 'mock-user-id-123',
      username,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username,
      country: 'IN',
      isOnboarded: false,
      targetReductionGoal: 20,
      createdAt: new Date(),
    };
    set({ user: mockUser, session: { access_token: 'mock-jwt-token' } });
  },

  logout: async () => {
    try {
      // Check if we are connected to real Supabase
      if (supabase && import.meta.env.VITE_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during Supabase signout', err);
    } finally {
      set({ user: null, session: null, carbonEntries: [] });
    }
  },
}));
export default useCarbonStore;
