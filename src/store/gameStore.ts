import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, Color, ColorRarity, Palette } from '@/types/game';
import { TelegramUser } from '@/types/telegram';
import { GlobalStats, Achievement, UserProfile } from '@/types/extended';
import { GAME_CONFIG, PROGRESSION_TIMELINE, DEMO_MODE, DEMO_TIME_MULTIPLIER } from '@/config/game';
import { GameAPI } from '@/lib/supabase';
import { ColorGenerator } from '@/utils/colorGenerator';

interface GameStore extends GameState {
  // User data
  user: TelegramUser | null;
  isInitialized: boolean;
  userProfile: UserProfile | null;
  globalStats: GlobalStats | null;
  achievementProgress: Achievement[] | null;
  isDemoMode: boolean;
  
  // Actions
  setUser: (user: TelegramUser) => void;
  initializeGame: (userId: number) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  toggleDemoMode: () => void;
  deleteAccount: () => Promise<void>;
  resetCollection: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createTestColors: () => Promise<void>;
  createQuickTestColor: () => void;
  
  // Color actions
  createFreeStarterColor: () => Promise<void>;
  purchaseColor: (rarity: ColorRarity, paymentMethod: 'stars' | 'tokens') => Promise<void>;
  
  // Palette actions
  createPalette: (colorIds: string[]) => Promise<Palette>;
  addColorToPalette: (colorId: string, rarity: ColorRarity, slotIndex: number) => Promise<void>;
  removeColorFromPalette: (rarity: ColorRarity, slotIndex: number) => Promise<void>;
  
  // Staking actions
  startStaking: (paletteId: string) => Promise<void>;
  completeStaking: (rarity: ColorRarity) => Promise<void>;
  cancelStaking: (rarity: ColorRarity) => Promise<void>;
  upgradeColors: (rarity: ColorRarity) => Promise<void>;
  
  // Marketplace actions
  buyShopItem: (itemId: string) => Promise<void>;
  createMarketListing: (colorId: string, price: number) => Promise<void>;
  buyFromMarket: (listingId: string) => Promise<void>;
  listColorForSale: (colorId: string, priceStars: number) => Promise<void>;
  purchaseFromMarketplace: (listingId: string) => Promise<void>;
  
  // Utility actions
  setActivePaletteTab: (rarity: ColorRarity) => void;
  getAvailableForPurchase: () => ColorRarity[];
  updateStakingProgress: () => void;
  renameColor: (colorId: string, newName: string) => Promise<void>;
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
      stakingStartTime: null
    };
  });
  
  return palettes;
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isInitialized: false,
    userProfile: null,
    globalStats: null,
    achievementProgress: null,
    isDemoMode: DEMO_MODE,
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
      const { user, isDemoMode } = get();
      if (!user || get().receivedFreeColor) return;

      try {
        const color = ColorGenerator.generateColor('common');
        console.log('Созданный цвет:', color);
        
        if (isDemoMode) {
          // В демо-режиме просто обновляем состояние
          set(state => ({
            gallery: [...state.gallery, color],
            receivedFreeColor: true
          }));
        } else {
          // В обычном режиме обновляем базу данных
          await GameAPI.createColor(user.id, color);
          await GameAPI.updateUserFreeColorFlag(user.id);
          
          set(state => ({
            gallery: [...state.gallery, color],
            receivedFreeColor: true
          }));
        }

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

    createPalette: async (colorIds: string[]) => {
      const { user, gallery } = get();
      if (!user) throw new Error('User not found');
      
      const selectedColors = colorIds.map(id => 
        gallery.find(color => color.id === id)
      ).filter(Boolean) as Color[];
      
      if (selectedColors.length < 2) {
        throw new Error('Минимум 2 цвета для создания палитры');
      }
      
      // Определяем редкость палитры на основе цветов
      const rarities = selectedColors.map(c => c.rarity);
      const hasRare = rarities.some(r => ['rare', 'epic', 'legendary', 'mythic'].includes(r));
      const paletteRarity = hasRare ? 'rare' : 'common';
      
      const newPalette: Palette = {
        id: `palette_${Date.now()}`,
        colors: selectedColors,
        rarity: paletteRarity as ColorRarity,
        stakingCount: 0,
        maxSlots: selectedColors.length,
        isStaking: false,
        stakingEndTime: null,
        stakingStartTime: null
      };
      
      // Удаляем использованные цвета из галереи
      set(state => ({
        gallery: state.gallery.filter(color => !colorIds.includes(color.id))
      }));
      
      return newPalette;
    },

    startStaking: async (paletteId: string) => {
      const { isDemoMode } = get();
      const palette = get().palettes[paletteId as ColorRarity];
      if (!palette) throw new Error('Palette not found');
      
      if (palette.isStaking) {
        throw new Error('Стейкинг уже запущен');
      }
      
      // Проверяем, не идет ли стейкинг в других палитрах
      const isAnyStaking = Object.values(get().palettes).some(p => p.isStaking);
      if (isAnyStaking) {
        throw new Error('Может быть активен только один стейкинг');
      }
      
      // Время стейкинга в зависимости от режима
      let stakingTimeMs: number;
      
      if (isDemoMode) {
        // В демо-режиме: 1 день = 0.01 секунды
        // Common = 1 час = 0.01/24 = 0.000417 сек = 0.417 мс
        const stakingTimes = {
          common: 417, // ~0.4 сек
          uncommon: 1250, // ~1.25 сек  
          rare: 2500, // ~2.5 сек
          mythical: 7500, // ~7.5 сек
          legendary: 17500, // ~17.5 сек
          ascendant: 35000, // ~35 сек
          unique: 75000, // ~75 сек
          ulterior: 150000, // ~150 сек
          ultimate: 0
        };
        stakingTimeMs = stakingTimes[paletteId as ColorRarity] || 417;
      } else {
        // Обычный режим - 2 часа
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
        `${Math.round(stakingTimeMs / 1000 * 10) / 10} секунд` : 
        `2 часов`;
      console.log(`Стейкинг запущен на ${timeDisplay}`);
    },

    buyShopItem: async (itemId: string) => {
      const { user, flowTokens } = get();
      if (!user) throw new Error('User not found');
      
      // Простая логика покупки - добавим цвета или токены
      if (itemId === 'starter_pack') {
        if (flowTokens < 100) throw new Error('Недостаточно токенов');
        
        // Создаем 5 случайных цветов
        const newColors = Array.from({ length: 5 }, () => 
          ColorGenerator.generateColor('common')
        );
        
        set(state => ({
          gallery: [...state.gallery, ...newColors],
          flowTokens: state.flowTokens - 100
        }));
      }
      
      console.log(`Куплен товар: ${itemId}`);
    },

    createMarketListing: async (colorId: string, price: number) => {
      const { user, gallery } = get();
      if (!user) throw new Error('User not found');
      
      const color = gallery.find(c => c.id === colorId);
      if (!color) throw new Error('Color not found');
      
      // Удаляем цвет из галереи и создаем листинг
      set(state => ({
        gallery: state.gallery.filter(c => c.id !== colorId)
      }));
      
      console.log(`Цвет выставлен на продажу: ${color.name} за ${price} токенов`);
    },

    buyFromMarket: async (listingId: string) => {
      const { user, flowTokens } = get();
      if (!user) throw new Error('User not found');
      
      // Заглушка для покупки с маркетплейса
      console.log(`Покупка с маркетплейса: ${listingId}`);
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
              stakingStartTime: null,
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

    cancelStaking: async (rarity: ColorRarity) => {
      const { palettes } = get();
      const palette = palettes[rarity];
      
      if (!palette.isStaking) {
        throw new Error('Стейкинг не запущен');
      }

      // Возвращаем цвета из палитры в галерею
      const colorsToReturn = palette.colors.filter(c => c !== null);

      set(state => ({
        gallery: [...state.gallery, ...colorsToReturn],
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

      console.log(`Стейкинг ${rarity} отменен, цвета возвращены в галерею`);
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
      
      // В демо-режиме делаем доступными все редкости для тестирования
      if (DEMO_MODE) {
        return ['uncommon', 'rare', 'mythical', 'ascendant', 'unique', 'ulterior', 'ultimate'];
      }
      
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
          const stakingEndTime = typeof palette.stakingEndTime === 'number' ? palette.stakingEndTime : palette.stakingEndTime.getTime();
          if (now >= stakingEndTime) {
            get().completeStaking(rarity);
          }
        }
      }
    },     

    // Новые действия для статистики и настроек
    loadUserProfile: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const profile = await GameAPI.getUserProfile(user.id);
        set({ userProfile: profile });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    },

    loadGlobalStats: async () => {
      try {
        const stats = await GameAPI.getGlobalStats();
        set({ globalStats: stats });
      } catch (error) {
        console.error('Ошибка загрузки глобальной статистики:', error);
      }
    },

    loadAchievements: async () => {
      const { user } = get();
      if (!user) return;

      try {
        // Создаем моковые достижения для демонстрации
        const achievements: Achievement[] = [
          {
            id: 'first_color',
            title: 'Первые шаги',
            description: 'Получите первый цвет',
            progress: get().gallery.length > 0 ? 1 : 0,
            target: 1,
            completed: get().gallery.length > 0,
            reward: '10 FlowTokens'
          },
          {
            id: 'collector',
            title: 'Коллекционер',
            description: 'Соберите 10 цветов',
            progress: Math.min(get().gallery.length, 10),
            target: 10,
            completed: get().gallery.length >= 10,
            reward: '50 FlowTokens'
          },
          {
            id: 'rare_collector',
            title: 'Ценитель редкости',
            description: 'Получите цвет редкости Rare или выше',
            progress: get().gallery.some(c => ['rare', 'mythical', 'legendary'].includes(c.rarity)) ? 1 : 0,
            target: 1,
            completed: get().gallery.some(c => ['rare', 'mythical', 'legendary'].includes(c.rarity)),
            reward: '100 FlowTokens'
          }
        ];
        
        set({ achievementProgress: achievements });
      } catch (error) {
        console.error('Ошибка загрузки достижений:', error);
      }
    },

    toggleDemoMode: () => {
      if (window.location.hostname === 'localhost') {
        set(state => ({ isDemoMode: !state.isDemoMode }));
        console.log('Демо-режим переключен:', !get().isDemoMode);
      }
    },

    deleteAccount: async () => {
      const { user } = get();
      if (!user) return;

      try {
        await GameAPI.deleteUserAccount(user.id);
        
        // Очищаем состояние
        set({
          user: null,
          isInitialized: false,
          userProfile: null,
          gallery: [],
          palettes: createInitialPalettes(),
          flowTokens: 0,
          receivedFreeColor: false,
          marketplaceListings: [],
          globalStats: null,
          achievementProgress: null
        });
        
        console.log('Аккаунт удален');
      } catch (error) {
        console.error('Ошибка удаления аккаунта:', error);
        throw error;
      }
    },

    resetCollection: async () => {
      const { user } = get();
      if (!user) return;

      try {
        // Удаляем все цвета из БД
        await GameAPI.resetUserData(user.id);
        
        // Очищаем галерею и палитры в состоянии
        set({
          gallery: [],
          palettes: createInitialPalettes(),
          receivedFreeColor: false,
          flowTokens: 100,
          highestRarityAchieved: 'common'
        });
        
        console.log('Коллекция сброшена');
      } catch (error) {
        console.error('Ошибка сброса коллекции:', error);
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
        console.error('Ошибка обновления профиля:', error);
        throw error;
      }
    },

    // Для демо - создание тестовых цветов
    createTestColors: async () => {
      if (window.location.hostname !== 'localhost') return;
      
      const { user } = get();
      if (!user) return;

      try {
        const testColors = [
          ColorGenerator.generateColor('common'),
          ColorGenerator.generateColor('uncommon'),
          ColorGenerator.generateColor('rare')
        ];

        console.log('Тестовые цвета:', testColors);

        for (const color of testColors) {
          await GameAPI.createColor(user.id, color);
        }

        set(state => ({
          gallery: [...state.gallery, ...testColors]
        }));

        console.log('Создано тестовых цветов:', testColors.length);
      } catch (error) {
        console.error('Ошибка создания тестовых цветов:', error);
      }
    },

    // Создание быстрого тестового цвета в мемории (без БД)
    createQuickTestColor: () => {
      if (window.location.hostname !== 'localhost') return;
      
      const testColors = [
        {
          id: `test-common-${Date.now()}`,
          rarity: 'common' as ColorRarity,
          hex: '#FF5733',
          name: 'Оранжевый рассвет #1',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-uncommon-${Date.now() + 1}`,
          rarity: 'uncommon' as ColorRarity,
          hex: '#33FF57',
          name: 'Изумрудная роща #2',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-rare-${Date.now() + 2}`,
          rarity: 'rare' as ColorRarity,
          hex: '#3357FF',
          name: 'Небесная бездна #3',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        },
        {
          id: `test-mythical-${Date.now() + 3}`,
          rarity: 'mythical' as ColorRarity,
          hex: '#8E44AD',
          name: 'Мистическая аура #4',
          dateObtained: new Date().toISOString(),
          stakingCount: 0
        }
      ];

      console.log('Создаем быстрые тестовые цвета:', testColors);

      set(state => ({
        gallery: [...state.gallery, ...testColors]
      }));
    },

    // Переименование цвета
    renameColor: async (colorId: string, newName: string) => {
      const { user, gallery, isDemoMode } = get();
      if (!user) return;

      const colorIndex = gallery.findIndex(c => c.id === colorId);
      if (colorIndex === -1) {
        throw new Error('Цвет не найден');
      }

      // Валидация названия
      if (!newName.trim() || newName.length > 25) {
        throw new Error('Название должно быть от 1 до 25 символов');
      }

      // Простая проверка на нецензурные слова (можно расширить)
      const badWords = ['плохое', 'слово']; // Заглушка
      if (badWords.some(word => newName.toLowerCase().includes(word))) {
        throw new Error('Название содержит недопустимые слова');
      }

      try {
        if (!isDemoMode) {
          // В обычном режиме обновляем базу данных
          await GameAPI.updateColorName(user.id, colorId, newName.trim());
        }

        // Обновляем состояние
        set(state => ({
          gallery: state.gallery.map(color => 
            color.id === colorId 
              ? { ...color, name: newName.trim() }
              : color
          )
        }));

        console.log(`Цвет ${colorId} переименован в "${newName}"`);
      } catch (error) {
        console.error('Ошибка переименования цвета:', error);
        throw error;
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
