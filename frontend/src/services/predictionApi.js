// API service for Loan Default Prediction backend
// Flask backend running at http://localhost:5000
// All endpoints proxied via /api through Vite dev server

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEMO_MODE_KEY = 'riskai_demo_mode';

export function isDemoMode() {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}
export function setDemoMode(val) {
  localStorage.setItem(DEMO_MODE_KEY, val ? 'true' : 'false');
  window.dispatchEvent(new Event('demo-mode-change'));
}

// ─── Demo Responses ──────────────────────────────────────────────────────────
const DEMO_RESPONSES = {
  low: {
    status: 'success',
    prediction: 0,
    default_risk_score: 12.4,
    risk_category: 'Low Risk',
    monthly_payment: 892.34,
    loan_to_income: 35.3,
    risk_flags: [
      { level: 'low', text: 'No Co-Signer provided' }
    ],
    recommendations: [
      'Approved for prime low-interest rate tier.',
      'Fast-track automated underwriting approved.',
      'Offer 0.25% APR discount for automatic monthly payments.'
    ],
    inputs: {
      Age: 34, Income: 95000, LoanAmount: 33500, CreditScore: 768,
      MonthsEmployed: 72, NumCreditLines: 3, InterestRate: 5.5,
      LoanTerm: 36, DTIRatio: 0.18, Education: "Master's",
      EmploymentType: 'Full-time', MaritalStatus: 'Married',
      HasMortgage: 'Yes', HasDependents: 'Yes', LoanPurpose: 'Home',
      HasCoSigner: 'No'
    }
  },
  moderate: {
    status: 'success',
    prediction: 0,
    default_risk_score: 38.7,
    risk_category: 'Moderate Risk',
    monthly_payment: 1423.11,
    loan_to_income: 115.4,
    risk_flags: [
      { level: 'medium', text: 'Fair Credit Score (645 FICO)' },
      { level: 'low', text: 'No Co-Signer provided' },
      { level: 'medium', text: 'High Interest Rate (13.5%)' }
    ],
    recommendations: [
      'Require an eligible Co-Signer with FICO > 720 to mitigate risk.',
      'Reduce requested loan amount from $60,000 to $42,000.',
      'Extend loan term to lower monthly payment burden.',
      'Request 15% upfront cash deposit / collateral.'
    ],
    inputs: {
      Age: 33, Income: 52000, LoanAmount: 60000, CreditScore: 645,
      MonthsEmployed: 22, NumCreditLines: 5, InterestRate: 13.5,
      LoanTerm: 48, DTIRatio: 0.42, Education: "Bachelor's",
      EmploymentType: 'Full-time', MaritalStatus: 'Single',
      HasMortgage: 'No', HasDependents: 'No', LoanPurpose: 'Auto',
      HasCoSigner: 'No'
    }
  },
  high: {
    status: 'success',
    prediction: 1,
    default_risk_score: 78.3,
    risk_category: 'High Risk',
    monthly_payment: 3184.72,
    loan_to_income: 545.5,
    risk_flags: [
      { level: 'high', text: 'Subprime Credit Score (490 FICO)' },
      { level: 'high', text: 'Elevated DTI Ratio (72.0%)' },
      { level: 'high', text: 'Applicant is currently Unemployed' },
      { level: 'medium', text: 'High Loan-to-Income Ratio (545.5%)' },
      { level: 'low', text: 'No Co-Signer provided' },
      { level: 'medium', text: 'High Interest Rate (23.5%)' }
    ],
    recommendations: [
      'Require an eligible Co-Signer with FICO > 720 to mitigate risk.',
      'Reduce requested loan amount from $120,000 to $84,000.',
      'Extend loan term to lower monthly payment burden.',
      'Request 15% upfront cash deposit / collateral.'
    ],
    inputs: {
      Age: 21, Income: 22000, LoanAmount: 120000, CreditScore: 490,
      MonthsEmployed: 4, NumCreditLines: 8, InterestRate: 23.5,
      LoanTerm: 60, DTIRatio: 0.72, Education: 'High School',
      EmploymentType: 'Unemployed', MaritalStatus: 'Divorced',
      HasMortgage: 'No', HasDependents: 'Yes', LoanPurpose: 'Business',
      HasCoSigner: 'No'
    }
  }
};

const DEMO_MODEL_INFO = {
  status: 'success',
  model_name: 'Random Forest Classifier (Ensemble)',
  accuracy: 0.887,
  auc_score: 0.762,
  total_samples: 255347,
  feature_importance: [
    { feature: 'CreditScore', importance: 0.198 },
    { feature: 'DTIRatio', importance: 0.167 },
    { feature: 'InterestRate', importance: 0.142 },
    { feature: 'Income', importance: 0.118 },
    { feature: 'LoanAmount', importance: 0.097 },
    { feature: 'MonthsEmployed', importance: 0.079 },
    { feature: 'Age', importance: 0.062 },
    { feature: 'NumCreditLines', importance: 0.048 },
    { feature: 'LoanTerm', importance: 0.041 },
    { feature: 'EmploymentType', importance: 0.028 },
    { feature: 'Education', importance: 0.009 },
    { feature: 'MaritalStatus', importance: 0.005 },
    { feature: 'HasMortgage', importance: 0.003 },
    { feature: 'HasDependents', importance: 0.002 },
    { feature: 'LoanPurpose', importance: 0.001 },
    { feature: 'HasCoSigner', importance: 0.000 },
  ]
};

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run loan default prediction.
 * @param {object} formData - Form fields matching model inputs
 * @param {string} modelChoice - 'rf' (Random Forest) or 'lr' (Logistic Regression)
 */
export async function predictLoanDefault(formData, modelChoice = 'rf') {
  if (isDemoMode()) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1800));
    const score = Number(formData.CreditScore || 700);
    const dti = Number(formData.DTIRatio || 0.3);
    const emp = formData.EmploymentType || 'Full-time';
    if (emp === 'Unemployed' || score < 550 || dti > 0.6) return DEMO_RESPONSES.high;
    if (score < 680 || dti > 0.4) return DEMO_RESPONSES.moderate;
    return DEMO_RESPONSES.low;
  }

  const payload = {
    ...formData,
    model: modelChoice,
    Age: Number(formData.Age),
    Income: Number(formData.Income),
    LoanAmount: Number(formData.LoanAmount),
    CreditScore: Number(formData.CreditScore),
    MonthsEmployed: Number(formData.MonthsEmployed),
    NumCreditLines: Number(formData.NumCreditLines),
    InterestRate: Number(formData.InterestRate),
    LoanTerm: Number(formData.LoanTerm),
    DTIRatio: Number(formData.DTIRatio),
  };
  return apiPost('/api/predict', payload);
}

/** Fetch model info + feature importances */
export async function fetchModelInfo() {
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 500));
    return DEMO_MODEL_INFO;
  }
  return apiGet('/api/model-info');
}

/** Health check — does the backend respond? */
export async function checkApiHealth() {
  if (isDemoMode()) return { online: true, demo: true };
  try {
    await apiGet('/api/model-info');
    return { online: true };
  } catch {
    return { online: false };
  }
}

/** Fetch sample dataset records (paginated) */
export async function fetchSampleDataset({ page = 1, limit = 10, search = '', risk = 'all' } = {}) {
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 400));
    return generateMockHistory(page, limit, search, risk);
  }
  return apiGet(`/api/sample-dataset?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&risk=${risk}`);
}

// ─── Mock history generator (demo mode) ──────────────────────────────────────
function generateMockHistory(page, limit, search, riskFilter) {
  const names = ['Alice M.', 'Bob K.', 'Carol S.', 'David L.', 'Emma W.',
                  'Frank R.', 'Grace H.', 'Hank P.', 'Iris T.', 'Jack N.',
                  'Karen O.', 'Leo Q.', 'Mia F.', 'Noah G.', 'Olivia A.',
                  'Paul C.', 'Quinn B.', 'Rose D.', 'Sam E.', 'Tina J.'];
  const educations = ["High School", "Bachelor's", "Master's", "PhD"];
  const employments = ['Full-time', 'Part-time', 'Self-employed', 'Unemployed'];
  const levels = ['Low Risk', 'Low Risk', 'Low Risk', 'Moderate Risk', 'Moderate Risk', 'High Risk'];

  const allRecords = Array.from({ length: 60 }, (_, i) => {
    const riskLevel = levels[Math.floor(Math.random() * levels.length)];
    const score = riskLevel === 'Low Risk' ? Math.floor(Math.random() * 30) + 5
                : riskLevel === 'Moderate Risk' ? Math.floor(Math.random() * 30) + 30
                : Math.floor(Math.random() * 35) + 60;
    return {
      id: `LID-${1000 + i}`,
      age: Math.floor(Math.random() * 45) + 22,
      income: Math.floor(Math.random() * 150000) + 25000,
      loanAmount: Math.floor(Math.random() * 200000) + 10000,
      creditScore: riskLevel === 'Low Risk' ? Math.floor(Math.random() * 150) + 680
                 : riskLevel === 'Moderate Risk' ? Math.floor(Math.random() * 80) + 600
                 : Math.floor(Math.random() * 100) + 450,
      interestRate: parseFloat((Math.random() * 20 + 3).toFixed(2)),
      loanTerm: [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)],
      education: educations[Math.floor(Math.random() * educations.length)],
      employment: employments[Math.floor(Math.random() * employments.length)],
      defaultStatus: riskLevel === 'High Risk' ? 'Default' : 'Repaid',
      riskLevel,
      riskScore: score,
      name: names[i % names.length],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString()
    };
  });

  let filtered = allRecords;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(r =>
      r.id.toLowerCase().includes(s) ||
      r.name.toLowerCase().includes(s) ||
      r.education.toLowerCase().includes(s)
    );
  }
  if (riskFilter !== 'all') {
    filtered = filtered.filter(r =>
      r.riskLevel.toLowerCase().replace(' ', '') === riskFilter.toLowerCase().replace(' ', '')
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    status: 'success', page, limit,
    total_records: total, total_pages: totalPages,
    data: filtered.slice(start, start + limit)
  };
}

export { DEMO_RESPONSES };
