import { MAX_MIDI, MIN_MIDI } from "./types.ts";

export const PC_NAMES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

export function clampMidi(midi: number): number {
  if (!Number.isFinite(midi)) return 60;
  return Math.max(MIN_MIDI, Math.min(MAX_MIDI, Math.round(midi)));
}

export function pitchClass(midi: number): number {
  return ((Math.round(midi) % 12) + 12) % 12;
}

export function pcName(pc: number): string {
  return PC_NAMES[((pc % 12) + 12) % 12] ?? "C";
}

export function midiInOctave(pc: number, octave: number): number {
  return clampMidi(12 * (octave + 1) + (((pc % 12) + 12) % 12));
}

export function nearestMidi(pc: number, around: number): number {
  const targetPc = ((pc % 12) + 12) % 12;
  const base = Math.round(around);
  let best = base;
  let bestDist = 99;
  for (let delta = -18; delta <= 18; delta++) {
    const candidate = base + delta;
    if (pitchClass(candidate) === targetPc) {
      const dist = Math.abs(candidate - around);
      if (dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
  }
  return clampMidi(best);
}

export function clampGain(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
