import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import "./styles/design-refresh.css";
import './styles/product-polish.css';
import './styles/community.css';
import './styles/visual-system.css';
import './styles/scroll-text-reveal.css';
import './styles/team-link.css';
import './styles/landing-refresh.css';
import './styles/public-navigation.css';
import { applyTheme } from './hooks/useTheme';

applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          containerClassName="cyber-toaster"
          gutter={12}
          toastOptions={{
            className: "cyber-toast",
            duration: 3500,
            success: {
              className: "cyber-toast cyber-toast-success",
              duration: 3000,
              iconTheme: { primary: "rgb(var(--success))", secondary: "rgb(var(--on-brand))" },
            },
            error: {
              className: "cyber-toast cyber-toast-error",
              duration: 4500,
              iconTheme: { primary: "rgb(var(--error))", secondary: "rgb(var(--on-brand))" },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
