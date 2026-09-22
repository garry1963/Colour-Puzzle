import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit3,
  Eraser,
  FlaskConical,
  Play,
  RotateCcw,
  Save,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { ColorBlindMode, ColourId, CustomPuzzle, Tube } from '../types';
import { sound } from '../utils/audio';
import { COLOURS, getColour } from '../utils/colors';
import { generateSolvableLevel } from '../utils/levelGenerator';
import { isSolved, isTubeUniform, solvePuzzle } from '../utils/solver';
import { formatTime, Storage } from '../utils/storage';

const AVAILABLE_COLOUR_IDS: ColourId[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'cyan',
  'pink',
  'teal',
  'coral',
  'amber',
  'silver',
];

interface PuzzleCreatorModalProps {
  isOpen: boolean;
  colorBlindMode?: ColorBlindMode;
  onPlayCustomPuzzle: (puzzle: CustomPuzzle) => void;
  onClose: () => void;
}

export const PuzzleCreatorModal: React.FC<PuzzleCreatorModalProps> = ({
  isOpen,
  colorBlindMode = 'none',
  onPlayCustomPuzzle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
  const [savedPuzzles, setSavedPuzzles] = useState<CustomPuzzle[]>([]);

  // Puzzle configuration
  const [puzzleId, setPuzzleId] = useState<string>(() => `custom_${Date.now()}`);
  const [puzzleName, setPuzzleName] = useState<string>('My Custom Puzzle');
  const [colorCount, setColorCount] = useState<number>(4);
  const [capacity, setCapacity] = useState<number>(4);
  const [emptyTubes, setEmptyTubes] = useState<number>(2);

  // Active brush ('eraser' or ColourId)
  const [selectedBrush, setSelectedBrush] = useState<ColourId | 'eraser'>('red');

  // Tubes state: array of layers (0 = bottom, length-1 = top)
  const [tubes, setTubes] = useState<Tube[]>(() => {
    // Initial empty tubes
    const initial: Tube[] = [];
    for (let i = 0; i < 4 + 2; i++) {
      initial.push([]);
    }
    return initial;
  });

  // Solver & Solvability validation state
  const [solverResult, setSolverResult] = useState<{
    tested: boolean;
    isSolvable: boolean;
    moves?: number;
    message: string;
  }>({
    tested: false,
    isSolvable: false,
    message: '',
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Selected colours list based on colorCount
  const selectedColours = useMemo(() => {
    return AVAILABLE_COLOUR_IDS.slice(0, colorCount);
  }, [colorCount]);

  // Load saved puzzles on open
  useEffect(() => {
    if (isOpen) {
      setSavedPuzzles(Storage.getCustomPuzzles());
      setSaveSuccessMessage(null);
    }
  }, [isOpen]);

  // Sync brush if current brush was removed due to colorCount reduction
  useEffect(() => {
    if (selectedBrush !== 'eraser' && !selectedColours.includes(selectedBrush)) {
      setSelectedBrush(selectedColours[0] || 'red');
    }
  }, [selectedColours, selectedBrush]);

  // Count instances of each color currently placed in tubes
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of selectedColours) {
      counts[c] = 0;
    }
    for (const tube of tubes) {
      for (const color of tube) {
        if (counts[color] !== undefined) {
          counts[color]++;
        } else {
          counts[color] = 1;
        }
      }
    }
    return counts;
  }, [tubes, selectedColours]);

  // Validation rules
  const validationStatus = useMemo(() => {
    const missing: { color: ColourId; needed: number }[] = [];
    const excess: { color: ColourId; extra: number }[] = [];
    let totalPlaced = 0;

    for (const c of selectedColours) {
      const cnt = colorCounts[c] || 0;
      totalPlaced += cnt;
      if (cnt < capacity) {
        missing.push({ color: c, needed: capacity - cnt });
      } else if (cnt > capacity) {
        excess.push({ color: c, extra: cnt - capacity });
      }
    }

    // Check if any tube is already pre-solved at start
    const alreadySolvedCount = tubes.filter(
      (t) => t.length === capacity && isTubeUniform(t)
    ).length;

    const targetTotal = selectedColours.length * capacity;
    const isCountExact = missing.length === 0 && excess.length === 0;

    return {
      totalPlaced,
      targetTotal,
      isCountExact,
      missing,
      excess,
      alreadySolvedCount,
    };
  }, [selectedColours, colorCounts, capacity, tubes]);

  // Automatically test solvability when color distribution is exact
  useEffect(() => {
    if (!validationStatus.isCountExact) {
      setSolverResult({
        tested: false,
        isSolvable: false,
        message: `Distribute exactly ${capacity} units of each color (${validationStatus.totalPlaced}/${validationStatus.targetTotal} placed).`,
      });
      return;
    }

    // If board is already completed
    if (isSolved(tubes, capacity)) {
      setSolverResult({
        tested: true,
        isSolvable: false,
        message: 'Puzzle is already solved! Mix the colors so the player has a challenge.',
      });
      return;
    }

    // Run solver with 5000 max steps
    const solution = solvePuzzle(tubes, capacity, 5000);
    if (solution && solution.length > 0) {
      setSolverResult({
        tested: true,
        isSolvable: true,
        moves: solution.length,
        message: `Guaranteed Solvable! Minimum solution: ${solution.length} moves.`,
      });
    } else {
      setSolverResult({
        tested: true,
        isSolvable: false,
        message: 'Unsolvable arrangement. Try swapping a few liquid layers or adding another empty tube.',
      });
    }
  }, [tubes, capacity, validationStatus]);

  // Reset or adjust tubes when count or empty tubes change
  const handleConfigChange = (newColorCount: number, newEmpty: number, newCapacity: number) => {
    setColorCount(newColorCount);
    setEmptyTubes(newEmpty);
    setCapacity(newCapacity);

    const totalTubes = newColorCount + newEmpty;
    setTubes((prev) => {
      const next: Tube[] = [];
      for (let i = 0; i < totalTubes; i++) {
        if (i < prev.length) {
          // Truncate if new capacity is smaller
          next.push(prev[i].slice(0, newCapacity));
        } else {
          next.push([]);
        }
      }
      return next;
    });
  };

  // Generate a random solvable puzzle directly into the editor
  const handleRandomize = () => {
    sound.playButton();
    const generated = generateSolvableLevel({
      levelId: 9000 + Math.floor(Math.random() * 900),
      colorCount,
      emptyTubes,
      capacity,
      seed: Date.now() % 1000000,
    });

    setTubes(generated.tubes.map((t) => [...t]));
    setPuzzleName(`Puzzle ${colorCount}C-${emptyTubes}E`);
    setSaveSuccessMessage('Generated a verified solvable layout!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Clear all tubes
  const handleClearAll = () => {
    sound.playButton();
    const totalTubes = colorCount + emptyTubes;
    const cleared: Tube[] = [];
    for (let i = 0; i < totalTubes; i++) {
      cleared.push([]);
    }
    setTubes(cleared);
  };

  // Click on a specific slot in a tube
  const handleSlotClick = (tubeIndex: number, slotIndex: number) => {
    sound.playPop();
    setTubes((prev) => {
      const next = prev.map((t) => [...t]);
      const targetTube = next[tubeIndex];

      if (selectedBrush === 'eraser') {
        // Remove liquid at this slot or above
        if (slotIndex < targetTube.length) {
          targetTube.splice(slotIndex, 1);
        }
      } else {
        // If clicking within existing liquid, update that color
        if (slotIndex < targetTube.length) {
          if (targetTube[slotIndex] === selectedBrush) {
            // Clicking same color toggles it off
            targetTube.splice(slotIndex, 1);
          } else {
            targetTube[slotIndex] = selectedBrush;
          }
        } else if (slotIndex === targetTube.length && targetTube.length < capacity) {
          // Append to top if clicking the next available slot
          targetTube.push(selectedBrush);
        }
      }
      return next;
    });
  };

  // Click the whole tube body: pushes or pops the active brush to the top
  const handleTubeHeaderClick = (tubeIndex: number) => {
    sound.playPop();
    setTubes((prev) => {
      const next = prev.map((t) => [...t]);
      const targetTube = next[tubeIndex];

      if (selectedBrush === 'eraser') {
        if (targetTube.length > 0) {
          targetTube.pop();
        }
      } else {
        if (targetTube.length < capacity) {
          targetTube.push(selectedBrush);
        }
      }
      return next;
    });
  };

  // Auto-fill remaining needed colors
  const handleAutoFill = () => {
    sound.playButton();
    const neededList: ColourId[] = [];
    for (const c of selectedColours) {
      const cnt = colorCounts[c] || 0;
      for (let i = 0; i < capacity - cnt; i++) {
        neededList.push(c);
      }
    }

    if (neededList.length === 0) return;

    // Shuffle needed colors
    for (let i = neededList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [neededList[i], neededList[j]] = [neededList[j], neededList[i]];
    }

    setTubes((prev) => {
      const next = prev.map((t) => [...t]);
      let ptr = 0;
      // First fill non-empty tubes up to capacity
      for (let i = 0; i < colorCount; i++) {
        while (next[i].length < capacity && ptr < neededList.length) {
          next[i].push(neededList[ptr++]);
        }
      }
      // If still items left, put in empty tubes
      for (let i = colorCount; i < next.length; i++) {
        while (next[i].length < capacity && ptr < neededList.length) {
          next[i].push(neededList[ptr++]);
        }
      }
      return next;
    });
  };

  // Save the current puzzle
  const handleSavePuzzle = (notify: boolean = true) => {
    sound.playButton();
    const puzzle: CustomPuzzle = {
      id: puzzleId,
      name: puzzleName.trim() || `Custom Puzzle ${savedPuzzles.length + 1}`,
      createdAt: new Date().toISOString(),
      tubes: tubes.map((t) => [...t]),
      colours: selectedColours,
      capacity,
      emptyTubes,
      parMoves: solverResult.moves
        ? solverResult.moves + Math.max(2, Math.floor(solverResult.moves * 0.25))
        : colorCount * 4,
      isSolvable: solverResult.isSolvable,
      minMoves: solverResult.moves,
    };

    Storage.saveCustomPuzzle(puzzle);
    setSavedPuzzles(Storage.getCustomPuzzles());

    if (notify) {
      setSaveSuccessMessage('Puzzle saved to your library!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }

    return puzzle;
  };

  // Save & Play Immediately
  const handlePlayCurrent = () => {
    sound.playVictory();
    const puzzle = handleSavePuzzle(false);
    onPlayCustomPuzzle(puzzle);
    onClose();
  };

  // Load a puzzle from library into editor
  const handleEditSaved = (puzzle: CustomPuzzle) => {
    sound.playButton();
    setPuzzleId(puzzle.id);
    setPuzzleName(puzzle.name);
    setColorCount(puzzle.colours.length);
    setCapacity(puzzle.capacity);
    setEmptyTubes(puzzle.emptyTubes);
    setTubes(puzzle.tubes.map((t) => [...t]));
    setActiveTab('editor');
  };

  // Delete saved puzzle
  const handleDeleteSaved = (id: string) => {
    sound.playButton();
    Storage.deleteCustomPuzzle(id);
    setSavedPuzzles(Storage.getCustomPuzzles());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header with Title and Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                PUZZLE CREATOR
              </h2>
              <p className="text-xs text-slate-400">Design, verify solvability, and play custom sorting puzzles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>My Puzzles</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {savedPuzzles.length}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Puzzle Creator"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Editor */}
        {activeTab === 'editor' && (
          <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4 pr-1">
            {/* Success toast notice */}
            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Puzzle Setup Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
              {/* Puzzle Name */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Puzzle Title
                </label>
                <input
                  type="text"
                  value={puzzleName}
                  onChange={(e) => setPuzzleName(e.target.value)}
                  placeholder="My Custom Puzzle"
                  maxLength={28}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Number of Colors */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Colours ({colorCount})
                </label>
                <div className="flex items-center gap-1">
                  {[3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleConfigChange(num, emptyTubes, capacity)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        colorCount === num
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empty Tubes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Empty Tubes ({emptyTubes})
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleConfigChange(colorCount, num, capacity)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        emptyTubes === num
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tube Capacity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Height / Capacity ({capacity})
                </label>
                <div className="flex items-center gap-1">
                  {[3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleConfigChange(colorCount, emptyTubes, num)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        capacity === num
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Generator & Helper Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRandomize}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Random Solvable Layout</span>
                </button>

                <button
                  onClick={handleAutoFill}
                  disabled={validationStatus.isCountExact}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>⚡ Auto-Fill Rest</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Placed units count */}
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <span>Placed:</span>
                <span
                  className={`font-black font-mono px-2 py-0.5 rounded-md ${
                    validationStatus.isCountExact
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  {validationStatus.totalPlaced} / {validationStatus.targetTotal}
                </span>
              </div>
            </div>

            {/* Palette & Brush Selection */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Color Brush Palette (Click a color to paint layers):
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {capacity} of each color
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedColours.map((cid) => {
                  const info = getColour(cid);
                  const count = colorCounts[cid] || 0;
                  const isComplete = count === capacity;
                  const isOver = count > capacity;
                  const isSelected = selectedBrush === cid;

                  return (
                    <button
                      key={cid}
                      onClick={() => setSelectedBrush(cid)}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-white ring-2 ring-white/50 scale-105 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700 opacity-90'
                      }`}
                      style={{
                        backgroundColor: isSelected ? info.hex + '33' : '#0f172a',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: info.hex }}
                      />
                      <span className="text-white capitalize">{cid}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                          isComplete
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            : isOver
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-amber-300'
                        }`}
                      >
                        {count}/{capacity}
                      </span>
                    </button>
                  );
                })}

                {/* Eraser Tool */}
                <button
                  onClick={() => setSelectedBrush('eraser')}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    selectedBrush === 'eraser'
                      ? 'bg-rose-500 text-white border-white ring-2 ring-rose-400/40 scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>
              </div>
            </div>

            {/* Tubes Arena - Interactive Editor */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
              <div className="flex items-end justify-center gap-3 sm:gap-4 min-w-max py-2 px-2">
                {tubes.map((tube, tubeIdx) => {
                  const isTubeFull = tube.length >= capacity;
                  const isEmpty = tube.length === 0;

                  // Create slots from 0 to capacity-1 (0 = bottom layer)
                  const slotIndices = Array.from({ length: capacity }, (_, i) => i);

                  return (
                    <div key={tubeIdx} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 mb-1 font-mono">
                        #{tubeIdx + 1}
                      </span>

                      {/* Glass Tube Frame */}
                      <div
                        onClick={() => handleTubeHeaderClick(tubeIdx)}
                        className={`relative w-14 sm:w-16 h-48 sm:h-52 rounded-b-2xl rounded-t-md border-2 border-slate-700/80 bg-slate-900/60 backdrop-blur-sm flex flex-col-reverse p-1 cursor-pointer transition-all hover:border-cyan-400 group overflow-hidden ${
                          isEmpty ? 'border-dashed' : ''
                        }`}
                        title="Click to paint/remove top layer, or click individual slots"
                      >
                        {/* Glass rim specular reflection */}
                        <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-20" />

                        {/* Slots */}
                        {slotIndices.map((slotIdx) => {
                          const colorId = tube[slotIdx] || null;
                          const colorInfo = colorId ? getColour(colorId) : null;

                          return (
                            <div
                              key={slotIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotClick(tubeIdx, slotIdx);
                              }}
                              className={`relative flex-1 w-full rounded-sm flex items-center justify-center transition-all ${
                                colorInfo
                                  ? 'border-t border-white/20'
                                  : 'border-t border-dashed border-slate-800/60 hover:bg-white/5'
                              }`}
                              style={colorInfo ? { backgroundColor: colorInfo.hex } : undefined}
                              title={
                                colorInfo
                                  ? `${colorInfo.name} (Layer ${slotIdx + 1})`
                                  : `Empty Slot ${slotIdx + 1}`
                              }
                            >
                              {colorInfo && colorBlindMode === 'symbols' && (
                                <span className="text-white text-xs font-black drop-shadow">
                                  {colorInfo.symbol}
                                </span>
                              )}
                              {!colorInfo && slotIdx === tube.length && (
                                <span className="text-[9px] text-slate-400 group-hover:text-cyan-400 transition-colors">
                                  +
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Tube Quick Action */}
                      <button
                        onClick={() => {
                          sound.playButton();
                          setTubes((prev) => {
                            const next = prev.map((t) => [...t]);
                            next[tubeIdx] = [];
                            return next;
                          });
                        }}
                        disabled={isEmpty}
                        className="mt-1.5 text-[9px] font-bold text-slate-400 hover:text-rose-400 disabled:opacity-0 transition-all uppercase"
                      >
                        Empty
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Solvability Status Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                solverResult.isSolvable
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200 shadow-md shadow-emerald-950/30'
                  : validationStatus.isCountExact
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}
            >
              {solverResult.isSolvable ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : validationStatus.isCountExact ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <FlaskConical className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div className="flex-1 text-xs">
                <span className="font-bold block">
                  {solverResult.isSolvable
                    ? 'Puzzle Solvability: Verified!'
                    : validationStatus.isCountExact
                    ? 'Solvability Warning'
                    : 'Puzzle Status: Incomplete Distribution'}
                </span>
                <span className="text-slate-400 text-[11px]">{solverResult.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Library */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto pt-4 pb-2 pr-1">
            {savedPuzzles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
                <FlaskConical className="w-10 h-10 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-300 mb-1">No Custom Puzzles Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Switch to the Editor tab to craft and test your very first custom water puzzle!
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-all"
                >
                  Create a Puzzle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedPuzzles.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                        {p.isSolvable ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Solvable
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="text-xs text-slate-400 space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span>Colors / Tubes:</span>
                          <span className="font-bold text-slate-300">
                            {p.colours.length} colours • {p.tubes.length} tubes
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Par / Min Moves:</span>
                          <span className="font-bold text-slate-300">
                            {p.parMoves} par {p.minMoves ? `(${p.minMoves} min)` : ''}
                          </span>
                        </div>
                        {p.completed && (
                          <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                            <span>Best Record:</span>
                            <span>
                              {p.bestMoves} moves {p.bestTimeSeconds ? `• ${formatTime(p.bestTimeSeconds)}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mini Color Dots */}
                      <div className="flex items-center gap-1 mb-4">
                        {p.colours.map((cid) => (
                          <div
                            key={cid}
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: getColour(cid).hex }}
                            title={cid}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          sound.playVictory();
                          onPlayCustomPuzzle(p);
                          onClose();
                        }}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => handleEditSaved(p)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit in Designer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSaved(p.id)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Delete Puzzle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Action Buttons */}
        {activeTab === 'editor' && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => handleSavePuzzle(true)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>Save to Library</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
              >
                Close
              </button>

              <button
                onClick={handlePlayCurrent}
                disabled={!validationStatus.isCountExact}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Puzzle Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
