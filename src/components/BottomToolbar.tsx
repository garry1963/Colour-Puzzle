import React from 'react';
import { Eye, Lightbulb, RotateCcw, Undo2 } from 'lucide-react';

interface BottomToolbarProps {
  onRestart: () => void;
  onHint: () => void;
  onShowMoves: () => void;
  onUndo: () => void;
  canUndo: boolean;
  undoCount: number;
  isHintActive: boolean;
  isHelpActive: boolean;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onRestart,
  onHint,
  onShowMoves,
  onUndo,
  canUndo,
  undoCount,
  isHintActive,
  isHelpActive,
}) => {
  return (
    <footer className="w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 px-2.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 landscape:py-1 flex items-center justify-between shadow-2xl z-30 select-none shrink-0">
      {/* Left: Restart Button */}
      <div className="flex items-center">
        <button
          id="btn-restart"
          onClick={onRestart}
          aria-label="Restart current level"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 landscape:py-1 landscape:px-3 rounded-xl sm:rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-150 active:scale-95 shadow-md shadow-rose-950/20"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
          <span>RESTART</span>
        </button>
      </div>

      {/* Right: Hint, View / Help, Undo Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Hint Button */}
        <button
          id="btn-hint"
          onClick={onHint}
          aria-label="Get a move hint"
          className={`flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-3 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-150 active:scale-95 shadow-md ${
            isHintActive
              ? 'bg-amber-400/30 text-amber-200 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/40'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-slate-700/80 hover:border-amber-400/40 shadow-slate-950/30'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
          <span className="hidden sm:inline">HINT</span>
        </button>

        {/* Show Possible Moves / Help Button */}
        <button
          id="btn-help-view"
          onClick={onShowMoves}
          aria-label="View legal possible moves"
          className={`flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 landscape:py-1 landscape:px-3 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-150 active:scale-95 shadow-md ${
            isHelpActive
              ? 'bg-sky-500/30 text-sky-200 border-sky-400 ring-2 ring-sky-400/40'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 border-slate-700/80 hover:border-sky-400/40 shadow-slate-950/30'
          }`}
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          <span className="hidden sm:inline">MOVES</span>
        </button>

        {/* Undo Button */}
        <button
          id="btn-undo"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={`Undo previous move (${undoCount} available)`}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 landscape:py-1 landscape:px-3 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-150 shadow-md ${
            canUndo
              ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40 active:scale-95 shadow-indigo-950/20'
              : 'bg-slate-900/50 text-slate-400 border-slate-800/50 cursor-not-allowed opacity-50'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          <span>UNDO</span>
          {undoCount > 0 && (
            <span className="ml-0.5 sm:ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-indigo-200">
              {undoCount}
            </span>
          )}
        </button>
      </div>
    </footer>
  );
};
