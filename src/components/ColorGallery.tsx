import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ColorGenerator } from '@/utils/colorGenerator';

export const ColorGallery: React.FC = () => {
  const { gallery, addColorToPalette, activePaletteTab } = useGameStore();
  const { hapticFeedback } = useTelegram();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleColorClick = (colorId: string) => {
    hapticFeedback.light();
    
    if (selectedColor === colorId) {
      setSelectedColor(null);
    } else {
      setSelectedColor(colorId);
    }
  };

  const handleAddToPalette = async (colorId: string) => {
    const color = gallery.find(c => c.id === colorId);
    if (!color) return;

    try {
      // Находим первый свободный слот в активной палитре
      const { palettes } = useGameStore.getState();
      const currentPalette = palettes[activePaletteTab];
      const emptySlotIndex = currentPalette.colors.findIndex(c => c === null);
      
      if (emptySlotIndex === -1) {
        alert('Все слоты в палитре заняты!');
        return;
      }

      if (color.rarity !== activePaletteTab) {
        alert(`Цвет редкости ${color.rarity} нельзя добавить в палитру ${activePaletteTab}`);
        return;
      }

      await addColorToPalette(colorId, color.rarity, emptySlotIndex);
      setSelectedColor(null);
      hapticFeedback.medium();
    } catch (error) {
      console.error('Ошибка добавления цвета в палитру:', error);
      alert(error instanceof Error ? error.message : 'Ошибка добавления цвета');
    }
  };

  if (gallery.length === 0) {
    return (
      <motion.div 
        className="color-gallery"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3>Галерея цветов (0)</h3>
        <div className="empty-gallery">
          <p>У вас пока нет цветов</p>
          <p>Получите первый цвет или купите новые!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="color-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Галерея цветов ({gallery.length})</h3>
      {selectedColor && (
        <div className="gallery-hint">
          <p>Выберите слот в палитре {activePaletteTab} или нажмите на цвет еще раз</p>
        </div>
      )}
      <div className="gallery-grid">
        {gallery.map((color) => (
          <motion.div
            key={color.id}
            className={`color-item ${selectedColor === color.id ? 'selected' : ''}`}
            style={{
              backgroundColor: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
              border: selectedColor === color.id ? '3px solid #fff' : `2px solid ${ColorGenerator.getBorderColor(color.rarity)}`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleColorClick(color.id)}
          >
            <div className="color-info">
              <span className="color-rarity" style={{ 
                backgroundColor: ColorGenerator.getBorderColor(color.rarity),
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                textTransform: 'uppercase'
              }}>
                {color.rarity}
              </span>
              {color.name && <span className="color-name">{color.name}</span>}
            </div>
            <div className="color-hex">
              {ColorGenerator.getHexCode(color.rgb)}
            </div>
            {selectedColor === color.id && (
              <motion.button
                className="add-to-palette-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToPalette(color.id);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                В палитру
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
