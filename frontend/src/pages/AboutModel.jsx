import { motion } from 'framer-motion';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { Database, Cpu, BarChart3, ArrowDown, Brain, FileText, Zap, Shield } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: FileText, label: 'Applicant Data', desc: 'Age, income, credit score, DTI, employment, loan details...', color: '#6366F1' },
  { icon: Database, label: 'Preprocessing', desc: 'Label encoding of categorical variables, feature scaling via StandardScaler', color: '#8B5CF6' },
  { icon: Cpu, label: 'Feature Engineering', desc: '16 features extracted: 9 numeric + 7 encoded categorical', color: '#06B6D4' },
  { icon: Brain, label: 'ML Model', desc: 'Random Forest Classifier (500 trees) or Logistic Regression — your choice', color: '#10B981' },
  { icon: BarChart3, label: 'Risk Probability', desc: 'predict_proba() returns P(default) as a percentage', color: '#F59E0B' },
  { icon: Zap, label: 'Prediction', desc: 'Low / Moderate / High risk classification with threshold logic', color: '#EF4444' },
];

function PipelineStep({ step, index, total }) {
  const Icon = step.icon;
  return (
    <FadeUpItem delay={0.1 + index * 0.08}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <motion.div
          whileHover={{ scale: 1.05, y: -3 }}
          style={{
            width: '100%', padding: '18px 16px', borderRadius: 14,
            background: `${step.color}0F`, border: `1px solid ${step.color}28`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10,
            cursor: 'default',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${step.color}18`, border: `1px solid ${step.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={step.color} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{step.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
          </div>
        </motion.div>
        {index < total - 1 && (
          <div style={{ marginTop: 8 }}>
            <ArrowDown size={18} color="var(--text-muted)" />
          </div>
        )}
      </div>
    </FadeUpItem>
  );
}

const FEATURES = [
  { name: 'Age', type: 'Numeric', desc: 'Applicant age (18–90)' },
  { name: 'Income', type: 'Numeric', desc: 'Annual gross income (USD)' },
  { name: 'LoanAmount', type: 'Numeric', desc: 'Requested loan amount (USD)' },
  { name: 'CreditScore', type: 'Numeric', desc: 'FICO credit score (300–850)' },
  { name: 'MonthsEmployed', type: 'Numeric', desc: 'Total months in employment' },
  { name: 'NumCreditLines', type: 'Numeric', desc: 'Open credit accounts' },
  { name: 'InterestRate', type: 'Numeric', desc: 'APR interest rate (%)' },
  { name: 'LoanTerm', type: 'Numeric', desc: 'Loan duration in months' },
  { name: 'DTIRatio', type: 'Numeric', desc: 'Debt-to-income ratio (0–1)' },
  { name: 'Education', type: 'Categorical', desc: 'High School / Bachelor\'s / Master\'s / PhD' },
  { name: 'EmploymentType', type: 'Categorical', desc: 'Full-time / Part-time / Self-employed / Unemployed' },
  { name: 'MaritalStatus', type: 'Categorical', desc: 'Single / Married / Divorced' },
  { name: 'HasMortgage', type: 'Categorical', desc: 'Yes / No' },
  { name: 'HasDependents', type: 'Categorical', desc: 'Yes / No' },
  { name: 'LoanPurpose', type: 'Categorical', desc: 'Auto / Business / Education / Home / Other' },
  { name: 'HasCoSigner', type: 'Categorical', desc: 'Yes / No' },
];

export default function AboutModel() {
  return (
    <PageWrapper>
      <FadeUpItem delay={0}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            About the Model
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            How this AI-powered loan default prediction system works
          </p>
        </div>
      </FadeUpItem>

      {/* What is loan default? */}
      <FadeUpItem delay={0.05}>
        <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            What is Loan Default Prediction?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 12 }}>
            Loan default prediction is a machine learning application that estimates the probability that a borrower
            will fail to repay a loan. By analyzing applicant financial data, the model helps lenders assess credit
            risk before approving or declining loan applications.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            This system uses a <strong style={{ color: 'var(--text-primary)' }}>Random Forest Classifier</strong> trained on
            255,347 applicant records from the Loan_default.csv dataset. It achieves <strong style={{ color: '#10B981' }}>88.7% accuracy</strong> and
            a <strong style={{ color: '#6366F1' }}>0.762 AUC-ROC score</strong>.
          </p>
        </div>
      </FadeUpItem>

      {/* Pipeline */}
      <FadeUpItem delay={0.1}>
        <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            How the System Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 420, margin: '0 auto' }}>
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep key={step.label} step={step} index={i} total={PIPELINE_STEPS.length} />
            ))}
          </div>
        </div>
      </FadeUpItem>

      {/* Feature table */}
      <FadeUpItem delay={0.15}>
        <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Input Features (16 total)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
            Exact fields used by the ML model — these must match the API request body exactly.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Feature', 'Type', 'Description'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px',
                      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.name} style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8B5CF6', fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 600,
                        background: f.type === 'Numeric' ? 'rgba(6,182,212,0.1)' : 'rgba(99,102,241,0.1)',
                        color: f.type === 'Numeric' ? '#06B6D4' : '#6366F1',
                        border: `1px solid ${f.type === 'Numeric' ? 'rgba(6,182,212,0.2)' : 'rgba(99,102,241,0.2)'}`,
                      }}>{f.type}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeUpItem>

      {/* Risk thresholds */}
      <FadeUpItem delay={0.2}>
        <div className="card" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Risk Classification Thresholds
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { level: 'Low Risk', range: '< 20%', desc: 'Approved — prime rate tier eligible', color: '#10B981', action: 'Approved' },
              { level: 'Moderate Risk', range: '20% – 47.5%', desc: 'Borderline — co-signer or adjusted terms recommended', color: '#F59E0B', action: 'Review' },
              { level: 'High Risk', range: '≥ 47.5%', desc: 'Elevated default probability — manual review required', color: '#EF4444', action: 'Declined' },
            ].map(({ level, range, desc, color, action }) => (
              <div key={level} style={{
                padding: '18px 20px', borderRadius: 12,
                background: `${color}0A`, border: `1px solid ${color}28`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: color, letterSpacing: '0.06em', marginBottom: 6 }}>
                  {action.toUpperCase()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{level}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: color, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>{range}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', padding: '10px 14px',
            borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <Shield size={12} color="#6366F1" style={{ display: 'inline', marginRight: 6 }} />
            Threshold of 0.25 (25%) is used as the base — adjusted × 0.8 for Low and × 1.6 for Moderate as configured in server.py
          </div>
        </div>
      </FadeUpItem>
    </PageWrapper>
  );
}
