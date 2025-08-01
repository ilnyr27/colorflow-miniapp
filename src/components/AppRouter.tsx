import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { GalleryPage } from '@/pages/GalleryPage';
import { PalettePage } from '@/pages/PalettePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { StatisticsPage } from '@/pages/StatisticsPage';
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
            <Route path="/" element={<Navigate to="/gallery" replace />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/palette" element={<PalettePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </motion.main>
        
        <Navigation />
      </div>
    </Router>
  );
};
