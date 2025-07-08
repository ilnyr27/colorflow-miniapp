# colorflow-miniapp```

### RGB Generation Rules by Rarity
```sql
CREATE OR REPLACE FUNCTION generate_rgb_by_rarity(p_rarity VARCHAR(20))
RETURNS TABLE(r INTEGER, g INTEGER, b INTEGER) AS $
BEGIN
  CASE p_rarity
    WHEN 'common' THEN
      -- Pale, dull colors (high RGB values)
      RETURN QUERY SELECT 
        (RANDOM() * 100 + 155)::INTEGER,
        (RANDOM() * 100 + 155)::INTEGER, 
        (RANDOM() * 100 + 155)::INTEGER;
        
    WHEN 'uncommon' THEN
      -- Slightly more saturated
      RETURN QUERY SELECT
        (RANDOM() * 150 + 100)::INTEGER,
        (RANDOM() * 150 + 100)::INTEGER,
        (RANDOM() * 150 + 100)::INTEGER;
        
    WHEN 'rare' THEN
      -- Soft, noticeable shades
      RETURN QUERY SELECT
        (RANDOM() * 200 + 55)::INTEGER,
        (RANDOM() * 200 + 55)::INTEGER,
        (RANDOM() * 200 + 55)::INTEGER;
        
    WHEN 'mythical' THEN
      -- Light, pastel but vivid
      RETURN QUERY SELECT
        (RANDOM() * 155 + 100)::INTEGER,
        (RANDOM() * 155 + 100)::INTEGER,
        (RANDOM() * 155 + 100)::INTEGER;
        
    WHEN 'legendary' THEN
      -- Saturated and bright
      RETURN QUERY SELECT
        (RANDOM() * 200 + 55)::INTEGER,
        (RANDOM() * 200 + 55)::INTEGER,
        (RANDOM() * 200 + 55)::INTEGER;
        
    WHEN 'ascendant' THEN
      -- 254 shades of gray (RGB 1-254, all same value)
      DECLARE
        gray_value INTEGER := (RANDOM() * 254 + 1)::INTEGER;
      BEGIN
        RETURN QUERY SELECT gray_value, gray_value, gray_value;
      END;
      
    WHEN 'unique' THEN
      -- Fixed 6 colors: RGB + CMY
      -- This should be handled separately with predefined values
      RAISE EXCEPTION 'Unique colors must be created with predefined RGB values';
      
    WHEN 'ulterior' THEN
      -- Fixed 2 colors: Black (0,0,0) and White (255,255,255)
      -- This should be handled separately
      RAISE EXCEPTION 'Ulterior colors must be created with predefined RGB values';
      
    WHEN 'ultimate' THEN
      -- Single transparent color
      RAISE EXCEPTION 'Ultimate color must be created with special handling';
      
    ELSE
      RAISE EXCEPTION 'Unknown rarity: %', p_rarity;
  END CASE;
END;
$ LANGUAGE plpgsql;
```

## 👑 Admin Panel System

### Developer Reserves (10% of each rarity)
```sql
-- Table for developer-controlled colors
CREATE TABLE developer_reserves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rarity VARCHAR(20) NOT NULL,
  rgb_r INTEGER NOT NULL,
  rgb_g INTEGER NOT NULL, 
  rgb_b INTEGER NOT NULL,
  price_stars INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin function to create reserve colors
CREATE OR REPLACE FUNCTION admin_create_reserve_color(
  p_rarity VARCHAR(20),
  p_price_stars INTEGER
) RETURNS UUID AS $
DECLARE
  reserve_id UUID;
  rgb_values RECORD;
BEGIN
  -- Generate RGB for this rarity
  SELECT * INTO rgb_values FROM generate_rgb_by_rarity(p_rarity);
  
  -- Insert into reserves
  INSERT INTO developer_reserves (rarity, rgb_r, rgb_g, rgb_b, price_stars)
  VALUES (p_rarity, rgb_values.r, rgb_values.g, rgb_values.b, p_price_stars)
  RETURNING id INTO reserve_id;
  
  -- Also mark as used in global registry
  INSERT INTO used_colors (rgb_hash, user_id, color_id)
  VALUES (
    rgb_values.r# ColorFlow - Technical Development Documentation

> **Contemplative RGB color collecting game for Telegram Mini Apps**  
> *Long-term project designed for years of collecting and staking*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://colorflow-miniapp.vercel.app)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

## 🎯 Project Philosophy

**ColorFlow** is designed as an **anti-addictive**, contemplative experience that respects user time. Unlike typical mobile games, progress is measured in weeks and months, not minutes. Each color is a small miracle worth waiting for.

### Core Principles
- ⏰ **Real-time progression** - REAL days/weeks (1 day, 7 days, 15 days...)
- 🧘 **Meditative experience** - calm, non-aggressive gameplay
- 🎨 **Unique RGB colors** - each color exists only once across all players
- 📈 **Progressive monetization** - shop unlocks based on natural progression
- 🚫 **No pay-to-win** - money buys convenience, not speed

## 🎮 Game Mechanics Overview

### Color Rarity System (9 Levels)

| Rarity | Total Count | Staking Time | Upgrade Time | Description |
|--------|-------------|--------------|--------------|-------------|
| **Common** | 13,794,548 | 1 day | 7 days | Pale, dull colors |
| **Uncommon** | 2,684,354 | 7 days | 15 days | Slightly more saturated |
| **Rare** | 268,435 | 15 days | 30 days | Soft, noticeable shades |
| **Mythical** | 26,843 | 30 days | 60 days | Light, pastel but vivid |
| **Legendary** | 2,684 | 60 days | 120 days | Saturated and bright |
| **Ascendant** | 254 | 120 days | 365 days | 254 shades of gray (RGB 1-254) |
| **Unique** | 6 | 365 days | 730 days | Pure colors: RGB + CMY |
| **Ulterior** | 2 | 730 days | 1 day | Black and White |
| **Ultimate** | 1 | N/A | N/A | Transparent - final goal |

### Palette Slot Configuration
- **Common - Ascendant**: 6 slots each
- **Unique**: 3 slots (RGB or CMY combinations)
- **Ulterior**: 2 slots (Black + White)
- **Ultimate**: 1 slot (final achievement)

## 💰 Hybrid Monetization System

### Two-Currency Model
- **FlowTokens** (internal) - player-to-player trading
- **Telegram Stars** - official shop purchases

### Progressive Shop Access (REAL DAYS)
```javascript
PROGRESSION_TIMELINE = {
  day_22:  "Common available for 5 Stars",
  day_50:  "Uncommon available for 15 Stars", 
  day_105: "Rare available for 40 Stars",
  day_210: "Mythical available for 100 Stars",
  day_420: "Legendary available for 250 Stars",
  day_965: "Ascendant available for 600 Stars",
  day_2555: "Unique available for 1500 Stars"
  // Ulterior and Ultimate NOT for sale - only through combinations
}
```

### Special Offer
**First 10,000 players get free starter Common color**

## 🔒 Color Uniqueness System

### Chosen Approach: Atomic Database Lock
```sql
-- Critical: Each RGB combination exists only once across ALL players
CREATE TABLE used_colors (
  rgb_hash VARCHAR(15) PRIMARY KEY, -- "255-128-64" format
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id BIGINT,
  color_id UUID
);

-- Atomic color creation
CREATE OR REPLACE FUNCTION create_unique_color(
  p_user_id BIGINT,
  p_rarity VARCHAR(20)
) RETURNS UUID AS $
DECLARE
  new_rgb_r INTEGER;
  new_rgb_g INTEGER; 
  new_rgb_b INTEGER;
  rgb_hash VARCHAR(15);
  color_id UUID;
  attempt_count INTEGER := 0;
BEGIN
  LOOP
    -- Generate RGB based on rarity rules
    SELECT * INTO new_rgb_r, new_rgb_g, new_rgb_b 
    FROM generate_rgb_by_rarity(p_rarity);
    
    rgb_hash := new_rgb_r || '-' || new_rgb_g || '-' || new_rgb_b;
    
    -- Try to insert unique hash
    BEGIN
      INSERT INTO used_colors (rgb_hash, user_id) 
      VALUES (rgb_hash, p_user_id);
      
      -- Success! Create the color
      INSERT INTO colors (id, user_id, rarity, rgb_r, rgb_g, rgb_b)
      VALUES (uuid_generate_v4(), p_user_id, p_rarity, new_rgb_r, new_rgb_g, new_rgb_b)
      RETURNING id INTO color_id;
      
      -- Update used_colors with color_id
      UPDATE used_colors SET color_id = color_id WHERE rgb_hash = rgb_hash;
      
      RETURN color_id;
      
    EXCEPTION WHEN unique_violation THEN
      -- RGB already exists, try again
      attempt_count := attempt_count + 1;
      
      IF attempt_count > 1000 THEN
        RAISE EXCEPTION 'Unable to generate unique color after 1000 attempts for rarity %', p_rarity;
      END IF;
      
      CONTINUE;
    END;
  END LOOP;
END;
$ LANGUAGE plpgsql;

### Fixed Special Colors

#### Unique Colors (6 total)
- **Red**: RGB(255, 0, 0)
- **Green**: RGB(0, 255, 0)  
- **Blue**: RGB(0, 0, 255)
- **Yellow**: RGB(255, 255, 0)
- **Cyan**: RGB(0, 255, 255)
- **Magenta**: RGB(255, 0, 255)

#### Ulterior Colors (2 total)
- **White**: RGB(255, 255, 255)
- **Black**: RGB(0, 0, 0)

#### Ultimate Color (1 total)
- **Transparent**: Special prismatic effect

### Core Gameplay Loop

1. **Start**: Each player gets 1 free Common color
2. **Staking**: Place colors in palettes to get new colors over time
3. **Upgrading**: Collect 6 colors of same rarity → 1 color of next rarity
4. **Special Combinations**:
   - Unique: RGB combo → White, CMY combo → Black
   - Ulterior: Black + White → Ultimate
5. **Goal**: Create Ultimate color = "Lord of Colors" status

### Palette System

| Rarity | Slots | Special Rules |
|--------|-------|---------------|
| Common - Ascendant | 6 slots | Standard 6→1 upgrade |
| Unique | 3 slots | RGB or CMY combinations |
| Ulterior | 2 slots | Black + White required |
| Ultimate | 1 slot | Final achievement |

## 🏗 Technical Architecture

### Current Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL + REST API)
- **Animations**: Framer Motion
- **Deployment**: Netlify
- **Mini App**: Telegram WebApp SDK

### Project Structure
```
src/
├── components/          # React components
│   ├── GameInterface.tsx
│   ├── LoadingScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── ColorGallery.tsx
│   ├── PaletteSection.tsx
│   └── StakingStatus.tsx
├── config/             # Game configuration
│   └── game.ts         # All game constants and rules
├── hooks/              # React hooks
│   └── useTelegram.ts  # Telegram WebApp integration
├── lib/                # External libraries
│   └── supabase.ts     # Database client and API
├── store/              # Zustand stores
│   └── gameStore.ts    # Main game state management
├── types/              # TypeScript definitions
│   ├── game.ts         # Game entities and types
│   └── telegram.ts     # Telegram WebApp types
├── utils/              # Utility functions
│   └── colorGenerator.ts # Color generation logic
└── App.tsx             # Main application component
```

### Database Schema (Supabase)

```sql
-- Core Tables
users (telegram_id, username, flow_tokens, highest_rarity, start_date)
colors (id, user_id, rarity, rgb_r, rgb_g, rgb_b, rgb_name, is_ultimate)
palettes (id, user_id, rarity, slot_0..slot_5, staking_count, is_staking)
marketplace_listings (id, color_id, seller_id, price_stars)
star_purchases (id, user_id, rarity, price_stars, telegram_payment_id)

-- Security
Row Level Security (RLS) enabled
Users can only access their own data
```

## 🚀 Development Roadmap

### Phase 1: Core MVP (Current)
**Status**: ✅ Completed
- [x] Basic color generation and storage
- [x] Staking system with real-time timers
- [x] Palette management (add/remove colors)
- [x] Progressive shop availability
- [x] Telegram WebApp integration
- [x] Database with RLS security

### Phase 2: Telegram Stars Integration
**Status**: 🔄 In Progress
- [ ] Telegram Stars payment processing
- [ ] Purchase flow for colors
- [ ] Receipt validation
- [ ] Progressive pricing based on game progression
- [ ] Analytics tracking for purchases

### Phase 3: Marketplace & Trading
**Status**: ⏳ Planned
- [ ] Player-to-player marketplace
- [ ] Color listing/delisting
- [ ] Escrow system for trades
- [ ] Search and filtering
- [ ] Price history and analytics

### Phase 4: NFT Integration
**Status**: 📋 Future
- [ ] TON blockchain integration
- [ ] NFT minting for colors
- [ ] Wallet connection (TON Space)
- [ ] On-chain ownership verification
- [ ] Cross-platform compatibility

## 💰 Progressive Monetization System

### Philosophy
Players advance naturally through staking. Shop availability unlocks based on **days played** and **highest rarity achieved**.

### Timeline-Based Shop Access
```javascript
PROGRESSION_TIMELINE = {
  day_22:  "Uncommon available for purchase (15 Stars)",
  day_50:  "Rare available (40 Stars)", 
  day_105: "Mythical available (100 Stars)",
  day_210: "Legendary available (250 Stars)",
  day_420: "Ascendant available (600 Stars)",
  day_965: "Unique available (1500 Stars)"
  // Ulterior and Ultimate NOT for sale - only through combinations
}
```

### Pricing Strategy
- **Common**: 5 Stars
- **Uncommon**: 15 Stars  
- **Rare**: 40 Stars
- **Mythical**: 100 Stars
- **Legendary**: 250 Stars
- **Ascendant**: 600 Stars
- **Unique**: 1500 Stars
- **Ulterior/Ultimate**: Not for sale

### Revenue Logic
- 90% of players play completely free
- 10% pay for convenience and aesthetic improvements
- No pressure to spend money
- All content accessible through patience

## 🎨 Color Generation System

### Uniqueness Guarantee
Each RGB combination (16,777,216 total possibilities) can exist only once across all players.

### Generation Rules by Rarity

```typescript
// Color generation ranges by rarity
GENERATION_RULES = {
  common: { r: [155,255], g: [155,255], b: [155,255] },    // Pale colors
  uncommon: { r: [100,250], g: [100,250], b: [100,250] },  // Slightly more vivid
  rare: { r: [55,255], g: [55,255], b: [55,255] },         // Broader range
  mythical: { r: [100,255], g: [100,255], b: [100,255] },  // Pastel but bright
  legendary: { r: [55,255], g: [55,255], b: [55,255] },    // Full saturation
  ascendant: "gray_value_1_to_254",                         // Grayscale only
  unique: "predefined_6_colors",                            // Fixed RGB/CMY
  ulterior: "predefined_2_colors",                          // Black/White only
  ultimate: "special_prismatic_effect"                     // Unique rendering
}
```

### Collision Prevention
- Global color registry in database
- Atomic operations for color creation
- Retry mechanism with different RGB values
- Fallback to expanding generation ranges if needed

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Git
- Telegram account
- Supabase account
- Netlify account (for deployment)

### Quick Start
```bash
# Clone and install
git clone https://github.com/ilnyr27/colorflow-miniapp.git
cd colorflow-miniapp
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Database setup
# Copy and run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor

# Development
npm run dev                # Start dev server
npm run build             # Build for production
npm run type-check        # TypeScript validation
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BOT_TOKEN=your_telegram_bot_token
```

## 🎮 Game Character: Mantis Shrimp Guide

### Scientific Foundation
The **Mantis Shrimp** serves as the game's guide character, chosen for its extraordinary vision:
- Humans: 3 color receptors
- Mantis Shrimp: 16 color receptors
- Can see UV, infrared, and polarized light

### Character Integration
- Provides color-related facts and education
- Guides players through complex mechanics
- Philosophical commentary on color perception
- Easter eggs and hidden knowledge

### Sample Quotes
*"Your eyes see only three primary colors. My vision system includes 16 types of photoreceptors. I see ultraviolet, infrared spectrum, and even polarized light!"*

*"Many think transparent is the absence of color. In reality, it's a symphony of all colors simultaneously, harmoniously interacting with our perception."*

## 🚨 Critical Game Rules

### Staking Limitations
- Only 1 color can stake in 1 palette at a time
- Only 1 palette can be staking across entire game
- Player must wait for staking completion before starting new one

### Upgrade Requirements
- **Standard**: 6 colors of same rarity → 1 color of next rarity
- **Unique to Ulterior**: Requires specific RGB or CMY combinations
- **Ulterior to Ultimate**: Must have both Black AND White colors

### Color Scarcity
- When all colors of a rarity are minted, no new ones can be generated
- Players must trade on marketplace or wait for others to "burn" colors
- This creates natural scarcity and value

### Time Investment
- **Total completion time**: ~16.3 years of patient progression
- **No shortcuts**: Money cannot buy time acceleration
- **Real commitment**: Designed for dedicated long-term players

## 🧪 Testing & Quality Assurance

### Test Scenarios
1. **New Player Journey**: Free color → first staking → first upgrade
2. **Progression Gates**: Verify shop unlocks at correct days
3. **Color Uniqueness**: Ensure no duplicate RGB values
4. **Staking Timers**: Verify real-time countdown accuracy
5. **Special Combinations**: RGB/CMY → Ulterior → Ultimate
6. **Telegram Integration**: Auth, payments, notifications

### Performance Targets
- **Load time**: <3 seconds on 3G
- **Smooth animations**: 60fps on mid-range devices
- **Database queries**: <500ms response time
- **Memory usage**: <50MB RAM consumption

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Retention**: Day 1, 7, 30 retention rates
- **Progression**: Time to reach each rarity level
- **Monetization**: Conversion rate to paying users
- **Engagement**: Daily active users, session length
- **Technical**: Error rates, performance metrics

### Success Criteria
- **Month 1**: 1000+ active users
- **Month 3**: 50+ paying customers
- **Month 6**: Self-sustaining revenue
- **Year 1**: Community of dedicated collectors

## 🎯 Future Enhancements

### Short-term (1-3 months)
- Achievement system with rewards
- Social features (gift colors to friends)
- Enhanced visual effects for rare colors
- Push notifications for staking completion

### Medium-term (3-12 months)
- Clan/guild system for collective progress
- Seasonal events with special colors
- Color naming system
- Export collection as images/NFTs

### Long-term (1+ years)
- Cross-platform mobile app
- AR visualization of color collections
- Integration with physical merchandise
- Educational partnerships with art schools

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commits
- Write tests for critical game logic
- Maintain 80%+ code coverage
- Document all public APIs

### Code Review Process
1. Create feature branch from `main`
2. Implement feature with tests
3. Submit pull request with description
4. Address review feedback
5. Merge after approval

## 📚 Additional Resources

### Documentation
- [Telegram Mini Apps Guide](https://core.telegram.org/bots/webapps)
- [Supabase Documentation](https://supabase.com/docs)
- [TON Blockchain Docs](https://docs.ton.org/)

### Community
- **Telegram Channel**: [@ColorFlowUpdates](https://t.me/ColorFlowUpdates)
- **Developer Chat**: [@ColorFlowDev](https://t.me/ColorFlowDev)
- **GitHub Issues**: [Report bugs and features](https://github.com/ilnyr27/colorflow-miniapp/issues)

---

*Made with ❤️ for the contemplative gaming community*