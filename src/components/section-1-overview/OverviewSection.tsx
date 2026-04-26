'use client';

import React, { useState } from 'react';
import KPICards from './KPICards';
import EntityPieChart from './EntityPieChart';
import SummaryTable from './SummaryTable';

export default function OverviewSection({ data }: { data: any }) {
  const [pieFilter, setPieFilter] = useState<'Clients' | 'Leads' | 'Both'>('Clients');

  if (!data || !Array.isArray(data.summaryTable)) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
      
      {/* Left Column */}
      <div className="lg:col-span-3 space-y-6 flex flex-col">
        {/* Top KPIs */}
        <KPICards 
          clients={data.totalClients} 
          leads={data.totalLeads} 
          industries={data.totalIndustries} 
        />
        
        {/* Interactive Pie Chart Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex-1 flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 flex-shrink-0">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Entity Distribution</h3>
              <p className="text-sm text-slate-400">Breakdown across all active industries</p>
            </div>
            
            {/* Premium Minimalist Toggle Switch */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['Clients', 'Leads', 'Both'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPieFilter(opt as any)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    pieFilter === opt 
                      ? 'bg-slate-800 shadow-sm text-slate-100' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          
          {/* THE FIX: 'flex-1 flex flex-col min-h-0' forces the chart and legend to expand into the empty space */}
          <div className="flex-1 flex flex-col min-h-0">
            <EntityPieChart data={data.summaryTable} filter={pieFilter} />
          </div>
          
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 z-10 flex-shrink-0">
          <h3 className="text-base font-semibold text-slate-100">Industry Ledger</h3>
          <p className="text-sm text-slate-400">Volumetric data by sector</p>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <SummaryTable tableData={data.summaryTable} />
        </div>
      </div>
      
    </div>
  );
}