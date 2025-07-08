import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ColorRarity, Palette } from '@/types/game';
import { GAME_CONFIG } from '@/config/game';

interface StakingStatusProps {
  rarity: ColorRarity;
  palette: Palette;
  onStakingComplete?: () => void;
}

export const StakingStatus: React.FC<StakingStatusProps> = ({ 
  rarity, 
  palette, 
  onStakingComplete 
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Обновляем время каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeRemaining = palette.stakingEndTime 
    ? Math.max(0, palette.stakingEndTime.getTime() - currentTime)
    : 0;

  // Если время истекло, вызываем callback
  useEffect(() => {
    if (timeRemaining === 0 && palette.isStaking && onStakingComplete) {
      onStakingComplete();
    }
  }, [timeRemaining, palette.isStaking, onStakingComplete]);

  // Получаем общее время стейкинга для этой редкости
  const totalStakingTime = GAME_CONFIG.STAKING_TIMES[rarity] * 60 * 1000; // в миллисекундах
  const progress = totalStakingTime > 0 
    ? Math.max(0, Math.min(100, ((totalStakingTime - timeRemaining) / totalStakingTime) * 100))
    : 0;

  // Форматируем время
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}д ${hours}ч ${minutes}м`;
    } else if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    } else {
      return `${minutes}м ${seconds}с`;
    }
  };

  const getRarityColor = (rarity: ColorRarity): string => {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      mythical: '#9c27b0',
      legendary: '#ff9800',
      ascendant: '#f44336',
      unique: '#e91e63',
      ulterior: '#3f51b5',
      ultimate: '#000000'
    };
    return colors[rarity] || '#9e9e9e';
  };

  if (!palette.isStaking) {
    return null;
  }

  return (
    <motion.div 
      className="staking-status"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="staking-header">
        <h3>🔄 Стейкинг активен</h3>
        <span 
          className="rarity-badge"
          style={{ 
            backgroundColor: getRarityColor(rarity),
            color: 'white',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}
        >
          {rarity}
        </span>
      </div>

      <div className="staking-info">
        <div className="time-display">
          <p className="time-label">Осталось времени:</p>
          <div className="countdown">
            {timeRemaining > 0 ? formatTime(timeRemaining) : '⏰ Готово!'}
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${getRarityColor(rarity)}, ${getRarityColor(rarity)}aa)`
              }}
            />
          </div>
          <div className="progress-text">
            {progress.toFixed(1)}% завершено
          </div>
        </div>

        {timeRemaining === 0 && (
          <motion.div 
            className="completion-notice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ✨ Стейкинг завершен! Получите новый цвет!
          </motion.div>
        )}
      </div>

      <div className="staking-details">
        <p className="detail-item">
          <span className="detail-label">Цветов в стейкинге:</span>
          <span className="detail-value">{palette.colors.filter(c => c !== null).length}</span>
        </p>
        <p className="detail-item">
          <span className="detail-label">Общее время:</span>
          <span className="detail-value">{GAME_CONFIG.STAKING_TIMES[rarity]} мин</span>
        </p>
      </div>
    </motion.div>
  );
};
