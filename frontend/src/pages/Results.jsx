import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle, History as HistoryIcon, Download, AlertTriangle, CheckCircle, Shield,
  Info, TrendingDown, TrendingUp, DollarSign, User, FileText, ExternalLink
} from 'lucide-react';
import { usePrediction } from '../hooks/usePrediction';
import { useToast } from '../hooks/useToast';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { formatCurrency, formatPercent, getRiskColor, getRiskGradient, creditScoreLabel, dtiLabel } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Animated number counter
function Counter({ target, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return <span>{val.toFixed(1)}{suffix}</span>;
}

// Circular gauge
function RiskGauge({ score, level }) {
  const rc = getRiskColor(level);
  const angle = (score / 100) * 180 - 90; // -90 to 90 degrees
  const radius = 90;
  const cx = 110, cy = 110;

  // SVG arc helper
  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function describeArc(cx, cy, r, start, end) {
    const s = polarToCartesian(cx, cy, r, start);
    const e = polarToCartesian(cx, cy, r, end);
    const large = end - start <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const [animatedAngle, setAnimatedAngle] = useState(-90);
  useEffect(() => {
    const start = Date.now();
    const dur = 1400;
    const targetAngle = (score / 100) * 180 - 90;
    const raf = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimatedAngle(-90 + ease * (targetAngle + 90));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [score]);

  const needle = polarToCartesian(cx, cy, 70, animatedAngle);

  return (
    <svg width={220} height={130} viewBox="0 0 220 130" aria-label={`Risk gauge: ${score}%`}>
      {/* Background arc */}
      <path d={describeArc(cx, cy, radius, -90, 90)} fill="none" stroke="var(--bg-elevated)" strokeWidth={16} strokeLinecap="round" />
      {/* Segments */}
      <path d={describeArc(cx, cy, radius, -90, -30)} fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth={16} strokeLinecap="round" />
      <path d={describeArc(cx, cy, radius, -30, 30)} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth={16} strokeLinecap="round" />
      <path d={describeArc(cx, cy, radius, 30, 90)} fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth={16} strokeLinecap="round" />
      {/* Animated colored arc */}
      <motion.path
        d={describeArc(cx, cy, radius, -90, animatedAngle)}
        fill="none" stroke={rc.text} strokeWidth={16} strokeLinecap="round"
      />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y}
        stroke="var(--text-primary)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="var(--text-primary)" />
      {/* Labels */}
      <text x={16} y={120} fill="rgba(16,185,129,0.8)" fontSize={10} fontWeight={600}>Low</text>
      <text x={90} y={22} fill="rgba(245,158,11,0.8)" fontSize={10} fontWeight={600} textAnchor="middle">Moderate</text>
      <text x={190} y={120} fill="rgba(239,68,68,0.8)" fontSize={10} fontWeight={600} textAnchor="end">High</text>
    </svg>
  );
}

const RISK_CHART_COLORS = { low: '#10B981', moderate: '#F59E0B', high: '#EF4444' };

export default function Results() {
  const { currentResult } = usePrediction();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!currentResult) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Result Available</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Run a loan risk assessment to see results here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/predict')}>
            <PlusCircle size={16} /> Start Assessment
          </button>
        </div>
      </PageWrapper>
    );
  }

  const { default_risk_score, risk_category, monthly_payment, loan_to_income, risk_flags, recommendations, inputs, modelUsed } = currentResult;
  const rc = getRiskColor(risk_category);
  const riskGrad = getRiskGradient(risk_category);
  const isLow = risk_category?.toLowerCase().includes('low');
  const isHigh = risk_category?.toLowerCase().includes('high');

  const donutData = [
    { name: 'Default Probability', value: default_risk_score },
    { name: 'No Default', value: 100 - default_risk_score },
  ];
  const donutColors = [rc.text, 'rgba(255,255,255,0.06)'];

  const indicators = [
    {
      label: 'Credit Score',
      value: inputs?.CreditScore,
      display: `${inputs?.CreditScore} — ${creditScoreLabel(inputs?.CreditScore)}`,
      pct: ((inputs?.CreditScore - 300) / 550) * 100,
      color: inputs?.CreditScore >= 700 ? '#10B981' : inputs?.CreditScore >= 620 ? '#F59E0B' : '#EF4444',
      positive: inputs?.CreditScore >= 680,
    },
    {
      label: 'DTI Ratio',
      value: inputs?.DTIRatio,
      display: `${(inputs?.DTIRatio * 100).toFixed(0)}% — ${dtiLabel(inputs?.DTIRatio)}`,
      pct: Math.min(inputs?.DTIRatio * 100, 100),
      color: inputs?.DTIRatio < 0.35 ? '#10B981' : inputs?.DTIRatio < 0.45 ? '#F59E0B' : '#EF4444',
      positive: inputs?.DTIRatio < 0.36,
    },
    {
      label: 'Interest Rate',
      value: inputs?.InterestRate,
      display: `${inputs?.InterestRate}%`,
      pct: Math.min((inputs?.InterestRate / 30) * 100, 100),
      color: inputs?.InterestRate < 10 ? '#10B981' : inputs?.InterestRate < 16 ? '#F59E0B' : '#EF4444',
      positive: inputs?.InterestRate < 12,
    },
    {
      label: 'Loan-to-Income',
      value: loan_to_income,
      display: `${loan_to_income?.toFixed(1)}%`,
      pct: Math.min(loan_to_income / 3, 100),
      color: loan_to_income < 100 ? '#10B981' : loan_to_income < 200 ? '#F59E0B' : '#EF4444',
      positive: loan_to_income < 120,
    },
  ];

  const handleDownload = () => {
    toast({ type: 'info', title: 'Report generation', message: 'PDF report generation requires a backend PDF service. Feature coming soon.', duration: 5000 });
  };

  const handleSave = () => {
    toast({ type: 'success', title: 'Assessment saved', message: 'Added to your prediction history for this session.' });
  };

  return (
    <PageWrapper>
      {/* Header */}
      <FadeUpItem delay={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Loan Risk Assessment
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Model: {modelUsed || 'Random Forest'} · {new Date(currentResult.date).toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/predict')}>
              <PlusCircle size={14} /> New Assessment
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
              <HistoryIcon size={14} /> View History
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
              <Download size={14} /> Report
            </button>
          </div>
        </div>
      </FadeUpItem>

      {/* Main result hero */}
      <FadeUpItem delay={0.05}>
        <div className="card" style={{ padding: '32px 36px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            borderRadius: '50%', background: `${rc.text}10`, filter: 'blur(40px)',
          }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'center' }}>
            {/* Left: Risk level */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 16px', borderRadius: 99,
                  background: rc.bg, border: `1px solid ${rc.border}`,
                  marginBottom: 14,
                }}>
                  {isLow ? <CheckCircle size={14} color={rc.text} /> : isHigh ? <AlertTriangle size={14} color={rc.text} /> : <Shield size={14} color={rc.text} />}
                  <span style={{ fontSize: 12, fontWeight: 800, color: rc.text, letterSpacing: '0.08em' }}>
                    {risk_category?.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 52, fontWeight: 900, color: rc.text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>
                  <Counter target={default_risk_score} duration={1200} suffix="%" />
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Default Probability</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
                  {isLow
                    ? 'Based on submitted financial data, the model estimates a relatively low probability of default.'
                    : isHigh
                    ? 'Multiple risk indicators suggest an elevated probability of default. Manual review recommended.'
                    : 'Moderate risk indicators detected. Consider additional verification or adjusted loan terms.'}
                </div>
              </motion.div>
            </div>

            {/* Center: Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <RiskGauge score={default_risk_score} level={risk_category} />
              <div style={{
                fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5,
              }}>
                AI Risk Score<br />
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {Math.round(default_risk_score)} / 100
                </span>
              </div>
            </div>

            {/* Right: KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Monthly Payment', value: formatCurrency(monthly_payment), icon: DollarSign, color: '#6366F1' },
                { label: 'Loan-to-Income', value: `${loan_to_income?.toFixed(1)}%`, icon: TrendingDown, color: '#F59E0B' },
                { label: 'Credit Score', value: inputs?.CreditScore, icon: Shield, color: inputs?.CreditScore >= 700 ? '#10B981' : '#EF4444' },
                { label: 'DTI Ratio', value: `${(inputs?.DTIRatio * 100).toFixed(0)}%`, icon: TrendingUp, color: inputs?.DTIRatio < 0.35 ? '#10B981' : '#EF4444' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <Icon size={14} color={color} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUpItem>

      {/* Charts + indicators row */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut chart */}
        <FadeUpItem delay={0.15}>
          <div className="card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Risk Breakdown</div>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={donutData} cx={90} cy={90} innerRadius={55} outerRadius={80}
                  startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  {donutData.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: rc.text }} /> Default Prob.
                </span>
                <span style={{ fontWeight: 700, color: rc.text }}>{default_risk_score?.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.12)' }} /> No Default
                </span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>{(100 - default_risk_score).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </FadeUpItem>

        {/* Financial indicators */}
        <FadeUpItem delay={0.2}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Applicant Financial Indicators</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                Derived from submitted application data — not ML feature weights
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {indicators.map((ind) => (
                <div key={ind.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ind.positive ? <TrendingUp size={13} color="#10B981" /> : <TrendingDown size={13} color="#EF4444" />}
                      {ind.label}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: ind.color }}>{ind.display}</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 7 }}>
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: `${ind.pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${ind.color}aa, ${ind.color})`, height: '100%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUpItem>
      </div>

      {/* Risk flags + recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Risk flags */}
        <FadeUpItem delay={0.25}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Key Risk Flags
            </div>
            {risk_flags?.length > 0 ? risk_flags.map((flag, i) => {
              const flagColor = flag.level === 'high' ? '#EF4444' : flag.level === 'medium' ? '#F59E0B' : '#8B9EC7';
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 9, marginBottom: 6,
                    background: `${flagColor}0A`, border: `1px solid ${flagColor}20`,
                  }}
                >
                  <AlertTriangle size={13} color={flagColor} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                      color: flagColor, letterSpacing: '0.06em', marginRight: 6 }}>{flag.level}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{flag.text}</span>
                  </div>
                </motion.div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                <CheckCircle size={24} color="#10B981" style={{ margin: '0 auto 8px', display: 'block' }} />
                No significant risk flags detected
              </div>
            )}
          </div>
        </FadeUpItem>

        {/* Recommendations */}
        <FadeUpItem delay={0.3}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Underwriting Recommendations
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              Generated by the ML model risk assessment logic
            </div>
            {recommendations?.map((rec, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: i < recommendations.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isLow ? '#10B981' : '#6366F1',
                  marginTop: 6, flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</span>
              </motion.div>
            ))}
          </div>
        </FadeUpItem>
      </div>

      {/* Applicant summary card */}
      <FadeUpItem delay={0.35}>
        <div className="card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color="#6366F1" /> Applicant Profile Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {[
              { label: 'Age', value: inputs?.Age ? `${inputs.Age} yrs` : '—' },
              { label: 'Employment', value: inputs?.EmploymentType || '—' },
              { label: 'Annual Income', value: formatCurrency(inputs?.Income) },
              { label: 'Loan Amount', value: formatCurrency(inputs?.LoanAmount) },
              { label: 'Loan Term', value: inputs?.LoanTerm ? `${inputs.LoanTerm} months` : '—' },
              { label: 'Interest Rate', value: inputs?.InterestRate ? `${inputs.InterestRate}%` : '—' },
              { label: 'Loan Purpose', value: inputs?.LoanPurpose || '—' },
              { label: 'Education', value: inputs?.Education || '—' },
              { label: 'Has Co-Signer', value: inputs?.HasCoSigner || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeUpItem>

      {/* XAI disclaimer */}
      <FadeUpItem delay={0.4}>
        <div style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.14)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <Info size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Explainability Note: </strong>
            The indicators shown above are derived from the submitted application data, not from SHAP or model-level feature importance.
            For full ML explainability, SHAP integration can be added to the backend API. This prediction does not constitute financial advice.
          </div>
        </div>
      </FadeUpItem>

      {/* Action buttons */}
      <FadeUpItem delay={0.45}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/predict')}>
            <PlusCircle size={15} /> New Assessment
          </button>
          <button className="btn btn-secondary" onClick={handleSave}>
            Assessment Saved ✓
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            <HistoryIcon size={15} /> View History
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={15} /> Download Report
          </button>
        </div>
      </FadeUpItem>
    </PageWrapper>
  );
}
