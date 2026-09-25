import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { fetchModelInfo } from '../services/predictionApi';
import { Loader2, Brain, Target, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

function MetricCard({ label, value, color, icon: Icon, description }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${color}18`, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>
        {value !== null && value !== undefined ? `${(Number(value) * 100).toFixed(1)}%` : '—'}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
      {description && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</div>}
    </div>
  );
}

export default function ModelInsights() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true); setError(null);
    fetchModelInfo()
      .then(setInfo)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const featureData = info?.feature_importance?.map(f => ({
    name: f.feature.replace(/([A-Z])/g, ' $1').trim(),
    value: parseFloat((f.importance * 100).toFixed(2)),
  })) || [];

  const barColors = featureData.map((_, i) => {
    const hue = 240 - i * 10;
    return `hsl(${hue}, 70%, 60%)`;
  });

  return (
    <PageWrapper>
      <FadeUpItem delay={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Model Insights
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              ML model performance metrics and feature importance from the Random Forest classifier
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </FadeUpItem>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 30, justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" color="#6366F1" />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading model data...</span>
        </div>
      )}

      {error && (
        <FadeUpItem delay={0}>
          <div style={{
            padding: '16px 20px', borderRadius: 12, marginBottom: 20,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>Could not load model data</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
              <button className="btn btn-sm" onClick={load} style={{ marginTop: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Retry
              </button>
            </div>
          </div>
        </FadeUpItem>
      )}

      {info && !loading && (
        <>
          {/* Model header */}
          <FadeUpItem delay={0.05}>
            <div className="card" style={{ padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Brain size={22} color="#6366F1" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{info.model_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                  Trained on {info.total_samples?.toLocaleString()} samples · Production model v1.0
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Samples', value: info.total_samples?.toLocaleString() },
                  { label: 'Model Type', value: 'Ensemble' },
                  { label: 'Version', value: 'v1.0' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUpItem>

          {/* Metrics */}
          <FadeUpItem delay={0.1}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              <MetricCard label="Accuracy" value={info.accuracy} color="#10B981" icon={Target}
                description="Overall prediction accuracy on test set" />
              <MetricCard label="AUC-ROC Score" value={info.auc_score} color="#6366F1" icon={TrendingUp}
                description="Area under ROC curve — discrimination ability" />
              <MetricCard label="Precision" value={null} color="#F59E0B" icon={Target}
                description="Not available from current API response" />
              <MetricCard label="Recall" value={null} color="#8B5CF6" icon={Brain}
                description="Not available from current API response" />
            </div>
          </FadeUpItem>

          {/* Feature importance */}
          {featureData.length > 0 && (
            <FadeUpItem delay={0.15}>
              <div className="card" style={{ padding: '22px 24px', marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Feature Importance</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    From Random Forest model — gini impurity reduction per feature
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={featureData} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${v.toFixed(1)}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                      axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 10 }}
                      formatter={(v) => [`${v.toFixed(2)}%`, 'Importance']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                      {featureData.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Top 3 factors */}
                <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>Top factors:</div>
                  {featureData.slice(0, 3).map((f, i) => (
                    <span key={f.name} style={{
                      fontSize: 12, padding: '3px 10px', borderRadius: 6,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      color: '#8B9EC7', fontWeight: 600,
                    }}>
                      {i + 1}. {f.name} ({f.value.toFixed(1)}%)
                    </span>
                  ))}
                </div>
              </div>
            </FadeUpItem>
          )}

          {/* Confusion matrix note */}
          <FadeUpItem delay={0.2}>
            <div style={{
              padding: '16px 20px', borderRadius: 12,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Note: </strong>
                Confusion matrix, precision, recall, F1 score, and ROC curve visualizations require the backend
                to expose additional model evaluation endpoints. Currently only accuracy, AUC, and feature importance
                are returned by <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8B5CF6' }}>/api/model-info</code>.
                These can be added to <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8B5CF6' }}>server.py</code> to unlock the full metrics panel.
              </div>
            </div>
          </FadeUpItem>
        </>
      )}
    </PageWrapper>
  );
}
