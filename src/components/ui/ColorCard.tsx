import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Palette as PaletteIcon, ShoppingBag, MoreVertical } from 'lucide-react';
import { Color } from '@/types/game';

interface ColorCardProps {
  color: Color;
  size?: 'small' | 'medium' | 'large';
  status?: 'normal' | 'in-palette' | 'on-sale' | 'staking';
  showDetails?: boolean;
  onClick?: () => void;
  onActionClick?: () => void;
  className?: string;
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24', 
  large: 'w-32 h-32'
};

const statusIcons = {
  'in-palette': PaletteIcon,
  'on-sale': ShoppingBag,
  'staking': Clock
};

const statusLabels = {
  'in-palette': 'In Palette',
  'on-sale': 'For Sale',
  'staking': 'Staking'
};

export const ColorCard: React.FC<ColorCardProps> = ({
  color,
  size = 'medium',
  status = 'normal',
  showDetails = true,
  onClick,
  onActionClick,
  className = ''
}) => {
  const StatusIcon = status !== 'normal' ? statusIcons[status] : null;
  const isDisabled = status !== 'normal';

  return (
    <motion.div
      className={`color-card ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: color.hex,
        opacity: isDisabled ? 0.5 : 1
      }}
      onClick={onClick}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDisabled ? 0.5 : 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Status overlay */}
      {status !== 'normal' && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          {StatusIcon && (
            <div className="text-white flex flex-col items-center">
              <StatusIcon size={size === 'small' ? 12 : size === 'medium' ? 16 : 20} />
              {size !== 'small' && (
                <span className="text-xs mt-1">{statusLabels[status]}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {onActionClick && (
        <button
          className="absolute top-1 right-1 bg-black bg-opacity-20 rounded-full p-1 text-white hover:bg-opacity-40 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
        >
          <MoreVertical size={12} />
        </button>
      )}

      {/* Color details */}
      {showDetails && size !== 'small' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
          <div className="text-xs font-medium truncate">{color.name}</div>
          <div className="text-xs opacity-75">{color.hex}</div>
          {size === 'large' && (
            <div className="text-xs opacity-75 capitalize">{color.rarity}</div>
          )}
        </div>
      )}
    </motion.div>
  );
};