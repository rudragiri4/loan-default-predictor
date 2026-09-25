import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Bell, Layout, Zap, Info, Code, RefreshCw, Activity } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { isDemoMode, setDemoMode, checkApiHealth } from '../services/predictionApi';

function SettingSection({ title, children }) {
  return (
    <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em',
        textTransform: 'uppercase', marginBottom: 16, fontSize: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingRow({ icon: Icon, label, desc, children, color = '#6366F1' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: `${color}18`, border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }} />
      <div style={{
        width: 44, height: 24, borderRadius: 99,
        background: checked ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'var(--bg-elevated)',
        border: `1px solid ${checked ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
        position: 'relative', transition: 'all 0.2s',
      }}>
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute', top: 2, width: 18, height: 18,
            borderRadius: '50%', background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </label>
  );
}

function ThemeButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
      background: active ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
      border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
      color: active ? '#6366F1' : 'var(--text-muted)',
      fontFamily: 'inherit', transition: 'all 0.15s', flex: 1,
    }}>
      <Icon size={20} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [demoOn, setDemoOn] = useState(isDemoMode());
  const [apiStatus, setApiStatus] = useState(null);
  const [compact, setCompact] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    checkApiHealth().then(setApiStatus);
  }, []);

  const handleDemoToggle = (val) => {
    setDemoOn(val);
    setDemoMode(val);
    toast({
      type: 'info',
      title: val ? 'Demo Mode enabled' : 'Live Mode enabled',
      message: val ? 'Using simulated API responses.' : 'Connected to Flask backend at localhost:5000',
    });
  };

  const checkApi = () => {
    setApiStatus(null);
    checkApiHealth().then(s => {
      setApiStatus(s);
      toast({ type: s.online ? 'success' : 'error', title: s.online ? 'API Online' : 'API Offline',
        message: s.online ? 'Flask backend is responding.' : 'Could not reach localhost:5000' });
    });
  };

  return (
    <PageWrapper>
      <FadeUpItem delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Configure the application appearance and behavior
          </p>
        </div>
      </FadeUpItem>

      {/* Appearance */}
      <FadeUpItem delay={0.05}>
        <SettingSection title="Appearance">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>Color Theme</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <ThemeButton icon={Moon} label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} />
              <ThemeButton icon={Sun} label="Light" active={theme === 'light'} onClick={() => setTheme('light')} />
              <ThemeButton icon={Monitor} label="System" active={theme === 'system'} onClick={() => {
                const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setTheme(sys);
              }} />
            </div>
          </div>
          <SettingRow icon={Layout} label="Compact Mode" desc="Reduce padding and spacing throughout the interface" color="#8B5CF6">
            <Toggle id="compact" checked={compact} onChange={setCompact} />
          </SettingRow>
        </SettingSection>
      </FadeUpItem>

      {/* Notifications */}
      <FadeUpItem delay={0.1}>
        <SettingSection title="Application">
          <SettingRow icon={Bell} label="Toast Notifications" desc="Show toast alerts for predictions, errors, and actions" color="#F59E0B">
            <Toggle id="notif" checked={notifications} onChange={setNotifications} />
          </SettingRow>
          <SettingRow icon={Activity} label="Demo Mode" desc="Use simulated API responses — useful when Flask backend is not running" color="#6366F1">
            <Toggle id="demo" checked={demoOn} onChange={handleDemoToggle} />
          </SettingRow>
        </SettingSection>
      </FadeUpItem>

      {/* API Status */}
      <FadeUpItem delay={0.15}>
        <SettingSection title="Model & API">
          <SettingRow icon={Zap} label="ML API Status" desc="Flask backend at http://localhost:5000" color={apiStatus?.online ? '#10B981' : '#EF4444'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`status-dot ${apiStatus === null ? 'loading' : apiStatus.online ? 'online' : 'offline'}`} />
                <span style={{ fontSize: 12, fontWeight: 600, color: apiStatus === null ? '#F59E0B' : apiStatus.online ? '#10B981' : '#EF4444' }}>
                  {apiStatus === null ? 'Checking...' : apiStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={checkApi} aria-label="Refresh status">
                <RefreshCw size={13} />
              </button>
            </div>
          </SettingRow>
          <SettingRow icon={Code} label="Active Model" desc="Currently loaded prediction model" color="#8B5CF6">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 7 }}>
              Random Forest + LR
            </span>
          </SettingRow>
          <SettingRow icon={Code} label="Model Version" desc="Loaded from saved_models/best_model.pkl" color="#06B6D4">
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>v1.0.0</span>
          </SettingRow>
        </SettingSection>
      </FadeUpItem>

      {/* About */}
      <FadeUpItem delay={0.2}>
        <SettingSection title="About">
          <SettingRow icon={Info} label="Application Version" color="#6366F1">
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>v1.0.0</span>
          </SettingRow>
          <SettingRow icon={Code} label="Technology Stack" color="#8B5CF6">
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>React · Vite · Framer Motion · Recharts · Flask</span>
          </SettingRow>
          <SettingRow icon={Info} label="Dataset" color="#06B6D4">
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loan_default.csv · 255,347 records</span>
          </SettingRow>
          <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            This is a college project demonstrating AI-powered loan risk assessment.
            Predictions are for educational purposes only and do not constitute financial advice.
          </div>
        </SettingSection>
      </FadeUpItem>
    </PageWrapper>
  );
}
