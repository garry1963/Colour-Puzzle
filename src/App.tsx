/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomToolbar } from './components/BottomToolbar';
import { DailyPuzzleModal } from './components/DailyPuzzleModal';
import { GameHeader } from './components/GameHeader';
import { HelpMovesModal } from './components/HelpMovesModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PuzzleCreatorModal } from './components/PuzzleCreatorModal';
import { RestartConfirmModal } from './components/RestartConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { StatisticsModal } from './components/StatisticsModal';
import { SvgPatterns } from './components/SvgPatterns';
import { TubeView } from './components/TubeView';
import { TutorialModal } from './components/TutorialModal';
import { ALL_100_LEVELS, getLevelData } from './data/levels';
import {
  ColourId,
  CustomPuzzle,
  GameMode,
  GameSettings,
  HintResult,
  LevelData,
  MoveSnapshot,
  PourAnimationState,
  Tube,
} from './types';
import { sound } from './utils/audio';
import { fireVictoryConfetti } from './utils/confetti';
import { generateDailyPuzzle } from './utils/levelGenerator';
import { canPour, executePour, getSmartHint, isSolved, isTubeUniform } from './utils/solver';
import { Storage } from './utils/storage';

export default function App() {
  // --- Persistent State & Settings ---
  const [settings, setSettings] = useState<GameSettings>(() => Storage.getSettings());
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => Storage.getCurrentLevel());
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [levelProgress, setLevelProgress] = useState(() => Storage.getLevelProgress());
  const [playerStats, setPlayerStats] = useState(() => Storage.getStats());
  const [dailyProgress, setDailyProgress] = useState(() => Storage.getDailyProgress());

  // --- Active Game Session State ---
  const [levelData, setLevelData] = useState<LevelData>(() => getLevelData(currentLevelId));
  const [tubes, setTubes] = useState<Tube[]>(() => levelData.tubes.map((t) => [...t]));
  const [moves, setMoves] = useState<number>(0);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveSnapshot[]>([]);
  const [hint, setHint] = useState<HintResult | null>(null);

  // --- Animation & Feedback States ---
  const [invalidTubeIndex, setInvalidTubeIndex] = useState<number | null>(null);
  const [pourState, setPourState] = useState<PourAnimationState>({
    isPouring: false,
    fromIndex: null,
    toIndex: null,
    color: null,
    count: 0,
  });

  // --- Modals State ---
  const [isLevelCompleteOpen, setIsLevelCompleteOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [isHelpMovesOpen, setIsHelpMovesOpen] = useState(false);
  const [isPuzzleCreatorOpen, setIsPuzzleCreatorOpen] = useState(false);
  const [activeCustomPuzzle, setActiveCustomPuzzle] = useState<CustomPuzzle | null>(null);

  // --- Level Time Tracking ---
  const [elapsedTimeSeconds, setElapsedTimeSeconds] = useState<number>(0);
  const [levelSolveTime, setLevelSolveTime] = useState<number>(0);

  // Today's Date String for Daily Challenge
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Update sound engine when settings change
  useEffect(() => {
    sound.setSoundEnabled(settings.soundEnabled);
    sound.setHapticsEnabled(settings.hapticsEnabled);
    Storage.saveSettings(settings);
  }, [settings]);

  // First-time player tutorial check
  useEffect(() => {
    if (!Storage.hasSeenTutorial()) {
      setIsTutorialOpen(true);
      Storage.setSeenTutorial(true);
    }
  }, []);

  // Timer interval: ticks every second when puzzle is active and no blocking modals are open
  useEffect(() => {
    if (
      isLevelCompleteOpen ||
      isLevelSelectOpen ||
      isDailyOpen ||
      isStatsOpen ||
      isSettingsOpen ||
      isTutorialOpen ||
      isRestartConfirmOpen ||
      isHelpMovesOpen ||
      isPuzzleCreatorOpen
    ) {
      return;
    }

    const timerId = setInterval(() => {
      setElapsedTimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [
    isLevelCompleteOpen,
    isLevelSelectOpen,
    isDailyOpen,
    isStatsOpen,
    isSettingsOpen,
    isTutorialOpen,
    isRestartConfirmOpen,
    isHelpMovesOpen,
    isPuzzleCreatorOpen,
  ]);

  // Initialize or reload level
  const loadLevel = useCallback((lvlId: number, mode: GameMode = 'classic') => {
    const data = mode === 'daily' ? generateDailyPuzzle(todayDateStr) : getLevelData(lvlId);

    setLevelData(data);
    setTubes(data.tubes.map((t) => [...t]));
    setMoves(0);
    setElapsedTimeSeconds(0);
    setLevelSolveTime(0);
    setSelectedTubeIndex(null);
    setMoveHistory([]);
    setHint(null);
    setInvalidTubeIndex(null);
    setIsLevelCompleteOpen(false);
    setGameMode(mode);
    setActiveCustomPuzzle(null);

    if (mode === 'classic') {
      setCurrentLevelId(lvlId);
      Storage.setCurrentLevel(lvlId);
    }
  }, [todayDateStr]);

  // Load custom puzzle created by user
  const loadCustomPuzzle = useCallback((puzzle: CustomPuzzle) => {
    const data: LevelData = {
      levelId: 0,
      difficulty: 'Custom',
      tubeCapacity: puzzle.capacity,
      emptyTubes: puzzle.emptyTubes,
      colours: puzzle.colours,
      tubes: puzzle.tubes.map((t) => [...t]),
      parMoves: puzzle.parMoves,
    };

    setActiveCustomPuzzle(puzzle);
    setLevelData(data);
    setTubes(data.tubes.map((t) => [...t]));
    setMoves(0);
    setElapsedTimeSeconds(0);
    setLevelSolveTime(0);
    setSelectedTubeIndex(null);
    setMoveHistory([]);
    setHint(null);
    setInvalidTubeIndex(null);
    setIsLevelCompleteOpen(false);
    setIsPuzzleCreatorOpen(false);
    setIsSettingsOpen(false);
    setGameMode('custom');
  }, []);

  // Load initial level on mount
  useEffect(() => {
    loadLevel(currentLevelId, 'classic');
  }, []);

  // Count solved tubes
  const solvedCount = useMemo(() => {
    return tubes.filter(
      (t) => t.length === levelData.tubeCapacity && isTubeUniform(t)
    ).length;
  }, [tubes, levelData.tubeCapacity]);

  // Record for current level
  const currentRecord = useMemo(() => {
    if (gameMode === 'custom') {
      return activeCustomPuzzle
        ? {
            completed: Boolean(activeCustomPuzzle.completed),
            stars: 3,
            bestMoves: activeCustomPuzzle.bestMoves || 0,
            bestTimeSeconds: activeCustomPuzzle.bestTimeSeconds,
          }
        : undefined;
    }
    return levelProgress[currentLevelId];
  }, [gameMode, activeCustomPuzzle, levelProgress, currentLevelId]);

  // Best time for current level (classic, daily, or custom)
  const currentBestTime = useMemo(() => {
    if (gameMode === 'daily') {
      return dailyProgress[todayDateStr]?.bestTimeSeconds;
    }
    if (gameMode === 'custom') {
      return activeCustomPuzzle?.bestTimeSeconds;
    }
    return levelProgress[currentLevelId]?.bestTimeSeconds;
  }, [gameMode, dailyProgress, todayDateStr, activeCustomPuzzle, levelProgress, currentLevelId]);

  // Check if puzzle is solved
  const checkWinCondition = useCallback(
    (currentTubes: Tube[], totalMoves: number) => {
      if (isSolved(currentTubes, levelData.tubeCapacity)) {
        // Snapshot final solve time (at least 1s)
        const finalTime = Math.max(1, elapsedTimeSeconds);
        setLevelSolveTime(finalTime);

        // Calculate stars
        let stars = 1;
        if (totalMoves <= levelData.parMoves) {
          stars = 3;
        } else if (totalMoves <= Math.ceil(levelData.parMoves * 1.35)) {
          stars = 2;
        }

        if (gameMode === 'daily') {
          Storage.saveDailyCompletion(todayDateStr, totalMoves, levelData.parMoves, finalTime);
          setDailyProgress(Storage.getDailyProgress());
        } else if (gameMode === 'custom' && activeCustomPuzzle) {
          Storage.saveCustomPuzzleCompletion(activeCustomPuzzle.id, totalMoves, finalTime);
          setActiveCustomPuzzle((prev) =>
            prev
              ? {
                  ...prev,
                  completed: true,
                  bestMoves: prev.bestMoves !== undefined ? Math.min(prev.bestMoves, totalMoves) : totalMoves,
                  bestTimeSeconds:
                    prev.bestTimeSeconds !== undefined
                      ? Math.min(prev.bestTimeSeconds, finalTime)
                      : finalTime,
                }
              : null
          );
        } else {
          Storage.saveLevelProgress(levelData.levelId, totalMoves, stars, finalTime);
          setLevelProgress(Storage.getLevelProgress());
        }
        setPlayerStats(Storage.getStats());

        // Trigger celebratory particle explosion effect immediately on solve!
        fireVictoryConfetti(stars);

        // Slight pause for the last liquid block to settle before celebration modal
        setTimeout(() => {
          setIsLevelCompleteOpen(true);
        }, 350);
      }
    },
    [levelData, gameMode, activeCustomPuzzle, todayDateStr, elapsedTimeSeconds]
  );

  // Animation delay based on user settings
  const animationDurationMs = useMemo(() => {
    if (settings.reducedMotion) return 100;
    if (settings.animationSpeed === 'fast') return 200;
    if (settings.animationSpeed === 'slow') return 450;
    return 300;
  }, [settings.animationSpeed, settings.reducedMotion]);

  // Tube click handler (Select -> Pour)
  const handleTubeSelect = useCallback(
    (index: number) => {
      // Don't interact during pouring animation
      if (pourState.isPouring) return;

      // 1. If no tube is currently selected
      if (selectedTubeIndex === null) {
        const targetTube = tubes[index];
        // Cannot select an empty tube
        if (targetTube.length === 0) {
          setInvalidTubeIndex(index);
          sound.playInvalid();
          setTimeout(() => setInvalidTubeIndex(null), 350);
          return;
        }
        // Already completed tube warning / selection
        if (targetTube.length === levelData.tubeCapacity && isTubeUniform(targetTube)) {
          sound.playButton();
        } else {
          sound.playSelect();
        }
        setSelectedTubeIndex(index);
        setHint(null);
        return;
      }

      // 2. If clicking the already selected tube -> Deselect
      if (selectedTubeIndex === index) {
        sound.playButton();
        setSelectedTubeIndex(null);
        return;
      }

      // 3. Pour from selectedTubeIndex to index
      const check = canPour(tubes, selectedTubeIndex, index, levelData.tubeCapacity);

      if (!check.valid || !check.color) {
        // Invalid move feedback
        setInvalidTubeIndex(index);
        sound.playInvalid();
        setTimeout(() => setInvalidTubeIndex(null), 350);
        return;
      }

      // Valid move!
      const pourDirection = index > selectedTubeIndex ? 'right' : 'left';
      setPourState({
        isPouring: true,
        fromIndex: selectedTubeIndex,
        toIndex: index,
        color: check.color,
        count: check.count,
        pourDirection,
      });

      sound.playPour();

      // Snapshot state for UNDO
      const snapshot: MoveSnapshot = {
        tubes: tubes.map((t) => [...t]),
        moves,
        fromIndex: selectedTubeIndex,
        toIndex: index,
        color: check.color,
        count: check.count,
      };

      setTimeout(() => {
        const result = executePour(tubes, selectedTubeIndex, index, levelData.tubeCapacity);
        if (result) {
          const nextMoves = moves + 1;
          setTubes(result.newTubes);
          setMoves(nextMoves);
          setMoveHistory((prev) => [...prev, snapshot]);
          checkWinCondition(result.newTubes, nextMoves);
        }

        setPourState({
          isPouring: false,
          fromIndex: null,
          toIndex: null,
          color: null,
          count: 0,
        });
        setSelectedTubeIndex(null);
      }, animationDurationMs);
    },
    [
      pourState.isPouring,
      selectedTubeIndex,
      tubes,
      levelData.tubeCapacity,
      moves,
      animationDurationMs,
      checkWinCondition,
    ]
  );

  // UNDO Action
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || pourState.isPouring) return;

    sound.playUndo();
    const lastSnapshot = moveHistory[moveHistory.length - 1];
    setTubes(lastSnapshot.tubes.map((t) => [...t]));
    setMoves(lastSnapshot.moves);
    setMoveHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedTubeIndex(null);
    setHint(null);
  }, [moveHistory, pourState.isPouring]);

  // RESTART Action
  const handleConfirmRestart = useCallback(() => {
    sound.playButton();
    if (gameMode === 'custom' && activeCustomPuzzle) {
      setTubes(activeCustomPuzzle.tubes.map((t) => [...t]));
    } else {
      setTubes(levelData.tubes.map((t) => [...t]));
    }
    setMoves(0);
    setElapsedTimeSeconds(0);
    setLevelSolveTime(0);
    setMoveHistory([]);
    setSelectedTubeIndex(null);
    setHint(null);
    setIsRestartConfirmOpen(false);
  }, [levelData, gameMode, activeCustomPuzzle]);

  // HINT Action
  const handleHint = useCallback(() => {
    if (pourState.isPouring) return;

    const smartHint = getSmartHint(tubes, levelData.tubeCapacity);
    if (smartHint) {
      sound.playHint();
      setHint(smartHint);
      setSelectedTubeIndex(smartHint.fromIndex);
      Storage.recordHintUsed();
      setPlayerStats(Storage.getStats());
    } else {
      sound.playInvalid();
    }
  }, [pourState.isPouring, tubes, levelData.tubeCapacity]);

  // Apply highlight from Help modal
  const handleApplyMoveHighlight = useCallback((from: number, to: number) => {
    setSelectedTubeIndex(from);
    setHint({
      fromIndex: from,
      toIndex: to,
      color: tubes[from][tubes[from].length - 1],
      count: 1,
      message: `Selected Tube ${from + 1}. Tap Tube ${to + 1} to pour!`,
    });
  }, [tubes]);

  // Reset all game data
  const handleResetAllProgress = useCallback(() => {
    Storage.resetAllProgress();
    setLevelProgress({});
    setPlayerStats(Storage.getStats());
    setDailyProgress({});
    setElapsedTimeSeconds(0);
    setLevelSolveTime(0);
    loadLevel(1, 'classic');
  }, [loadLevel]);

  // Dynamically split tubes into clean tablet rows (Landscape prioritized)
  const tubeRows = useMemo(() => {
    const total = tubes.length;
    if (total <= 6) {
      // 1 row if 6 or fewer
      return [tubes.map((_, idx) => idx)];
    }
    // 2 balanced rows for tablet
    const half = Math.ceil(total / 2);
    const row1: number[] = [];
    const row2: number[] = [];
    for (let i = 0; i < total; i++) {
      if (i < half) row1.push(i);
      else row2.push(i);
    }
    return [row1, row2];
  }, [tubes]);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-950 via-[#0B132B] to-slate-950 font-['Plus_Jakarta_Sans'] select-none">
      {/* SVG Patterns for Colorblind Mode */}
      <SvgPatterns />

      {/* Subtle Radial Ambient Lighting behind puzzle arena */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header (Reference Screen Layout) */}
      <GameHeader
        levelNumber={levelData.levelId}
        difficulty={levelData.difficulty}
        moves={moves}
        bestMoves={currentRecord?.bestMoves || 0}
        parMoves={levelData.parMoves}
        currentTimeSeconds={elapsedTimeSeconds}
        bestTimeSeconds={currentBestTime}
        selectedTubeIndex={selectedTubeIndex}
        mode={gameMode}
        solvedCount={solvedCount}
        totalColors={levelData.colours.length}
        totalTubes={tubes.length}
        currentStreak={playerStats.currentStreak}
        isDailyCompletedToday={Boolean(dailyProgress[todayDateStr]?.completed)}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenDaily={() => setIsDailyOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Hint Alert Banner */}
      {hint && (
        <div className="absolute top-16 inset-x-0 z-25 flex justify-center px-4 pointer-events-none animate-fade-in">
          <div className="bg-amber-950/90 border border-amber-400/60 text-amber-200 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-950/40 flex items-center gap-2">
            <span>💡</span>
            <span>{hint.message}</span>
          </div>
        </div>
      )}

      {/* 2. Main Puzzle Area (Tubes Grid) */}
      <main
        id="puzzle-board"
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-2 sm:py-6 flex flex-col justify-center items-center z-10 overflow-y-auto"
      >
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 w-full">
          {tubeRows.map((rowIndices, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8"
            >
              {rowIndices.map((tubeIndex) => (
                <TubeView
                  key={`tube-${tubeIndex}`}
                  index={tubeIndex}
                  tube={tubes[tubeIndex]}
                  capacity={levelData.tubeCapacity}
                  isSelected={selectedTubeIndex === tubeIndex}
                  isInvalid={invalidTubeIndex === tubeIndex}
                  isHintSource={hint?.fromIndex === tubeIndex}
                  isHintTarget={hint?.toIndex === tubeIndex}
                  isPouringSource={pourState.isPouring && pourState.fromIndex === tubeIndex}
                  isPouringTarget={pourState.isPouring && pourState.toIndex === tubeIndex}
                  pourDirection={pourState.pourDirection}
                  colorBlindMode={settings.colorBlindMode}
                  highContrast={settings.highContrast}
                  onSelect={handleTubeSelect}
                  reducedMotion={settings.reducedMotion}
                />
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* 3. Bottom Control Bar (Reference Screen Layout) */}
      <BottomToolbar
        onRestart={() => setIsRestartConfirmOpen(true)}
        onHint={handleHint}
        onShowMoves={() => setIsHelpMovesOpen(true)}
        onUndo={handleUndo}
        canUndo={moveHistory.length > 0 && !pourState.isPouring}
        undoCount={moveHistory.length}
        isHintActive={hint !== null}
        isHelpActive={isHelpMovesOpen}
      />

      {/* --- MODALS & DIALOGS --- */}

      {/* Level Complete Modal */}
      <LevelCompleteModal
        isOpen={isLevelCompleteOpen}
        levelNumber={levelData.levelId}
        moves={moves}
        parMoves={levelData.parMoves}
        stars={
          moves <= levelData.parMoves
            ? 3
            : moves <= Math.ceil(levelData.parMoves * 1.35)
            ? 2
            : 1
        }
        bestMoves={currentRecord?.bestMoves || moves}
        timeSeconds={levelSolveTime || elapsedTimeSeconds}
        bestTimeSeconds={currentBestTime}
        isDaily={gameMode === 'daily'}
        isCustom={gameMode === 'custom'}
        onOpenPuzzleCreator={() => {
          setIsLevelCompleteOpen(false);
          setIsPuzzleCreatorOpen(true);
        }}
        onNextLevel={() => {
          setIsLevelCompleteOpen(false);
          const nextLvl = currentLevelId + 1;
          loadLevel(nextLvl <= ALL_100_LEVELS.length ? nextLvl : 1, 'classic');
        }}
        onReplay={() => {
          setIsLevelCompleteOpen(false);
          if (gameMode === 'custom' && activeCustomPuzzle) {
            loadCustomPuzzle(activeCustomPuzzle);
          } else {
            loadLevel(currentLevelId, gameMode);
          }
        }}
        onLevelSelect={() => {
          setIsLevelCompleteOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      {/* Level Select Modal (100 Levels) */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        currentLevel={currentLevelId}
        progress={levelProgress}
        onSelectLevel={(lvl) => {
          setIsLevelSelectOpen(false);
          loadLevel(lvl, 'classic');
        }}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* Daily Challenge Modal */}
      <DailyPuzzleModal
        isOpen={isDailyOpen}
        dateStr={todayDateStr}
        record={dailyProgress[todayDateStr]}
        currentStreak={playerStats.currentStreak}
        maxStreak={playerStats.maxStreak}
        onPlayDaily={() => {
          setIsDailyOpen(false);
          loadLevel(9999, 'daily');
        }}
        onClose={() => setIsDailyOpen(false)}
      />

      {/* Statistics Modal */}
      <StatisticsModal
        isOpen={isStatsOpen}
        stats={playerStats}
        currentLevel={currentLevelId}
        totalLevels={ALL_100_LEVELS.length}
        onClose={() => setIsStatsOpen(false)}
      />

      {/* Settings & Accessibility Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        customPuzzlesCount={Storage.getCustomPuzzles().length}
        onOpenPuzzleCreator={() => {
          setIsSettingsOpen(false);
          setIsPuzzleCreatorOpen(true);
        }}
        onUpdateSettings={setSettings}
        onResetProgress={handleResetAllProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Custom Puzzle Creator Modal */}
      <PuzzleCreatorModal
        isOpen={isPuzzleCreatorOpen}
        colorBlindMode={settings.colorBlindMode}
        onPlayCustomPuzzle={loadCustomPuzzle}
        onClose={() => setIsPuzzleCreatorOpen(false)}
      />

      {/* How to Play Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Restart Confirmation Modal */}
      <RestartConfirmModal
        isOpen={isRestartConfirmOpen}
        onConfirm={handleConfirmRestart}
        onCancel={() => setIsRestartConfirmOpen(false)}
      />

      {/* Possible Moves & Solution Modal */}
      <HelpMovesModal
        isOpen={isHelpMovesOpen}
        tubes={tubes}
        capacity={levelData.tubeCapacity}
        onApplyMoveHighlight={handleApplyMoveHighlight}
        onClose={() => setIsHelpMovesOpen(false)}
      />
    </div>
  );
}
