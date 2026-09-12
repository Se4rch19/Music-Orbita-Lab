import type { Prng } from "../core/prng.ts";
import { clampMidi, nearestMidi } from "../core/pitch.ts";
import type { ChordVoicing, Motif, ScoreNote, VoiceName } from "../core/types.ts";
import { isInScale, nearestScaleMidi, SCALE_INTERVALS } from "./scales.ts";
import type { ScaleName } from "../core/types.ts";
import { adaptContourToChord, nearestChordTone, polishPhrase } from "./harmonic-role.ts";
import type { TensionPolicy } from "./harmonic-role.ts";

export type MotifVariation =
  | "prime"
  | "transpose"
  | "invert"
  | "ending"
  | "displace"
  | "octave"
  | "fragment"
  | "extend"
  | "response";

export function varyMotif(motif: Motif, kind: MotifVariation, rng: Prng): Motif {
  const contour = [...motif.contour];
  const rhythm = [...motif.rhythm];
  const rests = [...motif.rests];
  const accents = [...motif.accents];

  switch (kind) {
    case "transpose": {
      const shift = rng.pick([-2, -1, 1, 2]);
      return copy(motif, "t", contour.map((d) => d + shift), rhythm, rests, accents);
    }
    case "invert": {
      const pivot = contour[0] ?? 0;
      return copy(motif, "i", contour.map((d) => pivot - (d - pivot)), rhythm, rests, accents);
    }
    case "ending": {
      if (contour.length >= 2) {
        contour[contour.length - 1] = 0;
        contour[contour.length - 2] = rng.pick([1, 2, 4]);
      }
      return copy(motif, "e", contour, rhythm, rests, accents);
    }
    case "displace": {
      return copy(motif, "d", contour, [1, ...rhythm], [true, ...rests], [false, ...accents]);
    }
    case "octave": {
      const dir = rng.chance(0.5) ? 7 : -7;
      return copy(motif, "o", contour.map((d, i) => (i % 2 === 0 ? d + dir : d)), rhythm, rests, accents);
    }
    case "fragment": {
      const cut = Math.max(2, Math.ceil(contour.length / 2));
      return copy(motif, "f", contour.slice(0, cut), rhythm.slice(0, cut), rests.slice(0, cut), accents.slice(0, cut));
    }
    case "extend": {
      const extra = rng.pick([0, 2, 4, 3]);
      return copy(
        motif,
        "x",
        [...contour, extra],
        [...rhythm, rng.pick([2, 4])],
        [...rests, false],
        [...accents, true],
      );
    }
    case "response": {
      const answer = contour.slice().reverse().map((d) => d + rng.pick([-1, 0, 1]));
      return copy(motif, "r", answer, rhythm, rests, accents);
    }
    default:
      return motif;
  }
}

function copy(
  motif: Motif,
  suffix: string,
  contour: number[],
  rhythm: number[],
  rests: boolean[],
  accents: boolean[],
): Motif {
  return {
    id: `${motif.id}-${suffix}`,
    contour,
    rhythm,
    rests,
    accents,
  };
}

export function realizeMotif(options: {
  motif: Motif;
  tonicPc: number;
  scale: ScaleName;
  chord: ChordVoicing;
  register: [number, number];
  startTick?: number;
  voice?: VoiceName;
  velocity?: number;
  policy?: TensionPolicy;
  polish?: boolean;
}): ScoreNote[] {
  const {
    motif,
    tonicPc,
    scale,
    chord,
    register,
    startTick = 0,
    voice = "lead",
    velocity = 0.7,
    policy = "strict",
    polish = true,
  } = options;
  const contour = polish ? adaptContourToChord(motif.contour, chord, tonicPc, scale) : motif.contour;
  const notes: ScoreNote[] = [];
  let tick = startTick;
  const intervals = SCALE_INTERVALS[scale];
  const [low, high] = register;
  let lastMidi = clampMidi((low + high) / 2);

  for (let i = 0; i < contour.length; i++) {
    const dur = Math.max(1, motif.rhythm[i] ?? 2);
    const rest = motif.rests[i] ?? false;
    const accent = motif.accents[i] ?? false;
    if (!rest) {
      const degree = contour[i] ?? 0;
      const wrapped = ((degree % intervals.length) + intervals.length) % intervals.length;
      const oct = Math.floor(degree / intervals.length);
      const interval = intervals[wrapped] ?? 0;
      let midi = 12 * (4 + oct) + ((tonicPc + interval) % 12);
      midi = nearestMidi(midi % 12, lastMidi);
      if (midi < low) midi += 12;
      if (midi > high) midi -= 12;
      midi = clampMidi(Math.max(low, Math.min(high, midi)));

      const strong = tick % 8 === 0 || tick % 8 === 4;
      if (strong || accent) {
        midi = nearestChordTone(midi, chord);
      } else if (!isInScale(midi, tonicPc, scale)) {
        midi = nearestScaleMidi(midi, tonicPc, scale);
      }

      if (Math.abs(midi - lastMidi) > 9) {
        const recovered = midi > lastMidi ? midi - 12 : midi + 12;
        if (recovered >= low && recovered <= high) midi = recovered;
      }

      notes.push({
        tick,
        durationTicks: dur,
        midi: clampMidi(midi),
        velocity: clampVel(velocity * (accent ? 1 : 0.78)),
        voice,
      });
      lastMidi = midi;
    }
    tick += dur;
  }
  return polish ? polishPhrase(notes, chord, tonicPc, scale, policy, [voice]) : notes;
}

function clampVel(value: number): number {
  if (!Number.isFinite(value)) return 0.6;
  return Math.max(0.05, Math.min(1, value));
}

export function pickVariation(barIndex: number, rng: Prng): MotifVariation {
  if (barIndex % 16 === 14) return "ending";
  if (barIndex % 8 === 4) return rng.pick(["transpose", "response", "fragment"]);
  if (barIndex % 8 === 6) return rng.pick(["invert", "displace", "octave"]);
  if (barIndex % 4 === 2) return rng.pick(["prime", "extend", "transpose"]);
  return "prime";
}

export function contourFromPitches(midis: number[], tonicPc: number, scale: ScaleName): number[] {
  const intervals = SCALE_INTERVALS[scale];
  return midis.map((midi) => {
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    const relative = (pc - tonicPc + 12) % 12;
    let bestIdx = 0;
    let bestDist = 99;
    for (let i = 0; i < intervals.length; i++) {
      const dist = Math.abs(intervals[i]! - relative);
      if (dist < bestDist) {
        bestIdx = i;
        bestDist = dist;
      }
    }
    return bestIdx;
  });
}
