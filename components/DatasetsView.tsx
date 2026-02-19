import React, { useRef, useState } from 'react';
import { MoreVertical, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Dataset } from '../types';
import { parseCSV } from '../utils/csvUtils';

interface DatasetsViewProps {
  datasets: Dataset[];
  onAddDataset: (dataset: Dataset) => void;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({ datasets, onAddDataset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("File is empty");

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
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV");
        console.error(err);
      } finally {
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <h1 className="text-2xl font-bold">Datasets</h1>
        <MoreVertical className="text-neutral-500" />
      </header>
      
      <div className="p-8 overflow-y-auto flex-1">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="font-bold">My Datasets</h2>
                    {error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}
                 </div>
                 <div className="flex gap-3">
                     <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        Create empty
                     </button>
                     <button 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isUploading ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <Upload size={16} /> Upload CSV
                          </>
                        )}
                     </button>
                     <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                     />
                 </div>
             </div>

             <div className="w-full">
                 <div className="grid grid-cols-12 px-4 py-3 bg-neutral-50 dark:bg-black text-xs font-bold text-neutral-500 uppercase tracking-wider rounded-t-lg">
                     <div className="col-span-4">Name</div>
                     <div className="col-span-4">Details</div>
                     <div className="col-span-4 text-right">Updated</div>
                 </div>
                 {datasets.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-neutral-500 text-sm border-b border-l border-r border-neutral-100 dark:border-neutral-800 rounded-b-lg bg-neutral-50/10">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                           <FileSpreadsheet size={24} />
                        </div>
                        <p className="mb-2 font-medium">No datasets found</p>
                        <p className="text-xs text-neutral-400 max-w-xs text-center">
                            Upload a CSV file containing your evaluation data. 
                            Supported format: Comma-separated values with a header row.
                        </p>
                    </div>
                 ) : (
                    datasets.map((ds) => (
                        <div key={ds.id} className="grid grid-cols-12 px-4 py-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 items-center last:rounded-b-lg last:border-b-0 group transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
                                    <FileSpreadsheet size={16} />
                                </div>
                                <span className="text-neutral-900 dark:text-neutral-100 font-medium">{ds.name}</span>
                            </div>
                            <div className="col-span-4 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                   <span className="font-semibold text-neutral-700 dark:text-neutral-300">{ds.rowCount} rows</span>
                                   <span>•</span>
                                   <span className="truncate max-w-[150px]" title={ds.columns.join(', ')}>
                                     {ds.columns.length} columns
                                   </span>
                                </div>
                            </div>
                            <div className="col-span-4 text-right text-sm text-neutral-500 flex justify-end gap-4 items-center">
                                {ds.date}
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all">
                                  <MoreVertical size={16} />
                                </button>
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