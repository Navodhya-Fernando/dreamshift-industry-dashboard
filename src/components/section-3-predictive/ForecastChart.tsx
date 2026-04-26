import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ForecastChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Not enough data to generate forecast</div>;
  }

  const formattedData = data.map(item => {
    const dateObj = new Date(item.date);
    return {
      ...item,
      displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-800 p-3 rounded-lg shadow-lg">
          <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-medium text-slate-100">
            Predicted Clients: <span className="font-bold text-violet-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="predictedClients" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          strokeDasharray="5 5"
          fillOpacity={1} 
          fill="url(#colorForecast)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}