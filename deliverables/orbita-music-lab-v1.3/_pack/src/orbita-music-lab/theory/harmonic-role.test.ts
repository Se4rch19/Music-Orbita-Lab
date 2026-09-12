import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPrng } from "../core/prng.ts";
import { voiceChord } from "./chords.ts";
import { realizeMotif, varyMotif } from "./motifs.ts";
import {
  classifyNote,
  consonantPickupInterval,
  isHarshAgainstChord,
  isStrongTick,
  nearestChordTone,
  polishPhrase,
  tensionPolicyFor,
} from "./harmonic-role.ts";
import { MENTA } from "../themes/menta.ts";
import { ECLIPSE } from "../themes/eclipse.ts";
import type { ScoreNote } from "../core/types.ts";

function Iadd9() {
  return voiceChord({
    tonicPc: 0,
    scale: "lydian",
    symbol: { degree: 1, alteration: 0, quality: "add9", bars: 1 },
    lowMidi: 50,
    highMidi: 74,
  });
}

describe("tension policy", () => {
  it("keeps menta/durazno/glaciar strict and eclipse open", () => {
    assert.equal(tensionPolicyFor("menta", "lydian"), "strict");
    assert.equal(tensionPolicyFor("durazno", "mixolydian"), "strict");
    assert.equal(tensionPolicyFor("glaciar", "aeolian"), "strict");
    assert.equal(tensionPolicyFor("lavanda", "dorian"), "color");
    assert.equal(tensionPolicyFor("eclipse", "phrygian"), "open");
  });
});

describe("strong-beat membership", () => {
  it("treats ticks 0 and 8 as strong", () => {
    assert.equal(isStrongTick(0), true);
    assert.equal(isStrongTick(8), true);
    assert.equal(isStrongTick(4), false);
    assert.equal(isStrongTick(6), false);
  });

  it("snaps accidental clashes on strong beats under strict policy", () => {
    const chord = Iadd9();
    const clash: ScoreNote = { tick: 0, durationTicks: 2, midi: 66, velocity: 0.8, voice: "lead" }; // F# over C add9 (lydian #4 vs G)
    const polished = polishPhrase([clash], chord, 0, "lydian", "strict");
    assert.equal(isHarshAgainstChord(polished[0]!.midi, chord), false);
    assert.equal(classifyNote(polished[0]!.midi, chord, 0, "lydian"), "chord-tone");
  });
});

describe("passing-tone resolution", () => {
  it("resolves a pair of non-chord tones in strict policy", () => {
    const chord = Iadd9();
    const notes: ScoreNote[] = [
      { tick: 2, durationTicks: 2, midi: 65, velocity: 0.7, voice: "lead" }, // F
      { tick: 4, durationTicks: 2, midi: 66, velocity: 0.7, voice: "lead" }, // F#
    ];
    const polished = polishPhrase(notes, chord, 0, "lydian", "strict");
    const last = polished[polished.length - 1]!;
    assert.ok(!isHarshAgainstChord(last.midi, chord) || classifyNote(last.midi, chord, 0, "lydian") === "chord-tone");
    const roles = polished.map((n) => classifyNote(n.midi, chord, 0, "lydian"));
    assert.ok(roles.some((r) => r === "chord-tone" || r === "controlled-extension"));
  });
});

describe("pickup intervals", () => {
  it("accepts thirds and fifths, rejects tritones in strict worlds", () => {
    assert.equal(consonantPickupInterval(72, 76, "strict"), true);
    assert.equal(consonantPickupInterval(72, 79, "strict"), true);
    assert.equal(consonantPickupInterval(72, 78, "strict"), false);
    assert.equal(consonantPickupInterval(72, 73, "strict"), false);
    assert.equal(consonantPickupInterval(72, 73, "open"), true);
  });
});

describe("motif transformation compatibility", () => {
  it("keeps inverted/transposed motifs inside the chord on strong beats", () => {
    const chord = Iadd9();
    const rng = createPrng("motif-adapt");
    const varied = varyMotif(MENTA.motifs[0]!, "transpose", rng);
    const notes = realizeMotif({
      motif: varied,
      tonicPc: 0,
      scale: "lydian",
      chord,
      register: [67, 84],
      policy: "strict",
      polish: true,
    });
    for (const note of notes) {
      if (isStrongTick(note.tick)) {
        const role = classifyNote(note.midi, chord, 0, "lydian");
        assert.ok(role === "chord-tone" || role === "controlled-extension", `${note.midi} ${role}`);
      }
    }
  });

  it("does not erase eclipse phrygian color on weak ticks", () => {
    const chord = voiceChord({
      tonicPc: 4,
      scale: "phrygian",
      symbol: ECLIPSE.chordVocab[0]!,
      lowMidi: 43,
      highMidi: 67,
    });
    const notes = realizeMotif({
      motif: ECLIPSE.motifs[0]!,
      tonicPc: 4,
      scale: "phrygian",
      chord,
      register: [60, 79],
      policy: "open",
      polish: true,
    });
    assert.ok(notes.length >= 3);
    assert.ok(notes.some((n) => !isStrongTick(n.tick)));
  });
});

describe("nearest chord tone", () => {
  it("moves a clash onto the chord without leaping an octave", () => {
    const chord = Iadd9();
    const snapped = nearestChordTone(61, chord); // C# near C
    assert.ok(Math.abs(snapped - 61) <= 2);
    assert.ok(chord.pitchClasses.includes(((snapped % 12) + 12) % 12));
  });
});
