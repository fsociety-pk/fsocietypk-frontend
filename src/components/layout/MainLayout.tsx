import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col selection:bg-neon-green/30 selection:text-neon-green">
      <Navbar />

      <main className="site-main flex-grow min-w-0">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
              <span className="text-sm text-zinc-400">Loading page...</span>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="relative z-10 border-t border-surface-border bg-background px-4 py-5 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} FSocietyPK
      </footer>
    </div>
  );
};

export default MainLayout;
