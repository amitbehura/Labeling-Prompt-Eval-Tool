import React from 'react';
import { Plus, MoreVertical, LayoutDashboard, Folder, ChevronRight, Clock } from 'lucide-react';
import { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onNewProject, onSelectProject }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-neutral-500">Manage your evaluation workspaces</p>
        </div>
        <button 
            onClick={onNewProject}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
        >
            <Plus size={16} /> Create Project
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 pb-20">
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl flex items-center justify-center mb-6 text-neutral-400">
                    <Folder size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No projects yet</h3>
                    <p className="text-sm text-neutral-400 max-w-sm text-center mb-8">
                    Create a project to start organizing your prompt evaluations and experiments.
                    </p>
                    <button 
                    onClick={onNewProject}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    Create First Project
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div 
                        key={project.id} 
                        onClick={() => onSelectProject(project)}
                        className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                                <Folder size={20} fill="currentColor" className="opacity-20" />
                                <Folder size={20} className="absolute" />
                            </div>
                            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                        <p className="text-sm text-neutral-500 mb-6 line-clamp-2 h-10">
                            {project.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                            <span className="flex items-center gap-1.5">
                                <LayoutDashboard size={14} />
                                {project.evaluationCount} Evaluations
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};