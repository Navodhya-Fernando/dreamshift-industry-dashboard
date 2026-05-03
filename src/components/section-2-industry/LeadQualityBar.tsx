import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LeadQualityBar({ data }: { data: any[] }) {
  const order = ['High Quality Lead', 'Mid Quality Lead', 'Low Quality Lead', 'Unknown'];
  const sortedData = [...data].sort((left, right) => order.indexOf(left.quality) - order.indexOf(right.quality));

  const getBarColor = (quality: string) => {
    const q = quality.toLowerCase();
    if (q.includes('high')) return '#10b981';
    if (q.includes('mid')) return '#f59e0b';
    if (q.includes('low')) return '#f97316';
    return '#64748b';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-lg">
          <p className="mb-1 text-xs font-semibold text-slate-400">{payload[0].payload.quality}</p>
          <p className="text-sm font-medium text-slate-100">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-100">Lead Quality Distribution</h3>
        <p className="text-sm text-slate-400">Low, high, unknown, and mid quality leads.</p>
      </div>

      <div className="w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="quality" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={120}
          />
          <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.24)' }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.quality)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}