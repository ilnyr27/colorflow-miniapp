import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { 
  ShoppingBag, 
  Store, 
  TrendingUp,
  Users,
  Coins,
  Crown,
  Tag,
  Clock,
  Eye,
  Plus,
  Zap,
  Star,
  Gift,
  Package
} from 'lucide-react';
import '@/styles/main.css';
import '@/styles/marketplace.css';

type TabType = 'shop' | 'marketplace';

interface ShopItem {
  id: string;
  type: 'color_pack' | 'tokens' | 'special';
  name: string;
  description: string;
  price: number;
  currency: 'flow' | 'stars';
  icon: string;
  quantity?: number;
  rarity?: string;
  discount?: number;
}

interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  rarity: string;
  price: number;
  listedAt: Date;
  status: 'active' | 'sold' | 'expired';
}

export const MarketplacePage: React.FC = () => {
  const { 
    gallery, 
    flowTokens, 
    user,
    buyShopItem,
    createMarketListing,
    buyFromMarket
  } = useGameStore();
  
  const { hapticFeedback } = useTelegram();
  
  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [selectedColorForSale, setSelectedColorForSale] = useState<string>('');
  const [salePrice, setSalePrice] = useState<number>(100);

  // Товары в магазине
  const shopItems: ShopItem[] = [
    {
      id: 'starter_pack',
      type: 'color_pack',
      name: 'Стартовый набор',
      description: '5 случайных цветов для начинающих',
      price: 100,
      currency: 'flow',
      icon: '🎨',
      quantity: 5,
      rarity: 'common'
    },
    {
      id: 'rare_pack',
      type: 'color_pack',
      name: 'Редкий набор',
      description: '3 цвета повышенной редкости',
      price: 250,
      currency: 'flow',
      icon: '💎',
      quantity: 3,
      rarity: 'rare'
    },
    {
      id: 'premium_pack',
      type: 'color_pack',
      name: 'Премиум набор',
      description: '1 гарантированный эпический цвет',
      price: 500,
      currency: 'flow',
      icon: '👑',
      quantity: 1,
      rarity: 'epic'
    },
    {
      id: 'flow_tokens_small',
      type: 'tokens',
      name: '500 Flow токенов',
      description: 'Пополнение баланса',
      price: 50,
      currency: 'stars',
      icon: '⚡',
      quantity: 500
    },
    {
      id: 'flow_tokens_medium',
      type: 'tokens',
      name: '1500 Flow токенов',
      description: 'Выгодное пополнение баланса',
      price: 120,
      currency: 'stars',
      icon: '🔥',
      quantity: 1500,
      discount: 20
    },
    {
      id: 'daily_bonus',
      type: 'special',
      name: 'Ежедневный бонус',
      description: 'Получайте бесплатные токены каждый день',
      price: 0,
      currency: 'flow',
      icon: '🎁'
    }
  ];

  // Примерные листинги на маркетплейсе
  const marketListings: MarketListing[] = [
    {
      id: '1',
      sellerId: 'user1',
      sellerName: 'ColorMaster',
      colorId: 'color1',
      colorName: 'Морской бриз',
      colorHex: '#20B2AA',
      rarity: 'rare',
      price: 150,
      listedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '2',
      sellerId: 'user2',
      sellerName: 'PaletteKing',
      colorId: 'color2',
      colorName: 'Золотой закат',
      colorHex: '#FFD700',
      rarity: 'epic',
      price: 300,
      listedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '3',
      sellerId: 'user3',
      sellerName: 'ArtCollector',
      colorId: 'color3',
      colorName: 'Лесная тень',
      colorHex: '#228B22',
      rarity: 'uncommon',
      price: 75,
      listedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'active'
    }
  ];

  const handleTabChange = (tab: TabType) => {
    hapticFeedback.light();
    setActiveTab(tab);
  };

  const handleBuyItem = async (item: ShopItem) => {
    try {
      hapticFeedback.medium();
      await buyShopItem(item.id);
      // Показать уведомление об успешной покупке
    } catch (error) {
      console.error('Ошибка при покупке:', error);
    }
  };

  const handleBuyFromMarket = async (listing: MarketListing) => {
    try {
      hapticFeedback.medium();
      await buyFromMarket(listing.id);
    } catch (error) {
      console.error('Ошибка при покупке с маркетплейса:', error);
    }
  };

  const handleCreateListing = async () => {
    if (!selectedColorForSale || salePrice < 10) return;
    
    try {
      hapticFeedback.success();
      await createMarketListing(selectedColorForSale, salePrice);
      setSelectedColorForSale('');
      setSalePrice(100);
    } catch (error) {
      console.error('Ошибка при создании лота:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}ч назад`;
    }
    return `${diffMins}м назад`;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#95A5A6',
      uncommon: '#27AE60',
      rare: '#3498DB',
      epic: '#9B59B6',
      legendary: '#F39C12',
      mythic: '#E74C3C'
    };
    return colors[rarity as keyof typeof colors] || '#95A5A6';
  };

  const canAfford = (price: number, currency: 'flow' | 'stars') => {
    if (currency === 'flow') {
      return flowTokens >= price;
    }
    // TODO: Добавить звезды в store
    return true;
  };

  const getSelectedColorData = () => {
    return gallery.find(color => color.id === selectedColorForSale);
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
    <div className="marketplace-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Заголовок */}
        <motion.div className="marketplace-header" variants={itemVariants}>
          <div className="marketplace-title">
            <ShoppingBag size={24} />
            Маркетплейс
          </div>
          <div className="marketplace-subtitle">
            Покупайте и продавайте цвета
          </div>
        </motion.div>

        {/* Баланс пользователя */}
        <motion.div className="user-balance" variants={itemVariants}>
          <div className="balance-info">
            <div className="balance-icon">
              <Zap size={16} />
            </div>
            <div className="balance-text">Flow токены</div>
          </div>
          <div className="balance-amount">{flowTokens.toLocaleString()}</div>
        </motion.div>

        {/* Вкладки */}
        <motion.div className="marketplace-tabs" variants={itemVariants}>
          <button
            onClick={() => handleTabChange('shop')}
            className={`marketplace-tab ${activeTab === 'shop' ? 'active' : ''}`}
          >
            <Store size={18} />
            Магазин
          </button>
          <button
            onClick={() => handleTabChange('marketplace')}
            className={`marketplace-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          >
            <Users size={18} />
            Маркетплейс
          </button>
        </motion.div>

        {/* Содержимое вкладок */}
        <div className="tab-content">
          {/* Магазин */}
          {activeTab === 'shop' && (
            <motion.div className="marketplace-items" variants={itemVariants}>
              {shopItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="marketplace-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="item-header">
                    <div className="item-title">
                      <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                      {item.name}
                    </div>
                    <div className="item-price">
                      {item.discount && (
                        <span className="original-price">
                          {Math.round(item.price / (1 - item.discount / 100))}
                        </span>
                      )}
                      {item.price > 0 ? (
                        <>
                          {item.currency === 'flow' ? <Zap size={16} /> : <Star size={16} />}
                          {item.price}
                        </>
                      ) : (
                        <Gift size={16} />
                      )}
                    </div>
                  </div>

                  <div className="item-description">{item.description}</div>

                  {item.quantity && (
                    <div className="item-details">
                      <div className="item-detail">
                        <div className="detail-value">{item.quantity}</div>
                        <div className="detail-label">
                          {item.type === 'tokens' ? 'Токенов' : 'Цветов'}
                        </div>
                      </div>
                      {item.rarity && (
                        <div className="item-detail">
                          <div className="detail-value" style={{ color: getRarityColor(item.rarity) }}>
                            {item.rarity}
                          </div>
                          <div className="detail-label">Редкость</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="item-actions">
                    <button
                      onClick={() => handleBuyItem(item)}
                      className="buy-btn"
                      disabled={item.price > 0 && !canAfford(item.price, item.currency)}
                    >
                      {item.price === 0 ? (
                        <>
                          <Gift size={16} />
                          Получить
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          Купить
                        </>
                      )}
                    </button>
                    <button className="preview-btn">
                      <Eye size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Маркетплейс */}
          {activeTab === 'marketplace' && (
            <motion.div variants={itemVariants}>
              {marketListings.length > 0 ? (
                marketListings.map((listing) => (
                  <div key={listing.id} className="user-listing">
                    <div className="listing-header">
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {listing.sellerName[0]}
                        </div>
                        <div>
                          <div className="seller-name">{listing.sellerName}</div>
                          <div className="listing-time">
                            <Clock size={12} />
                            {formatTimeAgo(listing.listedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="listing-price">
                        <Zap size={16} />
                        {listing.price}
                      </div>
                    </div>

                    <div className="listing-content">
                      <div
                        className="color-preview-small"
                        style={{ backgroundColor: listing.colorHex }}
                      />
                      <div className="color-info">
                        <div className="color-name">{listing.colorName}</div>
                        <div 
                          className={`color-rarity-small rarity-${listing.rarity}`}
                          style={{ backgroundColor: getRarityColor(listing.rarity) }}
                        >
                          {listing.rarity}
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => handleBuyFromMarket(listing)}
                        className="buy-btn"
                        disabled={!canAfford(listing.price, 'flow')}
                      >
                        <ShoppingBag size={16} />
                        Купить
                      </button>
                      <button className="preview-btn">
                        <Eye size={16} />
                      </button>
                    </div>

                    <div className={`listing-status status-${listing.status}`}>
                      {listing.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-marketplace">
                  <div className="empty-marketplace-icon">
                    <Package size={64} />
                  </div>
                  <div className="empty-title">Нет активных лотов</div>
                  <div className="empty-subtitle">
                    Пока никто не выставил цвета на продажу
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
