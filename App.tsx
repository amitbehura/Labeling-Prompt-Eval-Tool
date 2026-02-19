import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProjectsView } from './components/ProjectsView';
import { ProjectEvaluationsView } from './components/ProjectEvaluationsView';
import { AnalyticsView } from './components/AnalyticsView';
import { DatasetsView } from './components/DatasetsView';
import { NewProjectWizard } from './components/NewProjectWizard';
import { NewEvaluationWizard } from './components/NewEvaluationWizard';
import { EvaluationDetailView } from './components/EvaluationDetailView';
import { GalleryView } from './components/GalleryView';
import { DocumentationView } from './components/DocumentationView';
import { SettingsView } from './components/SettingsView';
import { ViewState, Dataset, Project, Evaluation, GeminiModel } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('projects');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  // API Key Management
  const [userApiKey, setUserApiKey] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
        setUserApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleImportData = (data: { projects: Project[], datasets: Dataset[], evaluations: Evaluation[] }) => {
    if (data.projects) setProjects(data.projects);
    if (data.datasets) setDatasets(data.datasets);
    if (data.evaluations) setEvaluations(data.evaluations);
  };
  
  // Selection State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const handleAddDataset = (dataset: Dataset) => {
    setDatasets(prev => [dataset, ...prev]);
  };

  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: new Date().toISOString(),
      evaluationCount: 0
    };
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    setCurrentView('project-evaluations');
  };

  const handleCreateEvaluation = (name: string, datasetId: string, model: string) => {
    if (!selectedProject) return;

    const dataset = datasets.find(d => d.id === datasetId);
    
    // Auto-detect columns
    const inputCol = dataset?.columns.find(c => c.toLowerCase().includes('input') || c.toLowerCase().includes('question') || c.toLowerCase().includes('prompt')) || dataset?.columns[0];
    const outputCol = dataset?.columns.find(c => c.toLowerCase().includes('output') || c.toLowerCase().includes('answer') || c.toLowerCase().includes('expected')) || dataset?.columns[1];

    const newEval: Evaluation = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProject.id,
      name,
      model,
      datasetId,
      systemPrompt: '',
      categories: [],
      columnMapping: {
        input: inputCol || '',
        expectedOutput: outputCol || ''
      },
      status: 'draft',
      results: [],
      runCount: 0,
      passRate: 0,
      totalLatency: 0,
      totalTokens: 0,
      lastUpdated: 'Just now'
    };

    setEvaluations(prev => [newEval, ...prev]);
    
    // Update project count
    setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
        ? { ...p, evaluationCount: p.evaluationCount + 1 }
        : p
    ));

    setSelectedEvaluation(newEval);
    setCurrentView('evaluation-detail');
  };

  const handleUpdateEvaluation = (updatedEval: Evaluation) => {
    setEvaluations(prev => prev.map(e => e.id === updatedEval.id ? updatedEval : e));
    setSelectedEvaluation(updatedEval);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'projects':
        return (
          <ProjectsView 
            projects={projects}
            onNewProject={() => setCurrentView('new-project-wizard')} 
            onSelectProject={(p) => { setSelectedProject(p); setCurrentView('project-evaluations'); }}
          />
        );
      case 'new-project-wizard':
        return (
          <NewProjectWizard 
            onCancel={() => setCurrentView('projects')}
            onComplete={handleCreateProject}
          />
        );
      case 'project-evaluations':
        if (!selectedProject) return <div>Project not found</div>;
        return (
            <ProjectEvaluationsView 
                project={selectedProject}
                evaluations={evaluations.filter(e => e.projectId === selectedProject.id)}
                onBack={() => setCurrentView('projects')}
                onNewEvaluation={() => setCurrentView('new-evaluation-wizard')}
                onSelectEvaluation={(e) => { setSelectedEvaluation(e); setCurrentView('evaluation-detail'); }}
            />
        );
      case 'new-evaluation-wizard':
         if (!selectedProject) return <div>Project context lost</div>;
         return (
            <NewEvaluationWizard
                project={selectedProject}
                datasets={datasets}
                onAddDataset={handleAddDataset}
                onCancel={() => setCurrentView('project-evaluations')}
                onComplete={handleCreateEvaluation}
            />
         );
      case 'evaluation-detail':
        if (!selectedEvaluation) return null;
        const evalDataset = datasets.find(d => d.id === selectedEvaluation.datasetId);
        if (!evalDataset) return <div>Dataset not found</div>;
        
        return (
            <EvaluationDetailView 
                evaluation={selectedEvaluation} 
                dataset={evalDataset}
                onBack={() => setCurrentView('project-evaluations')}
                onUpdateEvaluation={handleUpdateEvaluation}
                apiKey={userApiKey}
            />
        );
      case 'gallery':
        return <GalleryView projects={projects} evaluations={evaluations} />;
      case 'analytics':
        return <AnalyticsView projects={projects} evaluations={evaluations} />;
      case 'datasets':
        return <DatasetsView datasets={datasets} onAddDataset={handleAddDataset} />;
      case 'documentation':
        return <DocumentationView />;
      case 'settings':
        return (
            <SettingsView 
                apiKey={userApiKey} 
                onSaveApiKey={handleSaveApiKey}
                projects={projects}
                datasets={datasets}
                evaluations={evaluations}
                onImportData={handleImportData}
            />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-neutral-400">
            Work in Progress
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;