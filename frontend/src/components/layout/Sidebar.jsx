import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, History, BarChart3, Brain,
  Info, Settings, ChevronLeft, ChevronRight, LogOut,
  User, Sun, Moon, X, Menu, Zap, Activity
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { isDemoMode } from '../../services/predictionApi';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predict', icon: PlusCircle, label: 'New Prediction' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/model-insights', icon: Brain, label: 'Model Insights' },
  { to: '/about', icon: Info, label: 'About Model' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const demo = isDemoMode();

  // Listen for demo mode change
  const [isDemo, setIsDemo] = useState(demo);
  useEffect(() => {
    const handler = () => setIsDemo(isDemoMode());
    window.addEventListener('demo-mode-change', handler);
    return () => window.removeEventListener('demo-mode-change', handler);
  }, []);

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  Risk<span style={{ color: '#6366F1' }}>AI</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>
                  LOAN ASSESSMENT
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn btn-ghost btn-icon"
          style={{ display: window.innerWidth < 768 ? 'none' : 'flex' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        {mobileOpen && (
          <button onClick={onMobileClose} className="btn btn-ghost btn-icon" aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Demo badge */}
      {isDemo && !collapsed && (
        <div style={{ margin: '10px 12px 0', padding: '6px 10px', borderRadius: 8,
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                      display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={12} color="#F59E0B" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', letterSpacing: '0.06em' }}>DEMO MODE</span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }} aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onMobileClose}
            style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
            {({ isActive }) => (
              <div className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, padding: collapsed ? '10px' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10, cursor: 'pointer', position: 'relative',
                  transition: 'all 0.15s ease',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: isActive ? '#6366F1' : 'var(--text-secondary)',
                }}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 99,
                      background: 'linear-gradient(180deg, #6366F1, #8B5CF6)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <div className="tooltip-container" style={{ display: collapsed ? 'block' : 'contents' }}>
                  <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                  {collapsed && <span className="tooltip" style={{ left: '120%', bottom: 'auto', top: '50%', transform: 'translateY(-50%)' }}>{label}</span>}
                </div>
                {!collapsed && (
                  <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{label}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: collapsed ? '10px' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, cursor: 'pointer', border: 'none',
            background: 'transparent', color: 'var(--text-secondary)',
            fontFamily: 'inherit', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User */}
        {!collapsed ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, marginTop: 4,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={14} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Analyst
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk Officer</div>
            </div>
            <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} aria-label="Logout"
              onClick={() => navigate('/login')}>
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={15} color="white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          height: '100vh', position: 'sticky', top: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden', flexShrink: 0,
          display: window.innerWidth < 768 ? 'none' : 'block',
          zIndex: 40,
        }}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
              style={{
                position: 'fixed', inset: 0, zIndex: 49,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              }}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                width: 260, zIndex: 50,
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
