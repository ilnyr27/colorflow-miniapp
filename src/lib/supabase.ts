import { createClient } from '@supabase/supabase-js';
import { GameState, Color, MarketplaceListing } from '@/types/game';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phptfnknjsbmedgsrojx.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocHRmbmtuanNibWVkZ3Nyb2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTQ3OTAsImV4cCI6MjA2NTE3MDc5MH0.1XevcCHG25wFc206mCUXefjmI89aVd0rObU9dct0kLk';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          telegram_id: number;
          username: string | null;
          first_name: string;
          last_name: string | null;
          flow_tokens: number;
          highest_rarity_achieved: string;
          received_free_color: boolean;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          telegram_id: number;
          username?: string | null;
          first_name: string;
          last_name?: string | null;
          flow_tokens?: number;
          highest_rarity_achieved?: string;
          received_free_color?: boolean;
          start_date?: string;
        };
        Update: {
          username?: string | null;
          first_name?: string;
          last_name?: string | null;
          flow_tokens?: number;
          highest_rarity_achieved?: string;
          received_free_color?: boolean;
        };
      };
      colors: {
        Row: {
          id: string;
          user_id: number;
          rarity: string;
          rgb_r: number;
          rgb_g: number;
          rgb_b: number;
          rgb_name: string | null;
          is_ultimate: boolean;
          staking_count: number;
          user_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: number;
          rarity: string;
          rgb_r: number;
          rgb_g: number;
          rgb_b: number;
          rgb_name?: string | null;
          is_ultimate?: boolean;
          staking_count?: number;
          user_name?: string | null;
        };
        Update: {
          rarity?: string;
          staking_count?: number;
          user_name?: string | null;
        };
      };
      palettes: {
        Row: {
          id: string;
          user_id: number;
          rarity: string;
          slot_0: string | null;
          slot_1: string | null;
          slot_2: string | null;
          slot_3: string | null;
          slot_4: string | null;
          slot_5: string | null;
          staking_count: number;
          is_staking: boolean;
          staking_end_time: string | null;
          staking_start: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: number;
          rarity: string;
          staking_count?: number;
          is_staking?: boolean;
        };
        Update: {
          slot_0?: string | null;
          slot_1?: string | null;
          slot_2?: string | null;
          slot_3?: string | null;
          slot_4?: string | null;
          slot_5?: string | null;
          staking_count?: number;
          is_staking?: boolean;
          staking_end_time?: string | null;
          staking_start?: string | null;
        };
      };
      marketplace_listings: {
        Row: {
          id: string;
          color_id: string;
          seller_id: number;
          seller_username: string | null;
          price_stars: number;
          created_at: string;
        };
        Insert: {
          id: string;
          color_id: string;
          seller_id: number;
          seller_username?: string | null;
          price_stars: number;
        };
        Update: {
          price_stars?: number;
        };
      };
      star_purchases: {
        Row: {
          id: string;
          user_id: number;
          rarity: string;
          price_stars: number;
          telegram_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: number;
          rarity: string;
          price_stars: number;
          telegram_payment_id?: string | null;
        };
      };
    };
  };
}

// API functions
export class GameAPI {
  static async getOrCreateUser(telegramId: number, userData: {
    username?: string;
    firstName: string;
    lastName?: string;
  }) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (existingUser) {
      return existingUser;
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramId,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        start_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return newUser;
  }

  static async getUserColors(userId: number): Promise<Color[]> {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(color => ({
      id: color.id,
      rarity: color.rarity as any,
      hex: `#${color.rgb_r.toString(16).padStart(2, '0')}${color.rgb_g.toString(16).padStart(2, '0')}${color.rgb_b.toString(16).padStart(2, '0')}`.toUpperCase(),
      name: color.user_name || `Цвет #${color.rgb_r.toString(16).padStart(2, '0')}${color.rgb_g.toString(16).padStart(2, '0')}${color.rgb_b.toString(16).padStart(2, '0')}`.toUpperCase(),
      dateObtained: color.created_at,
      stakingCount: color.staking_count,
      ownedSince: new Date(color.created_at)
    }));
  }

  static async createColor(userId: number, color: Color): Promise<void> {
    // Конвертируем hex в RGB
    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const { error } = await supabase
      .from('colors')
      .insert({
        id: color.id,
        user_id: userId,
        rarity: color.rarity,
        rgb_r: r,
        rgb_g: g,
        rgb_b: b,
        rgb_name: null, // Для особых цветов
        is_ultimate: color.rarity === 'ultimate',
        staking_count: color.stakingCount || 0,
        user_name: color.name
      });

    if (error) throw error;
  }

  static async updateUserTokens(userId: number, tokens: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ flow_tokens: tokens })
      .eq('telegram_id', userId);

    if (error) throw error;
  }

  static async getMarketplaceListings(): Promise<MarketplaceListing[]> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        colors (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(listing => ({
      id: listing.id,
      color: {
        id: listing.colors.id,
        rarity: listing.colors.rarity as any,
        hex: `#${listing.colors.rgb_r.toString(16).padStart(2, '0')}${listing.colors.rgb_g.toString(16).padStart(2, '0')}${listing.colors.rgb_b.toString(16).padStart(2, '0')}`.toUpperCase(),
        name: listing.colors.user_name || `Цвет #${listing.colors.rgb_r.toString(16).padStart(2, '0')}${listing.colors.rgb_g.toString(16).padStart(2, '0')}${listing.colors.rgb_b.toString(16).padStart(2, '0')}`.toUpperCase(),
        dateObtained: listing.colors.created_at,
        stakingCount: listing.colors.staking_count,
        ownedSince: new Date(listing.colors.created_at)
      },
      priceStars: listing.price_stars,
      sellerId: listing.seller_id,
      sellerUsername: listing.seller_username || undefined,
      listingDate: new Date(listing.created_at)
    }));
  }

  static async recordStarPurchase(userId: number, rarity: string, priceStars: number, paymentId?: string): Promise<void> {
    const { error } = await supabase
      .from('star_purchases')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        rarity,
        price_stars: priceStars,
        telegram_payment_id: paymentId
      });

    if (error) throw error;
  }

  static async updateUserFreeColorFlag(userId: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ received_free_color: true })
      .eq('telegram_id', userId);

    if (error) throw error;
  }

  // Функция для сброса тестовых данных пользователя (только для разработки)
  static async resetUserData(userId: number): Promise<void> {
    // Проверяем режим разработки
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         import.meta.env.DEV;

    // Удаляем все цвета пользователя
    await supabase
      .from('colors')
      .delete()
      .eq('user_id', userId);

    // Сбрасываем флаг получения бесплатного цвета
    await supabase
      .from('users')
      .update({ 
        received_free_color: false,
        flow_tokens: 100,
        highest_rarity_achieved: 'common'
      })
      .eq('telegram_id', userId);

    console.log(`Данные пользователя ${userId} сброшены`);
  }

  // Новые методы для статистики и настроек
  static async getUserProfile(userId: number): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getGlobalStats(): Promise<any> {
    // Заглушка для глобальной статистики
    return {
      total_colors: 1587342,
      online_players: Math.floor(Math.random() * 1000) + 500,
      active_stakings: Math.floor(Math.random() * 200) + 100,
      total_operations: 2847593
    };
  }

  static async updateUserProfile(userId: number, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('telegram_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUserAccount(userId: number): Promise<void> {
    // Удаляем цвета пользователя
    await supabase
      .from('colors')
      .delete()
      .eq('user_id', userId);

    // Удаляем записи о покупках
    await supabase
      .from('star_purchases')
      .delete()
      .eq('user_id', userId);

    // Удаляем пользователя
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('telegram_id', userId);

    if (error) throw error;
  }

  static async updateColorName(userId: number, colorId: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('colors')
      .update({ user_name: newName })
      .eq('id', colorId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
