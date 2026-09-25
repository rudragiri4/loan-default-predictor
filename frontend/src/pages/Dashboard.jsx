import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  PlusCircle, Activity, Clock, Users, Shield, ArrowUpRight, Brain
} from 'lucide-react';
import { usePrediction } from '../hooks/usePrediction';
import { useToast } from '../hooks/useToast';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { formatCurrency, formatPercent, formatDate, getRiskColor } from '../utils/helpers';
import { checkApiHealth, isDemoMode } from '../services/predictionApi';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts';

function KPICard({ icon: Icon, label, value, trend, trendPositive, accent, delay, sub }) {
  return (
    <FadeUpItem delay={delay}>
      <motion.div
        className="card card-glow"
        whileHover={{ y: -3 }}
        style={{ padding: '20px 22px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${accent}18`, border: `1px solid ${accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={accent} />
          </div>
          {trend && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600,
              color: trendPositive ? '#10B981' : '#EF4444',
            }}>
              {trendPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend}
            </div>
          )}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: accent, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      </motion.div>
    </FadeUpItem>
  );
}

const SPARKLINE_DATA = [
  { name: '7d ago', value: 18 }, { name: '6d', value: 22 }, { name: '5d', value: 15 },
  { name: '4d', value: 28 }, { name: '3d', value: 24 }, { name: '2d', value: 31 },
  { name: '1d', value: 19 }, { name: 'Today', value: 25 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#6366F1', fontWeight: 700 }}>{payload[0].value} assessments</div>
    </div>
  );
}

export default function Dashboard() {
  const { history } = usePrediction();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState(null);
  const demo = isDemoMode();

  useEffect(() => {
    checkApiHealth().then(setApiStatus);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const total = history.length;
  const low = history.filter(h => (h.risk_category || '').toLowerCase().includes('low')).length;
  const mod = history.filter(h => (h.risk_category || '').toLowerCase().includes('mod')).length;
  const high = history.filter(h => (h.risk_category || '').toLowerCase().includes('high')).length;

  const recentHistory = history.slice(0, 5);

  return (
    <PageWrapper>
      {/* Header */}
      <FadeUpItem delay={0}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {greeting} 👋
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                AI Loan Risk Overview
                {demo && <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: '#F59E0B',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 99, padding: '2px 8px' }}>DEMO DATA</span>}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <span className={`status-dot ${apiStatus?.online ? 'online' : apiStatus ? 'offline' : 'loading'}`} />
                {apiStatus?.demo ? 'Demo Mode' : apiStatus?.online ? 'API Online' : apiStatus ? 'API Offline' : 'Checking...'}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
                <PlusCircle size={14} /> New Assessment
              </button>
            </div>
          </div>
        </div>
      </FadeUpItem>

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <KPICard
          icon={Users} label="Total Assessments" value={total || (demo ? 42 : 0)}
          trend="+12.5%" trendPositive accent="#6366F1" delay={0.05}
          sub={demo ? 'Session + demo data' : 'This session'}
        />
        <KPICard
          icon={CheckCircle} label="Low Risk" value={low || (demo ? 28 : 0)}
          accent="#10B981" delay={0.1} trend="+8%" trendPositive
          sub="Approved applications"
        />
        <KPICard
          icon={AlertTriangle} label="Moderate Risk" value={mod || (demo ? 10 : 0)}
          accent="#F59E0B" delay={0.15} sub="Needs review"
        />
        <KPICard
          icon={Shield} label="High Risk" value={high || (demo ? 4 : 0)}
          accent="#EF4444" delay={0.2} trend="-3%" trendPositive
          sub="Declined / Review"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 28 }}>
        {/* Activity chart */}
        <FadeUpItem delay={0.25}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Assessment Activity</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {demo ? 'Demo data — last 8 days' : 'This session'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                <TrendingUp size={14} /> +18.4%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={SPARKLINE_DATA}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2}
                  fill="url(#areaGrad)" dot={{ fill: '#6366F1', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#8B5CF6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeUpItem>

        {/* Quick actions */}
        <FadeUpItem delay={0.3}>
          <div className="card" style={{ padding: '22px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Actions</div>
            {[
              { icon: PlusCircle, label: 'New Assessment', desc: 'Analyze a loan application', to: '/predict', color: '#6366F1' },
              { icon: Activity, label: 'Analytics', desc: 'View risk distribution', to: '/analytics', color: '#8B5CF6' },
              { icon: Brain, label: 'Model Insights', desc: 'Feature importance & metrics', to: '/model-insights', color: '#06B6D4' },
            ].map(({ icon: Icon, label, desc, to, color }) => (
              <motion.button
                key={to}
                onClick={() => navigate(to)}
                whileHover={{ x: 4 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', marginBottom: 4,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `${color}18`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </motion.button>
            ))}
          </div>
        </FadeUpItem>
      </div>

      {/* Recent history */}
      <FadeUpItem delay={0.35}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Assessments</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={24} color="#6366F1" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No predictions yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280 }}>
                Run your first AI risk assessment to see results here.
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
                <PlusCircle size={14} /> Create Prediction
              </button>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 80px',
                padding: '8px 12px', marginBottom: 4,
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                <span>ID / Date</span>
                <span>Loan Amount</span>
                <span>Credit Score</span>
                <span>Risk Score</span>
                <span>Level</span>
              </div>
              {recentHistory.map((h, i) => {
                const rc = getRiskColor(h.risk_category);
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    onClick={() => { navigate('/history'); }}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 80px',
                      padding: '12px 12px', borderRadius: 10,
                      cursor: 'pointer', marginBottom: 4,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {h.id}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(h.date)}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', alignSelf: 'center' }}>
                      {formatCurrency(h.inputs?.LoanAmount)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
                      {h.inputs?.CreditScore || '—'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: rc.text, alignSelf: 'center' }}>
                      {h.default_risk_score?.toFixed(1)}%
                    </div>
                    <div style={{ alignSelf: 'center' }}>
                      <span className="badge" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`, fontSize: 10 }}>
                        {h.risk_category?.replace(' Risk', '') || '—'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </FadeUpItem>

      {/* Footer hint */}
      <FadeUpItem delay={0.5}>
        <div style={{
          marginTop: 24, padding: '12px 18px', borderRadius: 10,
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Brain size={14} color="#6366F1" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Press <kbd style={{ padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', fontSize: 11 }}>Ctrl+K</kbd>
            {' '}to open command palette · <kbd style={{ padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', fontSize: 11 }}>N</kbd>
            {' '}New prediction · <kbd style={{ padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', fontSize: 11 }}>H</kbd>
            {' '}History
          </span>
        </div>
      </FadeUpItem>
    </PageWrapper>
  );
}
