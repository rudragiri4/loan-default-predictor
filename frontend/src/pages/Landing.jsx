import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Brain, Shield, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { setDemoMode } from '../services/predictionApi';

const STATS = [
  { value: '88.7%', label: 'Model Accuracy', icon: TrendingUp, color: '#10B981' },
  { value: '255K+', label: 'Training Samples', icon: BarChart2, color: '#6366F1' },
  { value: 'Real-Time', label: 'AI Prediction', icon: Activity, color: '#8B5CF6' },
  { value: 'RF + LR', label: 'Dual ML Models', icon: Brain, color: '#06B6D4' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const num = parseFloat(target);
  const isNum = !isNaN(num);

  useEffect(() => {
    if (!isNum) return;
    const start = Date.now();
    const duration = 1500;
    const raf = (t) => {
      const prog = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(ease * num * 10) / 10);
      if (prog < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [num, isNum]);

  return <span>{isNum ? val.toFixed(target.includes('.') ? 1 : 0) : target}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated grid + particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(99,102,241,0.04)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const handleEnter = (demo) => {
    setDemoMode(demo);
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Animated background */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Glow orbs */}
      <div className="glow-orb orb-indigo" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.6 }} />
      <div className="glow-orb orb-violet" style={{ width: 500, height: 500, bottom: -200, right: -100, opacity: 0.4 }} />
      <div className="glow-orb orb-cyan" style={{ width: 300, height: 300, top: '40%', right: '20%', opacity: 0.3 }} />

      {/* Navbar */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Risk<span style={{ color: '#6366F1' }}>AI</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', gap: 12, alignItems: 'center' }}
        >
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#F59E0B',
            letterSpacing: '0.08em', padding: '4px 10px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 99,
          }}>
            COLLEGE PROJECT DEMO
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => handleEnter(true)}>
            Demo Mode
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleEnter(false)}>
            Live Mode
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        position: 'relative', zIndex: 10,
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8B9EC7', letterSpacing: '0.04em' }}>
              AI-POWERED RISK ASSESSMENT PLATFORM
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.04em',
            color: 'var(--text-primary)', marginBottom: 20,
            maxWidth: 780,
          }}
        >
          AI-Powered{' '}
          <span className="gradient-text">Loan Risk</span>
          <br />Assessment
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            fontSize: 18, color: 'var(--text-secondary)',
            maxWidth: 540, lineHeight: 1.7, marginBottom: 40,
          }}
        >
          Predict loan default risk using machine learning and
          data-driven financial insights — powered by a Random Forest model
          trained on 255,000+ real applicant records.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}
        >
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={() => handleEnter(false)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            Start Risk Assessment <ArrowRight size={18} />
          </motion.button>
          <motion.button
            className="btn btn-secondary btn-lg"
            onClick={() => { setDemoMode(true); navigate('/about'); }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            <Brain size={18} /> Explore Model
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16, maxWidth: 700, width: '100%',
          }}
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                style={{
                  padding: '20px 16px', borderRadius: 14,
                  background: 'rgba(13,21,37,0.6)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `${stat.color}18`,
                  border: `1px solid ${stat.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ marginTop: 40, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {['Random Forest', 'Logistic Regression', 'React + Vite', 'Flask API', 'Python ML'].map(t => (
            <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={10} color="#6366F1" /> {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 48px', borderTop: '1px solid var(--border)',
        textAlign: 'center', position: 'relative', zIndex: 10,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          College project · AI Loan Risk Assessment Platform · For educational demonstration purposes only
        </p>
      </div>
    </div>
  );
}
