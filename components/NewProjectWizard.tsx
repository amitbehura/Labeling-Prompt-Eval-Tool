import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface NewProjectWizardProps {
  onCancel: () => void;
  onComplete: (projectName: string, description: string) => void;
}

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({ 
  onCancel, 
  onComplete 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
        onComplete(name, description);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black">
      <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0">
        <h1 className="text-2xl font-bold">Create New Project</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden p-10 space-y-8">
            <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Project Name
                </label>
                <input 
                type="text" 
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 Marketing Bot Evals"
                className="w-full text-xl p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-neutral-300"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Description (Optional)
                </label>
                <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the goal of this project..."
                className="w-full p-4 h-32 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-neutral-300 resize-none"
                />
            </div>

            <div className="flex justify-between items-center pt-4">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-lg font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    Create Project <ArrowRight size={16}/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};