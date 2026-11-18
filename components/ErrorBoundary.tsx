'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { outfit } from '@/lib/fonts';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Ocorreu um erro inesperado na aplicação.',
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#05070B] px-4 text-sky-50">
          <div className="max-w-md rounded-xl border border-amber-500/40 bg-[#090E18] p-6">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <h2 className={`${outfit.className} text-lg font-semibold`}>
                Ops, algo interrompeu esta operação
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-sky-200/80">
              Não foi possível concluir a comunicação com o banco de dados ou com a sessão atual.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-[#040914] hover:bg-sky-400"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Recarregar interface</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
