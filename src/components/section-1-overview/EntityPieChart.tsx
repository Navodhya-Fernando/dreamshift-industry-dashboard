import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function EntityPieChart({ data, filter }: { data: any[], filter: 'Clients' | 'Leads' | 'Both' }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map(item => ({
        name: item.Industry,
        value: filter === 'Clients' ? item.Clients : filter === 'Leads' ? item.Leads : (item.Clients + item.Leads),
        clientsCount: item.Clients,
        leadsCount: item.Leads
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, filter]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
        No data available
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#10b981', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#64748b'];

  // Custom label that draws text at the end of the pointer lines
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15; // Distance from the chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Hide labels for tiny slices to prevent text overlapping
    if (percent < 0.025) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#94a3b8" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-[11px] font-medium tracking-wide"
      >
        {name}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const sliceData = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl z-50 relative min-w-[160px]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">
            {sliceData.name}
          </p>
          <div className="space-y-2">
            {(filter === 'Clients' || filter === 'Both') && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Clients</span>
                <span className="text-blue-400 font-bold">{sliceData.clientsCount}</span>
              </div>
            )}
            {(filter === 'Leads' || filter === 'Both') && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Leads</span>
                <span className="text-emerald-400 font-bold">{sliceData.leadsCount}</span>
              </div>
            )}
            {filter === 'Both' && (
              <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-800">
                <span className="text-slate-100 font-medium">Total</span>
                <span className="text-indigo-400 font-bold">{sliceData.value}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between pt-2">
      
      {/* TOP: Centered Pie Chart with Outward Labels */}
      <div className="w-full h-[280px] relative flex-shrink-0">
        
        {/* Absolute Centered Total inside the Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-3xl font-bold text-slate-100">{total.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Total {filter}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%" className="z-10">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105} 
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
              label={renderCustomizedLabel}
              labelLine={{ stroke: '#475569', strokeWidth: 1 }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="outline-none hover:opacity-80 transition-opacity cursor-pointer" 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BOTTOM: Multi-Column Grid Legend */}
      <div className="w-full mt-2 pt-5 border-t border-slate-800 overflow-y-auto custom-scrollbar flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 px-2">
          {chartData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between group bg-slate-800/20 p-2 rounded-lg border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-100 transition-colors truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-200">{item.value.toLocaleString()}</span>
                  <span className="text-[10px] font-semibold text-slate-500 w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}