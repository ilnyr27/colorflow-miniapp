import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ShopContent } from '@/components/ShopContent';
import { GAME_CONFIG, RARITY_COLORS } from '@/config/game';
import { ShoppingBag, Star, Users, Gift } from 'lucide-react';
import { ColorRarity } from '@/types/game';

type ShopTab = 'buy' | 'marketplace' | 'offers';

export const ShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopTab>('buy');
  const { flowTokens, getAvailableForPurchase } = useGameStore();
  const { colorScheme, hapticFeedback } = useTelegram();

  const tabs = [
    {
      id: 'buy' as ShopTab,
      label: 'Покупка',
      icon: ShoppingBag,
      color: '#e17055'
    },
    {
      id: 'marketplace' as ShopTab,
      label: 'Маркетплейс',
      icon: Users,
      color: '#6c5ce7'
    },
    {
      id: 'offers' as ShopTab,
      label: 'Предложения',
      icon: Gift,
      color: '#00b894'
    }
  ];

  const handleTabChange = (tabId: ShopTab) => {
    setActiveTab(tabId);
    hapticFeedback.light();
  };

  const availableRarities = getAvailableForPurchase();

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

  const specialOffers = [
    {
      id: 'starter-pack',
      title: 'Стартовый набор',
      description: 'Получите 3 uncommon цвета + 50 FlowTokens',
      price: 25,
      originalPrice: 45,
      discount: 44,
      items: ['3x Uncommon цвета', '50 FlowTokens', 'Бонус: +1 слот палитры'],
      color: '#00b894'
    },
    {
      id: 'rare-bundle',
      title: 'Редкий набор',
      description: 'Коллекция из 2 rare цветов с гарантией',
      price: 60,
      originalPrice: 80,
      discount: 25,
      items: ['2x Rare цвета', 'Гарантированно разные оттенки', '100 FlowTokens'],
      color: '#2196f3'
    },
    {
      id: 'weekly-deal',
      title: 'Предложение недели',
      description: 'Случайный mythical цвет со скидкой',
      price: 75,
      originalPrice: 100,
      discount: 25,
      items: ['1x Mythical цвет', 'Случайный оттенок', '200 FlowTokens'],
      color: '#9c27b0',
      timeLeft: '3д 12ч'
    }
  ];

  const marketplaceItems = [
    {
      id: 'mp-1',
      seller: 'ColorMaster',
      rarity: 'rare' as ColorRarity,
      hex: '#FF6B6B',
      price: 35,
      originalPrice: 40,
      rating: 4.8
    },
    {
      id: 'mp-2',
      seller: 'PaletteKing',
      rarity: 'mythical' as ColorRarity,
      hex: '#4ECDC4',
      price: 85,
      originalPrice: 100,
      rating: 4.9
    },
    {
      id: 'mp-3',
      seller: 'ChromaCollector',
      rarity: 'uncommon' as ColorRarity,
      hex: '#45B7D1',
      price: 12,
      originalPrice: 15,
      rating: 4.7
    }
  ];

  return (
    <div className={`shop-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1 className="page-title">
            <ShoppingBag size={24} />
            Магазин
          </h1>
          <div className="currency-display">
            <div className="currency-item">
              <Star size={16} />
              <span>15</span>
            </div>
          </div>
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
                      layoutId="shop-tab-indicator"
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
        className="shop-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'buy' && (
            <motion.div
              key="buy"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <ShoppingBag size={20} />
                  Покупка цветов
                </h3>
                <p className="section-description">
                  Приобретайте новые цвета за Telegram Stars. Доступно {availableRarities.length} редкостей.
                </p>
                <ShopContent />
              </div>
            </motion.div>
          )}

          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Users size={20} />
                  Маркетплейс игроков
                </h3>
                <p className="section-description">
                  Покупайте уникальные цвета у других игроков по выгодным ценам.
                </p>
                
                <div className="marketplace-grid">
                  {marketplaceItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="marketplace-item"
                      variants={itemVariants}
                      style={{ borderColor: RARITY_COLORS[item.rarity] }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="item-preview">
                        <div 
                          className="color-preview"
                          style={{ backgroundColor: item.hex }}
                        />
                        <div className="rarity-badge" style={{ backgroundColor: RARITY_COLORS[item.rarity] }}>
                          {item.rarity}
                        </div>
                      </div>
                      
                      <div className="item-info">
                        <div className="seller-info">
                          <span className="seller-name">{item.seller}</span>
                          <div className="seller-rating">
                            <Star size={12} fill="currentColor" />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                        
                        <div className="color-details">
                          <span className="color-hex">{item.hex}</span>
                          <span className="color-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                          </span>
                        </div>
                        
                        <div className="price-section">
                          <div className="current-price">
                            <Star size={14} />
                            <span>{item.price}</span>
                          </div>
                          <div className="original-price">
                            <span>{item.originalPrice}</span>
                          </div>
                        </div>
                        
                        <motion.button
                          className="buy-button"
                          style={{ backgroundColor: RARITY_COLORS[item.rarity] }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Купить
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'offers' && (
            <motion.div
              key="offers"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Gift size={20} />
                  Специальные предложения
                </h3>
                <p className="section-description">
                  Ограниченные по времени наборы и скидки для экономии Stars.
                </p>
                
                <div className="offers-grid">
                  {specialOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      className="offer-card"
                      variants={itemVariants}
                      style={{ borderColor: offer.color }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="offer-header">
                        <div className="offer-badge" style={{ backgroundColor: offer.color }}>
                          -{offer.discount}%
                        </div>
                        {offer.timeLeft && (
                          <div className="time-left">
                            ⏰ {offer.timeLeft}
                          </div>
                        )}
                      </div>
                      
                      <div className="offer-content">
                        <h4 className="offer-title" style={{ color: offer.color }}>
                          {offer.title}
                        </h4>
                        <p className="offer-description">
                          {offer.description}
                        </p>
                        
                        <div className="offer-items">
                          {offer.items.map((item, index) => (
                            <div key={index} className="offer-item">
                              <span>✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="offer-pricing">
                          <div className="current-price">
                            <Star size={16} />
                            <span>{offer.price}</span>
                          </div>
                          <div className="original-price">
                            <span>{offer.originalPrice}</span>
                          </div>
                        </div>
                        
                        <motion.button
                          className="offer-button"
                          style={{ backgroundColor: offer.color }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Купить набор
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
