import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export const ColorGallery: React.FC = () => {
  const { gallery } = useGameStore();

  return (
    <motion.div 
      className="color-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Галерея цветов ({gallery.length})</h3>
      <div className="gallery-grid">
        {gallery.map((color) => (
          <motion.div
            key={color.id}
            className="color-item"
            style={{
              backgroundColor: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="color-info">
              <span className="color-rarity">{color.rarity}</span>
              {color.name && <span className="color-name">{color.name}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
