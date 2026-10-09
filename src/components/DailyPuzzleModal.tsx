import React from 'react';
import { Award, Calendar, CheckCircle2, Flame, Play, Sparkles, X } from 'lucide-react';
import { DailyRecord, LevelData } from '../types';
import { getColour } from '../utils/colors';
import { formatTime } from '../utils/storage';

interface DailyPuzzleModalProps {
  isOpen: boolean;
  dateStr: string;
  record?: DailyRecord;
  levelPreview?: LevelData;
  currentStreak: number;
  maxStreak: number;
  onPlayDaily: () => void;
  onClose: () => void;
}

export const DailyPuzzleModal: React.FC<DailyPuzzleModalProps> = ({
  isOpen,
  dateStr,
  record,
  levelPreview,
  currentStreak,
  maxStreak,
  onPlayDaily,
  onClose,
}) => {
  if (!isOpen) return null;

  // Format date nicely: "October 9, 2026"
  const dateObj = new Date(dateStr + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isCompleted = record?.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Daily Puzzle"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Calendar Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 text-amber-400">
          <Calendar className="w-6 h-6" />
        </div>

        <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">
          DAILY PUZZLE
        </h2>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-4 font-['Outfit']">
          {formattedDate}
        </h3>

        {/* Streak & Stats Badges */}
        <div className="flex items-center gap-3 mb-4 w-full">
          <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-center gap-2">
            <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
              <span className="text-base font-black text-white tabular-nums">{currentStreak} Days</span>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-center gap-2">
            <Award className="w-4.5 h-4.5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Streak</span>
              <span className="text-base font-black text-white tabular-nums">{maxStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Today's Unique Theme / Preview Card */}
        {levelPreview && (
          <div className="w-full bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 mb-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Today's Unique Theme</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                {levelPreview.difficulty} • Par {levelPreview.parMoves}
              </span>
            </div>

            {/* Colour Swatches */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {levelPreview.colours.map((cid) => {
                const c = getColour(cid);
                return (
                  <div
                    key={cid}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800"
                    title={c.name}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] font-semibold text-slate-300">
                      {c.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge Description / Status */}
        {isCompleted ? (
          <div className="w-full bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3.5 mb-5 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Today's Challenge Solved!</span>
            </div>
            <div className="flex justify-around text-xs text-slate-300 mt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Your Moves</span>
                <span className="text-sm font-black text-cyan-400">{record.moves}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Par</span>
                <span className="text-sm font-black text-slate-300">{record.par}</span>
              </div>
              {record.bestTimeSeconds !== undefined && record.bestTimeSeconds > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Best Time</span>
                  <span className="text-sm font-black text-amber-300 font-mono">
                    {formatTime(record.bestTimeSeconds)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
            Every day presents a brand new, unique colour puzzle. Solve today's puzzle to maintain your daily streak!
          </p>
        )}

        {/* Play Button */}
        <button
          onClick={onPlayDaily}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isCompleted ? "REPLAY TODAY'S PUZZLE" : "PLAY TODAY'S CHALLENGE"}</span>
        </button>
      </div>
    </div>
  );
};
