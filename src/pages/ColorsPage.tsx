import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ColorGallery } from '@/components/ColorGallery';
import { PaletteSection } from '@/components/PaletteSection';
import { StakingStatus } from '@/components/StakingStatus';
import { Palette, Image, Layers } from 'lucide-react';

type ColorsTab = 'gallery' | 'palette' | 'staking';

export const ColorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ColorsTab>('gallery');
  const { palettes } = useGameStore();
  const { colorScheme, hapticFeedback } = useTelegram();

  // Проверяем, есть ли активный стейкинг
  const activeStaking = Object.entries(palettes).find(([_, palette]) => palette.isStaking);

  const tabs = [
    {
      id: 'gallery' as ColorsTab,
      label: 'Галерея',
      icon: Image,
      color: '#00b894'
    },
    {
      id: 'palette' as ColorsTab,
      label: 'Палитра',
      icon: Palette,
      color: '#6c5ce7'
    },
    {
      id: 'staking' as ColorsTab,
      label: 'Стейкинг',
      icon: Layers,
      color: '#fdcb6e',
      disabled: !activeStaking
    }
  ];

  const handleTabChange = (tabId: ColorsTab) => {
    if (tabId === 'staking' && !activeStaking) return;
    setActiveTab(tabId);
    hapticFeedback.light();
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
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`colors-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1 className="page-title">
            <Palette size={24} />
            Цвета
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
            const isDisabled = tab.disabled;
            
            return (
              <motion.button
                key={tab.id}
                className={`tab-button ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                style={{
                  borderColor: isActive ? tab.color : 'transparent',
                  backgroundColor: isActive ? `${tab.color}20` : 'transparent'
                }}
              >
                <motion.div
                  className="tab-content"
                  animate={{
                    color: isActive ? tab.color : (isDisabled ? '#adb5bd' : '#6c757d')
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                  
                  {isActive && (
                    <motion.div
                      className="tab-indicator"
                      layoutId="colors-tab-indicator"
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
        className="colors-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Image size={20} />
                  Коллекция цветов
                </h3>
                <p className="section-description">
                  Все ваши собранные цвета. Нажмите на цвет, чтобы добавить его в палитру.
                </p>
                <ColorGallery />
              </div>
            </motion.div>
          )}

          {activeTab === 'palette' && (
            <motion.div
              key="palette"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Palette size={20} />
                  Управление палитрами
                </h3>
                <p className="section-description">
                  Создавайте палитры из цветов одной редкости для стейкинга и улучшения.
                </p>
                <PaletteSection />
              </div>
            </motion.div>
          )}

          {activeTab === 'staking' && activeStaking && (
            <motion.div
              key="staking"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Layers size={20} />
                  Активный стейкинг
                </h3>
                <p className="section-description">
                  Отслеживайте прогресс текущего стейкинга и получайте награды.
                </p>
                <StakingStatus 
                  rarity={activeStaking[0] as any}
                  palette={activeStaking[1]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
