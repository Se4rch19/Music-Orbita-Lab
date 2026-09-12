/**
 * Deterministic PRNG for musical generation.
 * Mulberry32 + FNV-1a string hash. Never use Math.random() for composition.
 */

export type Prng = {
  seed: string;
  next: () => number;
  nextInt: (maxExclusive: number) => number;
  nextRange: (min: number, max: number) => number;
  nextIntRange: (min: number, maxInclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  weighted: <T>(items: readonly { item: T; weight: number }[]) => T;
  chance: (probability: number) => boolean;
  fork: (label: string) => Prng;
};

export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createPrng(seed: string): Prng {
  const hashed = hashSeed(seed) || 0x9e3779b9;
  let state = hashed;

  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (maxExclusive: number): number => {
    if (maxExclusive <= 0) return 0;
    return Math.floor(next() * maxExclusive);
  };

  const api: Prng = {
    seed,
    next,
    nextInt,
    nextRange(min: number, max: number) {
      return min + next() * (max - min);
    },
    nextIntRange(min: number, maxInclusive: number) {
      if (maxInclusive < min) return min;
      return min + nextInt(maxInclusive - min + 1);
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error("Prng.pick called on empty list");
      }
      return items[nextInt(items.length)] as T;
    },
    weighted<T>(items: readonly { item: T; weight: number }[]): T {
      const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
      if (total <= 0 || items.length === 0) {
        throw new Error("Prng.weighted called with no positive weights");
      }
      let cursor = next() * total;
      for (const entry of items) {
        cursor -= Math.max(0, entry.weight);
        if (cursor <= 0) return entry.item;
      }
      return items[items.length - 1]!.item;
    },
    chance(probability: number) {
      return next() < probability;
    },
    fork(label: string) {
      return createPrng(`${seed}::${label}`);
    },
  };

  return api;
}
