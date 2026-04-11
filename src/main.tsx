import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          containerClassName="cyber-toaster"
          gutter={12}
          toastOptions={{
            className: 'cyber-toast',
            duration: 3500,
            style: {
              background: 'rgba(7, 12, 10, 0.95)',
              color: '#d9ffe5',
              border: '1px solid rgba(0, 255, 127, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 18px rgba(0, 255, 127, 0.15)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '13px',
              borderRadius: '12px',
            },
            success: {
              className: 'cyber-toast cyber-toast-success',
              duration: 3000,
              iconTheme: { primary: '#00ff41', secondary: '#0a0a0a' },
            },
            error: {
              className: 'cyber-toast cyber-toast-error',
              duration: 4500,
              iconTheme: { primary: '#ff4d6d', secondary: '#0a0a0a' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
