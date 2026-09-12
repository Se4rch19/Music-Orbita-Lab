import type { Prng } from "../core/prng.ts";
import type { ChordSymbol, ScaleName } from "../core/types.ts";
import { chordKey, parseChordKey } from "./chords.ts";

export function generateProgression(
  graph: Record<string, { to: string; weight: number }[]>,
  lengthBars: number,
  rng: Prng,
  vocab: ChordSymbol[],
): ChordSymbol[] {
  const keys = Object.keys(graph);
  if (keys.length === 0) {
    return vocab.slice(0, Math.max(1, lengthBars));
  }

  const start = keys.includes(chordKey({ ...vocab[0]!, bars: 1 }))
    ? chordKey({ ...vocab[0]!, bars: 1 })
    : keys[0]!;

  const sequence: ChordSymbol[] = [];
  let current = start;
  let bars = 0;
  let guard = 0;

  while (bars < lengthBars && guard < 64) {
    guard += 1;
    const symbol = hydrate(current, vocab);
    const remaining = lengthBars - bars;
    const span = remaining >= 4 && sequence.length === 0 ? 2 : remaining >= 2 && rng.chance(0.45) ? 2 : 1;
    const used = Math.min(span, remaining);
    sequence.push({ ...symbol, bars: used });
    bars += used;

    const edges = graph[current] ?? [];
    if (edges.length === 0) {
      current = rng.pick(keys);
      continue;
    }
    current = rng.weighted(edges.map((edge) => ({ item: edge.to, weight: edge.weight })));
  }

  return sequence;
}

function hydrate(key: string, vocab: ChordSymbol[]): ChordSymbol {
  const parsed = parseChordKey(key);
  const match = vocab.find((item) => chordKey({ ...item, bars: 1 }) === key);
  return match ? { ...match, bars: 1 } : parsed;
}

export function cadenceForScale(scale: ScaleName): ChordSymbol[] {
  if (scale === "major" || scale === "lydian" || scale === "mixolydian" || scale === "majorPentatonic" || scale === "lydianPentatonic") {
    return [
      { degree: 4, alteration: 0, quality: "maj7", bars: 1 },
      { degree: 1, alteration: 0, quality: "add9", bars: 1 },
    ];
  }
  if (scale === "phrygian" || scale === "harmonicMinor") {
    return [
      { degree: 2, alteration: -1, quality: "maj", bars: 1 },
      { degree: 1, alteration: 0, quality: "min", bars: 1 },
    ];
  }
  return [
    { degree: 4, alteration: 0, quality: "min7", bars: 1 },
    { degree: 1, alteration: 0, quality: "minadd9", bars: 1 },
  ];
}

export function flattenProgression(chords: ChordSymbol[], totalBars: number): ChordSymbol[] {
  const perBar: ChordSymbol[] = [];
  for (const chord of chords) {
    const span = Math.max(1, chord.bars);
    for (let i = 0; i < span; i++) {
      perBar.push({ ...chord, bars: 1 });
    }
  }
  if (perBar.length === 0) {
    return Array.from({ length: totalBars }, () => ({
      degree: 1 as const,
      alteration: 0,
      quality: "add9" as const,
      bars: 1,
    }));
  }
  while (perBar.length < totalBars) {
    perBar.push(perBar[perBar.length % chords.length] ?? perBar[0]!);
  }
  return perBar.slice(0, totalBars);
}
