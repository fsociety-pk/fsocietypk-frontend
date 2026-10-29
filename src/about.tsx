import React from 'react';
import ReactDOM from 'react-dom/client';
import AboutTeam from './pages/AboutTeam';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { applyTheme } from './hooks/useTheme';
import './index.css';
import './styles/design-refresh.css';
import './styles/visual-system.css';
import './styles/scroll-text-reveal.css';

applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const client = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60000 } } });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}><AboutTeam /></QueryClientProvider></React.StrictMode>);
