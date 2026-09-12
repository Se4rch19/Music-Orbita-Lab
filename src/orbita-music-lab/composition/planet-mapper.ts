import { clamp01 } from "../core/pitch.ts";
import type {
  PlanetMusicProfile,
  WorldThemeDefinition,
} from "../core/types.ts";
import { CURATED_THEMES } from "../themes/catalog.ts";
import { generatePlanetDna, nearestCuratedThemeFromDna, themeFromDna } from "./dna.ts";

export function mapPlanetProfile(profile: PlanetMusicProfile): WorldThemeDefinition {
  const dna = generatePlanetDna({
    ...profile,
    intensity: clamp01(profile.intensity),
    temperature: clamp01(profile.temperature),
    luminosity: clamp01(profile.luminosity),
    danger: clamp01(profile.danger),
    anomaly: clamp01(profile.anomaly),
  });
  return themeFromDna(dna);
}

export function nearestCuratedTheme(profile: PlanetMusicProfile): keyof typeof CURATED_THEMES {
  if (profile.danger > 0.7 || profile.biome === "lava") return "eclipse";
  if (profile.biome === "glacial" || profile.biome === "crystal" || profile.biome === "dead") return "glaciar";
  if (profile.mood === "mysterious" || profile.anomaly > 0.55 || profile.biome === "mixed") return "lavanda";
  if (profile.mood === "energetic" || profile.biome === "tropical" || profile.biome === "desert") return "durazno";
  return nearestCuratedThemeFromDna(generatePlanetDna(profile));
}
