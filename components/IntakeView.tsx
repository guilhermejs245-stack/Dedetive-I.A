'use client';

import { useRef } from 'react';
import { ArrowRight, Search, Loader2, CheckSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { outfit, jetbrainsMono } from '@/lib/fonts';
import { EXAMPLE_CASES, type ExampleCase } from '@/lib/demo-detective';
import type { EngineMode } from '@/lib/types';

interface IntakeViewProps {
  problem: string;
  onProblemChange: (value: string) => void;
  onSolveNow: (problemText?: string, modeOverride?: EngineMode) => void;
  engineMode: EngineMode;
  onEngineModeChange: (mode: EngineMode) => void;
  geminiAvailable: boolean | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export default function IntakeView({
  problem,
  onProblemChange,
  onSolveNow,
  engineMode,
  onEngineModeChange,
  geminiAvailable,
  isLoading,
  errorMessage,
}: IntakeViewProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleExampleClick = (example: ExampleCase) => {
    onProblemChange(example.prompt);
    const inputEl = document.getElementById('intake-input');
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() || isLoading) return;
    onSolveNow();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16"
    >
      {/* Main Direct Problem Solver Section */}
      <section className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-wide text-sky-400">
            Diagnóstico Direto · Causa &amp; Solução Imediata
          </p>

          <div
            role="group"
            aria-label="Modo de operação do detetive"
            className="inline-flex items-center rounded-lg border border-sky-900/60 bg-[#090F1A] p-1"
          >
            <button
              type="button"
              onClick={() => onEngineModeChange('gemini')}
              className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                engineMode === 'gemini'
                  ? 'bg-sky-500 text-[#040914]'
                  : 'text-sky-300/80 hover:text-sky-100'
              }`}
            >
              IA Gemini
            </button>
            <button
              type="button"
              onClick={() => onEngineModeChange('demo')}
              className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                engineMode === 'demo'
                  ? 'bg-sky-500 text-[#040914]'
                  : 'text-sky-300/80 hover:text-sky-100'
              }`}
            >
              Modo Demonstração
            </button>
          </div>
        </div>

        <h1
          className={`${outfit.className} mt-5 text-balance text-3xl font-semibold tracking-tight text-sky-50 sm:text-5xl sm:leading-[1.12]`}
        >
          Qual problema você quer resolver hoje?
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-sky-200/75">
          Descreva o que está acontecendo. Vamos direto ao ponto: mostramos o que está ocasionando
          o problema e exatamente o que você deve mudar para melhorar agora.
        </p>

        <p className="mt-3 text-xs text-sky-300/65">
          {engineMode === 'gemini' ? (
            geminiAvailable === false ? (
              <span>
                Modo IA Gemini selecionado · Chave do servidor não detectada (você pode testar
                instantaneamente no Modo Demonstração).
              </span>
            ) : (
              <span>Modo IA Gemini ativo · Resposta direta e personalizada em tempo real.</span>
            )
          ) : (
            <span>
              Modo Demonstração ativo · Simulação instantânea pronta para testar sem depender de
              chave externa.
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <div className="rounded-xl border border-sky-900/60 bg-[#090E18] p-4 transition-colors focus-within:border-sky-400/70 sm:p-5">
            <label htmlFor="intake-input" className="sr-only">
              Descreva o problema que você quer resolver
            </label>
            <textarea
              id="intake-input"
              rows={4}
              value={problem}
              onChange={(e) => onProblemChange(e.target.value)}
              placeholder="Ex: Minha internet cai toda noite por volta das 21h..."
              className="w-full resize-none bg-transparent text-base leading-relaxed text-sky-50 placeholder:text-sky-300/40 focus:outline-none"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-sky-900/40 pt-4">
              <span className="text-xs text-sky-300/60">
                Acesso aberto · Sem cadastro · Causa + mudanças práticas imediatas
              </span>

              <button
                ref={submitButtonRef}
                type="submit"
                disabled={!problem.trim() || isLoading}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-[#040914] transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isLoading ? 'Analisando causa...' : 'Ver Solução Agora'}</span>
                {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
            >
              <span>{errorMessage}</span>
              {engineMode === 'gemini' && (
                <button
                  type="button"
                  onClick={() => {
                    onEngineModeChange('demo');
                    if (problem.trim()) {
                      onSolveNow(problem.trim(), 'demo');
                    }
                  }}
                  className="min-h-[36px] rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-[#040914] hover:bg-sky-400 whitespace-nowrap shrink-0"
                >
                  Usar Modo Demonstração
                </button>
              )}
            </div>
          )}
        </form>
      </section>

      {/* Clickable Example Cases */}
      <section id="exemplos" className="mx-auto mt-14 max-w-4xl border-t border-sky-900/40 pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={`${outfit.className} text-lg font-semibold text-sky-100`}>
            Exemplos rápidos para testar
          </h2>
          <span className="text-xs text-sky-300/65">Clique para preencher</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {EXAMPLE_CASES.map((example, idx) => (
            <button
              key={example.id}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="group flex flex-col justify-between rounded-xl border border-sky-900/50 bg-[#080D16] p-4 text-left transition-colors hover:border-sky-500/60 hover:bg-[#0C1424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-sky-400/85">
                  <span>{example.category}</span>
                  <span className={`${jetbrainsMono.className} tabular-nums text-sky-400/60`}>
                    0{idx + 1}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-medium leading-relaxed text-sky-100 group-hover:text-white">
                  &ldquo;{example.prompt}&rdquo;
                </p>
              </div>

              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 group-hover:text-sky-300">
                <span>Selecionar exemplo</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="como-funciona"
        className="mx-auto mt-14 max-w-4xl border-t border-sky-900/40 pt-10"
      >
        <h2 className={`${outfit.className} text-lg font-semibold text-sky-100`}>
          O que você recebe na hora
        </h2>

        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>01. Causa do Problema</span>
            </div>
            <p className="text-sm leading-relaxed text-sky-200/75">
              Explicação clara e direta sobre o que está ocasionando o sintoma relatado.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <CheckSquare className="h-4 w-4" aria-hidden="true" />
              <span>02. O que Mudar Agora</span>
            </div>
            <p className="text-sm leading-relaxed text-sky-200/75">
              Checklist prática ordenada da mudança mais simples à mais avançada para resolver.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>03. Prevenção</span>
            </div>
            <p className="text-sm leading-relaxed text-sky-200/75">
              Orientação objetiva para evitar que o mesmo problema volte a acontecer.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
