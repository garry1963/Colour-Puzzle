export type ColourId =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'silver'
  | 'teal'
  | 'coral'
  | 'amber';

export interface ColourInfo {
  id: ColourId;
  name: string;
  hex: string;
  gradient: string;
  lightHex: string;
  glowHex: string;
  textColor: string;
  symbol: string;
  patternType: 'dots' | 'stripes' | 'grid' | 'waves' | 'cross' | 'diagonal' | 'chevrons' | 'diamonds' | 'stars' | 'rings' | 'zigzag' | 'honeycomb';
}

export type Tube = ColourId[];

export interface LevelData {
  levelId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  tubeCapacity: number;
  emptyTubes: number;
  colours: ColourId[];
  tubes: ColourId[][];
  parMoves: number;
}

export interface CustomPuzzle {
  id: string;
  name: string;
  createdAt: string;
  tubes: Tube[];
  colours: ColourId[];
  capacity: number;
  emptyTubes: number;
  parMoves: number;
  isSolvable: boolean;
  minMoves?: number;
  bestMoves?: number;
  bestTimeSeconds?: number;
  completed?: boolean;
}

export interface MoveSnapshot {
  tubes: ColourId[][];
  moves: number;
  fromIndex: number;
  toIndex: number;
  color: ColourId;
  count: number;
}

export type GameMode = 'classic' | 'daily' | 'challenge' | 'relaxed' | 'custom';

export type ColorBlindMode = 'none' | 'patterns' | 'symbols' | 'names';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean;
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  largeInterface: boolean;
}

export interface PlayerStats {
  levelsCompleted: number;
  totalMoves: number;
  bestMoves: number;
  threeStarLevels: number;
  hintsUsed: number;
  dailyPuzzlesSolved: number;
  currentStreak: number;
  maxStreak: number;
  lastDailyDate: string;
}

export interface LevelRecord {
  completed: boolean;
  stars: number;
  bestMoves: number;
  bestTimeSeconds?: number;
  completedAt?: string;
}

export interface DailyRecord {
  completed: boolean;
  moves: number;
  par: number;
  bestTimeSeconds?: number;
  date: string;
}

export interface HintResult {
  fromIndex: number;
  toIndex: number;
  color: ColourId;
  count: number;
  message: string;
}

export interface PourAnimationState {
  isPouring: boolean;
  fromIndex: number | null;
  toIndex: number | null;
  color: ColourId | null;
  count: number;
  pourDirection?: 'left' | 'right';
  streamCoords?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}
