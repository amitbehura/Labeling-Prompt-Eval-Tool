import React from 'react';
import { Plus, ArrowLeft, Search, Filter, Play, CheckCircle2, Clock, Type, MoreVertical } from 'lucide-react';
import { Project, Evaluation, GeminiModel } from '../types';

interface ProjectEvaluationsViewProps {
  project: Project;
  evaluations: Evaluation[];
  onBack: () => void;
  onNewEvaluation: () => void;
  onSelectEvaluation: (evaluation: Evaluation) => void;
}

export const ProjectEvaluationsView: React.FC<ProjectEvaluationsViewProps> = ({ 
  project, 
  evaluations, 
  onBack, 
  onNewEvaluation, 
  onSelectEvaluation 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    {project.name}
                    <span className="text-neutral-400 font-normal">/ Evaluations</span>
                </h1>
            </div>
        </div>
        <button 
            onClick={onNewEvaluation}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
        >
            <Plus size={16} /> New Evaluation
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col pt-8">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input 
                        type="text" 
                        placeholder="Search evaluations..." 
                        className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm w-64 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                    <Filter size={14} /> Filter
                </button>
            </div>
            <div className="text-sm text-neutral-500">
                {evaluations.length} total runs
            </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1 overflow-hidden flex flex-col shadow-sm">
            
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50/50 dark:bg-neutral-900">
                <div className="col-span-3">Evaluation Name</div>
                <div className="col-span-2">Model</div>
                <div className="col-span-2">Score (Pass Rate)</div>
                <div className="col-span-1">Latency</div>
                <div className="col-span-2">Token Usage</div>
                <div className="col-span-2 text-right">Last Updated</div>
            </div>

            <div className="overflow-y-auto flex-1">
                {evaluations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                         <p>No evaluations yet.</p>
                         <button onClick={onNewEvaluation} className="text-blue-600 hover:underline text-sm mt-2">Start your first run</button>
                    </div>
                ) : (
                    evaluations.map((evalRun) => (
                        <div 
                            key={evalRun.id} 
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors items-center group cursor-pointer"
                            onClick={() => onSelectEvaluation(evalRun)}
                        >
                            <div className="col-span-3 font-medium text-sm flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded flex items-center justify-center ${evalRun.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-500'}`}>
                                     {evalRun.status === 'completed' ? <CheckCircle2 size={16} /> : <Play size={16} />}
                                 </div>
                                 <div>
                                    <div className="font-bold truncate">{evalRun.name}</div>
                                    <div className="text-xs text-neutral-400 font-normal">{evalRun.runCount} rows</div>
                                 </div>
                            </div>
                            <div className="col-span-2">
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs font-mono">
                                    {evalRun.model.replace('gemini-', '').replace('-preview', '').replace('-latest', '')}
                                </span>
                            </div>
                            <div className="col-span-2">
                                 {evalRun.status === 'completed' ? (
                                     <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${evalRun.passRate > 80 ? 'bg-green-500' : evalRun.passRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${evalRun.passRate}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold">{evalRun.passRate}%</span>
                                     </div>
                                 ) : (
                                     <span className="text-xs text-neutral-400 italic">Not run</span>
                                 )}
                            </div>
                            <div className="col-span-1 text-sm font-mono text-neutral-500">
                                {evalRun.totalLatency > 0 ? `${(evalRun.totalLatency / 1000).toFixed(2)}s` : '-'}
                            </div>
                            <div className="col-span-2 text-sm font-mono text-neutral-500">
                                {evalRun.totalTokens > 0 ? evalRun.totalTokens.toLocaleString() : '-'}
                            </div>
                            <div className="col-span-2 text-right text-xs text-neutral-500 relative">
                                 {evalRun.lastUpdated}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};