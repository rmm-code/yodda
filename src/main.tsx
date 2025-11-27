import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Initialize Telegram Web App if available (non-blocking)
if (typeof window !== 'undefined') {
  import('@twa-dev/sdk')
    .then((module) => {
      const WebApp = module.default;
      try {
        if ((window as any).Telegram?.WebApp) {
          WebApp.ready();
          WebApp.expand();
        }
      } catch (e) {
        // Ignore - not in Telegram
      }
    })
    .catch(() => {
      // SDK not available - running in browser mode
    });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
