import React, { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { GameAPI } from '@/lib/supabase';
import { useGameStore } from '@/store/gameStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AppRouter } from '@/components/AppRouter';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import './App.css';

function App() {
  const { user, isReady, colorScheme, showAlert } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    initializeGame, 
    isInitialized, 
    receivedFreeColor,
    setUser 
  } = useGameStore();

  useEffect(() => {
    const initializeApp = async (retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
      
      try {
        if (!isReady) return;

        if (!user) {
          // В режиме разработки создаем демо-пользователя
          if (process.env.NODE_ENV === 'development') {
            const demoUser = {
              id: 123456789,
              first_name: 'Demo',
              last_name: 'User',
              username: 'demouser',
              language_code: 'ru'
            };
            setUser(demoUser);
            
            // Продолжаем инициализацию с демо-пользователем
            try {
              const dbUser = await GameAPI.getOrCreateUser(demoUser.id, {
                username: demoUser.username,
                firstName: demoUser.first_name,
                lastName: demoUser.last_name
              });

              console.log('Демо-пользователь в БД:', dbUser);
              await initializeGame(demoUser.id);
              setIsLoading(false);
            } catch (err) {
              console.error('Ошибка инициализации демо-пользователя:', err);
              setError('Ошибка инициализации демо-режима');
              setIsLoading(false);
            }
            return;
          }
          
          setError('Пользователь Telegram не найден. Убедитесь, что приложение запущено в Telegram.');
          return;
        }

        console.log('Инициализация пользователя:', user);

        // Устанавливаем пользователя в store
        setUser(user);

        // Получаем или создаем пользователя в базе данных
        const dbUser = await GameAPI.getOrCreateUser(user.id, {
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name
        });

        console.log('Пользователь в БД:', dbUser);

        // Инициализируем игру
        await initializeGame(user.id);

        setIsLoading(false);
      } catch (err) {
        console.error(`Ошибка инициализации (попытка ${retryCount + 1}):`, err);
        
        if (retryCount < maxRetries) {
          console.log(`Повторная попытка через ${retryDelay}мс...`);
          setTimeout(() => initializeApp(retryCount + 1), retryDelay);
        } else {
          const errorMessage = err instanceof Error 
            ? `Ошибка инициализации: ${err.message}` 
            : 'Неизвестная ошибка при загрузке игры';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    initializeApp();
  }, [isReady, user, initializeGame, setUser]);

  // Применяем тему Telegram
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  if (!receivedFreeColor) {
    return <WelcomeScreen />;
  }

  return <AppRouter />;
}

export default App;
