import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, Color, ColorRarity } from '@/types/game';
import { GAME_CONFIG, PROGRESSION_TIMELINE } from '@/config/game';
import { GameAPI } from '@/lib/supabase';
import { ColorGenerator } from '@/utils/colorGenerator';
import { useUserStore } from './userStore';
import { useStakingStore } from './stakingStore';

interface RefactoredGameState {
  // Core game data
  gallery: Color[];
  flowTokens: number;
  receivedFreeColor: boolean;
  highestRarityAchieved: ColorRarity;
  startDate: Date;
  
  // Progress flags
  receivedAscendantReward: boolean;
  receivedUniqueReward: boolean;
  receivedUlteriorReward: boolean;
  receivedUltimateReward: boolean;
  
  // Actions
  initializeGame: (userId: number) => Promise<void>;
  createFreeStarterColor: () => Promise<void>;
  purchaseColor: (rarity: ColorRarity, paymentMethod: 'stars' | 'tokens') => Promise<void>;
  renameColor: (colorId: string, newName: string) => Promise<void>;
  resetCollection: () => Promise<void>;
  getAvailableForPurchase: () => ColorRarity[];
  
  // Test/Demo functions
  createTestColors: () => Promise<void>;
  createQuickTestColor: () => void;
}

export const useRefactoredGameStore = create<RefactoredGameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gallery: [],
    flowTokens: 100,
    receivedFreeColor: false,
    highestRarityAchieved: 'common',
    startDate: new Date(),
    receivedAscendantReward: false,
    receivedUniqueReward: false,
    receivedUlteriorReward: false,
    receivedUltimateReward: false,

    // Actions
    initializeGame: async (userId: number) => {
      try {
        // Initialize user first
        await useUserStore.getState().initializeUser(userId);
        
        // Load game data
        const [colors, marketplaceListings] = await Promise.all([
          GameAPI.getUserColors(userId),
          GameAPI.getMarketplaceListings()
        ]);

        // Get user data from user store
        const userStore = useUserStore.getState();
        const dbUser = await GameAPI.getOrCreateUser(userId, {
          username: userStore.user?.username,
          firstName: userStore.user?.first_name || '',
          lastName: userStore.user?.last_name
        });

        set({
          gallery: colors,
          flowTokens: dbUser.flow_tokens,
          receivedFreeColor: dbUser.received_free_color,
          highestRarityAchieved: dbUser.highest_rarity_achieved as ColorRarity,
          startDate: new Date(dbUser.start_date)
        });

        console.log('Game initialized:', {
          colors: colors.length,
          flowTokens: dbUser.flow_tokens,
          receivedFreeColor: dbUser.received_free_color
        });

      } catch (error) {
        console.error('Game initialization error:', error);
        throw error;
      }
    },

    createFreeStarterColor: async () => {
      const userStore = useUserStore.getState();
      const { user, isDemoMode } = userStore;
      const { receivedFreeColor } = get();
      
      if (!user || receivedFreeColor) return;

      try {
        const color = ColorGenerator.generateColor('common');
        console.log('Created color:', color);
        
        if (isDemoMode) {
          // Demo mode - just update state
          set(state => ({
            gallery: [...state.gallery, color],
            receivedFreeColor: true
          }));
        } else {
          // Normal mode - update database
          await GameAPI.createColor(user.id, color);
          await GameAPI.updateUserFreeColorFlag(user.id);
          
          set(state => ({
            gallery: [...state.gallery, color],
            receivedFreeColor: true
          }));
        }

        console.log('Created starter color:', color);
      } catch (error) {
        console.error('Error creating starter color:', error);
        throw error;
      }
    },

    purchaseColor: async (rarity: ColorRarity, paymentMethod: 'stars' | 'tokens') => {
      const userStore = useUserStore.getState();
      const { user } = userStore;
      const { flowTokens } = get();
      
      if (!user) return;

      const available = get().getAvailableForPurchase();
      if (!available.includes(rarity)) {
        throw new Error(`Color rarity ${rarity} not available for purchase yet`);
      }

      try {
        const color = ColorGenerator.generateColor(rarity);
        
        if (paymentMethod === 'tokens') {
          const price = GAME_CONFIG.STAR_PRICES[rarity] * 10; // Approximate rate
          if (flowTokens < price) {
            throw new Error('Insufficient FlowTokens');
          }
          
          await GameAPI.updateUserTokens(user.id, flowTokens - price);
          set(state => ({ flowTokens: state.flowTokens - price }));
        } else {
          // Stars purchase handled through Telegram Payments API
          const priceStars = GAME_CONFIG.STAR_PRICES[rarity];
          await GameAPI.recordStarPurchase(user.id, rarity, priceStars);
        }

        await GameAPI.createColor(user.id, color);
        
        set(state => ({
          gallery: [...state.gallery, color]
        }));

        console.log(`Purchased ${rarity} color:`, color);
      } catch (error) {
        console.error('Error purchasing color:', error);
        throw error;
      }
    },

    renameColor: async (colorId: string, newName: string) => {
      const userStore = useUserStore.getState();
      const { user, isDemoMode } = userStore;
      const { gallery } = get();
      
      if (!user) return;

      const colorIndex = gallery.findIndex(c => c.id === colorId);
      if (colorIndex === -1) {
        throw new Error('Color not found');
      }

      // Validation
      if (!newName.trim() || newName.length > 25) {
        throw new Error('Name must be 1-25 characters');
      }

      // Simple profanity check (can be expanded)
      const badWords = ['bad', 'word']; // Placeholder
      if (badWords.some(word => newName.toLowerCase().includes(word))) {
        throw new Error('Name contains inappropriate words');
      }

      try {
        if (!isDemoMode) {
          // Update database in normal mode
          await GameAPI.updateColorName(user.id, colorId, newName.trim());
        }

        // Update state
        set(state => ({
          gallery: state.gallery.map(color => 
            color.id === colorId 
              ? { ...color, name: newName.trim() }
              : color
          )
        }));

        console.log(`Color ${colorId} renamed to "${newName}"`);
      } catch (error) {
        console.error('Error renaming color:', error);
        throw error;
      }
    },

    resetCollection: async () => {
      const userStore = useUserStore.getState();
      const { user } = userStore;
      
      if (!user) return;

      try {
        // Delete all colors from database
        await GameAPI.resetUserData(user.id);
        
        // Clear gallery and reset game state
        set({
          gallery: [],
          receivedFreeColor: false,
          flowTokens: 100,
          highestRarityAchieved: 'common'
        });
        
        // Reset palettes in staking store
        const stakingStore = useStakingStore.getState();
        // Reset would need to be implemented in staking store
        
        console.log('Collection reset');
      } catch (error) {
        console.error('Error resetting collection:', error);
        throw error;
      }
    },

    getAvailableForPurchase: (): ColorRarity[] => {
      const { startDate, highestRarityAchieved } = get();
      const userStore = useUserStore.getState();
      const { isDemoMode } = userStore;
      
      const daysPlaying = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const available: ColorRarity[] = [];
      
      // In demo mode make all rarities available for testing
      if (isDemoMode) {
        return ['uncommon', 'rare', 'mythical', 'ascendant', 'unique', 'ulterior', 'ultimate'];
      }
      
      for (const rarity of GAME_CONFIG.RARITY_LEVELS) {
        const requiredDays = PROGRESSION_TIMELINE[rarity] || 0;
        const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
        const highestIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(highestRarityAchieved);
        
        // Available if enough days passed AND player reached previous level
        if (daysPlaying >= requiredDays && rarityIndex <= highestIndex + 1 && rarityIndex > 0) {
          available.push(rarity);
        }
      }
      
      return available;
    },

    // Test/Demo functions
    createTestColors: async () => {
      if (window.location.hostname !== 'localhost') return;
      
      const userStore = useUserStore.getState();
      const { user } = userStore;
      
      if (!user) return;

      try {
        const testColors = [
          ColorGenerator.generateColor('common'),
          ColorGenerator.generateColor('uncommon'),
          ColorGenerator.generateColor('rare')
        ];

        console.log('Test colors:', testColors);

        for (const color of testColors) {
          await GameAPI.createColor(user.id, color);
        }

        set(state => ({
          gallery: [...state.gallery, ...testColors]
        }));

        console.log('Created test colors:', testColors.length);
      } catch (error) {
        console.error('Error creating test colors:', error);
      }
    },

    createQuickTestColor: () => {
      if (window.location.hostname !== 'localhost') return;
      
      const testColors = [
        {
          id: `test-common-${Date.now()}`,
          rarity: 'common' as ColorRarity,
          hex: '#FF5733',
          name: 'Orange Dawn #1',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-uncommon-${Date.now() + 1}`,
          rarity: 'uncommon' as ColorRarity,
          hex: '#33FF57',
          name: 'Emerald Grove #2',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-rare-${Date.now() + 2}`,
          rarity: 'rare' as ColorRarity,
          hex: '#3357FF',
          name: 'Sky Abyss #3',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-mythical-${Date.now() + 3}`,
          rarity: 'mythical' as ColorRarity,
          hex: '#8E44AD',
          name: 'Mystic Aura #4',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        }
      ];

      console.log('Creating quick test colors:', testColors);

      set(state => ({
        gallery: [...state.gallery, ...testColors]
      }));
    }
  }))
);

// Subscribe to staking completion
useStakingStore.subscribe(
  (state) => state.palettes,
  () => {
    const stakingStore = useStakingStore.getState();
    const completedStakings = stakingStore.updateStakingProgress();
    
    // Handle completed stakings
    completedStakings.forEach(async (rarity) => {
      const userStore = useUserStore.getState();
      if (userStore.user) {
        const newColor = await stakingStore.completeStaking(rarity, userStore.user.id);
        if (newColor) {
          // Add new color to gallery
          useRefactoredGameStore.setState(state => ({
            gallery: [...state.gallery, newColor]
          }));
        }
      }
    });
  }
);