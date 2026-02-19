import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, MessageSquare, Database, Trophy, Filter, Activity, BarChart } from 'lucide-react';
import { Project, Evaluation } from '../types';

// Enhanced mock data with both Latency (seconds) and Queries (count)
const mockData = [
  { name: 'Feb 04', latency: 0.45, queries: 124 },
  { name: 'Feb 05', latency: 0.52, queries: 138 },
  { name: 'Feb 06', latency: 0.48, queries: 142 },
  { name: 'Feb 07', latency: 0.49, queries: 115 },
  { name: 'Feb 08', latency: 0.51, queries: 167 },
  { name: 'Feb 09', latency: 0.47, queries: 189 },
  { name: 'Feb 10', latency: 0.46, queries: 154 },
  { name: 'Feb 11', latency: 0.44, queries: 132 },
  { name: 'Feb 12', latency: 0.48, queries: 145 },
  { name: 'Feb 13', latency: 0.55, queries: 210 },
  { name: 'Feb 14', latency: 0.53, queries: 198 },
  { name: 'Feb 15', latency: 0.58, queries: 245 },
  { name: 'Feb 16', latency: 0.84, queries: 312 },
  { name: 'Feb 17', latency: 0.62, queries: 280 },
  { name: 'Feb 18', latency: 0.49, queries: 225 },
];

interface AnalyticsViewProps {
    projects?: Project[];
    evaluations?: Evaluation[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects = [], evaluations = [] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'latency' | 'queries'>('latency');

  const filteredEvaluations = useMemo(() => {
      if (selectedProjectId === 'all') return evaluations;
      return evaluations.filter(e => e.projectId === selectedProjectId);
  }, [selectedProjectId, evaluations]);

  const topEvaluations = useMemo(() => {
      return [...filteredEvaluations].sort((a, b) => b.passRate - a.passRate).slice(0, 5);
  }, [filteredEvaluations]);

  const stats = useMemo(() => {
      const count = filteredEvaluations.length;
      if (count === 0) return { avgPassRate: 0, activeModels: 0, totalRuns: 0 };

      const totalPassRate = filteredEvaluations.reduce((acc, curr) => acc + curr.passRate, 0);
      const uniqueModels = new Set(filteredEvaluations.map(e => e.model)).size;
      
      return {
          avgPassRate: Math.round(totalPassRate / count),
          activeModels: uniqueModels,
          totalRuns: count
      };
  }, [filteredEvaluations]);

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <Filter size={14} className="text-neutral-500" />
                    <select 
                        value={selectedProjectId} 
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="bg-transparent text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer hover:text-black dark:hover:text-white pr-2"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        <div className="text-sm text-neutral-500">Last 15 days</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between">
             <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Evaluations</div>
                 <div className="text-3xl font-bold">{stats.totalRuns}</div>
             </div>
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                 <Activity size={20} />
             </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between">
             <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Avg Pass Rate</div>
                 <div className={`text-3xl font-bold ${stats.avgPassRate >= 80 ? 'text-green-500' : stats.avgPassRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                     {stats.avgPassRate}%
                 </div>
             </div>
             <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg">
                 <Trophy size={20} />
             </div>
          </div>
           <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between">
             <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Active Models</div>
                 <div className="text-3xl font-bold">
                     {stats.activeModels}
                 </div>
             </div>
             <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                 <Database size={20} />
             </div>
          </div>
      </div>

      <div className="space-y-6">
         {/* Top Evaluations Card */}
         <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-neutral-50/50 dark:bg-neutral-900">
                 <BarChart size={16} className="text-neutral-500" />
                 <h3 className="font-bold text-sm uppercase tracking-wide text-neutral-500">Top Performing Evaluations {selectedProjectId !== 'all' && '(Filtered)'}</h3>
             </div>
             <table className="w-full text-left text-sm">
                 <thead className="bg-neutral-50 dark:bg-black text-xs font-bold text-neutral-500 uppercase border-b border-neutral-100 dark:border-neutral-800">
                     <tr>
                         <th className="px-6 py-3">Evaluation</th>
                         <th className="px-6 py-3">Project</th>
                         <th className="px-6 py-3">Model</th>
                         <th className="px-6 py-3 text-right">Score</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                     {topEvaluations.length > 0 ? topEvaluations.map(e => (
                         <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                             <td className="px-6 py-3 font-medium">{e.name}</td>
                             <td className="px-6 py-3 text-neutral-500">{projects.find(p => p.id === e.projectId)?.name || '-'}</td>
                             <td className="px-6 py-3 font-mono text-xs text-neutral-500">
                                 {e.model.replace('gemini-', '').replace('-preview', '').replace('-latest', '')}
                             </td>
                             <td className="px-6 py-3 text-right font-bold text-green-600">{e.passRate}%</td>
                         </tr>
                     )) : (
                         <tr>
                             <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">No evaluations recorded for this selection.</td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>

         {/* Chart Card */}
         <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm h-[400px] flex flex-col">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-sm uppercase tracking-wide text-neutral-500">
                    {chartMetric === 'latency' ? 'Global API Latency (s)' : 'Total Queries (Count)'}
                 </h3>
                 <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setChartMetric('latency')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${chartMetric === 'latency' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                    >
                        Latency
                    </button>
                    <button 
                        onClick={() => setChartMetric('queries')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${chartMetric === 'queries' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                    >
                        Queries
                    </button>
                 </div>
             </div>

             <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartMetric === 'latency' ? '#2563eb' : '#10b981'} stopOpacity={0.1}/>
                                <stop offset="95%" stopColor={chartMetric === 'latency' ? '#2563eb' : '#10b981'} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#a3a3a3', fontSize: 10}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#a3a3a3', fontSize: 10}} 
                            dx={-10}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [value, chartMetric === 'latency' ? 'Seconds' : 'Queries']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={chartMetric} 
                            stroke={chartMetric === 'latency' ? '#000' : '#10b981'} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorMetric)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: chartMetric === 'latency' ? '#000' : '#10b981' }}
                            className={chartMetric === 'latency' ? "dark:stroke-white dark:fill-white/10" : ""}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
         </div>
      </div>
    </div>
  );
};