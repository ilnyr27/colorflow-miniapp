import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Square, ArrowUp } from 'lucide-react';
import { ColorRarity } from '@/types/game';
import { useStaking } from '@/hooks/useStaking';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ColorCard } from '@/components/ui/ColorCard';

interface StakingCardProps {
  rarity: ColorRarity;
  isActive?: boolean;
  className?: string;
}

const rarityColors = {
  common: '#9ca3af',
  uncommon: '#10b981', 
  rare: '#3b82f6',
  mythical: '#8b5cf6',
  legendary: '#f59e0b',
  ascendant: '#ef4444',
  unique: '#ec4899',
  ulterior: '#06b6d4',
  ultimate: '#6366f1'
};

export const StakingCard: React.FC<StakingCardProps> = ({
  rarity,
  isActive = false,
  className = ''
}) => {
  const {
    palettes,
    activeStakingRarity,
    startStaking,
    cancelStaking,
    upgradeColors,
    autoAddColorToPalette,
    removeColorFromPalette,
    getAvailableColorsForRarity,
    getPaletteProgress,
    getStakingProgress,
    formatTimeRemaining
  } = useStaking();

  const palette = palettes[rarity];
  const progress = getPaletteProgress(rarity);
  const stakingProgress = getStakingProgress(rarity);
  const timeRemaining = formatTimeRemaining(rarity);
  const isStaking = activeStakingRarity === rarity;
  const availableColors = getAvailableColorsForRarity(rarity);

  const handleAddColor = async () => {
    try {
      await autoAddColorToPalette(rarity);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  };

  const handleRemoveColor = (slotIndex: number) => {
    try {
      removeColorFromPalette(rarity, slotIndex);
    } catch (error) {
      console.error('Error removing color:', error);
    }
  };

  const handleStartStaking = async () => {
    try {
      await startStaking(rarity);
    } catch (error) {
      console.error('Error starting staking:', error);
    }
  };

  const handleCancelStaking = () => {
    try {
      cancelStaking(rarity);
    } catch (error) {
      console.error('Error canceling staking:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeColors(rarity);
    } catch (error) {
      console.error('Error upgrading colors:', error);
    }
  };

  return (
    <motion.div
      className={`staking-card bg-white rounded-xl shadow-lg border-2 ${
        isActive ? 'border-blue-500' : 'border-gray-200'
      } p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: rarityColors[rarity] }}
          />
          <h3 className="text-lg font-semibold capitalize">{rarity}</h3>
        </div>
        
        <div className="text-sm text-gray-500">
          {progress.filledSlots}/{progress.maxSlots} slots
        </div>
      </div>

      {/* Color slots */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {palette.colors.map((color, index) => (
          <div key={index} className="relative">
            {color ? (
              <ColorCard
                color={color}
                size="small"
                onClick={() => !palette.isStaking && handleRemoveColor(index)}
                className="cursor-pointer"
              />
            ) : (
              <div 
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={handleAddColor}
              >
                <span className="text-gray-400 text-2xl">+</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Staking status */}
      {isStaking && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Staking Progress</span>
            <span className="text-sm text-gray-500">{timeRemaining}</span>
          </div>
          
          <ProgressBar
            progress={stakingProgress}
            color={rarityColors[rarity]}
            animated={true}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!palette.isStaking && progress.canStartStaking && (
          <Button
            variant="primary"
            size="small"
            icon={Play}
            onClick={handleStartStaking}
            fullWidth
          >
            Start Staking
          </Button>
        )}

        {palette.isStaking && (
          <Button
            variant="danger"
            size="small"
            icon={Square}
            onClick={handleCancelStaking}
            fullWidth
          >
            Cancel
          </Button>
        )}

        {!palette.isStaking && progress.canUpgrade && (
          <Button
            variant="success"
            size="small"
            icon={ArrowUp}
            onClick={handleUpgrade}
            fullWidth
          >
            Upgrade
          </Button>
        )}

        {!palette.isStaking && !progress.canStartStaking && !progress.canUpgrade && availableColors.length > 0 && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleAddColor}
            fullWidth
          >
            Add Color
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500">
        <div>Stakings completed: {progress.stakingCount}</div>
        {availableColors.length === 0 && progress.filledSlots < progress.maxSlots && (
          <div className="text-orange-500 mt-1">
            No available {rarity} colors in gallery
          </div>
        )}
      </div>
    </motion.div>
  );
};