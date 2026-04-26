import React from 'react';
import dashboardData from '../../public/data/dashboard_data.json';

// --- THE IMPORTS ARE NOW ACTIVE ---
import OverviewSection from '../components/section-1-overview/OverviewSection';
import MarchConversionTable from '../components/section-1-overview/MarchConversionTable';
import IndustrySection from '../components/section-2-industry/IndustrySection';
import PredictiveSection from '../components/section-3-predictive/PredictiveSection';

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
      
      {/* Premium Minimal Header */}
      <header className="space-y-1">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tighter">DS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">
            Industry Insights
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl pl-11">
          Executive overview reflecting active clients from January 2026 and tally leads mapped from March 2026.
        </p>
      </header>

      <div className="space-y-12">
        {/* Section 1: Executive Overview */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pl-1">
            01 / Executive Overview
          </h2>
          <OverviewSection data={dashboardData.overview} />
          <MarchConversionTable data={dashboardData.conversionTable} />
        </section>

        <hr className="border-slate-800" />

        {/* Section 2: Industry Deep-Dive */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pl-1">
            02 / Industry Deep-Dive
          </h2>
          {/* --- THE PLACEHOLDER IS GONE, COMPONENT IS ACTIVE --- */}
          <IndustrySection 
            specificData={dashboardData.industrySpecific} 
            conversionData={dashboardData.conversionTable} 
            overviewData={dashboardData.overview}
          />
        </section>

        <hr className="border-slate-800" />

        {/* Section 3: Predictive Analytics */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pl-1">
            03 / Predictive Intelligence
          </h2>
          {/* --- THE PLACEHOLDER IS GONE, COMPONENT IS ACTIVE --- */}
          <PredictiveSection data={dashboardData.predictive} />
        </section>
      </div>
      
    </main>
  );
}