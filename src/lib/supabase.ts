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
      rgb: {
        r: color.rgb_r,
        g: color.rgb_g,
        b: color.rgb_b,
        name: color.rgb_name || undefined,
        isUltimate: color.is_ultimate
      },
      stakingCount: color.staking_count,
      ownedSince: new Date(color.created_at),
      name: color.user_name || undefined
    }));
  }

  static async createColor(userId: number, color: Color): Promise<void> {
    const { error } = await supabase
      .from('colors')
      .insert({
        id: color.id,
        user_id: userId,
        rarity: color.rarity,
        rgb_r: color.rgb.r,
        rgb_g: color.rgb.g,
        rgb_b: color.rgb.b,
        rgb_name: color.rgb.name,
        is_ultimate: color.rgb.isUltimate || false,
        staking_count: color.stakingCount,
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
        rgb: {
          r: listing.colors.rgb_r,
          g: listing.colors.rgb_g,
          b: listing.colors.rgb_b,
          name: listing.colors.rgb_name || undefined,
          isUltimate: listing.colors.is_ultimate
        },
        stakingCount: listing.colors.staking_count,
        ownedSince: new Date(listing.colors.created_at),
        name: listing.colors.user_name || undefined
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
}
