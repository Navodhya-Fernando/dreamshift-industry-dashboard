import React from 'react';

export default function IndustryKPIs({ kpis, totals }: { kpis: any, totals: any }) {
  const clientPct = totals.clients > 0 ? (kpis.clients / totals.clients) * 100 : 0;
  const leadPct = totals.leads > 0 ? (kpis.leads / totals.leads) * 100 : 0;
  const hqPct = kpis.leads > 0 ? (kpis.hqLeads / kpis.leads) * 100 : 0;

  const metrics = [
    { label: 'Clients', value: kpis.clients, pct: clientPct, color: 'bg-blue-600' },
    { label: 'Total Leads', value: kpis.leads, pct: leadPct, color: 'bg-emerald-600' },
    { label: 'High Quality Leads', value: kpis.hqLeads, pct: hqPct, color: 'bg-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            {m.label}
          </p>
          <div className="flex items-end justify-between mb-3">
            <span className="text-2xl font-semibold text-slate-100">{m.value}</span>
            <span className="text-xs font-medium text-slate-400 mb-1">{m.pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full ${m.color} transition-all duration-1000 ease-out`} 
              style={{ width: `${m.pct}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}