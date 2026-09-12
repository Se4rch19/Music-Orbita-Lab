import { createPrng } from "../core/prng.ts";
import { clamp01, clampMidi, nearestMidi } from "../core/pitch.ts";
import type {
  BarScore,
  ChordVoicing,
  GameMode,
  PercHitKind,
  ScoreNote,
  SectionId,
  VoiceName,
} from "../core/types.ts";
import { TICKS_PER_BAR } from "../core/types.ts";
import { chordTonesMidi, isChordTone } from "../theory/chords.ts";
import { pickVariation, realizeMotif, varyMotif } from "../theory/motifs.ts";
import { nearestScaleMidi } from "../theory/scales.ts";
import { chordAtBar, modeModifiers, sectionAtBar, type SessionIdentity } from "./session.ts";

export type ComposeContext = {
  session: SessionIdentity;
  barIndex: number;
  intensity: number;
  combo: number;
  mode: GameMode;
  previousVoicing?: ChordVoicing;
  pickupContour?: number[];
  forceSection?: SectionId;
};

const SECTION_BASE: Record<SectionId, number> = {
  INTRO: 0.4,
  A: 0.64,
  A_VARIATION: 0.72,
  B: 0.7,
  BUILD: 0.9,
  PEAK: 1,
  RECOVERY: 0.38,
  TRANSITION: 0.24,
};

export function composeBar(ctx: ComposeContext): BarScore {
  const { session } = ctx;
  const sectionInfo = ctx.forceSection
    ? { id: ctx.forceSection, localBar: ctx.barIndex }
    : sectionAtBar(session, ctx.barIndex);
  const section = sectionInfo.id;
  const voicing = chordAtBar(session, section, sectionInfo.localBar, ctx.previousVoicing?.midi);
  const rng = createPrng(`${session.variationSeed}::bar:${ctx.barIndex}::${section}`);
  const mode = modeModifiers(ctx.mode);
  const energy = clamp01(SECTION_BASE[section] * 0.48 + ctx.intensity * 0.74);
  const density = clamp01(Math.max(0.28, energy * mode.density));
  const percAmt = clamp01(
    0.28 + energy * mode.percussion * (session.theme.densityRange[0] + density * 0.9),
  );
  const notes: ScoreNote[] = [];
  const isFill = sectionInfo.localBar === 7 && energy > 0.48 && rng.chance(0.62 + ctx.intensity * 0.28);
  const world = session.themeId;

  addPad(notes, voicing, density, mode.space, section, ctx.intensity, world);
  addBass(notes, voicing, session, density, rng, section, mode.pulse, ctx.intensity);
  addPulse(notes, voicing, session, density, section, ctx.intensity);
  addShimmer(notes, voicing, world, section, ctx.intensity, ctx.barIndex);
  addPercussion(notes, session, percAmt, rng, isFill, mode, ctx.intensity, world, section);
  addMelody(notes, voicing, session, ctx, section, density, rng);
  addArp(notes, voicing, session, density, rng, ctx.combo, section, ctx.intensity);
  if (ctx.pickupContour && ctx.pickupContour.length >= 3 && rng.chance(0.3 + Math.min(0.4, ctx.combo / 28))) {
    addPickupEcho(notes, voicing, session, ctx.pickupContour, rng);
  }
  const wantCounter =
    section === "PEAK" ||
    (section === "BUILD" && ctx.intensity > 0.45) ||
    (section === "B" && ctx.combo >= 12 && ctx.intensity > 0.55);
  if (wantCounter && rng.chance(0.82)) {
    addCounter(notes, voicing, session, ctx, rng);
  }

  return {
    barIndex: ctx.barIndex,
    section,
    chord: voicing,
    notes: notes.filter((n) => Number.isFinite(n.midi) && n.velocity > 0 && n.durationTicks > 0),
    isFill,
  };
}

function addPad(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  density: number,
  _space: number,
  section: SectionId,
  intensity: number,
  world: SessionIdentity["themeId"],
) {
  const vel = clamp01(
    0.84 +
      density * 0.14 +
      (section === "PEAK" ? 0.06 : 0) +
      (world === "glaciar" ? 0.06 : 0),
  );
  const hold = world === "glaciar" || section === "RECOVERY" ? 18 : 16;
  const count = section === "INTRO" && intensity < 0.28 ? 2 : 3;
  const tones = voicing.midi.slice(0, count);
  for (let i = 0; i < tones.length; i++) {
    notes.push({
      tick: 0,
      durationTicks: hold,
      midi: tones[i]!,
      velocity: vel * (i === 0 ? 1 : i === 1 ? 0.9 : 0.78),
      voice: "pad",
      pan: (i / Math.max(1, tones.length - 1) - 0.5) * 0.48,
    });
  }
  if ((section === "PEAK" || (world === "eclipse" && intensity >= 0.62 && section !== "INTRO")) && tones[0]) {
    notes.push({
      tick: 0,
      durationTicks: hold,
      midi: Math.max(36, tones[0] - 12),
      velocity: vel * 0.62,
      voice: "pad",
      pan: 0,
    });
  }
}

function addBass(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  density: number,
  rng: ReturnType<typeof createPrng>,
  section: SectionId,
  pulse: number,
  intensity: number,
) {
  const useAlt = (section === "A_VARIATION" || section === "B" || intensity > 0.55) && session.theme.bassPatterns[1];
  const pattern = (useAlt ? session.theme.bassPatterns[1] : session.theme.bassPatterns[0])!;
  const steps = pattern.steps;
  const root = Math.max(36, voicing.bassMidi);
  const fifth = nearestMidi((voicing.pitchClasses[2] ?? (root + 7)) % 12, root + 7);
  const third = nearestMidi((voicing.pitchClasses[1] ?? root) % 12, root + 4);
  const octave = Math.min(51, root + 12);
  const approach = nearestScaleMidi(root - 2, session.tonicPc, session.scale);
  const driving = session.themeId === "durazno" || session.themeId === "eclipse";

  if (section === "INTRO" && intensity < 0.28 && !driving) {
    notes.push({ tick: 0, durationTicks: 15, midi: root, velocity: 0.92, voice: "bass" });
    notes.push({ tick: 8, durationTicks: 6, midi: fifth, velocity: 0.72, voice: "bass" });
    return;
  }

  for (let tick = 0; tick < TICKS_PER_BAR; tick++) {
    const code = steps[tick % steps.length] ?? 0;
    if (code === 0) continue;
    if (!driving && density < 0.32 && tick % 8 !== 0) continue;
    if (!driving && pulse < 0.5 && tick % 4 !== 0 && code !== 1) continue;
    if (section === "RECOVERY" && tick % 8 !== 0) continue;
    let midi = root;
    if (code === 2) midi = fifth;
    else if (code === 3) midi = approach;
    else if (code === 4) midi = octave;
    else if (code === 5) midi = third;
    notes.push({
      tick,
      durationTicks: code === 1 && tick % 4 === 0 ? 5 : 3,
      midi: clampMidi(midi),
      velocity: 0.86 + (tick === 0 ? 0.1 : 0) * pulse,
      voice: "bass",
    });
  }
}

function addPulse(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  density: number,
  section: SectionId,
  intensity: number,
) {
  if (section === "TRANSITION") return;
  const world = session.themeId;
  if (section === "RECOVERY" && world !== "durazno") {
    notes.push({
      tick: 0,
      durationTicks: 4,
      midi: nearestMidi((voicing.pitchClasses[2] ?? voicing.rootMidi) % 12, session.theme.melodyRegister[0] - 3),
      velocity: 0.42,
      voice: world === "glaciar" ? "bell" : "pluck",
      pan: -0.18,
    });
    return;
  }
  if (intensity < 0.12 && world === "menta") return;
  const fifth = nearestMidi((voicing.pitchClasses[2] ?? voicing.rootMidi) % 12, session.theme.melodyRegister[0] - 5);
  const step = world === "lavanda" ? 3 : world === "glaciar" ? 8 : 4;
  const vel = 0.5 + intensity * 0.22 + (world === "durazno" ? 0.1 : 0);
  for (let tick = 0; tick < 16; tick += step) {
    notes.push({
      tick,
      durationTicks: world === "glaciar" ? 4 : 2,
      midi: fifth,
      velocity: vel,
      voice: world === "glaciar" ? "bell" : world === "lavanda" ? "arp" : world === "eclipse" ? "pluck" : "pluck",
      pan: tick % 8 === 0 ? -0.24 : 0.24,
    });
  }
}

function addShimmer(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  world: SessionIdentity["themeId"],
  section: SectionId,
  intensity: number,
  barIndex: number,
) {
  if (section === "TRANSITION") return;
  const top = Math.min(96, (voicing.midi[voicing.midi.length - 1] ?? voicing.rootMidi + 12) + (world === "glaciar" ? 12 : 7));
  if (world === "glaciar") {
    notes.push({
      tick: 0,
      durationTicks: 12,
      midi: top,
      velocity: 0.7 + (section === "PEAK" ? 0.1 : 0),
      voice: "bell",
      pan: 0.32,
    });
    if (section !== "INTRO" && section !== "RECOVERY") {
      notes.push({
        tick: 8,
        durationTicks: 6,
        midi: Math.max(72, top - 7),
        velocity: 0.52,
        voice: "bell",
        pan: -0.28,
      });
    }
    return;
  }
  if (world === "lavanda" && (barIndex % 2 === 0 || intensity > 0.4)) {
    notes.push({
      tick: 3,
      durationTicks: 4,
      midi: top,
      velocity: 0.48,
      voice: "bell",
      pan: 0.4,
    });
  }
  if (world === "menta" && section !== "INTRO" && barIndex % 4 === 0) {
    notes.push({
      tick: 8,
      durationTicks: 6,
      midi: Math.min(88, voicing.rootMidi + 19),
      velocity: 0.46,
      voice: "bell",
      pan: 0.2,
    });
  }
}

function addPercussion(
  notes: ScoreNote[],
  session: SessionIdentity,
  percAmt: number,
  rng: ReturnType<typeof createPrng>,
  isFill: boolean,
  mode: ReturnType<typeof modeModifiers>,
  intensity: number,
  world: SessionIdentity["themeId"],
  section: SectionId,
) {
  if (section === "TRANSITION") return;
  const pattern = session.theme.percPatterns[0]!;
  const floor =
    world === "durazno" || world === "eclipse"
      ? 0.42
      : world === "glaciar"
        ? 0.24
        : world === "lavanda"
          ? 0.3
          : 0.26;
  const amount = Math.max(floor, percAmt);
  if (section === "RECOVERY") {
    notes.push({ tick: 0, durationTicks: 2, midi: 84, velocity: 0.55, voice: "click" });
    if (world === "glaciar" || world === "lavanda") {
      notes.push({ tick: 8, durationTicks: 2, midi: 91, velocity: 0.5, voice: "bell" });
    }
    if (world === "durazno" || world === "eclipse") {
      notes.push({ tick: 0, durationTicks: 3, midi: 36, velocity: 0.7, voice: "kick" });
      notes.push({ tick: 8, durationTicks: 2, midi: 48, velocity: 0.5, voice: "snare" });
    }
    return;
  }

  const voiceFor = (kind: PercHitKind): VoiceName => {
    if (kind === "kick") return "kick";
    if (kind === "snare") return "snare";
    if (kind === "hat" || kind === "hatOpen") return "hat";
    return "click";
  };

  const place = (kind: PercHitKind, tick: number, step: number) => {
    if (step <= 0) return;
    const threshold = kind === "hat" ? 0.1 : kind === "kick" ? 0.03 : 0.12;
    if (amount < threshold && step < 2 && world !== "durazno" && world !== "eclipse") return;
    if (kind === "hat" && intensity < 0.18 && world === "menta") return;
    if (kind === "hat" && section === "INTRO" && intensity < 0.35 && world !== "durazno") return;
    notes.push({
      tick,
      durationTicks: kind === "kick" ? 3 : 1,
      midi: kind === "kick" ? 36 : kind === "snare" ? 48 : kind === "click" ? 86 : 80,
      velocity: (step >= 2 ? 0.96 : 0.72) * (kind === "hat" ? Math.max(0.48, amount * mode.pulse) : amount),
      voice: voiceFor(kind),
    });
  };

  for (let tick = 0; tick < TICKS_PER_BAR; tick++) {
    place("kick", tick, pattern.kick[tick] ?? 0);
    place("snare", tick, pattern.snare[tick] ?? 0);
    if (intensity >= 0.18 || world === "durazno" || world === "eclipse") {
      place("hat", tick, pattern.hat[tick] ?? 0);
    }
    place("click", tick, pattern.click[tick] ?? 0);
  }

  if (isFill || (section === "BUILD" && rng.chance(0.62)) || (section === "PEAK" && rng.chance(0.45))) {
    for (let tick = 12; tick < 16; tick++) {
      notes.push({
        tick,
        durationTicks: 1,
        midi: 48 + (tick % 2) * 12,
        velocity: 0.7 + (tick - 12) * 0.08,
        voice: tick % 2 === 0 ? "snare" : "click",
      });
    }
  }
}

function addMelody(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  ctx: ComposeContext,
  section: SectionId,
  density: number,
  rng: ReturnType<typeof createPrng>,
) {
  if (section === "TRANSITION") return;
  const phraseBar = ctx.barIndex % 4;
  const signature = session.motifs[0]!;
  const secondary = session.motifs[1] ?? signature;
  const useSecondary = section === "B" || (section === "A_VARIATION" && phraseBar >= 2);
  let motif = useSecondary ? secondary : signature;

  if (section === "INTRO") {
    const cut = phraseBar === 0 ? 3 : signature.contour.length;
    motif = {
      ...signature,
      contour: signature.contour.slice(0, cut),
      rhythm: signature.rhythm.slice(0, cut),
      rests: signature.rests.slice(0, cut),
      accents: signature.accents.slice(0, cut),
    };
  } else if (section === "RECOVERY" && phraseBar % 2 === 1) {
    return;
  } else if (ctx.intensity < 0.14 && phraseBar === 3) {
    return;
  } else if (rng.chance(session.theme.restBias * 0.22 * (1.05 - density))) {
    return;
  }

  const variation = section === "A" && phraseBar === 0 ? "prime" : pickVariation(ctx.barIndex, rng);
  const realizedMotif = variation === "prime" ? motif : varyMotif(motif, variation, rng);
  const register = shiftRegister(session.theme.melodyRegister, ctx.combo, ctx.barIndex, section);
  const voice: VoiceName =
    session.themeId === "glaciar"
      ? "bell"
      : session.themeId === "durazno"
        ? "pluck"
        : section === "PEAK" || density > 0.7
          ? "lead"
          : "lead";
  const realized = realizeMotif({
    motif: realizedMotif,
    tonicPc: session.tonicPc,
    scale: session.scale,
    chord: voicing,
    register,
    startTick: phraseBar === 1 && section !== "INTRO" ? 2 : 0,
    voice,
    velocity: 0.86 + density * 0.14,
  });
  for (const note of realized) {
    if (note.tick >= TICKS_PER_BAR) continue;
    notes.push(note);
  }
}

function addCounter(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  ctx: ComposeContext,
  rng: ReturnType<typeof createPrng>,
) {
  const motif = varyMotif(session.motifs[0]!, "response", rng);
  const register = shiftRegister(
    [session.theme.melodyRegister[0] + 5, session.theme.melodyRegister[1] + 4],
    ctx.combo,
    ctx.barIndex,
    "PEAK",
  );
  const realized = realizeMotif({
    motif,
    tonicPc: session.tonicPc,
    scale: session.scale,
    chord: voicing,
    register,
    startTick: 8,
    voice: "bell",
    velocity: 0.62,
  });
  notes.push(...realized.filter((n) => n.tick < TICKS_PER_BAR));
}

function addArp(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  density: number,
  rng: ReturnType<typeof createPrng>,
  combo: number,
  section: SectionId,
  intensity: number,
) {
  if (section === "RECOVERY" || section === "TRANSITION") return;
  if (section === "INTRO" && intensity < 0.35) return;
  const world = session.themeId;
  if (world !== "lavanda" && world !== "eclipse" && intensity < 0.22) return;
  if (world !== "lavanda" && density < 0.32 && intensity < 0.38) return;
  if (world === "durazno" && intensity < 0.55 && section !== "BUILD" && section !== "PEAK") return;
  const ticks = session.theme.arpTicks;
  const tones = chordTonesMidi(voicing, [session.theme.melodyRegister[0] - 5, session.theme.melodyRegister[1] - 4]);
  if (tones.length === 0) return;
  const dense = combo >= 8 || intensity > 0.58 || section === "PEAK" || section === "BUILD" || world === "lavanda";
  const used = dense ? ticks : ticks.filter((_, i) => i % 2 === 0 || ticks.length <= 4);
  let dir = 1;
  let idx = rng.nextInt(tones.length);
  const vel = 0.54 + density * 0.22 + (world === "lavanda" ? 0.08 : 0);
  for (const tick of used) {
    notes.push({
      tick,
      durationTicks: 2,
      midi: tones[idx] ?? tones[0]!,
      velocity: vel,
      voice: world === "glaciar" || world === "lavanda" ? "bell" : "pluck",
      pan: ((tick % 8) / 8 - 0.5) * 0.5,
    });
    idx += dir;
    if (idx >= tones.length || idx < 0) {
      dir *= -1;
      idx = Math.max(0, Math.min(tones.length - 1, idx + dir));
    }
  }
}

function addPickupEcho(
  notes: ScoreNote[],
  voicing: ChordVoicing,
  session: SessionIdentity,
  contour: number[],
  rng: ReturnType<typeof createPrng>,
) {
  const fragment = contour.slice(-4);
  let tick = 8;
  for (const midi of fragment) {
    let fitted = midi;
    if (!isChordTone(fitted, voicing)) {
      fitted = nearestScaleMidi(fitted, session.tonicPc, session.scale);
    }
    notes.push({
      tick,
      durationTicks: 2,
      midi: clampMidi(fitted),
      velocity: 0.6,
      voice: "bell",
    });
    tick += rng.pick([2, 2, 4]);
    if (tick >= 16) break;
  }
}

function shiftRegister(
  register: [number, number],
  combo: number,
  barIndex: number,
  section: SectionId,
): [number, number] {
  const comboLift = Math.min(7, Math.floor(combo / 10));
  const cycleLift = barIndex % 32 >= 24 ? 3 : 0;
  const sectionLift = section === "B" ? 3 : section === "PEAK" ? 5 : section === "RECOVERY" ? -2 : 0;
  return [register[0] + comboLift + cycleLift + sectionLift, register[1] + comboLift + cycleLift + sectionLift];
}

export function choosePickupMidi(options: {
  voicing: ChordVoicing;
  tonicPc: number;
  scale: import("../core/types.ts").ScaleName;
  combo: number;
  strongBeat: boolean;
  rng: ReturnType<typeof createPrng>;
}): number {
  const { voicing, combo, strongBeat, rng } = options;
  const register: [number, number] = combo >= 20 ? [79, 96] : combo >= 8 ? [72, 88] : [67, 84];
  const pool = strongBeat || combo < 4
    ? chordTonesMidi(voicing, register)
    : [
        ...chordTonesMidi(voicing, register),
        nearestScaleMidi(voicing.rootMidi + 2, options.tonicPc, options.scale) + 12,
      ];
  const chosen = pool.length ? rng.pick(pool) : voicing.rootMidi + 12;
  return clampMidi(chosen);
}
