import { midiToFreq } from "../core/pitch.ts";
import { VOICE_PEAK } from "../core/mix-profile.ts";
import type { InstrumentTimbre, VoiceName } from "../core/types.ts";

export type PlayVoiceOpts = {
  ctx: BaseAudioContext;
  dest: AudioNode;
  time: number;
  midi: number;
  duration: number;
  velocity: number;
  pan?: number;
  timbre: InstrumentTimbre;
  intensity: number;
  send?: AudioNode;
  sendGain?: number;
};

export function playVoice(name: VoiceName, opts: PlayVoiceOpts): AudioNode[] {
  switch (name) {
    case "pad":
      return playPad(opts);
    case "pluck":
    case "arp":
      return playPluck(opts, name);
    case "bass":
      return playBass(opts);
    case "lead":
      return playLead(opts);
    case "bell":
      return playBell(opts);
    case "kick":
      return playKick(opts);
    case "snare":
      return playSnare(opts);
    case "hat":
      return playHat(opts);
    case "click":
      return playClick(opts);
    case "noise":
      return playNoise(opts);
    case "pickup":
      return playPickup(opts);
    case "event":
      return playEvent(opts);
    default:
      return playPluck(opts, "pluck");
  }
}

function peak(name: VoiceName, velocity: number): number {
  const v = Number.isFinite(velocity) ? Math.max(0.08, Math.min(1.2, velocity)) : 0.75;
  return VOICE_PEAK[name] * v;
}

function tapSend(opts: PlayVoiceOpts, source: AudioNode): AudioNode[] {
  if (!opts.send || !opts.sendGain || opts.sendGain <= 0.01) return [];
  const g = opts.ctx.createGain();
  g.gain.value = Math.max(0, Math.min(0.7, opts.sendGain));
  source.connect(g);
  g.connect(opts.send);
  return [g];
}

function playPad(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
  const freq = midiToFreq(midi);
  const cutoff = Math.max(1400, timbre.padCutoff * (0.78 + intensity * 0.85));
  const mix = ctx.createGain();
  const lvl = peak("pad", velocity);
  mix.gain.setValueAtTime(0.0001, time);
  mix.gain.exponentialRampToValueAtTime(lvl, time + 0.07);
  mix.gain.setTargetAtTime(lvl * 0.9, time + 0.18, 0.2);
  mix.gain.setTargetAtTime(0.0001, time + Math.max(0.55, duration - 0.35), 0.32);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff * 0.85, time);
  filter.frequency.setTargetAtTime(cutoff, time + 0.4, 0.6);
  filter.Q.value = 0.5;

  const output = panNode(ctx, dest, pan);
  mix.connect(filter);
  filter.connect(output);

  const chorus = ctx.createDelay(0.04);
  chorus.delayTime.value = 0.012;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.21;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.0035;
  lfo.connect(lfoG);
  lfoG.connect(chorus.delayTime);
  const chorusG = ctx.createGain();
  chorusG.gain.value = 0.45;
  filter.connect(chorus);
  chorus.connect(chorusG);
  chorusG.connect(output);
  lfo.start(time);
  lfo.stop(time + duration + 0.5);

  const nodes: AudioNode[] = [mix, filter, output, chorus, lfo, lfoG, chorusG, ...tapSend(opts, output)];
  const layers: { type: OscillatorType; detune: number; gain: number; ratio: number }[] = [
    { type: "sawtooth", detune: -timbre.padDetune, gain: 0.3, ratio: 1 },
    { type: "triangle", detune: 0, gain: 0.44, ratio: 1 },
    { type: "sawtooth", detune: timbre.padDetune, gain: 0.3, ratio: 1 },
    { type: "sine", detune: 0, gain: 0.24, ratio: 0.5 },
  ];
  for (const layer of layers) {
    const osc = ctx.createOscillator();
    osc.type = layer.type;
    osc.frequency.value = freq * layer.ratio;
    osc.detune.value = layer.detune;
    const g = ctx.createGain();
    g.gain.value = layer.gain;
    osc.connect(g);
    g.connect(mix);
    osc.start(time);
    osc.stop(time + duration + 0.35);
    nodes.push(osc, g);
  }
  return nodes;
}

function playPluck(opts: PlayVoiceOpts, name: VoiceName): AudioNode[] {
  const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
  const osc = ctx.createOscillator();
  osc.type = name === "arp" ? "triangle" : "sawtooth";
  osc.frequency.value = midiToFreq(midi);
  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.value = midiToFreq(midi);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  const startCut = Math.max(1600, timbre.pluckCutoff * (0.9 + intensity * 0.45));
  filter.frequency.setValueAtTime(startCut, time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(420, startCut * 0.28), time + Math.min(0.32, duration));
  const mix = ctx.createGain();
  const o1 = ctx.createGain();
  o1.gain.value = 0.78;
  const o2 = ctx.createGain();
  o2.gain.value = 0.4;
  const gain = ctx.createGain();
  const lvl = peak(name, velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.18, duration));
  const output = panNode(ctx, dest, pan);
  osc.connect(o1);
  body.connect(o2);
  o1.connect(mix);
  o2.connect(mix);
  mix.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  osc.start(time);
  body.start(time);
  osc.stop(time + duration + 0.06);
  body.stop(time + duration + 0.06);
  return [osc, body, o1, o2, mix, filter, gain, output, ...tapSend(opts, output)];
}

function playBass(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, duration, velocity, timbre, intensity } = opts;
  const freq = midiToFreq(Math.max(36, midi));
  const sine = ctx.createOscillator();
  sine.type = "sine";
  sine.frequency.value = freq;
  const oct = ctx.createOscillator();
  oct.type = "triangle";
  oct.frequency.value = freq * 2;
  const third = ctx.createOscillator();
  third.type = "sine";
  third.frequency.value = freq * 3;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.max(820, timbre.bassCutoff * (1.35 + intensity * 0.55));
  filter.Q.value = 0.65;
  const mix = ctx.createGain();
  const sineG = ctx.createGain();
  sineG.gain.value = 1;
  const octG = ctx.createGain();
  octG.gain.value = 0.55;
  const thirdG = ctx.createGain();
  thirdG.gain.value = 0.22;
  const gain = ctx.createGain();
  const lvl = peak("bass", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.01);
  gain.gain.setTargetAtTime(lvl * 0.72, time + 0.07, 0.08);
  gain.gain.setTargetAtTime(0.0001, time + Math.max(0.2, duration - 0.04), 0.07);
  sine.connect(sineG);
  oct.connect(octG);
  third.connect(thirdG);
  sineG.connect(mix);
  octG.connect(mix);
  thirdG.connect(mix);
  mix.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  sine.start(time);
  oct.start(time);
  third.start(time);
  sine.stop(time + duration + 0.08);
  oct.stop(time + duration + 0.08);
  third.stop(time + duration + 0.08);
  return [sine, oct, third, sineG, octG, thirdG, mix, filter, gain, ...tapSend(opts, gain)];
}

function playLead(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = midiToFreq(midi);
  osc.detune.value = -7;
  const uni = ctx.createOscillator();
  uni.type = "sawtooth";
  uni.frequency.value = midiToFreq(midi);
  uni.detune.value = 8;
  const sub = ctx.createOscillator();
  sub.type = "triangle";
  sub.frequency.value = midiToFreq(midi);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.max(1800, timbre.leadCutoff * (0.85 + intensity * 0.6));
  filter.Q.value = 0.95;
  const mix = ctx.createGain();
  const g1 = ctx.createGain();
  g1.gain.value = 0.52;
  const g2 = ctx.createGain();
  g2.gain.value = 0.42;
  const g3 = ctx.createGain();
  g3.gain.value = 0.32;
  const gain = ctx.createGain();
  const lvl = peak("lead", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.012);
  gain.gain.setTargetAtTime(lvl * 0.7, time + 0.08, 0.1);
  gain.gain.setTargetAtTime(0.0001, time + Math.max(0.18, duration - 0.05), 0.08);
  const output = panNode(ctx, dest, pan);
  osc.connect(g1);
  uni.connect(g2);
  sub.connect(g3);
  g1.connect(mix);
  g2.connect(mix);
  g3.connect(mix);
  mix.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  osc.start(time);
  uni.start(time);
  sub.start(time);
  osc.stop(time + duration + 0.08);
  uni.stop(time + duration + 0.08);
  sub.stop(time + duration + 0.08);
  return [osc, uni, sub, g1, g2, g3, mix, filter, gain, output, ...tapSend(opts, output)];
}

function playBell(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, duration, velocity, timbre, pan } = opts;
  const freq = midiToFreq(midi);
  const ratios = [1, 2.01 + timbre.bellInharmonic, 2.99, 4.12 + timbre.bellInharmonic * 1.2];
  const weights = [1, 0.38, 0.18, 0.1];
  const mix = ctx.createGain();
  const lvl = peak("bell", velocity);
  mix.gain.setValueAtTime(0.0001, time);
  mix.gain.exponentialRampToValueAtTime(lvl, time + 0.004);
  mix.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.45, duration * 1.6));
  const output = panNode(ctx, dest, pan);
  mix.connect(output);
  const oscs: AudioNode[] = [...tapSend(opts, output)];
  ratios.forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const partial = ctx.createGain();
    partial.gain.value = weights[i] ?? 0.08;
    osc.connect(partial);
    partial.connect(mix);
    osc.start(time);
    osc.stop(time + duration + 0.35);
    oscs.push(osc, partial);
  });
  return [...oscs, mix, output];
}

function playKick(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, velocity } = opts;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(178, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.09);
  const gain = ctx.createGain();
  const lvl = peak("kick", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.26);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.32);
  const click = ctx.createOscillator();
  click.type = "square";
  click.frequency.value = 640;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(lvl * 0.22, time);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.022);
  click.connect(clickGain);
  clickGain.connect(dest);
  click.start(time);
  click.stop(time + 0.04);
  return [osc, gain, click, clickGain];
}

function playSnare(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, velocity } = opts;
  const noise = noiseSource(ctx, time, 0.22);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 850;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.65;
  const gain = ctx.createGain();
  const lvl = peak("snare", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
  noise.connect(hp);
  hp.connect(bp);
  bp.connect(gain);
  gain.connect(dest);
  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(220, time);
  body.frequency.exponentialRampToValueAtTime(130, time + 0.08);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(lvl * 0.42, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
  body.connect(bodyGain);
  bodyGain.connect(dest);
  body.start(time);
  body.stop(time + 0.14);
  return [noise, hp, bp, gain, body, bodyGain, ...tapSend(opts, gain)];
}

function playHat(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, velocity, midi } = opts;
  const noise = noiseSource(ctx, time, 0.12);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = midi > 82 ? 7400 : 5800;
  const gain = ctx.createGain();
  const dur = midi > 82 ? 0.15 : 0.05;
  const lvl = peak("hat", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  noise.connect(hp);
  hp.connect(gain);
  gain.connect(dest);
  return [noise, hp, gain];
}

function playClick(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, velocity, pan } = opts;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = midiToFreq(Math.max(74, midi));
  const gain = ctx.createGain();
  const lvl = peak("click", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
  const output = panNode(ctx, dest, pan ?? 0.2);
  osc.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc.stop(time + 0.12);
  return [osc, gain, output, ...tapSend(opts, output)];
}

function playNoise(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, duration, velocity, timbre } = opts;
  const noise = noiseSource(ctx, time, duration);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1700;
  filter.Q.value = 0.4;
  const gain = ctx.createGain();
  gain.gain.value = peak("noise", velocity) * (0.45 + timbre.noiseAmount);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  return [noise, filter, gain, ...tapSend(opts, gain)];
}

function playPickup(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, velocity, pan } = opts;
  const freq = midiToFreq(midi);
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.value = freq * 2;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(6200, time);
  filter.frequency.exponentialRampToValueAtTime(1800, time + 0.26);
  const gain = ctx.createGain();
  const lvl = peak("pickup", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
  const output = panNode(ctx, dest, pan ?? 0);
  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc2.start(time);
  osc.stop(time + 0.42);
  osc2.stop(time + 0.42);
  const noise = noiseSource(ctx, time, 0.04);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3200;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(lvl * 0.7, time);
  nGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.028);
  noise.connect(hp);
  hp.connect(nGain);
  nGain.connect(output);
  return [osc, osc2, filter, gain, output, noise, hp, nGain, ...tapSend(opts, output)];
}

function playEvent(opts: PlayVoiceOpts): AudioNode[] {
  const { ctx, dest, time, midi, velocity } = opts;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(midiToFreq(midi), time);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, midiToFreq(midi) * 0.55), time + 0.12);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const gain = ctx.createGain();
  const lvl = peak("event", velocity);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(lvl, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.18);
  return [osc, filter, gain];
}

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseSource(ctx: BaseAudioContext, time: number, duration: number): AudioBufferSourceNode {
  let buffer = noiseCache.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.4)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ctx, buffer);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start(time);
  src.stop(time + duration + 0.02);
  return src;
}

function panNode(ctx: BaseAudioContext, dest: AudioNode, pan?: number): AudioNode {
  if (pan === undefined || Math.abs(pan) < 0.02) {
    const g = ctx.createGain();
    g.connect(dest);
    return g;
  }
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-0.72, Math.min(0.72, pan));
  panner.connect(dest);
  return panner;
}
