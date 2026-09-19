import React, { useState } from 'react';
import { Eye, FlaskConical, Gauge, RotateCcw, Settings as SettingsIcon, Volume2, VolumeX, Vibrate, Wand2, X } from 'lucide-react';
import { ColorBlindMode, GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  customPuzzlesCount?: number;
  onOpenPuzzleCreator: () => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  customPuzzlesCount = 0,
  onOpenPuzzleCreator,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const update = <K extends keyof GameSettings>(key: K, val: GameSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: val,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700">
              <SettingsIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                SETTINGS
              </h2>
              <p className="text-xs text-slate-400">Audio, animations & accessibility</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section: Audio & Haptics */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-3">
            Audio & Haptics
          </span>
          <div className="space-y-2">
            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <span className="text-sm font-bold text-white block">Sound Effects</span>
                  <span className="text-xs text-slate-400">Liquid pouring, selection & victory chimes</span>
                </div>
              </div>
              <button
                onClick={() => update('soundEnabled', !settings.soundEnabled)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
                  settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-sm font-bold text-white block">Haptic Feedback</span>
                  <span className="text-xs text-slate-400">Tactile response on taps and pours</span>
                </div>
              </div>
              <button
                onClick={() => update('hapticsEnabled', !settings.hapticsEnabled)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
                  settings.hapticsEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Gameplay & Animation */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-3">
            Gameplay & Animation
          </span>
          <div className="space-y-3">
            {/* Animation Speed */}
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Pour Speed</span>
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase">{settings.animationSpeed}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => update('animationSpeed', spd)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      settings.animationSpeed === spd
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white block">Reduced Motion</span>
                <span className="text-xs text-slate-400">Disable tube tilting for faster, simpler gameplay</span>
              </div>
              <button
                onClick={() => update('reducedMotion', !settings.reducedMotion)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
                  settings.reducedMotion ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Accessibility */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Accessibility & Visual Aids
          </span>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
            <div>
              <span className="text-sm font-bold text-white block mb-1">Colour-Blind Aid Mode</span>
              <span className="text-xs text-slate-400 block mb-2.5">
                Displays distinctive visual cues over coloured liquid blocks
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'Standard' },
                  { id: 'patterns', label: 'Patterns' },
                  { id: 'symbols', label: 'Symbols' },
                  { id: 'names', label: 'Names' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => update('colorBlindMode', mode.id as ColorBlindMode)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                      settings.colorBlindMode === mode.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">High Contrast Outlines</span>
              <button
                onClick={() => update('highContrast', !settings.highContrast)}
                className={`w-10 h-5.5 rounded-full p-1 transition-colors flex items-center ${
                  settings.highContrast ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Custom Puzzle Creator */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" />
            Custom Puzzle Creator
          </span>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-cyan-950/25 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="flex items-start gap-3 mb-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Create & Design Puzzles</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Design liquid color tubes, verify solvability with the built-in solver, or generate solvable layouts to play and share.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenPuzzleCreator();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all active:scale-98"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Open Puzzle Creator</span>
              {customPuzzlesCount !== undefined && customPuzzlesCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/80 text-cyan-300 font-mono font-bold">
                  {customPuzzlesCount} saved
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section: Reset Progress */}
        <div className="pt-4 border-t border-slate-800 mb-6">
          {showResetConfirm ? (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center">
              <span className="text-sm font-bold text-rose-300 block mb-2">
                Erase all level stars, records & stats?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/60 hover:bg-rose-950/40 border border-slate-700/60 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Progress & Scores</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase transition-all active:scale-95"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
