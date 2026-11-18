'use client';

import { useState } from 'react';
import {
  FileText,
  Check,
  Copy,
  RotateCcw,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  LogIn,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { outfit, jetbrainsMono } from '@/lib/fonts';
import { useAuth } from '@/components/FirebaseProvider';
import type { DirectSolutionResponse, EngineMode } from '@/lib/types';

interface DossierViewProps {
  problem: string;
  solution: DirectSolutionResponse;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  engineMode: EngineMode;
  savedCaseId: string | null;
  isSaving: boolean;
  isRefining: boolean;
  refineError: string | null;
  onRefine: (detail: string) => void;
  onSaveNow: () => void;
  onReset: () => void;
}

export default function DossierView({
  problem,
  solution,
  completedStepIds,
  onToggleStep,
  engineMode,
  savedCaseId,
  isSaving,
  isRefining,
  refineError,
  onRefine,
  onSaveNow,
  onReset,
}: DossierViewProps) {
  const { user, signingIn, signInWithGoogle } = useAuth();
  const [copied, setCopied] = useState(false);
  const [refinementText, setRefinementText] = useState('');

  const completedCount = solution.actionPlan.filter((item) =>
    completedStepIds.includes(item.id)
  ).length;
  const totalSteps = solution.actionPlan.length;

  const handleCopyDossier = async () => {
    const lines = [
      `SOLUÇÃO DIRETA — ${solution.caseTitle}`,
      `Problema: ${problem}`,
      '',
      'O QUE ESTÁ OCASIONANDO O PROBLEMA:',
      solution.rootCause,
      '',
      'O QUE MUDAR PARA MELHORAR E RESOLVER:',
      ...solution.actionPlan.map(
        (step, idx) => `${idx + 1}. [${step.difficulty}] ${step.step}\n   ${step.detail}`
      ),
      '',
      'COMO EVITAR QUE VOLTE:',
      solution.preventionTip,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = refinementText.trim();
    if (!trimmed || isRefining) return;
    setRefinementText('');
    onRefine(trimmed);
  };

  const handleLoginAndSave = async () => {
    const loggedUser = await signInWithGoogle();
    if (loggedUser) {
      onSaveNow();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Header */}
      <header className="border-b border-sky-900/50 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-sky-400">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>Solução Direta</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-300/80">
              {engineMode === 'gemini' ? 'IA Gemini' : 'Modo Demonstração'}
            </span>
            {user && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-sky-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  <span>
                    {isSaving
                      ? 'Salvando na sua conta...'
                      : savedCaseId
                        ? 'Salvo na sua conta'
                        : 'Sincronizando...'}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyDossier}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-sky-800/70 bg-[#0A111E] px-3.5 py-2 text-xs font-medium text-sky-100 transition-colors hover:border-sky-500/70 hover:bg-[#101A2E] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              )}
              <span>{copied ? 'Solução Copiada' : 'Copiar Solução'}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-[#040914] transition-colors hover:bg-sky-400 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Novo Problema</span>
            </button>
          </div>
        </div>

        <h1
          className={`${outfit.className} mt-4 text-balance text-2xl font-semibold tracking-tight text-sky-50 sm:text-4xl`}
        >
          {solution.caseTitle}
        </h1>

        <p className="mt-2 text-sm text-sky-300/80">
          Seu relato: &ldquo;{problem}&rdquo;
        </p>

        {solution.quickSummary && (
          <p className="mt-3 text-sm font-medium leading-relaxed text-sky-200">
            {solution.quickSummary}
          </p>
        )}
      </header>

      {/* Prompt to login & save when signed out */}
      {!user && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sky-800/50 bg-[#080E1A] px-4 py-3.5">
          <p className="text-xs leading-relaxed text-sky-200/85 sm:text-sm">
            Faça login com Google para salvar este diagnóstico e marcar quais mudanças você já fez.
          </p>
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleLoginAndSave()}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-[#040914] transition-colors hover:bg-sky-400 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{signingIn ? 'Entrando...' : 'Entrar e Salvar'}</span>
          </button>
        </div>
      )}

      {/* Main Direct Diagnosis & Action Plan */}
      <div className="mt-7 space-y-7">
        {/* 1. O que está ocasionando o problema */}
        <section className="rounded-xl border border-sky-800/50 bg-[#09101D] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>01. O que está ocasionando o problema</span>
          </div>
          <p className="mt-3 text-base leading-relaxed text-sky-50">{solution.rootCause}</p>
        </section>

        {/* 2. O que mudar para melhorar e resolver */}
        <section className="rounded-xl border border-sky-900/50 bg-[#080D16] p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className={`${outfit.className} text-xl font-semibold text-sky-50`}>
                02. O que mudar para melhorar e resolver
              </h2>
              <p className="mt-1 text-xs text-sky-300/75">
                Ações ordenadas da mudança mais fácil à mais avançada. Marque conforme for
                aplicando.
              </p>
            </div>

            <span className={`${jetbrainsMono.className} text-xs tabular-nums text-sky-400`}>
              {completedCount} de {totalSteps} concluídas
            </span>
          </div>

          <ul className="mt-5 divide-y divide-sky-900/40">
            {solution.actionPlan.map((item, idx) => {
              const isDone = completedStepIds.includes(item.id);
              return (
                <li key={item.id} className="py-4 first:pt-1 last:pb-1">
                  <button
                    type="button"
                    onClick={() => onToggleStep(item.id)}
                    aria-pressed={isDone}
                    className="group flex w-full items-start gap-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg p-1 -m-1"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        isDone
                          ? 'border-sky-400 bg-sky-500 text-[#040914]'
                          : 'border-sky-700 bg-[#0B1322] text-transparent group-hover:border-sky-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400/90">
                        <span className={`${jetbrainsMono.className} tabular-nums`}>
                          Mudança 0{idx + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Nível {item.difficulty}</span>
                      </div>

                      <p
                        className={`mt-1 text-base font-medium transition-colors ${
                          isDone
                            ? 'text-sky-300/55 line-through decoration-sky-700'
                            : 'text-sky-50 group-hover:text-white'
                        }`}
                      >
                        {item.step}
                      </p>

                      <p
                        className={`mt-1 text-sm leading-relaxed ${
                          isDone ? 'text-sky-300/45' : 'text-sky-200/80'
                        }`}
                      >
                        {item.detail}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3. Como evitar que volte */}
        <section className="rounded-xl border border-sky-900/50 bg-[#090F1A] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>03. Como evitar que o problema volte</span>
          </div>
          <p className="mt-3 text-base leading-relaxed text-sky-100">{solution.preventionTip}</p>
        </section>

        {/* 4. Optional Context Refinement */}
        <section className="border-t border-sky-900/40 pt-6">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>Ajustar com um detalhe específico (opcional)</span>
          </div>

          <form onSubmit={handleRefineSubmit} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor="refine-input" className="sr-only">
              Adicione um detalhe extra para refinar a solução
            </label>
            <input
              id="refine-input"
              type="text"
              value={refinementText}
              onChange={(e) => setRefinementText(e.target.value)}
              placeholder="Ex: Já testei no cabo e mesmo assim cai, ou meu forno é elétrico..."
              className="min-h-[44px] flex-1 rounded-lg border border-sky-900/60 bg-[#080D16] px-3.5 py-2 text-sm text-sky-50 placeholder:text-sky-300/40 focus:border-sky-400/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!refinementText.trim() || isRefining}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-sky-700/70 bg-[#0D182B] px-4 py-2 text-xs font-semibold text-sky-100 transition-colors hover:border-sky-400 hover:bg-[#13223B] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0"
            >
              {isRefining && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>{isRefining ? 'Atualizando...' : 'Atualizar Solução'}</span>
            </button>
          </form>

          {refineError && (
            <div
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-100"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <span>{refineError}</span>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
