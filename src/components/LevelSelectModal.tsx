import React, { useState } from 'react';
import { Check, Lock, Star, X } from 'lucide-react';
import { LevelRecord } from '../types';
import { formatTime } from '../utils/storage';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevel: number;
  progress: Record<number, LevelRecord>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevel,
  progress,
  onSelectLevel,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | '1-25' | '26-50' | '51-75' | '76-100'>('all');

  if (!isOpen) return null;

  // Determine max unlocked level (player can play any completed level + highest unlocked level)
  const completedIds = Object.keys(progress)
    .map(Number)
    .filter((id) => progress[id]?.completed);
  const maxUnlocked = Math.max(currentLevel, completedIds.length > 0 ? Math.max(...completedIds) + 1 : 1);

  // Filter levels
  const allLevels = Array.from({ length: 100 }, (_, i) => i + 1);
  const filteredLevels = allLevels.filter((lvl) => {
    if (activeTab === '1-25') return lvl >= 1 && lvl <= 25;
    if (activeTab === '26-50') return lvl >= 26 && lvl <= 50;
    if (activeTab === '51-75') return lvl >= 51 && lvl <= 75;
    if (activeTab === '76-100') return lvl >= 76 && lvl <= 100;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
              SELECT LEVEL
            </h2>
            <p className="text-xs text-slate-400">
              100 Solvable Levels • {completedIds.length} Completed
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Level Select"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto bg-slate-900/60 scrollbar-none">
          {[
            { id: 'all', label: 'All 100' },
            { id: '1-25', label: '1–25 (Easy)' },
            { id: '26-50', label: '26–50 (Medium)' },
            { id: '51-75', label: '51–75 (Hard)' },
            { id: '76-100', label: '76–100 (Expert)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Level Buttons Grid (Tablet Optimized) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4 auto-rows-max">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl <= maxUnlocked;
            const rec = progress[lvl];
            const isCompleted = rec?.completed;
            const isCurrent = lvl === currentLevel;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl)}
                className={`relative min-h-[72px] sm:min-h-[84px] p-2 rounded-2xl flex flex-col items-center justify-between border-2 transition-all duration-150 active:scale-95 ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400'
                    : isUnlocked
                    ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-500'
                    : 'border-slate-800 bg-slate-950/40 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Level Number */}
                <div className="flex items-center justify-between w-full px-1">
                  <span
                    className={`font-black text-sm sm:text-base tabular-nums ${
                      isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-300' : 'text-white'
                    }`}
                  >
                    {lvl.toString().padStart(2, '0')}
                  </span>

                  {isCompleted && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  )}
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </div>

                {/* Stars / Best Moves */}
                {isCompleted ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                            starIdx <= (rec.stars || 1)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-700 text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 tabular-nums">
                      {rec.bestMoves}m{rec.bestTimeSeconds ? ` • ${formatTime(rec.bestTimeSeconds)}` : ''}
                    </span>
                  </div>
                ) : isUnlocked ? (
                  <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">
                    {isCurrent ? 'CURRENT' : 'PLAY'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 font-bold">LOCKED</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
