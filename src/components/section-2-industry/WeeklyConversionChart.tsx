'use client';

import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function WeeklyConversionChart({
  data,
  title = 'Weekly Conversion Velocity',
  description = 'Lead-to-client conversion over time.',
  emptyText = 'No time-series data available.',
}: {
  data: any[];
  title?: string;
  description?: string;
  emptyText?: string;
}) {
  if (!data || data.length === 0) {
    return <div className="flex h-[350px] items-center justify-center text-sm text-slate-500">{emptyText}</div>;
  }

  const chartData = data.map((item) => ({
    ...item,
    label: item.week,
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="min-h-0 flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="industryLineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-lg">
                    <p className="mb-1 text-xs font-semibold text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-100">
                      Conversion rate: <span className="font-bold text-sky-400">{point.conversion_rate}%</span>
                    </p>
                    <p className="text-sm font-medium text-slate-100">Leads: {point.total_leads}</p>
                    <p className="text-sm font-medium text-slate-100">Clients: {point.clients}</p>
                  </div>
                );
              }}
              cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="conversion_rate"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}