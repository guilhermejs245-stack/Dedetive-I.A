'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import IntakeView from '@/components/IntakeView';
import DossierView from '@/components/DossierView';
import { useAuth } from '@/components/FirebaseProvider';
import { runDirectDemoDiagnosis } from '@/lib/demo-detective';
import {
  deleteSavedCase,
  saveDiagnosisCase,
  subscribeUserCases,
  updateCaseChecklist,
  updateCaseRefinement,
} from '@/lib/cases-service';
import type {
  AppView,
  DirectSolutionResponse,
  EngineMode,
  SavedDiagnosisCase,
} from '@/lib/types';

export default function DetectiveApp() {
  const { user, authReady } = useAuth();

  const [view, setView] = useState<AppView>('intake');
  const [engineMode, setEngineMode] = useState<EngineMode>('gemini');
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);

  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<DirectSolutionResponse | null>(null);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const [savedCasesState, setSavedCasesState] = useState<{
    uid: string | null;
    items: SavedDiagnosisCase[];
  }>({ uid: null, items: [] });
  const [activeSavedCaseId, setActiveSavedCaseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/status')
      .then((res) => res.json())
      .then((data: { geminiAvailable?: boolean }) => {
        if (!active) return;
        const available = Boolean(data.geminiAvailable);
        setGeminiAvailable(available);
        if (!available) {
          setEngineMode('demo');
        }
      })
      .catch(() => {
        if (!active) return;
        setGeminiAvailable(false);
        setEngineMode('demo');
      });
    return () => {
      active = false;
    };
  }, []);

  // Subscribe to logged-in user's saved cases in Firestore
  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    const targetUid = user.uid;
    const unsubscribe = subscribeUserCases(targetUid, (items) => {
      setSavedCasesState({ uid: targetUid, items });
    });

    return () => unsubscribe();
  }, [authReady, user]);

  const savedCases = user && savedCasesState.uid === user.uid ? savedCasesState.items : [];
  const casesLoading = Boolean(authReady && user && savedCasesState.uid !== user.uid);

  const fetchDirectDiagnosis = useCallback(
    async (
      targetProblem: string,
      modeOverride?: EngineMode,
      refinementNote?: string
    ): Promise<DirectSolutionResponse> => {
      const activeMode = modeOverride ?? engineMode;

      if (activeMode === 'demo') {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return runDirectDemoDiagnosis(targetProblem, refinementNote);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch('/api/investigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            problem: targetProblem,
            refinementNote,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Não foi possível gerar a solução agora.');
        }

        return data as DirectSolutionResponse;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error(
            'A IA demorou mais que o esperado para responder. Tente novamente ou use o Modo Demonstração.'
          );
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [engineMode]
  );

  const handleSolveNow = useCallback(
    async (overrideProblem?: string, modeOverride?: EngineMode) => {
      const targetProblem = (overrideProblem ?? problem).trim();
      if (!targetProblem) return;

      const activeMode = modeOverride ?? engineMode;
      setProblem(targetProblem);
      setIsLoading(true);
      setErrorMessage(null);
      setRefineError(null);
      setActiveSavedCaseId(null);

      try {
        const result = await fetchDirectDiagnosis(targetProblem, modeOverride);
        setSolution(result);
        setCompletedStepIds([]);
        setView('solution');

        if (user) {
          setIsSaving(true);
          try {
            const newId = await saveDiagnosisCase({
              userId: user.uid,
              problem: targetProblem,
              engineMode: activeMode,
              solution: result,
              completedStepIds: [],
            });
            setActiveSavedCaseId(newId);
          } finally {
            setIsSaving(false);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao analisar o problema.';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [problem, engineMode, fetchDirectDiagnosis, user]
  );

  const handleSaveCurrentCase = useCallback(async () => {
    if (!user || !solution || activeSavedCaseId) return;
    setIsSaving(true);
    try {
      const newId = await saveDiagnosisCase({
        userId: user.uid,
        problem,
        engineMode,
        solution,
        completedStepIds,
      });
      setActiveSavedCaseId(newId);
    } finally {
      setIsSaving(false);
    }
  }, [user, solution, activeSavedCaseId, problem, engineMode, completedStepIds]);

  const handleToggleStep = useCallback(
    async (stepId: string) => {
      const nextIds = completedStepIds.includes(stepId)
        ? completedStepIds.filter((id) => id !== stepId)
        : [...completedStepIds, stepId];

      setCompletedStepIds(nextIds);

      if (user && activeSavedCaseId) {
        await updateCaseChecklist(activeSavedCaseId, nextIds);
      }
    },
    [completedStepIds, user, activeSavedCaseId]
  );

  const handleRefine = useCallback(
    async (detail: string) => {
      if (!problem.trim()) return;
      setIsRefining(true);
      setRefineError(null);
      try {
        const updated = await fetchDirectDiagnosis(problem, undefined, detail);
        setSolution(updated);
        setCompletedStepIds([]);

        if (user && activeSavedCaseId) {
          setIsSaving(true);
          try {
            await updateCaseRefinement(activeSavedCaseId, updated);
          } finally {
            setIsSaving(false);
          }
        }
      } catch (err) {
        setRefineError(
          err instanceof Error ? err.message : 'Não foi possível atualizar a solução.'
        );
      } finally {
        setIsRefining(false);
      }
    },
    [problem, fetchDirectDiagnosis, user, activeSavedCaseId]
  );

  const handleOpenSavedCase = useCallback((item: SavedDiagnosisCase) => {
    setProblem(item.problem);
    setEngineMode(item.engineMode);
    setSolution({
      caseTitle: item.caseTitle,
      quickSummary: '',
      rootCause: item.rootCause,
      actionPlan: item.actionPlan,
      preventionTip: item.preventionTip,
    });
    setCompletedStepIds(item.completedStepIds ?? []);
    setActiveSavedCaseId(item.id);
    setErrorMessage(null);
    setRefineError(null);
    setView('solution');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteSavedCase = useCallback(
    async (caseId: string) => {
      await deleteSavedCase(caseId);
      if (activeSavedCaseId === caseId) {
        setActiveSavedCaseId(null);
      }
    },
    [activeSavedCaseId]
  );

  const handleReset = useCallback(() => {
    setView('intake');
    setSolution(null);
    setCompletedStepIds([]);
    setActiveSavedCaseId(null);
    setErrorMessage(null);
    setRefineError(null);
    setIsLoading(false);
  }, []);

  const handleScrollToSection = useCallback(
    (sectionId: string) => {
      if (view !== 'intake') {
        handleReset();
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [view, handleReset]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#05070B] text-sky-50">
      <TopBar
        view={view}
        onReset={handleReset}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1">
        {view === 'intake' && (
          <IntakeView
            problem={problem}
            onProblemChange={setProblem}
            onSolveNow={handleSolveNow}
            engineMode={engineMode}
            onEngineModeChange={setEngineMode}
            geminiAvailable={geminiAvailable}
            isLoading={isLoading}
            errorMessage={errorMessage}
            savedCases={savedCases}
            casesLoading={casesLoading}
            onOpenSavedCase={handleOpenSavedCase}
            onDeleteSavedCase={(id) => void handleDeleteSavedCase(id)}
          />
        )}

        {view === 'solution' && solution && (
          <DossierView
            problem={problem}
            solution={solution}
            completedStepIds={completedStepIds}
            onToggleStep={(id) => void handleToggleStep(id)}
            engineMode={engineMode}
            savedCaseId={activeSavedCaseId}
            isSaving={isSaving}
            isRefining={isRefining}
            refineError={refineError}
            onRefine={(detail) => void handleRefine(detail)}
            onSaveNow={() => void handleSaveCurrentCase()}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-sky-950/60 py-6 text-center text-xs text-sky-300/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          Detetive de Problemas IA · Diagnóstico direto com causas e mudanças práticas
        </div>
      </footer>
    </div>
  );
}
