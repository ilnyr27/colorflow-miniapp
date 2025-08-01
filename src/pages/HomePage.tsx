import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { 
  Users, 
  Palette, 
  Crown, 
  Timer, 
  Database,
  UserCheck,
  Zap,
  TrendingUp,
  Activity,
  Coins
} from 'lucide-react';
import '@/styles/main.css';
import '@/styles/home.css';

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
  
  // Реальная глобальная статистика (здесь можно подключить API)
  const [globalStats, setGlobalStats] = useState({
    totalColors: 847293,
    totalPlayers: 25841,
    onlineNow: 1247,
    totalStakings: 156789
  });

  // Обновляем прогресс стейкинга каждую секунду
  useEffect(() => {
    const interval = setInterval(updateStakingProgress, 1000);
    return () => clearInterval(interval);
  }, [updateStakingProgress]);

  // Вычисляем реальную статистику игрока
  const playerStats = React.useMemo(() => {
    const totalColors = gallery.length;
    const rarityDistribution = gallery.reduce((acc, color) => {
      acc[color.rarity] = (acc[color.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueRarities = Object.keys(rarityDistribution).length;
    const totalStakings = Object.values(palettes).reduce((sum, p) => sum + p.stakingCount, 0);
    
    // Подсчет активных стейкингов
    const activeStakings = Object.values(palettes).filter(p => p.isStaking).length;

    // Подсчет уровня игрока на основе коллекции
    const playerLevel = Math.floor(totalColors / 5) + Math.floor(totalStakings / 3);

    return {
      totalColors,
      uniqueRarities,
      totalStakings,
      activeStakings,
      maxRarity: highestRarityAchieved || 'common',
      playerLevel
    };
  }, [gallery, palettes, highestRarityAchieved]);

  // Получаем активный стейкинг
  const activeStaking = Object.values(palettes).find(p => p.isStaking);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    
    if (remaining === 0) return "Завершен";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const getStakingProgress = (startTime: number, duration: number) => {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(100, (elapsed / duration) * 100);
    return Math.max(0, progress);
  };

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
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="home-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Глобальная статистика */}
        <motion.div className="global-stats" variants={itemVariants}>
          <div className="stats-title">
            <Database size={20} />
            Глобальная статистика
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{formatNumber(globalStats.totalColors)}</div>
              <div className="stat-label">Всего цветов</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatNumber(globalStats.totalPlayers)}</div>
              <div className="stat-label">Игроков</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatNumber(globalStats.onlineNow)}</div>
              <div className="stat-label">Онлайн</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatNumber(globalStats.totalStakings)}</div>
              <div className="stat-label">Стейкингов</div>
            </div>
          </div>
        </motion.div>

        {/* Ваша статистика */}
        <motion.div className="personal-stats" variants={itemVariants}>
          <div className="stats-title">
            <UserCheck size={20} />
            Ваша статистика
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{playerStats.totalColors}</div>
              <div className="stat-label">Ваших цветов</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{playerStats.uniqueRarities}</div>
              <div className="stat-label">Редкостей</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatNumber(flowTokens)}</div>
              <div className="stat-label">Flow токенов</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{playerStats.playerLevel}</div>
              <div className="stat-label">Уровень</div>
            </div>
          </div>
        </motion.div>

        {/* Активный стейкинг */}
        <motion.div className="active-staking" variants={itemVariants}>
          <div className="staking-title">
            <Zap size={20} />
            Активный стейкинг
          </div>
          
          {activeStaking ? (
            <div className="staking-card">
              <div className="staking-info">
                <div className="staking-amount">
                  {activeStaking.colors.length} цветов
                </div>
                <div className="staking-duration">
                  Осталось: {formatTimeRemaining(
                    typeof activeStaking.stakingEndTime === 'number' 
                      ? activeStaking.stakingEndTime 
                      : activeStaking.stakingEndTime!.getTime()
                  )}
                </div>
                <div className="staking-progress">
                  <div 
                    className="staking-progress-bar"
                    style={{ 
                      width: `${getStakingProgress(
                        typeof activeStaking.stakingStartTime === 'number' 
                          ? activeStaking.stakingStartTime 
                          : activeStaking.stakingStartTime!.getTime(),
                        (typeof activeStaking.stakingEndTime === 'number' 
                          ? activeStaking.stakingEndTime 
                          : activeStaking.stakingEndTime!.getTime()) -
                        (typeof activeStaking.stakingStartTime === 'number' 
                          ? activeStaking.stakingStartTime 
                          : activeStaking.stakingStartTime!.getTime())
                      )}%` 
                    }}
                  />
                </div>
                <div className="staking-reward">
                  <span>Ожидаемая награда:</span>
                  <span>
                    <Coins size={16} />
                    +{activeStaking.colors.length * 25}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-staking">
              <div className="no-staking-icon">
                <Activity size={48} />
              </div>
              <div>
                <div className="text-muted">Нет активных стейкингов</div>
                <div className="text-muted mt-1">Создайте палитру для получения наград</div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
