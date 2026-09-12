export { OrbitaMusicEngine } from "./engine/OrbitaMusicEngine.ts";
export { createPrng, hashSeed } from "./core/prng.ts";
export { createSession, exportPlan, sectionAtBar } from "./composition/session.ts";
export { composeBar, choosePickupMidi } from "./composition/compose-bar.ts";
export { mapPlanetProfile, nearestCuratedTheme } from "./composition/planet-mapper.ts";
export { generatePlanetDna, themeFromDna, campaignDna } from "./composition/dna.ts";
export { getCuratedTheme, CURATED_THEMES } from "./themes/catalog.ts";
export { validateBar, validateNote, validatePickup } from "./core/validation.ts";
export { midiToFreq, pcName, clampMidi } from "./core/pitch.ts";
export { chordKey, voiceChord, formatChord, chordPitchClasses } from "./theory/chords.ts";
export { generateProgression } from "./theory/harmony.ts";
export { realizeMotif, varyMotif } from "./theory/motifs.ts";
export { isInScale, scalePitchClasses, SCALE_INTERVALS } from "./theory/scales.ts";
export { encodeWav, measureBuffer } from "./engine/wav.ts";
export { MIX_PROFILES, MIX_PROFILES_V11, mixProfileFor, mixProfileFromDna, VOICE_PEAK, POST_COMP_MAKEUP, spaceFeedback } from "./core/mix-profile.ts";
export { createMixer } from "./core/mixer.ts";
export { choosePickupHarmony } from "./composition/compose-bar.ts";
export {
  classifyNote,
  polishPhrase,
  tensionPolicyFor,
  nearestChordTone,
  consonantPickupInterval,
} from "./theory/harmonic-role.ts";

export type { OrbitaThemeId, OrbitaThemeId as OrbitaTheme } from "./core/types.ts";
export type {
  EngineRevision,
  PlanetMusicProfile,
  PlanetBiome,
  PlanetMood,
  PlanetMusicalDNA,
  GameMode,
  EngineDiagnostics,
  EngineConfig,
  CompositionPlanJson,
  StartThemeOptions,
  LightPickupOptions,
  BarScore,
  WorldThemeDefinition,
  SectionId,
  ScaleName,
} from "./core/types.ts";
export { BIOMES, MOODS, THEME_IDS, GAME_MODES } from "./core/types.ts";
