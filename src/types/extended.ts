// Дополнительные типы для статистики и настроек
export interface GlobalStats {
  total_colors: number;
  online_players: number;
  active_stakings: number;
  total_operations: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward?: string;
}

export interface UserProfile {
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  flow_tokens: number;
  highest_rarity: string;
  start_date: string;
  received_free_color: boolean;
  total_stakings: number;
  total_purchases: number;
  total_sales: number;
  is_premium: boolean;
}

// Расширяем GameStore интерфейс
export interface ExtendedGameStore {
  // Новые поля состояния
  userProfile: UserProfile | null;
  globalStats: GlobalStats | null;
  achievementProgress: Achievement[] | null;
  isDemoMode: boolean;
  
  // Новые действия
  loadUserProfile: () => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  toggleDemoMode: () => void;
  deleteAccount: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
