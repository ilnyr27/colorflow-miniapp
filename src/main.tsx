import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Send error to analytics/monitoring service
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(
        'Произошла ошибка в приложении. Мы уже работаем над её исправлением.'
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #000000)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#e17055' }}>
            Упс! Что-то пошло не так 😔
          </h2>
          
          <p style={{ 
            marginBottom: '2rem', 
            color: 'var(--text-secondary, #666)',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            Произошла неожиданная ошибка. Пожалуйста, попробуйте перезагрузить приложение.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            🔄 Перезагрузить
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              color: '#e17055',
              maxWidth: '100%',
              overflow: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Детали ошибки (только для разработки)
              </summary>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React App
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Development vs Production rendering
if (process.env.NODE_ENV === 'development') {
  // In development, show more detailed errors
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  // In production, just wrap with error boundary
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// Hide loading screen once React is mounted
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}, 100);

// Register service worker for PWA functionality (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Log performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('App load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }, 0);
  });
}

// Telegram WebApp specific optimizations
if (window.Telegram?.WebApp) {
  // Prevent context menu on long press
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // Prevent text selection
  document.addEventListener('selectstart', (e) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT' && 
        (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
  
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}