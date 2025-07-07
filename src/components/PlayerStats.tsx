import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export const PlayerStats: React.FC = () => {
  const { 
    gallery, 
    highestRarityAchieved, 
    startDate,
    receivedFreeColor 
  } = useGameStore();

  const daysPlaying = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div 
      className="player-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Статистика игрока</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Всего цветов:</span>
          <span className="stat-value">{gallery.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Высшая редкость:</span>
          <span className="stat-value">{highestRarityAchieved}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Дней в игре:</span>
          <span className="stat-value">{daysPlaying}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Статус:</span>
          <span className="stat-value">
            {receivedFreeColor ? 'Активный игрок' : 'Новичок'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
