import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Clock, Target } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';

export const WelcomeScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createFreeStarterColor } = useGameStore();
  const { user, hapticFeedback } = useTelegram();

  const handleGetStarterColor = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    hapticFeedback.medium();
    
    try {
      await createFreeStarterColor();
      hapticFeedback.success();
    } catch (error) {
      console.error('Ошибка получения стартового цвета:', error);
      hapticFeedback.error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <motion.div
          className="welcome-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="welcome-logo">
            <motion.div
              className="logo-circle"
              animate={{ 
                background: [
                  'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  'linear-gradient(45deg, #4ecdc4, #45b7d1)',
                  'linear-gradient(45deg, #45b7d1, #f9ca24)',
                  'linear-gradient(45deg, #f9ca24, #f0932b)',
                  'linear-gradient(45deg, #f0932b, #eb4d4b)',
                  'linear-gradient(45deg, #eb4d4b, #6c5ce7)',
                  'linear-gradient(45deg, #6c5ce7, #a29bfe)',
                  'linear-gradient(45deg, #a29bfe, #ff6b6b)'
                ]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Palette size={48} color="white" />
            </motion.div>
          </div>
          
          <h1 className="welcome-title">
            Добро пожаловать в <span className="gradient-text">ColorFlow</span>
          </h1>
          
          <p className="welcome-subtitle">
            Привет, {user?.first_name}! Готов начать своё путешествие в мир цветов?
          </p>
        </motion.div>

        <motion.div
          className="welcome-features"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="feature-grid">
            <motion.div
              className="feature-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="feature-icon" />
              <h3>Коллекционирование</h3>
              <p>Собирайте уникальные RGB-цвета от Common до Ultimate</p>
            </motion.div>

            <motion.div
              className="feature-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Clock className="feature-icon" />
              <h3>Медитативный стейкинг</h3>
              <p>Размещайте цвета в палитрах и ждите новые в реальном времени</p>
            </motion.div>

            <motion.div
              className="feature-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Target className="feature-icon" />
              <h3>Система улучшений</h3>
              <p>Комбинируйте 6 цветов для создания более редких</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="welcome-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="info-box">
            <h4>Философия игры</h4>
            <p>
              ColorFlow — это не гонка за достижениями. Это созерцательный опыт, 
              где каждый новый цвет — маленькое чудо. Прогресс измеряется днями 
              и неделями, а не минутами.
            </p>
          </div>

          <div className="progression-hint">
            <p className="hint-text">
              <strong>Первый цвет бесплатно!</strong> Дальнейшие цвета получайте через стейкинг 
              или покупайте за Telegram Stars по мере открытия новых редкостей.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="welcome-action"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <motion.button
            className="starter-button"
            onClick={handleGetStarterColor}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isLoading ? { opacity: 0.7 } : { opacity: 1 }}
          >
            {isLoading ? (
              <div className="button-loading">
                <div className="spinner" />
                Создаём ваш первый цвет...
              </div>
            ) : (
              <>
                <Sparkles size={20} />
                Получить первый цвет
              </>
            )}
          </motion.button>
          
          <p className="starter-note">
            Вы получите случайный цвет Common редкости для начала своей коллекции
          </p>
        </motion.div>
      </div>
    </div>
  );
};