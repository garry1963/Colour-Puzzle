import React, { useState } from 'react';
import { ArrowRight, Eye, Lightbulb, Sparkles, X } from 'lucide-react';
import { ColourId, Tube } from '../types';
import { getColour } from '../utils/colors';
import { getValidMoves, solvePuzzle, ValidMove } from '../utils/solver';

interface HelpMovesModalProps {
  isOpen: boolean;
  tubes: Tube[];
  capacity: number;
  onApplyMoveHighlight: (from: number, to: number) => void;
  onClose: () => void;
}

export const HelpMovesModal: React.FC<HelpMovesModalProps> = ({
  isOpen,
  tubes,
  capacity,
  onApplyMoveHighlight,
  onClose,
}) => {
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [solutionSteps, setSolutionSteps] = useState<ValidMove[] | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  if (!isOpen) return null;

  const validMoves = getValidMoves(tubes, capacity);

  const handleComputeSolution = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = solvePuzzle(tubes, capacity, 5000);
      setSolutionSteps(res);
      setIsSolving(false);
      setShowFullSolution(true);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                HELP & MOVES
              </h2>
              <p className="text-xs text-slate-400">
                {validMoves.length} Legal Moves Available
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Moves"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Possible Moves vs Full Solution Path */}
        <div className="flex items-center gap-2 mb-4 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setShowFullSolution(false)}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              !showFullSolution
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Possible Moves ({validMoves.length})
          </button>
          <button
            onClick={() => {
              if (!solutionSteps) handleComputeSolution();
              else setShowFullSolution(true);
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              showFullSolution
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Show Solution Path
          </button>
        </div>

        {/* Content */}
        {!showFullSolution ? (
          <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
            {validMoves.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                <p className="text-sm font-semibold text-rose-400 mb-1">No legal moves remain!</p>
                <p className="text-xs">Use UNDO or RESTART to try a different sequence.</p>
              </div>
            ) : (
              validMoves.map((move, idx) => {
                const color = getColour(move.color);
                const isDestEmpty = tubes[move.toIndex].length === 0;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <span>Tube {move.fromIndex + 1}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tube {move.toIndex + 1}</span>
                          {isDestEmpty && (
                            <span className="text-[10px] text-slate-400 font-normal">(empty)</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          Pours {move.count} {color.name} block{move.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onApplyMoveHighlight(move.fromIndex, move.toIndex);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Highlight
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
            {isSolving ? (
              <div className="p-6 text-center text-slate-300">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full mb-2" />
                <p className="text-xs font-semibold">Calculating optimal solution...</p>
              </div>
            ) : solutionSteps && solutionSteps.length > 0 ? (
              <>
                <div className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Found solution in {solutionSteps.length} moves:</span>
                </div>
                {solutionSteps.map((step, idx) => {
                  const color = getColour(step.color);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono w-5">#{idx + 1}</span>
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-white font-semibold">
                          Tube {step.fromIndex + 1} → Tube {step.toIndex + 1}
                        </span>
                        <span className="text-slate-400">({step.count}x {color.name.split(' ')[0]})</span>
                      </div>

                      {idx === 0 && (
                        <button
                          onClick={() => {
                            onApplyMoveHighlight(step.fromIndex, step.toIndex);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase"
                        >
                          Step 1
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                <p className="text-sm font-semibold text-amber-400 mb-1">Puzzle Solved or Deep Search Limit</p>
                <p className="text-xs">No direct short path detected from current board.</p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase transition-all active:scale-95"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
