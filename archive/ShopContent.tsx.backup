import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { GAME_CONFIG, RARITY_COLORS } from '@/config/game';
import { ColorRarity } from '@/types/game';
import { Star, Sparkles } from 'lucide-react';

export const ShopContent: React.FC = () => {
  const { getAvailableForPurchase, purchaseColor } = useGameStore();
  const { hapticFeedback, showAlert } = useTelegram();
  const [purchasing, setPurchasing] = useState<ColorRarity | null>(null);

  const availableRarities = getAvailableForPurchase();

  const handlePurchase = async (rarity: ColorRarity) => {
    if (purchasing) return;
    
    setPurchasing(rarity);
    hapticFeedback.medium();
    
    try {
      const price = GAME_CONFIG.STAR_PRICES[rarity];
      
      // В реальном приложении здесь будет интеграция с Telegram Stars
      // Пока что симулируем покупку
      const success = await simulateTelegramStarsPurchase(rarity, price);
      
      if (success) {
        await purchaseColor(rarity, 'stars');
        showAlert(`Поздравляем! Вы получили новый ${rarity} цвет!`);
        hapticFeedback.success();
      } else {
        showAlert('Покупка отменена или произошла ошибка');
        hapticFeedback.error();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showAlert('Произошла ошибка при покупке');
      hapticFeedback.error();
    } finally {
      setPurchasing(null);
    }
  };

  const simulateTelegramStarsPurchase = async (rarity: ColorRarity, price: number): Promise<boolean> => {
    // Симуляция процесса покупки
    return new Promise((resolve) => {
      setTimeout(() => {
        // В 80% случаев покупка успешна (для демо)
        resolve(Math.random() > 0.2);
      }, 2000);
    });
  };

  const getRarityDisplayName = (rarity: ColorRarity): string => {
    const names = {
      common: 'Обычный',
      uncommon: 'Необычный', 
      rare: 'Редкий',
      mythical: 'Мифический',
      legendary: 'Легендарный',
      ascendant: 'Возвышенный',
      unique: 'Уникальный',
      ulterior: 'Скрытый',
      ultimate: 'Абсолютный'
    };
    return names[rarity] || rarity;
  };

  const getRarityDescription = (rarity: ColorRarity): string => {
    const descriptions = {
      common: 'Бледные, тусклые оттенки для начинающих коллекционеров',
      uncommon: 'Слегка более насыщенные цвета с приятными тонами',
      rare: 'Мягкие, заметные оттенки с глубиной и характером',
      mythical: 'Пастельные, но яркие цвета с магическим очарованием',
      legendary: 'Насыщенные и яркие цвета, достойные легенд',
      ascendant: '254 оттенка серого - путь к совершенству',
      unique: 'Чистые цвета: красный, зеленый, синий, желтый, голубой, фуксин',
      ulterior: 'Недоступно для покупки - только через комбинации',
      ultimate: 'Недоступно для покупки - финальная цель игры'
    };
    return descriptions[rarity] || '';
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
    <div className="shop-content-wrapper">
      {availableRarities.length === 0 ? (
        <motion.div 
          className="shop-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={48} className="empty-icon" />
          <h3>Магазин пока закрыт</h3>
          <p>Играйте больше, чтобы разблокировать новые редкости для покупки!</p>
          <div className="unlock-hint">
            <p>Первые покупки станут доступны через:</p>
            <ul>
              <li>22 дня - Необычные цвета</li>
              <li>50 дней - Редкие цвета</li>
              <li>105 дней - Мифические цвета</li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="shop-items-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {availableRarities.map((rarity) => {
            const price = GAME_CONFIG.STAR_PRICES[rarity];
            const isPurchasing = purchasing === rarity;
            
            return (
              <motion.div
                key={rarity}
                className="shop-item-card"
                style={{ borderColor: RARITY_COLORS[rarity] }}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="item-header">
                  <div 
                    className="rarity-badge"
                    style={{ backgroundColor: RARITY_COLORS[rarity] }}
                  >
                    {getRarityDisplayName(rarity)}
                  </div>
                  <div className="item-price">
                    <Star size={16} fill="currentColor" />
                    {price}
                  </div>
                </div>
                
                <div className="item-description">
                  <p>{getRarityDescription(rarity)}</p>
                </div>

                <div className="item-stats">
                  <div className="stat">
                    <span className="stat-label">Всего в игре:</span>
                    <span className="stat-value">
                      {GAME_CONFIG.TOTAL_COLOR_COUNTS[rarity].toLocaleString()}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Время стейкинга:</span>
                    <span className="stat-value">
                      {GAME_CONFIG.STAKING_TIMES[rarity]} мин
                    </span>
                  </div>
                </div>

                <motion.button
                  className="purchase-btn"
                  onClick={() => handlePurchase(rarity)}
                  disabled={isPurchasing}
                  style={{ 
                    backgroundColor: isPurchasing ? '#ccc' : RARITY_COLORS[rarity] 
                  }}
                  whileHover={!isPurchasing ? { scale: 1.05 } : {}}
                  whileTap={!isPurchasing ? { scale: 0.95 } : {}}
                >
                  {isPurchasing ? (
                    <div className="purchase-loading">
                      <div className="spinner" />
                      Покупка...
                    </div>
                  ) : (
                    <>
                      <Star size={16} fill="currentColor" />
                      Купить за {price} Stars
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div 
        className="payment-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="info-card">
          <p>💳 Оплата через Telegram Stars</p>
          <p>🔒 Безопасные платежи через Telegram</p>
          <p>⚡ Мгновенное получение цветов</p>
        </div>
      </motion.div>
    </div>
  );
};
