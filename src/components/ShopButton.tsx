import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { ShoppingCart } from 'lucide-react';
import { Shop } from './Shop';

export const ShopButton: React.FC = () => {
  const { getAvailableForPurchase } = useGameStore();
  const { hapticFeedback } = useTelegram();
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  const availableRarities = getAvailableForPurchase();

  const handleShopClick = () => {
    hapticFeedback.light();
    setIsShopOpen(true);
  };

  const handleCloseShop = () => {
    hapticFeedback.light();
    setIsShopOpen(false);
  };

  return (
    <>
      <motion.button
        className="shop-button"
        onClick={handleShopClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ShoppingCart size={20} />
        <span>Магазин</span>
        {availableRarities.length > 0 && (
          <span className="shop-badge">{availableRarities.length}</span>
        )}
      </motion.button>

      <Shop isOpen={isShopOpen} onClose={handleCloseShop} />
    </>
  );
};
