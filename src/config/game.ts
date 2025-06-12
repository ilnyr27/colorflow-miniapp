import { ColorConfig } from '@/types/game';

export const GAME_CONFIG: ColorConfig = {
  RARITY_LEVELS: [
    'common',
    'uncommon',
    'rare',
    'mythical',
    'legendary',
    'ascendant',
    'unique',
    'ulterior',
    'ultimate'
  ],

  // Общее количество цветов каждой редкости в игре
  TOTAL_COLOR_COUNTS: {
    common: 13794548,
    uncommon: 2684354,
    rare: 268435,
    mythical: 26843,
    legendary: 2684,
    ascendant: 254,
    unique: 6,
    ulterior: 2,
    ultimate: 1
  },

  // Время стейкинга в часах (реальное время)
  STAKING_TIME_TABLE: {
    common: [4, 4, 4, 4, 4], // 4 часа каждый стейкинг
    uncommon: [12, 12, 12, 12, 12], // 12 часов
    rare: [24, 24, 24, 24, 24], // 1 день
    mythical: [72, 72, 72, 72, 72], // 3 дня
    legendary: [168, 168, 168, 168, 168], // 1 неделя
    ascendant: [336, 336, 336, 336, 336], // 2 недели
    unique: [720, 720, 720, 720, 720], // 1 месяц
    ulterior: [1440, 1440], // 2 месяца
    ultimate: [0] // Не стейкается
  },

  // Требования для улучшения (сколько цветов нужно)
  UPGRADE_REQUIREMENTS: {
    common: 6,
    uncommon: 6,
    rare: 6,
    mythical: 6,
    legendary: 6,
    ascendant: 6,
    unique: 3, // RGB или CMY комбинация
    ulterior: 2, // Белый + черный
    ultimate: 0 // Финальная цель
  },

  // Фиксированные уникальные цвета
  FIXED_UNIQUE_COLORS: [
    { name: 'red', r: 255, g: 0, b: 0 },
    { name: 'green', r: 0, g: 255, b: 0 },
    { name: 'blue', r: 0, g: 0, b: 255 },
    { name: 'yellow', r: 255, g: 255, b: 0 },
    { name: 'cyan', r: 0, g: 255, b: 255 },
    { name: 'magenta', r: 255, g: 0, b: 255 }
  ],

  // Фиксированные цвета ulterior
  FIXED_ULTERIOR_COLORS: [
    { name: 'white', r: 255, g: 255, b: 255 },
    { name: 'black', r: 0, g: 0, b: 0 }
  ],

  // Цены в Telegram Stars
  STAR_PRICES: {
    common: 5,
    uncommon: 15,
    rare: 40,
    mythical: 100,
    legendary: 250,
    ascendant: 600,
    unique: 1500,
    ulterior: 0, // Не продается
    ultimate: 0 // Не продается
  }
};

// Времена достижения каждого уровня (в днях)
export const PROGRESSION_TIMELINE = {
  common: 0, // Сразу доступен
  uncommon: 22, // Первый uncommon через 22 дня
  rare: 50, // Первый rare через 50 дней
  mythical: 105, // И так далее...
  legendary: 210,
  ascendant: 420,
  unique: 965,
  ulterior: 2555,
  ultimate: 3286 // Примерно 9 лет полного прохождения
};

// Цвета рамок для каждой редкости
export const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#1eff00',
  rare: '#0070dd',
  mythical: '#a335ee',
  legendary: '#ff8000',
  ascendant: '#e6cc80',
  unique: '#e268a8',
  ulterior: '#ff9900',
  ultimate: '#ff00ff'
};

// Начальные значения FlowTokens
export const INITIAL_FLOW_TOKENS = 100;

// Награды за достижения
export const ACHIEVEMENT_REWARDS = {
  firstAscendant: 100,
  firstUnique: 250,
  firstUlterior: 500,
  firstUltimate: 1000
};