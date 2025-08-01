import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  children,
  type = 'button'
}) => {
  const isDisabled = disabled || loading;

  const buttonContent = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} ${children ? 'mr-2' : ''}`} />
      )}
      
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
      
      {Icon && iconPosition === 'right' && (
        <Icon className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} ${children ? 'ml-2' : ''}`} />
      )}
    </>
  );

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}
        rounded-lg font-medium transition-all duration-200 
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {buttonContent}
    </motion.button>
  );
};