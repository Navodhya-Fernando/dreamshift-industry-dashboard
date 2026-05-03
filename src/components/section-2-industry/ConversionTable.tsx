import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ConversionTable({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
        <AlertCircle className="w-6 h-6" />
        <p className="text-sm">No conversion data for this sector.</p>
      </div>
    );
  }

  const rows = [
    { label: "Total Leads", value: data.TotalLeads, type: "number" },
    { label: "High Quality (HQ) Leads", value: data.TotalHQLeads, type: "number" },
    { label: "% of Leads that are HQ", value: `${data.PctHQLeads}%`, type: "percent" },
    {
      label: "Clients Acquired (Post-March 10)",
      value: data.ClientsPostMarch10 ?? data.Clients ?? 0,
      type: "number",
      highlight: true,
    },
    { label: "Overall Conversion Rate", value: `${data.ConversionRate}%`, type: "percent" },
    {
      label: "HQ Lead Conversion Rate",
      value: `${data.PctHQConverted ?? data.HQConvRate ?? 0}%`,
      type: "percent",
      highlight: true,
    },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div 
          key={i} 
          className={`flex justify-between items-center p-3 rounded-lg border ${
            row.highlight ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <span className={`text-sm ${row.highlight ? 'font-medium text-blue-900' : 'text-slate-600'}`}>
            {row.label}
          </span>
          <span className={`text-sm ${row.highlight ? 'font-bold text-blue-700' : 'font-semibold text-slate-900'}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}