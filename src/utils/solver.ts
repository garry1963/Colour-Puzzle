import { ColourId, HintResult, Tube } from '../types';
import { getColour } from './colors';

/**
 * Check if the current state of tubes is completely solved.
 */
export function isSolved(tubes: Tube[], capacity: number): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== capacity) return false;
    const firstColor = tube[0];
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== firstColor) return false;
    }
  }
  return true;
}

/**
 * Helper to count consecutive matching colors at the top of a tube.
 */
export function getTopColorInfo(tube: Tube): { color: ColourId | null; count: number } {
  if (tube.length === 0) return { color: null, count: 0 };
  const topColor = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) {
      count++;
    } else {
      break;
    }
  }
  return { color: topColor, count };
}

/**
 * Check if all elements in a tube are of the same color.
 */
export function isTubeUniform(tube: Tube): boolean {
  if (tube.length === 0) return true;
  const first = tube[0];
  return tube.every((c) => c === first);
}

/**
 * Determine if a move from tube[fromIdx] to tube[toIdx] is legal.
 */
export function canPour(
  tubes: Tube[],
  fromIdx: number,
  toIdx: number,
  capacity: number = 4
): { valid: boolean; count: number; color: ColourId | null; reason?: string } {
  if (fromIdx === toIdx) {
    return { valid: false, count: 0, color: null, reason: 'Same tube' };
  }

  const source = tubes[fromIdx];
  const dest = tubes[toIdx];

  if (!source || !dest) {
    return { valid: false, count: 0, color: null, reason: 'Tube not found' };
  }

  if (source.length === 0) {
    return { valid: false, count: 0, color: null, reason: 'Source tube is empty' };
  }

  if (dest.length >= capacity) {
    return { valid: false, count: 0, color: null, reason: 'Destination tube is full' };
  }

  // If source tube is already complete and uniform, don't pour out unless to empty or solving
  if (source.length === capacity && isTubeUniform(source)) {
    return { valid: false, count: 0, color: null, reason: 'Tube is already complete' };
  }

  const { color: sourceColor, count: sourceCount } = getTopColorInfo(source);
  if (!sourceColor) {
    return { valid: false, count: 0, color: null, reason: 'Source has no color' };
  }

  const freeSpace = capacity - dest.length;

  if (dest.length === 0) {
    // If source is already uniform, pouring all into an empty tube achieves nothing
    if (isTubeUniform(source)) {
      return { valid: false, count: 0, color: null, reason: 'Redundant move to empty tube' };
    }
    // Pour consecutive matching group
    const pourCount = Math.min(sourceCount, freeSpace);
    return { valid: true, count: pourCount, color: sourceColor };
  }

  const destTopColor = dest[dest.length - 1];
  if (destTopColor !== sourceColor) {
    return { valid: false, count: 0, color: null, reason: 'Colors do not match' };
  }

  const pourCount = Math.min(sourceCount, freeSpace);
  if (pourCount <= 0) {
    return { valid: false, count: 0, color: null, reason: 'No space available' };
  }

  return { valid: true, count: pourCount, color: sourceColor };
}

/**
 * Execute a pour operation returning a new board state.
 */
export function executePour(
  tubes: Tube[],
  fromIdx: number,
  toIdx: number,
  capacity: number = 4
): { newTubes: Tube[]; count: number; color: ColourId } | null {
  const check = canPour(tubes, fromIdx, toIdx, capacity);
  if (!check.valid || !check.color) return null;

  const newTubes = tubes.map((t) => [...t]);
  const color = check.color;
  const count = check.count;

  for (let i = 0; i < count; i++) {
    newTubes[fromIdx].pop();
    newTubes[toIdx].push(color);
  }

  return { newTubes, count, color };
}

/**
 * Encode tubes to a string for cycle detection in search.
 */
function serializeState(tubes: Tube[]): string {
  // Sort empty tubes at the end to treat symmetric empty tubes identically
  return tubes.map((t) => t.join(',')).sort().join('|');
}

export interface ValidMove {
  fromIndex: number;
  toIndex: number;
  color: ColourId;
  count: number;
}

/**
 * Get all legal moves from current state.
 */
export function getValidMoves(tubes: Tube[], capacity: number = 4): ValidMove[] {
  const moves: ValidMove[] = [];
  const len = tubes.length;

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (i === j) continue;
      const check = canPour(tubes, i, j, capacity);
      if (check.valid && check.color) {
        moves.push({
          fromIndex: i,
          toIndex: j,
          color: check.color,
          count: check.count,
        });
      }
    }
  }

  return moves;
}

/**
 * Breadth-First / A* Solver to find a solution path.
 * Returns the sequence of moves to solve, or null if unsolvable within maxSteps.
 */
export function solvePuzzle(
  initialTubes: Tube[],
  capacity: number = 4,
  maxSteps: number = 8000
): ValidMove[] | null {
  if (isSolved(initialTubes, capacity)) {
    return [];
  }

  interface Node {
    tubes: Tube[];
    path: ValidMove[];
  }

  const queue: Node[] = [{ tubes: initialTubes, path: [] }];
  const visited = new Set<string>();
  visited.add(serializeState(initialTubes));

  let steps = 0;

  while (queue.length > 0 && steps < maxSteps) {
    steps++;
    const current = queue.shift()!;

    const moves = getValidMoves(current.tubes, capacity);

    // Prioritize moves that complete a tube or group matching colors
    moves.sort((a, b) => {
      const destA = current.tubes[a.toIndex];
      const destB = current.tubes[b.toIndex];
      // Prefer moves that fill a tube completely
      const aCompletes = destA.length + a.count === capacity && isTubeUniform([...destA, a.color]);
      const bCompletes = destB.length + b.count === capacity && isTubeUniform([...destB, b.color]);
      if (aCompletes && !bCompletes) return -1;
      if (!aCompletes && bCompletes) return 1;
      // Prefer pouring to non-empty over empty
      if (destA.length > 0 && destB.length === 0) return -1;
      if (destA.length === 0 && destB.length > 0) return 1;
      return b.count - a.count;
    });

    for (const move of moves) {
      const res = executePour(current.tubes, move.fromIndex, move.toIndex, capacity);
      if (!res) continue;

      if (isSolved(res.newTubes, capacity)) {
        return [...current.path, move];
      }

      const key = serializeState(res.newTubes);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          tubes: res.newTubes,
          path: [...current.path, move],
        });
      }
    }
  }

  return null;
}

/**
 * Calculate a smart hint for the player from the current game state.
 */
export function getSmartHint(tubes: Tube[], capacity: number = 4): HintResult | null {
  // First, check if solver finds a solution from current state
  const solution = solvePuzzle(tubes, capacity, 4000);
  if (solution && solution.length > 0) {
    const next = solution[0];
    const colorInfo = getColour(next.color);
    return {
      fromIndex: next.fromIndex,
      toIndex: next.toIndex,
      color: next.color,
      count: next.count,
      message: `Try pouring ${next.count} ${colorInfo.name} from Tube ${next.fromIndex + 1} → Tube ${next.toIndex + 1}`,
    };
  }

  // Fallback: Pick the highest quality legal move
  const validMoves = getValidMoves(tubes, capacity);
  if (validMoves.length === 0) return null;

  // Filter out pointless moves (e.g. moving onto empty when another move is available)
  const nonToEmpty = validMoves.filter((m) => tubes[m.toIndex].length > 0);
  const bestMove = nonToEmpty.length > 0 ? nonToEmpty[0] : validMoves[0];

  const colorInfo = getColour(bestMove.color);
  return {
    fromIndex: bestMove.fromIndex,
    toIndex: bestMove.toIndex,
    color: bestMove.color,
    count: bestMove.count,
    message: `Try moving ${colorInfo.name} from Tube ${bestMove.fromIndex + 1} → Tube ${bestMove.toIndex + 1}`,
  };
}
