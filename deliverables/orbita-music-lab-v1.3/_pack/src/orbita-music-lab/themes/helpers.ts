import type {
  BassPattern,
  ChordQuality,
  ChordSymbol,
  Motif,
  PatternStep,
  PercPattern,
} from "../core/types.ts";

export function motif(
  id: string,
  contour: number[],
  rhythm: number[],
  accents: number[] = [],
  rests: number[] = [],
): Motif {
  return {
    id,
    contour,
    rhythm,
    accents: contour.map((_, i) => (accents[i] ?? 0) > 0),
    rests: contour.map((_, i) => (rests[i] ?? 0) > 0),
  };
}

export function perc(parts: {
  kick: number[];
  snare: number[];
  hat: number[];
  click?: number[];
}): PercPattern {
  const toStep = (value: number): PatternStep =>
    value >= 3 ? 3 : value >= 2 ? 2 : value >= 1 ? 1 : 0;
  return {
    kick: parts.kick.map(toStep),
    snare: parts.snare.map(toStep),
    hat: parts.hat.map(toStep),
    click: (parts.click ?? Array(16).fill(0)).map(toStep),
  };
}

export function bass(steps: number[]): BassPattern {
  return { steps };
}

export function chord(
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  quality: ChordQuality,
  alteration = 0,
  bars = 1,
): ChordSymbol {
  return { degree, quality, alteration, bars };
}

export function edge(to: string, weight: number): { to: string; weight: number } {
  return { to, weight };
}
