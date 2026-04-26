import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LeadQualityBar({ data }: { data: any[] }) {
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const getBarColor = (quality: string) => {
    const q = quality.toLowerCase();
    if (q.includes('high')) return '#10b981';
    if (q.includes('low')) return '#f43f5e';
    if (q.includes('mid') || q.includes('unsure')) return '#f59e0b';
    return '#64748b';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg">
          <p className="text-xs font-semibold text-slate-500 mb-1">{payload[0].payload.quality}</p>
          <p className="text-sm font-medium text-slate-900">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex-1 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="quality" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#475569' }}
            width={120}
          />
          <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.quality)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}