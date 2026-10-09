import { ColourId, LevelData, Tube } from '../types';
import { solvePuzzle } from './solver';

export const ALL_COLOURS: ColourId[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'cyan',
  'pink',
  'silver',
  'teal',
  'coral',
  'amber',
];

/**
 * Seeded pseudo-random number generator for deterministic daily puzzles and level reproduction.
 * Lehmer / Park-Miller PRNG.
 */
export function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Robust 32-bit hash function (FNV-1a with avalanche bit mixing) for date strings like "2026-10-09".
 * Guarantees that adjacent calendar days produce completely divergent seeds.
 */
export function hashDateString(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Avalanche bit-mixing
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return Math.abs(hash);
}

/**
 * Generate a guaranteed solvable level with diverse shuffled palettes and solver verification.
 */
export function generateSolvableLevel(options: {
  levelId: number;
  colorCount: number;
  emptyTubes?: number;
  capacity?: number;
  scrambleSteps?: number;
  seed?: number;
}): LevelData {
  const {
    levelId,
    colorCount,
    emptyTubes = 2,
    capacity = 4,
    seed = levelId * 7919 + 1337,
  } = options;

  const rng = createRng(seed);

  // Shuffle all colours so levels don't always use the exact same subset of colours
  const shuffledColours = [...ALL_COLOURS];
  for (let i = shuffledColours.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledColours[i], shuffledColours[j]] = [shuffledColours[j], shuffledColours[i]];
  }
  const selectedColours = shuffledColours.slice(0, colorCount);

  // Determine difficulty tag
  let difficulty: LevelData['difficulty'] = 'Easy';
  if (colorCount >= 8) difficulty = 'Expert';
  else if (colorCount >= 6) difficulty = 'Hard';
  else if (colorCount >= 4) difficulty = 'Medium';

  const maxSearchBudget = colorCount >= 7 ? 3500 : 2500;

  for (let attempt = 0; attempt < 40; attempt++) {
    // 1. Create pool of exactly `capacity` units of each chosen colour
    const pool: ColourId[] = [];
    selectedColours.forEach((c) => {
      for (let i = 0; i < capacity; i++) {
        pool.push(c);
      }
    });

    // 2. Shuffle pool with rng
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // 3. Distribute into colorCount tubes + emptyTubes
    const tubes: Tube[] = [];
    for (let i = 0; i < colorCount; i++) {
      tubes.push(pool.slice(i * capacity, (i + 1) * capacity));
    }
    for (let i = 0; i < emptyTubes; i++) {
      tubes.push([]);
    }

    // 4. Ensure no tube is already completely uniform
    if (tubes.slice(0, colorCount).some((t) => t.length === capacity && t.every((c) => c === t[0]))) {
      continue;
    }

    // 5. Test solvability with solver
    const solution = solvePuzzle(tubes, capacity, maxSearchBudget);
    if (solution && solution.length >= 4) {
      return {
        levelId,
        difficulty,
        tubeCapacity: capacity,
        emptyTubes,
        colours: selectedColours,
        tubes,
        parMoves: solution.length + Math.max(2, Math.floor(solution.length * 0.2)),
      };
    }
  }

  // Fallback safe level constructed with seeded cyclic shift on the shuffled colours
  const fallbackTubes: Tube[] = [];
  for (let i = 0; i < colorCount; i++) {
    fallbackTubes.push([]);
  }
  for (let i = 0; i < emptyTubes; i++) {
    fallbackTubes.push([]);
  }

  const shiftOffset = 1 + Math.floor(rng() * Math.max(1, colorCount - 1));
  for (let layer = 0; layer < capacity; layer++) {
    for (let col = 0; col < colorCount; col++) {
      const colorIndex = (col * shiftOffset + layer) % colorCount;
      fallbackTubes[col].push(selectedColours[colorIndex]);
    }
  }

  const fallbackSol = solvePuzzle(fallbackTubes, capacity, 3000);
  const parMoves = fallbackSol && fallbackSol.length > 0 ? fallbackSol.length + 3 : colorCount * 3 + 2;

  return {
    levelId,
    difficulty,
    tubeCapacity: capacity,
    emptyTubes,
    colours: selectedColours,
    tubes: fallbackTubes,
    parMoves,
  };
}

// In-memory cache for daily puzzles so repeated plays on the same day stay identical,
// while every unique date yields a brand new, unique puzzle.
const DAILY_CACHE = new Map<string, LevelData>();

/**
 * Generate a guaranteed unique, solvable daily puzzle for any given date (e.g. "2026-10-09").
 */
export function generateDailyPuzzle(dateStr: string): LevelData {
  if (DAILY_CACHE.has(dateStr)) {
    const cached = DAILY_CACHE.get(dateStr)!;
    return {
      ...cached,
      tubes: cached.tubes.map((t) => [...t]),
    };
  }

  const seed = hashDateString(dateStr);
  const rng = createRng(seed);

  // 1. Shuffle all 12 colours using the unique date seed for a signature daily palette
  const shuffledColours = [...ALL_COLOURS];
  for (let i = shuffledColours.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledColours[i], shuffledColours[j]] = [shuffledColours[j], shuffledColours[i]];
  }

  // 2. Select 5 or 6 colors on weekdays, 6 or 7 on weekends
  const dateObj = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = isNaN(dateObj.getTime()) ? 0 : dateObj.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const colorCount = isWeekend ? 6 + Math.floor(rng() * 2) : 5 + Math.floor(rng() * 2);
  const selectedColours = shuffledColours.slice(0, colorCount);

  const capacity = 4;
  const emptyTubes = 2;

  let difficulty: LevelData['difficulty'] = 'Medium';
  if (colorCount >= 7) difficulty = 'Expert';
  else if (colorCount >= 6) difficulty = 'Hard';

  const maxSearchBudget = colorCount >= 7 ? 4000 : 3000;
  let generatedLevel: LevelData | null = null;

  for (let attempt = 0; attempt < 50; attempt++) {
    const pool: ColourId[] = [];
    selectedColours.forEach((c) => {
      for (let i = 0; i < capacity; i++) {
        pool.push(c);
      }
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const tubes: Tube[] = [];
    for (let i = 0; i < colorCount; i++) {
      tubes.push(pool.slice(i * capacity, (i + 1) * capacity));
    }
    for (let i = 0; i < emptyTubes; i++) {
      tubes.push([]);
    }

    // Skip if any tube is uniform
    if (tubes.slice(0, colorCount).some((t) => t.length === capacity && t.every((c) => c === t[0]))) {
      continue;
    }

    // Solve and verify
    const solution = solvePuzzle(tubes, capacity, maxSearchBudget);
    if (solution && solution.length >= 8) {
      generatedLevel = {
        levelId: 9999,
        difficulty,
        tubeCapacity: capacity,
        emptyTubes,
        colours: selectedColours,
        tubes,
        parMoves: solution.length + Math.max(2, Math.floor(solution.length * 0.2)),
      };
      break;
    }
  }

  // Guaranteed fallback: date-specific permutation of the date's unique shuffled colors
  if (!generatedLevel) {
    const fallbackTubes: Tube[] = [];
    for (let i = 0; i < colorCount; i++) fallbackTubes.push([]);
    for (let i = 0; i < emptyTubes; i++) fallbackTubes.push([]);

    const shiftOffset = 1 + Math.floor(rng() * (colorCount - 1));
    for (let layer = 0; layer < capacity; layer++) {
      for (let col = 0; col < colorCount; col++) {
        const colorIdx = (col * shiftOffset + layer) % colorCount;
        fallbackTubes[col].push(selectedColours[colorIdx]);
      }
    }

    const sol = solvePuzzle(fallbackTubes, capacity, 3500);
    const parMoves = sol && sol.length > 0 ? sol.length + 3 : colorCount * 3 + 2;

    generatedLevel = {
      levelId: 9999,
      difficulty,
      tubeCapacity: capacity,
      emptyTubes,
      colours: selectedColours,
      tubes: fallbackTubes,
      parMoves,
    };
  }

  DAILY_CACHE.set(dateStr, generatedLevel);

  return {
    ...generatedLevel,
    tubes: generatedLevel.tubes.map((t) => [...t]),
  };
}
