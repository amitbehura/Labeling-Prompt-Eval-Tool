import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, RefreshCw, Zap, Scale, Terminal, Cpu } from 'lucide-react';
import { GeminiModel } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface EvaluatorProps {
  onBack: () => void;
}

export const Evaluator: React.FC<EvaluatorProps> = ({ onBack }) => {
  // Inputs
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userInput, setUserInput] = useState("Explain quantum computing to a 5 year old.");
  const [expectedOutput, setExpectedOutput] = useState("Quantum computing uses magic bits called qubits that can be both 0 and 1 at the same time, unlike regular computers.");
  const [selectedModel, setSelectedModel] = useState<string>(GeminiModel.FLASH);

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [latency, setLatency] = useState<number>(0);
  const [inputTokens, setInputTokens] = useState<number>(0);
  const [outputTokens, setOutputTokens] = useState<number>(0);
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMatchResult(null); // Reset eval
    
    try {
      const result = await generateWithGemini(systemPrompt, userInput, selectedModel);
      setOutput(result.output);
      setReasoning(result.reasoning);
      setLatency(result.latencyMs);
      setInputTokens(result.inputTokens);
      setOutputTokens(result.outputTokens);
    } catch (error) {
      console.error(error);
      setOutput("Error generating response. Please check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = () => {
    if (!output) return;
    
    // Strict exact match
    const isExactMatch = output.trim() === expectedOutput.trim();
    setMatchResult(isExactMatch);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white">
            &larr; Projects
          </button>
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800"></div>
          <h1 className="text-lg font-bold">New Evaluation Run</h1>
        </div>
        
        <div className="flex items-center gap-3">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
                <option value={GeminiModel.FLASH}>Gemini 3 Flash</option>
                <option value={GeminiModel.PRO}>Gemini 3 Pro</option>
                <option value={GeminiModel.FLASH_2_5}>Gemini 2.5 Flash</option>
                <option value={GeminiModel.LITE_2_5}>Gemini 2.5 Flash Lite</option>
            </select>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Pane: Configuration */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800">
           <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* System Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <Terminal size={14} /> System Prompt
                </label>
                <textarea 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none font-mono text-sm shadow-sm"
                  placeholder="Enter system instructions..."
                />
              </div>

              {/* User Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <Zap size={14} /> User Input
                </label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full h-24 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none font-mono text-sm shadow-sm"
                  placeholder="Enter user prompt..."
                />
              </div>

              {/* Expected Output */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Expected Output (Exact Match)
                </label>
                <textarea 
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  className="w-full h-24 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none font-mono text-sm shadow-sm"
                  placeholder="Enter the exact expected string..."
                />
              </div>

              {/* Action Button 1 */}
              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                        <RefreshCw className="animate-spin" size={18} /> Generating...
                    </>
                  ) : (
                    <>
                        <Play size={18} /> Run Generation
                    </>
                  )}
                </button>
              </div>

           </div>
        </div>

        {/* Right Pane: Results */}
        <div className="w-1/2 p-6 overflow-y-auto bg-neutral-100 dark:bg-neutral-900/30">
           <div className="space-y-6 max-w-2xl mx-auto">
              
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Generation Results</h2>
                 {output && (
                     <div className="flex gap-4 text-xs font-mono text-neutral-500">
                        <span className="flex items-center gap-1"><RefreshCw size={12}/> {latency}ms</span>
                        <span className="flex items-center gap-1"><Cpu size={12}/> {inputTokens} in / {outputTokens} out</span>
                     </div>
                 )}
              </div>

              {/* Output Card */}
              <div className={`relative min-h-[160px] p-6 rounded-xl border transition-all duration-300 ${output ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-md' : 'bg-transparent border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center'}`}>
                  {output ? (
                      <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Output</span>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{output}</p>
                          </div>
                          {reasoning && (
                              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Reasoning (Max 10 words)</span>
                                <p className="text-xs italic text-neutral-600 dark:text-neutral-400">{reasoning}</p>
                              </div>
                          )}
                      </div>
                  ) : (
                      <div className="text-neutral-400 text-sm text-center">
                          Generated output will appear here
                      </div>
                  )}
              </div>

              {/* Evaluation Section */}
              {output && (
                  <div className="animate-fade-in-up">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                             <Scale size={14} /> Evaluation
                         </h2>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md flex items-center justify-between">
                           <div>
                               <p className="text-sm font-medium mb-1">Exact Match Check</p>
                               <p className="text-xs text-neutral-500">Compares expected output with generated output.</p>
                           </div>
                           
                           {matchResult === null ? (
                               <button 
                                onClick={handleEvaluate}
                                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg text-sm font-bold transition-colors"
                               >
                                   Evaluate
                               </button>
                           ) : (
                               <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${matchResult ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                   {matchResult ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                   {matchResult ? 'MATCH' : 'MISMATCH'}
                               </div>
                           )}
                      </div>
                  </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};