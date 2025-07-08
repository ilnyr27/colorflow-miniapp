import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Palette, 
  Star, 
  ShoppingBag, 
  Settings,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const { hapticFeedback } = useTelegram();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Главная',
      color: '#6c5ce7'
    },
    {
      path: '/colors',
      icon: Palette,
      label: 'Цвета',
      color: '#00b894'
    },
    {
      path: '/rarities',
      icon: Trophy,
      label: 'Редкости',
      color: '#fdcb6e'
    },
    {
      path: '/shop',
      icon: ShoppingBag,
      label: 'Магазин',
      color: '#e17055'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Настройки',
      color: '#a29bfe'
    }
  ];

  const handleNavClick = () => {
    hapticFeedback.light();
  };

  return (
    <nav className={`bottom-navigation ${className}`}>
      <div className="nav-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              {({ isActive }) => (
                <motion.div
                  className="nav-content"
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    color: isActive ? item.color : '#6c757d'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="nav-icon"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      color: isActive ? item.color : '#6c757d'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent size={20} />
                  </motion.div>
                  
                  <motion.span
                    className="nav-label"
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      fontWeight: isActive ? 600 : 400
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="nav-indicator"
                      style={{ backgroundColor: item.color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
