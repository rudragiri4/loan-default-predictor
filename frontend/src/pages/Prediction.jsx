import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, User, DollarSign, FileText, Eye, Zap, AlertCircle } from 'lucide-react';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { usePrediction } from '../hooks/usePrediction';
import { useToast } from '../hooks/useToast';
import { predictLoanDefault } from '../services/predictionApi';
import { generateId } from '../utils/helpers';
import AnalysisAnimation from '../components/prediction/AnalysisAnimation';

const STEPS = [
  { id: 1, label: 'Applicant', icon: User },
  { id: 2, label: 'Financial', icon: DollarSign },
  { id: 3, label: 'Loan', icon: FileText },
  { id: 4, label: 'Review', icon: Eye },
];

const DEMO_PRESETS = {
  'Low Risk Applicant': {
    Age: 34, Income: 95000, LoanAmount: 33500, CreditScore: 768,
    MonthsEmployed: 72, NumCreditLines: 3, InterestRate: 5.5,
    LoanTerm: 36, DTIRatio: 0.18, Education: "Master's",
    EmploymentType: 'Full-time', MaritalStatus: 'Married',
    HasMortgage: 'Yes', HasDependents: 'Yes', LoanPurpose: 'Home', HasCoSigner: 'No',
  },
  'Moderate Risk Applicant': {
    Age: 33, Income: 52000, LoanAmount: 60000, CreditScore: 645,
    MonthsEmployed: 22, NumCreditLines: 5, InterestRate: 13.5,
    LoanTerm: 48, DTIRatio: 0.42, Education: "Bachelor's",
    EmploymentType: 'Full-time', MaritalStatus: 'Single',
    HasMortgage: 'No', HasDependents: 'No', LoanPurpose: 'Auto', HasCoSigner: 'No',
  },
  'High Risk Applicant': {
    Age: 21, Income: 22000, LoanAmount: 120000, CreditScore: 490,
    MonthsEmployed: 4, NumCreditLines: 8, InterestRate: 23.5,
    LoanTerm: 60, DTIRatio: 0.72, Education: 'High School',
    EmploymentType: 'Unemployed', MaritalStatus: 'Divorced',
    HasMortgage: 'No', HasDependents: 'Yes', LoanPurpose: 'Business', HasCoSigner: 'No',
  },
};

const INITIAL_FORM = {
  Age: '', Income: '', LoanAmount: '', CreditScore: '',
  MonthsEmployed: '', NumCreditLines: '', InterestRate: '',
  LoanTerm: 36, DTIRatio: '', Education: "Bachelor's",
  EmploymentType: 'Full-time', MaritalStatus: 'Single',
  HasMortgage: 'No', HasDependents: 'No', LoanPurpose: 'Auto', HasCoSigner: 'No',
  model: 'rf',
};

function FieldHint({ text }) {
  return <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{text}</span>;
}

function FormField({ label, required, children, hint, error }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span className="required">*</span>}
      </label>
      {children}
      {hint && <FieldHint text={hint} />}
      {error && <span className="form-error"><AlertCircle size={11} style={{ marginRight: 4, display: 'inline' }} />{error}</span>}
    </div>
  );
}

function SelectField({ value, onChange, name, options }) {
  return (
    <select className="form-select" name={name} value={value} onChange={onChange}>
      {options.map(o => (
        <option key={Array.isArray(o) ? o[0] : o} value={Array.isArray(o) ? o[0] : o}>
          {Array.isArray(o) ? o[1] : o}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(opt => (
        <label key={opt} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 14px', borderRadius: 9, cursor: 'pointer',
          background: value === opt ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
          border: `1px solid ${value === opt ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
          transition: 'all 0.15s',
          fontSize: 13, fontWeight: 500, color: value === opt ? '#6366F1' : 'var(--text-secondary)',
          flex: 1, justifyContent: 'center',
        }}>
          <input type="radio" name={name} value={opt} checked={value === opt}
            onChange={onChange} style={{ display: 'none' }} />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function Prediction() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const navigate = useNavigate();
  const { setResult, setForm: saveForm, addToHistory } = usePrediction();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const loadPreset = (presetName) => {
    setForm({ ...INITIAL_FORM, ...DEMO_PRESETS[presetName] });
    setSelectedPreset(presetName);
    setErrors({});
    toast({ type: 'info', title: 'Demo loaded', message: `${presetName} data has been populated.` });
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.Age || form.Age < 18 || form.Age > 90) e.Age = 'Age must be between 18 and 90';
    }
    if (step === 2) {
      if (!form.Income || form.Income < 1000) e.Income = 'Annual income is required (min $1,000)';
      if (!form.CreditScore || form.CreditScore < 300 || form.CreditScore > 850) e.CreditScore = 'Credit score: 300–850';
      if (!form.DTIRatio || form.DTIRatio < 0 || form.DTIRatio > 1) e.DTIRatio = 'DTI ratio: 0.0–1.0 (e.g. 0.35 for 35%)';
    }
    if (step === 3) {
      if (!form.LoanAmount || form.LoanAmount < 500) e.LoanAmount = 'Loan amount is required (min $500)';
      if (!form.InterestRate || form.InterestRate < 0.5 || form.InterestRate > 35) e.InterestRate = 'Interest rate: 0.5–35%';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 4));
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setAnalyzing(true);
    saveForm(form);
    try {
      const result = await predictLoanDefault(form, form.model);
      if (result.status !== 'success') throw new Error(result.message || 'Prediction failed');
      const entry = {
        ...result,
        id: generateId(),
        date: new Date().toISOString(),
        modelUsed: form.model === 'rf' ? 'Random Forest' : 'Logistic Regression',
      };
      setResult(entry);
      addToHistory(entry);
      navigate('/results');
    } catch (err) {
      setAnalyzing(false);
      toast({
        type: 'error',
        title: 'Prediction failed',
        message: err.message || 'Unable to connect to the prediction service.',
        duration: 6000,
      });
    }
  };

  const progress = ((step - 1) / 3) * 100;

  if (analyzing) return <AnalysisAnimation />;

  return (
    <PageWrapper>
      {/* Header */}
      <FadeUpItem delay={0}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            New Loan Risk Assessment
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Enter applicant information to generate an AI-powered default risk assessment.
          </p>
        </div>
      </FadeUpItem>

      {/* Demo presets */}
      <FadeUpItem delay={0.05}>
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Load demo:
            </span>
            {Object.keys(DEMO_PRESETS).map(name => (
              <button
                key={name}
                className="btn btn-sm"
                onClick={() => loadPreset(name)}
                style={{
                  background: selectedPreset === name ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                  border: `1px solid ${selectedPreset === name ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
                  color: selectedPreset === name ? '#6366F1' : 'var(--text-secondary)',
                }}
              >
                {name}
              </button>
            ))}
            {selectedPreset && (
              <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '2px 8px' }}>DEMO DATA</span>
            )}
          </div>
        </div>
      </FadeUpItem>

      {/* Step indicator */}
      <FadeUpItem delay={0.1}>
        <div className="card" style={{ padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Assessment Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6366F1' }}>
              Step {step} of {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="progress-bar-track" style={{ height: 6, marginBottom: 16 }}>
            <motion.div
              className="progress-bar-fill"
              animate={{ width: `${progress}%` }}
              style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', height: '100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          {/* Step circles */}
          <div style={{ display: 'flex', gap: 0 }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', top: 15, right: '50%', left: '-50%', height: 2,
                      background: done || active ? 'linear-gradient(90deg, #6366F1, #8B5CF6)' : 'var(--border)',
                      transition: 'background 0.4s',
                    }} />
                  )}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', position: 'relative',
                    background: done ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                                : active ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                    border: `2px solid ${done || active ? '#6366F1' : 'var(--border-strong)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s', zIndex: 1,
                  }}>
                    <Icon size={14} color={done ? 'white' : active ? '#6366F1' : 'var(--text-muted)'} />
                  </div>
                  <span style={{
                    fontSize: 11, marginTop: 6, fontWeight: active ? 700 : 500,
                    color: active ? '#6366F1' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                  }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </FadeUpItem>

      {/* Form content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {step === 1 && (
            <div className="card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="#6366F1" /> Applicant Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                <FormField label="Age" required error={errors.Age} hint="Must be between 18 and 90">
                  <input className={`form-input ${errors.Age ? 'error' : ''}`}
                    type="number" name="Age" value={form.Age} onChange={handleChange}
                    placeholder="e.g. 35" min="18" max="90" />
                </FormField>
                <FormField label="Education">
                  <SelectField name="Education" value={form.Education} onChange={handleChange}
                    options={["High School", "Bachelor's", "Master's", "PhD"]} />
                </FormField>
                <FormField label="Marital Status">
                  <SelectField name="MaritalStatus" value={form.MaritalStatus} onChange={handleChange}
                    options={['Single', 'Married', 'Divorced']} />
                </FormField>
                <FormField label="Has Dependents" hint="Do they have financial dependants?">
                  <RadioGroup name="HasDependents" value={form.HasDependents} onChange={handleChange} options={['No', 'Yes']} />
                </FormField>
                <FormField label="Employment Type">
                  <SelectField name="EmploymentType" value={form.EmploymentType} onChange={handleChange}
                    options={['Full-time', 'Part-time', 'Self-employed', 'Unemployed']} />
                </FormField>
                <FormField label="Months Employed" hint="Total months in current/recent employment">
                  <input className="form-input" type="number" name="MonthsEmployed"
                    value={form.MonthsEmployed} onChange={handleChange}
                    placeholder="e.g. 48" min="0" max="600" />
                </FormField>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="#6366F1" /> Financial Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                <FormField label="Annual Income ($)" required error={errors.Income} hint="Gross annual income in USD">
                  <input className={`form-input ${errors.Income ? 'error' : ''}`}
                    type="number" name="Income" value={form.Income} onChange={handleChange}
                    placeholder="e.g. 75000" min="1000" />
                </FormField>
                <FormField label="Credit Score" required error={errors.CreditScore} hint="FICO score (300–850)">
                  <input className={`form-input ${errors.CreditScore ? 'error' : ''}`}
                    type="number" name="CreditScore" value={form.CreditScore} onChange={handleChange}
                    placeholder="e.g. 720" min="300" max="850" />
                </FormField>
                <FormField label="DTI Ratio" required error={errors.DTIRatio}
                  hint="Debt-to-income ratio (0.0–1.0). E.g. 0.35 means 35% of income goes to debt">
                  <input className={`form-input ${errors.DTIRatio ? 'error' : ''}`}
                    type="number" name="DTIRatio" value={form.DTIRatio} onChange={handleChange}
                    placeholder="e.g. 0.35" min="0" max="1" step="0.01" />
                </FormField>
                <FormField label="Open Credit Lines" hint="Number of currently open credit accounts">
                  <input className="form-input" type="number" name="NumCreditLines"
                    value={form.NumCreditLines} onChange={handleChange}
                    placeholder="e.g. 3" min="1" max="15" />
                </FormField>
                <FormField label="Has Mortgage" hint="Does the applicant currently have a mortgage?">
                  <RadioGroup name="HasMortgage" value={form.HasMortgage} onChange={handleChange} options={['No', 'Yes']} />
                </FormField>
                <FormField label="Has Co-Signer" hint="Is there a co-signer on this loan?">
                  <RadioGroup name="HasCoSigner" value={form.HasCoSigner} onChange={handleChange} options={['No', 'Yes']} />
                </FormField>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#6366F1" /> Loan Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                <FormField label="Loan Amount ($)" required error={errors.LoanAmount} hint="Total requested loan amount">
                  <input className={`form-input ${errors.LoanAmount ? 'error' : ''}`}
                    type="number" name="LoanAmount" value={form.LoanAmount} onChange={handleChange}
                    placeholder="e.g. 50000" min="500" />
                </FormField>
                <FormField label="Interest Rate (%)" required error={errors.InterestRate} hint="Annual interest rate (APR)">
                  <input className={`form-input ${errors.InterestRate ? 'error' : ''}`}
                    type="number" name="InterestRate" value={form.InterestRate} onChange={handleChange}
                    placeholder="e.g. 8.5" min="0.5" max="35" step="0.25" />
                </FormField>
                <FormField label="Loan Term (months)" hint="Repayment duration in months">
                  <SelectField name="LoanTerm" value={form.LoanTerm} onChange={handleChange}
                    options={[[12,'12 months (1 yr)'], [24,'24 months (2 yr)'], [36,'36 months (3 yr)'], [48,'48 months (4 yr)'], [60,'60 months (5 yr)']]} />
                </FormField>
                <FormField label="Loan Purpose" hint="Primary purpose for taking this loan">
                  <SelectField name="LoanPurpose" value={form.LoanPurpose} onChange={handleChange}
                    options={['Auto', 'Business', 'Education', 'Home', 'Other']} />
                </FormField>
                <FormField label="AI Model" hint="Choose between Random Forest (higher accuracy) or Logistic Regression (faster)">
                  <SelectField name="model" value={form.model} onChange={handleChange}
                    options={[['rf', 'Random Forest (Recommended)'], ['lr', 'Logistic Regression']]} />
                </FormField>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} color="#6366F1" /> Review & Confirm
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  { section: 'Applicant', fields: [
                    ['Age', form.Age ? `${form.Age} years` : '—'],
                    ['Education', form.Education],
                    ['Marital Status', form.MaritalStatus],
                    ['Has Dependents', form.HasDependents],
                    ['Employment Type', form.EmploymentType],
                    ['Months Employed', form.MonthsEmployed ? `${form.MonthsEmployed} mo` : '—'],
                  ]},
                  { section: 'Financial', fields: [
                    ['Annual Income', form.Income ? `$${Number(form.Income).toLocaleString()}` : '—'],
                    ['Credit Score', form.CreditScore || '—'],
                    ['DTI Ratio', form.DTIRatio ? `${(form.DTIRatio * 100).toFixed(0)}%` : '—'],
                    ['Credit Lines', form.NumCreditLines || '—'],
                    ['Has Mortgage', form.HasMortgage],
                    ['Has Co-Signer', form.HasCoSigner],
                  ]},
                  { section: 'Loan', fields: [
                    ['Loan Amount', form.LoanAmount ? `$${Number(form.LoanAmount).toLocaleString()}` : '—'],
                    ['Interest Rate', form.InterestRate ? `${form.InterestRate}%` : '—'],
                    ['Loan Term', `${form.LoanTerm} months`],
                    ['Loan Purpose', form.LoanPurpose],
                    ['AI Model', form.model === 'rf' ? 'Random Forest' : 'Logistic Regression'],
                  ]},
                ].map(({ section, fields }) => (
                  <div key={section}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', letterSpacing: '0.06em',
                      textTransform: 'uppercase', marginBottom: 10 }}>{section}</div>
                    {fields.map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                        padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Info notice */}
              <div style={{
                marginTop: 20, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: '#93C5FD',
              }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                This prediction is generated by a machine learning model for educational purposes only.
                It does not constitute financial advice or a credit decision.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <FadeUpItem delay={0.2}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button
            className="btn btn-secondary"
            onClick={step === 1 ? () => {} : handleBack}
            disabled={step === 1}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ minWidth: 200, justifyContent: 'center' }}
            >
              <Zap size={18} /> Analyze Loan Risk
            </motion.button>
          )}
        </div>
      </FadeUpItem>
    </PageWrapper>
  );
}
