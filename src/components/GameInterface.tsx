import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ColorGallery } from './ColorGallery';
import { PaletteSection } from './PaletteSection';
import { StakingStatus } from './StakingStatus';
import { PlayerStats } from './PlayerStats';
import { ShopButton } from './ShopButton';
import { Coins, Palette, Star } from 'lucide-react';

export const GameInterface: React.FC = () => {
  const {
    user,
    gallery,
    flowTokens,
    activePaletteTab,
    palettes,
    updateStakingProgress,
    setActivePaletteTab
  } = useGameStore();

  const { colorScheme, hapticFeedback } = useTelegram();

  // Обновляем прогресс стейкинга каждую секунду
  useEffect(() => {
    const interval = setInterval(updateStakingProgress, 1000);
    return () => clearInterval(interval);
  }, [updateStakingProgress]);

  // Проверяем, есть ли активный стейкинг
  const activeStaking = Object.entries(palettes).find(([_, palette]) => palette.isStaking);

  return (
    <div className={`game-interface theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="game-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="user-info">
            <h1 className="game-title">ColorFlow</h1>
            <p className="user-greeting">
              Привет, {user?.first_name}! 👋
            </p>
          </div>
          
          <div className="currency-info">
            <div className="currency-item">
              <Coins size={16} />
              <span>{flowTokens}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Game Area */}
      <div className="game-main">
        <div className="game-left">
          {/* Player Stats */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <PlayerStats />
          </motion.div>

          {/* Color Gallery */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ColorGallery />
          </motion.div>

          {/* Shop Button */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ShopButton />
          </motion.div>
        </div>

        <div className="game-right">
          {/* Staking Status */}
          <AnimatePresence>
            {activeStaking && (
              <motion.div
                initial={{ x: 20, opacity: 0, height: 0 }}
                animate={{ x: 0, opacity: 1, height: 'auto' }}
                exit={{ x: 20, opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StakingStatus 
                  rarity={activeStaking[0] as any}
                  palette={activeStaking[1]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Palette Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <PaletteSection />
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation/Actions */}
      <motion.div
        className="game-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="rarity-tabs">
          {['common', 'uncommon', 'rare', 'mythical', 'legendary', 'ascendant', 'unique', 'ulterior', 'ultimate'].map((rarity, index) => {
            // Показываем вкладку только если у игрока есть цвета этой редкости или предыдущей
            const hasColors = gallery.some(color => color.rarity === rarity);
            const hasColorsInPalette = palettes[rarity as any]?.colors.some(c => c !== null);
            const shouldShow = hasColors || hasColorsInPalette || index === 0;
            
            if (!shouldShow) return null;

            return (
              <motion.button
                key={rarity}
                className={`rarity-tab ${activePaletteTab === rarity ? 'active' : ''}`}
                onClick={() => {
                  setActivePaletteTab(rarity as any);
                  hapticFeedback.light();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  borderColor: getBorderColor(rarity as any),
                  backgroundColor: activePaletteTab === rarity ? getBorderColor(rarity as any) + '20' : 'transparent'
                }}
              >
                <Palette size={14} />
                <span className="rarity-name">{rarity}</span>
                {(hasColors || hasColorsInPalette) && (
                  <span className="rarity-count">
                    {gallery.filter(c => c.rarity === rarity).length + 
                     (palettes[rarity as any]?.colors.filter(c => c !== null).length || 0)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

// Helper function
function getBorderColor(rarity: string): string {
  const colors = {
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
  
  return colors[rarity as keyof typeof colors] || '#ffffff';
}