import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Settings2, RefreshCw, CheckCircle2, XCircle, Database, LayoutTemplate, Tag, Plus, X } from 'lucide-react';
import { Evaluation, Dataset, EvaluationRun, GeminiModel } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface EvaluationDetailViewProps {
  evaluation: Evaluation;
  dataset: Dataset;
  onBack: () => void;
  onUpdateEvaluation: (updatedEval: Evaluation) => void;
  apiKey?: string;
}

export const EvaluationDetailView: React.FC<EvaluationDetailViewProps> = ({ evaluation, dataset, onBack, onUpdateEvaluation, apiKey }) => {
  // Configuration State
  const [systemPrompt, setSystemPrompt] = useState(evaluation.systemPrompt || "You are a helpful AI assistant.");
  const [selectedModel, setSelectedModel] = useState<string>(evaluation.model || GeminiModel.FLASH);
  const [inputColumn, setInputColumn] = useState<string>(evaluation.columnMapping?.input || dataset.columns[0] || '');
  const [expectedOutputColumn, setExpectedOutputColumn] = useState<string>(evaluation.columnMapping?.expectedOutput || dataset.columns[1] || '');
  
  // Categories State
  const [categories, setCategories] = useState<string[]>(evaluation.categories || []);
  const [newCategory, setNewCategory] = useState('');

  // Run State
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (evaluation.results && evaluation.results.length > 0) {
        setRuns(evaluation.results);
    } else if (runs.length === 0 && dataset.content.length > 0) {
      const initialRuns: EvaluationRun[] = dataset.content.map((row, index) => ({
        id: `run-${index}`,
        evaluationId: evaluation.id,
        systemPrompt: systemPrompt,
        userInput: row[inputColumn] || "",
        expectedOutput: row[expectedOutputColumn] || "",
        model: selectedModel,
        output: null,
        reasoning: null,
        latencyMs: 0,
        inputTokens: 0,
        outputTokens: 0,
        status: 'idle',
        isMatch: null,
        timestamp: Date.now()
      }));
      setRuns(initialRuns);
    }
  }, [dataset, evaluation.id, evaluation.results, inputColumn, expectedOutputColumn, selectedModel, systemPrompt]);

  // Handle Input Mapping Changes
  const handleMappingChange = (type: 'input' | 'expected', column: string) => {
    if (type === 'input') setInputColumn(column);
    else setExpectedOutputColumn(column);

    // Update runs that haven't been run or to reset context
    setRuns(prev => prev.map((run, idx) => {
      const row = dataset.content[idx];
      return {
        ...run,
        userInput: type === 'input' ? (row[column] || "") : run.userInput,
        expectedOutput: type === 'expected' ? (row[column] || "") : run.expectedOutput
      };
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setProgress(0);

    // Update Eval Object immediately with config
    const updatedEvalConfig = {
        ...evaluation,
        systemPrompt,
        model: selectedModel,
        categories,
        columnMapping: { input: inputColumn, expectedOutput: expectedOutputColumn }
    };
    onUpdateEvaluation(updatedEvalConfig);

    const newRuns = [...runs];
    let completedCount = 0;
    let totalLatency = 0;
    let totalTokens = 0;
    let matchCount = 0;

    for (let i = 0; i < newRuns.length; i++) {
        newRuns[i] = { 
            ...newRuns[i], 
            status: 'running', 
            systemPrompt: systemPrompt, 
            model: selectedModel,
            error: undefined
        };
        setRuns([...newRuns]);

        try {
            const result = await generateWithGemini(systemPrompt, newRuns[i].userInput, selectedModel, categories, apiKey);
            
            const generated = result.output.trim();
            const expected = newRuns[i].expectedOutput.trim();
            const isMatch = generated === expected;

            newRuns[i] = {
                ...newRuns[i],
                status: 'completed',
                output: result.output,
                reasoning: result.reasoning,
                latencyMs: result.latencyMs,
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
                isMatch: isMatch
            };

            totalLatency += result.latencyMs;
            totalTokens += (result.inputTokens + result.outputTokens);
            if (isMatch) matchCount++;

        } catch (error: any) {
            newRuns[i] = { ...newRuns[i], status: 'failed', error: error.message };
        }

        completedCount++;
        setProgress((completedCount / newRuns.length) * 100);
        setRuns([...newRuns]);
    }

    // Final Update with Results
    onUpdateEvaluation({
        ...updatedEvalConfig,
        status: 'completed',
        results: newRuns,
        runCount: newRuns.length,
        passRate: Math.round((matchCount / newRuns.length) * 100),
        totalLatency: totalLatency,
        totalTokens: totalTokens,
        lastUpdated: 'Just now'
    });

    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800"></div>
          <div>
            <h1 className="text-lg font-bold">{evaluation.name}</h1>
            <p className="text-xs text-neutral-500">{dataset.rowCount} rows • {dataset.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
             {isRunning && (
                 <div className="flex items-center gap-2 mr-4">
                     <div className="w-24 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                     </div>
                     <span className="text-xs font-mono text-neutral-500">{Math.round(progress)}%</span>
                 </div>
             )}
            <button 
                onClick={handleRunEvaluation}
                disabled={isRunning}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all text-sm shadow-md"
            >
                {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {isRunning ? 'Running Batch...' : 'Run Evaluation'}
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
          {/* Configuration Pane */}
          <div className="px-6 py-4 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 flex gap-6 shrink-0 h-64">
              
              {/* System Prompt */}
              <div className="flex-1 flex flex-col">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-2">
                      <LayoutTemplate size={14} /> System Instruction
                  </label>
                  <textarea 
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none resize-none font-mono text-sm"
                    placeholder="Enter global system prompt..."
                  />
              </div>

              {/* Middle Column: Categories */}
              <div className="w-80 flex flex-col">
                 <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-2">
                      <Tag size={14} /> Output Categories (Structured)
                  </label>
                  <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 flex flex-col">
                      <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add category..." 
                            className="flex-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={handleAddCategory}
                            className="p-1 bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-80"
                          >
                            <Plus size={16} />
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto content-start flex flex-wrap gap-2">
                          {categories.length === 0 && (
                              <p className="text-xs text-neutral-400 italic w-full text-center mt-4">
                                  No categories defined.<br/>Output will be free-form.
                              </p>
                          )}
                          {categories.map(cat => (
                              <span key={cat} className="inline-flex items-center gap-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded text-xs font-medium">
                                  {cat}
                                  <button onClick={() => handleRemoveCategory(cat)} className="text-neutral-400 hover:text-red-500">
                                      <X size={12} />
                                  </button>
                              </span>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Right Column: Mapping */}
              <div className="w-72 space-y-4">
                  <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-2">
                          <Database size={14} /> Column Mapping
                      </label>
                      <div className="grid grid-cols-1 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold">Input Column</span>
                              <select 
                                value={inputColumn}
                                onChange={(e) => handleMappingChange('input', e.target.value)}
                                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                  {dataset.columns.map(col => <option key={col} value={col}>{col}</option>)}
                              </select>
                          </div>
                          <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold">Expected Output Column</span>
                              <select 
                                value={expectedOutputColumn}
                                onChange={(e) => handleMappingChange('expected', e.target.value)}
                                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                  {dataset.columns.map(col => <option key={col} value={col}>{col}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-2">
                        <Settings2 size={14} /> Model
                    </label>
                    <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-sm outline-none"
                    >
                        <option value={GeminiModel.FLASH}>Gemini 3 Flash</option>
                        <option value={GeminiModel.PRO}>Gemini 3 Pro</option>
                        <option value={GeminiModel.FLASH_2_5}>Gemini 2.5 Flash</option>
                        <option value={GeminiModel.LITE_2_5}>Gemini 2.5 Flash Lite</option>
                    </select>
                  </div>
              </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-black">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white dark:bg-neutral-900 sticky top-0 z-10 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-16 text-center">#</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-64">System Instructions</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-64">Input (Mapped)</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-64">Output (Generated)</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-64">Expected Output</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-32 text-center">Exact Match</th>
                        <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right w-24">Latency</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {runs.map((run, idx) => (
                        <tr key={run.id} className="bg-white dark:bg-black hover:bg-neutral-50 dark:hover:bg-neutral-900/50 group transition-colors">
                            {/* Index */}
                            <td className="px-4 py-3 text-xs text-neutral-400 text-center font-mono">
                                {idx + 1}
                            </td>

                            {/* System Instruction */}
                            <td className="px-4 py-3 text-xs text-neutral-500 align-top">
                                <div className="line-clamp-2 font-mono text-[10px]" title={run.systemPrompt}>
                                    {run.systemPrompt}
                                </div>
                            </td>
                            
                            {/* User Input */}
                            <td className="px-4 py-3 text-xs text-neutral-900 dark:text-neutral-100 align-top font-medium border-l border-neutral-100 dark:border-neutral-800">
                                <div className="whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">{run.userInput}</div>
                            </td>

                            {/* Generated Output */}
                            <td className="px-4 py-3 text-xs align-top border-l border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
                                {run.status === 'running' ? (
                                    <div className="flex items-center gap-2 text-blue-500 animate-pulse">
                                        <RefreshCw size={12} className="animate-spin" /> Generating...
                                    </div>
                                ) : run.status === 'failed' ? (
                                    <div className="text-red-500 flex items-center gap-1">
                                        <XCircle size={12} /> Error
                                    </div>
                                ) : run.output ? (
                                    <div className="space-y-2">
                                        <div className="font-bold text-black dark:text-white px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded w-fit">
                                            {run.output}
                                        </div>
                                        {run.reasoning && (
                                            <div className="text-[10px] text-neutral-500 italic border-l-2 border-neutral-300 dark:border-neutral-700 pl-2">
                                                {run.reasoning}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-neutral-400 font-mono">
                                            {run.inputTokens} in / {run.outputTokens} out
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-neutral-300">-</span>
                                )}
                            </td>

                            {/* Expected Output */}
                            <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 align-top border-l border-neutral-100 dark:border-neutral-800">
                                <div className="font-medium">{run.expectedOutput}</div>
                            </td>

                            {/* Exact Match */}
                            <td className="px-4 py-3 align-top text-center border-l border-neutral-100 dark:border-neutral-800">
                                {run.isMatch === true && (
                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-[10px] font-bold">
                                        <CheckCircle2 size={12} /> MATCH
                                    </span>
                                )}
                                {run.isMatch === false && (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-[10px] font-bold">
                                        <XCircle size={12} /> NO MATCH
                                    </span>
                                )}
                                {run.isMatch === null && <span className="text-neutral-300">-</span>}
                            </td>

                            {/* Latency */}
                            <td className="px-4 py-3 text-xs text-neutral-500 text-right align-top font-mono border-l border-neutral-100 dark:border-neutral-800">
                                {run.latencyMs ? `${run.latencyMs}ms` : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {runs.length === 0 && (
                <div className="p-12 text-center text-neutral-500 text-sm">
                    No data to display. Please ensure dataset is loaded correctly.
                </div>
            )}
          </div>
      </div>
    </div>
  );
};