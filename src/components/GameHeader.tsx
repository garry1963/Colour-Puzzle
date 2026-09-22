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

  // Reusable action buttons cluster
  const renderActionButtons = (isCompact: boolean = false) => (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* Streak Flame Badge Button */}
      <button
        onClick={onOpenDaily}
        title={
          currentStreak > 0
            ? `${currentStreak} Day Daily Streak! ${isDailyCompletedToday ? '(Solved today)' : '(Play today to keep streak)'}`
            : 'Daily Challenge - Play today to start a streak!'
        }
        aria-label="Daily Streak"
        className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border transition-all active:scale-95 group shrink-0 ${
          currentStreak > 0
            ? 'bg-orange-950/40 border-orange-500/50 hover:border-orange-400 shadow-sm shadow-orange-950/30'
            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-400'
        }`}
      >
        <Flame
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
            currentStreak > 0
              ? 'text-orange-500 fill-orange-500 animate-flame group-hover:scale-110'
              : 'text-slate-500 group-hover:text-amber-400'
          }`}
        />
        <span
          className={`font-black text-xs tabular-nums ${
            currentStreak > 0 ? 'text-amber-300' : 'text-slate-400'
          }`}
        >
          {currentStreak}
        </span>
        {isDailyCompletedToday && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80"
            title="Today's challenge completed"
          />
        )}
      </button>

      {/* Daily Challenge Button */}
      <button
        onClick={onOpenDaily}
        title="Daily Challenge"
        aria-label="Daily Challenge"
        className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center border active:scale-95 transition-all shrink-0 ${
          mode === 'daily'
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/40'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-slate-700'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Level Select Button */}
      <button
        onClick={onOpenLevelSelect}
        title="Level Select"
        aria-label="Level Select"
        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-cyan-300 border border-slate-700 active:scale-95 transition-all shrink-0"
      >
        <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Player Statistics Button */}
      <button
        onClick={onOpenStats}
        title="Player Statistics"
        aria-label="Player Statistics"
        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-cyan-200 border border-slate-700 active:scale-95 transition-all shrink-0"
      >
        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Tutorial / Help Button */}
      <button
        onClick={onOpenTutorial}
        title="How to Play"
        aria-label="How to Play"
        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 hover:text-emerald-200 border border-slate-700 active:scale-95 transition-all shrink-0"
      >
        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        title="Settings"
        aria-label="Settings"
        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all shrink-0"
      >
        <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  return (
    <header className="relative w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 lg:px-6 py-1 sm:py-2 landscape:py-1 lg:py-2 flex flex-col landscape:flex-row lg:flex-row items-stretch landscape:items-center lg:items-center justify-between gap-1 sm:gap-2 landscape:gap-0 lg:gap-0 shadow-lg z-30 select-none shrink-0">
      {/* Row 1 in Portrait / Left block in Landscape & Desktop */}
      <div className="flex items-center justify-between landscape:justify-start lg:justify-start w-full landscape:w-auto lg:w-auto gap-2">
        {/* Title & Level Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-white flex items-center font-['Outfit']">
                <span className="text-cyan-400">COLOUR PUZZLE</span>
              </h1>
              <button
                onClick={mode === 'daily' ? onOpenDaily : onOpenLevelSelect}
                title={mode === 'daily' ? 'Daily Challenge' : 'Select Level'}
                className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 text-slate-200 uppercase tracking-wider transition-colors active:scale-95"
              >
                {mode === 'daily' ? 'DAILY' : mode === 'custom' ? 'CUSTOM' : `LVL ${levelNumber}`}
              </button>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline leading-tight">
              {mode === 'daily'
                ? 'Daily Challenge'
                : mode === 'custom'
                ? `Custom Puzzle • Par: ${parMoves}`
                : `${difficulty} • Par: ${parMoves}`}
            </span>
          </div>
        </div>

        {/* Action Buttons in Portrait/Mobile ONLY (top-right) */}
        <div className="flex landscape:hidden lg:hidden items-center">
          {renderActionButtons(true)}
        </div>
      </div>

      {/* Row 2 in Portrait / Center Capsule in Landscape: Moves, Timer, Sorted & Tube selection */}
      <div className="w-full landscape:w-auto lg:w-auto flex items-center justify-between sm:justify-center gap-1 sm:gap-2.5 md:gap-4 bg-slate-950/70 px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-slate-800/80 shrink-0 text-xs">
        {/* Moves Counter */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400 font-semibold tracking-wider text-[10px] sm:text-xs">MOVES:</span>
          <span className="font-extrabold text-cyan-400 tabular-nums text-xs sm:text-base">{moves}</span>
          {bestMoves > 0 && (
            <span className="text-slate-400 text-[10px] hidden sm:inline ml-0.5">
              (BEST: {bestMoves})
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-3.5 sm:h-4.5 bg-slate-800" />

        {/* Timer (Current & Personal Best) */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm"
          title={`Current Time: ${formatTime(currentTimeSeconds)}${bestTimeSeconds !== undefined && bestTimeSeconds > 0 ? ` • Personal Best: ${formatTime(bestTimeSeconds)}` : ''}`}
        >
          <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400/80 shrink-0" />
          <span className="font-extrabold text-slate-200 tabular-nums text-xs sm:text-sm font-mono">
            {formatTime(currentTimeSeconds)}
          </span>
          {bestTimeSeconds !== undefined && bestTimeSeconds > 0 && (
            <span className="text-slate-400 text-[10px] hidden md:inline ml-0.5">
              (BEST: <span className="text-amber-400/90 font-mono">{formatTime(bestTimeSeconds)}</span>)
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-3.5 sm:h-4.5 bg-slate-800" />

        {/* Sorted Tubes Count */}
        <div
          className="flex items-center gap-1 text-[11px] sm:text-xs"
          title={`${solvedCount} of ${totalColors} colour tubes sorted`}
        >
          <span className="text-slate-400 font-semibold text-[10px] sm:text-[11px] uppercase">SORTED:</span>
          <span className="font-bold text-emerald-400 tabular-nums">{solvedCount}/{totalColors}</span>
          {solvedCount === totalColors && (
            <CheckCircle2 className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
          )}
        </div>

        {/* Selected Tube Status */}
        <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-2 text-xs">
          <span className="text-slate-400 font-semibold tracking-wider text-[10px] sm:text-xs">SELECTED:</span>
          <span
            className={`font-bold uppercase text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md tracking-wider ${
              selectedTubeIndex !== null
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'text-slate-400 bg-slate-900 border border-slate-800'
            }`}
          >
            {selectedTubeIndex !== null ? `TUBE ${selectedTubeIndex + 1}` : 'NONE'}
          </span>
        </div>
      </div>

      {/* Landscape & Desktop Right Container: Progress Bar + Action Buttons */}
      <div className="hidden landscape:flex lg:flex items-center gap-2 xl:gap-3 shrink-0">
        {/* Subtle Progress Bar Widget on wider landscape */}
        <div
          className="hidden xl:flex flex-col items-end justify-center mr-1 select-none"
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
          <div className="w-20 xl:w-24 h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full bg-cyan-500 transition-all duration-500 ease-out ${
                progressPct === 100 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80' : ''
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Buttons in Landscape & Desktop */}
        {renderActionButtons(false)}
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
          className={`h-full bg-cyan-500 transition-all duration-500 ease-out ${
            progressPct === 100
              ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]'
              : 'shadow-[0_0_8px_rgba(45,212,191,0.5)]'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
};
