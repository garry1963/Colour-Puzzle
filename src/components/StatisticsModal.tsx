import React from 'react';
import { Award, Flame, Lightbulb, Sparkles, Target, Trophy, X, Zap } from 'lucide-react';
import { PlayerStats } from '../types';

interface StatisticsModalProps {
  isOpen: boolean;
  stats: PlayerStats;
  currentLevel: number;
  totalLevels: number;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  stats,
  currentLevel,
  totalLevels = 100,
  onClose,
}) => {
  if (!isOpen) return null;

  const completionPct = Math.round((stats.levelsCompleted / totalLevels) * 100);

  const statItems = [
    {
      label: 'Levels Completed',
      value: `${stats.levelsCompleted} / ${totalLevels}`,
      sub: `${completionPct}% Completed`,
      icon: Trophy,
      color: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30',
    },
    {
      label: 'Total Moves',
      value: stats.totalMoves.toLocaleString(),
      sub: 'Across all games',
      icon: Zap,
      color: 'text-indigo-400 bg-indigo-950/30 border-indigo-500/30',
    },
    {
      label: '3-Star Levels',
      value: stats.threeStarLevels.toString(),
      sub: 'Perfect par solves',
      icon: Award,
      color: 'text-amber-400 bg-amber-950/30 border-amber-500/30',
    },
    {
      label: 'Best Moves on Level',
      value: stats.bestMoves > 0 ? stats.bestMoves.toString() : '—',
      sub: 'Lowest moves single solve',
      icon: Target,
      color: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30',
    },
    {
      label: 'Daily Puzzles Solved',
      value: stats.dailyPuzzlesSolved.toString(),
      sub: `${stats.currentStreak} day current streak`,
      icon: Flame,
      color: 'text-orange-400 bg-orange-950/30 border-orange-500/30',
    },
    {
      label: 'Hints Used',
      value: stats.hintsUsed.toString(),
      sub: 'Strategic assists',
      icon: Lightbulb,
      color: 'text-yellow-400 bg-yellow-950/30 border-yellow-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                PLAYER STATISTICS
              </h2>
              <p className="text-xs text-slate-400">Your colour sorting career records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Statistics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              100-Level Campaign Progress
            </span>
            <span className="text-cyan-400">{completionPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, completionPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Current: Level {currentLevel}</span>
            <span>Target: Level 100</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5"
              >
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-xl font-black text-white tabular-nums block font-['Outfit']">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

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
