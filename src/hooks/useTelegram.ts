import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types/telegram';

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: {
    light: () => void;
    medium: () => void;
    heavy: () => void;
    success: () => void;
    error: () => void;
    warning: () => void;
  };
  close: () => void;
}

export const useTelegram = (): UseTelegramReturn => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      
      // Инициализируем WebApp
      tg.ready();
      tg.expand();
      
      // Включаем подтверждение закрытия
      tg.isClosingConfirmationEnabled = true;
      
      setIsReady(true);

      console.log('Telegram WebApp initialized:', {
        version: tg.version,
        platform: tg.platform,
        user: tg.initDataUnsafe.user,
        colorScheme: tg.colorScheme
      });
    } else {
      console.warn('Telegram WebApp не найден. Возможно, приложение запущено вне Telegram.');
      
      // Для разработки создаем мок-пользователя
      if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_DEMO_MODE === 'true') {
        setUser({
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru'
        });
        setIsReady(true);
        
        // Создаем мок WebApp для демо-режима
        const mockWebApp = {
          colorScheme: 'light',
          ready: () => {},
          expand: () => {},
          showAlert: (message: string) => alert(message),
          showConfirm: (message: string, callback: (confirmed: boolean) => void) => callback(confirm(message)),
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {}
          },
          close: () => {}
        };
        setWebApp(mockWebApp as any);
      }
    }
  }, []);

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  };

  const hapticFeedback = {
    light: () => webApp?.HapticFeedback.impactOccurred('light'),
    medium: () => webApp?.HapticFeedback.impactOccurred('medium'),
    heavy: () => webApp?.HapticFeedback.impactOccurred('heavy'),
    success: () => webApp?.HapticFeedback.notificationOccurred('success'),
    error: () => webApp?.HapticFeedback.notificationOccurred('error'),
    warning: () => webApp?.HapticFeedback.notificationOccurred('warning'),
  };

  const close = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    webApp,
    user,
    isReady,
    colorScheme: webApp?.colorScheme || 'light',
    showAlert,
    showConfirm,
    hapticFeedback,
    close
  };
};