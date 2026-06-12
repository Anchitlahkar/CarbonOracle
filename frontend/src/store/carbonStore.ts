import { create } from 'zustand';
import { 
  UserProfile, 
  CarbonEntry,
  BehaviorProfile,
  ForecastProfile,
  OptimizationPlan,
  CarbonDNAProfile,
  PlanetTwinProfile
} from '@carbonsense/shared-types';
import supabase from '../lib/supabase';
import { fetchContextApi } from '../lib/api';

interface CarbonState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  carbonEntries: CarbonEntry[];
  behaviorProfile: BehaviorProfile | null;
  forecastProfile: ForecastProfile | null;
  optimizationPlan: OptimizationPlan | null;
  carbonDNAProfile: CarbonDNAProfile | null;
  planetTwinProfile: PlanetTwinProfile | null;
  chatHistory: any[];
  setUser: (user: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  setCarbonEntries: (entries: CarbonEntry[]) => void;
  addCarbonEntry: (entry: CarbonEntry) => void;
  loginMock: (username: string) => void;
  logout: () => Promise<void>;
  fetchContext: () => Promise<void>;
  addChatMessage: (msg: any) => void;
  clearChatHistory: () => void;
}

export const useCarbonStore = create<CarbonState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  carbonEntries: [],
  behaviorProfile: null,
  forecastProfile: null,
  optimizationPlan: null,
  carbonDNAProfile: null,
  planetTwinProfile: null,
  chatHistory: (() => {
    const saved = localStorage.getItem('carbonsense_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        content: 'Hello. I am TERRA, your carbon intelligence assistant. I have synthesized your behavior logs, forecasts, and Carbon DNA to help you build an action roadmap. How can I guide you today?'
      }
    ];
  })(),

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
      isOnboarded: true,
      targetReductionGoal: 25,
      createdAt: new Date(),
    };
    set({ user: mockUser, session: { access_token: 'mock-jwt-token' } });
    
    // Automatically load telemetry context after mock login
    get().fetchContext();
  },

  logout: async () => {
    try {
      if (supabase && import.meta.env.VITE_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during Supabase signout', err);
    } finally {
      localStorage.removeItem('carbonsense_chat_history');
      set({ 
        user: null, 
        session: null, 
        carbonEntries: [],
        behaviorProfile: null,
        forecastProfile: null,
        optimizationPlan: null,
        carbonDNAProfile: null,
        planetTwinProfile: null,
        chatHistory: [
          {
            id: 'welcome',
            role: 'model',
            content: 'Hello. I am TERRA, your carbon intelligence assistant. I have synthesized your behavior logs, forecasts, and Carbon DNA to help you build an action roadmap. How can I guide you today?'
          }
        ],
        error: null
      });
    }
  },

  fetchContext: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchContextApi();
      set({
        behaviorProfile: data.behaviorProfile,
        forecastProfile: data.forecastProfile,
        optimizationPlan: data.optimizationPlan,
        carbonDNAProfile: data.carbonDNAProfile,
        planetTwinProfile: data.planetTwinProfile,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch user carbon telemetry:', err);
      
      let mappedError = 'system_unavailable';
      const status = err.status;
      const message = (err.message || '').toLowerCase();
      
      if (
        status === 401 || 
        status === 403 || 
        message.includes('auth') || 
        message.includes('session') || 
        message.includes('token') || 
        message.includes('jwt') || 
        message.includes('unauthorized') || 
        message.includes('expired')
      ) {
        mappedError = 'session_expired';
      } else if (
        status === -1 || 
        message.includes('fetch') || 
        message.includes('network') || 
        message.includes('connection') || 
        message.includes('dns') || 
        message.includes('endpoint')
      ) {
        mappedError = 'network_issue';
      }
      
      set({ 
        error: mappedError, 
        isLoading: false 
      });
    }
  },

  addChatMessage: (msg) => {
    const newHistory = [...get().chatHistory, msg];
    localStorage.setItem('carbonsense_chat_history', JSON.stringify(newHistory));
    set({ chatHistory: newHistory });
  },

  clearChatHistory: () => {
    const welcome = [
      {
        id: 'welcome',
        role: 'model',
        content: 'Hello. I am TERRA, your carbon intelligence assistant. I have synthesized your behavior logs, forecasts, and Carbon DNA to help you build an action roadmap. How can I guide you today?'
      }
    ];
    localStorage.setItem('carbonsense_chat_history', JSON.stringify(welcome));
    set({ chatHistory: welcome });
  }
}));

export default useCarbonStore;

