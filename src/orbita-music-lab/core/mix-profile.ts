import type { EngineRevision, OrbitaThemeId, PlanetMusicalDNA, SpaceProfile, VoiceName } from "./types.ts";

export type { SpaceProfile };

export type MixEq = {
  hipass: number;
  mudGain: number;
  presenceGain: number;
  airGain: number;
};

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
  eq: MixEq;
};

const BASE_SENDS: MixProfile["sends"] = {
  pad: 0.18,
  lead: 0.12,
  pluck: 0.08,
  bell: 0.16,
  arp: 0.08,
  pickup: 0.1,
  bass: 0.02,
  kick: 0.02,
  snare: 0.03,
};

export const MIX_EQ_V11: MixEq = { hipass: 62, mudGain: -1.6, presenceGain: 2.6, airGain: 1.6 };

export const MIX_EQ_DEFAULT: MixEq = { hipass: 72, mudGain: -2.4, presenceGain: 1.8, airGain: 1.2 };

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
  hat: 0.22,
  click: 0.24,
  noise: 0.1,
  pickup: 0.56,
  event: 0.36,
};

/** Global lift after the compressor. Keep near unity: Web Audio compressors already apply hidden makeup. */
export const POST_COMP_MAKEUP = 1;

const V11_SENDS: MixProfile["sends"] = {
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

/** Frozen v1.1 mix for A/B listening. */
export const MIX_PROFILES_V11: Record<Exclude<OrbitaThemeId, "procedural">, MixProfile> = {
  menta: {
    makeup: 1.18,
    pad: 1.12,
    bass: 1.08,
    lead: 1.1,
    perc: 1.02,
    sfx: 1,
    space: { size: 1.12, damp: 0.4, wet: 0.18, preDelay: 0.016 },
    sends: { ...V11_SENDS, pad: 0.24, bell: 0.2 },
    eq: MIX_EQ_V11,
  },
  durazno: {
    makeup: 1.1,
    pad: 0.96,
    bass: 1.2,
    lead: 1.14,
    perc: 1.1,
    sfx: 1.05,
    space: { size: 0.68, damp: 0.58, wet: 0.1, preDelay: 0.006 },
    sends: { ...V11_SENDS, pad: 0.1, kick: 0.03, snare: 0.05, bass: 0.02 },
    eq: MIX_EQ_V11,
  },
  lavanda: {
    makeup: 1.14,
    pad: 1.1,
    bass: 1.05,
    lead: 1.14,
    perc: 1.02,
    sfx: 1.02,
    space: { size: 1.28, damp: 0.3, wet: 0.24, preDelay: 0.024 },
    sends: { ...V11_SENDS, pad: 0.28, pluck: 0.14, arp: 0.12, bell: 0.24 },
    eq: MIX_EQ_V11,
  },
  glaciar: {
    makeup: 1.28,
    pad: 1.2,
    bass: 1.08,
    lead: 1.18,
    perc: 0.98,
    sfx: 1.05,
    space: { size: 1.48, damp: 0.2, wet: 0.26, preDelay: 0.032 },
    sends: { ...V11_SENDS, pad: 0.32, bell: 0.3, pluck: 0.16, click: 0.14 },
    eq: MIX_EQ_V11,
  },
  eclipse: {
    makeup: 1.1,
    pad: 1.06,
    bass: 1.2,
    lead: 1.06,
    perc: 1.14,
    sfx: 1.06,
    space: { size: 1.18, damp: 0.48, wet: 0.15, preDelay: 0.018 },
    sends: { ...V11_SENDS, pad: 0.18, bass: 0.04, kick: 0.04, lead: 0.1 },
    eq: MIX_EQ_V11,
  },
};

export const MIX_PROFILES: Record<Exclude<OrbitaThemeId, "procedural">, MixProfile> = {
  menta: {
    makeup: 1.18,
    pad: 1.1,
    bass: 1.08,
    lead: 1.12,
    perc: 1.0,
    sfx: 1,
    space: { size: 1.05, damp: 0.48, wet: 0.14, preDelay: 0.014 },
    sends: { ...BASE_SENDS, pad: 0.18, bell: 0.16 },
    eq: { hipass: 72, mudGain: -2.2, presenceGain: 1.8, airGain: 1.4 },
  },
  durazno: {
    makeup: 1.1,
    pad: 0.94,
    bass: 1.2,
    lead: 1.14,
    perc: 1.08,
    sfx: 1.05,
    space: { size: 0.64, damp: 0.64, wet: 0.09, preDelay: 0.005 },
    sends: { ...BASE_SENDS, pad: 0.08, kick: 0.02, snare: 0.03, bass: 0.015 },
    eq: { hipass: 78, mudGain: -2.8, presenceGain: 1.6, airGain: 0.8 },
  },
  lavanda: {
    makeup: 1.14,
    pad: 1.08,
    bass: 1.04,
    lead: 1.14,
    perc: 1.0,
    sfx: 1.02,
    space: { size: 1.18, damp: 0.42, wet: 0.18, preDelay: 0.02 },
    sends: { ...BASE_SENDS, pad: 0.2, pluck: 0.1, arp: 0.08, bell: 0.18 },
    eq: { hipass: 70, mudGain: -2.4, presenceGain: 1.7, airGain: 1.2 },
  },
  glaciar: {
    makeup: 1.26,
    pad: 1.18,
    bass: 1.06,
    lead: 1.16,
    perc: 0.96,
    sfx: 1.05,
    space: { size: 1.36, damp: 0.34, wet: 0.2, preDelay: 0.028 },
    sends: { ...BASE_SENDS, pad: 0.22, bell: 0.22, pluck: 0.12, click: 0.06 },
    eq: { hipass: 80, mudGain: -2.0, presenceGain: 1.5, airGain: 1.8 },
  },
  eclipse: {
    makeup: 1.1,
    pad: 1.04,
    bass: 1.2,
    lead: 1.06,
    perc: 1.1,
    sfx: 1.06,
    space: { size: 1.08, damp: 0.55, wet: 0.12, preDelay: 0.016 },
    sends: { ...BASE_SENDS, pad: 0.14, bass: 0.02, kick: 0.02, lead: 0.08 },
    eq: { hipass: 68, mudGain: -2.6, presenceGain: 1.4, airGain: 0.6 },
  },
};

export function mixProfileFor(theme: OrbitaThemeId, revision: EngineRevision = "v1.2"): MixProfile {
  const table = revision === "v1.1" ? MIX_PROFILES_V11 : MIX_PROFILES;
  if (theme === "procedural") {
    return {
      ...table.lavanda,
      makeup: revision === "v1.1" ? 1.34 : 1.22,
    };
  }
  return table[theme];
}

export function mixProfileFromDna(dna: PlanetMusicalDNA, revision: EngineRevision = "v1.2"): MixProfile {
  const energy = Math.max(0, Math.min(1, dna.energy));
  const tension = Math.max(0, Math.min(1, dna.tension));
  const lum = Math.max(0, Math.min(1, dna.luminosity));
  const table = revision === "v1.1" ? MIX_PROFILES_V11 : MIX_PROFILES;
  const base =
    dna.harmonicColor === "warm"
      ? table.durazno
      : dna.harmonicColor === "shadow"
        ? table.eclipse
        : dna.harmonicColor === "crystal"
          ? table.glaciar
          : dna.harmonicColor === "alien"
            ? table.lavanda
            : dna.harmonicColor === "hybrid"
              ? table.lavanda
              : table.menta;
  const space = { ...dna.spaceProfile };
  if (revision !== "v1.1") {
    space.damp = Math.max(0.32, Math.min(0.7, space.damp + 0.1));
    space.wet = Math.max(0.06, Math.min(0.22, space.wet * 0.78));
  }
  return {
    ...base,
    makeup: (dna.harmonicColor === "crystal" ? 1.36 : 1.22) + (1 - energy) * 0.08,
    bass: 0.98 + energy * 0.32,
    perc: 0.9 + energy * 0.42 + tension * 0.08,
    pad: 1.05 + lum * 0.18,
    lead: 1.08 + lum * 0.14,
    space,
    sends: {
      ...base.sends,
      pad: 0.12 + space.wet * 0.32,
      bell: dna.harmonicColor === "crystal" || dna.harmonicColor === "alien" ? 0.2 : 0.14,
    },
    eq: base.eq,
  };
}

export function spaceFeedback(damp: number): number {
  const d = Math.max(0.1, Math.min(0.9, damp));
  return Math.min(0.42, 0.26 + (1 - d) * 0.16);
}
