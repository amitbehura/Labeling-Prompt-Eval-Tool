export type ViewState = 'projects' | 'project-evaluations' | 'evaluation-detail' | 'datasets' | 'gallery' | 'analytics' | 'settings' | 'documentation' | 'new-project-wizard' | 'new-evaluation-wizard';

export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  FLASH_2_5 = 'gemini-2.5-flash',
  LITE_2_5 = 'gemini-2.5-flash-lite',
}

export interface EvaluationRun {
  id: string;
  evaluationId: string;
  systemPrompt: string;
  userInput: string;
  expectedOutput: string;
  model: string;
  
  // Results
  output: string | null;
  reasoning: string | null;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  
  // Status
  status: 'idle' | 'running' | 'completed' | 'failed';
  error?: string;
  
  // Score
  isMatch: boolean | null;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  evaluationCount: number;

  // Optional Config (Playground mode)
  systemPrompt?: string;
  model?: string;
  categories?: string[];
  columnMapping?: {
    input: string;
    expectedOutput: string;
  };

  // Optional Stats (Playground mode)
  runCount?: number;
  passRate?: number;
  avgLatency?: number;
  lastUpdated?: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  name: string;
  datasetId: string;
  model: string;
  
  // Configuration
  systemPrompt: string;
  categories: string[];
  columnMapping: {
    input: string;
    expectedOutput: string;
  };

  // Stats
  status: 'draft' | 'running' | 'completed';
  results: EvaluationRun[];
  runCount: number;
  passRate: number;
  totalLatency: number;
  totalTokens: number;
  lastUpdated: string;
}

export interface Dataset {
  id: string;
  name: string;
  date: string;
  rowCount: number;
  columns: string[];
  content: Record<string, string>[];
}