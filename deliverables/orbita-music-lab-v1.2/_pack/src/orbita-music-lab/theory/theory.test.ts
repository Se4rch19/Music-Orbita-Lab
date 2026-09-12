import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPrng } from "../core/prng.ts";
import { chordKey, chordPitchClasses, voiceChord, isChordTone } from "./chords.ts";
import { generateProgression } from "./harmony.ts";
import { realizeMotif, varyMotif } from "./motifs.ts";
import { isInScale, scalePitchClasses, SCALE_INTERVALS } from "./scales.ts";
import { MENTA } from "../themes/menta.ts";

describe("scales", () => {
  it("has seven degrees for diatonic scales", () => {
    assert.equal(SCALE_INTERVALS.lydian.length, 7);
    assert.equal(SCALE_INTERVALS.phrygian.length, 7);
  });

  it("recognizes in-scale pitches", () => {
    assert.equal(isInScale(60, 0, "major"), true);
    assert.equal(isInScale(61, 0, "major"), false);
  });
});

describe("chords", () => {
  it("builds add9 pitch classes from tonic", () => {
    const pcs = chordPitchClasses(0, "major", {
      degree: 1,
      alteration: 0,
      quality: "add9",
      bars: 1,
    });
    assert.ok(pcs.includes(0));
    assert.ok(pcs.includes(4));
    assert.ok(pcs.includes(7));
    assert.ok(pcs.includes(2));
  });

  it("voices within register and keeps finite midi", () => {
    const voiced = voiceChord({
      tonicPc: 0,
      scale: "lydian",
      symbol: { degree: 1, alteration: 0, quality: "maj7", bars: 2 },
      lowMidi: 50,
      highMidi: 74,
    });
    assert.ok(voiced.midi.length >= 3);
    for (const midi of voiced.midi) {
      assert.ok(Number.isFinite(midi));
      assert.ok(midi >= 50 && midi <= 74);
    }
    assert.ok(voiced.bassMidi >= 36);
  });

  it("voice-leads toward previous voicing", () => {
    const first = voiceChord({
      tonicPc: 0,
      scale: "major",
      symbol: { degree: 1, alteration: 0, quality: "maj", bars: 1 },
      lowMidi: 52,
      highMidi: 76,
    });
    const next = voiceChord({
      tonicPc: 0,
      scale: "major",
      symbol: { degree: 4, alteration: 0, quality: "maj", bars: 1 },
      previous: first.midi,
      lowMidi: 52,
      highMidi: 76,
    });
    const movement = next.midi.reduce((sum, midi, i) => sum + Math.abs(midi - (first.midi[i] ?? midi)), 0);
    assert.ok(movement < 24);
  });
});

describe("harmony graph", () => {
  it("generates a valid progression of the requested length", () => {
    const rng = createPrng("MENTA-2026-001::prog");
    const chords = generateProgression(MENTA.progressionGraph, 8, rng, MENTA.chordVocab);
    const bars = chords.reduce((sum, c) => sum + c.bars, 0);
    assert.equal(bars, 8);
    for (const chord of chords) {
      assert.ok(chord.degree >= 1 && chord.degree <= 7);
      assert.ok(chordKey(chord).includes(":"));
    }
  });

  it("is reproducible", () => {
    const a = generateProgression(MENTA.progressionGraph, 8, createPrng("x"), MENTA.chordVocab);
    const b = generateProgression(MENTA.progressionGraph, 8, createPrng("x"), MENTA.chordVocab);
    assert.deepEqual(a, b);
  });
});

describe("motifs", () => {
  it("realizes notes inside scale or chord", () => {
    const motif = MENTA.motifs[0]!;
    const chord = voiceChord({
      tonicPc: 0,
      scale: "lydian",
      symbol: MENTA.chordVocab[0]!,
      lowMidi: 50,
      highMidi: 74,
    });
    const notes = realizeMotif({
      motif,
      tonicPc: 0,
      scale: "lydian",
      chord,
      register: [67, 84],
    });
    assert.ok(notes.length >= 3);
    const pcs = scalePitchClasses(0, "lydian");
    for (const note of notes) {
      const pc = ((note.midi % 12) + 12) % 12;
      assert.ok(pcs.includes(pc) || isChordTone(note.midi, chord));
      assert.ok(note.durationTicks > 0);
    }
  });

  it("variation changes identity but stays structured", () => {
    const rng = createPrng("var");
    const inverted = varyMotif(MENTA.motifs[0]!, "invert", rng);
    assert.equal(inverted.contour.length, MENTA.motifs[0]!.contour.length);
    assert.notDeepEqual(inverted.contour, MENTA.motifs[0]!.contour);
  });
});
