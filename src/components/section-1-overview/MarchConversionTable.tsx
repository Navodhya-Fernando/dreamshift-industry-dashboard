import React from 'react';

export default function MarchConversionTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => b.TotalLeads - a.TotalLeads);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-900/80">
        <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Lead-to-Client Acquisition</h3>
        <p className="text-sm text-slate-400 mt-1">Lead conversion by industry.</p>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950 border-b border-slate-800">
            <tr>
              <th className="px-6 py-5 font-medium">Industry</th>
              <th className="px-6 py-5 font-medium text-right">Clients</th> 
              <th className="px-6 py-5 font-medium text-right">Total Leads</th>
              <th className="px-6 py-5 font-medium text-right">Conversion Rate</th>
              <th className="px-6 py-5 font-medium text-right">Total HQ Leads</th>
              <th className="px-6 py-5 font-medium text-right">% HQ Leads</th>
              <th className="px-6 py-5 font-medium text-right">HQ Conv. Rate</th>
              <th className="px-6 py-5 font-medium text-right">Total MQ Leads</th>
              <th className="px-6 py-5 font-medium text-right">% MQ Leads</th>
              <th className="px-6 py-5 font-medium text-right">MQ Conv. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors duration-200">
                <td className="px-6 py-4 font-medium text-slate-200">{row.Industry}</td>
                <td className="px-6 py-4 text-right font-semibold text-indigo-400">
                  {row.Clients}
                </td>
                
                <td className="px-6 py-4 text-right text-slate-300">
                  {row.TotalLeads}
                </td>
                <td className="px-6 py-4 text-right text-emerald-400">
                  {row.ConversionRate}%
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {row.TotalHQLeads}
                </td>
                <td className="px-6 py-4 text-right text-blue-400">
                  {row.PctHQLeads}%
                </td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                  {row.HQConvRate}%
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {row.TotalMQLeads}
                </td>
                <td className="px-6 py-4 text-right text-blue-400">
                  {row.PctMQLeads}%
                </td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                  {row.MQConvRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}