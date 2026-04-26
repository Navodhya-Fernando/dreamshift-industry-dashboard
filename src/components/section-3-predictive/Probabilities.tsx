import React from 'react';

export default function Probabilities({ data }: { data: any[] }) {
  const sortedData = [...data].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-5">
      {sortedData.map((item, index) => (
        <div key={index} className="group">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
              {item.industry}
            </span>
            <span className="text-xs font-semibold text-slate-100">
              {item.probability.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-1.5 rounded-full bg-indigo-500 transition-all duration-1000 ease-out" 
              style={{ width: `${item.probability}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}