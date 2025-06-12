-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  telegram_id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  flow_tokens INTEGER DEFAULT 100,
  highest_rarity_achieved VARCHAR(20) DEFAULT 'common',
  received_free_color BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colors table
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  rarity VARCHAR(20) NOT NULL,
  rgb_r INTEGER NOT NULL CHECK (rgb_r >= 0 AND rgb_r <= 255),
  rgb_g INTEGER NOT NULL CHECK (rgb_g >= 0 AND rgb_g <= 255),
  rgb_b INTEGER NOT NULL CHECK (rgb_b >= 0 AND rgb_b <= 255),
  rgb_name VARCHAR(50), -- For unique/ulterior colors
  is_ultimate BOOLEAN DEFAULT FALSE,
  staking_count INTEGER DEFAULT 0,
  user_name VARCHAR(100), -- Player-assigned name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Palettes table
CREATE TABLE palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  rarity VARCHAR(20) NOT NULL,
  slot_0 UUID REFERENCES colors(id) ON DELETE SET NULL,
  slot_1 UUID REFERENCES colors(id) ON DELETE SET NULL,
  slot_2 UUID REFERENCES colors(id) ON DELETE SET NULL,
  slot_3 UUID REFERENCES colors(id) ON DELETE SET NULL,
  slot_4 UUID REFERENCES colors(id) ON DELETE SET NULL,
  slot_5 UUID REFERENCES colors(id) ON DELETE SET NULL,
  staking_count INTEGER DEFAULT 0,
  is_staking BOOLEAN DEFAULT FALSE,
  staking_end_time TIMESTAMPTZ,
  staking_start TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rarity)
);

-- Marketplace listings table
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
  seller_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  seller_username VARCHAR(255),
  price_stars INTEGER NOT NULL CHECK (price_stars > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Star purchases table (for analytics and verification)
CREATE TABLE star_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  rarity VARCHAR(20) NOT NULL,
  price_stars INTEGER NOT NULL,
  telegram_payment_id VARCHAR(255), -- Telegram payment charge ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game statistics table
CREATE TABLE game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_colors_minted INTEGER DEFAULT 0,
  total_stakings_completed INTEGER DEFAULT 0,
  total_upgrades_performed INTEGER DEFAULT 0,
  total_stars_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_colors_user_id ON colors(user_id);
CREATE INDEX idx_colors_rarity ON colors(rarity);
CREATE INDEX idx_palettes_user_id ON palettes(user_id);
CREATE INDEX idx_palettes_staking ON palettes(is_staking, staking_end_time);
CREATE INDEX idx_marketplace_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX idx_star_purchases_user_id ON star_purchases(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_palettes_updated_at BEFORE UPDATE ON palettes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial game stats
INSERT INTO game_stats (id) VALUES (uuid_generate_v4());

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = telegram_id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = telegram_id::text);

-- Colors policies
CREATE POLICY "Users can view own colors" ON colors FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own colors" ON colors FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own colors" ON colors FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own colors" ON colors FOR DELETE USING (auth.uid()::text = user_id::text);

-- Palettes policies
CREATE POLICY "Users can view own palettes" ON palettes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own palettes" ON palettes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own palettes" ON palettes FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Marketplace policies (public read, own write)
CREATE POLICY "Anyone can view marketplace" ON marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Users can create own listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);
CREATE POLICY "Users can delete own listings" ON marketplace_listings FOR DELETE USING (auth.uid()::text = seller_id::text);

-- Star purchases policies
CREATE POLICY "Users can view own purchases" ON star_purchases FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own purchases" ON star_purchases FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions for game logic
CREATE OR REPLACE FUNCTION get_available_rarities_for_purchase(player_telegram_id BIGINT)
RETURNS TABLE(rarity VARCHAR(20), price_stars INTEGER) AS $
BEGIN
  RETURN QUERY
  WITH player_data AS (
    SELECT 
      u.start_date,
      u.highest_rarity_achieved,
      EXTRACT(EPOCH FROM (NOW() - u.start_date)) / 86400 AS days_playing
    FROM users u 
    WHERE u.telegram_id = player_telegram_id
  ),
  rarity_timeline AS (
    SELECT unnest(ARRAY['common', 'uncommon', 'rare', 'mythical', 'legendary', 'ascendant', 'unique', 'ulterior']) AS rarity_name,
           unnest(ARRAY[0, 22, 50, 105, 210, 420, 965, 2555]) AS required_days,
           unnest(ARRAY[5, 15, 40, 100, 250, 600, 1500, 0]) AS stars_price
  )
  SELECT 
    rt.rarity_name::VARCHAR(20),
    rt.stars_price::INTEGER
  FROM rarity_timeline rt, player_data pd
  WHERE rt.required_days <= pd.days_playing 
    AND rt.stars_price > 0
    AND rt.rarity_name != 'ulterior' -- Ulterior не продается
    AND rt.rarity_name != 'ultimate'; -- Ultimate не продается
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete staking automatically
CREATE OR REPLACE FUNCTION complete_expired_stakings()
RETURNS INTEGER AS $
DECLARE
  completed_count INTEGER := 0;
  staking_record RECORD;
BEGIN
  FOR staking_record IN 
    SELECT user_id, rarity 
    FROM palettes 
    WHERE is_staking = TRUE 
      AND staking_end_time <= NOW()
  LOOP
    -- Update palette to stop staking
    UPDATE palettes 
    SET is_staking = FALSE,
        staking_end_time = NULL,
        staking_start = NULL,
        staking_count = staking_count + 1
    WHERE user_id = staking_record.user_id 
      AND rarity = staking_record.rarity;
    
    -- Create new color for the user
    INSERT INTO colors (user_id, rarity, rgb_r, rgb_g, rgb_b)
    VALUES (
      staking_record.user_id,
      staking_record.rarity,
      FLOOR(RANDOM() * 256)::INTEGER,
      FLOOR(RANDOM() * 256)::INTEGER,
      FLOOR(RANDOM() * 256)::INTEGER
    );
    
    completed_count := completed_count + 1;
  END LOOP;
  
  RETURN completed_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to complete expired stakings (if pg_cron is available)
-- SELECT cron.schedule('complete-stakings', '* * * * *', 'SELECT complete_expired_stakings();');