import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPrng } from "../core/prng.ts";
import { THEME_IDS } from "../core/types.ts";
import type { PlanetMusicProfile } from "../core/types.ts";
import { validateBar, validatePickup } from "../core/validation.ts";
import { choosePickupMidi, composeBar } from "./compose-bar.ts";
import { generatePlanetDna, themeFromDna } from "./dna.ts";
import { mapPlanetProfile, nearestCuratedTheme } from "./planet-mapper.ts";
import { createSession, exportPlan, sectionAtBar } from "./session.ts";
import { CURATED_THEMES } from "../themes/catalog.ts";

describe("session identity", () => {
  it("same seed yields same key, scale, tempo and motifs", () => {
    const a = createSession({ themeId: "menta", seed: "MENTA-2026-001" });
    const b = createSession({ themeId: "menta", seed: "MENTA-2026-001" });
    assert.equal(a.tempo, b.tempo);
    assert.equal(a.tonicPc, b.tonicPc);
    assert.equal(a.scale, b.scale);
    assert.deepEqual(a.motifs, b.motifs);
    assert.deepEqual(a.progressions.A, b.progressions.A);
    assert.deepEqual(a.dna, b.dna);
  });

  it("different seeds diverge", () => {
    const a = createSession({ themeId: "menta", seed: "A" });
    const b = createSession({ themeId: "menta", seed: "B" });
    assert.ok(a.tempo !== b.tempo || a.tonicPc !== b.tonicPc || a.scale !== b.scale);
  });

  it("tempo stays within the world range", () => {
    for (const id of ["menta", "durazno", "lavanda", "glaciar", "eclipse"] as const) {
      const session = createSession({ themeId: id, seed: `${id}-range` });
      const [lo, hi] = CURATED_THEMES[id].tempoRange;
      assert.ok(session.tempo >= lo && session.tempo <= hi, `${id} tempo ${session.tempo}`);
    }
  });
});

describe("bar composition", () => {
  it("produces structured bars with harmony, bass and motif material", () => {
    const session = createSession({ themeId: "menta", seed: "MENTA-2026-001" });
    const bar = composeBar({
      session,
      barIndex: 8,
      intensity: 0.5,
      combo: 4,
      mode: "expedition",
    });
    assert.ok(bar.chord.midi.length >= 3);
    assert.ok(bar.notes.length > 4);
    const voices = new Set(bar.notes.map((n) => n.voice));
    assert.ok(voices.has("pad"));
    assert.ok(voices.has("bass"));
    const issues = validateBar(bar, session.tonicPc, session.scale);
    const critical = issues.filter((i) => i.code !== "out-of-harmony");
    assert.equal(critical.length, 0, JSON.stringify(critical));
  });

  it("is deterministic per bar", () => {
    const session = createSession({ themeId: "durazno", seed: "D-1" });
    const a = composeBar({ session, barIndex: 3, intensity: 0.4, combo: 0, mode: "expedition" });
    const b = composeBar({ session, barIndex: 3, intensity: 0.4, combo: 0, mode: "expedition" });
    assert.deepEqual(
      a.notes.map((n) => `${n.tick}:${n.midi}:${n.voice}`),
      b.notes.map((n) => `${n.tick}:${n.midi}:${n.voice}`),
    );
  });

  it("varies across bars rather than looping a single cell", () => {
    const session = createSession({ themeId: "lavanda", seed: "L-long" });
    const hashes = Array.from({ length: 16 }, (_, i) =>
      composeBar({ session, barIndex: i, intensity: 0.45, combo: 2, mode: "infinite" })
        .notes.map((n) => `${n.tick}:${n.midi}:${n.voice}`)
        .join("|"),
    );
    assert.ok(new Set(hashes).size > 6);
  });

  it("intensity increases percussion density", () => {
    const session = createSession({ themeId: "eclipse", seed: "E-int" });
    const calm = composeBar({ session, barIndex: 16, intensity: 0.1, combo: 0, mode: "calm" });
    const peak = composeBar({ session, barIndex: 16, intensity: 0.95, combo: 8, mode: "expedition" });
    const perc = (bar: typeof calm) => bar.notes.filter((n) => n.voice === "kick" || n.voice === "hat" || n.voice === "snare").length;
    assert.ok(perc(peak) >= perc(calm));
  });

  it("durazno keeps kicks at mid intensity", () => {
    const session = createSession({ themeId: "durazno", seed: "D-kick" });
    const bar = composeBar({ session, barIndex: 8, intensity: 0.5, combo: 0, mode: "expedition" });
    const kicks = bar.notes.filter((n) => n.voice === "kick");
    assert.ok(kicks.length >= 2, `expected durazno kicks, got ${kicks.length}`);
    assert.ok(bar.notes.some((n) => n.voice === "bass"));
    assert.ok(bar.notes.filter((n) => n.voice === "pad").length >= 3);
    assert.ok(bar.notes.some((n) => n.voice === "snare"), "durazno groove needs snare");
  });

  it("glaciar stays present with pads and bells", () => {
    const session = createSession({ themeId: "glaciar", seed: "G-aud" });
    const bar = composeBar({ session, barIndex: 6, intensity: 0.5, combo: 0, mode: "expedition" });
    assert.ok(bar.notes.filter((n) => n.voice === "pad").length >= 3);
    assert.ok(bar.notes.some((n) => n.voice === "bass"));
    assert.ok(bar.notes.some((n) => n.voice === "bell"), "glaciar needs a crystalline bell");
  });

  it("intensity 80% is a larger arrangement than 20%", () => {
    const session = createSession({ themeId: "menta", seed: "I-arc" });
    const quiet = composeBar({ session, barIndex: 12, intensity: 0.2, combo: 0, mode: "expedition" });
    const loud = composeBar({ session, barIndex: 12, intensity: 0.8, combo: 6, mode: "expedition" });
    assert.ok(loud.notes.length > quiet.notes.length, `${loud.notes.length} vs ${quiet.notes.length}`);
  });

  it("composed velocities stay inside 0.05–1", () => {
    for (const id of ["menta", "durazno", "lavanda", "glaciar", "eclipse"] as const) {
      const session = createSession({ themeId: id, seed: `${id}-gain` });
      const bar = composeBar({ session, barIndex: 10, intensity: 0.7, combo: 4, mode: "expedition" });
      for (const note of bar.notes) {
        assert.ok(note.velocity > 0.05 && note.velocity <= 1, `${id} ${note.voice} ${note.velocity}`);
      }
    }
  });

  it("menta A section carries the horizon motif as lead material", () => {
    const session = createSession({ themeId: "menta", seed: "MENTA-2026-001" });
    const bar = composeBar({ session, barIndex: 8, intensity: 0.5, combo: 0, mode: "expedition" });
    assert.equal(bar.section, "A");
    assert.ok(bar.notes.some((n) => n.voice === "lead" || n.voice === "pluck"));
  });

  it("lavanda keeps a 3-against-4 pulse", () => {
    const session = createSession({ themeId: "lavanda", seed: "L-geo" });
    const bar = composeBar({ session, barIndex: 8, intensity: 0.5, combo: 0, mode: "expedition" });
    const pulse = bar.notes.filter((n) => n.voice === "arp" || n.voice === "bell");
    assert.ok(pulse.length >= 3);
  });
});

describe("pickup compatibility", () => {
  it("chooses a chord or scale tone", () => {
    const session = createSession({ themeId: "menta", seed: "P" });
    const bar = composeBar({ session, barIndex: 4, intensity: 0.4, combo: 6, mode: "expedition" });
    const midi = choosePickupMidi({
      voicing: bar.chord,
      tonicPc: session.tonicPc,
      scale: session.scale,
      combo: 6,
      strongBeat: true,
      rng: createPrng("pickup"),
    });
    assert.equal(validatePickup(midi, bar.chord, session.tonicPc, session.scale), true);
  });
});

describe("planet mapping", () => {
  const profile: PlanetMusicProfile = {
    seed: "PLANET-9",
    biome: "glacial",
    mood: "calm",
    intensity: 0.2,
    temperature: 0.1,
    luminosity: 0.8,
    danger: 0.1,
    anomaly: 0.2,
  };

  it("maps glacial/calm to glaciar family", () => {
    assert.equal(nearestCuratedTheme(profile), "glaciar");
    const theme = mapPlanetProfile(profile);
    assert.ok(theme.tempoRange[0] >= 60 && theme.tempoRange[1] <= 110);
    assert.ok(theme.timbre.brightness > 0.4);
  });

  it("lava/dark raises danger colors", () => {
    const lava = mapPlanetProfile({
      ...profile,
      biome: "lava",
      mood: "dark",
      danger: 0.9,
      intensity: 0.8,
    });
    assert.ok(lava.densityRange[1] > themeHigh(profile));
  });
});

function themeHigh(profile: PlanetMusicProfile): number {
  return mapPlanetProfile(profile).densityRange[1];
}

describe("sections", () => {
  it("walks intro then A", () => {
    const session = createSession({ themeId: "menta", seed: "SEC" });
    assert.equal(sectionAtBar(session, 0).id, "INTRO");
    assert.equal(sectionAtBar(session, 4).id, "A");
  });
});

describe("export plan", () => {
  it("contains seed theme tempo scale motifs", () => {
    const session = createSession({ themeId: "glaciar", seed: "G1" });
    const json = exportPlan(session);
    assert.equal(json.seed, "G1");
    assert.equal(json.theme, "glaciar");
    assert.ok(json.motifs.length >= 2);
    assert.ok(json.tempo >= 64);
    assert.ok(json.dna);
    assert.equal(json.dna.harmonicColor, "crystal");
  });
});

describe("world grammars exist", () => {
  it("curates five distinct identities", () => {
    const ids = Object.keys(CURATED_THEMES);
    assert.deepEqual(ids.sort(), ["durazno", "eclipse", "glaciar", "lavanda", "menta"]);
    const tempos = ids.map((id) => CURATED_THEMES[id as keyof typeof CURATED_THEMES].tempoRange[0]);
    assert.ok(new Set(tempos).size >= 4);
  });
});

describe("theme catalog completeness", () => {
  it("lists procedural as a valid engine theme id", () => {
    assert.ok(THEME_IDS.includes("procedural"));
  });
});

describe("campaign motifs", () => {
  it("stores a 3–7 event signature motif per world", () => {
    for (const id of ["menta", "durazno", "lavanda", "glaciar", "eclipse"] as const) {
      const motif = CURATED_THEMES[id].motifs[0]!;
      assert.ok(motif.contour.length >= 3 && motif.contour.length <= 7, `${id} ${motif.contour.length}`);
      assert.equal(motif.contour.length, motif.rhythm.length);
    }
  });
});

describe("planet musical DNA", () => {
  it("is deterministic for the same profile", () => {
    const profile: PlanetMusicProfile = {
      seed: "DNA-1",
      biome: "ocean",
      mood: "hopeful",
      intensity: 0.4,
      temperature: 0.5,
      luminosity: 0.7,
      danger: 0.2,
      anomaly: 0.1,
    };
    assert.deepEqual(generatePlanetDna(profile), generatePlanetDna(profile));
  });

  it("diverges across planets instead of cloning a campaign world", () => {
    const a = generatePlanetDna({
      seed: "ALPHA",
      biome: "ocean",
      mood: "hopeful",
      intensity: 0.35,
      temperature: 0.4,
      luminosity: 0.8,
      danger: 0.1,
      anomaly: 0.1,
    });
    const b = generatePlanetDna({
      seed: "BETA",
      biome: "storm",
      mood: "dark",
      intensity: 0.8,
      temperature: 0.2,
      luminosity: 0.2,
      danger: 0.8,
      anomaly: 0.6,
    });
    assert.ok(
      a.tempo !== b.tempo || a.mode !== b.mode || a.harmonicColor !== b.harmonicColor || a.motifDNA.id !== b.motifDNA.id,
    );
    const themeA = themeFromDna(a);
    const themeB = themeFromDna(b);
    assert.notDeepEqual(themeA.motifs[0]!.contour, themeB.motifs[0]!.contour);
  });

  it("attaches DNA to procedural sessions", () => {
    const session = createSession({
      themeId: "procedural",
      seed: "PROC-9",
      profile: {
        seed: "PROC-9",
        biome: "crystal",
        mood: "mysterious",
        intensity: 0.45,
        temperature: 0.2,
        luminosity: 0.7,
        danger: 0.2,
        anomaly: 0.5,
      },
    });
    assert.equal(session.themeId, "procedural");
    assert.equal(session.dna.tempo, session.tempo);
    assert.equal(session.dna.tonic, session.tonicPc);
    assert.equal(session.dna.mode, session.scale);
  });
});
