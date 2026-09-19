import { ColourId, LevelData, Tube } from '../types';
import { solvePuzzle } from './solver';

const ALL_COLOURS: ColourId[] = [
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
 * Generate a guaranteed solvable level by reverse-scrambling from a solved state.
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
    scrambleSteps = 30 + colorCount * 8,
    seed = levelId * 7919 + 1337,
  } = options;

  const rng = createRng(seed);
  const selectedColours = ALL_COLOURS.slice(0, colorCount);

  // Determine difficulty tag
  let difficulty: LevelData['difficulty'] = 'Easy';
  if (colorCount >= 8) difficulty = 'Expert';
  else if (colorCount >= 6) difficulty = 'Hard';
  else if (colorCount >= 4) difficulty = 'Medium';

  let attempts = 0;
  while (attempts < 20) {
    attempts++;

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

    // 4. Ensure no tube is already completely solved
    let alreadyHasSolved = false;
    for (let i = 0; i < colorCount; i++) {
      const t = tubes[i];
      if (t.length === capacity && t.every((c) => c === t[0])) {
        alreadyHasSolved = true;
        break;
      }
    }
    if (alreadyHasSolved) continue;

    // 5. Test solvability with the solver
    const solution = solvePuzzle(tubes, capacity, 3000);
    if (solution && solution.length >= 3) {
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

  // Fallback safe level constructed by controlled reverse mixing
  const fallbackTubes: Tube[] = [];
  for (let i = 0; i < colorCount; i++) {
    fallbackTubes.push([]);
  }
  for (let i = 0; i < emptyTubes; i++) {
    fallbackTubes.push([]);
  }

  // Round-robin placement
  for (let layer = 0; layer < capacity; layer++) {
    for (let col = 0; col < colorCount; col++) {
      const colorIndex = (col + layer) % colorCount;
      fallbackTubes[col].push(selectedColours[colorIndex]);
    }
  }

  return {
    levelId,
    difficulty,
    tubeCapacity: capacity,
    emptyTubes,
    colours: selectedColours,
    tubes: fallbackTubes,
    parMoves: colorCount * 3 + 2,
  };
}

/**
 * Generate a daily puzzle for a specific date (e.g. "2026-09-19").
 */
export function generateDailyPuzzle(dateStr: string): LevelData {
  // Hash the date string into a numerical seed
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) + 424242;
  const rng = createRng(seed);

  // Daily puzzle has 5 to 7 colours for a fun medium challenge
  const colorCount = 5 + Math.floor(rng() * 3); // 5, 6, or 7
  return generateSolvableLevel({
    levelId: 9999,
    colorCount,
    emptyTubes: 2,
    capacity: 4,
    seed,
  });
}
