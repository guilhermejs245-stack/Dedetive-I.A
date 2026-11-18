'use client';

import { Search, RotateCcw } from 'lucide-react';
import { outfit } from '@/lib/fonts';
import type { AppView } from '@/lib/types';

interface TopBarProps {
  view: AppView;
  onReset: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function TopBar({ view, onReset, onScrollToSection }: TopBarProps) {
  return (
    <header className="border-b border-sky-950/70 bg-[#05070B]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={onReset}
          className={`${outfit.className} flex items-center gap-2.5 text-left text-lg font-semibold tracking-tight text-sky-100 whitespace-nowrap shrink-0 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md`}
        >
          <Search className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
          <span>Detetive de Problemas IA</span>
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-300/80">
          <button
            type="button"
            onClick={onReset}
            className={`hover:text-sky-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded ${
              view === 'intake' ? 'text-sky-100' : ''
            }`}
          >
            Resolver Problema
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('exemplos')}
            className="hover:text-sky-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
          >
            Exemplos
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('como-funciona')}
            className="hover:text-sky-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
          >
            Como Funciona
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {view === 'intake' ? (
            <button
              type="button"
              onClick={() => onScrollToSection('intake-input')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-[#040914] transition-colors hover:bg-sky-400 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Resolver Agora
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-sky-800/70 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-sky-100 transition-colors hover:border-sky-500/70 hover:bg-[#101A2E] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <RotateCcw className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              <span>Novo Problema</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
