import { createPrng, type Prng } from "../core/prng.ts";
import { pcName } from "../core/pitch.ts";
import type {
  CadenceKind,
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
import { flattenProgression } from "../theory/harmony.ts";
import { CURATED_THEMES } from "../themes/catalog.ts";
import { generatePlanetDna, themeFromDna, campaignDna } from "./dna.ts";
import type { OrbitaThemeId } from "../core/types.ts";
import { grammarFor, pickFamilyForSection, SECTION_BARS, sectionAtBarFromSequence } from "./grammar.ts";
import { phrasePlanFor, summarizePhrase } from "./phrase.ts";

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
  grammarId: string;
  familyBySection: Partial<Record<SectionId, string>>;
  cadenceBySection: Partial<Record<SectionId, CadenceKind>>;
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

  const grammar = grammarFor(options.themeId === "procedural" ? dna.progressionFamily : options.themeId);
  const progressions = {} as Record<SectionId, ChordSymbol[]>;
  const familyBySection: Partial<Record<SectionId, string>> = {};
  const cadenceBySection: Partial<Record<SectionId, CadenceKind>> = {};
  for (const section of uniqueSections()) {
    const bars = SECTION_BARS[section];
    const family = pickFamilyForSection(grammar, section, identityRng.fork(`fam:${section}`));
    progressions[section] = flattenProgression(family.chords, bars);
    familyBySection[section] = family.id;
    cadenceBySection[section] = family.cadence;
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
    grammarId: grammar.id,
    familyBySection,
    cadenceBySection,
  };
}

function uniqueSections(): SectionId[] {
  return ["INTRO", "A", "A_VARIATION", "B", "BUILD", "PEAK", "RECOVERY", "TRANSITION"];
}

export function sectionAtBar(session: SessionIdentity, barIndex: number): { id: SectionId; localBar: number } {
  return sectionAtBarFromSequence(session.sectionSequence, barIndex);
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
    grammarId: session.grammarId,
    families: uniqueSections().map((section) => ({
      section,
      familyId: session.familyBySection[section] ?? "",
      cadence: session.cadenceBySection[section] ?? "open",
    })),
    phrases: collectPhrases(session),
  };
}

function collectPhrases(session: SessionIdentity) {
  const out = [];
  let bar = 0;
  const seen = new Set<number>();
  for (const section of session.sectionSequence) {
    const plan = phrasePlanFor(session, bar, 0.5, 0);
    if (!seen.has(plan.startBar)) {
      seen.add(plan.startBar);
      out.push(summarizePhrase(session, plan, 0));
    }
    bar += section.bars;
  }
  return out;
}
