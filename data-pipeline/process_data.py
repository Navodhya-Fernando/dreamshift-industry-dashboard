import os
import glob
import json
import warnings
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, 'raw_data')
OUTPUT_DIR = os.path.join(BASE_DIR, 'public', 'data')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'dashboard_data.json')

def load_csv_by_pattern(pattern, label):
    files = glob.glob(os.path.join(INPUT_DIR, pattern))
    if not files:
        files = glob.glob(pattern)

    if not files:
        raise FileNotFoundError(f"Could not find {label} file matching {pattern} in {INPUT_DIR}.")

    file_path = files[0]
    df = pd.read_csv(file_path)
    df.columns = df.columns.str.strip()
    print(f"✅ Loaded {label}: {file_path} ({len(df)} rows)")
    return df

def classify_quality(value):
    text = str(value).strip().lower()
    if 'high quality' in text:
        return 'High Quality Lead'
    if 'mid quality' in text or 'unsure' in text or 'students' in text or 'not urgent' in text:
        return 'Mid Quality Lead'
    if 'low quality' in text:
        return 'Low Quality Lead'
    return 'Unknown'

def empty_ratio(numerator, denominator):
    return round((numerator / denominator) * 100, 2) if denominator else 0

def parse_truthy(series):
    normalized = series.fillna('').astype(str).str.strip().str.lower()
    return normalized.isin(['true', 'yes', '1', 'y'])

def main():
    print("🚀 Starting DreamShift ETL & ML Pipeline...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. LOAD & CLEAN DATASETS
    leads_df = load_csv_by_pattern('*ead*.csv', 'Leads')
    clients_df = load_csv_by_pattern('*lient*.csv', 'Clients')

    if 'Indsustry' in leads_df.columns:
        leads_df.rename(columns={'Indsustry': 'Industry'}, inplace=True)

    if 'Industry' not in clients_df.columns and 'Job Industry' in clients_df.columns:
        clients_df.rename(columns={'Job Industry': 'Industry'}, inplace=True)

    if 'Client (Yes/No)' in leads_df.columns:
        leads_df['is_client'] = parse_truthy(leads_df['Client (Yes/No)'])
    elif 'Client' in leads_df.columns:
        leads_df['is_client'] = parse_truthy(leads_df['Client'])
    else:
        leads_df['is_client'] = False

    if 'Industry' not in leads_df.columns:
        leads_df['Industry'] = 'Other'
    if 'State' not in leads_df.columns:
        leads_df['State'] = 'Unknown'
    if 'Lead Type' not in leads_df.columns:
        leads_df['Lead Type'] = 'Unknown'
    if 'Visa Status' not in leads_df.columns:
        leads_df['Visa Status'] = 'Unknown'

    leads_df['Industry'] = leads_df['Industry'].fillna('Other')
    leads_df['State'] = leads_df['State'].fillna('Unknown')
    leads_df['Lead Type'] = leads_df['Lead Type'].fillna('Unknown')
    leads_df['Visa Status'] = leads_df['Visa Status'].fillna('Unknown')
    leads_df['lead_quality_bucket'] = leads_df['Lead Type'].apply(classify_quality)

    if 'Industry' not in clients_df.columns:
        clients_df['Industry'] = 'Other'
    if 'Name' not in clients_df.columns:
        clients_df['Name'] = 'Unknown'

    clients_df['Industry'] = clients_df['Industry'].fillna('Other')
    clients_df['Name'] = clients_df['Name'].fillna('Unknown')

    # 2. OVERVIEW METRICS
    total_leads = int(len(leads_df))
    total_clients = int(len(clients_df))
    total_industries = int(pd.concat([leads_df['Industry'], clients_df['Industry']], ignore_index=True).nunique())

    # 3. SUMMARY TABLE
    lead_summary = leads_df.groupby('Industry').size().reset_index(name='Leads')
    client_summary = clients_df.groupby('Industry').size().reset_index(name='Clients')

    summary = lead_summary.merge(client_summary, on='Industry', how='outer').fillna(0)
    summary[['Leads', 'Clients']] = summary[['Leads', 'Clients']].astype(int)
    summary = summary.sort_values(by='Leads', ascending=False)
    summary_table = summary.to_dict(orient='records')
    client_count_by_industry = dict(zip(client_summary['Industry'], client_summary['Clients']))

    # 4. LEAD QUALITY HEATMAP
    print("🔥 Generating Lead Quality Matrix...")
    heatmap_df = pd.crosstab(leads_df['Industry'], leads_df['Lead Type'])
    quality_heatmap = [{"Industry": idx, **row.to_dict()} for idx, row in heatmap_df.iterrows()]

    # 5. CONVERSION TABLE
    print("📊 Building lead-to-client acquisition table...")
    conversion_rows = []
    for industry, group in leads_df.groupby('Industry'):
        total_leads_industry = int(len(group))
        clients = int(group['is_client'].sum())

        high_quality = group[group['lead_quality_bucket'] == 'High Quality Lead']
        mid_quality = group[group['lead_quality_bucket'] == 'Mid Quality Lead']

        total_hq_leads = int(len(high_quality))
        total_mq_leads = int(len(mid_quality))
        hq_clients = int(high_quality['is_client'].sum())
        mq_clients = int(mid_quality['is_client'].sum())

        conversion_rows.append({
            'Industry': industry,
            'Clients': clients,
            'TotalLeads': total_leads_industry,
            'ConversionRate': empty_ratio(clients, total_leads_industry),
            'TotalHQLeads': total_hq_leads,
            'PctHQLeads': empty_ratio(total_hq_leads, total_leads_industry),
            'HQConvRate': empty_ratio(hq_clients, total_hq_leads),
            'TotalMQLeads': total_mq_leads,
            'PctMQLeads': empty_ratio(total_mq_leads, total_leads_industry),
            'MQConvRate': empty_ratio(mq_clients, total_mq_leads),
        })

    conversion_table = sorted(conversion_rows, key=lambda row: row['TotalLeads'], reverse=True)

    # 6. GEOSPATIAL DATA
    print("🗺️  Processing Geospatial distribution...")
    geo_df = leads_df.groupby('State').size().reset_index(name='count').rename(columns={'State': 'state'})
    geospatial_data = geo_df.to_dict(orient='records')

    # 7. FIND DATE COLUMN (Robust Search)
    date_col = None
    for col in leads_df.columns:
        if 'submit' in col.lower() or 'date' in col.lower():
            date_col = col
            break

    # 8. WEEKLY CONVERSION RATE
    weekly_conversion_data = []
    industry_weekly_conversion = []
    forecast_data = []
    
    if date_col:
        print(f"📅 Found date column '{date_col}', calculating Weekly Conversion Rates...")
        leads_df[date_col] = pd.to_datetime(leads_df[date_col], errors='coerce')
        time_df = leads_df.dropna(subset=[date_col]).copy()
        
        weekly_stats = time_df.groupby(pd.Grouper(key=date_col, freq='W-MON')).agg(
            total_leads=('Name', 'count'),
            clients=('is_client', 'sum')
        ).reset_index()
        
        weekly_stats = weekly_stats[weekly_stats['total_leads'] > 0]
        weekly_stats['conversion_rate'] = ((weekly_stats['clients'] / weekly_stats['total_leads']) * 100).round(1)
        weekly_stats['week'] = weekly_stats[date_col].dt.strftime('%b %d')
        
        weekly_conversion_data = weekly_stats[['week', 'conversion_rate', 'total_leads', 'clients']].to_dict(orient='records')

        industry_weekly_stats = time_df.groupby([
            'Industry',
            pd.Grouper(key=date_col, freq='W-MON')
        ]).agg(
            total_leads=('Name', 'count'),
            clients=('is_client', 'sum')
        ).reset_index()

        industry_weekly_stats = industry_weekly_stats[industry_weekly_stats['total_leads'] > 0].copy()
        industry_weekly_stats['conversion_rate'] = ((industry_weekly_stats['clients'] / industry_weekly_stats['total_leads']) * 100).round(1)
        industry_weekly_stats['week'] = industry_weekly_stats[date_col].dt.strftime('%b %d')

        industry_weekly_conversion = [
            {
                'Industry': row['Industry'],
                'week': row['week'],
                'conversion_rate': row['conversion_rate'],
                'total_leads': int(row['total_leads']),
                'clients': int(row['clients']),
            }
            for _, row in industry_weekly_stats.iterrows()
        ]
        
        # 9. FORECASTING
        print("📈 Running ML: Time-Series Forecasting...")
        clients_data = leads_df[leads_df['is_client'] == True].copy()
        
        if len(clients_data) > 2:
            try:
                # Set the datetime column directly as the index to ensure a proper DatetimeIndex
                clients_data.set_index(date_col, inplace=True)
                
                # Resample weekly (starting Monday) and count the total number of clients
                weekly_forecast_data = clients_data.resample('W-MON').size().astype(float)
                
                # Run the Exponential Smoothing model
                model = ExponentialSmoothing(weekly_forecast_data, trend='add', seasonal=None, initialization_method="estimated")
                forecast = model.fit().forecast(steps=4)
                
                for date, val in forecast.items():
                    forecast_data.append({
                        "date": date.strftime("%b %d"), 
                        "predictedClients": max(0, int(round(val)))
                    })
            except Exception as e:
                print(f"⚠️ Forecasting skipped: {e}")

    # 10. ML PROBABILITIES
    print("🧠 Running ML: Logistic Regression (Probabilities)...")
    probabilities_data = []
    if len(leads_df['is_client'].unique()) > 1:
        X_encoded = pd.get_dummies(leads_df[['Industry', 'State']])
        y = leads_df['is_client'].astype(int)
        lr = LogisticRegression(max_iter=200, class_weight='balanced').fit(X_encoded, y)
        leads_df['conversion_prob'] = lr.predict_proba(X_encoded)[:, 1]
        
        prob_summary = leads_df.groupby('Industry')['conversion_prob'].mean().reset_index().sort_values(by='conversion_prob', ascending=False)
        probabilities_data = [{"industry": row['Industry'], "probability": round(row['conversion_prob'] * 100, 1)} for _, row in prob_summary.iterrows()]

    # 11. ML PERSONAS
    print("👥 Running ML: K-Means Clustering (Persona Discovery)...")
    personas_data = []
    successful_leads = leads_df[leads_df['is_client'] == True]
    if not successful_leads.empty:
        persona_group = successful_leads.groupby(['Industry', 'Visa Status', 'Lead Type']).size().reset_index(name='conversions')
        persona_group = persona_group.sort_values('conversions', ascending=False).head(5)
        successful_count = max(1, len(successful_leads))
        personas_data = [{"persona": f"Persona {index + 1}", "targetIndustry": r['Industry'], "location": "Australia", "visaStatus": r['Visa Status'], "conversionRate": round((r['conversions'] / successful_count) * 100, 2)} for index, (_, r) in enumerate(persona_group.iterrows())]

    overview_payload = {
        'totalClients': total_clients,
        'totalLeads': total_leads,
        'totalIndustries': total_industries,
        'summaryTable': summary_table,
        'qualityHeatmap': quality_heatmap,
    }

    predictive_payload = {
        'industryProbabilities': probabilities_data,
        'topPersonas': personas_data,
        'forecast': forecast_data,
    }

    industry_specific = {}
    if date_col:
        industry_weekly_lookup = {}
        for row in industry_weekly_conversion:
            industry_weekly_lookup.setdefault(row['Industry'], []).append({
                'week': row['week'],
                'conversion_rate': row['conversion_rate'],
                'total_leads': row['total_leads'],
                'clients': row['clients'],
            })

    all_industries = sorted(set(leads_df['Industry'].tolist()) | set(clients_df['Industry'].tolist()))
    for industry in all_industries:
        group = leads_df[leads_df['Industry'] == industry]
        quality_counts = group['lead_quality_bucket'].value_counts().to_dict()
        lead_quality_bar = [
            {'quality': 'Low Quality Lead', 'count': int(quality_counts.get('Low Quality Lead', 0))},
            {'quality': 'High Quality Lead', 'count': int(quality_counts.get('High Quality Lead', 0))},
            {'quality': 'Unknown', 'count': int(quality_counts.get('Unknown', 0))},
            {'quality': 'Mid Quality Lead', 'count': int(quality_counts.get('Mid Quality Lead', 0))},
        ]

        industry_specific[industry] = {
            'kpis': {
                'clients': int(client_count_by_industry.get(industry, 0)),
                'leads': int(len(group)),
                'hqLeads': int((group['lead_quality_bucket'] == 'High Quality Lead').sum()),
            },
            'leadQualityBar': lead_quality_bar,
            'stateBreakdown': group.groupby('State').size().reset_index(name='count').rename(columns={'State': 'state'}).to_dict(orient='records'),
            'weeklyConversion': industry_weekly_lookup.get(industry, []) if date_col else [],
        }

    # 11. COMPILE JSON
    print("💾 Compiling final payload...")
    dashboard_payload = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "totalClients": total_clients,
        "totalLeads": total_leads,
        "totalIndustries": total_industries,
        "overview": overview_payload,
        "summaryTable": summary_table,
        "qualityHeatmap": quality_heatmap,
        "geospatial": geospatial_data,
        "weeklyConversion": weekly_conversion_data,
        "industryWeeklyConversion": industry_weekly_conversion,
        "conversionTable": conversion_table,
        "industrySpecific": industry_specific,
        "probabilities": probabilities_data,
        "personas": personas_data,
        "forecast": forecast_data
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(dashboard_payload, f, indent=4)
        
    print(f"🎉 SUCCESS! Dashboard data generated at {OUTPUT_FILE}")

if __name__ == "__main__":
    main()