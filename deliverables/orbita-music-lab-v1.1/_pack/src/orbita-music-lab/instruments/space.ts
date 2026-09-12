import type { SpaceProfile } from "../core/mix-profile.ts";

export type SpaceBus = {
  input: GainNode;
  output: GainNode;
  setProfile: (profile: SpaceProfile) => void;
  dispose: () => void;
};

/**
 * Lightweight 4-delay FDN-style space. Persistent on the mixer, not per voice.
 * Sized for presence: enough width to feel planetary, not enough wet to bury the dry mix.
 */
export function createSpace(ctx: BaseAudioContext): SpaceBus {
  const input = ctx.createGain();
  input.gain.value = 1;
  const output = ctx.createGain();
  output.gain.value = 0.2;
  const pre = ctx.createDelay(0.08);
  pre.delayTime.value = 0.018;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 220;
  input.connect(pre);
  pre.connect(hp);

  const times = [0.0297, 0.0371, 0.0411, 0.0437];
  const delays: DelayNode[] = [];
  const filters: BiquadFilterNode[] = [];
  const feedbacks: GainNode[] = [];
  const taps: StereoPannerNode[] = [];

  times.forEach((t, i) => {
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = t * 5.5;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4800;
    const fb = ctx.createGain();
    fb.gain.value = 0.46;
    const pan = ctx.createStereoPanner();
    pan.pan.value = i % 2 === 0 ? -0.5 : 0.5;
    hp.connect(delay);
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
      const wet = Math.max(0, Math.min(0.55, profile.wet));
      const now = "currentTime" in ctx ? ctx.currentTime : 0;
      pre.delayTime.value = Math.max(0.004, Math.min(0.06, profile.preDelay));
      output.gain.setTargetAtTime(wet, now, 0.05);
      times.forEach((t, i) => {
        delays[i]!.delayTime.value = Math.min(0.95, t * size * 6.2);
        filters[i]!.frequency.value = 2200 + (1 - damp) * 3600;
        feedbacks[i]!.gain.value = 0.3 + (1 - damp) * 0.22;
      });
    },
    dispose() {
      try {
        input.disconnect();
        output.disconnect();
        pre.disconnect();
        hp.disconnect();
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
