import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, ShoppingCart, Palette, Copy, Check } from 'lucide-react';
import { Color } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { RARITY_COLORS } from '@/config/game';

interface ColorModalProps {
  color: Color;
  isOpen: boolean;
  onClose: () => void;
  onRename?: (colorId: string, newName: string) => void;
  onAddToPalette?: (colorId: string) => void;
  onSellColor?: (colorId: string, price: number) => void;
}

export const ColorModal: React.FC<ColorModalProps> = ({
  color,
  isOpen,
  onClose,
  onRename,
  onAddToPalette,
  onSellColor
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(color.name);
  const [sellPrice, setSellPrice] = useState(100);
  const [showSellForm, setShowSellForm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { hapticFeedback, showAlert } = useTelegram();
  const { renameColor } = useGameStore();

  const handleRename = async () => {
    if (!newName.trim() || newName === color.name) {
      setIsEditing(false);
      setNewName(color.name);
      return;
    }

    try {
      await renameColor(color.id, newName.trim());
      setIsEditing(false);
      hapticFeedback.success();
      showAlert('Цвет переименован!');
    } catch (error) {
      console.error('Ошибка переименования:', error);
      hapticFeedback.error();
      showAlert(error instanceof Error ? error.message : 'Ошибка переименования');
      setNewName(color.name);
      setIsEditing(false);
    }
  };

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      hapticFeedback.light();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleAddToPalette = () => {
    if (onAddToPalette) {
      onAddToPalette(color.id);
      hapticFeedback.light();
      onClose();
    }
  };

  const handleSell = () => {
    if (onSellColor && sellPrice > 0) {
      onSellColor(color.id, sellPrice);
      hapticFeedback.light();
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRarityDisplayName = (rarity: string) => {
    const names: Record<string, string> = {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="color-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="color-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="color-modal-header">
              <button className="close-button" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Color Preview */}
            <div className="color-preview-section">
              <div 
                className="color-preview-large"
                style={{ 
                  backgroundColor: color.hex,
                  border: `3px solid ${RARITY_COLORS[color.rarity]}`
                }}
              />
              
              <div className="color-info">
                {/* Name */}
                <div className="color-name-section">
                  {isEditing ? (
                    <div className="name-edit-form">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        maxLength={25}
                        className="name-input"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename();
                          if (e.key === 'Escape') {
                            setIsEditing(false);
                            setNewName(color.name);
                          }
                        }}
                      />
                      <div className="name-edit-buttons">
                        <button onClick={handleRename} className="save-button">
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setNewName(color.name);
                          }}
                          className="cancel-button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="name-display">
                      <h2 className="color-name">{color.name}</h2>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="edit-name-button"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hex Code */}
                <div className="hex-section">
                  <span className="hex-code">{color.hex}</span>
                  <button 
                    onClick={handleCopyHex}
                    className={`copy-button ${copied ? 'copied' : ''}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Rarity */}
                <div className="rarity-section">
                  <span 
                    className="rarity-badge"
                    style={{ backgroundColor: RARITY_COLORS[color.rarity] }}
                  >
                    {getRarityDisplayName(color.rarity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="color-details">
              <div className="detail-row">
                <span className="detail-label">Получен:</span>
                <span className="detail-value">{formatDate(color.dateObtained)}</span>
              </div>
              
              {color.stakingCount && color.stakingCount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Стейкингов:</span>
                  <span className="detail-value">{color.stakingCount}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="color-actions">
              <button 
                onClick={handleAddToPalette}
                className="action-button palette-button"
              >
                <Palette size={20} />
                <span>В палитру</span>
              </button>

              <button 
                onClick={() => setShowSellForm(!showSellForm)}
                className="action-button sell-button"
              >
                <ShoppingCart size={20} />
                <span>Продать</span>
              </button>
            </div>

            {/* Sell Form */}
            {showSellForm && (
              <motion.div
                className="sell-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="sell-form-content">
                  <label className="sell-label">Цена в FlowTokens:</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    min="10"
                    max="10000"
                    className="sell-input"
                  />
                  <button 
                    onClick={handleSell}
                    className="confirm-sell-button"
                    disabled={sellPrice < 10}
                  >
                    Выставить на продажу
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
