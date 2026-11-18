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
