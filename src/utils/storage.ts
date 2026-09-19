import { CustomPuzzle, DailyRecord, GameSettings, LevelRecord, PlayerStats } from '../types';

const STORAGE_KEYS = {
  CURRENT_LEVEL: 'colour_puzzle_current_level',
  LEVEL_PROGRESS: 'colour_puzzle_level_progress',
  DAILY_PROGRESS: 'colour_puzzle_daily_progress',
  PLAYER_STATS: 'colour_puzzle_player_stats',
  SETTINGS: 'colour_puzzle_settings',
  FIRST_RUN_TUTORIAL: 'colour_puzzle_tutorial_seen',
  CUSTOM_PUZZLES: 'colour_puzzle_custom_puzzles',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  animationSpeed: 'normal',
  reducedMotion: false,
  colorBlindMode: 'none',
  highContrast: false,
  largeInterface: false,
};

const DEFAULT_STATS: PlayerStats = {
  levelsCompleted: 0,
  totalMoves: 0,
  bestMoves: 0,
  threeStarLevels: 0,
  hintsUsed: 0,
  dailyPuzzlesSolved: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastDailyDate: '',
};

export const Storage = {
  getCurrentLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
      const parsed = val ? parseInt(val, 10) : 1;
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    } catch {
      return 1;
    }
  },

  setCurrentLevel(lvl: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, lvl.toString());
    } catch {
      // Ignore
    }
  },

  getLevelProgress(): Record<number, LevelRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveLevelProgress(levelId: number, moves: number, stars: number, timeSeconds?: number) {
    try {
      const current = this.getLevelProgress();
      const existing = current[levelId];
      const isNewCompletion = !existing?.completed;

      let bestTimeSeconds = existing?.bestTimeSeconds;
      if (timeSeconds !== undefined && timeSeconds > 0) {
        bestTimeSeconds = existing?.bestTimeSeconds !== undefined
          ? Math.min(existing.bestTimeSeconds, timeSeconds)
          : timeSeconds;
      }

      const updatedRecord: LevelRecord = {
        completed: true,
        stars: existing ? Math.max(existing.stars, stars) : stars,
        bestMoves: existing ? Math.min(existing.bestMoves, moves) : moves,
        bestTimeSeconds,
        completedAt: new Date().toISOString(),
      };

      current[levelId] = updatedRecord;
      localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(current));

      // Also update player stats
      const stats = this.getStats();
      stats.totalMoves += moves;
      if (isNewCompletion) {
        stats.levelsCompleted += 1;
      }
      if (updatedRecord.stars === 3 && (!existing || existing.stars < 3)) {
        stats.threeStarLevels += 1;
      }
      if (stats.bestMoves === 0 || moves < stats.bestMoves) {
        stats.bestMoves = moves;
      }
      this.saveStats(stats);
    } catch {
      // Ignore
    }
  },

  getDailyProgress(): Record<string, DailyRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDailyCompletion(dateStr: string, moves: number, par: number, timeSeconds?: number) {
    try {
      const progress = this.getDailyProgress();
      const existingDaily = progress[dateStr];
      const alreadyCompleted = existingDaily?.completed;

      let bestTimeSeconds = existingDaily?.bestTimeSeconds;
      if (timeSeconds !== undefined && timeSeconds > 0) {
        bestTimeSeconds = existingDaily?.bestTimeSeconds !== undefined
          ? Math.min(existingDaily.bestTimeSeconds, timeSeconds)
          : timeSeconds;
      }

      progress[dateStr] = {
        completed: true,
        moves: alreadyCompleted ? Math.min(existingDaily.moves, moves) : moves,
        par,
        bestTimeSeconds,
        date: dateStr,
      };
      localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progress));

      const stats = this.getStats();
      if (!alreadyCompleted) {
        stats.dailyPuzzlesSolved += 1;
      }
      stats.totalMoves += moves;

      // Update streak only on first completion of that date
      const today = dateStr;
      if (!alreadyCompleted) {
        if (stats.lastDailyDate) {
          const lastDate = new Date(stats.lastDailyDate + 'T12:00:00');
          const currentDate = new Date(today + 'T12:00:00');
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            stats.currentStreak += 1;
          } else if (diffDays > 1) {
            stats.currentStreak = 1;
          }
        } else {
          stats.currentStreak = 1;
        }

        if (stats.currentStreak > stats.maxStreak) {
          stats.maxStreak = stats.currentStreak;
        }
        stats.lastDailyDate = today;
      }

      this.saveStats(stats);
    } catch {
      // Ignore
    }
  },

  getStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      const stats: PlayerStats = data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : { ...DEFAULT_STATS };

      // Validate streak freshness: if last completed daily was before yesterday, the active streak has lapsed
      if (stats.currentStreak > 0 && stats.lastDailyDate) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const last = new Date(stats.lastDailyDate + 'T12:00:00');
        const curr = new Date(todayStr + 'T12:00:00');
        const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
        
        // If more than 1 day has passed without completing today's puzzle (e.g. diffDays >= 2), streak resets to 0
        if (diffDays > 1) {
          stats.currentStreak = 0;
          this.saveStats(stats);
        }
      }

      return stats;
    } catch {
      return { ...DEFAULT_STATS };
    }
  },

  saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  },

  recordHintUsed() {
    const stats = this.getStats();
    stats.hintsUsed += 1;
    this.saveStats(stats);
  },

  getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  },

  hasSeenTutorial(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.FIRST_RUN_TUTORIAL) === 'true';
    } catch {
      return false;
    }
  },

  setSeenTutorial(seen: boolean = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.FIRST_RUN_TUTORIAL, seen ? 'true' : 'false');
    } catch {
      // Ignore
    }
  },

  getCustomPuzzles(): CustomPuzzle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PUZZLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPuzzle(puzzle: CustomPuzzle): void {
    try {
      const current = this.getCustomPuzzles();
      const existingIdx = current.findIndex((p) => p.id === puzzle.id);
      if (existingIdx >= 0) {
        current[existingIdx] = puzzle;
      } else {
        current.unshift(puzzle);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PUZZLES, JSON.stringify(current));
    } catch {
      // Ignore
    }
  },

  deleteCustomPuzzle(id: string): void {
    try {
      const current = this.getCustomPuzzles();
      const updated = current.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PUZZLES, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  saveCustomPuzzleCompletion(id: string, moves: number, timeSeconds?: number): void {
    try {
      const current = this.getCustomPuzzles();
      const p = current.find((item) => item.id === id);
      if (p) {
        p.completed = true;
        p.bestMoves = p.bestMoves !== undefined ? Math.min(p.bestMoves, moves) : moves;
        if (timeSeconds !== undefined && timeSeconds > 0) {
          p.bestTimeSeconds = p.bestTimeSeconds !== undefined
            ? Math.min(p.bestTimeSeconds, timeSeconds)
            : timeSeconds;
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PUZZLES, JSON.stringify(current));
      }
    } catch {
      // Ignore
    }
  },

  resetAllProgress() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LEVEL);
      localStorage.removeItem(STORAGE_KEYS.LEVEL_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
      localStorage.removeItem(STORAGE_KEYS.FIRST_RUN_TUTORIAL);
    } catch {
      // Ignore
    }
  },
};

/**
 * Format total seconds into a clean mm:ss string (e.g. 0:45, 1:23)
 */
export function formatTime(totalSeconds?: number): string {
  if (totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

