import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ColorGenerator } from '@/utils/colorGenerator';

export const PaletteSection: React.FC = () => {
  const { 
    palettes, 
    activePaletteTab, 
    removeColorFromPalette, 
    startStaking,
    upgradeColors 
  } = useGameStore();
  const { hapticFeedback } = useTelegram();
  const currentPalette = palettes[activePaletteTab];

  const handleSlotClick = async (slotIndex: number) => {
    const color = currentPalette.colors[slotIndex];
    if (!color) return;

    if (currentPalette.isStaking) {
      alert('Нельзя изменять палитру во время стейкинга');
      return;
    }

    try {
      await removeColorFromPalette(activePaletteTab, slotIndex);
      hapticFeedback.light();
    } catch (error) {
      console.error('Ошибка удаления цвета:', error);
      alert(error instanceof Error ? error.message : 'Ошибка удаления цвета');
    }
  };

  const handleStartStaking = async () => {
    try {
      await startStaking(activePaletteTab);
      hapticFeedback.medium();
    } catch (error) {
      console.error('Ошибка запуска стейкинга:', error);
      alert(error instanceof Error ? error.message : 'Ошибка запуска стейкинга');
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeColors(activePaletteTab);
      hapticFeedback.heavy();
    } catch (error) {
      console.error('Ошибка улучшения:', error);
      alert(error instanceof Error ? error.message : 'Ошибка улучшения');
    }
  };

  const filledSlots = currentPalette.colors.filter(c => c !== null).length;
  const canStartStaking = filledSlots > 0 && !currentPalette.isStaking;
  const canUpgrade = filledSlots === currentPalette.maxSlots && !currentPalette.isStaking;

  return (
    <motion.div 
      className="palette-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="palette-header">
        <h3>Палитра {activePaletteTab}</h3>
        <div className="palette-status">
          {currentPalette.isStaking && (
            <span className="staking-indicator">🔄 Стейкинг активен</span>
          )}
        </div>
      </div>

      <div className="palette-slots">
        {currentPalette.colors.map((color, index) => (
          <motion.div
            key={index}
            className={`palette-slot ${color ? 'filled' : 'empty'} ${currentPalette.isStaking ? 'staking' : ''}`}
            style={{
              backgroundColor: color 
                ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
                : 'rgba(255, 255, 255, 0.1)',
              border: color 
                ? `2px solid ${ColorGenerator.getBorderColor(color.rarity)}`
                : '2px dashed rgba(255, 255, 255, 0.3)'
            }}
            onClick={() => handleSlotClick(index)}
            whileHover={color && !currentPalette.isStaking ? { scale: 1.05 } : {}}
            whileTap={color && !currentPalette.isStaking ? { scale: 0.95 } : {}}
          >
            {!color && <span className="slot-empty">+</span>}
            {color && (
              <div className="slot-info">
                <div className="color-hex">
                  {ColorGenerator.getHexCode(color.rgb)}
                </div>
                {!currentPalette.isStaking && (
                  <div className="remove-hint">Нажмите для удаления</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="palette-info">
        <div className="palette-stats">
          <p>Слотов заполнено: {filledSlots}/{currentPalette.maxSlots}</p>
          <p>Стейкингов выполнено: {currentPalette.stakingCount}</p>
        </div>

        <div className="palette-actions">
          {canStartStaking && (
            <motion.button
              className="staking-btn"
              onClick={handleStartStaking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Начать стейкинг
            </motion.button>
          )}

          {canUpgrade && (
            <motion.button
              className="upgrade-btn"
              onClick={handleUpgrade}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⬆️ Улучшить до {getNextRarity(activePaletteTab)}
            </motion.button>
          )}

          {filledSlots === 0 && (
            <p className="palette-hint">
              Добавьте цвета из галереи для начала стейкинга
            </p>
          )}

          {filledSlots > 0 && filledSlots < currentPalette.maxSlots && !currentPalette.isStaking && (
            <p className="palette-hint">
              Добавьте еще {currentPalette.maxSlots - filledSlots} цветов для улучшения
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get next rarity
function getNextRarity(currentRarity: string): string {
  const rarities = [
    'common', 'uncommon', 'rare', 'mythical', 'legendary', 
    'ascendant', 'unique', 'ulterior', 'ultimate'
  ];
  const currentIndex = rarities.indexOf(currentRarity);
  return currentIndex < rarities.length - 1 ? rarities[currentIndex + 1] : 'ultimate';
}
