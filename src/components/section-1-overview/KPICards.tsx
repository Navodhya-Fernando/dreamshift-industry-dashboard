import { Users, Target, Briefcase } from 'lucide-react';

interface KPIProps {
  clients: number;
  leads: number;
  industries: number;
}

export default function KPICards({ clients, leads, industries }: KPIProps) {
  const cards = [
    { 
      title: 'Total Clients', 
      value: clients, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50/50',
      border: 'border-blue-100'
    },
    { 
      title: 'Total Leads', 
      value: leads, 
      icon: Target, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100'
    },
    { 
      title: 'Active Industries', 
      value: industries, 
      icon: Briefcase, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-start space-x-4 transition-all hover:shadow-md"
        >
          <div className={`p-2.5 rounded-xl border ${card.bg} ${card.border}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{card.title}</p>
            <p className="text-2xl font-semibold text-slate-100 tracking-tight">
              {card.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}