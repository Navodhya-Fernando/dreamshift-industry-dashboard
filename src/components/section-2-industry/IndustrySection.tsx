'use client';

import React, { useState } from 'react';
import IndustryKPIs from './IndustryKPIs';
import ClientLineChart from './ClientLineChart';
import dynamic from 'next/dynamic';
const GeospatialMap = dynamic(() => import('./GeospatialMap'), { ssr: false });
import LeadQualityBar from './LeadQualityBar';
import ConversionTable from './ConversionTable';
import { ChevronDown } from 'lucide-react';

function getIndustryKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];

  const keys: string[] = [];
  for (const key in value as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      keys.push(key);
    }
  }
  return keys.sort();
}

export default function IndustrySection({ 
  specificData = {}, 
  conversionData = [],
  overviewData = {} 
}: { 
  specificData: any, 
  conversionData: any[],
  overviewData: any 
}) {
  const safeSpecificData = React.useMemo(
    () => (specificData && typeof specificData === 'object' ? specificData : {}),
    [specificData]
  );

  const industries = React.useMemo(() => getIndustryKeys(safeSpecificData), [safeSpecificData]);
  const [selectedIndustry, setSelectedIndustry] = useState(() => industries[0] ?? '');

  React.useEffect(() => {
    if (!industries.length) {
      setSelectedIndustry('');
      return;
    }

    if (!selectedIndustry || !industries.includes(selectedIndustry)) {
      setSelectedIndustry(industries[0]);
    }
  }, [industries, selectedIndustry]);

  if (!industries.length) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-100">Industry Performance</h3>
        <p className="text-sm text-slate-400 mt-2">Industry data is unavailable right now.</p>
      </div>
    );
  }

  const activeIndustry = selectedIndustry || industries[0];
  const currentData = safeSpecificData[activeIndustry] || {};
  const currentConversion = (conversionData || []).find(c => c.Industry === activeIndustry) || null;

  return (
    <div className="space-y-6">
      {/* Sleek Header & Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Industry Performance</h3>
          <p className="text-sm text-slate-400">Select a sector to view isolated metrics</p>
        </div>
        
        <div className="relative mt-4 sm:mt-0 w-full sm:w-64">
          <select 
            value={activeIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full appearance-none bg-slate-900/50 border border-slate-800 text-slate-100 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Top Split: 60/40 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <IndustryKPIs 
            kpis={currentData.kpis || { clients: 0, leads: 0, hqLeads: 0 }} 
            totals={{
              clients: overviewData?.totalClients ?? 0,
              leads: overviewData?.totalLeads ?? 0
            }}
          />
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex-1">
            <h4 className="text-sm font-semibold text-slate-100 mb-6">Historical Client Growth</h4>
            <ClientLineChart data={currentData.clientLineChart || []} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-slate-800 bg-slate-900 z-10">
            <h4 className="text-sm font-semibold text-slate-100">Regional Lead Heatmap</h4>
            <p className="text-xs text-slate-400 mt-1">Geographic distribution of leads</p>
          </div>
          <div className="flex-1 bg-[#f8fafc] relative">
            <React.Suspense fallback={<div className="h-full flex items-center justify-center text-slate-400">Loading map...</div>}>
              <GeospatialMap data={currentData.stateBreakdown || []} />
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* Bottom Split: 50/50 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm h-[350px] flex flex-col">
          <h4 className="text-sm font-semibold text-slate-100 mb-6">Lead Quality Distribution</h4>
          <LeadQualityBar data={currentData.leadQualityBar || []} />
        </div>
        
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden h-[350px] flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h4 className="text-sm font-semibold text-slate-100">Conversion Ledger (Post-March 10)</h4>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            <ConversionTable data={currentConversion} />
          </div>
        </div>
      </div>
    </div>
  );
}