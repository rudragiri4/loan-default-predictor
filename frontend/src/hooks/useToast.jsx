// Toast notification system
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '#10B981' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  icon: '#EF4444' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '#F59E0B' },
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '#3B82F6' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type];
            const c = COLORS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  minWidth: 280, maxWidth: 380,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(16px)',
                }}
                role="alert"
              >
                <div style={{ background: c.bg, borderRadius: 8, padding: 6, flexShrink: 0 }}>
                  <Icon size={16} color={c.icon} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {t.title && (
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {t.title}
                    </div>
                  )}
                  {t.message && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {t.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                           color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
};

