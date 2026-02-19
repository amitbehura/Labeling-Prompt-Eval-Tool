import React, { useState, useEffect, useRef } from 'react';
import { Key, Save, Check, Shield, AlertCircle, Download, Upload, FileJson, Database } from 'lucide-react';
import { Project, Dataset, Evaluation } from '../types';

interface SettingsViewProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  projects: Project[];
  datasets: Dataset[];
  evaluations: Evaluation[];
  onImportData: (data: { projects: Project[], datasets: Dataset[], evaluations: Evaluation[] }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  apiKey, 
  onSaveApiKey, 
  projects, 
  datasets, 
  evaluations, 
  onImportData 
}) => {
  const [inputValue, setInputValue] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onSaveApiKey(inputValue);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      projects,
      datasets,
      evaluations,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `labeling-eval-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.projects && Array.isArray(json.projects)) {
             onImportData(json);
             alert(`Successfully imported ${json.projects.length} projects, ${json.datasets?.length || 0} datasets, and ${json.evaluations?.length || 0} evaluations.`);
        } else {
            alert("Invalid backup file format. Could not find project data.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      <header className="h-20 px-8 flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0 sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-3">
            <SettingsIcon className="text-neutral-500" /> Settings
        </h1>
      </header>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
            
            {/* API Key Section */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 shrink-0">
                        <Key size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Gemini API Key</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            By default, the application uses the system-configured API key. 
                            You can override this by providing your own key below.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">
                            Your API Key
                        </label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {inputValue && (
                                    <Shield size={16} className="text-green-500" />
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                            <Shield size={12} /> Stored locally in your browser. Never sent to our servers.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center gap-4">
                        <button 
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all
                                ${isSaved 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                                }
                            `}
                        >
                            {isSaved ? <Check size={16} /> : <Save size={16} />}
                            {isSaved ? 'Saved!' : 'Save Configuration'}
                        </button>
                        {inputValue && (
                             <button 
                                onClick={() => { setInputValue(''); onSaveApiKey(''); }}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                             >
                                Clear Key
                             </button>
                        )}
                    </div>
                </div>
            </section>
            
            {/* Data Management Section */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 shrink-0">
                        <Database size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Data Management</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            Export your entire workspace (Projects, Datasets, Evaluations) to a JSON file for backup or transfer.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download size={20} />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Export Data</div>
                            <div className="text-xs text-neutral-400 mt-1">Save JSON snapshot</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Import Data</div>
                            <div className="text-xs text-neutral-400 mt-1">Restore from JSON</div>
                        </div>
                        <input 
                            type="file" 
                            accept=".json"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImportFile}
                        />
                    </button>
                </div>
                
                <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-start gap-3">
                    <FileJson size={16} className="text-neutral-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-neutral-500">
                        <strong>Current State:</strong> {projects.length} Projects, {datasets.length} Datasets, {evaluations.length} Evaluation Runs.
                    </div>
                </div>
            </section>

             {/* Info Section */}
             <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 p-6 flex gap-4">
                <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">Why add your own key?</p>
                    <p>
                        Using your own key allows you to access higher rate limits and ensures your evaluation runs aren't interrupted by shared quota limits.
                        You can generate a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-blue-600">Google AI Studio</a>.
                    </p>
                </div>
             </section>

        </div>
      </div>
    </div>
  );
};

const SettingsIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);