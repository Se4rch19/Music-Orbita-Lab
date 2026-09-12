import { createPrng, type Prng } from "../core/prng.ts";
import { pcName } from "../core/pitch.ts";
import type {
  ChordSymbol,
  ChordVoicing,
  CompositionPlanJson,
  GameMode,
  Motif,
  PlanetMusicProfile,
  PlanetMusicalDNA,
  ScaleName,
  SectionId,
  WorldThemeDefinition,
} from "../core/types.ts";
import { SECTION_ORDER } from "../core/types.ts";
import { chordKey, formatChord, voiceChord } from "../theory/chords.ts";
import { flattenProgression, generateProgression } from "../theory/harmony.ts";
import { CURATED_THEMES } from "../themes/catalog.ts";
import { generatePlanetDna, themeFromDna, campaignDna } from "./dna.ts";
import type { OrbitaThemeId } from "../core/types.ts";

export type SessionIdentity = {
  seed: string;
  variationSeed: string;
  themeId: OrbitaThemeId;
  theme: WorldThemeDefinition;
  tempo: number;
  tonicPc: number;
  scale: ScaleName;
  motifs: Motif[];
  progressions: Record<SectionId, ChordSymbol[]>;
  sectionSequence: { id: SectionId; bars: number }[];
  profile?: PlanetMusicProfile;
  dna: PlanetMusicalDNA;
  identityRng: Prng;
  variationRng: Prng;
};

const SECTION_BARS: Record<SectionId, number> = {
  INTRO: 4,
  A: 8,
  A_VARIATION: 8,
  B: 8,
  BUILD: 4,
  PEAK: 8,
  RECOVERY: 8,
  TRANSITION: 2,
};

export function createSession(options: {
  themeId: OrbitaThemeId;
  seed: string;
  variationSeed?: string;
  profile?: PlanetMusicProfile;
}): SessionIdentity {
  const seed = options.seed || "ORB-DEFAULT";
  const variationSeed = options.variationSeed ?? `${seed}::v0`;
  const identityRng = createPrng(seed);
  const variationRng = createPrng(variationSeed);

  let theme: WorldThemeDefinition;
  let tempo: number;
  let tonicPc: number;
  let scale: ScaleName;
  let dna: PlanetMusicalDNA;
  let motifs: Motif[];

  if (options.themeId === "procedural") {
    const profile =
      options.profile ??
      ({
        seed,
        biome: "mixed",
        mood: "mysterious",
        intensity: 0.45,
        temperature: 0.5,
        luminosity: 0.55,
        danger: 0.25,
        anomaly: 0.4,
      } satisfies PlanetMusicProfile);
    dna = generatePlanetDna(profile);
    theme = themeFromDna(dna);
    tempo = dna.tempo;
    tonicPc = dna.tonic;
    scale = dna.mode;
    motifs = theme.motifs.map((motif) => ({ ...motif, contour: [...motif.contour] }));
  } else {
    theme = structuredClone(CURATED_THEMES[options.themeId]);
    tempo = Math.round(identityRng.nextRange(theme.tempoRange[0], theme.tempoRange[1]));
    tonicPc = identityRng.pick(theme.tonicPcs);
    scale = identityRng.pick(theme.scales);
    motifs = theme.motifs.map((motif) => ({ ...motif, contour: [...motif.contour] }));
    dna = campaignDna({
      themeId: options.themeId,
      seed,
      tempo,
      tonic: tonicPc,
      scale,
      motif: motifs[0]!,
      timbre: theme.timbre,
    });
  }

  const progressions = {} as Record<SectionId, ChordSymbol[]>;
  for (const section of uniqueSections()) {
    const len = theme.preferredProgressionLengths[section === "INTRO" || section === "BUILD" ? 2 : 0] ?? 8;
    const bars = SECTION_BARS[section];
    const generated = generateProgression(
      theme.progressionGraph,
      Math.min(bars, len || bars),
      identityRng.fork(`prog:${section}`),
      theme.chordVocab,
    );
    progressions[section] = flattenProgression(generated, bars);
  }

  const sectionSequence = SECTION_ORDER.map((id) => ({ id, bars: SECTION_BARS[id] }));

  return {
    seed,
    variationSeed,
    themeId: options.themeId,
    theme,
    tempo,
    tonicPc,
    scale,
    motifs,
    progressions,
    sectionSequence,
    profile: options.profile,
    dna,
    identityRng,
    variationRng,
  };
}

function uniqueSections(): SectionId[] {
  return ["INTRO", "A", "A_VARIATION", "B", "BUILD", "PEAK", "RECOVERY", "TRANSITION"];
}

export function sectionAtBar(session: SessionIdentity, barIndex: number): { id: SectionId; localBar: number } {
  const cycle = session.sectionSequence.reduce((sum, s) => sum + s.bars, 0) || 1;
  let cursor = ((barIndex % cycle) + cycle) % cycle;
  for (const section of session.sectionSequence) {
    if (cursor < section.bars) return { id: section.id, localBar: cursor };
    cursor -= section.bars;
  }
  return { id: "A", localBar: 0 };
}

export function chordAtBar(
  session: SessionIdentity,
  section: SectionId,
  localBar: number,
  previous?: number[],
): ChordVoicing {
  const seq = session.progressions[section] ?? session.progressions.A;
  const symbol = seq[localBar % seq.length] ?? session.theme.chordVocab[0]!;
  return voiceChord({
    tonicPc: session.tonicPc,
    scale: session.scale,
    symbol,
    previous,
    lowMidi: session.theme.padRegister[0],
    highMidi: session.theme.padRegister[1],
    bassOctave: 2,
  });
}

export function modeModifiers(mode: GameMode): {
  density: number;
  percussion: number;
  tension: number;
  space: number;
  pulse: number;
  instability: number;
} {
  switch (mode) {
    case "calm":
      return { density: 0.55, percussion: 0.25, tension: 0.35, space: 1.35, pulse: 0.55, instability: 0.1 };
    case "daily":
      return { density: 1, percussion: 1, tension: 0.9, space: 0.95, pulse: 1.15, instability: 0.12 };
    case "infinite":
      return { density: 1, percussion: 0.95, tension: 1, space: 1.05, pulse: 1, instability: 0.2 };
    case "anomaly":
      return { density: 1.05, percussion: 1.05, tension: 1.2, space: 1.1, pulse: 0.9, instability: 0.7 };
    default:
      return { density: 1, percussion: 1, tension: 1, space: 1, pulse: 1, instability: 0.15 };
  }
}

export function exportPlan(session: SessionIdentity): CompositionPlanJson {
  const progressions = uniqueSections().map((section) => ({
    section,
    chords: (session.progressions[section] ?? []).map((symbol) =>
      `${formatChord(session.tonicPc, session.scale, symbol)} (${chordKey(symbol)})`,
    ),
  }));

  return {
    seed: session.seed,
    variationSeed: session.variationSeed,
    theme: session.themeId,
    tempo: session.tempo,
    tonicPc: session.tonicPc,
    keyName: pcName(session.tonicPc),
    scale: session.scale,
    motifs: session.motifs,
    progressions,
    sections: session.sectionSequence,
    instrumentConfiguration: session.theme.timbre,
    planetProfile: session.profile,
    dna: session.dna,
    generatedAt: new Date().toISOString(),
  };
}
