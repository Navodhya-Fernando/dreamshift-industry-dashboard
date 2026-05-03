export type DashboardPayload = {
  overview?: {
    totalClients: number;
    totalLeads: number;
    totalIndustries: number;
    summaryTable: any[];
    qualityHeatmap: any[];
  };
  totalClients?: number;
  totalLeads?: number;
  totalIndustries?: number;
  summaryTable?: any[];
  qualityHeatmap?: any[];
  geospatial?: any[];
  weeklyConversion?: any[];
  industryWeeklyConversion?: any[];
  conversionTable?: any[];
  industrySpecific?: Record<string, any>;
  probabilities?: any[];
  personas?: any[];
  forecast?: any[];
};

export function getOverview(data: DashboardPayload) {
  return data.overview ?? data;
}

export function getIndustryOptions(data: DashboardPayload) {
  const summary = data.summaryTable ?? data.overview?.summaryTable ?? [];
  return summary
    .map((row) => row.Industry)
    .filter(Boolean)
    .sort((left, right) => {
      if (left === 'Other') return 1;
      if (right === 'Other') return -1;
      return String(left).localeCompare(String(right));
    });
}

export function getDefaultIndustry(data: DashboardPayload) {
  const summary = [...(data.summaryTable ?? data.overview?.summaryTable ?? [])].sort(
    (left, right) => (right.Leads ?? 0) - (left.Leads ?? 0),
  );

  return summary.find((row) => row.Industry !== 'Other')?.Industry ?? summary[0]?.Industry ?? '';
}

export function buildEntityDistribution(summaryTable: any[], mode: 'Clients' | 'Leads' | 'Both') {
  return [...(summaryTable ?? [])]
    .map((row) => ({
      name: row.Industry,
      clients: Number(row.Clients ?? 0),
      leads: Number(row.Leads ?? 0),
      value:
        mode === 'Clients'
          ? Number(row.Clients ?? 0)
          : mode === 'Leads'
            ? Number(row.Leads ?? 0)
            : Number(row.Clients ?? 0) + Number(row.Leads ?? 0),
    }))
    .filter((row) => row.value > 0)
    .sort((left, right) => right.value - left.value);
}

export function buildLeadQualityStack(qualityHeatmap: any[]) {
  const lowKeys = ['low quality lead', 'unknown'];
  const midKeys = ['mid quality - unsure', 'mid quality - students', 'mid quality - not urgent'];
  const highKeys = ['high quality lead'];

  return [...(qualityHeatmap ?? [])]
    .map((row) => {
      const entries = Object.entries(row).filter(([key]) => key !== 'Industry');
      const low = entries.reduce((total, [key, value]) => (lowKeys.some((match) => key.toLowerCase().includes(match)) ? total + Number(value ?? 0) : total), 0);
      const mid = entries.reduce((total, [key, value]) => (midKeys.some((match) => key.toLowerCase().includes(match)) ? total + Number(value ?? 0) : total), 0);
      const high = entries.reduce((total, [key, value]) => (highKeys.some((match) => key.toLowerCase().includes(match)) ? total + Number(value ?? 0) : total), 0);
      const total = low + mid + high;

      return {
        industry: row.Industry,
        low,
        mid,
        high,
        total,
      };
    })
    .sort((left, right) => right.total - left.total);
}

export function getIndustrySnapshot(data: DashboardPayload, selectedIndustry: string) {
  const industrySpecific = data.industrySpecific ?? {};
  const selected = industrySpecific[selectedIndustry] ?? {};
  const conversionRow = (data.conversionTable ?? []).find((row) => row.Industry === selectedIndustry) ?? {};
  const weeklyConversion = (selected.weeklyConversion ?? []).map((row: any) => ({
    week: row.week,
    conversion_rate: Number(row.conversion_rate ?? 0),
    total_leads: Number(row.total_leads ?? 0),
    clients: Number(row.clients ?? 0),
  }));

  return {
    selected,
    conversionRow,
    weeklyConversion,
  };
}
