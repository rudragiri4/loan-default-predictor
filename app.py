import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

st.set_page_config(
    page_title="Loan Default Predictor",
    page_icon="$",
    layout="centered",
    initial_sidebar_state="collapsed"
)

st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
    background-color: #0d0d0d;
    color: #e8e8e8;
  }
  .stApp { background-color: #0d0d0d; }
  #MainMenu, footer, header { visibility: hidden; }
  div.block-container { padding: 2.5rem 1.5rem 3rem; max-width: 760px; margin: auto; }
  h1 { font-size: 1.55rem !important; font-weight: 600 !important; color: #f0f0f0 !important;
       letter-spacing: -0.02em; margin-bottom: 0.15rem !important; }
  .sub { font-size: 0.85rem; color: #666; margin-bottom: 2.2rem; }
  hr { border: none; border-top: 1px solid #1e1e1e; margin: 1.8rem 0; }
  .section-label {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #555; margin-bottom: 0.9rem;
  }
  div[data-baseweb="input"] > div,
  div[data-baseweb="base-input"] > div,
  div[data-baseweb="input"] input,
  div[data-baseweb="base-input"] input {
    background-color: #141414 !important;
    border-color: #2a2a2a !important;
    color: #e8e8e8 !important;
    border-radius: 8px !important;
  }
  div[data-baseweb="input"]:focus-within > div { border-color: #4f8dff !important; }
  div[data-baseweb="select"] > div {
    background-color: #141414 !important;
    border-color: #2a2a2a !important;
    color: #e8e8e8 !important;
    border-radius: 8px !important;
  }
  div[data-baseweb="select"] * { color: #e8e8e8 !important; }
  div[data-baseweb="popover"] { background-color: #1a1a1a !important; }
  li[role="option"] { background-color: #1a1a1a !important; color: #e8e8e8 !important; }
  li[role="option"]:hover { background-color: #222 !important; }
  .stTextInput label, .stNumberInput label, .stSelectbox label, .stSlider label, .stRadio label {
    font-size: 0.82rem !important; font-weight: 500 !important; color: #a0a0a0 !important;
  }
  div[data-testid="stSlider"] div[role="slider"] {
    background-color: #4f8dff !important; border-color: #4f8dff !important;
  }
  div[data-testid="stSlider"] [data-baseweb="slider"] > div > div > div {
    background-color: #4f8dff !important;
  }
  .stButton > button {
    background-color: #f0f0f0 !important;
    color: #0d0d0d !important;
    font-weight: 600 !important;
    font-size: 0.88rem !important;
    border-radius: 8px !important;
    border: none !important;
    padding: 0.6rem 1.4rem !important;
    transition: background 0.2s ease, transform 0.15s ease !important;
    width: 100% !important;
  }
  .stButton > button:hover {
    background-color: #ffffff !important;
    transform: translateY(-1px) !important;
  }
  .result-card {
    border-radius: 12px;
    padding: 1.5rem 1.8rem;
    margin-top: 1.6rem;
    border: 1px solid;
  }
  .result-approved { background: #0a1a0e; border-color: #1e4d28; }
  .result-moderate { background: #1a1400; border-color: #4d3a00; }
  .result-rejected { background: #1a0808; border-color: #4d1515; }
  .result-label {
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .result-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.3rem; }
  .result-desc { font-size: 0.83rem; color: #999; line-height: 1.55; margin-bottom: 1rem; }
  .risk-score-display {
    display: inline-block; font-size: 2.8rem; font-weight: 300;
    letter-spacing: -0.03em; line-height: 1;
  }
  .risk-score-unit { font-size: 1rem; color: #666; margin-left: 0.2rem; }
  .factor-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1rem; }
  .pill { font-size: 0.76rem; font-weight: 500; padding: 4px 10px; border-radius: 20px; border: 1px solid; }
  .pill-bad  { background: #1a0808; color: #f87171; border-color: #4d1515; }
  .pill-warn { background: #1a1200; color: #fbbf24; border-color: #4d3500; }
  .pill-good { background: #081a0d; color: #4ade80; border-color: #1a4d28; }
  .kpi-row { display: flex; gap: 16px; margin: 1.2rem 0; }
  .kpi-item { flex: 1; background: #141414; border: 1px solid #1e1e1e;
              border-radius: 8px; padding: 0.9rem 1rem; }
  .kpi-val { font-size: 1.25rem; font-weight: 500; color: #f0f0f0; }
  .kpi-lbl { font-size: 0.72rem; color: #555; margin-top: 2px; text-transform: uppercase;
             letter-spacing: 0.06em; }
  div[data-testid="stRadio"] > div { flex-direction: row; gap: 12px; }
  div[data-testid="stRadio"] label { font-size: 0.82rem !important; color: #a0a0a0 !important; }
</style>
""", unsafe_allow_html=True)

# Load model artifacts
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

@st.cache_resource
def load_artifacts():
    try:
        models = {}
        bp = os.path.join(MODEL_DIR, "best_model.pkl")
        lp = os.path.join(MODEL_DIR, "logistic_regression_model.pkl")
        if os.path.exists(bp):
            models["Random Forest"] = joblib.load(bp)
        if os.path.exists(lp):
            models["Logistic Regression"] = joblib.load(lp)
        scaler   = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))
        features = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
        return models, scaler, encoders, features
    except Exception as e:
        st.error(f"Could not load model: {e}")
        return None, None, None, None

models, scaler, encoders, features = load_artifacts()

if not models:
    st.warning("Model files not found in `saved_models/`. Please train the model first.")
    st.stop()

# Header
st.markdown("<h1>Loan Default Predictor</h1>", unsafe_allow_html=True)
st.markdown('<p class="sub">Enter applicant details to estimate default probability.</p>', unsafe_allow_html=True)

# Quick preset
preset = st.selectbox(
    "Quick profile",
    ["Custom", "Low Risk", "Moderate Risk", "High Risk"],
    label_visibility="collapsed"
)

dv = dict(
    age=40, income=75000, loan_amount=45000, credit_score=720,
    months_emp=48, num_credit=3, interest=7.5, term=36, dti=0.28,
    edu="Bachelor's", emp="Full-time", marital="Married",
    mortgage="Yes", dependents="No", purpose="Home", cosigner="Yes"
)
if preset == "Low Risk":
    dv.update(age=46, income=135000, loan_amount=25000, credit_score=820, months_emp=110,
              num_credit=2, interest=4.75, term=36, dti=0.15, edu="Master's",
              emp="Full-time", marital="Married", mortgage="Yes", dependents="Yes",
              purpose="Home", cosigner="Yes")
elif preset == "Moderate Risk":
    dv.update(age=33, income=52000, loan_amount=60000, credit_score=645, months_emp=22,
              num_credit=5, interest=13.5, term=48, dti=0.42, edu="Bachelor's",
              emp="Full-time", marital="Single", mortgage="No", dependents="No",
              purpose="Auto", cosigner="No")
elif preset == "High Risk":
    dv.update(age=21, income=22000, loan_amount=120000, credit_score=490, months_emp=4,
              num_credit=8, interest=23.5, term=60, dti=0.72, edu="High School",
              emp="Unemployed", marital="Divorced", mortgage="No", dependents="Yes",
              purpose="Business", cosigner="No")

st.markdown("<hr>", unsafe_allow_html=True)

edu_opts  = ["High School", "Bachelor's", "Master's", "PhD"]
emp_opts  = ["Full-time", "Part-time", "Self-employed", "Unemployed"]
mar_opts  = ["Single", "Married", "Divorced"]
pur_opts  = ["Auto", "Business", "Education", "Home", "Other"]
term_opts = [12, 24, 36, 48, 60]

c1, c2 = st.columns(2)

with c1:
    st.markdown('<div class="section-label">Applicant</div>', unsafe_allow_html=True)
    age        = st.slider("Age", 18, 90, dv["age"], key="age")
    education  = st.selectbox("Education", edu_opts, index=edu_opts.index(dv["edu"]), key="edu")
    marital    = st.selectbox("Marital status", mar_opts, index=mar_opts.index(dv["marital"]), key="marital")
    dependents = st.radio("Dependents", ["No", "Yes"], index=0 if dv["dependents"] == "No" else 1, horizontal=True, key="deps")

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="section-label">Employment</div>', unsafe_allow_html=True)
    employment      = st.selectbox("Employment", emp_opts, index=emp_opts.index(dv["emp"]), key="emp")
    months_employed = st.number_input("Months employed", 0, 600, dv["months_emp"], key="months")
    income          = st.number_input("Annual income ($)", 5000, 500000, dv["income"], step=2500, key="income")

with c2:
    st.markdown('<div class="section-label">Financials</div>', unsafe_allow_html=True)
    credit_score = st.slider("Credit score", 300, 850, dv["credit_score"], key="cs")
    num_credit   = st.slider("Open credit lines", 1, 15, dv["num_credit"], key="nc")
    dti_ratio    = st.slider("DTI ratio", 0.0, 1.0, float(dv["dti"]), 0.01, key="dti")

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="section-label">Loan</div>', unsafe_allow_html=True)
    loan_amount   = st.number_input("Loan amount ($)", 1000, 500000, dv["loan_amount"], step=2500, key="la")
    interest_rate = st.slider("Interest rate (%)", 1.0, 30.0, float(dv["interest"]), 0.25, key="ir")
    loan_term     = st.selectbox("Term (months)", term_opts, index=term_opts.index(dv["term"]), key="term")
    purpose       = st.selectbox("Purpose", pur_opts, index=pur_opts.index(dv["purpose"]), key="purpose")
    mortgage      = st.radio("Has mortgage", ["No", "Yes"], index=0 if dv["mortgage"] == "No" else 1, horizontal=True, key="mort")
    cosigner      = st.radio("Has co-signer", ["No", "Yes"], index=0 if dv["cosigner"] == "No" else 1, horizontal=True, key="co")

st.markdown("<hr>", unsafe_allow_html=True)

model_name   = st.selectbox("Model", list(models.keys()), label_visibility="collapsed", key="model_sel")
active_model = models[model_name]
threshold    = 0.25

st.button("Run prediction", key="btn_predict")

# Live prediction
try:
    def enc(col, val):
        return encoders[col].transform([val])[0] if val in encoders[col].classes_ else 0

    input_data = {
        'Age':            float(age),
        'Income':         float(income),
        'LoanAmount':     float(loan_amount),
        'CreditScore':    int(credit_score),
        'MonthsEmployed': int(months_employed),
        'NumCreditLines': int(num_credit),
        'InterestRate':   float(interest_rate),
        'LoanTerm':       int(loan_term),
        'DTIRatio':       float(dti_ratio),
        'Education':      enc('Education', education),
        'EmploymentType': enc('EmploymentType', employment),
        'MaritalStatus':  enc('MaritalStatus', marital),
        'HasMortgage':    enc('HasMortgage', mortgage),
        'HasDependents':  enc('HasDependents', dependents),
        'LoanPurpose':    enc('LoanPurpose', purpose),
        'HasCoSigner':    enc('HasCoSigner', cosigner),
    }

    input_df     = pd.DataFrame([input_data])[features]
    input_scaled = scaler.transform(input_df)
    prob         = float(active_model.predict_proba(input_scaled)[0][1])
    pct          = prob * 100.0

    r = (interest_rate / 100) / 12
    monthly = (loan_amount * r * ((1 + r) ** loan_term)) / (((1 + r) ** loan_term) - 1) if r > 0 else loan_amount / loan_term
    lti = (loan_amount / income) * 100

    if prob < threshold * 0.8:
        tier_label = "Low risk - Approved"
        tier_desc  = "Applicant shows strong creditworthiness. Eligible for standard rates."
        card_cls   = "result-approved"
        label_col  = "#4ade80"
    elif prob < threshold * 1.6:
        tier_label = "Moderate risk - Review"
        tier_desc  = "Borderline risk profile. Consider co-signer verification or adjusted terms."
        card_cls   = "result-moderate"
        label_col  = "#fbbf24"
    else:
        tier_label = "High risk - Declined"
        tier_desc  = "Default probability exceeds acceptable threshold. Manual review required."
        card_cls   = "result-rejected"
        label_col  = "#f87171"

    st.markdown(f"""
    <div class="kpi-row">
      <div class="kpi-item">
        <div class="kpi-val">${monthly:,.0f}</div>
        <div class="kpi-lbl">Monthly payment</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-val">{lti:.1f}%</div>
        <div class="kpi-lbl">Loan-to-income</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-val">{credit_score}</div>
        <div class="kpi-lbl">Credit score</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-val">{dti_ratio*100:.0f}%</div>
        <div class="kpi-lbl">DTI ratio</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class="result-card {card_cls}">
      <div class="result-label" style="color:{label_col}">{tier_label}</div>
      <div class="result-title" style="color:{label_col}">
        <span class="risk-score-display">{pct:.1f}</span><span class="risk-score-unit">% default risk</span>
      </div>
      <div class="result-desc">{tier_desc}</div>
    </div>
    """, unsafe_allow_html=True)

    pills = []
    if credit_score >= 750:
        pills.append('<span class="pill pill-good">Strong credit</span>')
    elif credit_score < 620:
        pills.append('<span class="pill pill-bad">Subprime credit</span>')
    if dti_ratio > 0.45:
        pills.append('<span class="pill pill-bad">High DTI</span>')
    elif dti_ratio < 0.25:
        pills.append('<span class="pill pill-good">Low DTI</span>')
    if employment == "Unemployed":
        pills.append('<span class="pill pill-bad">Unemployed</span>')
    elif months_employed >= 60:
        pills.append('<span class="pill pill-good">Stable employment</span>')
    if lti > 150:
        pills.append('<span class="pill pill-warn">High loan-to-income</span>')
    if cosigner == "Yes":
        pills.append('<span class="pill pill-good">Co-signer</span>')
    else:
        pills.append('<span class="pill pill-warn">No co-signer</span>')
    if interest_rate > 16:
        pills.append('<span class="pill pill-bad">High interest rate</span>')
    if mortgage == "Yes":
        pills.append('<span class="pill pill-warn">Existing mortgage</span>')

    st.markdown('<div class="factor-row">' + ''.join(pills) + '</div>', unsafe_allow_html=True)

except Exception as e:
    st.error(f"Prediction error: {e}")
