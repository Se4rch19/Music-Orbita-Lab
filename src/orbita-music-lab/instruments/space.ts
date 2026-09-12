import { spaceFeedback } from "../core/mix-profile.ts";
import type { SpaceProfile } from "../core/mix-profile.ts";

export type SpaceBus = {
  input: GainNode;
  output: GainNode;
  setProfile: (profile: SpaceProfile) => void;
  setWetScale: (scale: number, time?: number) => void;
  duck: (time: number, seconds?: number) => void;
  dispose: () => void;
};

/**
 * Lightweight 4-delay FDN-style space. Persistent on the mixer, not per voice.
 * v1.2: tighter feedback, higher HP, so tails deepen the mix without smearing the next chord.
 */
export function createSpace(ctx: BaseAudioContext): SpaceBus {
  const input = ctx.createGain();
  input.gain.value = 1;
  const output = ctx.createGain();
  output.gain.value = 0.16;
  const pre = ctx.createDelay(0.08);
  pre.delayTime.value = 0.018;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 280;
  const dampShelf = ctx.createBiquadFilter();
  dampShelf.type = "lowshelf";
  dampShelf.frequency.value = 320;
  dampShelf.gain.value = -2.5;
  input.connect(pre);
  pre.connect(hp);
  hp.connect(dampShelf);

  const times = [0.0297, 0.0371, 0.0411, 0.0437];
  const delays: DelayNode[] = [];
  const filters: BiquadFilterNode[] = [];
  const feedbacks: GainNode[] = [];
  const taps: StereoPannerNode[] = [];
  let wet = 0.16;
  let fbValue = 0.34;

  times.forEach((t, i) => {
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = t * 5.2;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4200;
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const pan = ctx.createStereoPanner();
    pan.pan.value = i % 2 === 0 ? -0.48 : 0.48;
    dampShelf.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(pan);
    pan.connect(output);
    delays.push(delay);
    filters.push(lp);
    feedbacks.push(fb);
    taps.push(pan);
  });

  return {
    input,
    output,
    setProfile(profile) {
      const size = Math.max(0.5, Math.min(2, profile.size));
      const damp = Math.max(0.1, Math.min(0.9, profile.damp));
      wet = Math.max(0, Math.min(0.42, profile.wet));
      fbValue = spaceFeedback(damp);
      const now = "currentTime" in ctx ? ctx.currentTime : 0;
      pre.delayTime.value = Math.max(0.004, Math.min(0.06, profile.preDelay));
      output.gain.setTargetAtTime(wet, now, 0.05);
      hp.frequency.setTargetAtTime(260 + damp * 80, now, 0.05);
      dampShelf.gain.setTargetAtTime(-1.8 - damp * 1.4, now, 0.05);
      times.forEach((t, i) => {
        delays[i]!.delayTime.value = Math.min(0.85, t * size * 5.6);
        filters[i]!.frequency.value = 2000 + (1 - damp) * 2800;
        feedbacks[i]!.gain.setTargetAtTime(fbValue, now, 0.05);
      });
    },
    setWetScale(scale, time) {
      const now = time ?? ("currentTime" in ctx ? ctx.currentTime : 0);
      const s = Math.max(0.5, Math.min(1.5, scale));
      output.gain.setTargetAtTime(wet * s, now, 0.08);
    },
    duck(time, seconds = 0.28) {
      const dur = Math.max(0.12, Math.min(0.6, seconds));
      output.gain.setTargetAtTime(wet * 0.48, time, 0.04);
      output.gain.setTargetAtTime(wet, time + dur, 0.14);
      for (const fb of feedbacks) {
        fb.gain.setTargetAtTime(fbValue * 0.42, time, 0.03);
        fb.gain.setTargetAtTime(fbValue, time + dur, 0.12);
      }
    },
    dispose() {
      try {
        input.disconnect();
        output.disconnect();
        pre.disconnect();
        hp.disconnect();
        dampShelf.disconnect();
        delays.forEach((n) => n.disconnect());
        filters.forEach((n) => n.disconnect());
        feedbacks.forEach((n) => n.disconnect());
        taps.forEach((n) => n.disconnect());
      } catch {
        /* already disconnected */
      }
    },
  };
}
