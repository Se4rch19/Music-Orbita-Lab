import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MIX_PROFILES, MIX_PROFILES_V11, mixProfileFor, mixProfileFromDna, POST_COMP_MAKEUP, VOICE_PEAK, spaceFeedback } from "./mix-profile.ts";
import { generatePlanetDna } from "../composition/dna.ts";
import type { VoiceName } from "./types.ts";

describe("mix profiles", () => {
  it("gives every campaign world makeup above unity", () => {
    for (const id of ["menta", "durazno", "lavanda", "glaciar", "eclipse"] as const) {
      const mix = MIX_PROFILES[id];
      assert.ok(mix.makeup >= 1.1, `${id} makeup ${mix.makeup}`);
      assert.ok(mix.pad > 0.8 && mix.bass > 0.8 && mix.lead > 0.8 && mix.perc > 0.7);
      assert.ok(mix.space.size >= 0.6 && mix.space.wet > 0.08);
    }
  });

  it("keeps glaciar louder in makeup than menta so sparse music still reads", () => {
    assert.ok(MIX_PROFILES.glaciar.makeup > MIX_PROFILES.menta.makeup);
    assert.ok(MIX_PROFILES.durazno.perc > MIX_PROFILES.menta.perc);
    assert.ok(MIX_PROFILES.eclipse.bass > MIX_PROFILES.menta.bass);
  });

  it("places makeup after the compressor via a global post-comp lift", () => {
    assert.ok(POST_COMP_MAKEUP >= 0.95 && POST_COMP_MAKEUP <= 1.4);
    assert.ok(POST_COMP_MAKEUP * MIX_PROFILES.glaciar.makeup > 1.15);
  });

  it("maps procedural from DNA without cloning a single world blindly", () => {
    const dna = generatePlanetDna({
      seed: "P-MIX-1",
      biome: "lava",
      mood: "dark",
      intensity: 0.8,
      temperature: 0.9,
      luminosity: 0.2,
      danger: 0.85,
      anomaly: 0.3,
    });
    const mix = mixProfileFromDna(dna);
    assert.equal(mix.space.size, dna.spaceProfile.size);
    assert.ok(mix.makeup >= 1.1);
    assert.notEqual(mixProfileFor("procedural").space.size, mix.space.size);
  });
});

describe("voice peaks", () => {
  it("stays inside gain bounds", () => {
    const names = Object.keys(VOICE_PEAK) as VoiceName[];
    assert.ok(names.length >= 12);
    for (const name of names) {
      const peak = VOICE_PEAK[name];
      assert.ok(peak > 0.04 && peak < 0.9, `${name} ${peak}`);
    }
    assert.ok(VOICE_PEAK.kick > VOICE_PEAK.pad);
    assert.ok(VOICE_PEAK.pickup > 0.3);
    assert.ok(VOICE_PEAK.lead > 0.3);
    assert.ok(VOICE_PEAK.bass > 0.5);
  });
});

describe("v1.2 space and EQ bounds", () => {
  it("keeps delay feedback and wet inside musical limits", () => {
    for (const id of ["menta", "durazno", "lavanda", "glaciar", "eclipse"] as const) {
      const mix = MIX_PROFILES[id];
      assert.ok(mix.space.wet <= 0.22, `${id} wet ${mix.space.wet}`);
      assert.ok(mix.space.damp >= 0.32, `${id} damp ${mix.space.damp}`);
      assert.ok(spaceFeedback(mix.space.damp) <= 0.42);
      assert.ok(mix.eq.mudGain <= -2, `${id} mud ${mix.eq.mudGain}`);
      assert.ok(mix.eq.presenceGain <= 2, `${id} presence ${mix.eq.presenceGain}`);
    }
  });

  it("preserves a louder/wetter v1.1 profile for A/B", () => {
    assert.ok(MIX_PROFILES_V11.glaciar.space.wet > MIX_PROFILES.glaciar.space.wet);
    assert.ok(MIX_PROFILES_V11.lavanda.space.wet > MIX_PROFILES.lavanda.space.wet);
    assert.equal(mixProfileFor("menta", "v1.1").space.wet, MIX_PROFILES_V11.menta.space.wet);
  });
});
