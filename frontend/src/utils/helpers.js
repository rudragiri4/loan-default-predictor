// Utility functions
export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

export function getRiskLevel(score) {
  if (score < 30) return 'Low Risk';
  if (score < 60) return 'Moderate Risk';
  return 'High Risk';
}

export function getRiskColor(level) {
  const l = (level || '').toLowerCase();
  if (l.includes('low')) return { text: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' };
  if (l.includes('mod') || l.includes('medium')) return { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' };
  return { text: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' };
}

export function getRiskGradient(level) {
  const l = (level || '').toLowerCase();
  if (l.includes('low')) return 'linear-gradient(135deg, #10B981, #059669)';
  if (l.includes('mod') || l.includes('medium')) return 'linear-gradient(135deg, #F59E0B, #D97706)';
  return 'linear-gradient(135deg, #EF4444, #DC2626)';
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(iso));
}

export function formatDateShort(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(iso));
}

export function generateId() {
  return `LID-${Math.floor(Math.random() * 90000) + 10000}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function creditScoreLabel(score) {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 600) return 'Poor';
  return 'Very Poor';
}

export function dtiLabel(dti) {
  if (dti < 0.2) return 'Excellent';
  if (dti < 0.35) return 'Good';
  if (dti < 0.45) return 'Acceptable';
  return 'High';
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Feature labels for display
export const FEATURE_LABELS = {
  Age: 'Age',
  Income: 'Annual Income',
  LoanAmount: 'Loan Amount',
  CreditScore: 'Credit Score',
  MonthsEmployed: 'Months Employed',
  NumCreditLines: 'Open Credit Lines',
  InterestRate: 'Interest Rate',
  LoanTerm: 'Loan Term (months)',
  DTIRatio: 'DTI Ratio',
  Education: 'Education',
  EmploymentType: 'Employment Type',
  MaritalStatus: 'Marital Status',
  HasMortgage: 'Has Mortgage',
  HasDependents: 'Has Dependents',
  LoanPurpose: 'Loan Purpose',
  HasCoSigner: 'Has Co-Signer',
};
