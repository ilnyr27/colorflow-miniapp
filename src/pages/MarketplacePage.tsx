import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { Star, ShoppingCart, Clock, AlertCircle } from 'lucide-react';

interface CreatorColor {
  id: string;
  color_hex: string;
  rarity: string;
  price: number;
  created_at: string;
}

export const MarketplacePage: React.FC = () => {
  const { user, flowTokens } = useGameStore();
  const { colorScheme } = useTelegram();
  const [creatorColors, setCreatorColors] = useState<CreatorColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const rarities = ['all', 'common', 'uncommon', 'rare', 'mythical', 'legendary', 'ascendant', 'unique'];

  useEffect(() => {
    loadCreatorColors();
  }, [selectedRarity]);

  const loadCreatorColors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_available_creator_colors', {
        p_rarity: selectedRarity === 'all' ? null : selectedRarity
      });

      if (error) throw error;
      setCreatorColors(data || []);
    } catch (error) {
      console.error('Error loading creator colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseColor = async (colorId: string, price: number) => {
    if (!user) return;
    
    try {
      setPurchasing(colorId);
      
      // В реальном приложении здесь будет интеграция с Telegram Stars
      // Пока что симулируем покупку
      const { data, error } = await supabase.rpc('purchase_creator_color', {
        p_color_id: colorId,
        p_buyer_id: user.id,
        p_stars_paid: price
      });

      if (error) throw error;
      
      // Обновляем список после покупки
      await loadCreatorColors();
      
      // Показываем уведомление об успешной покупке
      alert('Цвет успешно приобретен!');
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(`Ошибка покупки: ${error.message}`);
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      mythical: '#8B5CF6',
      legendary: '#F59E0B',
      ascendant: '#EF4444',
      unique: '#EC4899'
    };
    return colors[rarity as keyof typeof colors] || '#9CA3AF';
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
    <div className={`marketplace-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="page-info">
            <h1 className="page-title">Маркетплейс</h1>
            <p className="page-subtitle">Цвета от создателя</p>
          </div>
          
          <div className="currency-display">
            <div className="currency-item">
              <Star size={16} />
              <span>Stars</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filters */}
      <motion.div 
        className="filters-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="filter-tabs">
          {rarities.map((rarity) => (
            <button
              key={rarity}
              className={`filter-tab ${selectedRarity === rarity ? 'active' : ''}`}
              onClick={() => setSelectedRarity(rarity)}
            >
              {rarity === 'all' ? 'Все' : rarity}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="marketplace-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="loading-state">
            <Clock className="animate-spin" size={24} />
            <p>Загрузка цветов...</p>
          </div>
        ) : creatorColors.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>Нет доступных цветов</h3>
            <p>В данный момент нет цветов этой редкости для покупки</p>
          </div>
        ) : (
          <div className="colors-grid">
            {creatorColors.map((color) => (
              <motion.div
                key={color.id}
                className="color-card"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="color-preview"
                  style={{ backgroundColor: color.color_hex }}
                />
                
                <div className="color-info">
                  <div className="color-details">
                    <span className="color-hex">{color.color_hex}</span>
                    <span 
                      className="color-rarity"
                      style={{ color: getRarityColor(color.rarity) }}
                    >
                      {color.rarity}
                    </span>
                  </div>
                  
                  <div className="color-price">
                    <Star size={16} />
                    <span>{color.price}</span>
                  </div>
                </div>
                
                <button
                  className="purchase-button"
                  onClick={() => purchaseColor(color.id, color.price)}
                  disabled={purchasing === color.id}
                >
                  {purchasing === color.id ? (
                    <>
                      <Clock className="animate-spin" size={16} />
                      Покупка...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Купить
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
