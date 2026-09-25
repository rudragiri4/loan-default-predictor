import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import CommandPalette from '../ui/CommandPalette';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="main-content" id="main-content">
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          '@media(max-width:767px)': { display: 'flex' },
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center', gap: 12,
          background: 'var(--bg-surface)',
          position: 'sticky', top: 0, zIndex: 30,
        }}
        className="mobile-topbar"
        >
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Risk<span style={{ color: '#6366F1' }}>AI</span>
          </span>
        </div>

        <Outlet />
      </main>

      <CommandPalette />
    </div>
  );
}
