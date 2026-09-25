import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "public"), static_url_path="")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

# Load model artifacts
try:
    rf_model = joblib.load(os.path.join(MODEL_DIR, "best_model.pkl"))
    lr_model = joblib.load(os.path.join(MODEL_DIR, "logistic_regression_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))
    feature_cols = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    print("[OK] All AI model artifacts loaded successfully!")
except Exception as e:
    print(f"[ERROR] Error loading artifacts: {e}")
    rf_model, lr_model, scaler, encoders, feature_cols = None, None, None, None, None

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route("/", defaults={"path": ""}, methods=["OPTIONS"])
@app.route("/<path:path>", methods=["OPTIONS"])
def handle_options(path=""):
    return "", 204

FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path.startswith("api/"):
        return jsonify({"status": "error", "message": "API endpoint not found"}), 404
    if os.path.exists(FRONTEND_DIST):
        target = os.path.join(FRONTEND_DIST, path)
        if path != "" and os.path.exists(target):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, "index.html")
    # Fallback: serve from public/
    public_file = os.path.join(PUBLIC_DIR, path) if path else ""
    if path and os.path.exists(public_file):
        return send_from_directory(PUBLIC_DIR, path)
    return send_from_directory(PUBLIC_DIR, "index.html")

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        model_choice = data.get("model", "rf") # 'rf' or 'lr'
        model = rf_model if model_choice == "rf" and rf_model else lr_model
        
        # Format input feature dictionary
        raw_inputs = {
            'Age': float(data.get('Age', 40)),
            'Income': float(data.get('Income', 60000)),
            'LoanAmount': float(data.get('LoanAmount', 50000)),
            'CreditScore': int(data.get('CreditScore', 700)),
            'MonthsEmployed': int(data.get('MonthsEmployed', 36)),
            'NumCreditLines': int(data.get('NumCreditLines', 3)),
            'InterestRate': float(data.get('InterestRate', 8.5)),
            'LoanTerm': int(data.get('LoanTerm', 36)),
            'DTIRatio': float(data.get('DTIRatio', 0.3)),
            'Education': str(data.get('Education', "Bachelor's")),
            'EmploymentType': str(data.get('EmploymentType', "Full-time")),
            'MaritalStatus': str(data.get('MaritalStatus', "Married")),
            'HasMortgage': str(data.get('HasMortgage', "No")),
            'HasDependents': str(data.get('HasDependents', "No")),
            'LoanPurpose': str(data.get('LoanPurpose', "Auto")),
            'HasCoSigner': str(data.get('HasCoSigner', "No"))
        }

        # Encode categorical variables
        encoded_data = raw_inputs.copy()
        for col, le in encoders.items():
            val = raw_inputs[col]
            # fallback if unknown label
            if val in le.classes_:
                encoded_data[col] = le.transform([val])[0]
            else:
                encoded_data[col] = 0

        # Build DataFrame in exact feature order
        df_input = pd.DataFrame([encoded_data])[feature_cols]
        scaled_input = scaler.transform(df_input)

        # Predict
        pred = int(model.predict(scaled_input)[0])
        prob = float(model.predict_proba(scaled_input)[0][1]) # Default probability

        # Compute key metrics
        income = raw_inputs['Income']
        loan_amount = raw_inputs['LoanAmount']
        interest = raw_inputs['InterestRate']
        term = raw_inputs['LoanTerm']
        credit_score = raw_inputs['CreditScore']
        dti = raw_inputs['DTIRatio']

        r = (interest / 100) / 12
        if r > 0:
            monthly_pmt = (loan_amount * r * ((1 + r) ** term)) / (((1 + r) ** term) - 1)
        else:
            monthly_pmt = loan_amount / term

        loan_to_income = (loan_amount / income) * 100

        # Risk Factors list
        risk_flags = []
        if credit_score < 620:
            risk_flags.append({"level": "high", "text": f"Subprime Credit Score ({credit_score} FICO)"})
        elif credit_score < 680:
            risk_flags.append({"level": "medium", "text": f"Fair Credit Score ({credit_score} FICO)"})

        if dti > 0.45:
            risk_flags.append({"level": "high", "text": f"Elevated DTI Ratio ({dti * 100:.1f}%)"})

        if raw_inputs['EmploymentType'] == 'Unemployed':
            risk_flags.append({"level": "high", "text": "Applicant is currently Unemployed"})

        if loan_to_income > 150:
            risk_flags.append({"level": "medium", "text": f"High Loan-to-Income Ratio ({loan_to_income:.1f}%)"})

        if raw_inputs['HasCoSigner'] == 'No':
            risk_flags.append({"level": "low", "text": "No Co-Signer provided"})

        if interest > 15.0:
            risk_flags.append({"level": "medium", "text": f"High Interest Rate ({interest}%)"})

        # Financial Recommendations
        recommendations = []
        if prob >= 0.5:
            recommendations.append("Require an eligible Co-Signer with FICO > 720 to mitigate risk.")
            recommendations.append(f"Reduce requested loan amount from ${loan_amount:,.0f} to ${loan_amount * 0.7:,.0f}.")
            recommendations.append("Extend loan term to lower monthly payment burden.")
            recommendations.append("Request 15% upfront cash deposit / collateral.")
        else:
            recommendations.append("Approved for prime low-interest rate tier.")
            recommendations.append("Fast-track automated underwriting approved.")
            recommendations.append("Offer 0.25% APR discount for automatic monthly payments.")

        return jsonify({
            "status": "success",
            "prediction": pred, # 0 = Repaid, 1 = Default
            "default_risk_score": round(prob * 100, 1),
            "risk_category": "High Risk" if prob >= 0.6 else ("Moderate Risk" if prob >= 0.3 else "Low Risk"),
            "monthly_payment": round(monthly_pmt, 2),
            "loan_to_income": round(loan_to_income, 1),
            "risk_flags": risk_flags,
            "recommendations": recommendations,
            "inputs": raw_inputs
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/model-info", methods=["GET"])
def model_info():
    try:
        importances = rf_model.feature_importances_
        feat_imp = [{"feature": f, "importance": float(i)} for f, i in zip(feature_cols, importances)]
        feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)

        return jsonify({
            "status": "success",
            "model_name": "Random Forest Classifier (Ensemble)",
            "accuracy": 0.887,
            "auc_score": 0.762,
            "total_samples": 255347,
            "feature_importance": feat_imp
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/sample-dataset", methods=["GET"])
def sample_dataset():
    """Generates paginated mock/sample loan applicant records."""
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        search = request.args.get("search", "").lower()
        filter_risk = request.args.get("risk", "all")

        # Read sample rows from CSV
        csv_path = os.path.join(os.path.dirname(__file__), "Loan_default.csv")
        df_sample = pd.read_csv(csv_path, nrows=200) # load top 200 records for fast paginated preview

        records = []
        for idx, row in df_sample.iterrows():
            d_val = int(row['Default'])
            records.append({
                "id": str(row.get('LoanID', f"LID-{1000+idx}")),
                "age": int(row['Age']),
                "income": float(row['Income']),
                "loanAmount": float(row['LoanAmount']),
                "creditScore": int(row['CreditScore']),
                "interestRate": float(row['InterestRate']),
                "loanTerm": int(row['LoanTerm']),
                "education": str(row['Education']),
                "employment": str(row['EmploymentType']),
                "defaultStatus": "Default" if d_val == 1 else "Repaid",
                "riskLevel": "High Risk" if d_val == 1 else "Low Risk"
            })

        # Apply search filter
        if search:
            records = [r for r in records if search in r['id'].lower() or search in r['education'].lower() or search in r['employment'].lower()]

        # Apply risk filter
        if filter_risk != "all":
            records = [r for r in records if r['riskLevel'].lower().replace(" ", "") == filter_risk.lower().replace(" ", "")]

        total_records = len(records)
        total_pages = int(np.ceil(total_records / limit)) if total_records > 0 else 1
        page = min(max(1, page), total_pages)

        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_records = records[start_idx:end_idx]

        return jsonify({
            "status": "success",
            "page": page,
            "limit": limit,
            "total_records": total_records,
            "total_pages": total_pages,
            "data": paginated_records
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
