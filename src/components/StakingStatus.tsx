import React from 'react';
import { motion } from 'framer-motion';
import { ColorRarity, Palette } from '@/types/game';

interface StakingStatusProps {
  rarity: ColorRarity;
  palette: Palette;
}

export const StakingStatus: React.FC<StakingStatusProps> = ({ rarity, palette }) => {
  const timeRemaining = palette.stakingEndTime 
    ? Math.max(0, palette.stakingEndTime.getTime() - Date.now())
    : 0;
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <motion.div 
      className="staking-status"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Стейкинг активен</h3>
      <div className="staking-info">
        <p>Редкость: <span className="rarity">{rarity}</span></p>
        <p>Осталось времени:</p>
        <div className="countdown">
          <span>{hours.toString().padStart(2, '0')}</span>:
          <span>{minutes.toString().padStart(2, '0')}</span>:
          <span>{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{
            width: `${100 - (timeRemaining / (24 * 60 * 60 * 1000)) * 100}%`
          }}
        />
      </div>
    </motion.div>
  );
};
