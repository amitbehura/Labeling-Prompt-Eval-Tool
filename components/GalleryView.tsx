import React, { useState } from 'react';
import { Project, Evaluation, EvaluationRun } from '../types';
import { Scale, ChevronDown, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface GalleryViewProps {
  projects: Project[];
  evaluations: Evaluation[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ projects, evaluations }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [evalIdA, setEvalIdA] = useState<string>('');
  const [evalIdB, setEvalIdB] = useState<string>('');

  const projectEvals = evaluations.filter(e => e.projectId === selectedProjectId);
  const evalA = projectEvals.find(e => e.id === evalIdA);
  const evalB = projectEvals.find(e => e.id === evalIdB);

  // Helper to sync rows by input (index based for now, assuming same dataset)
  const renderComparison = () => {
    if (!evalA || !evalB) return null;
    
    // We assume both evaluations use the same dataset/ordering for now.
    // A robust solution would join on input string.
    return (
        <div className="space-y-4">
            {evalA.results.map((resA, idx) => {
                const resB = evalB.results[idx];
                if (!resB) return null;

                return (
                    <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                        <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Input</h4>
                            <p className="text-sm font-medium">{resA.userInput}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Side A */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-400">{evalA.name}</span>
                                    {resA.isMatch ? (
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    ) : (
                                        <XCircle size={14} className="text-red-500" />
                                    )}
                                </div>
                                <div className="p-3 bg-neutral-50 dark:bg-black rounded-lg text-sm border border-neutral-200 dark:border-neutral-800 min-h-[80px]">
                                    {resA.output || <span className="text-neutral-400 italic">No output</span>}
                                </div>
                                <div className="text-xs text-neutral-500 italic">
                                    Reasoning: {resA.reasoning || '-'}
                                </div>
                            </div>
                            {/* Side B */}
                            <div className="space-y-2 border-l border-neutral-100 dark:border-neutral-800 pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-400">{evalB.name}</span>
                                    {resB.isMatch ? (
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    ) : (
                                        <XCircle size={14} className="text-red-500" />
                                    )}
                                </div>
                                <div className="p-3 bg-neutral-50 dark:bg-black rounded-lg text-sm border border-neutral-200 dark:border-neutral-800 min-h-[80px]">
                                    {resB.output || <span className="text-neutral-400 italic">No output</span>}
                                </div>
                                <div className="text-xs text-neutral-500 italic">
                                    Reasoning: {resB.reasoning || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black">
       <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0">
         <h1 className="text-2xl font-bold">Evaluator Gallery</h1>
       </header>

       <div className="p-8 overflow-y-auto flex-1">
          {/* Selectors */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8">
              <div className="grid grid-cols-3 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">1. Select Project</label>
                      <select 
                        value={selectedProjectId}
                        onChange={(e) => { setSelectedProjectId(e.target.value); setEvalIdA(''); setEvalIdB(''); }}
                        className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-sm"
                      >
                          <option value="">Choose a project...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">2. Evaluation A (Left)</label>
                      <select 
                        value={evalIdA}
                        onChange={(e) => setEvalIdA(e.target.value)}
                        disabled={!selectedProjectId}
                        className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-sm disabled:opacity-50"
                      >
                          <option value="">Choose evaluation...</option>
                          {projectEvals.map(e => <option key={e.id} value={e.id}>{e.name} ({e.model})</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">3. Evaluation B (Right)</label>
                      <select 
                        value={evalIdB}
                        onChange={(e) => setEvalIdB(e.target.value)}
                        disabled={!selectedProjectId}
                        className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-sm disabled:opacity-50"
                      >
                          <option value="">Choose evaluation...</option>
                          {projectEvals.map(e => <option key={e.id} value={e.id}>{e.name} ({e.model})</option>)}
                      </select>
                  </div>
              </div>
          </div>

          {/* Comparison Area */}
          {evalA && evalB ? (
              renderComparison()
          ) : (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <Scale size={32} className="mb-4 opacity-50" />
                  <p>Select a project and two evaluations to compare results side-by-side.</p>
              </div>
          )}
       </div>
    </div>
  );
};