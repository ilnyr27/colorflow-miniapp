import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ImageIcon, 
  Palette, 
  ShoppingBag,
  BarChart3,
  Settings
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
      path: '/gallery',
      icon: ImageIcon,
      label: 'Галерея',
      color: '#6C5B7B'
    },
    {
      path: '/palette',
      icon: Palette,
      label: 'Палитра',
      color: '#88B04B'
    },
    {
      path: '/marketplace',
      icon: ShoppingBag,
      label: 'Магазин',
      color: '#F67280'
    },
    {
      path: '/statistics',
      icon: BarChart3,
      label: 'Статистика',
      color: '#3498DB'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Настройки',
      color: '#95A5A6'
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
                    }}                  transition={{ 
                    duration: 0.2,
                    scale: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                >
                  <IconComponent size={24} strokeWidth={2} />
                </motion.div>
                
                <motion.span
                  className="nav-label"
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 400,
                    scale: isActive ? 1.05 : 1
                  }}
                  transition={{ 
                    duration: 0.2,
                    scale: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
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
