import React, { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { GameAPI } from '@/lib/supabase';
import { useGameStore } from '@/store/gameStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { GameInterface } from '@/components/GameInterface';
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
    const initializeApp = async () => {
      try {
        if (!isReady) return;

        if (!user) {
          setError('Пользователь Telegram не найден');
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
        console.error('Ошибка инициализации:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        setIsLoading(false);
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

  return <GameInterface />;
}

export default App;