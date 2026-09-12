import { clampMidi, nearestMidi, pitchClass } from "../core/pitch.ts";
import type {
  ChordVoicing,
  OrbitaThemeId,
  ScaleName,
  ScoreNote,
  SectionId,
  VoiceName,
} from "../core/types.ts";
import { isChordTone } from "./chords.ts";
import { isInScale, nearestScaleMidi, SCALE_INTERVALS } from "./scales.ts";

/**
 * Harmonic role of a generated pitch against the active chord.
 * Tension is allowed (Lavanda / Eclipse / anomaly). Accidental clash is not.
 */
export type HarmonicRole =
  | "chord-tone"
  | "controlled-extension"
  | "passing-tone"
  | "approach-tone"
  | "tension";

export type TensionPolicy = "strict" | "color" | "open";

const PITCHED: VoiceName[] = ["lead", "pluck", "bell", "arp", "bass", "pickup"];

const EXTENSION_PCS: Record<string, number[]> = {
  add9: [2],
  minadd9: [2],
  maj9: [2],
  min9: [2],
  sus2: [2],
  sus4: [5],
  maj6: [9],
  min6: [9],
  sus2add6: [2, 9],
  maj7: [11],
  min7: [10],
  dom7: [10],
};

export function tensionPolicyFor(
  themeId: OrbitaThemeId | "idle",
  scale: ScaleName,
  opts?: { anomaly?: boolean; tension?: number },
): TensionPolicy {
  if (opts?.anomaly) return "open";
  if (themeId === "eclipse" || scale === "phrygian" || scale === "harmonicMinor") return "open";
  if (themeId === "lavanda" || scale === "melodicMinor" || scale === "dorian" || (opts?.tension ?? 0) > 0.55) {
    return "color";
  }
  return "strict";
}

export function intervalClass(a: number, b: number): number {
  const d = Math.abs(pitchClass(a) - pitchClass(b));
  return Math.min(d, 12 - d);
}

export function isStrongTick(tick: number): boolean {
  const t = ((tick % 16) + 16) % 16;
  return t === 0 || t === 8;
}

export function isBeatTick(tick: number): boolean {
  const t = ((tick % 16) + 16) % 16;
  return t % 4 === 0;
}

export function isHarshAgainstChord(midi: number, chord: ChordVoicing): boolean {
  return chord.pitchClasses.some((pc) => intervalClass(midi, pc) === 1);
}

export function nearestChordTone(midi: number, chord: ChordVoicing): number {
  if (isChordTone(midi, chord)) return midi;
  let best = midi;
  let bestDist = 99;
  for (const pc of chord.pitchClasses) {
    const candidate = nearestMidi(pc, midi);
    const dist = Math.abs(candidate - midi);
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return clampMidi(best);
}

export function classifyNote(
  midi: number,
  chord: ChordVoicing,
  tonicPc: number,
  scale: ScaleName,
  ctx?: { prev?: number; next?: number },
): HarmonicRole {
  if (isChordTone(midi, chord)) return "chord-tone";
  const pc = pitchClass(midi);
  const root = chord.pitchClasses[0] ?? tonicPc;
  const rel = (pc - root + 12) % 12;
  const extra = EXTENSION_PCS[chord.symbol.quality] ?? [];
  if (extra.includes(rel) || extra.includes(pc)) return "controlled-extension";

  const next = ctx?.next;
  const prev = ctx?.prev;
  if (next !== undefined && isChordTone(next, chord) && intervalClass(midi, next) <= 2) {
    return "approach-tone";
  }
  if (
    prev !== undefined &&
    next !== undefined &&
    isChordTone(prev, chord) &&
    isChordTone(next, chord) &&
    ((midi - prev) * (next - midi) > 0 || intervalClass(midi, prev) <= 2)
  ) {
    return "passing-tone";
  }
  if (isInScale(midi, tonicPc, scale)) return "tension";
  return "tension";
}

export function consonantPickupInterval(a: number, b: number, policy: TensionPolicy): boolean {
  const ic = intervalClass(a, b);
  if (ic === 0 || ic === 3 || ic === 4 || ic === 5 || ic === 7) return true;
  if (ic === 8 || ic === 9) return policy !== "strict";
  if (ic === 2) return policy !== "strict";
  if (ic === 1 || ic === 6 || ic === 11) return policy === "open";
  return false;
}

export function chooseResolvedPickup(
  midi: number,
  chord: ChordVoicing,
  tonicPc: number,
  scale: ScaleName,
  policy: TensionPolicy,
): number {
  let fitted = midi;
  if (policy === "strict" && isHarshAgainstChord(fitted, chord)) {
    fitted = nearestChordTone(fitted, chord);
  } else if (!isChordTone(fitted, chord) && !isInScale(fitted, tonicPc, scale)) {
    fitted = nearestChordTone(fitted, chord);
  }
  return clampMidi(fitted);
}

/**
 * Snap a realized motif so strong beats and phrase endings belong to the chord,
 * while passing / approach / world-color tension stay on weak ticks.
 */
export function polishPhrase(
  notes: ScoreNote[],
  chord: ChordVoicing,
  tonicPc: number,
  scale: ScaleName,
  policy: TensionPolicy,
  voices: VoiceName[] = PITCHED,
): ScoreNote[] {
  const pitched = notes
    .map((note, index) => ({ note, index }))
    .filter(({ note }) => voices.includes(note.voice))
    .sort((a, b) => a.note.tick - b.note.tick || a.index - b.index);

  if (pitched.length === 0) return notes;

  const out = notes.map((n) => ({ ...n }));

  for (let i = 0; i < pitched.length; i++) {
    const slot = pitched[i]!;
    const note = out[slot.index]!;
    const prev = i > 0 ? out[pitched[i - 1]!.index]!.midi : undefined;
    const next = i < pitched.length - 1 ? out[pitched[i + 1]!.index]!.midi : undefined;
    const last = i === pitched.length - 1;
    const strong = isStrongTick(note.tick) || last;
    const bassBeat = note.voice === "bass" && isBeatTick(note.tick);

    let midi = note.midi;
    const role = classifyNote(midi, chord, tonicPc, scale, { prev, next });
    const harsh = isHarshAgainstChord(midi, chord);
    const verticalMinorSecond = chord.midi.some((pad) => Math.abs(pad - midi) === 1);

    if (bassBeat) {
      midi = nearestChordTone(midi, chord);
    } else if (strong) {
      if (role === "chord-tone" || role === "controlled-extension") {
        if (policy === "strict" && (harsh || verticalMinorSecond)) midi = nearestChordTone(midi, chord);
      } else if (policy === "open" && role === "tension" && !last && note.tick % 16 !== 0) {
        // keep Eclipse / phrygian color on beat 3
      } else if (policy === "color" && role === "tension" && !last && note.tick % 16 !== 0) {
        // keep Lavanda color off the downbeat
      } else {
        midi = nearestChordTone(midi, chord);
      }
    } else if (policy === "strict" && (harsh || verticalMinorSecond)) {
      midi = nearestChordTone(midi, chord);
    } else if (!isInScale(midi, tonicPc, scale) && !isChordTone(midi, chord)) {
      midi = nearestScaleMidi(midi, tonicPc, scale);
      if (policy === "strict" && isHarshAgainstChord(midi, chord)) midi = nearestChordTone(midi, chord);
    }

    if (prev !== undefined && Math.abs(midi - prev) > 9 && note.voice !== "bass") {
      const recovered = midi > prev ? midi - 12 : midi + 12;
      if (recovered >= 48 && recovered <= 96) midi = recovered;
    }

    note.midi = clampMidi(midi);
  }

  // Force unresolved non-chord tones to resolve into the next chord tone.
  for (let i = 0; i < pitched.length - 1; i++) {
    const cur = out[pitched[i]!.index]!;
    const nxt = out[pitched[i + 1]!.index]!;
    if (cur.voice === "bass" || nxt.voice === "bass") continue;
    const curChord = isChordTone(cur.midi, chord) || classifyNote(cur.midi, chord, tonicPc, scale) === "controlled-extension";
    const nxtChord = isChordTone(nxt.midi, chord) || classifyNote(nxt.midi, chord, tonicPc, scale) === "controlled-extension";
    if (!curChord && !nxtChord && policy === "strict") {
      nxt.midi = nearestChordTone(nxt.midi, chord);
    }
  }

  const ending = out[pitched[pitched.length - 1]!.index]!;
  if (ending.voice !== "bass" || isBeatTick(ending.tick)) {
    const endRole = classifyNote(ending.midi, chord, tonicPc, scale);
    if (endRole !== "chord-tone" && endRole !== "controlled-extension" && policy !== "open") {
      ending.midi = nearestChordTone(ending.midi, chord);
    } else if (policy === "open" && isHarshAgainstChord(ending.midi, chord) && isStrongTick(ending.tick)) {
      ending.midi = nearestChordTone(ending.midi, chord);
    }
  }

  return out;
}

/** Nudge a scale-degree contour so realized strong positions are not accidental clashes. */
export function adaptContourToChord(
  contour: number[],
  chord: ChordVoicing,
  tonicPc: number,
  scale: ScaleName,
): number[] {
  const intervals = SCALE_INTERVALS[scale];
  const out = [...contour];
  if (out.length === 0) return out;
  out[0] = snapDegreeToChord(out[0]!, chord, tonicPc, intervals);
  out[out.length - 1] = snapDegreeToChord(out[out.length - 1]!, chord, tonicPc, intervals);
  return out;
}

function snapDegreeToChord(
  degree: number,
  chord: ChordVoicing,
  tonicPc: number,
  intervals: readonly number[],
): number {
  const wrapped = ((degree % intervals.length) + intervals.length) % intervals.length;
  const oct = Math.floor(degree / intervals.length);
  const interval = intervals[wrapped] ?? 0;
  const pc = (tonicPc + interval) % 12;
  if (chord.pitchClasses.includes(pc)) return degree;
  let best = degree;
  let bestDist = 99;
  for (const delta of [-1, 1, -2, 2]) {
    const next = degree + delta;
    const w = ((next % intervals.length) + intervals.length) % intervals.length;
    const iv = intervals[w] ?? 0;
    const npc = (tonicPc + iv) % 12;
    if (chord.pitchClasses.includes(npc) && Math.abs(delta) < bestDist) {
      best = next + oct * 0;
      bestDist = Math.abs(delta);
    }
  }
  return best;
}

export function commonToneMidis(a: ChordVoicing, b: ChordVoicing, register: [number, number]): number[] {
  const shared = a.pitchClasses.filter((pc) => b.pitchClasses.includes(pc));
  const out: number[] = [];
  for (const pc of shared.length ? shared : a.pitchClasses.slice(0, 2)) {
    const fromA = a.midi.find((m) => pitchClass(m) === pc);
    out.push(clampMidi(fromA ?? nearestMidi(pc, (register[0] + register[1]) / 2)));
  }
  return out.slice(0, 3);
}

export function isPitchedVoice(voice: VoiceName): boolean {
  return PITCHED.includes(voice);
}

export function phraseVoicesForSection(section: SectionId): VoiceName[] {
  if (section === "TRANSITION") return ["pad", "bass", "bell"];
  return PITCHED;
}
