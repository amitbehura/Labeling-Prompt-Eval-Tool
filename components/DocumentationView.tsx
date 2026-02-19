import React from 'react';
import { Book, Database, Play, LayoutDashboard, CheckCircle2, Zap, Settings2, HelpCircle, AlertTriangle, ChevronDown } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      <header className="h-20 px-8 flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0 sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-3">
            <Book className="text-neutral-500" /> User Guide & Documentation
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            
            {/* 1. Executive Summary */}
            <section className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Executive Summary</h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <strong>Labeling Prompt Eval</strong> is a specialized development environment designed to solve the "Prompt Engineering Loop" problem. 
                    It moves beyond chat-based testing by enabling <strong>batch evaluation</strong> of Gemini system instructions against ground-truth datasets.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                        <div className="font-bold text-lg mb-2 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Speed</div>
                        <p className="text-sm text-neutral-500">Run 100+ row evaluations in parallel to validate prompt changes instantly.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                        <div className="font-bold text-lg mb-2 flex items-center gap-2"><CheckCircle2 size={20} className="text-green-500"/> Precision</div>
                        <p className="text-sm text-neutral-500">Enforce exact-match scoring against your CSV datasets.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                        <div className="font-bold text-lg mb-2 flex items-center gap-2"><Settings2 size={20} className="text-blue-500"/> Structure</div>
                        <p className="text-sm text-neutral-500">Force JSON outputs and strict schemas to prevent hallucinations.</p>
                    </div>
                </div>
            </section>

            <hr className="border-neutral-200 dark:border-neutral-800" />

            {/* 2. Quick Start Guide */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Play className="text-neutral-400" /> Quick Start Guide
                </h2>
                
                <div className="space-y-8 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                    {/* Step 1 */}
                    <div className="relative">
                        <div className="absolute -left-[25px] bg-black dark:bg-white text-white dark:text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="text-lg font-bold mb-2">Prepare Data</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                            Create a CSV file with two essential columns. One for the input, one for the expected answer.
                        </p>
                        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg font-mono text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                            user_query,expected_intent<br/>
                            "reset my password",account_recovery<br/>
                            "why is my bill so high",billing_inquiry<br/>
                            "cancel my subscription",churn_risk
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                        <div className="absolute -left-[25px] bg-black dark:bg-white text-white dark:text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="text-lg font-bold mb-2">Upload Dataset</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Go to <strong>Datasets</strong> in the sidebar. Click "Upload CSV" and select your file. The tool will parse headers automatically.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                        <div className="absolute -left-[25px] bg-black dark:bg-white text-white dark:text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <h3 className="text-lg font-bold mb-2">Create Evaluation</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Go to <strong>Projects</strong> &rarr; Create Project &rarr; New Evaluation.
                            Select your dataset. In the configuration screen, map your CSV columns:
                            <br/><br/>
                            <span className="inline-block bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded text-xs font-mono">Input Column</span> &rarr; <code>user_query</code>
                            <br/>
                            <span className="inline-block bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded text-xs font-mono mt-1">Expected Output</span> &rarr; <code>expected_intent</code>
                        </p>
                    </div>
                </div>
            </section>

            <hr className="border-neutral-200 dark:border-neutral-800" />

            {/* 3. Advanced Concepts */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Database className="text-neutral-400" /> Core Concepts
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg">Strict Categories</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            When configuring an evaluation, you can define "Output Categories". This injects a specific ENUM schema into the Gemini API call.
                            If you define categories (e.g., <code>POSITIVE</code>, <code>NEGATIVE</code>), the model is mathematically constrained to only output one of those strings.
                            This drastically reduces parsing errors.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-lg">Reasoning Trace</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            We force the model to output a `reasoning` field (limited to ~10 words) before the final answer. 
                            This "Chain of Thought" significantly improves the accuracy of the final classification by allowing the model to "think" first.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-lg">Exact Match Scoring</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            A run is considered a <span className="text-green-600 font-bold">MATCH</span> only if:
                            <br/>
                            <code>Generated Output === Expected Output</code>
                            <br/>
                            This comparison is case-sensitive and whitespace-sensitive (though we trim edges). Ensure your ground truth data is clean.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-lg">Token Economics</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <strong>Gemini 3 Flash</strong> is recommended for high-volume testing due to low latency.
                            <strong>Gemini 3 Pro</strong> is recommended for complex reasoning tasks where the instruction involves nuance.
                            Token usage is tracked per-row and summed in the Analytics view.
                        </p>
                    </div>
                </div>
            </section>

             {/* 4. Troubleshooting */}
             <section className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" /> Troubleshooting
                </h2>
                <div className="space-y-4">
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer font-medium p-3 hover:bg-white dark:hover:bg-black rounded-lg transition-colors">
                            <span>The model output isn't matching my CSV format?</span>
                            <span className="text-neutral-400 group-open:rotate-180 transition-transform"><ChevronDown size={20} /></span>
                        </summary>
                        <div className="px-3 pt-2 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Ensure you have defined <strong>Output Categories</strong> in the configuration pane if you are doing classification. 
                            If you are doing free-form text generation, ensure your System Prompt explicitly tells the model not to add markdown (like ```json) or extra conversational filler.
                        </div>
                    </details>
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer font-medium p-3 hover:bg-white dark:hover:bg-black rounded-lg transition-colors">
                            <span>My CSV upload is failing?</span>
                            <span className="text-neutral-400 group-open:rotate-180 transition-transform"><ChevronDown size={20} /></span>
                        </summary>
                        <div className="px-3 pt-2 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                            The parser expects a standard CSV with a header row. Ensure there are no complex nested quotes that break standard CSV RFC 4180 rules. 
                            Try simplifying the file to just 2 columns.
                        </div>
                    </details>
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer font-medium p-3 hover:bg-white dark:hover:bg-black rounded-lg transition-colors">
                            <span>Latency seems high?</span>
                            <span className="text-neutral-400 group-open:rotate-180 transition-transform"><ChevronDown size={20} /></span>
                        </summary>
                        <div className="px-3 pt-2 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                            If you are using <strong>Gemini 3 Pro</strong>, latency will be higher. Switch to <strong>Gemini 3 Flash</strong> or <strong>2.5 Flash Lite</strong> for speed.
                            Also, ensure your system prompt isn't extremely long (over 5k tokens), as processing time scales with input size.
                        </div>
                    </details>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};