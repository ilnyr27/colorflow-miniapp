import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { GAME_CONFIG, PROGRESSION_TIMELINE, RARITY_COLORS } from '@/config/game';
import { Trophy, List, Clock, Star, Lock, CheckCircle } from 'lucide-react';
import { ColorRarity } from '@/types/game';

type RaritiesTab = 'list' | 'progression' | 'achievements';

export const RaritiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RaritiesTab>('list');
  const { gallery, highestRarityAchieved, startDate } = useGameStore();
  const { colorScheme, hapticFeedback } = useTelegram();

  const tabs = [
    {
      id: 'list' as RaritiesTab,
      label: 'Список',
      icon: List,
      color: '#6c5ce7'
    },
    {
      id: 'progression' as RaritiesTab,
      label: 'Прогресс',
      icon: Clock,
      color: '#00b894'
    },
    {
      id: 'achievements' as RaritiesTab,
      label: 'Достижения',
      icon: Trophy,
      color: '#fdcb6e'
    }
  ];

  const handleTabChange = (tabId: RaritiesTab) => {
    setActiveTab(tabId);
    hapticFeedback.light();
  };

  // Подсчитываем дни игры
  const daysPlaying = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Группируем цвета по редкости
  const colorsByRarity = gallery.reduce((acc, color) => {
    if (!acc[color.rarity]) acc[color.rarity] = [];
    acc[color.rarity].push(color);
    return acc;
  }, {} as Record<ColorRarity, typeof gallery>);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  const getRarityStatus = (rarity: ColorRarity) => {
    const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
    const highestIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(highestRarityAchieved);
    const requiredDays = PROGRESSION_TIMELINE[rarity];
    
    if (rarityIndex <= highestIndex) return 'achieved';
    if (daysPlaying >= requiredDays) return 'available';
    return 'locked';
  };

  return (
    <div className={`rarities-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1 className="page-title">
            <Trophy size={24} />
            Редкости
          </h1>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <motion.div
        className="tab-navigation"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="tab-container">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                className={`tab-button ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  borderColor: isActive ? tab.color : 'transparent',
                  backgroundColor: isActive ? `${tab.color}20` : 'transparent'
                }}
              >
                <motion.div
                  className="tab-content"
                  animate={{
                    color: isActive ? tab.color : '#6c757d'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                  
                  {isActive && (
                    <motion.div
                      className="tab-indicator"
                      layoutId="rarities-tab-indicator"
                      style={{ backgroundColor: tab.color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        className="rarities-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div
              key="list"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <List size={20} />
                  Все редкости
                </h3>
                <p className="section-description">
                  Полный список всех уровней редкости в игре и их характеристики.
                </p>
                
                <div className="rarities-list">
                  {GAME_CONFIG.RARITY_LEVELS.map((rarity, index) => {
                    const status = getRarityStatus(rarity);
                    const ownedCount = colorsByRarity[rarity]?.length || 0;
                    const totalCount = GAME_CONFIG.TOTAL_COLOR_COUNTS[rarity];
                    const stakingTime = GAME_CONFIG.STAKING_TIME_TABLE[rarity]?.[0] || 0;
                    const upgradeReq = GAME_CONFIG.UPGRADE_REQUIREMENTS[rarity];
                    
                    return (
                      <motion.div
                        key={rarity}
                        className={`rarity-card ${status}`}
                        variants={itemVariants}
                        style={{ borderColor: RARITY_COLORS[rarity] }}
                      >
                        <div className="rarity-header">
                          <div className="rarity-info">
                            <div 
                              className="rarity-badge"
                              style={{ backgroundColor: RARITY_COLORS[rarity] }}
                            >
                              {status === 'achieved' && <CheckCircle size={16} />}
                              {status === 'locked' && <Lock size={16} />}
                              {status === 'available' && <Star size={16} />}
                            </div>
                            <div className="rarity-details">
                              <h4 className="rarity-name" style={{ color: RARITY_COLORS[rarity] }}>
                                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                              </h4>
                              <div className="rarity-stats">
                                <span>#{index + 1}</span>
                                <span>•</span>
                                <span>{ownedCount}/{totalCount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rarity-progress">
                            <div className="progress-circle">
                              <span>{ownedCount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rarity-properties">
                          <div className="property">
                            <Clock size={14} />
                            <span>Стейкинг: {stakingTime}ч</span>
                          </div>
                          <div className="property">
                            <Trophy size={14} />
                            <span>Улучшение: {upgradeReq} цветов</span>
                          </div>
                          {GAME_CONFIG.STAR_PRICES[rarity] > 0 && (
                            <div className="property">
                              <Star size={14} />
                              <span>Цена: {GAME_CONFIG.STAR_PRICES[rarity]} ⭐</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'progression' && (
            <motion.div
              key="progression"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Clock size={20} />
                  Временная шкала
                </h3>
                <p className="section-description">
                  Прогресс открытия новых редкостей. Вы играете {daysPlaying} дней.
                </p>
                
                <div className="progression-timeline">
                  {GAME_CONFIG.RARITY_LEVELS.map((rarity, index) => {
                    const requiredDays = PROGRESSION_TIMELINE[rarity];
                    const isUnlocked = daysPlaying >= requiredDays;
                    const isAchieved = getRarityStatus(rarity) === 'achieved';
                    
                    return (
                      <motion.div
                        key={rarity}
                        className={`timeline-item ${isUnlocked ? 'unlocked' : 'locked'} ${isAchieved ? 'achieved' : ''}`}
                        variants={itemVariants}
                      >
                        <div className="timeline-marker">
                          <div 
                            className="marker-dot"
                            style={{ backgroundColor: isUnlocked ? RARITY_COLORS[rarity] : '#adb5bd' }}
                          >
                            {isAchieved && <CheckCircle size={12} />}
                          </div>
                          {index < GAME_CONFIG.RARITY_LEVELS.length - 1 && (
                            <div className="timeline-line" />
                          )}
                        </div>
                        
                        <div className="timeline-content">
                          <h4 
                            className="timeline-title"
                            style={{ color: isUnlocked ? RARITY_COLORS[rarity] : '#6c757d' }}
                          >
                            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                          </h4>
                          <div className="timeline-info">
                            <span>День {requiredDays}</span>
                            {!isUnlocked && (
                              <span className="time-remaining">
                                (через {requiredDays - daysPlaying} дней)
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Trophy size={20} />
                  Достижения
                </h3>
                <p className="section-description">
                  Особые награды за достижение определенных редкостей.
                </p>
                
                <div className="achievements-grid">
                  {['ascendant', 'unique', 'ulterior', 'ultimate'].map((rarity) => {
                    const isAchieved = getRarityStatus(rarity as ColorRarity) === 'achieved';
                    const reward = {
                      ascendant: 100,
                      unique: 250,
                      ulterior: 500,
                      ultimate: 1000
                    }[rarity] || 0;
                    
                    return (
                      <motion.div
                        key={rarity}
                        className={`achievement-card ${isAchieved ? 'achieved' : 'locked'}`}
                        variants={itemVariants}
                        style={{ borderColor: RARITY_COLORS[rarity as ColorRarity] }}
                      >
                        <div className="achievement-icon">
                          {isAchieved ? (
                            <CheckCircle size={32} style={{ color: RARITY_COLORS[rarity as ColorRarity] }} />
                          ) : (
                            <Lock size={32} style={{ color: '#adb5bd' }} />
                          )}
                        </div>
                        
                        <div className="achievement-info">
                          <h4 
                            className="achievement-title"
                            style={{ color: isAchieved ? RARITY_COLORS[rarity as ColorRarity] : '#6c757d' }}
                          >
                            Первый {rarity}
                          </h4>
                          <p className="achievement-description">
                            Получите свой первый цвет редкости {rarity}
                          </p>
                          <div className="achievement-reward">
                            <Star size={16} />
                            <span>+{reward} FlowTokens</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
