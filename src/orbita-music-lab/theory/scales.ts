import type { ScaleName } from "../core/types.ts";

/** Interval sets in semitones from tonic. General music theory only. */
export const SCALE_INTERVALS: Record<ScaleName, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  lydianPentatonic: [0, 2, 4, 6, 9],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
};

export function scalePitchClasses(tonicPc: number, scale: ScaleName): number[] {
  return SCALE_INTERVALS[scale].map((interval) => (tonicPc + interval) % 12);
}

export function isInScale(midi: number, tonicPc: number, scale: ScaleName): boolean {
  const pc = ((Math.round(midi) % 12) + 12) % 12;
  return scalePitchClasses(tonicPc, scale).includes(pc);
}

export function degreeToPc(tonicPc: number, scale: ScaleName, degree: number): number {
  const intervals = SCALE_INTERVALS[scale];
  const octave = Math.floor(degree / intervals.length);
  const idx = ((degree % intervals.length) + intervals.length) % intervals.length;
  const interval = intervals[idx] ?? 0;
  return (tonicPc + interval + octave * 12) % 12;
}

export function degreeToMidi(
  tonicPc: number,
  scale: ScaleName,
  degree: number,
  baseOctave: number,
): number {
  const intervals = SCALE_INTERVALS[scale];
  const wrapped = ((degree % intervals.length) + intervals.length) % intervals.length;
  const octaves = Math.floor(degree / intervals.length) + (degree < 0 && degree % intervals.length !== 0 ? -1 : 0);
  const interval = intervals[wrapped] ?? 0;
  const extra = degree < 0 && wrapped !== 0 ? -1 : 0;
  return 12 * (baseOctave + 1 + octaves + extra) + ((tonicPc + interval) % 12);
}

export function nearestScaleMidi(
  midi: number,
  tonicPc: number,
  scale: ScaleName,
): number {
  const pcs = scalePitchClasses(tonicPc, scale);
  const target = Math.round(midi);
  let best = target;
  let bestDist = 99;
  for (let delta = -12; delta <= 12; delta++) {
    const candidate = target + delta;
    if (pcs.includes(((candidate % 12) + 12) % 12)) {
      const dist = Math.abs(delta);
      if (dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
  }
  return best;
}

export function diatonicRootPc(
  tonicPc: number,
  scale: ScaleName,
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  alteration = 0,
): number {
  const intervals = SCALE_INTERVALS[scale];
  const seven = intervals.length >= 7 ? intervals : SCALE_INTERVALS.major;
  const interval = seven[degree - 1] ?? 0;
  return (tonicPc + interval + alteration + 120) % 12;
}
