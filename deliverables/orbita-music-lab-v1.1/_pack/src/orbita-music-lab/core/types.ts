export type OrbitaThemeId =
  | "menta"
  | "durazno"
  | "lavanda"
  | "glaciar"
  | "eclipse"
  | "procedural";

export type GameMode = "expedition" | "daily" | "infinite" | "calm" | "anomaly";

export type PlanetBiome =
  | "ocean"
  | "desert"
  | "tropical"
  | "lava"
  | "glacial"
  | "crystal"
  | "dead"
  | "storm"
  | "mixed";

export type PlanetMood =
  | "calm"
  | "hopeful"
  | "mysterious"
  | "tense"
  | "dark"
  | "energetic";

export type PlanetMusicProfile = {
  seed: string;
  biome: PlanetBiome;
  mood: PlanetMood;
  intensity: number;
  temperature: number;
  luminosity: number;
  danger: number;
  anomaly: number;
};

export type HarmonicColor = "luminous" | "warm" | "alien" | "crystal" | "shadow" | "hybrid";
export type BassPersonality = "drone" | "walking" | "pulse" | "syncopated" | "sparse";
export type RhythmPersonality = "air" | "groove" | "displaced" | "crystal" | "drive";

export type SpaceProfile = {
  size: number;
  damp: number;
  wet: number;
  preDelay: number;
};

export type PlanetMusicalDNA = {
  seed: string;
  tempo: number;
  tonic: number;
  mode: ScaleName;
  harmonicColor: HarmonicColor;
  progressionFamily: string;
  motifDNA: Motif;
  bassPersonality: BassPersonality;
  rhythmPersonality: RhythmPersonality;
  timbreProfile: InstrumentTimbre;
  spaceProfile: SpaceProfile;
  tension: number;
  energy: number;
  luminosity: number;
};

export type SectionId =
  | "INTRO"
  | "A"
  | "A_VARIATION"
  | "B"
  | "BUILD"
  | "PEAK"
  | "RECOVERY"
  | "TRANSITION";

export type ChordQuality =
  | "maj"
  | "min"
  | "sus2"
  | "sus4"
  | "maj7"
  | "min7"
  | "add9"
  | "minadd9"
  | "maj6"
  | "min6"
  | "dom7"
  | "maj9"
  | "min9"
  | "dim"
  | "halfdim"
  | "aug"
  | "sus2add6";

export type ScaleName =
  | "major"
  | "naturalMinor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "majorPentatonic"
  | "minorPentatonic"
  | "lydianPentatonic"
  | "harmonicMinor"
  | "melodicMinor";

export type ChordSymbol = {
  /** Diatonic degree 1-7. */
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Chromatic alteration of the root: -1 = flat, +1 = sharp. */
  alteration: number;
  quality: ChordQuality;
  /** How many bars this chord occupies. */
  bars: number;
};

export type ChordVoicing = {
  symbol: ChordSymbol;
  /** Pitch classes 0-11. */
  pitchClasses: number[];
  /** MIDI notes used for pad/harmony. */
  midi: number[];
  rootMidi: number;
  bassMidi: number;
};

export type Motif = {
  id: string;
  /** Scale degrees relative to tonic (0 = tonic, 4 = fifth, may exceed 7). */
  contour: number[];
  /** Durations in 16th notes. */
  rhythm: number[];
  rests: boolean[];
  accents: boolean[];
};

export type PercHitKind = "kick" | "snare" | "hat" | "hatOpen" | "click" | "rim";

export type PatternStep = 0 | 1 | 2 | 3;

export type PercPattern = {
  kick: PatternStep[];
  snare: PatternStep[];
  hat: PatternStep[];
  click: PatternStep[];
};

export type BassPattern = {
  /** Per 16th: 0 rest, 1 root, 2 fifth, 3 approach, 4 octave, 5 chord-third. */
  steps: number[];
};

export type VoiceName =
  | "pad"
  | "pluck"
  | "bass"
  | "lead"
  | "bell"
  | "arp"
  | "kick"
  | "snare"
  | "hat"
  | "click"
  | "noise"
  | "pickup"
  | "event";

export type ScoreNote = {
  /** Position within the bar, in 16th notes (0-15+). */
  tick: number;
  /** Duration in 16th notes. */
  durationTicks: number;
  midi: number;
  velocity: number;
  voice: VoiceName;
  pan?: number;
};

export type BarScore = {
  barIndex: number;
  section: SectionId;
  chord: ChordVoicing;
  notes: ScoreNote[];
  isFill: boolean;
};

export type InstrumentTimbre = {
  padCutoff: number;
  padDetune: number;
  pluckCutoff: number;
  bassCutoff: number;
  leadCutoff: number;
  bellInharmonic: number;
  noiseAmount: number;
  brightness: number;
  space: number;
};

export type WorldThemeDefinition = {
  id: Exclude<OrbitaThemeId, "procedural">;
  name: string;
  identity: string;
  tempoRange: [number, number];
  scales: ScaleName[];
  tonicPcs: number[];
  chordVocab: ChordSymbol[];
  progressionGraph: Record<string, { to: string; weight: number }[]>;
  preferredProgressionLengths: number[];
  motifs: Motif[];
  bassPatterns: BassPattern[];
  percPatterns: PercPattern[];
  arpTicks: number[];
  densityRange: [number, number];
  variationProbability: number;
  cadenceEveryBars: number;
  timbre: InstrumentTimbre;
  sectionWeights: Partial<Record<SectionId, number>>;
  melodyRegister: [number, number];
  bassRegister: [number, number];
  padRegister: [number, number];
  restBias: number;
  swing: number;
};

export type EngineConfig = {
  musicVolume?: number;
  sfxVolume?: number;
  masterVolume?: number;
  maxVoices?: number;
  lookaheadSec?: number;
  scheduleIntervalMs?: number;
};

export type StartThemeOptions = {
  seed?: string;
  variationSeed?: string;
  profile?: PlanetMusicProfile;
};

export type TransitionOptions = {
  seed?: string;
  variationSeed?: string;
  profile?: PlanetMusicProfile;
  bars?: number;
};

export type LightPickupOptions = {
  velocity?: number;
};

export type EngineDiagnostics = {
  activeVoices: number;
  scheduledEvents: number;
  bpm: number;
  currentBar: number;
  currentBeat: number;
  beatsPerBar: number;
  subdivision: number;
  section: SectionId | "idle";
  theme: OrbitaThemeId | "idle";
  intensity: number;
  combo: number;
  mode: GameMode;
  seed: string;
  scale: ScaleName | "none";
  keyName: string;
  running: boolean;
  paused: boolean;
  suspended: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  peak: number;
  rms: number;
  peakDbfs: number;
  rmsDbfs: number;
  limiterReduction: number;
  compressorReduction: number;
  speakerPreview: boolean;
};

export type CompositionPlanJson = {
  seed: string;
  variationSeed: string;
  theme: OrbitaThemeId;
  tempo: number;
  tonicPc: number;
  keyName: string;
  scale: ScaleName;
  motifs: Motif[];
  progressions: { section: SectionId; chords: string[] }[];
  sections: { id: SectionId; bars: number }[];
  instrumentConfiguration: InstrumentTimbre;
  planetProfile?: PlanetMusicProfile;
  dna?: PlanetMusicalDNA;
  generatedAt: string;
};

export const THEME_IDS: OrbitaThemeId[] = [
  "menta",
  "durazno",
  "lavanda",
  "glaciar",
  "eclipse",
  "procedural",
];

export const GAME_MODES: GameMode[] = [
  "expedition",
  "daily",
  "infinite",
  "calm",
  "anomaly",
];

export const BIOMES: PlanetBiome[] = [
  "ocean",
  "desert",
  "tropical",
  "lava",
  "glacial",
  "crystal",
  "dead",
  "storm",
  "mixed",
];

export const MOODS: PlanetMood[] = [
  "calm",
  "hopeful",
  "mysterious",
  "tense",
  "dark",
  "energetic",
];

export const SECTION_ORDER: SectionId[] = [
  "INTRO",
  "A",
  "A_VARIATION",
  "B",
  "A",
  "BUILD",
  "PEAK",
  "RECOVERY",
];

export const MAX_VOICES_DEFAULT = 28;
export const MAX_MIDI = 108;
export const MIN_MIDI = 24;
export const MIN_MOBILE_BASS_MIDI = 36;
export const BEATS_PER_BAR = 4;
export const TICKS_PER_BEAT = 4;
export const TICKS_PER_BAR = 16;
