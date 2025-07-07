import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export const PaletteSection: React.FC = () => {
  const { palettes, activePaletteTab } = useGameStore();
  const currentPalette = palettes[activePaletteTab];

  return (
    <motion.div 
      className="palette-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Палитра {activePaletteTab}</h3>
      <div className="palette-slots">
        {currentPalette.colors.map((color, index) => (
          <div
            key={index}
            className="palette-slot"
            style={{
              backgroundColor: color 
                ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
                : '#f0f0f0'
            }}
          >
            {!color && <span className="slot-empty">+</span>}
          </div>
        ))}
      </div>
      <div className="palette-info">
        <p>Слотов заполнено: {currentPalette.colors.filter(c => c !== null).length}/{currentPalette.maxSlots}</p>
        <p>Стейкингов: {currentPalette.stakingCount}</p>
      </div>
    </motion.div>
  );
};
