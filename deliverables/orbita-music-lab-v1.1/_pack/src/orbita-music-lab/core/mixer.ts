import { mixProfileFor, POST_COMP_MAKEUP, type MixProfile } from "./mix-profile.ts";
import { createSpace, type SpaceBus } from "../instruments/space.ts";
import type { OrbitaThemeId, VoiceName } from "./types.ts";

export type Mixer = {
  ctx: BaseAudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
  pad: GainNode;
  bass: GainNode;
  lead: GainNode;
  perc: GainNode;
  compressor: DynamicsCompressorNode;
  limiter: DynamicsCompressorNode;
  makeup: GainNode;
  analyser: AnalyserNode;
  meter: AnalyserNode;
  space: SpaceBus;
  musicVolume: number;
  sfxVolume: number;
  masterVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  speakerPreview: boolean;
  setMusicVolume: (value: number) => void;
  setSfxVolume: (value: number) => void;
  setMasterVolume: (value: number) => void;
  setMusicMuted: (muted: boolean) => void;
  setSfxMuted: (muted: boolean) => void;
  setThemeMix: (theme: OrbitaThemeId) => void;
  setMixProfile: (next: MixProfile) => void;
  setSpeakerPreview: (on: boolean) => void;
  busFor: (voice: VoiceName) => GainNode;
  sendAmount: (voice: VoiceName) => number;
  readMeter: () => {
    peak: number;
    rms: number;
    peakDbfs: number;
    rmsDbfs: number;
    reduction: number;
    compressorReduction: number;
  };
  dispose: () => void;
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1.5, value));
}

function tanhShaper(drive: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return curve;
}

/**
 * Signal path:
 *   instrument buses → music / SFX
 *   space return ───┘
 *   → HP → mud cut → presence → air
 *   → compressor (gentle glue; Web Audio also applies hidden makeup)
 *   → post-comp theme makeup (near unity — do not double the compressor)
 *   → dry + gentle sat
 *   → limiter / safety
 *   → master
 *   → optional speaker-preview EQ
 *   → analyser + destination
 */
export function createMixer(ctx: BaseAudioContext): Mixer {
  const pad = ctx.createGain();
  const bass = ctx.createGain();
  const lead = ctx.createGain();
  const perc = ctx.createGain();
  pad.gain.value = 1;
  bass.gain.value = 1;
  lead.gain.value = 1;
  perc.gain.value = 1;

  const music = ctx.createGain();
  music.gain.value = 1;
  const sfx = ctx.createGain();
  sfx.gain.value = 1;
  pad.connect(music);
  bass.connect(music);
  lead.connect(music);
  perc.connect(music);

  const hipass = ctx.createBiquadFilter();
  hipass.type = "highpass";
  hipass.frequency.value = 62;
  hipass.Q.value = 0.65;

  const mud = ctx.createBiquadFilter();
  mud.type = "peaking";
  mud.frequency.value = 280;
  mud.gain.value = -1.6;
  mud.Q.value = 0.75;

  const presence = ctx.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = 2400;
  presence.gain.value = 2.6;
  presence.Q.value = 0.7;

  const air = ctx.createBiquadFilter();
  air.type = "highshelf";
  air.frequency.value = 6800;
  air.gain.value = 1.6;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 10;
  compressor.ratio.value = 1.8;
  compressor.attack.value = 0.024;
  compressor.release.value = 0.24;

  const makeup = ctx.createGain();
  makeup.gain.value = POST_COMP_MAKEUP;

  const saturator = ctx.createWaveShaper();
  saturator.curve = tanhShaper(1.45);
  saturator.oversample = "2x";
  const satMix = ctx.createGain();
  satMix.gain.value = 0.12;
  const dry = ctx.createGain();
  dry.gain.value = 0.94;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -1.2;
  limiter.knee.value = 0.15;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.09;

  const master = ctx.createGain();
  master.gain.value = 1;

  const speakerHp = ctx.createBiquadFilter();
  speakerHp.type = "highpass";
  speakerHp.frequency.value = 20;
  const speakerLp = ctx.createBiquadFilter();
  speakerLp.type = "lowpass";
  speakerLp.frequency.value = 18000;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  const meter = ctx.createAnalyser();
  meter.fftSize = 2048;
  meter.smoothingTimeConstant = 0.25;

  const space = createSpace(ctx);

  music.connect(hipass);
  sfx.connect(hipass);
  space.output.connect(hipass);
  hipass.connect(mud);
  mud.connect(presence);
  presence.connect(air);
  air.connect(compressor);
  compressor.connect(makeup);
  makeup.connect(dry);
  makeup.connect(saturator);
  saturator.connect(satMix);
  dry.connect(limiter);
  satMix.connect(limiter);
  limiter.connect(master);
  master.connect(speakerHp);
  speakerHp.connect(speakerLp);
  speakerLp.connect(analyser);
  speakerLp.connect(meter);
  if ("destination" in ctx) {
    analyser.connect((ctx as AudioContext).destination);
  }

  let profile: MixProfile = mixProfileFor("menta");
  space.setProfile(profile.space);

  const apply = () => {
    const t = "currentTime" in ctx ? ctx.currentTime : 0;
    const musicG = mixer.musicMuted ? 0 : mixer.musicVolume;
    const sfxG = mixer.sfxMuted ? 0 : mixer.sfxVolume;
    music.gain.setTargetAtTime(musicG, t, 0.03);
    sfx.gain.setTargetAtTime(sfxG, t, 0.03);
    master.gain.setTargetAtTime(mixer.masterVolume, t, 0.03);
    pad.gain.setTargetAtTime(profile.pad, t, 0.05);
    bass.gain.setTargetAtTime(profile.bass, t, 0.05);
    lead.gain.setTargetAtTime(profile.lead, t, 0.05);
    perc.gain.setTargetAtTime(profile.perc, t, 0.05);
    makeup.gain.setTargetAtTime(POST_COMP_MAKEUP * profile.makeup, t, 0.05);
  };

  const timeDomain = new Uint8Array(new ArrayBuffer(2048));

  const mixer: Mixer = {
    ctx,
    master,
    music,
    sfx,
    pad,
    bass,
    lead,
    perc,
    compressor,
    limiter,
    makeup,
    analyser,
    meter,
    space,
    musicVolume: 1,
    sfxVolume: 1,
    masterVolume: 1,
    musicMuted: false,
    sfxMuted: false,
    speakerPreview: false,
    setMusicVolume(value) {
      mixer.musicVolume = clamp(value);
      apply();
    },
    setSfxVolume(value) {
      mixer.sfxVolume = clamp(value);
      apply();
    },
    setMasterVolume(value) {
      mixer.masterVolume = clamp(value);
      apply();
    },
    setMusicMuted(muted) {
      mixer.musicMuted = muted;
      apply();
    },
    setSfxMuted(muted) {
      mixer.sfxMuted = muted;
      apply();
    },
    setThemeMix(theme) {
      profile = mixProfileFor(theme);
      space.setProfile(profile.space);
      apply();
    },
    setMixProfile(next) {
      profile = next;
      space.setProfile(profile.space);
      apply();
    },
    setSpeakerPreview(on) {
      mixer.speakerPreview = on;
      speakerHp.frequency.value = on ? 260 : 20;
      speakerLp.frequency.value = on ? 4500 : 18000;
      presence.gain.value = on ? 3.6 : 2.6;
      air.gain.value = on ? 2.4 : 1.6;
    },
    busFor(voice) {
      if (voice === "pad" || voice === "noise") return pad;
      if (voice === "bass") return bass;
      if (voice === "kick" || voice === "snare" || voice === "hat" || voice === "click") return perc;
      if (voice === "pickup" || voice === "event") return sfx;
      return lead;
    },
    sendAmount(voice) {
      return profile.sends[voice] ?? 0;
    },
    readMeter() {
      try {
        meter.getByteTimeDomainData(timeDomain);
      } catch {
        return {
          peak: 0,
          rms: 0,
          peakDbfs: -120,
          rmsDbfs: -120,
          reduction: 0,
          compressorReduction: 0,
        };
      }
      let peak = 0;
      let sum = 0;
      for (let i = 0; i < timeDomain.length; i++) {
        const x = ((timeDomain[i] ?? 128) - 128) / 128;
        const a = Math.abs(x);
        if (a > peak) peak = a;
        sum += x * x;
      }
      const rms = Math.sqrt(sum / timeDomain.length);
      const toDbfs = (v: number) => (v <= 1e-8 ? -120 : 20 * Math.log10(v));
      return {
        peak,
        rms,
        peakDbfs: toDbfs(peak),
        rmsDbfs: toDbfs(rms),
        reduction: limiter.reduction ?? 0,
        compressorReduction: compressor.reduction ?? 0,
      };
    },
    dispose() {
      try {
        pad.disconnect();
        bass.disconnect();
        lead.disconnect();
        perc.disconnect();
        music.disconnect();
        sfx.disconnect();
        hipass.disconnect();
        mud.disconnect();
        presence.disconnect();
        air.disconnect();
        compressor.disconnect();
        makeup.disconnect();
        saturator.disconnect();
        satMix.disconnect();
        dry.disconnect();
        limiter.disconnect();
        master.disconnect();
        speakerHp.disconnect();
        speakerLp.disconnect();
        analyser.disconnect();
        meter.disconnect();
        space.dispose();
      } catch {
        /* already disconnected */
      }
    },
  };
  apply();
  return mixer;
}
