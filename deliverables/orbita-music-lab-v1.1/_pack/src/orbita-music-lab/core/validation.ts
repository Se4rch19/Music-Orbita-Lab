import { midiToFreq } from "./pitch.ts";
import {
  MAX_MIDI,
  MIN_MIDI,
  MIN_MOBILE_BASS_MIDI,
  type BarScore,
  type ChordVoicing,
  type ScoreNote,
} from "./types.ts";
import { isInScale } from "../theory/scales.ts";
import type { ScaleName } from "./types.ts";

export type ValidationIssue = {
  code: string;
  message: string;
};

export function validateNote(note: ScoreNote): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(note.midi)) issues.push({ code: "nan-midi", message: "MIDI is NaN" });
  if (note.midi < MIN_MIDI || note.midi > MAX_MIDI) {
    issues.push({ code: "midi-bounds", message: `MIDI ${note.midi} out of bounds` });
  }
  const freq = midiToFreq(note.midi);
  if (!Number.isFinite(freq) || freq < 20 || freq > 8000) {
    issues.push({ code: "freq-bounds", message: `Frequency ${freq} out of bounds` });
  }
  if (!Number.isFinite(note.durationTicks) || note.durationTicks <= 0) {
    issues.push({ code: "duration", message: "Invalid duration" });
  }
  if (!Number.isFinite(note.velocity) || note.velocity < 0 || note.velocity > 1.5) {
    issues.push({ code: "gain", message: "Invalid velocity" });
  }
  if (note.voice === "bass" && note.midi < MIN_MOBILE_BASS_MIDI) {
    issues.push({ code: "bass-register", message: "Bass below mobile-safe register" });
  }
  return issues;
}

export function validateBar(score: BarScore, tonicPc: number, scale: ScaleName): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!score.chord.midi.length) issues.push({ code: "empty-chord", message: "Chord has no voicing" });
  for (const midi of score.chord.midi) {
    if (!Number.isFinite(midi)) issues.push({ code: "nan-chord", message: "Chord MIDI is NaN" });
  }
  for (const note of score.notes) {
    issues.push(...validateNote(note));
  }
  const pitched = score.notes.filter((n) => ["lead", "pluck", "bell", "arp", "pickup"].includes(n.voice));
  for (const note of pitched) {
    const inScale = isInScale(note.midi, tonicPc, scale);
    const inChord = score.chord.pitchClasses.includes(((note.midi % 12) + 12) % 12);
    if (!inScale && !inChord) {
      issues.push({ code: "out-of-harmony", message: `Pitch ${note.midi} outside scale/chord` });
    }
  }
  return issues;
}

export function validatePickup(midi: number, chord: ChordVoicing, tonicPc: number, scale: ScaleName): boolean {
  if (!Number.isFinite(midi)) return false;
  if (midi < MIN_MIDI || midi > MAX_MIDI) return false;
  const pc = ((Math.round(midi) % 12) + 12) % 12;
  return chord.pitchClasses.includes(pc) || isInScale(midi, tonicPc, scale);
}

export function assertSafeFrequency(freq: number): number {
  if (!Number.isFinite(freq)) return 440;
  return Math.max(20, Math.min(8000, freq));
}
