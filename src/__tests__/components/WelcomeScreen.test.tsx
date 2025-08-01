import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WelcomeScreen } from '@/components/WelcomeScreen';

// Мокаем хуки и функции
jest.mock('@/hooks/useTelegram', () => ({
  useTelegram: () => ({
    user: { id: 123, first_name: 'Test' },
    hapticFeedback: {
      light: jest.fn(),
      medium: jest.fn(),
      heavy: jest.fn(),
      success: jest.fn(),
      error: jest.fn()
    }
  })
}));

jest.mock('@/store/gameStore', () => ({
  useGameStore: () => ({
    createFreeStarterColor: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('WelcomeScreen', () => {
  it('отображает приветственное сообщение', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText(/добро пожаловать/i)).toBeInTheDocument();
  });

  it('кнопка получения цвета работает', async () => {
    render(<WelcomeScreen />);
    const button = screen.getByRole('button', { name: /получить/i });
    
    expect(button).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    // Проверяем, что кнопка снова становится активной после загрузки
    expect(button).toBeEnabled();
  });
});
