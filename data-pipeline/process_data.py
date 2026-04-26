import pandas as pd
import numpy as np
import json
import os
import re
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import warnings

# Suppress warnings for a clean terminal output
warnings.filterwarnings("ignore")

# --- CONFIGURATION ---
RAW_DATA_DIR = "raw_data"
OUTPUT_DIR = os.path.join("..", "public", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "dashboard_data.json")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- 1. HELPER FUNCTIONS ---
def clean_lead_type(val):
    if pd.isna(val): return "Unknown"
    cleaned = re.sub(r'[^\w\s-]', '', str(val)).strip()
    return cleaned

def standardize_industry(role):
    if pd.isna(role): return "Other"
    role_lower = str(role).lower()
    if re.search(r'\b(agriculture|gardener|landscape)\b', role_lower): return 'Agriculture'
    if re.search(r'\b(medical|nurse|health|physio|clinical|age care|pharmacist|chef|food|dairy)\b', role_lower): return 'Medical'
    if re.search(r'\b(chemist|analytical|laboratory|technical officer|environmental|scientist)\b', role_lower): return 'Science & Tech'
    if re.search(r'\b(civil|site|construction|estimator|architect|quantity surveyor|structural|revit|autocad|mining|contract administrator|geotechnical|negoneering)\b', role_lower): return 'Constructions'
    if re.search(r'\b(electrical|mechanical|automation|electronics|manufacturing|production|mechatronics|aerospace|renewable)\b', role_lower): return 'Manufacturing'
    if re.search(r'\b(finance|accountant|auditor|accounting|investment|equity|accounts|tax|reconciliation|banking|credit analyst|financial)\b', role_lower): return 'Accounting'
    if re.search(r'\b(supply chain|procurement|logistics|buyer|merchandise|pick packing)\b', role_lower): return 'Logistics'
    if re.search(r'\b(marketing|sales|social media|retail|channel growth|business development)\b', role_lower): return 'Marketing & Sales'
    if re.search(r'\b(hr|human resource|human resources|recruitment)\b', role_lower): return 'HR'
    if re.search(r'\b(software|it|information technology|data|developer|cyber|network|desktop|computer|system analyst|euc|cisco|cloud|ai|database|tech support|ux|ui|java|sql|soc|ict|tester|test analyst|technology|business analyst|business analytics|business analysy|ba)\b', role_lower): return 'IT'
    if re.search(r'\b(consultant|scrum|project manager|project management|project coordinator|pmo|management consultant|sap|pm)\b', role_lower): return 'Consulting'
    if re.search(r'\b(admin|customer service|legal|secretary|safety inspector|fifo|public servant|community worker|operations|design|instructional|graduate program|graduate or internship|graduate/junior roles)\b', role_lower): return 'Operations'
    if re.search(r'\b(project engineer|engineering)\b', role_lower): return 'Constructions'
    return 'Other'

# --- 2. LOAD & PREPROCESS DATA ---
print("Loading datasets...")
clients_df = pd.read_csv(os.path.join(RAW_DATA_DIR, "Clients.csv"))
leads_df = pd.read_csv(os.path.join(RAW_DATA_DIR, "Leads.csv"))

# Clean Clients
clients_df['Start Date'] = pd.to_datetime(clients_df['Start Date'])
clients_df['Job Industry'] = clients_df['Job Industry'].fillna('Other')

# Clean Leads
leads_df['Industry'] = leads_df['Targeted Job Roles'].apply(standardize_industry)
leads_df['Lead Type'] = leads_df['Lead Type'].apply(clean_lead_type)
leads_df['State'] = leads_df['State'].fillna('Unknown')
leads_df['Visa Status'] = leads_df['Visa Status'].fillna('Unknown')
# Boolean Target for Conversions
leads_df['Is_Client'] = leads_df['Client (Yes/No)'].fillna(False).replace({'TRUE': True, 'TRUE ': True, True: True}).astype(int)

# Identify unique industries
all_industries = sorted(list(set(clients_df['Job Industry'].unique()).union(set(leads_df['Industry'].unique()))))

# --- 3. SECTION 1: OVERVIEW METRICS ---
print("Calculating Overview Metrics...")
overview = {
    "totalClients": int(len(clients_df)),
    "totalLeads": int(len(leads_df)),
    "totalIndustries": len(all_industries),
    "summaryTable": []
}

for ind in all_industries:
    c_count = int(len(clients_df[clients_df['Job Industry'] == ind]))
    l_count = int(len(leads_df[leads_df['Industry'] == ind]))
    if c_count > 0 or l_count > 0:
        overview["summaryTable"].append({"Industry": ind, "Clients": c_count, "Leads": l_count})

# --- 4. SECTION 2: INDUSTRY SPECIFICS & CONVERSIONS ---
print("Processing Industry Detail & Conversion Data...")
industry_specific = {}
conversion_table = []

for ind in all_industries:
    ind_clients = clients_df[clients_df['Job Industry'] == ind]
    ind_leads = leads_df[leads_df['Industry'] == ind]
    
    if len(ind_clients) == 0 and len(ind_leads) == 0:
        continue

    # Client Line Chart
    client_trend = ind_clients.set_index('Start Date').resample('M').size().reset_index()
    client_trend['Month'] = client_trend['Start Date'].dt.strftime('%b %Y')
    
    quality_counts = ind_leads['Lead Type'].value_counts().to_dict()
    state_counts = ind_leads['State'].value_counts().to_dict()

    industry_specific[ind] = {
        "kpis": {
            "clients": int(len(ind_clients)),
            "leads": int(len(ind_leads)),
            "hqLeads": int(quality_counts.get("High Quality Lead", 0))
        },
        "clientLineChart": [{"month": row['Month'], "clients": int(row[0])} for _, row in client_trend.iterrows()],
        "leadQualityBar": [{"quality": k, "count": int(v)} for k, v in quality_counts.items()],
        "stateBreakdown": [{"state": k, "count": int(v)} for k, v in state_counts.items()]
    }

    # Master Conversion Table Logic (Using the Client Yes/No Boolean)
    if len(ind_leads) > 0:
        t_leads = int(len(ind_leads))
        converted_clients = int(ind_leads['Is_Client'].sum())
        
        hq_leads_df = ind_leads[ind_leads['Lead Type'].str.contains('High Quality', case=False, na=False)]
        hq_leads = int(len(hq_leads_df))
        hq_converted = int(hq_leads_df['Is_Client'].sum())
        
        conv_rate = round((converted_clients / t_leads * 100), 2)
        hq_pct = round((hq_leads / t_leads * 100), 2)
        hq_conv = round((hq_converted / hq_leads * 100), 2) if hq_leads > 0 else 0

        conversion_table.append({
            "Industry": ind,
            "ConvertedClients": converted_clients,
            "TotalLeads": t_leads,
            "ConversionRate": conv_rate,
            "TotalHQLeads": hq_leads,
            "PctHQLeads": hq_pct,
            "PctHQConverted": hq_conv
        })

# --- 5. SECTION 3: MACHINE LEARNING & PREDICTIVE ---
print("Running Machine Learning Models...")
predictive = {"industryProbabilities": [], "topPersonas": [], "forecast": []}

X_log = leads_df[['Industry', 'State', 'Visa Status', 'Lead Type']]
y_log = leads_df['Is_Client']

if y_log.sum() > 0:
    preprocessor = ColumnTransformer(transformers=[('cat', OneHotEncoder(handle_unknown='ignore'), ['Industry', 'State', 'Visa Status', 'Lead Type'])])
    clf = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', LogisticRegression(class_weight='balanced'))])
    clf.fit(X_log, y_log)
    
    probs = clf.predict_proba(X_log)[:, 1]
    leads_df['Conversion_Prob'] = probs
    industry_probs = leads_df.groupby('Industry')['Conversion_Prob'].mean().round(4) * 100
    predictive["industryProbabilities"] = [{"industry": k, "probability": float(v)} for k, v in industry_probs.items()]

X_cluster = pd.get_dummies(leads_df[['Industry', 'State', 'Visa Status']])
kmeans = KMeans(n_clusters=4, random_state=42)
leads_df['Cluster'] = kmeans.fit_predict(X_cluster)

cluster_conversions = leads_df.groupby('Cluster')['Is_Client'].mean().sort_values(ascending=False)
top_3_clusters = cluster_conversions.head(3).index

for cluster_id in top_3_clusters:
    cluster_data = leads_df[leads_df['Cluster'] == cluster_id]
    predictive["topPersonas"].append({
        "persona": f"Persona {int(cluster_id) + 1}",
        "topIndustry": cluster_data['Industry'].mode()[0],
        "topState": cluster_data['State'].mode()[0],
        "topVisa": cluster_data['Visa Status'].mode()[0],
        "conversionRate": float(round(cluster_conversions[cluster_id] * 100, 2))
    })

print("Running Time-Series Forecast...")
daily_clients = clients_df.groupby('Start Date').size().asfreq('D', fill_value=0)

if len(daily_clients) > 14:
    model = ExponentialSmoothing(daily_clients, trend='add', seasonal=None, initialization_method="estimated")
    fit_model = model.fit()
    forecast = fit_model.forecast(steps=30)
    
    for date, value in forecast.items():
        predictive["forecast"].append({
            "date": date.strftime('%Y-%m-%d'),
            "predictedClients": max(0, round(value, 2))
        })

# --- 6. EXPORT TO JSON ---
final_json = {
    "overview": overview,
    "industrySpecific": industry_specific,
    "conversionTable": conversion_table,
    "predictive": predictive
}

with open(OUTPUT_FILE, 'w') as f:
    json.dump(final_json, f, indent=4)

print(f"✅ Data processing complete! JSON saved to: {OUTPUT_FILE}")