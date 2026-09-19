import React from 'react';
import { Check, Info, X } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      step: '1',
      title: 'Tap a Tube to Select',
      desc: 'Tap any tube with colours to lift and select it as your source.',
      badge: 'Select',
    },
    {
      step: '2',
      title: 'Tap Another Tube to Pour',
      desc: 'Tap your destination tube to pour the top matching colour group.',
      badge: 'Pour',
    },
    {
      step: '3',
      title: 'Matching Colour or Empty Tube',
      desc: 'You can pour into an empty tube, or onto another tube if the top colour matches and there is free capacity.',
      badge: 'Rule',
    },
    {
      step: '4',
      title: 'Group Each Colour to Win!',
      desc: 'Sort all colours so that each tube contains only one uniform colour.',
      badge: 'Goal',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-slate-400">Sort. Pour. Solve.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Tutorial"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {rules.map((rule) => (
            <div
              key={rule.step}
              className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-black text-sm shrink-0">
                {rule.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-sm sm:text-base">{rule.title}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {rule.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Rule Helper */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
            <Check className="w-4 h-4" />
            <span>Valid Pour Examples:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span>Red → Empty Tube</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Blue → Top Blue</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};
