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
              background: 'rgba(13, 19, 15, 0.98)',
              color: '#e7ece8',
              border: '1px solid rgba(50, 209, 123, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontSize: '13px',
              borderRadius: '8px',
            },
            success: {
              className: 'cyber-toast cyber-toast-success',
              duration: 3000,
              iconTheme: { primary: '#32d17b', secondary: '#090d0a' },
            },
            error: {
              className: 'cyber-toast cyber-toast-error',
              duration: 4500,
              iconTheme: { primary: '#ff4d6d', secondary: '#090d0a' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
