import { useMemo } from 'react';
import { useStakingStore } from '@/store/stakingStore';
import { useRefactoredGameStore } from '@/store/gameStore.refactored';
import { useUserStore } from '@/store/userStore';
import { ColorRarity, Color } from '@/types/game';

export const useStaking = () => {
  const palettes = useStakingStore(state => state.palettes);
  const activePaletteTab = useStakingStore(state => state.activePaletteTab);
  const setActivePaletteTab = useStakingStore(state => state.setActivePaletteTab);
  const startStaking = useStakingStore(state => state.startStaking);
  const cancelStaking = useStakingStore(state => state.cancelStaking);
  const upgradeColors = useStakingStore(state => state.upgradeColors);
  const addColorToPalette = useStakingStore(state => state.addColorToPalette);
  const removeColorFromPalette = useStakingStore(state => state.removeColorFromPalette);

  const gallery = useRefactoredGameStore(state => state.gallery);
  const user = useUserStore(state => state.user);
  const isDemoMode = useUserStore(state => state.isDemoMode);

  // Get active staking info
  const activeStaking = useMemo(() => {
    return Object.entries(palettes).find(([_, palette]) => palette.isStaking);
  }, [palettes]);

  const activeStakingRarity = activeStaking?.[0] as ColorRarity | undefined;
  const activeStakingPalette = activeStaking?.[1];

  // Get available colors for a specific rarity
  const getAvailableColorsForRarity = (rarity: ColorRarity) => {
    return gallery.filter(color => 
      color.rarity === rarity && 
      // Color is not in any palette
      !Object.values(palettes).some(palette => 
        palette.colors.some(c => c?.id === color.id)
      )
    );
  };

  // Get palette progress info
  const getPaletteProgress = (rarity: ColorRarity) => {
    const palette = palettes[rarity];
    const filledSlots = palette.colors.filter(c => c !== null).length;
    const canUpgrade = filledSlots === palette.maxSlots && !palette.isStaking;
    const canStartStaking = filledSlots > 0 && !palette.isStaking && !activeStaking;

    return {
      filledSlots,
      maxSlots: palette.maxSlots,
      canUpgrade,
      canStartStaking,
      isStaking: palette.isStaking,
      stakingCount: palette.stakingCount,
      stakingStartTime: palette.stakingStartTime,
      stakingEndTime: palette.stakingEndTime
    };
  };

  // Calculate staking progress percentage
  const getStakingProgress = (rarity: ColorRarity): number => {
    const palette = palettes[rarity];
    if (!palette.isStaking || !palette.stakingStartTime || !palette.stakingEndTime) {
      return 0;
    }

    const now = Date.now();
    const startTime = typeof palette.stakingStartTime === 'number' 
      ? palette.stakingStartTime 
      : palette.stakingStartTime.getTime();
    const endTime = typeof palette.stakingEndTime === 'number' 
      ? palette.stakingEndTime 
      : palette.stakingEndTime.getTime();

    const elapsed = now - startTime;
    const total = endTime - startTime;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

    return progress;
  };

  // Format remaining time
  const formatTimeRemaining = (rarity: ColorRarity): string => {
    const palette = palettes[rarity];
    if (!palette.isStaking || !palette.stakingEndTime) {
      return '';
    }

    const now = Date.now();
    const endTime = typeof palette.stakingEndTime === 'number' 
      ? palette.stakingEndTime 
      : palette.stakingEndTime.getTime();
    
    const remaining = Math.max(0, endTime - now);
    
    if (remaining === 0) return "Completed";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Enhanced actions that integrate with game store
  const addColorToPaletteEnhanced = async (colorId: string, rarity: ColorRarity, slotIndex: number) => {
    const result = addColorToPalette(colorId, rarity, slotIndex, gallery);
    
    // Update gallery in game store
    useRefactoredGameStore.setState({ gallery: result.updatedGallery });
    
    return result;
  };

  const removeColorFromPaletteEnhanced = (rarity: ColorRarity, slotIndex: number) => {
    const result = removeColorFromPalette(rarity, slotIndex);
    
    if (result.colorToReturn) {
      // Return color to gallery
      useRefactoredGameStore.setState(state => ({
        gallery: [...state.gallery, result.colorToReturn!]
      }));
    }
    
    return result;
  };

  const startStakingEnhanced = async (rarity: ColorRarity) => {
    return startStaking(rarity, isDemoMode);
  };

  const cancelStakingEnhanced = (rarity: ColorRarity) => {
    const colorsToReturn = cancelStaking(rarity);
    
    // Return colors to gallery
    if (colorsToReturn.length > 0) {
      useRefactoredGameStore.setState(state => ({
        gallery: [...state.gallery, ...colorsToReturn]
      }));
    }
    
    return colorsToReturn;
  };

  const upgradeColorsEnhanced = async (rarity: ColorRarity) => {
    if (!user) throw new Error('User not found');
    
    const newColor = await upgradeColors(rarity, user.id);
    
    if (newColor) {
      // Add new color to gallery and update highest rarity
      useRefactoredGameStore.setState(state => ({
        gallery: [...state.gallery, newColor],
        highestRarityAchieved: newColor.rarity
      }));
    }
    
    return newColor;
  };

  // Auto-add first available color to palette
  const autoAddColorToPalette = (rarity: ColorRarity) => {
    const availableColors = getAvailableColorsForRarity(rarity);
    if (availableColors.length === 0) {
      throw new Error(`No available ${rarity} colors`);
    }

    const palette = palettes[rarity];
    const firstEmptySlot = palette.colors.findIndex(c => c === null);
    
    if (firstEmptySlot === -1) {
      throw new Error('No empty slots available');
    }

    return addColorToPaletteEnhanced(availableColors[0].id, rarity, firstEmptySlot);
  };

  return {
    // State
    palettes,
    activePaletteTab,
    activeStaking: activeStakingPalette,
    activeStakingRarity,

    // Actions
    setActivePaletteTab,
    addColorToPalette: addColorToPaletteEnhanced,
    removeColorFromPalette: removeColorFromPaletteEnhanced,
    startStaking: startStakingEnhanced,
    cancelStaking: cancelStakingEnhanced,
    upgradeColors: upgradeColorsEnhanced,
    autoAddColorToPalette,

    // Utilities
    getAvailableColorsForRarity,
    getPaletteProgress,
    getStakingProgress,
    formatTimeRemaining
  };
};