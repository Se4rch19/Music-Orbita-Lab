import { clampMidi, nearestMidi, pitchClass } from "../core/pitch.ts";
import type { ChordQuality, ChordSymbol, ChordVoicing } from "../core/types.ts";
import { diatonicRootPc, SCALE_INTERVALS } from "./scales.ts";
import type { ScaleName } from "../core/types.ts";

/** Chord interval recipes in semitones from chord root. */
export const QUALITY_INTERVALS: Record<ChordQuality, readonly number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  add9: [0, 4, 7, 14],
  minadd9: [0, 3, 7, 14],
  maj6: [0, 4, 7, 9],
  min6: [0, 3, 7, 9],
  dom7: [0, 4, 7, 10],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  dim: [0, 3, 6],
  halfdim: [0, 3, 6, 10],
  aug: [0, 4, 8],
  sus2add6: [0, 2, 7, 9],
};

export function chordKey(symbol: ChordSymbol): string {
  const alt = symbol.alteration === -1 ? "b" : symbol.alteration === 1 ? "#" : "";
  return `${alt}${roman(symbol.degree)}:${symbol.quality}`;
}

function roman(degree: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][degree - 1] ?? "I";
}

export function parseChordKey(key: string): ChordSymbol {
  const match = key.match(/^(b|#)?(I{1,3}|IV|VI{0,2}|V):([a-z0-9]+)$/);
  if (!match) {
    return { degree: 1, alteration: 0, quality: "maj", bars: 1 };
  }
  const alteration = match[1] === "b" ? -1 : match[1] === "#" ? 1 : 0;
  const degreeMap: Record<string, ChordSymbol["degree"]> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
  };
  const degree = degreeMap[match[2] ?? "I"] ?? 1;
  const quality = (match[3] ?? "maj") as ChordQuality;
  return { degree, alteration, quality, bars: 1 };
}

export function chordPitchClasses(
  tonicPc: number,
  scale: ScaleName,
  symbol: ChordSymbol,
): number[] {
  const root = diatonicRootPc(tonicPc, scale, symbol.degree, symbol.alteration);
  const intervals = QUALITY_INTERVALS[symbol.quality] ?? QUALITY_INTERVALS.maj;
  const unique: number[] = [];
  for (const interval of intervals) {
    const pc = (root + interval) % 12;
    if (!unique.includes(pc)) unique.push(pc);
  }
  return unique;
}

export function voiceChord(options: {
  tonicPc: number;
  scale: ScaleName;
  symbol: ChordSymbol;
  previous?: number[];
  lowMidi: number;
  highMidi: number;
  bassOctave?: number;
}): ChordVoicing {
  const { tonicPc, scale, symbol, previous, lowMidi, highMidi } = options;
  const pcs = chordPitchClasses(tonicPc, scale, symbol);
  const rootPc = pcs[0] ?? tonicPc;
  const bassMidi = nearestMidi(rootPc, (options.bassOctave ?? 2) * 12 + 12 + rootPc);
  const bassSafe = Math.max(36, bassMidi);

  const voiced: number[] = [];
  if (previous && previous.length > 0) {
    for (const pc of pcs) {
      let best = nearestMidi(pc, previous[0] ?? 60);
      let bestDist = 99;
      for (const prev of previous) {
        const candidate = nearestMidi(pc, prev);
        const dist = Math.abs(candidate - prev);
        if (dist < bestDist) {
          best = candidate;
          bestDist = dist;
        }
      }
      voiced.push(clampMidi(Math.max(lowMidi, Math.min(highMidi, best))));
    }
  } else {
    let cursor = lowMidi + 4;
    for (const pc of pcs) {
      const note = nearestMidi(pc, cursor);
      voiced.push(clampMidi(Math.max(lowMidi, Math.min(highMidi, note))));
      cursor = note + 3;
    }
  }

  voiced.sort((a, b) => a - b);
  while (voiced.length > 0 && voiced[0]! < lowMidi) {
    const shifted = voiced.shift()! + 12;
    if (shifted <= highMidi) voiced.push(shifted);
    voiced.sort((a, b) => a - b);
  }

  const midi = uniqueSorted(voiced).slice(0, 5);
  return {
    symbol,
    pitchClasses: pcs,
    midi,
    rootMidi: nearestMidi(rootPc, 60),
    bassMidi: clampMidi(bassSafe),
  };
}

export function chordTonesMidi(voicing: ChordVoicing, register: [number, number]): number[] {
  const [low, high] = register;
  const out: number[] = [];
  for (const pc of voicing.pitchClasses) {
    for (let oct = 2; oct <= 7; oct++) {
      const midi = oct * 12 + pc;
      if (midi >= low && midi <= high) out.push(midi);
    }
  }
  return uniqueSorted(out);
}

export function isChordTone(midi: number, voicing: ChordVoicing): boolean {
  return voicing.pitchClasses.includes(pitchClass(midi));
}

export function formatChord(tonicPc: number, scale: ScaleName, symbol: ChordSymbol): string {
  const root = diatonicRootPc(tonicPc, scale, symbol.degree, symbol.alteration);
  const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const qualityLabel: Record<ChordQuality, string> = {
    maj: "",
    min: "m",
    sus2: "sus2",
    sus4: "sus4",
    maj7: "maj7",
    min7: "m7",
    add9: "add9",
    minadd9: "m(add9)",
    maj6: "6",
    min6: "m6",
    dom7: "7",
    maj9: "maj9",
    min9: "m9",
    dim: "dim",
    halfdim: "m7b5",
    aug: "aug",
    sus2add6: "sus2add6",
  };
  return `${names[root]}${qualityLabel[symbol.quality]}`;
}

export function defaultQualityForDegree(scale: ScaleName, degree: 1 | 2 | 3 | 4 | 5 | 6 | 7): ChordQuality {
  const intervals = SCALE_INTERVALS[scale];
  const seven = intervals.length >= 7 ? intervals : SCALE_INTERVALS.major;
  const root = seven[degree - 1] ?? 0;
  const third = seven[degree % 7] ?? 0;
  const wrappedThird = (third - root + 12) % 12;
  if (wrappedThird === 3) return "min";
  if (wrappedThird === 4) return "maj";
  return "sus2";
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}
