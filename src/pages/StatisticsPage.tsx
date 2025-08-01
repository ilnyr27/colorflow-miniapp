import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  Trophy,
  BarChart3,
  Palette,
  Target
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import '@/styles/statistics.css';

export const StatisticsPage: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const { 
    gallery, 
    userProfile, 
    globalStats,
    achievementProgress,
    loadUserProfile,
    loadGlobalStats,
    loadAchievements 
  } = useGameStore();

  // Загружаем данные при монтировании компонента
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadUserProfile(),
          loadGlobalStats(),
          loadAchievements()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных статистики:', error);
      }
    };

    loadData();
  }, [loadUserProfile, loadGlobalStats, loadAchievements]);

  const handleStatClick = () => {
    hapticFeedback.light();
  };

  // Подсчет статистики по редкостям
  const rarityStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    if (gallery && gallery.length > 0) {
      gallery.forEach(color => {
        stats[color.rarity] = (stats[color.rarity] || 0) + 1;
      });
    }
    return stats;
  }, [gallery]);

  // Личная статистика
  const personalStats = [
    {
      title: 'Всего цветов',
      value: gallery?.length || 0,
      icon: Palette,
      color: '#6C5B7B'
    },
    {
      title: 'Стейкингов завершено',
      value: userProfile?.total_stakings || 0,
      icon: Clock,
      color: '#88B04B'
    },
    {
      title: 'FlowTokens',
      value: userProfile?.flow_tokens || 0,
      icon: Star,
      color: '#F67280'
    },
    {
      title: 'Высшая редкость',
      value: userProfile?.highest_rarity || 'Common',
      icon: Trophy,
      color: '#3498DB'
    }
  ];

  // Глобальная статистика
  const globalStatsList = [
    {
      title: 'Игроков онлайн',
      value: globalStats?.online_players || 0,
      icon: Users,
      color: '#e74c3c'
    },
    {
      title: 'Всего цветов создано',
      value: globalStats?.total_colors || 0,
      icon: TrendingUp,
      color: '#27ae60'
    },
    {
      title: 'Активных стейкингов',
      value: globalStats?.active_stakings || 0,
      icon: BarChart3,
      color: '#f39c12'
    },
    {
      title: 'Всего операций',
      value: globalStats?.total_operations || 0,
      icon: Target,
      color: '#9b59b6'
    }
  ];

  return (
    <motion.div
      className="statistics-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Заголовок */}
      <div className="statistics-header">
        <h1>Статистика</h1>
        <p>Ваш прогресс и достижения</p>
      </div>

      {/* Личная статистика */}
      <section className="stats-section">
        <h2>Личная статистика</h2>
        <div className="stats-grid">
          {personalStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={handleStatClick}
                whileTap={{ scale: 0.95 }}
              >
                <div className="stat-icon" style={{ color: stat.color }}>
                  <IconComponent size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stat.title}</h3>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Статистика по редкостям */}
      <section className="stats-section">
        <h2>Коллекция по редкостям</h2>
        <div className="rarity-stats">
          {Object.entries(rarityStats).map(([rarity, count], index) => (
            <motion.div
              key={rarity}
              className="rarity-stat-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="rarity-name">{rarity}</span>
              <div className="rarity-bar">
                <motion.div
                  className="rarity-progress"
                  style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                />
              </div>
              <span className="rarity-count">{count}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Глобальная статистика */}
      <section className="stats-section">
        <h2>Глобальная статистика</h2>
        <div className="stats-grid">
          {globalStatsList.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                className="stat-card global"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                onClick={handleStatClick}
                whileTap={{ scale: 0.95 }}
              >
                <div className="stat-icon" style={{ color: stat.color }}>
                  <IconComponent size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stat.title}</h3>
                  <p className="stat-value">{stat.value.toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Достижения */}
      <section className="stats-section">
        <h2>Достижения</h2>
        <div className="achievements-list">
          {achievementProgress?.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <div className="achievement-icon">
                <Trophy size={20} />
              </div>
              <div className="achievement-info">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <div className="achievement-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                  <span className="progress-text">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
              </div>
            </motion.div>
          )) || (
            <div className="no-achievements">
              <p>Достижения загружаются...</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};
