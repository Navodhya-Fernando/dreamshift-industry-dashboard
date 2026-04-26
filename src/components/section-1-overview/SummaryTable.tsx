export default function SummaryTable({ tableData }: { tableData: any[] }) {
  if (!Array.isArray(tableData)) return null;
  
  const sortedData = [...tableData].sort((a, b) => a.Industry.localeCompare(b.Industry));

  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
        <tr>
          <th className="px-6 py-4 font-medium">Industry</th>
          <th className="px-6 py-4 font-medium text-right">Clients</th>
          <th className="px-6 py-4 font-medium text-right">Leads</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {sortedData.map((row, i) => (
          <tr 
            key={i} 
            className="hover:bg-slate-900/50 transition-colors duration-150 group"
          >
            <td className="px-6 py-4 font-medium text-slate-300 whitespace-nowrap">
              {row.Industry}
            </td>
            <td className="px-6 py-4 text-right text-slate-400 group-hover:text-slate-100 transition-colors">
              {row.Clients.toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right text-slate-400 group-hover:text-slate-100 transition-colors">
              {row.Leads.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}