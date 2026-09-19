import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, FlaskConical, ListFilter, RotateCcw, Sparkles, Star } from 'lucide-react';
import { sound } from '../utils/audio';
import { fireVictoryConfetti } from '../utils/confetti';
import { formatTime } from '../utils/storage';

interface LevelCompleteModalProps {
  isOpen: boolean;
  levelNumber: number;
  moves: number;
  parMoves: number;
  stars: number;
  bestMoves: number;
  timeSeconds?: number;
  bestTimeSeconds?: number;
  isDaily: boolean;
  isCustom?: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  onOpenPuzzleCreator?: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  levelNumber,
  moves,
  parMoves,
  stars,
  bestMoves,
  timeSeconds = 0,
  bestTimeSeconds,
  isDaily,
  isCustom = false,
  onNextLevel,
  onReplay,
  onLevelSelect,
  onOpenPuzzleCreator,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playWin();
      fireVictoryConfetti(stars);
    }
  }, [isOpen, stars]);

  if (!isOpen) return null;

  const isNewBestTime = bestTimeSeconds !== undefined && timeSeconds > 0 && timeSeconds <= bestTimeSeconds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900/95 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 inset-x-0 h-32 bg-amber-400/20 blur-3xl pointer-events-none rounded-full" />

        {/* Checkmark Banner (Interactive particle trigger) */}
        <button
          onClick={() => {
            sound.playWin();
            fireVictoryConfetti(stars);
          }}
          title="Click for celebratory fireworks!"
          className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center mb-3 text-emerald-400 shadow-lg shadow-emerald-950/50 hover:scale-110 active:scale-95 transition-transform cursor-pointer group"
        >
          <CheckCircle2 className="w-9 h-9 group-hover:rotate-6 transition-transform" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
          {isDaily
            ? 'DAILY PUZZLE COMPLETE!'
            : isCustom
            ? 'CUSTOM PUZZLE SOLVED!'
            : 'LEVEL COMPLETE!'}
        </h2>

        <p className="text-sm font-semibold text-emerald-400 mt-1 mb-5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Puzzle Solved Successfully</span>
        </p>

        {/* Stars Rating Display */}
        <div
          onClick={() => fireVictoryConfetti(stars)}
          className="flex items-center justify-center gap-2 mb-6 cursor-pointer"
          title="Click to celebrate!"
        >
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <div
                key={starIndex}
                className={`p-2 rounded-2xl border transition-all duration-300 ${
                  isEarned
                    ? 'bg-amber-400/20 border-amber-400/80 text-amber-300 scale-110 shadow-lg shadow-amber-400/20 animate-pulse'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-600 scale-95'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    isEarned ? 'fill-amber-400 text-amber-400 drop-shadow' : 'fill-transparent text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score & Statistics Comparison Box */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Moves</span>
            <span className="text-lg sm:text-2xl font-black text-cyan-400 tabular-nums">{moves}</span>
          </div>

          <div className="flex flex-col border-l border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Par</span>
            <span className="text-lg sm:text-2xl font-black text-slate-300 tabular-nums">{parMoves}</span>
          </div>

          <div className="flex flex-col border-l border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</span>
            <span className="text-lg sm:text-2xl font-black text-amber-300 tabular-nums font-mono">
              {formatTime(timeSeconds)}
            </span>
          </div>

          <div className="flex flex-col border-l border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Best</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400 tabular-nums font-mono">
              {formatTime(bestTimeSeconds !== undefined && bestTimeSeconds > 0 ? bestTimeSeconds : timeSeconds)}
            </span>
          </div>
        </div>

        {/* Record Highlight */}
        {isNewBestTime && (
          <div className="text-xs text-amber-300 font-bold mb-3 flex items-center justify-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Personal Best Time: {formatTime(timeSeconds)}!</span>
          </div>
        )}

        {/* Performance Note */}
        <div className="text-xs text-slate-300 mb-6 px-3">
          {stars === 3
            ? 'Outstanding! Solved at or below the target par!'
            : stars === 2
            ? 'Great job! Just a few moves away from 3 stars.'
            : 'Well done! Puzzle completed.'}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {isCustom && onOpenPuzzleCreator && (
            <button
              onClick={onOpenPuzzleCreator}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
            >
              <FlaskConical className="w-4 h-4" />
              <span>PUZZLE CREATOR</span>
            </button>
          )}

          {!isDaily && !isCustom && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all active:scale-95"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onReplay}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onLevelSelect}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <ListFilter className="w-4 h-4 text-slate-300" />
              <span>LEVELS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
