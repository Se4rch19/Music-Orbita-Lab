import type { Prng } from "../core/prng.ts";
import type {
  BassRole,
  CadenceKind,
  LabLayer,
  MelodicArc,
  OrbitaThemeId,
  RhythmPersonality,
  SectionId,
} from "../core/types.ts";
import { chord } from "../themes/helpers.ts";
import type { ChordSymbol } from "../core/types.ts";

export type ProgressionFamily = {
  id: string;
  purpose: string;
  sectionFit: SectionId[];
  chords: ChordSymbol[];
  cadence: CadenceKind;
  destinations: string[];
};

export type RhythmGrid = {
  id: string;
  strong: number[];
  secondary: number[];
  offbeat: number[];
  syncopation: number[];
};

export type RegisterZones = {
  bass: [number, number];
  pad: [number, number];
  ostinato: [number, number];
  motif: [number, number];
  counter: [number, number];
  pickup: [number, number];
};

export type InstrumentPalette = {
  pad: boolean;
  pulse: boolean;
  pluck: boolean;
  lead: boolean;
  bell: boolean;
  arp: boolean;
  bass: boolean;
  kick: boolean;
  snare: boolean;
  hat: boolean;
};

export type CompositionGrammar = {
  id: string;
  world: Exclude<OrbitaThemeId, "procedural">;
  families: ProgressionFamily[];
  dissonanceBudget: number;
  harmonicRhythmBars: Partial<Record<SectionId, number>>;
  palette: InstrumentPalette;
  rhythmGrid: RhythmGrid;
  registerZones: RegisterZones;
  defaultArc: MelodicArc;
  defaultBass: BassRole;
  ostinatoTicks: number[];
  restBars: number[];
};

const ALL: SectionId[] = ["INTRO", "A", "A_VARIATION", "B", "BUILD", "PEAK", "RECOVERY", "TRANSITION"];

function fam(
  id: string,
  purpose: string,
  sectionFit: SectionId[],
  chords: ChordSymbol[],
  cadence: CadenceKind,
  destinations: string[],
): ProgressionFamily {
  return { id, purpose, sectionFit, chords, cadence, destinations };
}

const MENTA_FAMILIES: ProgressionFamily[] = [
  fam(
    "horizon-open",
    "Tonic horizon that leaves the door open",
    ["A", "A_VARIATION", "B"],
    [chord(1, "add9", 0, 2), chord(4, "maj7", 0, 2), chord(2, "sus2", 0, 2), chord(1, "add9", 0, 2)],
    "open",
    ["lift-half", "home-resolved"],
  ),
  fam(
    "lift-half",
    "Rises to a suspended dominant and waits",
    ["A_VARIATION", "B", "BUILD"],
    [chord(1, "add9", 0, 2), chord(6, "sus4", 0, 2), chord(4, "maj7", 0, 2), chord(5, "sus2", 0, 2)],
    "half",
    ["return-home", "horizon-open"],
  ),
  fam(
    "home-resolved",
    "Clear return to tonic after a short journey",
    ["A", "PEAK", "RECOVERY"],
    [chord(1, "maj7", 0, 2), chord(2, "sus2", 0, 2), chord(4, "maj7", 0, 2), chord(1, "add9", 0, 2)],
    "resolved",
    ["horizon-open", "wonder-slow"],
  ),
  fam(
    "wonder-slow",
    "Held tonic, then a gentle lift",
    ["INTRO", "B", "RECOVERY"],
    [chord(1, "add9", 0, 4), chord(3, "min7", 0, 2), chord(4, "maj7", 0, 2)],
    "open",
    ["horizon-open", "return-home"],
  ),
  fam(
    "return-home",
    "Cadential arrival used at climax and close",
    ["BUILD", "PEAK", "RECOVERY"],
    [chord(4, "maj7", 0, 2), chord(5, "sus2", 0, 2), chord(1, "add9", 0, 4)],
    "resolved",
    ["home-resolved", "horizon-open"],
  ),
];

const DURAZNO_FAMILIES: ProgressionFamily[] = [
  fam(
    "groove-home",
    "Warm I–IV–V loop with a landing",
    ["A", "A_VARIATION", "PEAK"],
    [chord(1, "maj6", 0, 2), chord(4, "add9", 0, 2), chord(5, "sus4", 0, 2), chord(1, "maj6", 0, 2)],
    "resolved",
    ["bounce-half", "playful-bVII"],
  ),
  fam(
    "bounce-half",
    "Faster harmonic rhythm that stops on V",
    ["A_VARIATION", "B", "BUILD"],
    [chord(1, "add9", 0, 1), chord(2, "min7", 0, 1), chord(4, "maj6", 0, 2), chord(5, "sus4", 0, 2), chord(1, "maj6", 0, 2)],
    "half",
    ["groove-home", "land-resolved"],
  ),
  fam(
    "playful-bVII",
    "Mixolydian side-step, still anchored",
    ["B", "A"],
    [chord(1, "maj6", 0, 2), chord(7, "min7", -1, 2), chord(4, "add9", 0, 2), chord(1, "maj6", 0, 2)],
    "open",
    ["groove-home", "drive-up"],
  ),
  fam(
    "drive-up",
    "Builds toward a half cadence",
    ["BUILD", "B"],
    [chord(1, "add9", 0, 2), chord(3, "min7", 0, 2), chord(2, "min7", 0, 2), chord(5, "sus4", 0, 2)],
    "half",
    ["land-resolved", "groove-home"],
  ),
  fam(
    "land-resolved",
    "IV–V–I arrival",
    ["PEAK", "RECOVERY", "INTRO"],
    [chord(4, "add9", 0, 2), chord(5, "sus4", 0, 2), chord(1, "maj6", 0, 4)],
    "resolved",
    ["groove-home"],
  ),
];

const LAVANDA_FAMILIES: ProgressionFamily[] = [
  fam(
    "pedal-i",
    "Held modal tonic, one color at a time",
    ["INTRO", "A", "RECOVERY"],
    [chord(1, "minadd9", 0, 4), chord(4, "maj7", 0, 4)],
    "open",
    ["float-vii", "suspended-v"],
  ),
  fam(
    "float-vii",
    "Geometric drift around VII and VI",
    ["A", "A_VARIATION", "B"],
    [chord(1, "minadd9", 0, 2), chord(7, "sus2", 0, 2), chord(6, "maj7", 0, 2), chord(1, "minadd9", 0, 2)],
    "open",
    ["geo-sus", "pedal-i"],
  ),
  fam(
    "geo-sus",
    "Suspended add6 color, then home",
    ["A_VARIATION", "B", "PEAK"],
    [chord(1, "sus2add6", 0, 2), chord(4, "maj7", 0, 2), chord(3, "maj7", 0, 2), chord(1, "minadd9", 0, 2)],
    "resolved",
    ["pedal-i", "drift-open"],
  ),
  fam(
    "suspended-v",
    "Long V pedal that finally yields",
    ["BUILD", "PEAK", "B"],
    [chord(5, "sus4", 0, 4), chord(1, "minadd9", 0, 4)],
    "suspended",
    ["geo-sus", "pedal-i"],
  ),
  fam(
    "drift-open",
    "Leaves the door ajar on VII",
    ["B", "A_VARIATION"],
    [chord(2, "min7", 0, 2), chord(5, "sus4", 0, 2), chord(4, "maj7", 0, 2), chord(7, "sus2", 0, 2)],
    "open",
    ["float-vii", "pedal-i"],
  ),
];

const GLACIAR_FAMILIES: ProgressionFamily[] = [
  fam(
    "ice-pedal",
    "Four bars of tonic ice, then relative major light",
    ["INTRO", "A", "RECOVERY"],
    [chord(1, "minadd9", 0, 4), chord(6, "maj7", 0, 4)],
    "open",
    ["crystal-arch", "long-iii"],
  ),
  fam(
    "crystal-arch",
    "Slow i–iv–VI–i arch",
    ["A", "A_VARIATION", "B"],
    [chord(1, "minadd9", 0, 2), chord(4, "min7", 0, 2), chord(6, "maj7", 0, 2), chord(1, "minadd9", 0, 2)],
    "resolved",
    ["ice-pedal", "thaw"],
  ),
  fam(
    "long-iii",
    "Very slow two-chord thought",
    ["B", "RECOVERY"],
    [chord(1, "min7", 0, 4), chord(3, "maj7", 0, 4)],
    "open",
    ["crystal-arch", "sparkle-pedal"],
  ),
  fam(
    "thaw",
    "iv–V–i arrival over a long tonic",
    ["BUILD", "PEAK", "A_VARIATION"],
    [chord(4, "min7", 0, 2), chord(5, "sus4", 0, 2), chord(1, "minadd9", 0, 4)],
    "resolved",
    ["ice-pedal"],
  ),
  fam(
    "sparkle-pedal",
    "Single chord — melody and bells do the work",
    ["INTRO", "RECOVERY", "A"],
    [chord(1, "minadd9", 0, 8)],
    "open",
    ["crystal-arch", "ice-pedal"],
  ),
];

const ECLIPSE_FAMILIES: ProgressionFamily[] = [
  fam(
    "phrygian-home",
    "Present bII, then insist on i",
    ["A", "INTRO", "RECOVERY"],
    [chord(1, "min", 0, 2), chord(2, "maj", -1, 2), chord(1, "min", 0, 4)],
    "resolved",
    ["prepare-bii", "unleash"],
  ),
  fam(
    "prepare-bii",
    "Prepare the dark step, return home",
    ["A", "A_VARIATION", "B"],
    [chord(1, "min", 0, 2), chord(4, "min7", 0, 2), chord(2, "maj", -1, 2), chord(1, "min", 0, 2)],
    "resolved",
    ["unleash", "deceive"],
  ),
  fam(
    "unleash",
    "Dominant pressure, then release to i",
    ["BUILD", "PEAK"],
    [chord(2, "maj", -1, 2), chord(5, "dom7", 0, 2), chord(1, "min", 0, 2), chord(1, "minadd9", 0, 2)],
    "resolved",
    ["phrygian-home", "release-i"],
  ),
  fam(
    "deceive",
    "Walks away from tonic on purpose",
    ["B", "A_VARIATION"],
    [chord(1, "min", 0, 2), chord(2, "maj", -1, 2), chord(6, "min", 0, 2), chord(7, "maj", -1, 2)],
    "deceptive",
    ["unleash", "phrygian-home"],
  ),
  fam(
    "release-i",
    "Climactic V/bII collapse into i",
    ["PEAK", "RECOVERY"],
    [chord(5, "dom7", 0, 2), chord(2, "maj", -1, 2), chord(1, "min", 0, 4)],
    "resolved",
    ["phrygian-home"],
  ),
];

export const GRAMMARS: Record<Exclude<OrbitaThemeId, "procedural">, CompositionGrammar> = {
  menta: {
    id: "lydian-horizon",
    world: "menta",
    families: MENTA_FAMILIES,
    dissonanceBudget: 1,
    harmonicRhythmBars: { INTRO: 4, A: 2, A_VARIATION: 2, B: 2, BUILD: 2, PEAK: 2, RECOVERY: 4 },
    palette: {
      pad: true,
      pulse: true,
      pluck: true,
      lead: true,
      bell: true,
      arp: false,
      bass: true,
      kick: true,
      snare: false,
      hat: true,
    },
    rhythmGrid: { id: "air", strong: [0, 8], secondary: [4, 12], offbeat: [2, 6, 10, 14], syncopation: [] },
    registerZones: {
      bass: [36, 48],
      pad: [50, 72],
      ostinato: [55, 67],
      motif: [67, 84],
      counter: [74, 91],
      pickup: [79, 96],
    },
    defaultArc: "rise-peak-resolve",
    defaultBass: "pedal",
    ostinatoTicks: [0, 4, 8, 12],
    restBars: [3],
  },
  durazno: {
    id: "mixo-groove",
    world: "durazno",
    families: DURAZNO_FAMILIES,
    dissonanceBudget: 1,
    harmonicRhythmBars: { INTRO: 2, A: 2, A_VARIATION: 1, B: 2, BUILD: 1, PEAK: 2, RECOVERY: 2 },
    palette: {
      pad: true,
      pulse: true,
      pluck: true,
      lead: false,
      bell: false,
      arp: false,
      bass: true,
      kick: true,
      snare: true,
      hat: true,
    },
    rhythmGrid: { id: "groove", strong: [0, 8], secondary: [4, 12], offbeat: [6, 14], syncopation: [6, 11, 14] },
    registerZones: {
      bass: [36, 50],
      pad: [48, 67],
      ostinato: [52, 64],
      motif: [64, 81],
      counter: [76, 91],
      pickup: [76, 93],
    },
    defaultArc: "low-repeat-expand",
    defaultBass: "groove-cell",
    ostinatoTicks: [0, 4, 8, 12],
    restBars: [],
  },
  lavanda: {
    id: "dorian-geo",
    world: "lavanda",
    families: LAVANDA_FAMILIES,
    dissonanceBudget: 2,
    harmonicRhythmBars: { INTRO: 4, A: 2, A_VARIATION: 2, B: 2, BUILD: 4, PEAK: 2, RECOVERY: 4 },
    palette: {
      pad: true,
      pulse: true,
      pluck: false,
      lead: true,
      bell: true,
      arp: true,
      bass: true,
      kick: true,
      snare: false,
      hat: true,
    },
    rhythmGrid: { id: "displaced", strong: [0, 12], secondary: [6], offbeat: [3, 9, 15], syncopation: [3, 9] },
    registerZones: {
      bass: [37, 49],
      pad: [52, 76],
      ostinato: [60, 76],
      motif: [69, 88],
      counter: [55, 67],
      pickup: [81, 98],
    },
    defaultArc: "question-answer",
    defaultBass: "root-motion",
    ostinatoTicks: [0, 3, 6, 9, 12, 15],
    restBars: [5],
  },
  glaciar: {
    id: "aeolian-crystal",
    world: "glaciar",
    families: GLACIAR_FAMILIES,
    dissonanceBudget: 1,
    harmonicRhythmBars: { INTRO: 4, A: 4, A_VARIATION: 2, B: 4, BUILD: 2, PEAK: 2, RECOVERY: 4 },
    palette: {
      pad: true,
      pulse: false,
      pluck: false,
      lead: false,
      bell: true,
      arp: false,
      bass: true,
      kick: true,
      snare: false,
      hat: false,
    },
    rhythmGrid: { id: "crystal", strong: [0], secondary: [8], offbeat: [12], syncopation: [] },
    registerZones: {
      bass: [38, 50],
      pad: [55, 79],
      ostinato: [67, 79],
      motif: [72, 93],
      counter: [60, 72],
      pickup: [84, 98],
    },
    defaultArc: "sparse-bell",
    defaultBass: "pedal",
    ostinatoTicks: [0, 8],
    restBars: [1, 3, 5],
  },
  eclipse: {
    id: "phrygian-shadow",
    world: "eclipse",
    families: ECLIPSE_FAMILIES,
    dissonanceBudget: 3,
    harmonicRhythmBars: { INTRO: 2, A: 2, A_VARIATION: 2, B: 2, BUILD: 1, PEAK: 2, RECOVERY: 2 },
    palette: {
      pad: true,
      pulse: true,
      pluck: true,
      lead: true,
      bell: false,
      arp: true,
      bass: true,
      kick: true,
      snare: true,
      hat: true,
    },
    rhythmGrid: { id: "drive", strong: [0, 8], secondary: [4, 6, 12], offbeat: [2, 10], syncopation: [2, 6, 11] },
    registerZones: {
      bass: [36, 48],
      pad: [43, 67],
      ostinato: [48, 60],
      motif: [60, 79],
      counter: [72, 86],
      pickup: [72, 91],
    },
    defaultArc: "stable-tension-release",
    defaultBass: "root-motion",
    ostinatoTicks: [0, 4, 8, 12],
    restBars: [3],
  },
};

const FAMILY_ALIAS: Record<string, Exclude<OrbitaThemeId, "procedural">> = {
  "lydian-horizon": "menta",
  "mixo-groove": "durazno",
  "dorian-geo": "lavanda",
  "aeolian-crystal": "glaciar",
  "phrygian-shadow": "eclipse",
  "hybrid-orbit": "lavanda",
  menta: "menta",
  durazno: "durazno",
  lavanda: "lavanda",
  glaciar: "glaciar",
  eclipse: "eclipse",
};

export function grammarFor(id: OrbitaThemeId | string): CompositionGrammar {
  const world = FAMILY_ALIAS[id] ?? "lavanda";
  return GRAMMARS[world];
}

export function pickFamilyForSection(
  grammar: CompositionGrammar,
  section: SectionId,
  rng: Prng,
): ProgressionFamily {
  const fit = grammar.families.filter((family) => family.sectionFit.includes(section));
  const pool = fit.length ? fit : grammar.families;
  if (section === "A" || section === "INTRO") return pool[0]!;
  if (section === "PEAK") {
    const resolved = pool.find((family) => family.cadence === "resolved");
    return resolved ?? pool[0]!;
  }
  if (section === "RECOVERY") {
    const resolved = pool.find((family) => family.cadence === "resolved" || family.cadence === "open");
    return resolved ?? pool[0]!;
  }
  return rng.pick(pool);
}

export function dissonanceBudgetFor(grammar: CompositionGrammar, section: SectionId): number {
  const base = grammar.dissonanceBudget;
  if (section === "PEAK" || section === "BUILD") return Math.min(4, base + 1);
  if (section === "INTRO" || section === "RECOVERY" || section === "TRANSITION") return Math.max(0, base - 1);
  return base;
}

export function spaceWetFor(section: SectionId): number {
  switch (section) {
    case "INTRO":
      return 1.25;
    case "A":
      return 1;
    case "A_VARIATION":
      return 0.95;
    case "B":
      return 1.08;
    case "BUILD":
      return 1.18;
    case "PEAK":
      return 0.82;
    case "RECOVERY":
      return 1.32;
    case "TRANSITION":
      return 1.2;
    default:
      return 1;
  }
}

export function cadenceForSection(
  grammar: CompositionGrammar,
  section: SectionId,
  family: ProgressionFamily,
): CadenceKind {
  if (section === "INTRO") return "open";
  if (section === "BUILD") return "suspended";
  if (section === "PEAK") return family.cadence === "deceptive" ? "deceptive" : "resolved";
  if (section === "RECOVERY") return "resolved";
  if (section === "TRANSITION") return "open";
  return family.cadence;
}

export function motifStageFor(section: SectionId, phraseIndex: number): "prime" | "repeat" | "develop" | "transform" {
  if (section === "INTRO" || section === "RECOVERY") return "prime";
  if (section === "A" && phraseIndex <= 1) return "prime";
  if (section === "A_VARIATION") return "repeat";
  if (section === "A") return "develop";
  if (section === "B" || section === "BUILD") return "develop";
  if (section === "PEAK") return "transform";
  return "repeat";
}

export function defaultOrchestration(
  grammar: CompositionGrammar,
  section: SectionId,
  intensity: number,
): Record<LabLayer, boolean> {
  const peak = section === "PEAK";
  const intro = section === "INTRO";
  const rec = section === "RECOVERY";
  const build = section === "BUILD";
  return {
    harmony: true,
    bass: true,
    melody: !intro || intensity >= 0.22,
    counter: peak || (build && intensity > 0.5),
    arp: grammar.palette.arp && (peak || build || grammar.world === "lavanda"),
    percussion: !(rec && grammar.world === "glaciar" && intensity < 0.2),
    atmosphere: true,
    gameplay: true,
  };
}

export function rhythmPersonalityGrid(personality: RhythmPersonality): RhythmGrid {
  if (personality === "groove") return GRAMMARS.durazno.rhythmGrid;
  if (personality === "displaced") return GRAMMARS.lavanda.rhythmGrid;
  if (personality === "crystal") return GRAMMARS.glaciar.rhythmGrid;
  if (personality === "drive") return GRAMMARS.eclipse.rhythmGrid;
  return GRAMMARS.menta.rhythmGrid;
}

export const SECTION_BARS: Record<SectionId, number> = {
  INTRO: 4,
  A: 8,
  A_VARIATION: 8,
  B: 8,
  BUILD: 4,
  PEAK: 8,
  RECOVERY: 8,
  TRANSITION: 2,
};

export function phraseLengthFor(section: SectionId): number {
  return SECTION_BARS[section] <= 4 ? SECTION_BARS[section] : 8;
}

export function isStrongGridTick(grid: RhythmGrid, tick: number): boolean {
  const t = ((tick % 16) + 16) % 16;
  return grid.strong.includes(t);
}

export function sectionAtBarFromSequence(
  sequence: { id: SectionId; bars: number }[],
  barIndex: number,
): { id: SectionId; localBar: number } {
  const cycle = sequence.reduce((sum, s) => sum + s.bars, 0) || 1;
  let cursor = ((barIndex % cycle) + cycle) % cycle;
  for (const section of sequence) {
    if (cursor < section.bars) return { id: section.id, localBar: cursor };
    cursor -= section.bars;
  }
  return { id: "A", localBar: 0 };
}

export const ALL_SECTIONS = ALL;
