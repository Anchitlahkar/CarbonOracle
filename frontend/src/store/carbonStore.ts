import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
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
import {
  demoUser,
  demoCarbonEntries,
  demoBehaviorProfile,
  demoForecastProfile,
  demoOptimizationPlan,
  demoCarbonDNAProfile,
  demoPlanetTwinProfile,
  demoChatHistory
} from '../lib/demoData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface CarbonState {
  user: UserProfile | null;
  session: Session | { access_token: string } | null;
  isLoading: boolean;
  authInitialized: boolean;
  isDemoMode: boolean;
  error: string | null;
  carbonEntries: CarbonEntry[];
  behaviorProfile: BehaviorProfile | null;
  forecastProfile: ForecastProfile | null;
  optimizationPlan: OptimizationPlan | null;
  carbonDNAProfile: CarbonDNAProfile | null;
  planetTwinProfile: PlanetTwinProfile | null;
  chatHistory: ChatMessage[];
  setUser: (user: UserProfile | null) => void;
  setSession: (session: Session | { access_token: string } | null) => void;
  setLoading: (isLoading: boolean) => void;
  setCarbonEntries: (entries: CarbonEntry[]) => void;
  addCarbonEntry: (entry: CarbonEntry) => void;
  loginMock: (username: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  fetchContext: () => Promise<void>;
  enterDemoMode: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
}

export const useCarbonStore = create<CarbonState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  authInitialized: false,
  isDemoMode: false,
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

  initializeAuth: async () => {
    console.log('[AUTH_INIT] initializeAuth called');
    const isProduction = import.meta.env.PROD;
    const isDevelopment = import.meta.env.DEV;
    const hasKeys = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    const enableMockAuth = import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

    if (isProduction && !hasKeys) {
      console.error('[AUTH_INIT] Fatal: Supabase configuration keys missing in production!');
      throw new Error("Supabase configuration missing in production");
    }

    set({ isLoading: true });

    // Setup state changes listener for real Supabase auth
    if (hasKeys && supabase) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[AUTH_RESTORE] Auth state change event: ${event}`);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            const userProfile: UserProfile = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'Researcher',
              avatarUrl: session.user.user_metadata?.avatar_url || null,
              country: 'IN',
              isOnboarded: true,
              targetReductionGoal: 25,
              createdAt: new Date(session.user.created_at),
            };
            console.log('[AUTH_SESSION] Session payload:', session);
            console.log('[AUTH_SESSION] Zustand user stored:', userProfile);
            console.log('[AUTH_LOGIN_SUCCESS] AuthStateChange state updated');
            set({ user: userProfile, session, authInitialized: true, isLoading: false });
            
            try {
              await get().fetchContext();
            } catch (e) {
              console.error('[AUTH_RESTORE] Context synchronization failed:', e);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH_SIGNED_OUT] User signed out');
          set({ user: null, session: null, authInitialized: true, isLoading: false });
        }
      });
    }

    // Recover initial session
    if (hasKeys && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AUTH_REFRESH_FAILED] Session restoration failed:', error);
          set({ user: null, session: null, authInitialized: true, isLoading: false });
        } else if (session) {
          console.log(`[AUTH_RESTORE] Active session restored for user: ${session.user.id}`);
          const userProfile: UserProfile = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'Researcher',
            avatarUrl: session.user.user_metadata?.avatar_url || null,
            country: 'IN',
            isOnboarded: true,
            targetReductionGoal: 25,
            createdAt: new Date(session.user.created_at),
          };
          console.log('[AUTH_SESSION] Restored Session payload:', session);
          console.log('[AUTH_SESSION] Restored Zustand user stored:', userProfile);
          set({ user: userProfile, session, authInitialized: true, isLoading: false });
          try {
            await get().fetchContext();
            console.log(`[AUTH_REFRESH_SUCCESS] Initial telemetry retrieved for: ${session.user.id}`);
          } catch (e) {
            console.error('[AUTH_RESTORE] Telemetry context synchronization failed:', e);
          }
        } else {
          console.log('[AUTH_RESTORE] No active Supabase session found');
          set({ user: null, session: null, authInitialized: true, isLoading: false });
        }
      } catch (err) {
        console.error('[AUTH_RESTORE] Exception during session restoration:', err);
        set({ user: null, session: null, authInitialized: true, isLoading: false });
      }
    } else if (isDevelopment && enableMockAuth) {
      console.log('[AUTH_RESTORE] Restoring mock local developer session');
      const savedUser = localStorage.getItem('carbonsense_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          console.log('[AUTH_SESSION] Restored Mock Session payload:', { access_token: 'mock-jwt-token' });
          console.log('[AUTH_SESSION] Restored Mock Zustand user stored:', parsed);
          set({ 
            user: parsed, 
            session: { access_token: 'mock-jwt-token' },
            authInitialized: true,
            isLoading: false 
          });
          await get().fetchContext();
        } catch (e) {
          set({ user: null, session: null, authInitialized: true, isLoading: false });
        }
      } else {
        set({ user: null, session: null, authInitialized: true, isLoading: false });
      }
    } else {
      console.log('[AUTH_RESTORE] Auth setup resolved (no active session or mock mode disabled)');
      set({ user: null, session: null, authInitialized: true, isLoading: false });
    }
  },

  loginMock: (username) => {
    const isDevelopment = import.meta.env.DEV;
    const enableMockAuth = import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

    if (!isDevelopment || !enableMockAuth) {
      console.error('[AUTH_REFRESH_FAILED] Mock login disallowed in this environment');
      throw new Error("Mock login is disabled in this environment.");
    }

    const mockUser: UserProfile = {
      id: 'mock-user-id-123',
      username,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username,
      country: 'IN',
      isOnboarded: true,
      targetReductionGoal: 25,
      createdAt: new Date(),
    };
    localStorage.setItem('carbonsense_mock_user', JSON.stringify(mockUser));
    console.log(`[AUTH_SIGNED_IN] Mock login success for user: ${username}`);
    console.log('[AUTH_SESSION] Mock Session payload:', { access_token: 'mock-jwt-token' });
    console.log('[AUTH_SESSION] Mock Zustand user stored:', mockUser);
    console.log('[AUTH_LOGIN_SUCCESS] Mock User login successful');
    set({ user: mockUser, session: { access_token: 'mock-jwt-token' }, authInitialized: true });
    
    get().fetchContext();
  },

  logout: async () => {
    console.log('[AUTH_SIGNED_OUT] User logging out');
    try {
      const hasKeys = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      if (supabase && hasKeys) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during Supabase signout', err);
    } finally {
      localStorage.removeItem('carbonsense_chat_history');
      localStorage.removeItem('carbonsense_demo_chat_history');
      localStorage.removeItem('carbonsense_mock_user');
      set({ 
        user: null, 
        session: null, 
        isDemoMode: false,
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
    if (get().isDemoMode) {
      console.log('[DEMO_MODE] fetchContext bypassed, using mock dataset');
      set({ isLoading: false });
      return;
    }
    
    // Prevent duplicate concurrent requests to avoid Supabase auth rate limits
    if (get().isLoading) {
      console.log('[FETCH_CONTEXT] Already loading context, skipping duplicate request.');
      return;
    }
    
    // If all profiles are already hydrated, we don't need to fetch them again just because of navigation
    if (get().carbonDNAProfile && get().planetTwinProfile && get().optimizationPlan && get().forecastProfile && get().behaviorProfile) {
      console.log('[FETCH_CONTEXT] Profiles already hydrated, skipping unnecessary request.');
      return;
    }

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
    } catch (err: unknown) {
      console.error('Failed to fetch user carbon telemetry:', err);
      
      let mappedError = 'system_unavailable';
      const status = (err as Error & { status?: number }).status;
      const message = ((err as Error).message || '').toLowerCase();
      
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
        console.error('[SESSION_EXPIRED_TRIGGER]');
        console.error(`Reason: Matched auth error conditions`);
        console.error(`Status: ${status}`);
        console.error(`Message: ${message}`);
        console.error(`[AUTH_STATE] User: ${!!get().user}, Session: ${!!get().session}, JWT Present: ${!!get().session?.access_token}`);
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

  enterDemoMode: () => {
    console.log('[DEMO_MODE] Entering/Resetting demo mode state');
    set({
      user: demoUser,
      session: { access_token: 'demo-jwt-token' },
      isDemoMode: true,
      authInitialized: true,
      carbonEntries: [...demoCarbonEntries],
      behaviorProfile: { ...demoBehaviorProfile },
      forecastProfile: { ...demoForecastProfile },
      optimizationPlan: { ...demoOptimizationPlan },
      carbonDNAProfile: { ...demoCarbonDNAProfile },
      planetTwinProfile: { ...demoPlanetTwinProfile },
      chatHistory: [...demoChatHistory] as ChatMessage[],
      isLoading: false,
      error: null
    });
  },

  addChatMessage: (msg) => {
    const isDemo = get().isDemoMode;
    const newHistory = [...get().chatHistory, msg];
    if (isDemo) {
      localStorage.setItem('carbonsense_demo_chat_history', JSON.stringify(newHistory));
    } else {
      localStorage.setItem('carbonsense_chat_history', JSON.stringify(newHistory));
    }
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
    if (get().isDemoMode) {
      localStorage.setItem('carbonsense_demo_chat_history', JSON.stringify(welcome));
    } else {
      localStorage.setItem('carbonsense_chat_history', JSON.stringify(welcome));
    }
    set({ chatHistory: welcome as ChatMessage[] });
  }
}));

export default useCarbonStore;

