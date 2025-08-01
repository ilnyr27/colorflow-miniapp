import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ColorRarity, Palette, Color } from '@/types/game';
import { GAME_CONFIG } from '@/config/game';
import { GameAPI } from '@/lib/supabase';
import { ColorGenerator } from '@/utils/colorGenerator';

interface StakingState {
  palettes: Record<ColorRarity, Palette>;
  activePaletteTab: ColorRarity;
  
  // Actions
  setActivePaletteTab: (rarity: ColorRarity) => void;
  createPalette: (colorIds: string[]) => Promise<Palette>;
  addColorToPalette: (colorId: string, rarity: ColorRarity, slotIndex: number, gallery: Color[]) => { 
    updatedGallery: Color[], 
    updatedPalettes: Record<ColorRarity, Palette> 
  };
  removeColorFromPalette: (rarity: ColorRarity, slotIndex: number) => { 
    colorToReturn: Color | null,
    updatedPalettes: Record<ColorRarity, Palette> 
  };
  startStaking: (paletteId: string, isDemoMode: boolean) => Promise<void>;
  completeStaking: (rarity: ColorRarity, userId: number) => Promise<Color | null>;
  cancelStaking: (rarity: ColorRarity) => Color[];
  upgradeColors: (rarity: ColorRarity, userId: number) => Promise<Color | null>;
  updateStakingProgress: () => ColorRarity[];
}

const createInitialPalettes = (): Record<ColorRarity, Palette> => {
  const palettes = {} as Record<ColorRarity, Palette>;
  
  GAME_CONFIG.RARITY_LEVELS.forEach(rarity => {
    const maxSlots = GAME_CONFIG.UPGRADE_REQUIREMENTS[rarity] || 6;
    palettes[rarity] = {
      colors: new Array(maxSlots).fill(null),
      stakingCount: 0,
      maxSlots,
      isStaking: false,
      stakingEndTime: null,
      stakingStartTime: null
    };
  });
  
  return palettes;
};

export const useStakingStore = create<StakingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    palettes: createInitialPalettes(),
    activePaletteTab: 'common',

    // Actions
    setActivePaletteTab: (rarity: ColorRarity) => {
      set({ activePaletteTab: rarity });
    },

    createPalette: async (colorIds: string[]) => {
      // This would be implemented when gallery is passed from main store
      const newPalette: Palette = {
        id: `palette_${Date.now()}`,
        colors: [],
        rarity: 'common',
        stakingCount: 0,
        maxSlots: 6,
        isStaking: false,
        stakingEndTime: null,
        stakingStartTime: null
      };
      
      return newPalette;
    },

    addColorToPalette: (colorId: string, rarity: ColorRarity, slotIndex: number, gallery: Color[]) => {
      const { palettes } = get();
      
      const colorIndex = gallery.findIndex(c => c.id === colorId);
      if (colorIndex === -1) {
        throw new Error('Color not found in gallery');
      }
      
      const color = gallery[colorIndex];
      if (color.rarity !== rarity) {
        throw new Error(`Color rarity ${color.rarity} doesn't match palette ${rarity}`);
      }

      const palette = palettes[rarity];
      if (palette.colors[slotIndex] !== null) {
        throw new Error('Slot already occupied');
      }

      if (palette.isStaking) {
        throw new Error('Cannot modify palette during staking');
      }

      const updatedGallery = gallery.filter((_, i) => i !== colorIndex);
      const updatedPalettes = {
        ...palettes,
        [rarity]: {
          ...palette,
          colors: palette.colors.map((c, i) => 
            i === slotIndex ? color : c
          )
        }
      };

      set({ palettes: updatedPalettes });
      
      return { updatedGallery, updatedPalettes };
    },

    removeColorFromPalette: (rarity: ColorRarity, slotIndex: number) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (palette.isStaking) {
        throw new Error('Cannot modify palette during staking');
      }

      const color = palette.colors[slotIndex];
      if (!color) {
        return { colorToReturn: null, updatedPalettes: palettes };
      }

      const updatedPalettes = {
        ...palettes,
        [rarity]: {
          ...palette,
          colors: palette.colors.map((c, i) => 
            i === slotIndex ? null : c
          )
        }
      };

      set({ palettes: updatedPalettes });
      
      return { colorToReturn: color, updatedPalettes };
    },

    startStaking: async (paletteId: string, isDemoMode: boolean) => {
      const { palettes } = get();
      const palette = palettes[paletteId as ColorRarity];
      
      if (!palette) throw new Error('Palette not found');
      if (palette.isStaking) throw new Error('Staking already in progress');
      
      // Check if any other palette is staking
      const isAnyStaking = Object.values(palettes).some(p => p.isStaking);
      if (isAnyStaking) {
        throw new Error('Only one staking can be active at a time');
      }
      
      // Calculate staking time
      let stakingTimeMs: number;
      
      if (isDemoMode) {
        const stakingTimes = {
          common: 417, // ~0.4 sec
          uncommon: 1250, // ~1.25 sec  
          rare: 2500, // ~2.5 sec
          mythical: 7500, // ~7.5 sec
          legendary: 17500, // ~17.5 sec
          ascendant: 35000, // ~35 sec
          unique: 75000, // ~75 sec
          ulterior: 150000, // ~150 sec
          ultimate: 0
        };
        stakingTimeMs = stakingTimes[paletteId as ColorRarity] || 417;
      } else {
        // Normal mode - 2 hours
        stakingTimeMs = 2 * 60 * 60 * 1000;
      }
      
      const stakingEndTime = Date.now() + stakingTimeMs;
      
      set(state => ({
        palettes: {
          ...state.palettes,
          [paletteId]: {
            ...palette,
            isStaking: true,
            stakingStartTime: Date.now(),
            stakingEndTime
          }
        }
      }));
      
      const timeDisplay = isDemoMode ? 
        `${Math.round(stakingTimeMs / 1000 * 10) / 10} seconds` : 
        `2 hours`;
      console.log(`Staking started for ${timeDisplay}`);
    },

    completeStaking: async (rarity: ColorRarity, userId: number) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (!palette.isStaking) return null;

      try {
        // Create new color of same rarity
        const newColor = ColorGenerator.generateColor(rarity);
        await GameAPI.createColor(userId, newColor);

        set(state => ({
          palettes: {
            ...state.palettes,
            [rarity]: {
              ...state.palettes[rarity],
              isStaking: false,
              stakingStartTime: null,
              stakingEndTime: null,
              stakingCount: state.palettes[rarity].stakingCount + 1
            }
          }
        }));

        console.log(`Staking ${rarity} completed, new color:`, newColor);
        return newColor;
      } catch (error) {
        console.error('Error completing staking:', error);
        return null;
      }
    },

    cancelStaking: (rarity: ColorRarity) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (!palette.isStaking) {
        throw new Error('No active staking to cancel');
      }

      // Return colors from palette
      const colorsToReturn = palette.colors.filter(c => c !== null) as Color[];

      set(state => ({
        palettes: {
          ...state.palettes,
          [rarity]: {
            ...state.palettes[rarity],
            isStaking: false,
            stakingStartTime: null,
            stakingEndTime: null,
            colors: new Array(palette.maxSlots).fill(null)
          }
        }
      }));

      console.log(`Staking ${rarity} canceled, colors returned to gallery`);
      return colorsToReturn;
    },

    upgradeColors: async (rarity: ColorRarity, userId: number) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      const filledSlots = palette.colors.filter(c => c !== null).length;
      
      if (filledSlots < palette.maxSlots) {
        throw new Error(`Need to fill all ${palette.maxSlots} slots`);
      }

      if (palette.isStaking) {
        throw new Error('Cannot upgrade during staking');
      }

      const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
      if (rarityIndex >= GAME_CONFIG.RARITY_LEVELS.length - 1) {
        throw new Error('This is maximum rarity level');
      }

      const nextRarity = GAME_CONFIG.RARITY_LEVELS[rarityIndex + 1];

      try {
        // Create color of next rarity
        const newColor = ColorGenerator.generateColor(nextRarity);
        await GameAPI.createColor(userId, newColor);

        // Clear palette and reset staking count
        set(state => ({
          palettes: {
            ...state.palettes,
            [rarity]: {
              ...state.palettes[rarity],
              colors: new Array(palette.maxSlots).fill(null),
              stakingCount: 0
            }
          }
        }));

        console.log(`Upgrade ${rarity} → ${nextRarity} completed:`, newColor);
        return newColor;
      } catch (error) {
        console.error('Error upgrading colors:', error);
        throw error;
      }
    },

    updateStakingProgress: () => {
      const { palettes } = get();
      const now = Date.now();
      const completedStakings: ColorRarity[] = [];
      
      for (const rarity of GAME_CONFIG.RARITY_LEVELS) {
        const palette = palettes[rarity];
        if (palette.isStaking && palette.stakingEndTime) {
          const stakingEndTime = typeof palette.stakingEndTime === 'number' 
            ? palette.stakingEndTime 
            : palette.stakingEndTime.getTime();
            
          if (now >= stakingEndTime) {
            completedStakings.push(rarity);
          }
        }
      }
      
      return completedStakings;
    }
  }))
);

// Subscribe to staking progress updates
useStakingStore.subscribe(
  (state) => state.palettes,
  () => {
    const completedStakings = useStakingStore.getState().updateStakingProgress();
    // The main game store will handle completion
  }
);