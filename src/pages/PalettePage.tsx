import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { PageHeader } from '@/components/PageHeader';
import { ColorRarity } from '@/types/game';
import { GAME_CONFIG } from '@/config/game';
import { 
  Palette, 
  Plus, 
  Play, 
  X,
  Crown,
  Timer,
  Zap,
  ArrowUp,
  Pause,
  RotateCcw
} from 'lucide-react';
import '@/styles/main.css';
import '@/styles/palette.css';

export const PalettePage: React.FC = () => {
  const { 
    gallery, 
    palettes,
    activePaletteTab,
    setActivePaletteTab,
    addColorToPalette,
    removeColorFromPalette,
    startStaking,
    cancelStaking,
    upgradeColors,
    highestRarityAchieved,
    isDemoMode
  } = useGameStore();
  
  const { hapticFeedback } = useTelegram();
  
  const [stakingProgress, setStakingProgress] = useState<Record<ColorRarity, number>>({} as Record<ColorRarity, number>);

  // Обновляем прогресс стейкинга каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newProgress: Record<ColorRarity, number> = {} as Record<ColorRarity, number>;
      
      GAME_CONFIG.RARITY_LEVELS.forEach(rarity => {
        const palette = palettes[rarity];
        if (palette.isStaking && palette.stakingStartTime && palette.stakingEndTime) {
          const startTime = typeof palette.stakingStartTime === 'number' ? palette.stakingStartTime : palette.stakingStartTime.getTime();
          const endTime = typeof palette.stakingEndTime === 'number' ? palette.stakingEndTime : palette.stakingEndTime.getTime();
          const totalTime = endTime - startTime;
          const elapsed = now - startTime;
          const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
          newProgress[rarity] = progress;
        } else {
          newProgress[rarity] = 0;
        }
      });
      
      setStakingProgress(newProgress);
    }, 1000);

    return () => clearInterval(interval);
  }, [palettes]);

  // Получаем доступные редкости (разблокированные)
  const getAvailableRarities = (): ColorRarity[] => {
    const highestIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(highestRarityAchieved);
    return GAME_CONFIG.RARITY_LEVELS.slice(0, highestIndex + 1);
  };

  // Получаем цвета определенной редкости из галереи
  const getColorsOfRarity = (rarity: ColorRarity) => {
    return gallery.filter(color => color.rarity === rarity);
  };

  // Добавляем первый доступный цвет в палитру
  const handleAddColor = async (rarity: ColorRarity) => {
    const availableColors = getColorsOfRarity(rarity);
    if (availableColors.length === 0) {
      hapticFeedback.error();
      return;
    }

    const palette = palettes[rarity];
    const firstEmptySlot = palette.colors.findIndex(c => c === null);
    
    if (firstEmptySlot === -1) {
      hapticFeedback.error();
      return;
    }

    try {
      hapticFeedback.light();
      await addColorToPalette(availableColors[0].id, rarity, firstEmptySlot);
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка добавления цвета:', error);
    }
  };

  // Удаляем цвет из палитры
  const handleRemoveColor = async (rarity: ColorRarity, slotIndex: number) => {
    try {
      hapticFeedback.light();
      await removeColorFromPalette(rarity, slotIndex);
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка удаления цвета:', error);
    }
  };

  // Запускаем стейкинг
  const handleStartStaking = async (rarity: ColorRarity) => {
    try {
      hapticFeedback.medium();
      await startStaking(rarity);
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка запуска стейкинга:', error);
    }
  };

  // Отменяем стейкинг
  const handleCancelStaking = async (rarity: ColorRarity) => {
    try {
      hapticFeedback.medium();
      await cancelStaking(rarity);
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка отмены стейкинга:', error);
    }
  };

  // Улучшаем цвета
  const handleUpgrade = async (rarity: ColorRarity) => {
    try {
      hapticFeedback.success();
      await upgradeColors(rarity);
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка улучшения:', error);
    }
  };

  // Форматируем время до завершения стейкинга
  const formatTimeRemaining = (rarity: ColorRarity): string => {
    const palette = palettes[rarity];
    if (!palette.isStaking || !palette.stakingEndTime) return '';
    
    const endTime = typeof palette.stakingEndTime === 'number' ? palette.stakingEndTime : palette.stakingEndTime.getTime();
    const remaining = Math.max(0, endTime - Date.now());
    
    if (remaining === 0) return 'Завершено!';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Получаем цвет редкости
  const getRarityColor = (rarity: ColorRarity): string => {
    const colors = {
      common: '#95A5A6',
      uncommon: '#27AE60', 
      rare: '#3498DB',
      mythical: '#9B59B6',
      legendary: '#F39C12',
      ascendant: '#E67E22',
      unique: '#E74C3C',
      ulterior: '#2C3E50',
      ultimate: '#8E44AD'
    };
    return colors[rarity] || '#95A5A6';
  };

  // Получаем количество слотов для редкости
  const getSlotsCount = (rarity: ColorRarity): number => {
    if (rarity === 'unique') return 3;
    if (rarity === 'ulterior') return 2;
    if (rarity === 'ultimate') return 1;
    return 6;
  };

  const availableRarities = getAvailableRarities();

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
    <div className="palette-container">
      <PageHeader
        title="Палитра"
        subtitle="Стейкинг и улучшение цветов"
        gradient="palette"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Вкладки редкостей */}
        <motion.div className="rarity-tabs" variants={itemVariants}>
          {availableRarities.map(rarity => (
            <button
              key={rarity}
              className={`rarity-tab ${activePaletteTab === rarity ? 'active' : ''}`}
              style={{ 
                borderColor: activePaletteTab === rarity ? getRarityColor(rarity) : 'transparent',
                color: activePaletteTab === rarity ? getRarityColor(rarity) : 'var(--text-secondary)'
              }}
              onClick={() => {
                hapticFeedback.light();
                setActivePaletteTab(rarity);
              }}
            >
              <Crown size={16} />
              {rarity}
            </button>
          ))}
        </motion.div>

        {/* Активная палитра */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePaletteTab}
            className="active-palette"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const palette = palettes[activePaletteTab];
              const slotsCount = getSlotsCount(activePaletteTab);
              const filledSlots = palette.colors.filter(c => c !== null).length;
              const availableColors = getColorsOfRarity(activePaletteTab);
              const canAddMore = filledSlots < slotsCount && availableColors.length > 0;
              const canStartStaking = filledSlots > 0 && !palette.isStaking;
              const canUpgrade = filledSlots === slotsCount && !palette.isStaking;
              const isAnyStaking = Object.values(palettes).some(p => p.isStaking);

              return (
                <>
                  {/* Информация о палитре */}
                  <div className="palette-info">
                    <div className="palette-title">
                      <Crown size={20} style={{ color: getRarityColor(activePaletteTab) }} />
                      Палитра {activePaletteTab}
                    </div>
                    <div className="palette-stats">
                      <span>Слотов: {filledSlots}/{slotsCount}</span>
                      <span>Стейкингов: {palette.stakingCount}</span>
                      <span>Доступно цветов: {availableColors.length}</span>
                    </div>
                  </div>

                  {/* Слоты палитры */}
                  <div className="palette-slots">
                    {Array.from({ length: slotsCount }, (_, index) => {
                      const color = palette.colors[index];
                      return (
                        <div
                          key={index}
                          className={`palette-slot ${color ? 'filled' : 'empty'} ${palette.isStaking ? 'staking' : ''}`}
                          style={{
                            borderColor: color ? getRarityColor(activePaletteTab) : 'var(--border-color)'
                          }}
                          onClick={() => color && !palette.isStaking && handleRemoveColor(activePaletteTab, index)}
                        >
                          {color ? (
                            <div
                              className="slot-color"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} - Нажмите для удаления`}
                            />
                          ) : (
                            <div className="slot-placeholder">
                              <Plus size={20} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Прогресс стейкинга */}
                  {palette.isStaking && (
                    <div className="staking-progress">
                      <div className="progress-header">
                        <Timer size={16} />
                        <span>Стейкинг в процессе</span>
                        <span className="time-remaining">
                          {formatTimeRemaining(activePaletteTab)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${stakingProgress[activePaletteTab] || 0}%`,
                            backgroundColor: getRarityColor(activePaletteTab)
                          }}
                        />
                      </div>
                      <div className="progress-percentage">
                        {Math.round(stakingProgress[activePaletteTab] || 0)}%
                      </div>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="palette-actions">
                    {!palette.isStaking ? (
                      <>
                        <button
                          className="palette-btn secondary"
                          onClick={() => handleAddColor(activePaletteTab)}
                          disabled={!canAddMore}
                          title={!canAddMore ? 'Нет доступных цветов или все слоты заняты' : 'Добавить цвет'}
                        >
                          <Plus size={18} />
                          Добавить цвет
                        </button>

                        <button
                          className="palette-btn primary"
                          onClick={() => handleStartStaking(activePaletteTab)}
                          disabled={!canStartStaking || isAnyStaking}
                          title={isAnyStaking ? 'Уже идет стейкинг в другой палитре' : 'Начать стейкинг'}
                        >
                          <Play size={18} />
                          Начать стейкинг
                        </button>

                        {canUpgrade && (
                          <button
                            className="palette-btn upgrade"
                            onClick={() => handleUpgrade(activePaletteTab)}
                            style={{ backgroundColor: getRarityColor(activePaletteTab) }}
                          >
                            <ArrowUp size={18} />
                            Улучшить
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="palette-btn danger"
                        onClick={() => handleCancelStaking(activePaletteTab)}
                      >
                        <RotateCcw size={18} />
                        Отменить стейкинг
                      </button>
                    )}
                  </div>

                  {/* Информация о стейкинге */}
                  <div className="staking-info">
                    <div className="info-item">
                      <span className="info-label">Время стейкинга:</span>
                      <span className="info-value">
                        {getStakingTime(activePaletteTab, palette.stakingCount, isDemoMode)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Награда:</span>
                      <span className="info-value">+1 цвет {activePaletteTab}</span>
                    </div>
                    {canUpgrade && (
                      <div className="info-item upgrade-info">
                        <span className="info-label">Улучшение:</span>
                        <span className="info-value">
                          {activePaletteTab} → {getNextRarity(activePaletteTab)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Пустое состояние */}
        {availableRarities.length === 0 && (
          <motion.div className="empty-palette" variants={itemVariants}>
            <div className="empty-palette-icon">
              <Palette size={64} />
            </div>
            <div className="empty-title">Палитры заблокированы</div>
            <div className="empty-subtitle">
              Получите первые цвета, чтобы разблокировать палитры
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Вспомогательные функции
function getStakingTime(rarity: ColorRarity, stakingCount: number, isDemoMode: boolean): string {
  if (isDemoMode) {
    // В демо-режиме показываем время в секундах
    const stakingTimes = {
      common: '0.04 сек', // 1 час = 0.04 сек в демо
      uncommon: '0.12 сек', // 3 часа = 0.12 сек
      rare: '0.24 сек', // 6 часов = 0.24 сек
      mythical: '0.72 сек', // 18 часов = 0.72 сек
      legendary: '1.68 сек', // 42 часа = 1.68 сек
      ascendant: '3.36 сек', // 84 часа = 3.36 сек
      unique: '7.2 сек', // 180 часов = 7.2 сек
      ulterior: '14.4 сек', // 360 часов = 14.4 сек
      ultimate: 'N/A'
    };
    return stakingTimes[rarity] || '0.04 сек';
  }
  
  // Обычный режим
  if (rarity === 'common') {
    const days = Math.min(stakingCount + 1, 6);
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
  }
  
  const stakingTimes = {
    uncommon: '7 дней',
    rare: '15 дней', 
    mythical: '30 дней',
    legendary: '60 дней',
    ascendant: '120 дней',
    unique: '365 дней',
    ulterior: '730 дней',
    ultimate: 'N/A'
  };
  
  return stakingTimes[rarity] || '1 день';
}

function getNextRarity(rarity: ColorRarity): string {
  const rarityIndex = GAME_CONFIG.RARITY_LEVELS.indexOf(rarity);
  if (rarityIndex >= GAME_CONFIG.RARITY_LEVELS.length - 1) {
    return 'Максимум';
  }
  return GAME_CONFIG.RARITY_LEVELS[rarityIndex + 1];
}
