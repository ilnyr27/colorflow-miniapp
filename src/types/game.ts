export type ColorRarity = 
  | 'common'
  | 'uncommon' 
  | 'rare'
  | 'mythical'
  | 'legendary'
  | 'ascendant'
  | 'unique'
  | 'ulterior'
  | 'ultimate';

export interface RGB {
  r: number;
  g: number;
  b: number;
  name?: string; // Для unique/ulterior цветов
  isUltimate?: boolean; // Для ultimate цвета
}

export interface Color {
  id: string;
  rarity: ColorRarity;
  hex: string;
  name: string;
  dateObtained: string;
  stakingCount?: number;
  ownedSince?: Date;
}

export interface Palette {
  id?: string;
  colors: (Color | null)[];
  rarity?: ColorRarity;
  stakingCount: number;
  maxSlots: number;
  isStaking: boolean;
  stakingEndTime: Date | number | null;
  stakingStartTime: Date | number | null;
}

export interface GameState {
  gallery: Color[];
  palettes: Record<ColorRarity, Palette>;
  activePaletteTab: ColorRarity;
  marketplaceListings: MarketplaceListing[];
  flowTokens: number; // Внутренняя валюта
  remainingColors: Record<ColorRarity, number>;
  
  // Флаги прогресса
  receivedFreeColor: boolean;
  highestRarityAchieved: ColorRarity;
  startDate: Date;
  
  // Награды
  receivedAscendantReward: boolean;
  receivedUniqueReward: boolean;
  receivedUlteriorReward: boolean;
  receivedUltimateReward: boolean;
}

export interface MarketplaceListing {
  id: string;
  color: Color;
  priceStars: number;
  sellerId: number; // Telegram user ID
  sellerUsername?: string;
  listingDate: Date;
}

export interface StakingTimeTable {
  [key: string]: number[]; // Времена для каждого стейкинга
}

export interface ColorConfig {
  RARITY_LEVELS: ColorRarity[];
  TOTAL_COLOR_COUNTS: Record<ColorRarity, number>;
  STAKING_TIME_TABLE: StakingTimeTable;
  STAKING_TIMES: Record<ColorRarity, number>; // Время стейкинга в минутах для демо
  UPGRADE_REQUIREMENTS: Record<ColorRarity, number>;
  FIXED_UNIQUE_COLORS: RGB[];
  FIXED_ULTERIOR_COLORS: RGB[];
  STAR_PRICES: Record<ColorRarity, number>;
}

// API types
export interface CreateColorRequest {
  rarity: ColorRarity;
  predefinedColor?: RGB;
}

export interface StartStakingRequest {
  rarity: ColorRarity;
}

export interface UpgradeColorsRequest {
  rarity: ColorRarity;
}

export interface PurchaseColorRequest {
  rarity: ColorRarity;
  paymentMethod: 'stars' | 'tokens';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
