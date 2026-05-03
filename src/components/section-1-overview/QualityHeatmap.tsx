'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { buildLeadQualityStack } from '../../lib/dashboard';

export default function QualityHeatmap({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const chartData = buildLeadQualityStack(data).map((row) => ({
    ...row,
    lowPct: row.total ? row.low / row.total : 0,
    midPct: row.total ? row.mid / row.total : 0,
    highPct: row.total ? row.high / row.total : 0,
  }));

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col w-full h-[460px]">
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-base font-semibold text-slate-100">Lead Quality Matrix</h3>
        <p className="text-sm text-slate-400">High, mid, and low quality mix by industry.</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" stackOffset="expand" margin={{ top: 0, right: 24, left: 24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="industry" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
                    <p className="mb-2 border-b border-slate-800 pb-2 text-[12px] font-bold uppercase tracking-wider text-slate-100">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-4 py-1 text-sm">
                        <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
                        <span className="font-bold text-slate-100">{(entry.value * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#cbd5e1' }} iconType="circle" />
            <Bar dataKey="lowPct" stackId="a" name="Low" fill="#f97316" />
            <Bar dataKey="midPct" stackId="a" name="Mid" fill="#f59e0b" />
            <Bar dataKey="highPct" stackId="a" name="High" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}