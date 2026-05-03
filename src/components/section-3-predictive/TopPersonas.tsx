import React from 'react';
import { Briefcase, MapPin, Shield, User } from 'lucide-react';

export default function TopPersonas({ data }: { data: any[] }) {
  return (
    <div className="space-y-4">
      {data.map((persona, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm transition-all duration-200 hover:border-slate-700"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-400"></div>
          
          <div className="flex justify-between items-start mb-4 pl-2">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-slate-900 p-1.5 text-sky-400">
                <User className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-slate-100">{persona.persona}</h4>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 shadow-sm">
              <span className="text-xs font-bold">{persona.conversionRate}%</span>
            </div>
          </div>

          <div className="space-y-2.5 pl-2">
            <div className="flex items-center text-sm">
              <Briefcase className="mr-2.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="truncate text-slate-300"><strong className="font-medium text-slate-100">Target:</strong> {persona.targetIndustry}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-2.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="truncate text-slate-300"><strong className="font-medium text-slate-100">Location:</strong> {persona.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Shield className="mr-2.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="truncate text-slate-300"><strong className="font-medium text-slate-100">Visa:</strong> {persona.visaStatus}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}