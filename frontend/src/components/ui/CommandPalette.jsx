import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, PlusCircle, History, BarChart3, Brain, Info, Settings, X } from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', shortcut: 'D' },
  { id: 'predict', label: 'New Prediction', icon: PlusCircle, to: '/predict', shortcut: 'N' },
  { id: 'history', label: 'Prediction History', icon: History, to: '/history', shortcut: 'H' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { id: 'insights', label: 'Model Insights', icon: Brain, to: '/model-insights' },
  { id: 'about', label: 'About Model', icon: Info, to: '/about' },
  { id: 'settings', label: 'Settings', icon: Settings, to: '/settings' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      // Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      // Keyboard shortcuts when palette closed
      if (!open && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
        if (e.key === 'n') navigate('/predict');
        if (e.key === 'd') navigate('/dashboard');
        if (e.key === 'h') navigate('/history');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, navigate]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = COMMANDS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  );

  const execute = (cmd) => {
    navigate(cmd.to);
    setOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 520, background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
              role="dialog" aria-label="Command palette"
            >
              {/* Search input */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
              }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0); }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, filtered.length - 1));
                    if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
                    if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected]);
                  }}
                  placeholder="Search commands..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 15, color: 'var(--text-primary)', fontFamily: 'inherit',
                  }}
                  aria-label="Command search"
                />
                <button onClick={() => setOpen(false)} className="btn btn-ghost btn-icon" style={{ padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Commands list */}
              <div style={{ padding: 8, maxHeight: 340, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    No commands found
                  </div>
                ) : filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 10, border: 'none',
                        background: i === selected ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: i === selected ? '#6366F1' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <Icon size={16} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd style={{
                          fontSize: 11, padding: '2px 6px', borderRadius: 5,
                          background: 'var(--bg-hover)', border: '1px solid var(--border-strong)',
                          color: 'var(--text-muted)', fontFamily: 'inherit',
                        }}>{cmd.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{
                padding: '8px 16px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <kbd style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-hover)' }}>↑↓</kbd>
                  {' '}navigate
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <kbd style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-hover)' }}>↵</kbd>
                  {' '}select
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <kbd style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-hover)' }}>Esc</kbd>
                  {' '}close
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
