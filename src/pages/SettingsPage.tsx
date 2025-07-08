import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import { Settings, User, Bell, HelpCircle, Info, LogOut } from 'lucide-react';

type SettingsTab = 'account' | 'notifications' | 'help';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const { user, gallery, flowTokens, startDate, highestRarityAchieved } = useGameStore();
  const { colorScheme, hapticFeedback } = useTelegram();

  const tabs = [
    {
      id: 'account' as SettingsTab,
      label: 'Аккаунт',
      icon: User,
      color: '#6c5ce7'
    },
    {
      id: 'notifications' as SettingsTab,
      label: 'Уведомления',
      icon: Bell,
      color: '#00b894'
    },
    {
      id: 'help' as SettingsTab,
      label: 'Помощь',
      icon: HelpCircle,
      color: '#fdcb6e'
    }
  ];

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    hapticFeedback.light();
  };

  // Подсчитываем статистику
  const daysPlaying = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalColors = gallery.length;
  const uniqueRarities = new Set(gallery.map(c => c.rarity)).size;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const faqItems = [
    {
      question: 'Как получить новые цвета?',
      answer: 'Вы можете получить цвета тремя способами: бесплатный стартовый цвет, покупка за Telegram Stars, или стейкинг существующих цветов для получения новых.'
    },
    {
      question: 'Что такое стейкинг?',
      answer: 'Стейкинг - это процесс размещения цветов в палитре на определенное время. После завершения вы получаете новый цвет той же редкости.'
    },
    {
      question: 'Как улучшить цвета?',
      answer: 'Заполните палитру цветами одной редкости полностью, затем используйте функцию улучшения для получения цвета следующей редкости.'
    },
    {
      question: 'Что такое FlowTokens?',
      answer: 'FlowTokens - внутриигровая валюта, которую можно использовать для различных покупок и улучшений в игре.'
    },
    {
      question: 'Как работает маркетплейс?',
      answer: 'Маркетплейс позволяет покупать и продавать цвета с другими игроками за Telegram Stars.'
    }
  ];

  return (
    <div className={`settings-page theme-${colorScheme}`}>
      {/* Header */}
      <motion.header 
        className="page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1 className="page-title">
            <Settings size={24} />
            Настройки
          </h1>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <motion.div
        className="tab-navigation"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="tab-container">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                className={`tab-button ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  borderColor: isActive ? tab.color : 'transparent',
                  backgroundColor: isActive ? `${tab.color}20` : 'transparent'
                }}
              >
                <motion.div
                  className="tab-content"
                  animate={{
                    color: isActive ? tab.color : '#6c757d'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                  
                  {isActive && (
                    <motion.div
                      className="tab-indicator"
                      layoutId="settings-tab-indicator"
                      style={{ backgroundColor: tab.color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        className="settings-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'account' && (
            <motion.div
              key="account"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <User size={20} />
                  Информация об аккаунте
                </h3>
                
                <div className="account-info">
                  <div className="user-card">
                    <div className="user-avatar">
                      {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="user-details">
                      <h4 className="user-name">
                        {user?.first_name} {user?.last_name}
                      </h4>
                      {user?.username && (
                        <p className="user-username">@{user.username}</p>
                      )}
                      <p className="user-id">ID: {user?.id}</p>
                    </div>
                  </div>
                  
                  <div className="account-stats">
                    <div className="stat-grid">
                      <div className="stat-item">
                        <div className="stat-value">{daysPlaying}</div>
                        <div className="stat-label">Дней в игре</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{totalColors}</div>
                        <div className="stat-label">Всего цветов</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{uniqueRarities}</div>
                        <div className="stat-label">Редкостей</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{flowTokens}</div>
                        <div className="stat-label">FlowTokens</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="account-details">
                    <div className="detail-item">
                      <span className="detail-label">Дата регистрации:</span>
                      <span className="detail-value">
                        {startDate.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Высшая редкость:</span>
                      <span className="detail-value">{highestRarityAchieved}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Статус:</span>
                      <span className="detail-value status-active">Активный игрок</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <Bell size={20} />
                  Настройки уведомлений
                </h3>
                <p className="section-description">
                  Управляйте уведомлениями для получения важной информации об игре.
                </p>
                
                <div className="notification-settings">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Завершение стейкинга</h4>
                      <p>Уведомления о готовности новых цветов</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Новые предложения</h4>
                      <p>Специальные акции и скидки в магазине</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Достижения</h4>
                      <p>Уведомления о новых достижениях и наградах</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Маркетплейс</h4>
                      <p>Уведомления о продажах и новых предложениях</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div
              key="help"
              className="tab-content-panel"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="content-section">
                <h3 className="section-title">
                  <HelpCircle size={20} />
                  Помощь и поддержка
                </h3>
                <p className="section-description">
                  Часто задаваемые вопросы и полезная информация об игре.
                </p>
                
                <div className="help-content">
                  <div className="faq-section">
                    <h4>Часто задаваемые вопросы</h4>
                    <div className="faq-list">
                      {faqItems.map((item, index) => (
                        <motion.div
                          key={index}
                          className="faq-item"
                          variants={itemVariants}
                        >
                          <h5 className="faq-question">{item.question}</h5>
                          <p className="faq-answer">{item.answer}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="support-section">
                    <h4>Поддержка</h4>
                    <div className="support-options">
                      <motion.button
                        className="support-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Info size={20} />
                        <span>Связаться с поддержкой</span>
                      </motion.button>
                      
                      <motion.button
                        className="support-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <HelpCircle size={20} />
                        <span>Руководство по игре</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="app-info">
                    <h4>О приложении</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Версия:</span>
                        <span className="info-value">1.0.0</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Разработчик:</span>
                        <span className="info-value">ColorFlow Team</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Платформа:</span>
                        <span className="info-value">Telegram Mini App</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
