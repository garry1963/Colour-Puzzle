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
];

// Cache generated levels 1-100 so performance is instant
const PRECOMPUTED_LEVELS: LevelData[] = [];

function build100Levels(): LevelData[] {
  if (PRECOMPUTED_LEVELS.length === 100) return PRECOMPUTED_LEVELS;

  // Add handcrafted introductory levels first
  HANDCRAFTED_LEVELS.forEach((lvl) => PRECOMPUTED_LEVELS.push(lvl));

  // Generate levels 6 to 100 with progressive difficulty curve
  for (let id = 6; id <= 100; id++) {
    let colorCount: number;
    let emptyTubes = 2;

    if (id <= 10) {
      colorCount = id <= 8 ? 3 : 4;
    } else if (id <= 25) {
      colorCount = 4 + (id % 2); // 4 to 5 colors
    } else if (id <= 50) {
      colorCount = 5 + (id % 3); // 5 to 7 colors
    } else if (id <= 75) {
      colorCount = 7 + (id % 3); // 7 to 9 colors
    } else {
      colorCount = 8 + (id % 3); // 8 to 10 colors
    }

    const level = generateSolvableLevel({
      levelId: id,
      colorCount,
      emptyTubes,
      capacity: 4,
      seed: id * 9973 + 54321,
    });

    PRECOMPUTED_LEVELS.push(level);
  }

  return PRECOMPUTED_LEVELS;
}

export const ALL_100_LEVELS: LevelData[] = build100Levels();

export function getLevelData(levelId: number): LevelData {
  if (levelId >= 1 && levelId <= ALL_100_LEVELS.length) {
    return ALL_100_LEVELS[levelId - 1];
  }
  // If beyond 100, procedurally generate on-demand
  return generateSolvableLevel({
    levelId,
    colorCount: Math.min(10, 5 + Math.floor(levelId / 20)),
    emptyTubes: 2,
    capacity: 4,
    seed: levelId * 8831,
  });
}
