import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col font-mono selection:bg-neon-green/30 selection:text-neon-green overflow-x-hidden">
      {/* ── Background Grid (Global Decor) ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      
      {/* ── Global Scanline Effect ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-gradient-to-b from-transparent via-neon-green/10 to-transparent bg-[length:100%_4px] animate-scanline" />

      <Navbar />
      
      <main className="flex-grow z-10">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.2em] font-mono z-10 bg-black">
        &copy; {new Date().getFullYear()} FSOCIETY_PK // SYSTEM_ONLINE // SECURE_COMMUNICATIONS_ONLY
      </footer>
    </div>
  );
};

export default MainLayout;
