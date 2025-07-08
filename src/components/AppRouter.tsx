import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { HomePage } from '@/pages/HomePage';
import { ColorsPage } from '@/pages/ColorsPage';
import { RaritiesPage } from '@/pages/RaritiesPage';
import { ShopPage } from '@/pages/ShopPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const AppRouter: React.FC = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <Router>
      <div className="app-router">
        <motion.main 
          className="main-content"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/rarities" element={<RaritiesPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </motion.main>
        
        <Navigation />
      </div>
    </Router>
  );
};
