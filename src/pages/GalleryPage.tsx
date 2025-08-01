import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Star, 
  Plus, 
  Filter, 
  Search, 
  Grid,
  List,
  Clock,
  Palette as PaletteIcon,
  ShoppingCart,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { PageHeader } from '@/components/PageHeader';
import { ColorModal } from '@/components/ColorModal';
import { Color, ColorRarity } from '@/types/game';
import { GAME_CONFIG, RARITY_COLORS } from '@/config/game';
import '@/styles/color-modal.css';

export const GalleryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<ColorRarity | 'all'>('all');
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'name'>('date');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    gallery, 
    purchaseColor, 
    getAvailableForPurchase,
    createQuickTestColor,
    createFreeStarterColor,
    flowTokens,
    isDemoMode,
    receivedFreeColor,
    renameColor,
    addColorToPalette
  } = useGameStore();

  const { hapticFeedback, showAlert } = useTelegram();

  // Фильтрация и поиск цветов
  const filteredColors = useMemo(() => {
    let filtered = [...gallery];

    // Поиск по имени
    if (searchQuery) {
      filtered = filtered.filter(color => 
        color.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.hex.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по редкости
    if (filterRarity !== 'all') {
      filtered = filtered.filter(color => color.rarity === filterRarity);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateObtained || 0).getTime() - new Date(a.dateObtained || 0).getTime();
        case 'rarity':
          const rarityIndex = (color: Color) => GAME_CONFIG.RARITY_LEVELS.indexOf(color.rarity);
          return rarityIndex(b) - rarityIndex(a);
        case 'name':
          return (a.name || a.hex).localeCompare(b.name || b.hex);
        default:
          return 0;
      }
    });

    return filtered;
  }, [gallery, searchQuery, filterRarity, sortBy]);

  const availableForPurchase = getAvailableForPurchase();

  const handlePurchaseColor = async (rarity: ColorRarity) => {
    try {
      hapticFeedback.medium();
      await purchaseColor(rarity, 'tokens');
      hapticFeedback.success();
      showAlert(`Куплен цвет ${rarity}!`);
    } catch (error) {
      hapticFeedback.error();
      showAlert(error instanceof Error ? error.message : 'Ошибка покупки');
    }
  };

  const handleColorSelect = (colorId: string) => {
    const newSelected = new Set(selectedColors);
    if (newSelected.has(colorId)) {
      newSelected.delete(colorId);
    } else {
      newSelected.add(colorId);
    }
    setSelectedColors(newSelected);
    hapticFeedback.light();
  };

  const handleColorClick = (color: Color) => {
    setSelectedColor(color);
    setIsModalOpen(true);
    hapticFeedback.medium();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColor(null);
  };

  const handleRenameColor = async (colorId: string, newName: string) => {
    try {
      await renameColor(colorId, newName);
      hapticFeedback.success();
    } catch (error) {
      hapticFeedback.error();
      throw error;
    }
  };

  const handleAddToPalette = async (colorId: string) => {
    try {
      const color = gallery.find(c => c.id === colorId);
      if (color) {
        await addColorToPalette(colorId, color.rarity, 0); // Добавляем в первый доступный слот
        hapticFeedback.success();
      }
    } catch (error) {
      hapticFeedback.error();
      showAlert(error instanceof Error ? error.message : 'Ошибка добавления в палитру');
    }
  };

  const handleSellColor = async (colorId: string, price: number) => {
    // TODO: Реализовать продажу цвета
    console.log('Продажа цвета:', colorId, price);
    hapticFeedback.success();
    showAlert('Функция продажи будет добавлена позже');
  };

  const handleCreateTestColor = () => {
    if (isDemoMode) {
      createQuickTestColor();
      hapticFeedback.success();
      showAlert('Создан тестовый цвет!');
    }
  };

  // Статистика по коллекции
  const collectionStats = useMemo(() => {
    const stats: Record<ColorRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythical: 0,
      legendary: 0,
      ascendant: 0,
      unique: 0,
      ulterior: 0,
      ultimate: 0
    };

    gallery.forEach(color => {
      stats[color.rarity]++;
    });

    return stats;
  }, [gallery]);

  const ColorCard: React.FC<{ color: Color; index: number }> = ({ color, index }) => {
    const isSelected = selectedColors.has(color.id);
    const borderColor = RARITY_COLORS[color.rarity];

    return (
      <motion.div
        className={`color-card ${isSelected ? 'selected' : ''}`}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleColorClick(color)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          borderColor: isSelected ? borderColor : 'var(--border-color)',
          borderWidth: isSelected ? '3px' : '1px'
        }}
      >
        <div 
          className="color-preview"
          style={{ 
            background: color.hex,
            boxShadow: isSelected ? `0 0 20px ${borderColor}40` : 'none'
          }}
        >
          {isSelected && (
            <motion.div
              className="selection-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓
            </motion.div>
          )}
        </div>
        
        <div className="color-info">
          <h4 className="color-name">{color.name}</h4>
          <p className="color-hex">{color.hex}</p>
          <div className="color-meta">
            <span 
              className={`rarity-badge rarity-${color.rarity}`}
              style={{ borderColor: borderColor }}
            >
              {color.rarity}
            </span>
            {(color.stakingCount || 0) > 0 && (
              <span className="staking-count">
                <Clock size={12} />
                {color.stakingCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const PurchaseCard: React.FC<{ rarity: ColorRarity }> = ({ rarity }) => {
    const price = GAME_CONFIG.STAR_PRICES[rarity] * 10; // Цена в токенах
    const borderColor = RARITY_COLORS[rarity];
    const canAfford = flowTokens >= price;

    return (
      <motion.div
        className="purchase-card"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ borderColor }}
      >
        <div className="purchase-preview" style={{ background: borderColor }}>
          <Plus size={24} color="white" />
        </div>
        
        <div className="purchase-info">
          <h4>Купить {rarity}</h4>
          <p className="price">
            <Sparkles size={14} />
            {price} FlowTokens
          </p>
          <button
            className={`purchase-btn ${canAfford ? 'enabled' : 'disabled'}`}
            onClick={() => canAfford && handlePurchaseColor(rarity)}
            disabled={!canAfford}
          >
            {canAfford ? 'Купить' : 'Недостаточно токенов'}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="gallery-page">
      <PageHeader
        title="Галерея цветов"
        subtitle={`${gallery.length} цветов в коллекции`}
        gradient="gallery"
      />

      {/* Поиск и фильтры */}
      <div className="gallery-controls">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по имени или hex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
          </button>
          <button
            className="control-btn"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
        </div>
      </div>

      {/* Расширенные фильтры */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>Редкость:</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as ColorRarity | 'all')}
              >
                <option value="all">Все</option>
                {GAME_CONFIG.RARITY_LEVELS.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity} ({collectionStats[rarity]})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Сортировка:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'rarity' | 'name')}
              >
                <option value="date">По дате</option>
                <option value="rarity">По редкости</option>
                <option value="name">По имени</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Статистика коллекции */}
      <div className="collection-stats">
        <h3>Статистика коллекции</h3>
        <div className="stats-grid">
          {GAME_CONFIG.RARITY_LEVELS.map(rarity => (
            <div key={rarity} className="stat-item">
              <div 
                className="stat-color" 
                style={{ background: RARITY_COLORS[rarity] }}
              />
              <span className="stat-label">{rarity}</span>
              <span className="stat-count">{collectionStats[rarity]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Действия с выбранными цветами */}
      <AnimatePresence>
        {selectedColors.size > 0 && (
          <motion.div
            className="selection-actions"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <p>{selectedColors.size} цветов выбрано</p>
            <div className="action-buttons">
              <button className="action-btn palette-btn">
                <PaletteIcon size={16} />
                В палитру
              </button>
              <button 
                className="action-btn clear-btn"
                onClick={() => setSelectedColors(new Set())}
              >
                Отменить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сетка цветов */}
      <div className={`colors-grid ${viewMode}`}>
        <AnimatePresence mode="popLayout">
          {filteredColors.map((color, index) => (
            <ColorCard key={color.id} color={color} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Демо кнопки */}
      {isDemoMode && (
        <div className="demo-controls">
          <button className="demo-btn" onClick={handleCreateTestColor}>
            + Создать тестовый цвет
          </button>
        </div>
      )}

      {/* Пустое состояние */}
      {gallery.length === 0 && (
        <motion.div
          className="empty-gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PaletteIcon size={64} />
          <h3>Ваша галерея пуста</h3>
          <p>Начните собирать цвета, получив первый бесплатно!</p>
        </motion.div>
      )}

      {/* Информация о балансе */}
      <div className="balance-info">
        <Sparkles size={16} />
        <span>{flowTokens} FlowTokens</span>
      </div>

      {/* Модальное окно цвета */}
      {selectedColor && (
        <ColorModal
          color={selectedColor}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRename={handleRenameColor}
          onAddToPalette={handleAddToPalette}
          onSellColor={handleSellColor}
        />
      )}
    </div>
  );
};
