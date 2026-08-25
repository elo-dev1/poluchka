import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Monopoly UI error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Произошла ошибка при загрузке</h2>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            {this.state.error?.message || 'Не удалось инициализировать интерфейс игры.'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs text-white shadow-lg transition-all"
          >
            Сбросить кэш и перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
