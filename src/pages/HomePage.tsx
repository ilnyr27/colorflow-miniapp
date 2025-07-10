import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { PlayerStats } from '@/components/PlayerStats';
import { StakingStatus } from '@/components/StakingStatus';
import { Coins, TrendingUp, Clock, Star, Palette } from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    user,
    gallery,
    flowTokens,
    palettes,
    updateStakingProgress,
    highestRarityAchieved
  } = useGameStore();

  const { colorScheme } = useTelegram();

  // Обновляем прогресс стейкинга каждую секунду
  useEffect(() => {
    const interval = setInterval(updateStakingProgress, 1000);
    return () => clearInterval(interval);
  }, [updateStakingProgress]);

  // Проверяем, есть ли активный стейкинг
  const activeStaking = Object.entries(palettes).find(([_, palette]) => palette.isStaking);
  
  // Статистика для дашборда
  const totalColors = gallery.length;
  const uniqueRarities = new Set(gallery.map(c => c.rarity)).size;
  const totalStakings = Object.values(palettes).reduce((sum, p) => sum + p.stakingCount, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`home-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="user-info">
            <h1 className="page-title">ColorFlow</h1>
            <p className="user-greeting">
              Привет, {user?.first_name}! 👋
            </p>
          </div>
          
          <div className="currency-display">
            <div className="currency-item">
              <Coins size={16} />
              <span>{flowTokens}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="home-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats */}
        <motion.div className="quick-stats" variants={itemVariants}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Palette size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalColors}</div>
                <div className="stat-label">Собрано оттенков</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{uniqueRarities}</div>
                <div className="stat-label">Редкостей</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalStakings}</div>
                <div className="stat-label">Стейкингов</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{highestRarityAchieved}</div>
                <div className="stat-label">Макс. редкость</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Staking */}
        {activeStaking && (
          <motion.div className="active-staking-section" variants={itemVariants}>
            <h3 className="section-title">
              <Clock size={20} />
              Активный стейкинг
            </h3>
            <StakingStatus 
              rarity={activeStaking[0] as any}
              palette={activeStaking[1]}
            />
          </motion.div>
        )}

        {/* Player Stats */}
        <motion.div className="player-stats-section" variants={itemVariants}>
          <h3 className="section-title">
            <TrendingUp size={20} />
            Детальная статистика
          </h3>
          <PlayerStats />
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="recent-activity" variants={itemVariants}>
          <h3 className="section-title">
            <Star size={20} />
            Последние достижения
          </h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🎨</div>
              <div className="activity-content">
                <div className="activity-title">Получен новый цвет</div>
                <div className="activity-time">2 часа назад</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🚀</div>
              <div className="activity-content">
                <div className="activity-title">Завершен стейкинг Common</div>
                <div className="activity-time">5 часов назад</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">⭐</div>
              <div className="activity-content">
                <div className="activity-title">Достигнута редкость {highestRarityAchieved}</div>
                <div className="activity-time">1 день назад</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
