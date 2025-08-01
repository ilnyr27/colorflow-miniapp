import { useMemo } from 'react';
import { useRefactoredGameStore } from '@/store/gameStore.refactored';
import { ColorRarity, Color } from '@/types/game';

export const useColors = () => {
  const gallery = useRefactoredGameStore(state => state.gallery);
  const createFreeStarterColor = useRefactoredGameStore(state => state.createFreeStarterColor);
  const purchaseColor = useRefactoredGameStore(state => state.purchaseColor);
  const renameColor = useRefactoredGameStore(state => state.renameColor);
  const getAvailableForPurchase = useRefactoredGameStore(state => state.getAvailableForPurchase);

  // Computed values
  const colorsByRarity = useMemo(() => {
    return gallery.reduce((acc, color) => {
      if (!acc[color.rarity]) {
        acc[color.rarity] = [];
      }
      acc[color.rarity].push(color);
      return acc;
    }, {} as Record<ColorRarity, Color[]>);
  }, [gallery]);

  const totalColors = gallery.length;

  const rarityDistribution = useMemo(() => {
    return gallery.reduce((acc, color) => {
      acc[color.rarity] = (acc[color.rarity] || 0) + 1;
      return acc;
    }, {} as Record<ColorRarity, number>);
  }, [gallery]);

  const availableColors = useMemo(() => {
    return gallery.filter(color => 
      // Color is not in any palette and not being staked
      !color.stakingCount || color.stakingCount === 0
    );
  }, [gallery]);

  const getColorsByRarity = (rarity: ColorRarity) => {
    return colorsByRarity[rarity] || [];
  };

  const findColorById = (id: string) => {
    return gallery.find(color => color.id === id);
  };

  const searchColors = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return gallery.filter(color => 
      color.name.toLowerCase().includes(lowerQuery) ||
      color.hex.toLowerCase().includes(lowerQuery) ||
      color.rarity.toLowerCase().includes(lowerQuery)
    );
  };

  const filterColors = (filters: {
    rarity?: ColorRarity | 'all';
    search?: string;
    sortBy?: 'date' | 'rarity' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) => {
    let filtered = [...gallery];

    // Filter by rarity
    if (filters.rarity && filters.rarity !== 'all') {
      filtered = filtered.filter(color => color.rarity === filters.rarity);
    }

    // Filter by search
    if (filters.search) {
      filtered = searchColors(filters.search);
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(a.dateObtained).getTime() - new Date(b.dateObtained).getTime();
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'rarity':
            const rarityOrder = ['common', 'uncommon', 'rare', 'mythical', 'legendary', 'ascendant', 'unique', 'ulterior', 'ultimate'];
            comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            break;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  };

  return {
    // Data
    gallery,
    colorsByRarity,
    totalColors,
    rarityDistribution,
    availableColors,

    // Actions
    createFreeStarterColor,
    purchaseColor,
    renameColor,
    getAvailableForPurchase,

    // Utilities
    getColorsByRarity,
    findColorById,
    searchColors,
    filterColors
  };
};