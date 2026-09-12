import type { OrbitaThemeId, PlanetMusicalDNA, SpaceProfile, VoiceName } from "./types.ts";

export type { SpaceProfile };

export type MixProfile = {
  /** Post-compressor makeup. Applied after glue, never before. */
  makeup: number;
  pad: number;
  bass: number;
  lead: number;
  perc: number;
  sfx: number;
  space: SpaceProfile;
  sends: Partial<Record<VoiceName, number>>;
};

const BASE_SENDS: MixProfile["sends"] = {
  pad: 0.22,
  lead: 0.16,
  pluck: 0.1,
  bell: 0.2,
  arp: 0.1,
  pickup: 0.14,
  bass: 0.03,
  kick: 0.04,
  snare: 0.06,
};

/**
 * Per-voice peak into the instrument bus at velocity 1.
 * Sized so a typical 3–6 voice bed sits around −12 to −8 dBFS before makeup,
 * not −24. Kick is the loudest transient; pads are wide but not quiet.
 */
export const VOICE_PEAK: Record<VoiceName, number> = {
  pad: 0.36,
  bass: 0.52,
  lead: 0.4,
  pluck: 0.42,
  arp: 0.3,
  bell: 0.38,
  kick: 0.76,
  snare: 0.5,
  hat: 0.24,
  click: 0.28,
  noise: 0.12,
  pickup: 0.56,
  event: 0.36,
};

/** Global lift after the compressor. Keep near unity: Web Audio compressors already apply hidden makeup. */
export const POST_COMP_MAKEUP = 1;

export const MIX_PROFILES: Record<Exclude<OrbitaThemeId, "procedural">, MixProfile> = {
  menta: {
    makeup: 1.18,
    pad: 1.12,
    bass: 1.08,
    lead: 1.1,
    perc: 1.02,
    sfx: 1,
    space: { size: 1.12, damp: 0.4, wet: 0.18, preDelay: 0.016 },
    sends: { ...BASE_SENDS, pad: 0.24, bell: 0.2 },
  },
  durazno: {
    makeup: 1.1,
    pad: 0.96,
    bass: 1.2,
    lead: 1.14,
    perc: 1.1,
    sfx: 1.05,
    space: { size: 0.68, damp: 0.58, wet: 0.1, preDelay: 0.006 },
    sends: { ...BASE_SENDS, pad: 0.1, kick: 0.03, snare: 0.05, bass: 0.02 },
  },
  lavanda: {
    makeup: 1.14,
    pad: 1.1,
    bass: 1.05,
    lead: 1.14,
    perc: 1.02,
    sfx: 1.02,
    space: { size: 1.28, damp: 0.3, wet: 0.24, preDelay: 0.024 },
    sends: { ...BASE_SENDS, pad: 0.28, pluck: 0.14, arp: 0.12, bell: 0.24 },
  },
  glaciar: {
    makeup: 1.28,
    pad: 1.2,
    bass: 1.08,
    lead: 1.18,
    perc: 0.98,
    sfx: 1.05,
    space: { size: 1.48, damp: 0.2, wet: 0.26, preDelay: 0.032 },
    sends: { ...BASE_SENDS, pad: 0.32, bell: 0.3, pluck: 0.16, click: 0.14 },
  },
  eclipse: {
    makeup: 1.1,
    pad: 1.06,
    bass: 1.2,
    lead: 1.06,
    perc: 1.14,
    sfx: 1.06,
    space: { size: 1.18, damp: 0.48, wet: 0.15, preDelay: 0.018 },
    sends: { ...BASE_SENDS, pad: 0.18, bass: 0.04, kick: 0.04, lead: 0.1 },
  },
};

export function mixProfileFor(theme: OrbitaThemeId): MixProfile {
  if (theme === "procedural") {
    return {
      ...MIX_PROFILES.lavanda,
      makeup: 1.34,
    };
  }
  return MIX_PROFILES[theme];
}

export function mixProfileFromDna(dna: PlanetMusicalDNA): MixProfile {
  const energy = Math.max(0, Math.min(1, dna.energy));
  const tension = Math.max(0, Math.min(1, dna.tension));
  const lum = Math.max(0, Math.min(1, dna.luminosity));
  const base =
    dna.harmonicColor === "warm"
      ? MIX_PROFILES.durazno
      : dna.harmonicColor === "shadow"
        ? MIX_PROFILES.eclipse
        : dna.harmonicColor === "crystal"
          ? MIX_PROFILES.glaciar
          : dna.harmonicColor === "alien"
            ? MIX_PROFILES.lavanda
            : dna.harmonicColor === "hybrid"
              ? MIX_PROFILES.lavanda
              : MIX_PROFILES.menta;
  return {
    ...base,
    makeup: (dna.harmonicColor === "crystal" ? 1.48 : 1.3) + (1 - energy) * 0.12,
    bass: 0.98 + energy * 0.32,
    perc: 0.9 + energy * 0.42 + tension * 0.08,
    pad: 1.05 + lum * 0.22,
    lead: 1.08 + lum * 0.14,
    space: dna.spaceProfile,
    sends: {
      ...base.sends,
      pad: 0.16 + dna.spaceProfile.wet * 0.4,
      bell: dna.harmonicColor === "crystal" || dna.harmonicColor === "alien" ? 0.3 : 0.18,
    },
  };
}
