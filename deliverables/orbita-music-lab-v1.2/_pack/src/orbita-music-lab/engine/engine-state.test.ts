import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clamp01 } from "../core/pitch.ts";
import { Transport } from "../core/transport.ts";
import { VoiceManager } from "../core/voice-manager.ts";
import { createSession } from "../composition/session.ts";
import { composeBar } from "../composition/compose-bar.ts";
import { validateBar, validateNote } from "../core/validation.ts";
import { midiToFreq } from "../core/pitch.ts";

describe("intensity and combo bounds", () => {
  it("clamps intensity to 0..1", () => {
    assert.equal(clamp01(-2), 0);
    assert.equal(clamp01(3), 1);
    assert.equal(clamp01(0.4), 0.4);
    assert.equal(clamp01(Number.NaN), 0);
  });
});

describe("transport", () => {
  it("starts, pauses and resumes without jumping backwards", () => {
    const t = new Transport(80);
    t.start(0);
    const beatsAt1 = t.elapsedBeats(1);
    t.pause(1);
    assert.equal(t.paused, true);
    t.resume(5);
    const beatsAt6 = t.elapsedBeats(6);
    assert.ok(Math.abs(beatsAt6 - (beatsAt1 + 80 / 60)) < 0.0001);
  });

  it("stop resets counters", () => {
    const t = new Transport(90);
    t.start(0);
    t.stop();
    assert.equal(t.running, false);
    assert.equal(t.currentBar, 0);
  });
});

describe("voice manager", () => {
  it("enforces a voice ceiling", () => {
    const vm = new VoiceManager(3);
    for (let i = 0; i < 6; i++) vm.track([], i + 1);
    assert.equal(vm.activeVoices, 3);
  });

  it("sweeps expired voices", () => {
    const vm = new VoiceManager(8);
    vm.track([], 1);
    vm.track([], 5);
    vm.sweep(2);
    assert.equal(vm.activeVoices, 1);
    vm.dispose();
    assert.equal(vm.activeVoices, 0);
  });

  it("steals lowest priority first so pickups and melody survive", () => {
    const vm = new VoiceManager(3);
    vm.track([], 10, 10);
    vm.track([], 10, 8);
    vm.track([], 10, 1);
    vm.track([], 10, 2);
    assert.equal(vm.activeVoices, 3);
    const ranks = vm.peekPriorities().sort((a, b) => b - a);
    assert.deepEqual(ranks, [10, 8, 2]);
  });
});

describe("voice ceiling default", () => {
  it("keeps the mobile budget at 28", async () => {
    const { MAX_VOICES_DEFAULT } = await import("../core/types.ts");
    assert.equal(MAX_VOICES_DEFAULT, 28);
    assert.ok(MAX_VOICES_DEFAULT <= 28);
  });
});

describe("musical validation", () => {
  it("rejects NaN and negative durations", () => {
    const issues = validateNote({
      tick: 0,
      durationTicks: -1,
      midi: Number.NaN,
      velocity: -0.2,
      voice: "lead",
    });
    const codes = issues.map((i) => i.code);
    assert.ok(codes.includes("nan-midi"));
    assert.ok(codes.includes("duration"));
    assert.ok(codes.includes("gain"));
  });

  it("composed bars stay frequency-safe", () => {
    const session = createSession({ themeId: "eclipse", seed: "SAFE" });
    const bar = composeBar({ session, barIndex: 2, intensity: 0.6, combo: 3, mode: "expedition" });
    for (const note of bar.notes) {
      const freq = midiToFreq(note.midi);
      assert.ok(freq >= 20 && freq <= 8000);
    }
    const issues = validateBar(bar, session.tonicPc, session.scale).filter((i) =>
      ["nan-midi", "freq-bounds", "duration", "gain"].includes(i.code),
    );
    assert.equal(issues.length, 0);
  });
});

describe("theme transition state is a new session", () => {
  it("creates a distinct identity when the seed changes", () => {
    const a = createSession({ themeId: "menta", seed: "T1" });
    const b = createSession({ themeId: "durazno", seed: "T1" });
    assert.notEqual(a.theme.id, b.theme.id);
  });
});
