export type AppView = 'intake' | 'solution';

export type EngineMode = 'gemini' | 'demo';

export interface ActionStep {
  id: string;
  step: string;
  difficulty: 'Fácil' | 'Moderado' | 'Avançado';
  detail: string;
}

export interface DirectSolutionResponse {
  caseTitle: string;
  quickSummary: string;
  rootCause: string;
  actionPlan: ActionStep[];
  preventionTip: string;
}

export interface DirectDiagnosisRequest {
  problem: string;
  refinementNote?: string;
}

export interface SavedDiagnosisCase {
  id: string;
  userId: string;
  problem: string;
  caseTitle: string;
  engineMode: EngineMode;
  rootCause: string;
  preventionTip: string;
  actionPlan: ActionStep[];
  completedStepIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}
