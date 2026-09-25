import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  'Validating applicant information',
  'Processing financial indicators',
  'Running machine learning model',
  'Calculating risk probability',
  'Generating risk explanation',
];

export default function AnalysisAnimation() {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);

  useEffect(() => {
    if (current >= STEPS.length) return;
    const delay = current === 2 ? 600 : 350;
    const t = setTimeout(() => {
      setDone(d => [...d, current]);
      setCurrent(c => c + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div className="glow-orb orb-indigo" style={{ width: 400, height: 400, top: '10%', left: '20%', opacity: 0.3 }} />
      <div className="glow-orb orb-violet" style={{ width: 300, height: 300, bottom: '15%', right: '15%', opacity: 0.2 }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: '40px 48px',
          width: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          position: 'relative', zIndex: 10,
        }}
      >
        {/* Animated header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            animate={{ rotate: current < STEPS.length ? 360 : 0 }}
            transition={{ duration: 1.5, repeat: current < STEPS.length ? Infinity : 0, ease: 'linear' }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '2px solid rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {current < STEPS.length
              ? <Loader2 size={24} color="#6366F1" />
              : <CheckCircle size={24} color="#10B981" />
            }
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {current < STEPS.length ? 'Analyzing Application' : 'Analysis Complete'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {current < STEPS.length
              ? 'Our AI model is processing your application...'
              : 'Preparing your risk assessment report'
            }
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STEPS.map((step, i) => {
            const isDone = done.includes(i);
            const isActive = i === current;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: i <= current ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: isActive ? 'rgba(99,102,241,0.08)' : isDone ? 'rgba(16,185,129,0.06)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(99,102,241,0.2)' : isDone ? 'rgba(16,185,129,0.15)' : 'transparent'}`,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <CheckCircle size={18} color="#10B981" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div key="active" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 size={18} color="#6366F1" />
                      </motion.div>
                    ) : (
                      <div key="pending" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-strong)' }} />
                    )}
                  </AnimatePresence>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: isDone ? 600 : isActive ? 600 : 400,
                  color: isDone ? '#10B981' : isActive ? '#6366F1' : 'var(--text-muted)',
                }}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="progress-bar-track" style={{ height: 4, marginTop: 24 }}>
          <motion.div
            className="progress-bar-fill"
            animate={{ width: `${(done.length / STEPS.length) * 100}%` }}
            style={{ background: 'linear-gradient(90deg, #6366F1, #10B981)', height: '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
