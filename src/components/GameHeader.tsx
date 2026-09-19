import React from 'react';
import { Calendar, CheckCircle2, Flame, HelpCircle, ListFilter, Settings as SettingsIcon, Timer, Trophy } from 'lucide-react';
import { GameMode } from '../types';
import { formatTime } from '../utils/storage';

interface GameHeaderProps {
  levelNumber: number;
  difficulty: string;
  moves: number;
  bestMoves: number;
  parMoves: number;
  currentTimeSeconds: number;
  bestTimeSeconds?: number;
  selectedTubeIndex: number | null;
  mode: GameMode;
  solvedCount: number;
  totalColors: number;
  totalTubes?: number;
  currentStreak?: number;
  isDailyCompletedToday?: boolean;
  onOpenLevelSelect: () => void;
  onOpenDaily: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  levelNumber,
  difficulty,
  moves,
  bestMoves,
  parMoves,
  currentTimeSeconds,
  bestTimeSeconds,
  selectedTubeIndex,
  mode,
  solvedCount,
  totalColors,
  totalTubes,
  currentStreak = 0,
  isDailyCompletedToday = false,
  onOpenLevelSelect,
  onOpenDaily,
  onOpenStats,
  onOpenSettings,
  onOpenTutorial,
}) => {
  const progressPct = totalColors > 0 ? Math.min(100, Math.round((solvedCount / totalColors) * 100)) : 0;

  return (
    <header className="relative w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg z-30 select-none">
      {/* Left: Title & Level Info */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                COLOUR PUZZLE
              </span>
            </h1>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 uppercase tracking-wider">
              {mode === 'daily' ? 'DAILY' : mode === 'custom' ? 'CUSTOM' : `LVL ${levelNumber}`}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:inline">
            {mode === 'daily'
              ? 'Daily Challenge'
              : mode === 'custom'
              ? `Custom Puzzle • Par: ${parMoves}`
              : `${difficulty} • Par: ${parMoves}`}
          </span>
        </div>
      </div>

      {/* Middle: Move Counter, Timer & Selected Tube */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5 bg-slate-950/60 px-3 sm:px-4 py-1.5 rounded-xl border border-slate-800/80">
        {/* Moves */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400 font-semibold tracking-wider text-[11px] sm:text-xs">MOVES:</span>
          <span className="font-extrabold text-cyan-400 tabular-nums text-sm sm:text-base">{moves}</span>
          {bestMoves > 0 && (
            <span className="text-slate-400 text-[10px] hidden md:inline ml-0.5">
              (BEST: {bestMoves})
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-800" />

        {/* Time (Current & Best) */}
        <div
          className="flex items-center gap-1.5 text-xs sm:text-sm"
          title={`Current Time: ${formatTime(currentTimeSeconds)}${bestTimeSeconds !== undefined && bestTimeSeconds > 0 ? ` • Personal Best: ${formatTime(bestTimeSeconds)}` : ''}`}
        >
          <Timer className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <div className="flex items-baseline gap-1">
            <span className="text-slate-400 font-semibold tracking-wider text-[11px] sm:text-xs hidden lg:inline">TIME:</span>
            <span className="font-extrabold text-slate-200 tabular-nums text-xs sm:text-sm font-mono">
              {formatTime(currentTimeSeconds)}
            </span>
          </div>
          {bestTimeSeconds !== undefined && bestTimeSeconds > 0 ? (
            <span className="text-slate-400 text-[10px] hidden sm:inline ml-0.5" title={`Personal Best: ${formatTime(bestTimeSeconds)}`}>
              (BEST: <span className="text-amber-400/90 font-mono">{formatTime(bestTimeSeconds)}</span>)
            </span>
          ) : (
            <span className="text-slate-500 text-[10px] hidden xl:inline ml-0.5">
              (BEST: —)
            </span>
          )}
        </div>

        {/* Mobile Mini Tubes Sorted Count */}
        <div className="flex md:hidden items-center gap-1 pl-2 border-l border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold text-[10px] uppercase">SORTED:</span>
          <span className="font-bold text-emerald-400 tabular-nums">{solvedCount}/{totalColors}</span>
        </div>

        {/* Divider (Tablet/Desktop) */}
        <div className="hidden md:block w-px h-5 bg-slate-800" />

        {/* Selected Tube Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400 font-semibold tracking-wider text-[11px] sm:text-xs">SELECTED:</span>
          <span
            className={`font-bold uppercase text-[11px] sm:text-xs px-2 py-0.5 rounded-md tracking-wider ${
              selectedTubeIndex !== null
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'text-slate-400 bg-slate-900 border border-slate-800'
            }`}
          >
            {selectedTubeIndex !== null ? `TUBE ${selectedTubeIndex + 1}` : 'NONE'}
          </span>
        </div>
      </div>

      {/* Right: Progress Bar, Streak Flame Badge & Navigation Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Flame Badge */}
        <button
          onClick={onOpenDaily}
          title={
            currentStreak > 0
              ? `${currentStreak} Day Daily Streak! ${isDailyCompletedToday ? '(Solved today)' : '(Play today to keep streak)'}`
              : 'Daily Challenge - Play to start a streak!'
          }
          aria-label="Daily Streak"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 group ${
            currentStreak > 0
              ? 'bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border-orange-500/50 hover:border-orange-400 shadow-sm shadow-orange-950/30'
              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-400'
          }`}
        >
          <Flame
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
              currentStreak > 0
                ? 'text-orange-500 fill-orange-500 animate-flame group-hover:scale-110'
                : 'text-slate-500 group-hover:text-amber-400'
            }`}
          />
          <div className="flex flex-col items-start leading-none">
            <span
              className={`font-black text-xs sm:text-sm tabular-nums ${
                currentStreak > 0 ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              {currentStreak}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 hidden md:inline">
              {currentStreak === 1 ? 'DAY' : 'DAYS'}
            </span>
          </div>
          {isDailyCompletedToday && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 ml-0.5"
              title="Today completed"
            />
          )}
        </button>

        {/* Subtle Progress Bar Widget */}
        <div
          className="hidden md:flex flex-col items-end justify-center mr-1 select-none"
          title={`${solvedCount} of ${totalColors} colour tubes sorted${totalTubes ? ` (${totalTubes} tubes on board)` : ''}`}
        >
          <div className="flex items-center gap-1.5 mb-1 leading-none">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">
              TUBES SORTED
            </span>
            <span className="text-xs font-black tabular-nums font-['Outfit'] flex items-center gap-0.5">
              <span className={solvedCount > 0 ? 'text-emerald-400' : 'text-slate-300'}>
                {solvedCount}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalColors}</span>
            </span>
            {solvedCount === totalColors && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            )}
          </div>
          {/* Progress Bar Track */}
          <div className="w-24 lg:w-32 h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out ${
                progressPct === 100 ? 'shadow-sm shadow-emerald-400/80' : ''
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Tablet Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onOpenDaily}
            title="Daily Challenge"
            aria-label="Daily Challenge"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-slate-700 active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenLevelSelect}
            title="Level Select"
            aria-label="Level Select"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            <ListFilter className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenStats}
            title="Player Statistics"
            aria-label="Player Statistics"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenTutorial}
            title="How to Play"
            aria-label="How to Play"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Settings"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 active:scale-95 transition-all"
          >
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Subtle Bottom Edge Real-time Progress Bar */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2.5px] bg-slate-800/80 overflow-hidden pointer-events-none"
        role="progressbar"
        aria-valuenow={solvedCount}
        aria-valuemin={0}
        aria-valuemax={totalColors}
        aria-label="Tubes sorted progress"
      >
        <div
          className={`h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out ${
            progressPct === 100
              ? 'shadow-[0_0_12px_rgba(52,211,153,0.95)]'
              : 'shadow-[0_0_8px_rgba(45,212,191,0.5)]'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
};
