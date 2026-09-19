import React from 'react';
import { Award, Calendar, CheckCircle2, Flame, Play, X } from 'lucide-react';
import { DailyRecord } from '../types';
import { formatTime } from '../utils/storage';

interface DailyPuzzleModalProps {
  isOpen: boolean;
  dateStr: string;
  record?: DailyRecord;
  currentStreak: number;
  maxStreak: number;
  onPlayDaily: () => void;
  onClose: () => void;
}

export const DailyPuzzleModal: React.FC<DailyPuzzleModalProps> = ({
  isOpen,
  dateStr,
  record,
  currentStreak,
  maxStreak,
  onPlayDaily,
  onClose,
}) => {
  if (!isOpen) return null;

  // Format date nicely: "September 19, 2026"
  const dateObj = new Date(dateStr + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isCompleted = record?.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Daily Puzzle"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Calendar Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 text-amber-400">
          <Calendar className="w-7 h-7" />
        </div>

        <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">
          DAILY PUZZLE
        </h2>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 font-['Outfit']">
          {formattedDate}
        </h3>

        {/* Streak & Stats Badges */}
        <div className="flex items-center gap-3 mb-6 w-full">
          <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
              <span className="text-lg font-black text-white tabular-nums">{currentStreak} Days</span>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Streak</span>
              <span className="text-lg font-black text-white tabular-nums">{maxStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Challenge Description / Status */}
        {isCompleted ? (
          <div className="w-full bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Today's Challenge Solved!</span>
            </div>
            <div className="flex justify-around text-xs text-slate-300 mt-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Moves</span>
                <span className="text-base font-black text-cyan-400">{record.moves}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Target Par</span>
                <span className="text-base font-black text-slate-300">{record.par}</span>
              </div>
              {record.bestTimeSeconds !== undefined && record.bestTimeSeconds > 0 && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Best Time</span>
                  <span className="text-base font-black text-amber-300 font-mono">
                    {formatTime(record.bestTimeSeconds)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Every day presents a brand new, unique colour puzzle. Solve today's puzzle to maintain your daily streak!
          </p>
        )}

        {/* Play Button */}
        <button
          onClick={onPlayDaily}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isCompleted ? 'REPLAY TODAY\'S PUZZLE' : 'PLAY TODAY\'S CHALLENGE'}</span>
        </button>
      </div>
    </div>
  );
};
