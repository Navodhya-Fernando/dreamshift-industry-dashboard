'use client';

import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import QualityHeatmap from './QualityHeatmap';
import type { DashboardPayload } from '../../lib/dashboard';
import { buildEntityDistribution, getOverview } from '../../lib/dashboard';

type DistributionMode = 'Clients' | 'Leads' | 'Both';

const PIE_COLORS = ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#60a5fa', '#14b8a6', '#fb7185'];

export default function OverviewSection({ data }: { data: DashboardPayload }) {
  const overview = getOverview(data);
  const [mode, setMode] = useState<DistributionMode>('Both');

  const entityData = useMemo(() => buildEntityDistribution(overview.summaryTable ?? [], mode), [overview.summaryTable, mode]);
  const totalValue = useMemo(() => entityData.reduce((sum, item) => sum + item.value, 0), [entityData]);
  const summaryRows = overview.summaryTable ?? [];
  const modeTitle = mode === 'Clients' ? 'Total Clients' : mode === 'Leads' ? 'Total Leads' : 'Total Entities';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Executive Overview</h2>
        <p className="text-sm text-slate-400">Client count, lead count, and sector balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Total Clients</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{overview.totalClients}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Total Leads</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{overview.totalLeads}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Active Industries</p>
          <p className="mt-2 text-3xl font-bold text-indigo-400">{overview.totalIndustries}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Entity Distribution</h3>
              <p className="text-sm text-slate-400">Breakdown across active industries.</p>
            </div>
            <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
              {(['Clients', 'Leads', 'Both'] as DistributionMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                    mode === option ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full relative">
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tracking-tight text-slate-100">{totalValue}</span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{modeTitle}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    const pct = totalValue ? ((item.value / totalValue) * 100).toFixed(1) : '0.0';
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 shadow-2xl">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.name}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{item.value.toLocaleString()} <span className="text-slate-500">({pct}%)</span></p>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={entityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={74}
                  outerRadius={104}
                  paddingAngle={3}
                  cornerRadius={7}
                  labelLine={false}
                  label={({ name, percent }: any) => (percent && percent > 0.09 ? name : '')}
                >
                  {entityData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {entityData.map((item, index) => {
              const pct = totalValue ? ((item.value / totalValue) * 100).toFixed(1) : '0.0';
              return (
                <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="truncate text-sm text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{item.value}</span>
                    <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-100">Industry Ledger</h3>
            <p className="text-sm text-slate-400">Clients and leads by industry.</p>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar pr-2">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-2">Industry</th>
                  <th className="py-3 px-2 text-right">Clients</th>
                  <th className="py-3 px-2 text-right">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summaryRows.map((row: any) => (
                  <tr key={row.Industry} className="transition-colors hover:bg-slate-800/20">
                    <td className="py-3 px-2 font-medium text-slate-200">{row.Industry}</td>
                    <td className="py-3 px-2 text-right text-emerald-400">{row.Clients}</td>
                    <td className="py-3 px-2 text-right text-slate-300">{row.Leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <QualityHeatmap data={overview.qualityHeatmap ?? data.qualityHeatmap ?? []} />
    </div>
  );
}