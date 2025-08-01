import { create } from 'zustand';
import { TelegramUser } from '@/types/telegram';
import { UserProfile, GlobalStats, Achievement } from '@/types/extended';
import { GameAPI } from '@/lib/supabase';

interface UserState {
  // User data
  user: TelegramUser | null;
  userProfile: UserProfile | null;
  globalStats: GlobalStats | null;
  achievementProgress: Achievement[] | null;
  isDemoMode: boolean;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: TelegramUser) => void;
  initializeUser: (userId: number) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  toggleDemoMode: () => void;
  deleteAccount: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  globalStats: null,
  achievementProgress: null,
  isDemoMode: true, // DEMO_MODE from config
  isInitialized: false,

  // Actions
  setUser: (user) => set({ user }),

  initializeUser: async (userId: number) => {
    try {
      const { user } = get();
      
      const dbUser = await GameAPI.getOrCreateUser(userId, {
        username: user?.username,
        firstName: user?.first_name || '',
        lastName: user?.last_name
      });

      set({ isInitialized: true });
      console.log('User initialized:', dbUser);
    } catch (error) {
      console.error('User initialization error:', error);
      throw error;
    }
  },

  loadUserProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const profile = await GameAPI.getUserProfile(user.id);
      set({ userProfile: profile });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  },

  loadGlobalStats: async () => {
    try {
      const stats = await GameAPI.getGlobalStats();
      set({ globalStats: stats });
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  },

  loadAchievements: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Mock achievements for now
      const achievements: Achievement[] = [
        {
          id: 'first_color',
          title: 'Первые шаги',
          description: 'Получите первый цвет',
          progress: 0, // Will be updated by game store
          target: 1,
          completed: false,
          reward: '10 FlowTokens'
        },
        {
          id: 'collector',
          title: 'Коллекционер',
          description: 'Соберите 10 цветов',
          progress: 0,
          target: 10,
          completed: false,
          reward: '50 FlowTokens'
        },
        {
          id: 'rare_collector',
          title: 'Ценитель редкости',
          description: 'Получите цвет редкости Rare или выше',
          progress: 0,
          target: 1,
          completed: false,
          reward: '100 FlowTokens'
        }
      ];
      
      set({ achievementProgress: achievements });
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  },

  toggleDemoMode: () => {
    if (window.location.hostname === 'localhost') {
      set(state => ({ isDemoMode: !state.isDemoMode }));
      console.log('Demo mode toggled:', !get().isDemoMode);
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return;

    try {
      await GameAPI.deleteUserAccount(user.id);
      
      // Clear user state
      set({
        user: null,
        isInitialized: false,
        userProfile: null,
        globalStats: null,
        achievementProgress: null
      });
      
      console.log('Account deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  updateUserProfile: async (updates: Partial<UserProfile>) => {
    const { user, userProfile } = get();
    if (!user || !userProfile) return;

    try {
      const updatedProfile = await GameAPI.updateUserProfile(user.id, updates);
      set({ userProfile: updatedProfile });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}));