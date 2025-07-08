import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, Color, ColorRarity, Palette } from '@/types/game';
import { TelegramUser } from '@/types/telegram';
import { GAME_CONFIG, PROGRESSION_TIMELINE } from '@/config/game';
import { GameAPI } from '@/lib/supabase';
import { ColorGenerator } from '@/utils/colorGenerator';

interface GameStore extends GameState {
  // User data
  user: TelegramUser | null;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: TelegramUser) => void;
  initializeGame: (userId: number) => Promise<void>;
  
  // Color actions
  createFreeStarterColor: () => Promise<void>;
  purchaseColor: (rarity: ColorRarity, paymentMethod: 'stars' | 'tokens') => Promise<void>;
  
  // Palette actions
  addColorToPalette: (colorId: string, rarity: ColorRarity, slotIndex: number) => Promise<void>;
  removeColorFromPalette: (rarity: ColorRarity, slotIndex: number) => Promise<void>;
  
  // Staking actions
  startStaking: (rarity: ColorRarity) => Promise<void>;
  completeStaking: (rarity: ColorRarity) => Promise<void>;
  upgradeColors: (rarity: ColorRarity) => Promise<void>;
  
  // Marketplace actions
  listColorForSale: (colorId: string, priceStars: number) => Promise<void>;
  purchaseFromMarketplace: (listingId: string) => Promise<void>;
  
  // Utility actions
  setActivePaletteTab: (rarity: ColorRarity) => void;
  getAvailableForPurchase: () => ColorRarity[];
  updateStakingProgress: () => void;
}

const createInitialPalettes = (): Record<ColorRarity, Palette> => {
  const palettes = {} as Record<ColorRarity, Palette>;
  
  GAME_CONFIG.RARITY_LEVELS.forEach(rarity => {
    const maxSlots = GAME_CONFIG.UPGRADE_REQUIREMENTS[rarity];
    palettes[rarity] = {
      colors: new Array(maxSlots).fill(null),
      stakingCount: 0,
      maxSlots,
      isStaking: false,
      stakingEndTime: null,
      stakingStart: null
    };
  });
  
  return palettes;
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isInitialized: false,
    gallery: [],
    palettes: createInitialPalettes(),
    activePaletteTab: 'common',
    marketplaceListings: [],
    flowTokens: 100,
    remainingColors: { ...GAME_CONFIG.TOTAL_COLOR_COUNTS },
    receivedFreeColor: false,
    highestRarityAchieved: 'common',
    startDate: new Date(),
    receivedAscendantReward: false,
    receivedUniqueReward: false,
    receivedUlteriorReward: false,
    receivedUltimateReward: false,

    // Actions
    setUser: (user) => set({ user }),

    initializeGame: async (userId: number) => {
      try {
        // Загружаем данные пользователя из БД
        const [dbUser, colors, marketplaceListings] = await Promise.all([
          GameAPI.getOrCreateUser(userId, {
            username: get().user?.username,
            firstName: get().user?.first_name || '',
            lastName: get().user?.last_name
          }),
          GameAPI.getUserColors(userId),
          GameAPI.getMarketplaceListings()
        ]);

        set({
          gallery: colors,
          flowTokens: dbUser.flow_tokens,
          receivedFreeColor: dbUser.received_free_color,
          highestRarityAchieved: dbUser.highest_rarity_achieved as ColorRarity,
          startDate: new Date(dbUser.start_date),
          marketplaceListings,
          isInitialized: true
        });

        console.log('Игра инициализирована:', {
          colors: colors.length,
          flowTokens: dbUser.flow_tokens,
          receivedFreeColor: dbUser.received_free_color
        });

      } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        throw error;
      }
    },

    createFreeStarterColor: async () => {
      const { user } = get();
      if (!user || get().receivedFreeColor) return;

      try {
        const color = ColorGenerator.generateColor('common');
        
        // Создаем цвет в базе данных
        await GameAPI.createColor(user.id, color);
        
        // КРИТИЧЕСКИ ВАЖНО: Обновляем флаг в базе данных
        await GameAPI.updateUserFreeColorFlag(user.id);
        
        set(state => ({
          gallery: [...state.gallery, color],
          receivedFreeColor: true
        }));

        console.log('Создан стартовый цвет:', color);
      } catch (error) {
        console.error('Ошибка создания стартового цвета:', error);
        throw error;
      }
    },

    purchaseColor: async (rarity: ColorRarity, paymentMethod: 'stars' | 'tokens') => {
      const { user, flowTokens } = get();
      if (!user) return;

      const available = get().getAvailableForPurchase();
      if (!available.includes(rarity)) {
        throw new Error(`Цвет редкости ${rarity} пока недоступен для покупки`);
      }

      try {
        const color = ColorGenerator.generateColor(rarity);
        
        if (paymentMethod === 'tokens') {
          const price = GAME_CONFIG.STAR_PRICES[rarity] * 10; // Примерный курс
          if (flowTokens < price) {
            throw new Error('Недостаточно FlowTokens');
          }
          
          await GameAPI.updateUserTokens(user.id, flowTokens - price);
          set(state => ({ flowTokens: state.flowTokens - price }));
        } else {
          // Покупка за Stars обрабатывается через Telegram Payments API
          const priceStars = GAME_CONFIG.STAR_PRICES[rarity];
          await GameAPI.recordStarPurchase(user.id, rarity, priceStars);
        }

        await GameAPI.createColor(user.id, color);
        
        set(state => ({
          gallery: [...state.gallery, color]
        }));

        console.log(`Куплен цвет ${rarity}:`, color);
      } catch (error) {
        console.error('Ошибка покупки цвета:', error);
        throw error;
      }
    },

    addColorToPalette: async (colorId: string, rarity: ColorRarity, slotIndex: number) => {
      const { gallery, palettes } = get();
      
      const colorIndex = gallery.findIndex(c => c.id === colorId);
      if (colorIndex === -1) return;
      
      const color = gallery[colorIndex];
      if (color.rarity !== rarity) {
        throw new Error(`Цвет редкости ${color.rarity} нельзя добавить в палитру ${rarity}`);
      }

      const palette = palettes[rarity];
      if (palette.colors[slotIndex] !== null) {
        throw new Error('Слот уже занят');
      }

      if (palette.isStaking) {
        throw new Error('Нельзя изменять палитру во время стейкинга');
      }

      set(state => ({
        gallery: state.gallery.filter((_, i) => i !== colorIndex),
        palettes: {
          ...state.palettes,
          [rarity]: {
            ...state.palettes[rarity],
            colors: state.palettes[rarity].colors.map((c, i) => 
              i === slotIndex ? color : c
            )
          }
        }
      }));
    },

    removeColorFromPalette: async (rarity: ColorRarity, slotIndex: number) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (palette.isStaking) {
        throw new Error('Нельзя изменять палитру во время стейкинга');
      }

      const color = palette.colors[slotIndex];
      if (!color) return;

      set(state => ({
        gallery: [...state.gallery, color],
        palettes: {
          ...state.palettes,
          [rarity]: {
            ...state.palettes[rarity],
            colors: state.palettes[rarity].colors.map((c, i) => 
              i === slotIndex ? null : c
            )
          }
        }
      }));
    },

    startStaking: async (rarity: ColorRarity) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (palette.isStaking) {
        throw new Error('Стейкинг уже запущен');
      }

      const filledSlots = palette.colors.filter(c => c !== null).length;
      if (filledSlots === 0) {
        throw new Error('В палитре нет цветов для стейкинга');
      }

      // Проверяем, не идет ли стейкинг в других палитрах
      const isAnyStaking = Object.values(palettes).some(p => p.isStaking);
      if (isAnyStaking) {
        throw new Error('Уже идет стейкинг в другой палитре');
      }

      const stakingTimeHours = GAME_CONFIG.STAKING_TIME_TABLE[rarity][
        Math.min(palette.stakingCount, GAME_CONFIG.STAKING_TIME_TABLE[rarity].length - 1)
      ];
      
      const stakingEndTime = new Date(Date.now() + stakingTimeHours * 60 * 60 * 1000);

      set(state => ({
        palettes: {
          ...state.palettes,
          [rarity]: {
            ...state.palettes[rarity],
            isStaking: true,
            stakingStart: new Date(),
            stakingEndTime
          }
        }
      }));

      // Устанавливаем таймер для завершения стейкинга
      setTimeout(() => {
        get().completeStaking(rarity);
      }, stakingTimeHours * 60 * 60 * 1000);

      console.log(`Стейкинг ${rarity} запущен на ${stakingTimeHours} часов`);
    },

    completeStaking: async (rarity: ColorRarity) => {
      const { user, palettes } = get();
      if (!user) return;

      const palette = palettes[rarity];
      if (!palette.isStaking) return;

      try {
        // Создаем новый цвет той же редкости
        const newColor = ColorGenerator.generateColor(rarity);
        await GameAPI.createColor(user.id, newColor);

        set(state => ({
          gallery: [...state.gallery, newColor],
          palettes: {
            ...state.palettes,
            [rarity]: {
              ...state.palettes[rarity],
              isStaking: false,
              stakingStart: null,
              stakingEndTime: null,
              stakingCount: state.palettes[rarity].stakingCount + 1
            }
          }
        }));

        console.log(`Стейкинг ${rarity} завершен, получен новый цвет:`, newColor);
      } catch (error) {
        console.error('Ошибка завершения стейкинга:', error);
      }
    },

    upgradeColors: async (rarity: ColorRarity) => {
      const { user, palettes } = get();
      if (!user) return;

      const palette = palettes[rarity];
      const filledSlots = palette.colors.filter(c => c !== null).length;
      
      if (filledSlots < palette.maxSlots) {
        throw new Error(`Нужно заполнить все ${palette.maxSlots} слотов`);
      }

      if (palette.isStaking) {
        throw new Error('Нельзя улучшать во время стейкинга');
      }

      const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
      if (rarityIndex >= GAME_CONFIG.RARITY_LEVELS.length - 1) {
        throw new Error('Это максимальный уровень редкости');
      }

      const nextRarity = GAME_CONFIG.RARITY_LEVELS[rarityIndex + 1];

      try {
        // Создаем цвет следующей редкости
        const newColor = ColorGenerator.generateColor(nextRarity);
        await GameAPI.createColor(user.id, newColor);

        // Очищаем палитру и добавляем новый цвет в галерею
        set(state => ({
          gallery: [...state.gallery, newColor],
          palettes: {
            ...state.palettes,
            [rarity]: {
              ...state.palettes[rarity],
              colors: new Array(palette.maxSlots).fill(null),
              stakingCount: 0
            }
          },
          highestRarityAchieved: nextRarity
        }));

        console.log(`Улучшение ${rarity} → ${nextRarity} завершено:`, newColor);
      } catch (error) {
        console.error('Ошибка улучшения:', error);
        throw error;
      }
    },

    listColorForSale: async (colorId: string, priceStars: number) => {
      // TODO: Implement marketplace listing
      // Заглушка: добавить логику выставления цвета на продажу
      console.log('Listing color for sale:', colorId, priceStars);
    },

    purchaseFromMarketplace: async (listingId: string) => {
      // TODO: Implement marketplace purchase
      // Заглушка: добавить логику покупки с маркетплейса
      console.log('Purchasing from marketplace:', listingId);
    },

    setActivePaletteTab: (rarity: ColorRarity) => {
      set({ activePaletteTab: rarity });
    },

    getAvailableForPurchase: (): ColorRarity[] => {
      const { startDate, highestRarityAchieved } = get();
      const daysPlaying = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const available: ColorRarity[] = [];
      
      for (const rarity of GAME_CONFIG.RARITY_LEVELS) {
        const requiredDays = PROGRESSION_TIMELINE[rarity];
        const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
        const highestIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(highestRarityAchieved);
        
        // Доступно если прошло достаточно дней И игрок достиг предыдущего уровня
        if (daysPlaying >= requiredDays && rarityIndex <= highestIndex + 1 && rarityIndex > 0) {
          available.push(rarity);
        }
      }
      
      return available;
    },

    updateStakingProgress: () => {
      const { palettes } = get();
      const now = Date.now();
      
      for (const rarity of GAME_CONFIG.RARITY_LEVELS) {
        const palette = palettes[rarity];
        if (palette.isStaking && palette.stakingEndTime) {
          if (now >= palette.stakingEndTime.getTime()) {
            get().completeStaking(rarity);
          }
        }
      }
    }
  }))
);

// Подписываемся на изменения для автоматического обновления стейкинга
useGameStore.subscribe(
  (state) => state.palettes,
  () => {
    useGameStore.getState().updateStakingProgress();
  }
);
