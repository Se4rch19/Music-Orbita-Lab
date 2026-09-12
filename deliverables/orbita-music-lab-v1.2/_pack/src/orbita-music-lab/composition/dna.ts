import { createPrng } from "../core/prng.ts";
import { clamp01, lerp } from "../core/pitch.ts";
import { MIX_PROFILES } from "../core/mix-profile.ts";
import type {
  BassPersonality,
  HarmonicColor,
  Motif,
  PercPattern,
  PlanetMood,
  PlanetMusicProfile,
  PlanetMusicalDNA,
  RhythmPersonality,
  ScaleName,
  WorldThemeDefinition,
} from "../core/types.ts";
import { DURAZNO } from "../themes/durazno.ts";
import { ECLIPSE } from "../themes/eclipse.ts";
import { GLACIAR } from "../themes/glaciar.ts";
import { LAVANDA } from "../themes/lavanda.ts";
import { MENTA } from "../themes/menta.ts";
import { bass, motif, perc } from "../themes/helpers.ts";

const MOOD_SCALES: Record<PlanetMood, ScaleName[]> = {
  calm: ["lydian", "majorPentatonic", "dorian"],
  hopeful: ["major", "lydian", "mixolydian"],
  mysterious: ["dorian", "lydian", "melodicMinor"],
  tense: ["phrygian", "harmonicMinor", "dorian"],
  dark: ["phrygian", "aeolian", "harmonicMinor"],
  energetic: ["mixolydian", "major", "dorian"],
};

const COLOR_FOR_MOOD: Record<PlanetMood, HarmonicColor[]> = {
  calm: ["luminous", "crystal"],
  hopeful: ["luminous", "warm"],
  mysterious: ["alien", "crystal"],
  tense: ["shadow", "hybrid"],
  dark: ["shadow", "hybrid"],
  energetic: ["warm", "luminous"],
};

const FAMILY_GRAPH: Record<string, WorldThemeDefinition> = {
  "lydian-horizon": MENTA,
  "mixo-groove": DURAZNO,
  "dorian-geo": LAVANDA,
  "aeolian-crystal": GLACIAR,
  "phrygian-shadow": ECLIPSE,
  "hybrid-orbit": LAVANDA,
};

function compatibleColor(profile: PlanetMusicProfile, rng: ReturnType<typeof createPrng>): HarmonicColor {
  const moodColors = COLOR_FOR_MOOD[profile.mood];
  if (profile.mood === "hopeful" && profile.biome === "lava") {
    return "hybrid";
  }
  if (profile.biome === "lava" || profile.biome === "storm" || profile.danger > 0.72) {
    return rng.weighted([
      { item: "shadow" as const, weight: 0.7 },
      { item: "hybrid" as const, weight: 0.3 },
    ]);
  }
  if (profile.biome === "glacial" || profile.biome === "crystal") {
    return rng.weighted([
      { item: "crystal" as const, weight: 0.65 },
      { item: "alien" as const, weight: 0.35 },
    ]);
  }
  if (profile.mood === "dark" && profile.luminosity > 0.7) {
    return "hybrid";
  }
  return rng.pick(moodColors);
}

function familyFor(color: HarmonicColor, energy: number): string {
  if (color === "warm") return energy > 0.55 ? "mixo-groove" : "lydian-horizon";
  if (color === "alien") return "dorian-geo";
  if (color === "crystal") return "aeolian-crystal";
  if (color === "shadow") return "phrygian-shadow";
  if (color === "hybrid") return "hybrid-orbit";
  return "lydian-horizon";
}

function bassPersonalityFor(
  profile: PlanetMusicProfile,
  energy: number,
  color: HarmonicColor,
): BassPersonality {
  if (profile.biome === "dead" || (color === "crystal" && energy < 0.4)) return "sparse";
  if (color === "shadow" || profile.biome === "lava") return energy > 0.55 ? "syncopated" : "pulse";
  if (color === "warm" || profile.mood === "energetic") return energy > 0.5 ? "walking" : "pulse";
  if (energy < 0.35) return "drone";
  return "pulse";
}

function rhythmPersonalityFor(
  profile: PlanetMusicProfile,
  energy: number,
  color: HarmonicColor,
): RhythmPersonality {
  if (color === "crystal") return "crystal";
  if (color === "alien") return "displaced";
  if (color === "shadow" || profile.biome === "storm") return "drive";
  if (color === "warm" || profile.mood === "energetic") return "groove";
  if (energy < 0.32) return "air";
  return energy > 0.7 ? "groove" : "air";
}

function motifFromDna(
  seed: string,
  color: HarmonicColor,
  energy: number,
  rng: ReturnType<typeof createPrng>,
): Motif {
  const length = 4 + rng.nextInt(4);
  const intervals =
    color === "shadow"
      ? [0, 1, 3, 4, 0]
      : color === "alien"
        ? [0, 3, 6, 4, 1, 4]
        : color === "crystal"
          ? [0, 4, 7, 4]
          : color === "warm"
            ? [0, 2, 0, 4, 2, 5]
            : color === "hybrid"
              ? [0, 3, 2, 6, 4]
              : [0, 4, 2, 7, 4];
  const contour: number[] = [];
  let idx = rng.nextInt(intervals.length);
  for (let i = 0; i < length; i++) {
    contour.push(intervals[idx % intervals.length]! + (energy > 0.7 && i === length - 1 ? 7 : 0));
    idx += rng.pick([1, 1, 2, -1]);
    if (idx < 0) idx = 0;
  }
  if (color === "shadow") contour[0] = 0;
  if (color === "luminous" && contour[1] !== undefined) contour[1] = 4;
  if (contour.length > 1 && color !== "shadow" && color !== "alien") {
    contour[contour.length - 1] = rng.pick([0, 4, 0]);
  }
  const rhythm = contour.map((_, i) => (i === 0 ? (energy > 0.55 ? 2 : 4) : rng.pick([2, 2, 4, 1])));
  const accents = contour.map((_, i) => i === 0 || (i === 2 && energy > 0.45));
  const rests = contour.map((_, i) => i === 1 && energy < 0.35 && color !== "warm");
  return motif(`${seed.slice(0, 12)}-core`, contour, rhythm, accents.map((v) => (v ? 1 : 0)), rests.map((v) => (v ? 1 : 0)));
}

const BASS: Record<BassPersonality, ReturnType<typeof bass>[]> = {
  drone: [bass([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), bass([1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0])],
  walking: [
    bass([1, 0, 0, 0, 1, 0, 3, 0, 2, 0, 0, 0, 1, 0, 5, 0]),
    bass([1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 3, 0, 1, 0]),
  ],
  pulse: [
    bass([1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0]),
    bass([1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 4, 0, 0, 0]),
  ],
  syncopated: [
    bass([1, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 3, 0, 1, 0]),
    bass([1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 3, 0]),
  ],
  sparse: [
    bass([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    bass([1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]),
  ],
};

const PERC: Record<RhythmPersonality, PercPattern[]> = {
  air: [
    perc({
      kick: [2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      click: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    }),
  ],
  groove: [
    perc({
      kick: [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 0, 0, 1],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0],
      hat: [1, 0, 2, 0, 1, 0, 2, 1, 1, 0, 2, 0, 1, 0, 2, 0],
      click: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    }),
  ],
  displaced: [
    perc({
      kick: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      hat: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
      click: [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    }),
  ],
  crystal: [
    perc({
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      hat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      click: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    }),
  ],
  drive: [
    perc({
      kick: [2, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 1, 0, 0, 1, 0],
      snare: [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0],
      hat: [1, 1, 2, 1, 1, 0, 2, 1, 1, 1, 2, 1, 1, 0, 2, 3],
      click: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2],
    }),
  ],
};

export function generatePlanetDna(profile: PlanetMusicProfile): PlanetMusicalDNA {
  const intensity = clamp01(profile.intensity);
  const luminosity = clamp01(profile.luminosity);
  const danger = clamp01(profile.danger);
  const anomaly = clamp01(profile.anomaly);
  const rng = createPrng(`dna:${profile.seed}:${profile.biome}:${profile.mood}`);
  const energy = clamp01(intensity * 0.7 + (profile.mood === "energetic" ? 0.25 : 0) + danger * 0.15);
  const tension = clamp01(
    (profile.mood === "dark" || profile.mood === "tense" ? 0.55 : 0.15) + danger * 0.4 + anomaly * 0.15,
  );
  const color = compatibleColor(profile, rng);
  const family = familyFor(color, energy);
  const scales = MOOD_SCALES[profile.mood];
  const mode = rng.pick(color === "shadow" ? (["phrygian", "harmonicMinor", "aeolian"] as ScaleName[]) : scales);
  const tempoMin = lerp(66, 100, energy);
  const tempo = Math.round(tempoMin + rng.nextRange(-3, 4) + (profile.mood === "energetic" ? 6 : 0));
  const tonic = rng.pick([0, 2, 4, 5, 7, 9, 11]);
  const bassPersonality = bassPersonalityFor(profile, energy, color);
  const rhythmPersonality = rhythmPersonalityFor(profile, energy, color);
  const spaceSize =
    color === "crystal" ? lerp(1.35, 1.6, 1 - energy) : color === "warm" ? lerp(0.7, 0.95, 1 - energy) : lerp(1.05, 1.4, anomaly);
  return {
    seed: profile.seed,
    tempo: Math.max(62, Math.min(118, tempo)),
    tonic,
    mode,
    harmonicColor: color,
    progressionFamily: family,
    motifDNA: motifFromDna(profile.seed, color, energy, rng.fork("motif")),
    bassPersonality,
    rhythmPersonality,
    timbreProfile: {
      padCutoff: lerp(1400, 2000, luminosity),
      padDetune: lerp(5, 14, anomaly),
      pluckCutoff: lerp(1400, 2800, luminosity),
      bassCutoff: lerp(260, 620, clamp01(profile.temperature)),
      leadCutoff: lerp(1100, 2100, luminosity),
      bellInharmonic: clamp01(0.1 + (profile.biome === "crystal" ? 0.3 : 0) + anomaly * 0.22),
      noiseAmount: clamp01(0.04 + (profile.biome === "storm" ? 0.16 : 0) + danger * 0.08),
      brightness: clamp01(0.28 + luminosity * 0.52),
      space: clamp01(0.32 + (1 - energy) * 0.4 + (profile.biome === "ocean" ? 0.12 : 0)),
    },
    spaceProfile: {
      size: Math.min(1.4, spaceSize),
      damp: color === "crystal" ? 0.34 : color === "shadow" ? 0.55 : 0.44,
      wet: clamp01(Math.min(0.2, 0.12 + (1 - energy) * 0.1 + (color === "alien" || color === "crystal" ? 0.06 : 0))),
      preDelay: color === "crystal" ? 0.03 : color === "warm" ? 0.008 : 0.018,
    },
    tension,
    energy,
    luminosity,
  };
}

export function themeFromDna(dna: PlanetMusicalDNA): WorldThemeDefinition {
  const family = FAMILY_GRAPH[dna.progressionFamily] ?? LAVANDA;
  const id =
    dna.harmonicColor === "warm"
      ? "durazno"
      : dna.harmonicColor === "shadow"
        ? "eclipse"
        : dna.harmonicColor === "crystal"
          ? "glaciar"
          : dna.harmonicColor === "alien" || dna.harmonicColor === "hybrid"
            ? "lavanda"
            : "menta";
  const secondary = motif(
    `${dna.motifDNA.id}-b`,
    dna.motifDNA.contour.slice().reverse().map((d, i) => (i === 0 ? d : Math.max(0, d - 1))),
    dna.motifDNA.rhythm,
    dna.motifDNA.accents.map((v) => (v ? 1 : 0)),
    dna.motifDNA.rests.map((v) => (v ? 1 : 0)),
  );
  const arp =
    dna.rhythmPersonality === "displaced"
      ? [0, 3, 6, 9, 12, 15]
      : dna.rhythmPersonality === "drive"
        ? [0, 2, 4, 8, 10, 12]
        : dna.rhythmPersonality === "crystal"
          ? [0, 8]
          : dna.energy > 0.6
            ? [0, 2, 4, 6, 8, 10, 12, 14]
            : [0, 4, 8, 12];
  return {
    id,
    name: "Procedural planet",
    identity: `${dna.harmonicColor} ${dna.bassPersonality} ${dna.rhythmPersonality}`,
    tempoRange: [Math.max(60, dna.tempo - 4), dna.tempo + 4],
    scales: [dna.mode],
    tonicPcs: [dna.tonic],
    chordVocab: family.chordVocab.map((c) => ({ ...c })),
    progressionGraph: family.progressionGraph,
    preferredProgressionLengths: family.preferredProgressionLengths,
    motifs: [dna.motifDNA, secondary, family.motifs[2] ?? dna.motifDNA],
    bassPatterns: BASS[dna.bassPersonality],
    percPatterns: PERC[dna.rhythmPersonality],
    arpTicks: arp,
    densityRange: [
      clamp01(0.16 + dna.energy * 0.28),
      clamp01(0.42 + dna.energy * 0.48 + dna.tension * 0.1),
    ],
    variationProbability: clamp01(0.22 + dna.tension * 0.2),
    cadenceEveryBars: dna.rhythmPersonality === "crystal" ? 16 : 8,
    timbre: dna.timbreProfile,
    sectionWeights: family.sectionWeights,
    melodyRegister: [
      Math.round(lerp(57, 72, dna.luminosity)),
      Math.round(lerp(76, 93, dna.luminosity)),
    ],
    bassRegister: [36, 50],
    padRegister: [
      Math.round(lerp(44, 55, dna.luminosity)),
      Math.round(lerp(67, 79, dna.luminosity)),
    ],
    restBias: clamp01(0.12 + (1 - dna.energy) * 0.22),
    swing: dna.rhythmPersonality === "groove" ? 0.08 : dna.rhythmPersonality === "displaced" ? 0.03 : 0.04,
  };
}

export function campaignDna(options: {
  themeId: Exclude<WorldThemeDefinition["id"], never>;
  seed: string;
  tempo: number;
  tonic: number;
  scale: ScaleName;
  motif: Motif;
  timbre: WorldThemeDefinition["timbre"];
}): PlanetMusicalDNA {
  const id = options.themeId;
  const mix = MIX_PROFILES[id];
  const color: HarmonicColor =
    id === "menta" ? "luminous" : id === "durazno" ? "warm" : id === "lavanda" ? "alien" : id === "glaciar" ? "crystal" : "shadow";
  const bassPersonality: BassPersonality =
    id === "menta" ? "drone" : id === "durazno" ? "walking" : id === "lavanda" ? "pulse" : id === "glaciar" ? "sparse" : "syncopated";
  const rhythmPersonality: RhythmPersonality =
    id === "menta" ? "air" : id === "durazno" ? "groove" : id === "lavanda" ? "displaced" : id === "glaciar" ? "crystal" : "drive";
  const energy = id === "eclipse" ? 0.82 : id === "durazno" ? 0.7 : id === "glaciar" ? 0.28 : id === "lavanda" ? 0.48 : 0.4;
  const tension = id === "eclipse" ? 0.78 : id === "lavanda" ? 0.42 : id === "glaciar" ? 0.22 : 0.18;
  const luminosity = id === "menta" ? 0.72 : id === "glaciar" ? 0.8 : id === "eclipse" ? 0.28 : id === "durazno" ? 0.62 : 0.5;
  return {
    seed: options.seed,
    tempo: options.tempo,
    tonic: options.tonic,
    mode: options.scale,
    harmonicColor: color,
    progressionFamily:
      id === "menta"
        ? "lydian-horizon"
        : id === "durazno"
          ? "mixo-groove"
          : id === "lavanda"
            ? "dorian-geo"
            : id === "glaciar"
              ? "aeolian-crystal"
              : "phrygian-shadow",
    motifDNA: options.motif,
    bassPersonality,
    rhythmPersonality,
    timbreProfile: options.timbre,
    spaceProfile: mix.space,
    tension,
    energy,
    luminosity,
  };
}

export function nearestCuratedThemeFromDna(dna: PlanetMusicalDNA): WorldThemeDefinition["id"] {
  if (dna.harmonicColor === "warm") return "durazno";
  if (dna.harmonicColor === "shadow") return "eclipse";
  if (dna.harmonicColor === "crystal") return "glaciar";
  if (dna.harmonicColor === "alien" || dna.harmonicColor === "hybrid") return "lavanda";
  return "menta";
}
