import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#4ade80',
  backgroundColor = '#e5e7eb',
  animated = true,
  showPercentage = false,
  label,
  className = ''
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      
      <div 
        className="relative overflow-hidden rounded-full"
        style={{ 
          height: `${height}px`,
          backgroundColor 
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={animated ? { 
            duration: 0.5,
            ease: 'easeOut'
          } : { duration: 0 }}
        />
        
        {animated && (
          <motion.div
            className="absolute top-0 left-0 h-full bg-white opacity-30 rounded-full"
            style={{ width: '20px' }}
            animate={{
              x: [`-20px`, `calc(${clampedProgress}% + 20px)`]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </div>
    </div>
  );
};