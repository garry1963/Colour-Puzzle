import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RestartConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RestartConfirmModal: React.FC<RestartConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 font-['Outfit']">
          Restart Level?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed max-w-xs">
          Your current progress on this level will be lost.
        </p>

        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase transition-all active:scale-95"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-rose-950/50 transition-all active:scale-95"
          >
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
};
