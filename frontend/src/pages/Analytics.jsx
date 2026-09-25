import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend, AreaChart, Area
} from 'recharts';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { usePrediction } from '../hooks/usePrediction';
import { isDemoMode } from '../services/predictionApi';

const COLORS = { low: '#10B981', moderate: '#F59E0B', high: '#EF4444' };

// Demo data
const DIST_DATA = [
  { name: 'Low Risk', value: 58, color: COLORS.low },
  { name: 'Moderate Risk', value: 28, color: COLORS.moderate },
  { name: 'High Risk', value: 14, color: COLORS.high },
];
const TREND_DATA = [
  { day: 'Mon', low: 12, moderate: 6, high: 3 },
  { day: 'Tue', low: 18, moderate: 8, high: 2 },
  { day: 'Wed', low: 10, moderate: 10, high: 5 },
  { day: 'Thu', low: 22, moderate: 7, high: 4 },
  { day: 'Fri', low: 15, moderate: 9, high: 6 },
  { day: 'Sat', low: 8, moderate: 4, high: 2 },
  { day: 'Sun', low: 6, moderate: 3, high: 1 },
];
const CREDIT_DATA = [
  { score: 480, risk: 78 }, { score: 510, risk: 71 }, { score: 540, risk: 65 },
  { score: 580, risk: 55 }, { score: 610, risk: 48 }, { score: 640, risk: 39 },
  { score: 670, risk: 30 }, { score: 700, risk: 22 }, { score: 730, risk: 15 },
  { score: 760, risk: 10 }, { score: 790, risk: 7 }, { score: 820, risk: 4 },
];
const INCOME_DATA = [
  { range: '<25K', low: 15, high: 62 }, { range: '25-50K', low: 38, high: 38 },
  { range: '50-75K', low: 52, high: 22 }, { range: '75-100K', low: 65, high: 12 },
  { range: '>100K', low: 78, high: 5 },
];
const DTI_DATA = [
  { dti: '0-20%', count: 35, color: '#10B981' }, { dti: '20-35%', count: 42, color: '#10B981' },
  { dti: '35-45%', count: 28, color: '#F59E0B' }, { dti: '45-60%', count: 18, color: '#EF4444' },
  { dti: '>60%', count: 8, color: '#EF4444' },
];

const customTooltipStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
  borderRadius: 10, fontSize: 12,
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card" style={{ padding: '22px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { history } = usePrediction();
  const demo = isDemoMode();

  // Build real distribution from session history if available
  const realDist = history.length >= 3 ? [
    { name: 'Low Risk', value: history.filter(h => h.risk_category?.includes('Low')).length, color: COLORS.low },
    { name: 'Moderate Risk', value: history.filter(h => h.risk_category?.includes('Moderate')).length, color: COLORS.moderate },
    { name: 'High Risk', value: history.filter(h => h.risk_category?.includes('High')).length, color: COLORS.high },
  ] : null;

  const distData = realDist || DIST_DATA;
  const isRealData = !!realDist;

  return (
    <PageWrapper>
      <FadeUpItem delay={0}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Analytics
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {isRealData ? 'Based on your session data' : 'Risk distribution and model performance visualizations'}
            </p>
            {(!isRealData) && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 99, padding: '2px 8px' }}>DEMO DATA</span>
            )}
          </div>
        </div>
      </FadeUpItem>

      {/* Row 1: Pie + Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>
        <FadeUpItem delay={0.05}>
          <ChartCard title="Risk Distribution" subtitle={isRealData ? `${history.length} session predictions` : 'Demo data'}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" outerRadius={75} innerRadius={40}
                  dataKey="value" stroke="none" paddingAngle={2}>
                  {distData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v}`, '']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeUpItem>

        <FadeUpItem delay={0.1}>
          <ChartCard title="Assessments Over Time" subtitle="By risk level (demo — last 7 days)">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  {['low', 'moderate', 'high'].map(k => (
                    <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[k]} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS[k]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="low" name="Low Risk" stroke={COLORS.low} strokeWidth={2} fill="url(#g_low)" />
                <Area type="monotone" dataKey="moderate" name="Moderate" stroke={COLORS.moderate} strokeWidth={2} fill="url(#g_moderate)" />
                <Area type="monotone" dataKey="high" name="High Risk" stroke={COLORS.high} strokeWidth={2} fill="url(#g_high)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeUpItem>
      </div>

      {/* Row 2: Credit Score vs Risk + Income vs Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <FadeUpItem delay={0.15}>
          <ChartCard title="Credit Score vs. Default Probability" subtitle="Lower score → higher risk (demo data)">
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="score" name="Credit Score" type="number" domain={[450, 850]}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="risk" name="Default Risk %" type="number" domain={[0, 100]}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle}
                  formatter={(v, n) => [n === 'Default Risk %' ? `${v}%` : v, n]} />
                <Scatter data={CREDIT_DATA} fill="#6366F1" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeUpItem>

        <FadeUpItem delay={0.2}>
          <ChartCard title="Income Range vs. Risk Outcome" subtitle="% of applicants approved or declined (demo data)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={INCOME_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(v) => `${v}%`} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="low" name="Low Risk" fill={COLORS.low} radius={[0, 4, 4, 0]} />
                <Bar dataKey="high" name="High Risk" fill={COLORS.high} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeUpItem>
      </div>

      {/* Row 3: DTI Distribution */}
      <FadeUpItem delay={0.25}>
        <ChartCard title="DTI Ratio Distribution" subtitle="Debt-to-income ratio across applicant pool (demo data)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DTI_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="dti" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v} applicants`, '']} />
              <Bar dataKey="count" name="Applicants" radius={[4, 4, 0, 0]}>
                {DTI_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </FadeUpItem>
    </PageWrapper>
  );
}
