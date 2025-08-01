import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  HelpCircle, 
  Info, 
  LogOut,
  Shield,
  Globe,
  Moon,
  Sun,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTelegram } from '@/hooks/useTelegram';
import '@/styles/settings.css';

type SettingsTab = 'account' | 'interface' | 'notifications' | 'help';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const { 
    user, 
    gallery, 
    userProfile,
    isDemoMode,
    toggleDemoMode,
    deleteAccount,
    resetCollection,
    loadUserProfile,
    createTestColors,
    createQuickTestColor
  } = useGameStore();
  
  const { colorScheme, hapticFeedback, showAlert } = useTelegram();

  // Загружаем профиль при монтировании
  React.useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const tabs = [
    {
      id: 'account' as SettingsTab,
      label: 'Аккаунт',
      icon: User,
      color: '#6c5ce7'
    },
    {
      id: 'interface' as SettingsTab,
      label: 'Интерфейс',
      icon: Globe,
      color: '#00cec9'
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

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showAlert('Аккаунт успешно удален');
    } catch (error) {
      showAlert('Ошибка при удалении аккаунта');
    }
    setShowDeleteConfirm(false);
  };

  const handleDemoToggle = () => {
    if (window.location.hostname === 'localhost') {
      toggleDemoMode();
      hapticFeedback.medium();
    } else {
      showAlert('Демо-режим доступен только в режиме разработки');
    }
  };

  // Подсчитываем статистику
  const daysPlaying = userProfile?.start_date 
    ? Math.floor((Date.now() - new Date(userProfile.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalColors = gallery.length;
  const uniqueRarities = new Set(gallery.map(c => c.rarity)).size;

  const faqItems = [
    {
      question: 'Как получить новые цвета?',
      answer: 'Стейкинг в палитре - основной способ получения новых цветов. Также можно покупать в ColorExchange или торговать на ColorBazaar.'
    },
    {
      question: 'Что такое стейкинг?',
      answer: 'Стейкинг - это размещение цветов в палитре на определенное время. После завершения вы получаете новый цвет той же редкости.'
    },
    {
      question: 'Как улучшить цвета?',
      answer: 'Заполните палитру 6 цветами одной редкости, затем используйте функцию улучшения для получения цвета следующей редкости.'
    },
    {
      question: 'Что такое FlowTokens?',
      answer: 'FlowTokens - внутриигровая валюта для торговли между игроками. Можно получить за достижения или купить за Telegram Stars.'
    },
    {
      question: 'Как работает демо-режим?',
      answer: 'Демо-режим ускоряет время в 86,400 раз (1 день = 0.01 секунды). Доступен только на localhost для тестирования.'
    }
  ];

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Заголовок */}
      <div className="settings-header">
        <h1>
          <Settings size={24} />
          Настройки
        </h1>
      </div>

      {/* Навигация табов */}
      <div className="settings-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              className={`tab-button ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              style={{
                borderColor: isActive ? tab.color : 'transparent',
                backgroundColor: isActive ? `${tab.color}20` : 'transparent'
              }}
            >
              <IconComponent size={18} />
              <span>{tab.label}</span>
              
              {isActive && (
                <motion.div
                  className="tab-indicator"
                  layoutId="settings-tab-indicator"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Контент табов */}
      <div className="settings-content">
        <AnimatePresence mode="wait">
          {activeTab === 'account' && (
            <motion.div
              key="account"
              className="tab-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section className="settings-section">
                <h2>Информация об аккаунте</h2>
                
                <div className="user-card">
                  <div className="user-avatar">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="user-info">
                    <h3>{user?.first_name} {user?.last_name}</h3>
                    {user?.username && <p>@{user.username}</p>}
                    <span className="user-id">ID: {user?.id}</span>
                  </div>
                </div>
                
                <div className="account-stats">
                  <div className="stat-item">
                    <span className="stat-value">{daysPlaying}</span>
                    <span className="stat-label">Дней в игре</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{totalColors}</span>
                    <span className="stat-label">Всего цветов</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{uniqueRarities}</span>
                    <span className="stat-label">Редкостей</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{userProfile?.flow_tokens || 0}</span>
                    <span className="stat-label">FlowTokens</span>
                  </div>
                </div>

                <div className="account-details">
                  <div className="detail-row">
                    <span>Дата регистрации:</span>
                    <span>{userProfile?.start_date ? new Date(userProfile.start_date).toLocaleDateString('ru-RU') : 'Не указана'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Высшая редкость:</span>
                    <span>{userProfile?.highest_rarity || 'Common'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Статус:</span>
                    <span className="status-active">Активный игрок</span>
                  </div>
                </div>

                <div className="danger-zone">
                  <h3>Опасная зона</h3>
                  <button 
                    className="reset-button"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    <Trash2 size={16} />
                    Сбросить коллекцию
                  </button>
                  <p className="reset-warning">
                    Удалит все цвета из вашей коллекции. Вы сможете начать заново с бесплатного цвета.
                  </p>
                  
                  <button 
                    className="delete-button"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <LogOut size={16} />
                    Удалить аккаунт
                  </button>
                  <p className="delete-warning">
                    Полное удаление аккаунта и всех данных. Все цвета вернутся в общий пул.
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'interface' && (
            <motion.div
              key="interface"
              className="tab-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section className="settings-section">
                <h2>Настройки интерфейса</h2>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Язык</h3>
                    <p>Выберите язык интерфейса</p>
                  </div>
                  <select className="setting-select">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Тема</h3>
                    <p>Автоматически синхронизируется с Telegram</p>
                  </div>
                  <div className="theme-indicator">
                    {colorScheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{colorScheme === 'dark' ? 'Темная' : 'Светлая'}</span>
                  </div>
                </div>

                {window.location.hostname === 'localhost' && (
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Демо-режим</h3>
                      <p>Ускорение времени для тестирования (только localhost)</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isDemoMode}
                        onChange={handleDemoToggle}
                      />
                      <span className="toggle-slider">
                        <Shield size={12} />
                      </span>
                    </label>
                  </div>
                )}

                {window.location.hostname === 'localhost' && (
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Тестовые цвета</h3>
                      <p>Создать несколько цветов для тестирования</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <button 
                        className="test-colors-btn"
                        onClick={createQuickTestColor}
                      >
                        Быстрый тест
                      </button>
                      <button 
                        className="test-colors-btn secondary"
                        onClick={createTestColors}
                      >
                        Полный тест
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              className="tab-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section className="settings-section">
                <h2>Настройки уведомлений</h2>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Завершение стейкинга</h3>
                    <p>Уведомления о готовности новых цветов</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Новые предложения в магазине</h3>
                    <p>Специальные акции в ColorExchange</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Достижения</h3>
                    <p>Уведомления о новых достижениях</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Торговля на маркетплейсе</h3>
                    <p>Уведомления о продажах и покупках</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Новости игры</h3>
                    <p>Обновления и важные объявления</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div
              key="help"
              className="tab-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section className="settings-section">
                <h2>Помощь и поддержка</h2>
                
                <div className="faq-section">
                  <h3>Часто задаваемые вопросы</h3>
                  {faqItems.map((item, index) => (
                    <div key={index} className="faq-item">
                      <h4>{item.question}</h4>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="support-section">
                  <h3>Поддержка</h3>
                  <div className="support-buttons">
                    <button className="support-button">
                      <Info size={20} />
                      Связаться с поддержкой
                      <ExternalLink size={16} />
                    </button>
                    <button className="support-button">
                      <HelpCircle size={20} />
                      Руководство по игре
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                <div className="app-info">
                  <h3>О приложении</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span>Версия:</span>
                      <span>2.0.0</span>
                    </div>
                    <div className="info-item">
                      <span>Разработчик:</span>
                      <span>ColorFlow Team</span>
                    </div>
                    <div className="info-item">
                      <span>Платформа:</span>
                      <span>Telegram Mini App</span>
                    </div>
                    <div className="info-item">
                      <span>Лицензия:</span>
                      <span>MIT</span>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Модал подтверждения сброса коллекции */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="modal-content reset-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Сбросить коллекцию?</h3>
              <p>
                Все ваши {totalColors} цветов будут удалены. 
                Вы сможете начать игру заново с одного бесплатного цвета.
              </p>
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Отмена
                </button>
                <button 
                  className="confirm-reset-button"
                  onClick={async () => {
                    try {
                      await resetCollection();
                      showAlert('Коллекция успешно сброшена');
                      setShowResetConfirm(false);
                    } catch (error) {
                      showAlert('Ошибка при сбросе коллекции');
                    }
                  }}
                >
                  <Trash2 size={16} />
                  Сбросить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модал подтверждения удаления */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="modal-content delete-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Подтверждение удаления</h3>
              <p>
                Вы действительно хотите удалить аккаунт? 
                Все ваши цвета ({totalColors} шт.) вернутся в общий пул.
              </p>
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Отмена
                </button>
                <button 
                  className="confirm-delete-button"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
