import React from 'react';
import { ColorBlindMode, ColourId, Tube } from '../types';
import { getColour } from '../utils/colors';

interface TubeViewProps {
  index: number;
  tube: Tube;
  capacity: number;
  isSelected: boolean;
  isInvalid: boolean;
  isHintSource: boolean;
  isHintTarget: boolean;
  isPouringSource: boolean;
  isPouringTarget: boolean;
  pourDirection?: 'left' | 'right';
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}

export const TubeView: React.FC<TubeViewProps> = ({
  index,
  tube,
  capacity = 4,
  isSelected,
  isInvalid,
  isHintSource,
  isHintTarget,
  isPouringSource,
  isPouringTarget,
  pourDirection = 'right',
  colorBlindMode,
  highContrast,
  onSelect,
  reducedMotion,
}) => {
  const isComplete = tube.length === capacity && tube.every((c) => c === tube[0]);
  const isEmpty = tube.length === 0;

  // Calculate tilt transform during pour
  let transformClass = '';
  if (isPouringSource && !reducedMotion) {
    transformClass =
      pourDirection === 'right'
        ? '-translate-y-12 translate-x-6 rotate-60 scale-105 z-30 transition-all duration-300'
        : '-translate-y-12 -translate-x-6 -rotate-60 scale-105 z-30 transition-all duration-300';
  } else if (isSelected) {
    transformClass = '-translate-y-6 z-20 scale-105 transition-all duration-200';
  } else {
    transformClass = 'translate-y-0 transition-all duration-200 hover:-translate-y-1.5';
  }

  // Ring & glow styling
  let ringClasses = 'border-slate-700/80 shadow-[0_8px_20px_rgba(0,0,0,0.45)]';
  if (isSelected) {
    ringClasses = 'border-cyan-400 ring-4 ring-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.45)]';
  } else if (isInvalid) {
    ringClasses = 'border-rose-500 ring-4 ring-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-shake';
  } else if (isHintSource) {
    ringClasses = 'border-emerald-400 ring-4 ring-emerald-400/50 shadow-[0_0_25px_rgba(52,211,153,0.5)] animate-pulse';
  } else if (isHintTarget) {
    ringClasses = 'border-amber-400 ring-4 ring-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse';
  } else if (isComplete) {
    ringClasses = 'border-amber-300/80 ring-2 ring-amber-300/30 shadow-[0_0_20px_rgba(251,191,36,0.25)]';
  }

  // Pre-fill slots so empty slots are visual
  const slots: Array<ColourId | null> = [];
  for (let i = 0; i < capacity; i++) {
    slots.push(i < tube.length ? tube[i] : null);
  }

  return (
    <div
      id={`tube-container-${index}`}
      className="flex flex-col items-center select-none cursor-pointer group py-2 px-1 focus:outline-none"
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      aria-label={`Tube ${index + 1}: ${tube.length} of ${capacity} blocks${
        tube.length > 0 ? `, top color ${tube[tube.length - 1]}` : ', empty'
      }`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(index);
        }
      }}
    >
      {/* Hint Indicator Arrow */}
      <div className="h-6 flex items-center justify-center">
        {isHintSource && (
          <span className="text-emerald-400 font-bold text-xs tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 animate-bounce">
            POUR FROM
          </span>
        )}
        {isHintTarget && (
          <span className="text-amber-300 font-bold text-xs tracking-wider bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 animate-bounce">
            POUR HERE
          </span>
        )}
      </div>

      {/* Glass Tube Container */}
      <div
        id={`tube-body-${index}`}
        className={`relative w-16 sm:w-18 md:w-20 h-52 sm:h-56 md:h-64 rounded-b-3xl rounded-t-lg border-2 backdrop-blur-md bg-slate-900/50 flex flex-col justify-end p-1.5 overflow-hidden ${ringClasses} ${transformClass}`}
      >
        {/* Glass Rim Top Lip Specular Reflection */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-white/30 via-white/10 to-transparent border-b border-white/15 rounded-t-lg pointer-events-none z-20" />

        {/* Vertical Specular Glass Highlight Left */}
        <div className="absolute top-3 left-1 bottom-4 w-1.5 bg-gradient-to-r from-white/35 via-white/15 to-transparent rounded-full pointer-events-none z-20" />

        {/* Soft Glass Highlight Right */}
        <div className="absolute top-3 right-1 bottom-4 w-1 bg-gradient-to-l from-white/20 to-transparent rounded-full pointer-events-none z-20" />

        {/* Liquid Blocks (stacked bottom to top) */}
        <div className="relative w-full h-full flex flex-col-reverse justify-start rounded-b-2xl rounded-t-sm overflow-hidden z-10">
          {slots.map((colorId, slotIdx) => {
            if (!colorId) {
              return (
                <div
                  key={`empty-${slotIdx}`}
                  className="flex-1 border-b border-dashed border-slate-700/25 transition-all duration-200"
                />
              );
            }

            const color = getColour(colorId);
            const isTopLiquid = slotIdx === tube.length - 1;

            return (
              <div
                key={`block-${slotIdx}-${colorId}`}
                className={`relative flex-1 w-full flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${color.gradient} shadow-inner border-t border-white/20`}
                style={{
                  backgroundColor: color.hex,
                }}
              >
                {/* Meniscus / Fluid Curved Top on the uppermost liquid unit */}
                {isTopLiquid && (
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none" />
                )}

                {/* Subsurface Liquid Shimmer */}
                <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />

                {/* Accessibility Overlays */}
                {colorBlindMode === 'patterns' && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-80 mix-blend-overlay"
                    style={{
                      backgroundImage: `url(#pattern-${color.patternType})`,
                    }}
                  />
                )}

                {colorBlindMode === 'symbols' && (
                  <span
                    className="relative z-10 font-bold text-sm select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    style={{ color: color.textColor }}
                  >
                    {color.symbol}
                  </span>
                )}

                {colorBlindMode === 'names' && (
                  <span
                    className="relative z-10 font-bold text-[10px] sm:text-xs uppercase tracking-wider select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    style={{ color: color.textColor }}
                  >
                    {color.name.split(' ')[0]}
                  </span>
                )}

                {/* High contrast mode outline */}
                {highContrast && (
                  <div className="absolute inset-0 border border-black/40 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Solved Sparkle Overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-amber-400/10 pointer-events-none z-15 flex items-center justify-center">
            <span className="text-amber-300 font-extrabold text-xs tracking-widest bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-400/40">
              ✓ DONE
            </span>
          </div>
        )}
      </div>

      {/* Tube Number Label */}
      <div className="mt-2.5 flex items-center justify-center">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
            isSelected
              ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-400/40'
              : 'text-slate-400 bg-slate-900/60 border border-slate-800'
          }`}
        >
          {index + 1}
        </span>
      </div>
    </div>
  );
};
