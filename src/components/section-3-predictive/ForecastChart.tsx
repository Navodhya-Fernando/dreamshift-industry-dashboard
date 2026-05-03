import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ForecastChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Not enough data to generate forecast</div>;
  }

  const formattedData = data.map(item => {
    return {
      ...item,
      displayDate: item.date
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
        <XAxis 
          dataKey="displayDate" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          dy={10}
          minTickGap={20}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b' }} 
        />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-lg">
                <p className="mb-1 text-xs font-semibold text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-100">
                  Predicted clients: <span className="font-bold text-sky-400">{payload[0].value}</span>
                </p>
              </div>
            );
          }}
        />
        <Area 
          type="monotone" 
          dataKey="predictedClients" 
          stroke="#38bdf8" 
          strokeWidth={2}
          strokeDasharray="5 5"
          fillOpacity={1} 
          fill="url(#colorForecast)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}