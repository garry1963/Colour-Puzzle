import { ColourId, LevelData, Tube } from '../types';
import { generateSolvableLevel } from '../utils/levelGenerator';

/**
 * Handcrafted initial introductory levels for immediate, flawless onboarding
 */
const HANDCRAFTED_LEVELS: LevelData[] = [
  {
    levelId: 1,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['red', 'blue', 'green'],
    tubes: [
      ['red', 'blue', 'green', 'red'],
      ['green', 'red', 'blue', 'green'],
      ['blue', 'green', 'red', 'blue'],
      [],
      [],
    ],
    parMoves: 8,
  },
  {
    levelId: 2,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['red', 'blue', 'yellow'],
    tubes: [
      ['yellow', 'red', 'yellow', 'blue'],
      ['blue', 'blue', 'red', 'red'],
      ['red', 'yellow', 'blue', 'yellow'],
      [],
      [],
    ],
    parMoves: 7,
  },
  {
    levelId: 3,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['cyan', 'orange', 'purple'],
    tubes: [
      ['cyan', 'orange', 'purple', 'cyan'],
      ['orange', 'purple', 'cyan', 'orange'],
      ['purple', 'cyan', 'orange', 'purple'],
      [],
      [],
    ],
    parMoves: 8,
  },
  {
    levelId: 4,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['green', 'yellow', 'pink'],
    tubes: [
      ['pink', 'green', 'yellow', 'pink'],
      ['yellow', 'pink', 'green', 'yellow'],
      ['green', 'yellow', 'pink', 'green'],
      [],
      [],
    ],
    parMoves: 9,
  },
  {
    levelId: 5,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['red', 'blue', 'green', 'yellow'],
    tubes: [
      ['red', 'blue', 'red', 'yellow'],
      ['green', 'yellow', 'blue', 'green'],
      ['yellow', 'green', 'blue', 'red'],
      ['blue', 'red', 'yellow', 'green'],
      [],
      [],
    ],
    parMoves: 10,
  },
  {
    levelId: 6,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['cyan', 'orange', 'pink', 'yellow'],
    tubes: [
      ['cyan', 'orange', 'pink', 'yellow'],
      ['pink', 'yellow', 'cyan', 'orange'],
      ['yellow', 'cyan', 'orange', 'pink'],
      ['orange', 'pink', 'yellow', 'cyan'],
      [],
      [],
    ],
    parMoves: 13,
  },
  {
    levelId: 7,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['red', 'green', 'blue', 'purple'],
    tubes: [
      ['red', 'green', 'blue', 'purple'],
      ['blue', 'red', 'purple', 'green'],
      ['green', 'purple', 'red', 'blue'],
      ['purple', 'blue', 'green', 'red'],
      [],
      [],
    ],
    parMoves: 13,
  },
  {
    levelId: 8,
    difficulty: 'Easy',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['teal', 'coral', 'amber'],
    tubes: [
      ['teal', 'coral', 'amber', 'teal'],
      ['coral', 'amber', 'teal', 'coral'],
      ['amber', 'teal', 'coral', 'amber'],
      [],
      [],
    ],
    parMoves: 10,
  },
  {
    levelId: 9,
    difficulty: 'Medium',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['red', 'yellow', 'green', 'cyan'],
    tubes: [
      ['red', 'yellow', 'red', 'green'],
      ['cyan', 'green', 'yellow', 'cyan'],
      ['green', 'red', 'cyan', 'yellow'],
      ['yellow', 'cyan', 'green', 'red'],
      [],
      [],
    ],
    parMoves: 13,
  },
  {
    levelId: 10,
    difficulty: 'Medium',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['green', 'orange', 'blue', 'red', 'yellow'],
    tubes: [
      ['green', 'orange', 'green', 'orange'],
      ['blue', 'red', 'yellow', 'green'],
      ['yellow', 'green', 'blue', 'blue'],
      ['red', 'red', 'yellow', 'yellow'],
      ['blue', 'orange', 'orange', 'red'],
      [],
      [],
    ],
    parMoves: 14,
  },
  {
    levelId: 11,
    difficulty: 'Medium',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['cyan', 'purple', 'pink', 'teal', 'amber'],
    tubes: [
      ['cyan', 'purple', 'amber', 'amber'],
      ['teal', 'purple', 'teal', 'amber'],
      ['pink', 'pink', 'purple', 'purple'],
      ['teal', 'pink', 'cyan', 'teal'],
      ['pink', 'amber', 'cyan', 'cyan'],
      [],
      [],
    ],
    parMoves: 14,
  },
  {
    levelId: 12,
    difficulty: 'Medium',
    tubeCapacity: 4,
    emptyTubes: 2,
    colours: ['amber', 'purple', 'pink', 'teal', 'cyan'],
    tubes: [
      ['amber', 'purple', 'pink', 'purple'],
      ['pink', 'amber', 'amber', 'amber'],
      ['purple', 'pink', 'pink', 'teal'],
      ['teal', 'teal', 'cyan', 'teal'],
      ['cyan', 'cyan', 'purple', 'cyan'],
      [],
      [],
    ],
    parMoves: 13,
  },
];

export const TOTAL_LEVELS_COUNT = 100;

// Lazy cache: levels are only generated on demand when requested
const LEVEL_CACHE = new Map<number, LevelData>();

// Initialize with handcrafted introductory levels (instant 0ms)
HANDCRAFTED_LEVELS.forEach((lvl) => {
  LEVEL_CACHE.set(lvl.levelId, lvl);
});

export function getLevelData(levelId: number): LevelData {
  if (LEVEL_CACHE.has(levelId)) {
    return LEVEL_CACHE.get(levelId)!;
  }

  let colorCount: number;
  const emptyTubes = 2;

  if (levelId <= 10) {
    colorCount = levelId <= 8 ? 3 : 4;
  } else if (levelId <= 25) {
    colorCount = 4 + (levelId % 2); // 4 to 5 colors
  } else if (levelId <= 50) {
    colorCount = 5 + (levelId % 3); // 5 to 7 colors
  } else if (levelId <= 75) {
    colorCount = 6 + (levelId % 3); // 6 to 8 colors
  } else {
    colorCount = 7 + (levelId % 3); // 7 to 9 colors
  }

  const level = generateSolvableLevel({
    levelId,
    colorCount,
    emptyTubes,
    capacity: 4,
    seed: levelId * 9973 + 54321,
  });

  LEVEL_CACHE.set(levelId, level);
  return level;
}

/**
 * Lazy array proxy:
 * - Accessing .length returns 100 in 0ms with zero computation on startup.
 * - Accessing [index] retrieves that level on demand.
 */
export const ALL_100_LEVELS: LevelData[] = new Proxy([] as LevelData[], {
  get(target, prop, receiver) {
    if (prop === 'length') {
      return TOTAL_LEVELS_COUNT;
    }
    if (typeof prop === 'string') {
      const index = Number(prop);
      if (!isNaN(index) && index >= 0 && index < TOTAL_LEVELS_COUNT) {
        return getLevelData(index + 1);
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});
