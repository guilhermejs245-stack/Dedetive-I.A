import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import type { ActionStep, DirectSolutionResponse, EngineMode, SavedDiagnosisCase } from '@/lib/types';

function clampText(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function sanitizeActionPlan(steps: ActionStep[]): ActionStep[] {
  return steps.slice(0, 8).map((item, idx) => ({
    id: clampText(item.id || `step-${idx + 1}`, 40),
    step: clampText(item.step, 180),
    difficulty:
      item.difficulty === 'Fácil' ||
      item.difficulty === 'Moderado' ||
      item.difficulty === 'Avançado'
        ? item.difficulty
        : 'Moderado',
    detail: clampText(item.detail, 500),
  }));
}

export function subscribeUserCases(
  userId: string,
  onData: (cases: SavedDiagnosisCase[]) => void
): Unsubscribe {
  const path = 'cases';
  const casesQuery = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(
    casesQuery,
    (snapshot) => {
      const items: SavedDiagnosisCase[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as SavedDiagnosisCase;
        return {
          ...data,
          id: docSnap.id,
        };
      });
      items.sort((a, b) => {
        const getMs = (ts: unknown): number => {
          if (
            ts &&
            typeof ts === 'object' &&
            'toMillis' in ts &&
            typeof (ts as { toMillis: () => number }).toMillis === 'function'
          ) {
            return (ts as { toMillis: () => number }).toMillis();
          }
          return 0;
        };
        return getMs(b.updatedAt) - getMs(a.updatedAt);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveDiagnosisCase(params: {
  userId: string;
  problem: string;
  engineMode: EngineMode;
  solution: DirectSolutionResponse;
  completedStepIds?: string[];
}): Promise<string> {
  const caseId = `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `cases/${caseId}`;
  const docRef = doc(db, 'cases', caseId);

  const sanitizedPlan = sanitizeActionPlan(params.solution.actionPlan);
  const sanitizedCompleted = (params.completedStepIds ?? []).slice(0, 8);

  const payload = {
    id: caseId,
    userId: params.userId,
    problem: clampText(params.problem, 1000) || 'Problema cotidiano',
    caseTitle: clampText(params.solution.caseTitle, 160) || 'Diagnóstico Direto',
    engineMode: params.engineMode,
    rootCause: clampText(params.solution.rootCause, 3000),
    preventionTip: clampText(params.solution.preventionTip, 1500),
    actionPlan: sanitizedPlan,
    completedStepIds: sanitizedCompleted,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return caseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCaseChecklist(
  caseId: string,
  completedStepIds: string[]
): Promise<void> {
  const path = `cases/${caseId}`;
  const docRef = doc(db, 'cases', caseId);
  try {
    await updateDoc(docRef, {
      completedStepIds: completedStepIds.slice(0, 8),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateCaseRefinement(
  caseId: string,
  solution: DirectSolutionResponse
): Promise<void> {
  const path = `cases/${caseId}`;
  const docRef = doc(db, 'cases', caseId);
  try {
    await updateDoc(docRef, {
      caseTitle: clampText(solution.caseTitle, 160) || 'Diagnóstico Direto',
      rootCause: clampText(solution.rootCause, 3000),
      preventionTip: clampText(solution.preventionTip, 1500),
      actionPlan: sanitizeActionPlan(solution.actionPlan),
      completedStepIds: [],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSavedCase(caseId: string): Promise<void> {
  const path = `cases/${caseId}`;
  const docRef = doc(db, 'cases', caseId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
