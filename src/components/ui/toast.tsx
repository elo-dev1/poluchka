import React from 'react';
import { useGame, ToastItem } from '@/context/GameContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-none max-w-md w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 text-xs font-semibold text-white animate-in slide-in-from-top-3 fade-in-50',
            t.type === 'success' && 'bg-emerald-950/85 border-emerald-500/40 text-emerald-100',
            t.type === 'warning' && 'bg-amber-950/85 border-amber-500/40 text-amber-100',
            t.type === 'error' && 'bg-red-950/85 border-red-500/40 text-red-100',
            t.type === 'info' && 'bg-slate-900/85 border-white/20 text-slate-100'
          )}
        >
          <div className="flex items-center gap-2">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="leading-tight">{t.message}</span>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
