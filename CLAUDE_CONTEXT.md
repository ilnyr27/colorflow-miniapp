# 🤖 ColorFlow - Technical Context for Claude

> **Complete technical documentation for AI assistance**  
> *Everything Claude needs to know to effectively work with this codebase*

---

## 🎯 Project Overview

**ColorFlow** is a contemplative color staking game built as a Telegram Mini App. Key characteristics:

- **Genre**: Meditative collecting game with real-time progression
- **Platform**: Telegram Mini Apps (React-based web app)
- **Monetization**: Telegram Stars + internal token economy
- **Uniqueness**: Each RGB color exists only once across all players
- **Timeline**: Real-time staking (hours to months), full completion takes years

### **Core Mechanics**
1. **Color Collection**: Players receive/purchase unique RGB colors
2. **Staking**: Colors are "staked" in palettes for hours/days to generate new colors
3. **Upgrading**: 6 colors of same rarity → 1 color of next rarity level
4. **Trading**: P2P marketplace with Stars/FlowTokens economy
5. **Progression**: 9 rarity levels from Common to Ultimate

---

## 🏗️ Technical Architecture

### **Tech Stack**
```typescript
Frontend:
- React 18 + TypeScript (strict mode)
- Vite (build tool)
- Zustand (state management)
- Framer Motion (animations)
- React Router DOM v7
- Telegram Mini Apps SDK (@tma.js/sdk)

Backend:
- Supabase (PostgreSQL + REST API)
- Row Level Security for data protection
- Real-time subscriptions

Styling:
- Modular CSS (no frameworks)
- Custom design system
- Mobile-first responsive design
```

### **Project Structure**
```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── staking/         # Staking-specific components
│   └── [others]         # Page-specific components
├── hooks/               # Custom React hooks
│   ├── useColors.ts     # Color management logic
│   ├── useStaking.ts    # Staking operations
│   └── useTelegram.ts   # Telegram WebApp integration
├── store/               # Zustand stores
│   ├── userStore.ts     # User data & profile
│   ├── stakingStore.ts  # Staking & palettes
│   └── gameStore.ts     # Core game state (legacy + refactored)
├── pages/               # Route components
├── types/               # TypeScript definitions
├── config/              # Game configuration
├── utils/               # Utility functions
├── lib/                 # External integrations (Supabase)
└── styles/              # CSS modules
```

---

## 🔧 Current Code Status

### **Architecture State (January 2025)**
✅ **Completed Refactoring:**
- Modular store architecture (user/staking/game separation)
- Custom hooks for business logic
- Reusable UI components
- Fixed all TypeScript errors
- All builds passing

⚠️ **Legacy Code Present:**
- Original monolithic `gameStore.ts` (837 lines) - kept for compatibility
- Some pages still use old patterns
- Migration to new architecture in progress

### **Key Files to Understand**

#### **Stores (Zustand)**
```typescript
// New modular architecture
userStore.ts        // User auth, profile, settings
stakingStore.ts     // Palettes, staking logic
gameStore.refactored.ts  // Core game state

// Legacy (being phased out)
gameStore.ts        // Original monolithic store
```

#### **Hooks**
```typescript
useColors.ts        // Color filtering, search, management
useStaking.ts       // Staking operations, progress tracking
useTelegram.ts      // Telegram WebApp integration
```

#### **UI Components**
```typescript
ui/ColorCard.tsx    // Reusable color display
ui/ProgressBar.tsx  // Animated progress indicators
ui/Button.tsx       // Consistent button styles
staking/StakingCard.tsx  // Complex staking interface
```

### **Database Schema (Supabase)**
```sql
-- Core Tables
users (telegram_id, username, flow_tokens, highest_rarity, start_date)
colors (id, user_id, rarity, hex, name, date_obtained)
palettes (id, user_id, rarity, colors[], staking_count, is_staking)
marketplace_listings (id, color_id, seller_id, price_tokens)
used_colors (hex, user_id, color_id) -- Global uniqueness registry

-- RLS Policies ensure users only access their data
```

---

## 🎮 Game Logic Implementation

### **Color Uniqueness System**
```typescript
// Each RGB combination can only exist once globally
// Enforced at database level with atomic transactions
const color = ColorGenerator.generateColor(rarity);
await GameAPI.createColor(userId, color); // Throws if duplicate
```

### **Staking Mechanics**
```typescript
// Real-time progression with server validation
const stakingTime = isDemoMode ? 
  417 : // 0.4 seconds in demo
  2 * 60 * 60 * 1000; // 2 hours in production

// Only one active staking across entire game
const isAnyStaking = Object.values(palettes).some(p => p.isStaking);
```

### **Rarity Progression**
```typescript
// 9 levels: common → uncommon → rare → mythical → legendary → 
//          ascendant → unique → ulterior → ultimate
const RARITY_LEVELS = [
  'common', 'uncommon', 'rare', 'mythical', 'legendary',
  'ascendant', 'unique', 'ulterior', 'ultimate'
];
```

---

## 🎨 Design Patterns Used

### **State Management Pattern**
```typescript
// Zustand with middleware for subscriptions
export const useStakingStore = create<StakingState>()(
  subscribeWithSelector((set, get) => ({
    // State and actions
  }))
);
```

### **Custom Hooks Pattern**
```typescript
// Business logic abstracted into hooks
export const useColors = () => {
  const gallery = useRefactoredGameStore(state => state.gallery);
  
  const searchColors = (query: string) => {
    return gallery.filter(color => 
      color.name.toLowerCase().includes(query.toLowerCase())
    );
  };
  
  return { gallery, searchColors, /* other methods */ };
};
```

### **Component Composition**
```typescript
// Reusable components with consistent APIs
<ColorCard 
  color={color}
  size="medium"
  status="staking"
  onClick={handleClick}
/>
```

---

## 🔄 Development Workflows

### **Commands**
```bash
npm run dev       # Development server (localhost:3000)
npm run build     # Production build
npm run preview   # Preview production build
npm test          # Run Jest tests
npx tsc --noEmit  # TypeScript check
```

### **Demo Mode**
```typescript
// For testing: 1 day = 0.01 seconds
const DEMO_MODE = true; // Toggle in config/game.ts
// Allows rapid testing of long-term mechanics
```

### **Environment Variables**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BOT_TOKEN=your_telegram_bot_token
```

---

## 🚨 Critical Business Rules

### **Immutable Rules (NEVER CHANGE)**
1. **Color Uniqueness**: Each RGB combination exists only once globally
2. **Real-Time Staking**: Cannot be accelerated or skipped
3. **One Active Staking**: Only one staking process per player
4. **No Pay-to-Win**: Money buys convenience, not progression speed

### **Flexible Rules (Can be adjusted)**
- Staking times (currently 1 day → 730 days)
- Color generation probabilities
- Marketplace commission rates (5%)
- Token exchange rates (1 Star = 100 FlowTokens)

---

## 🎯 Common Development Tasks

### **Adding New Features**
1. **Check existing patterns** in similar components/hooks
2. **Follow TypeScript strict mode** - no `any` types
3. **Use existing UI components** before creating new ones
4. **Test with demo mode** for rapid iteration
5. **Update types** if adding new data structures

### **Bug Fixing Approach**
1. **Check TypeScript errors** first: `npx tsc --noEmit`
2. **Review component state flow** through Zustand dev tools
3. **Test in both demo and production modes**
4. **Verify database constraints** if data-related

### **Performance Considerations**
- Use `useMemo` for expensive color calculations
- Lazy load pages with React.lazy()
- Optimize image loading for color previews
- Minimize re-renders with proper dependency arrays

---

## 📋 Current TODO & Future Plans

### **Immediate Tasks (Current Sprint)**
- [ ] Migrate remaining components to new store architecture
- [ ] Complete UI component library
- [ ] Add comprehensive error boundaries
- [ ] Optimize mobile performance

### **Short-term (1-3 months)**
- [ ] Achievement system implementation
- [ ] Push notifications for staking completion
- [ ] Advanced marketplace features (auctions)
- [ ] Social features (friends, sharing)

### **Medium-term (3-12 months)**  
- [ ] Mobile app development
- [ ] NFT integration on TON blockchain
- [ ] Clan/guild system
- [ ] Advanced analytics dashboard

### **Long-term Vision**
- [ ] Cross-platform synchronization
- [ ] Physical merchandise integration
- [ ] Educational content partnership
- [ ] API for third-party developers

---

## 🛠️ Code Quality Standards

### **TypeScript**
- Strict mode enabled
- No `any` types
- Proper interface definitions
- Generic types where appropriate

### **React Patterns**
- Functional components with hooks
- Custom hooks for business logic
- Props interfaces for all components
- Error boundaries for robusteness

### **State Management**
- Zustand for global state
- Local state for UI-only data  
- Actions co-located with state
- Subscriptions for cross-store communication

### **Styling**
- Modular CSS (no inline styles)
- Mobile-first responsive design
- Consistent spacing/color system
- Telegram theme integration

---

## 🔍 Debugging Tips

### **Common Issues**
1. **Type Errors**: Usually Date vs number confusion in staking times
2. **State Updates**: Check Zustand subscription patterns
3. **Telegram Integration**: Verify WebApp environment
4. **Database Errors**: Check Supabase RLS policies

### **Debugging Tools**
- React DevTools for component inspection
- Zustand DevTools for state debugging
- Supabase dashboard for database queries
- Browser DevTools for network/performance

### **Demo Mode Benefits**
- Rapid testing of long-term mechanics
- Quick progression through all rarity levels
- Immediate feedback on changes
- Safe testing environment

---

## 🎨 Philosophy & Approach

### **Code Philosophy**
- **Clarity over cleverness** - prefer readable code
- **Composition over inheritance** - React components
- **Type safety first** - TypeScript everywhere
- **User experience focus** - smooth, responsive UI

### **Game Design Philosophy**
- **Respect player time** - no artificial wait mechanics
- **Real value creation** - genuine scarcity and uniqueness
- **Sustainable progression** - balanced for long-term play
- **Community first** - features that bring players together

### **When Working with This Codebase**
1. **Understand the vision** - read PROJECT_VISION.md
2. **Follow existing patterns** - consistency is key
3. **Test thoroughly** - this is a long-term project
4. **Think about scale** - millions of colors, thousands of players
5. **Maintain the zen** - keep the meditative experience intact

---

*This context file should provide everything needed to effectively work with the ColorFlow codebase. When in doubt, follow the existing patterns and maintain the project's contemplative philosophy.*