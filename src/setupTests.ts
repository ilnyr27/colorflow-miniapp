import '@testing-library/jest-dom';

// Типизация для глобального объекта
declare global {
  var Telegram: any;
}

// Мок для WebApp API Telegram
global.Telegram = {
  WebApp: {
    ready: jest.fn(),
    close: jest.fn(),
    expand: jest.fn(),
    MainButton: {
      show: jest.fn(),
      hide: jest.fn(),
      onClick: jest.fn()
    },
    BackButton: {
      show: jest.fn(),
      hide: jest.fn(),
      onClick: jest.fn()
    },
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff'
    },
    colorScheme: 'light',
    isExpanded: false,
    viewportHeight: 800,
    viewportStableHeight: 800,
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    HapticFeedback: {
      impactOccurred: jest.fn(),
      notificationOccurred: jest.fn(),
      selectionChanged: jest.fn()
    }
  }
};
