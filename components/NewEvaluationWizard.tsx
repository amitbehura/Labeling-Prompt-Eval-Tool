import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Dataset, Project, GeminiModel } from '../types';
import { parseCSV } from '../utils/csvUtils';

interface NewEvaluationWizardProps {
  project: Project;
  datasets: Dataset[];
  onAddDataset: (dataset: Dataset) => void;
  onCancel: () => void;
  onComplete: (name: string, datasetId: string, model: string) => void;
}

export const NewEvaluationWizard: React.FC<NewEvaluationWizardProps> = ({ 
  project,
  datasets, 
  onAddDataset, 
  onCancel, 
  onComplete 
}) => {
  const [step, setStep] = useState(1);
  const [evalName, setEvalName] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(GeminiModel.FLASH);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && evalName.trim()) {
      setStep(2);
    } else if (step === 2 && selectedDatasetId) {
      onComplete(evalName, selectedDatasetId, selectedModel);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onCancel();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const { headers, content, rowCount } = parseCSV(text);
        
        const newDataset: Dataset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.replace('.csv', ''),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rowCount,
          columns: headers,
          content
        };

        onAddDataset(newDataset);
        setSelectedDatasetId(newDataset.id);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse CSV');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
        setUploadError('Failed to read file');
        setIsUploading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black">
      <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0">
        <h1 className="text-2xl font-bold">New Evaluation Run</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
           <span className={`${step === 1 ? 'text-black dark:text-white font-bold' : ''}`}>1. Config</span>
           <span className="text-neutral-300">/</span>
           <span className={`${step === 2 ? 'text-black dark:text-white font-bold' : ''}`}>2. Dataset</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
           
           <div className="flex-1 p-10">
              {step === 1 && (
                  <div className="space-y-8 animate-fade-in-up">
                      <div>
                          <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                              Evaluation Name
                          </label>
                          <input 
                            type="text" 
                            autoFocus
                            value={evalName}
                            onChange={(e) => setEvalName(e.target.value)}
                            placeholder="e.g., Prompt V1 Test"
                            className="w-full text-xl p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-neutral-300"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                              Initial Model
                          </label>
                          <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                             <option value={GeminiModel.FLASH}>Gemini 3 Flash</option>
                             <option value={GeminiModel.PRO}>Gemini 3 Pro</option>
                             <option value={GeminiModel.FLASH_2_5}>Gemini 2.5 Flash</option>
                             <option value={GeminiModel.LITE_2_5}>Gemini 2.5 Flash Lite</option>
                          </select>
                      </div>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold">Choose a Dataset</h3>
                            <p className="text-sm text-neutral-500">Select an existing dataset or upload a new CSV.</p>
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                             <Upload size={14} /> Upload New
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept=".csv" 
                            className="hidden" 
                            onChange={handleFileUpload}
                          />
                      </div>

                      {uploadError && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                              <AlertCircle size={16} /> {uploadError}
                          </div>
                      )}

                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px]">
                          {datasets.length === 0 ? (
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="h-40 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all"
                              >
                                  <Upload size={24} className="mb-2" />
                                  <span className="font-medium">No datasets found. Click to upload CSV.</span>
                              </div>
                          ) : (
                              datasets.map(ds => (
                                  <div 
                                    key={ds.id}
                                    onClick={() => setSelectedDatasetId(ds.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedDatasetId === ds.id 
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                            : 'border-transparent bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }
                                    `}
                                  >
                                      <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDatasetId === ds.id ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}`}>
                                              <FileSpreadsheet size={20} />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-sm">{ds.name}</h4>
                                              <p className="text-xs text-neutral-500">{ds.rowCount} rows • Updated {ds.date}</p>
                                          </div>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                          ${selectedDatasetId === ds.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-neutral-300 dark:border-neutral-600'}
                                      `}>
                                          {selectedDatasetId === ds.id && <CheckCircle2 size={12} />}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
           </div>

           <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <button 
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                  {step === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button 
                onClick={handleNext}
                disabled={step === 1 ? !evalName.trim() : !selectedDatasetId}
                className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                  {step === 1 ? (
                    <>Next <ArrowRight size={16}/></>
                  ) : (
                    <>Create Evaluation</>
                  )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};