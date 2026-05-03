'use client';

import React from 'react';
import Probabilities from './Probabilities';
import TopPersonas from './TopPersonas';
import ForecastChart from './ForecastChart';
import type { DashboardPayload } from '../../lib/dashboard';

export default function PredictiveSection({ data }: { data: DashboardPayload }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden h-[500px]">
        <div className="p-6 border-b border-slate-800 bg-slate-900 z-10">
          <h3 className="text-base font-semibold text-slate-100">Conversion Probability</h3>
          <p className="text-sm text-slate-400">LogReg model prediction by sector.</p>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <Probabilities data={data.probabilities ?? []} />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col h-[500px]">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">High-Value Personas</h3>
          <p className="text-sm text-slate-400">K-Means clustering of top segments.</p>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-900/50">
          <TopPersonas data={data.personas ?? []} />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col h-[500px]">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">30-Day Client Forecast</h3>
          <p className="text-sm text-slate-400">Exponential smoothing projection.</p>
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 min-h-0 relative -ml-4">
             <ForecastChart data={data.forecast ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}