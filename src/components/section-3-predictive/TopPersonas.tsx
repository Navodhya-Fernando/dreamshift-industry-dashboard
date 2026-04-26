import React from 'react';
import { User, MapPin, Briefcase, FileText } from 'lucide-react';

export default function TopPersonas({ data }: { data: any[] }) {
  return (
    <div className="space-y-4">
      {data.map((persona, index) => (
        <div 
          key={index} 
          className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
          
          <div className="flex justify-between items-start mb-4 pl-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-slate-100">{persona.persona}</h4>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center shadow-sm">
              <span className="text-xs font-bold">{persona.conversionRate}% Conv.</span>
            </div>
          </div>

          <div className="space-y-2.5 pl-2">
            <div className="flex items-center text-sm">
              <Briefcase className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
              <span className="text-slate-300 truncate"><strong className="font-medium text-slate-100">Target:</strong> {persona.topIndustry}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
              <span className="text-slate-300 truncate"><strong className="font-medium text-slate-100">Location:</strong> {persona.topState}</span>
            </div>
            <div className="flex items-center text-sm">
              <FileText className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
              <span className="text-slate-300 truncate"><strong className="font-medium text-slate-100">Visa:</strong> {persona.topVisa}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}