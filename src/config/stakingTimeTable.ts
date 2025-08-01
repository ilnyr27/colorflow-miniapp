// Таблица времени стейкинга и улучшений для ColorFlow
// Основано на файле Color 1.xlsx

export const STAKING_TIME_TABLE = {
  // Простая система для большинства редкостей
  simple: {
    common: [1, 2, 3, 4, 5, 6], // Прогрессивное увеличение для Common
    uncommon: [7, 7, 7, 7, 7, 7], // Константа для остальных
    rare: [15, 15, 15, 15, 15, 15],
    mythical: [30, 30, 30, 30, 30, 30], 
    legendary: [60, 60, 60, 60, 60, 60],
    ascendant: [120, 120, 120, 120, 120, 120],
    unique: [365, 365, 365], // Только 3 слота
    ulterior: [730], // Только 1 стейкинг, потом мгновенное улучшение
    ultimate: [0] // Финальный уровень
  },
  
  // Прогрессивная система (альтернативная, из нижней части таблицы)
  progressive: {
    common: [1, 2, 3, 4, 6, 6], // 6-й раз остается 6
    uncommon: [7, 7, 7, 7, 7, 7],
    rare: [10, 12, 14, 16, 20, 20], // Постепенное увеличение
    mythical: [22, 26, 30, 34, 42, 42],
    legendary: [50, 55, 60, 65, 75, 75],
    ascendant: [80, 100, 120, 140, 180, 180],
    unique: [300, 350, 400], // 3 стейкинга
    ulterior: [6], // Быстрое улучшение
    ultimate: [0]
  }
};

export const UPGRADE_TIME_TABLE = {
  common: 7,      // Улучшение в Uncommon
  uncommon: 15,   // Улучшение в Rare  
  rare: 30,       // Улучшение в Mythical
  mythical: 60,   // Улучшение в Legendary
  legendary: 120, // Улучшение в Ascendant
  ascendant: 365, // Улучшение в Unique
  unique: 730,    // Улучшение в Ulterior  
  ulterior: 1,    // Мгновенное улучшение в Ultimate
  ultimate: 0     // Финальный уровень
};

export const RARITY_INFO = {
  common: {
    name: 'Common',
    total: 13794548,
    system: 12794548,
    reserve: 1000000,
    slots: 6,
    rgb_rule: 'Pale, dull colors (high RGB values)',
    color: '#95A5A6'
  },
  uncommon: {
    name: 'Uncommon', 
    total: 2684354,
    system: 2584354,
    reserve: 100000,
    slots: 6,
    rgb_rule: 'Slightly more saturated',
    color: '#27AE60'
  },
  rare: {
    name: 'Rare',
    total: 268435,
    system: 258435, 
    reserve: 10000,
    slots: 6,
    rgb_rule: 'Soft, noticeable shades',
    color: '#3498DB'
  },
  mythical: {
    name: 'Mythical',
    total: 26843,
    system: 25843,
    reserve: 1000,
    slots: 6,
    rgb_rule: 'Light, pastel but vivid',
    color: '#9B59B6'
  },
  legendary: {
    name: 'Legendary',
    total: 2684,
    system: 2584,
    reserve: 100,
    slots: 6,
    rgb_rule: 'Saturated and bright + 100 crypto colors',
    color: '#F39C12'
  },
  ascendant: {
    name: 'Ascendant',
    total: 254,
    system: 244,
    reserve: 10,
    slots: 6,
    rgb_rule: '254 shades of gray (1,1,1) → (254,254,254)',
    color: '#34495E'
  },
  unique: {
    name: 'Unique',
    total: 6,
    system: 5,
    reserve: 1,
    slots: 3,
    rgb_rule: 'Fixed colors: RGB + CMY',
    fixed_colors: [
      { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
      { name: 'Green', hex: '#00FF00', rgb: [0, 255, 0] },
      { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
      { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
      { name: 'Cyan', hex: '#00FFFF', rgb: [0, 255, 255] },
      { name: 'Magenta', hex: '#FF00FF', rgb: [255, 0, 255] }
    ],
    combinations: {
      rgb_to_white: ['Red', 'Green', 'Blue'],
      cmy_to_black: ['Cyan', 'Magenta', 'Yellow']
    },
    color: '#E74C3C'
  },
  ulterior: {
    name: 'Ulterior',
    total: 2,
    system: 2,
    reserve: 0,
    slots: 2,
    rgb_rule: 'Black and White only',
    fixed_colors: [
      { name: 'Black', hex: '#000000', rgb: [0, 0, 0] },
      { name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255] }
    ],
    combination_to_ultimate: ['Black', 'White'],
    color: '#2C3E50'
  },
  ultimate: {
    name: 'Ultimate',
    total: 1,
    system: 1,
    reserve: 0,
    slots: 1,
    rgb_rule: 'Transparent prismatic effect',
    description: 'The final achievement - Lord of Colors status',
    color: 'transparent'
  }
};

// Демо-режим: все времена ускорены в 86400 раз (1 день = 0.01 секунды)
export const DEMO_TIME_MULTIPLIER = 1 / 86400;

// Общая статистика
export const GAME_TOTALS = {
  total_colors: 16777126,
  system_colors: 15666015,
  reserve_colors: 1111111,
  estimated_years_to_complete: 15.51,
  estimated_years_with_marketplace: 7.28
};

// Функция для получения времени стейкинга
export function getStakingTime(rarity: string, stakingNumber: number, useProgressive = false): number {
  const table = useProgressive ? STAKING_TIME_TABLE.progressive : STAKING_TIME_TABLE.simple;
  const times = table[rarity as keyof typeof table];
  
  if (!times) return 0;
  
  // Возвращаем время для конкретного стейкинга (нумерация с 0)
  const index = Math.min(stakingNumber, times.length - 1);
  return times[index];
}

// Функция для получения времени улучшения
export function getUpgradeTime(rarity: string): number {
  return UPGRADE_TIME_TABLE[rarity as keyof typeof UPGRADE_TIME_TABLE] || 0;
}

// Функция для получения информации о редкости
export function getRarityInfo(rarity: string) {
  return RARITY_INFO[rarity as keyof typeof RARITY_INFO];
}
