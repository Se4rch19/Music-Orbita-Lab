import { createMixer, type Mixer } from "../core/mixer.ts";
import { mixProfileFromDna } from "../core/mix-profile.ts";
import { createPrng } from "../core/prng.ts";
import { clamp01, midiToFreq, pcName } from "../core/pitch.ts";
import { Transport } from "../core/transport.ts";
import {
  MAX_VOICES_DEFAULT,
  type ChordVoicing,
  type CompositionPlanJson,
  type EngineConfig,
  type EngineDiagnostics,
  type EngineRevision,
  type GameMode,
  type LabLayer,
  type LightPickupOptions,
  type OrbitaThemeId,
  type PlanetMusicProfile,
  type SectionId,
  type StartThemeOptions,
  type TransitionOptions,
  type VoiceName,
} from "../core/types.ts";
import { VoiceManager } from "../core/voice-manager.ts";
import { validatePickup } from "../core/validation.ts";
import { choosePickupHarmony, choosePickupMidi, composeBar } from "../composition/compose-bar.ts";
import { chordAtBar, createSession, exportPlan, type SessionIdentity } from "../composition/session.ts";
import { SECTION_BARS } from "../composition/grammar.ts";
import { nextPhraseStart, phraseWindow } from "../composition/phrase.ts";
import { playVoice } from "../instruments/synth.ts";
import { isChordTone } from "../theory/chords.ts";
import { tensionPolicyFor } from "../theory/harmonic-role.ts";
import { isInScale, nearestScaleMidi } from "../theory/scales.ts";
import { encodeWav, measureBuffer, type LoudnessReport } from "./wav.ts";

export class OrbitaMusicEngine {
  private config: Required<EngineConfig>;
  private ctx: AudioContext | null = null;
  private mixer: Mixer | null = null;
  private transport = new Transport(80);
  private voices: VoiceManager;
  private session: SessionIdentity | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private intensity = 0.35;
  private targetIntensity = 0.35;
  private combo = 0;
  private mode: GameMode = "expedition";
  private composedBars = new Map<number, ReturnType<typeof composeBar>>();
  private lastVoicing: ChordVoicing | undefined;
  private pickupHistory: number[] = [];
  private lastPickupTime = 0;
  private pickupBurstWindow = 0;
  private pickupBurstCount = 0;
  private lastMusicalPickup = 0;
  private transitioning = false;
  private pending: {
    themeId: OrbitaThemeId;
    options: StartThemeOptions;
    switchAtBar: number;
    session: SessionIdentity;
  } | null = null;
  private disposed = false;
  private lastSection: SectionId | "idle" = "idle";
  private revision: EngineRevision = "v1.3";
  private sectionLoop: SectionId | null = null;
  private mutedLayers = new Set<LabLayer>();
  private soloLayers = new Set<LabLayer>();

  constructor(config: EngineConfig = {}) {
    this.config = {
      musicVolume: config.musicVolume ?? 1,
      sfxVolume: config.sfxVolume ?? 1,
      masterVolume: config.masterVolume ?? 1,
      maxVoices: config.maxVoices ?? MAX_VOICES_DEFAULT,
      lookaheadSec: config.lookaheadSec ?? 0.12,
      scheduleIntervalMs: config.scheduleIntervalMs ?? 25,
      revision: config.revision ?? "v1.3",
    };
    this.revision = this.config.revision;
    this.voices = new VoiceManager(this.config.maxVoices);
  }

  async initialize(): Promise<void> {
    if (this.ctx) return;
    const Ctor = globalThis.AudioContext || (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API is not available");
    this.ctx = new Ctor({ latencyHint: "interactive" });
    this.mixer = createMixer(this.ctx);
    this.mixer.setMusicVolume(this.config.musicVolume);
    this.mixer.setSfxVolume(this.config.sfxVolume);
    this.mixer.setMasterVolume(this.config.masterVolume);
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* wait for user gesture */
      }
    }
  }

  async resumeAudioContext(): Promise<void> {
    if (!this.ctx) await this.initialize();
    if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
  }

  startTheme(themeId: OrbitaThemeId, options: StartThemeOptions = {}): void {
    this.ensureAudio();
    this.stopInternal(false);
    this.session = createSession({
      themeId,
      seed: options.seed ?? `${themeId.toUpperCase()}-SEED`,
      variationSeed: options.variationSeed,
      profile: options.profile,
    });
    this.composedBars.clear();
    this.lastVoicing = undefined;
    this.pickupHistory = [];
    this.pickupBurstCount = 0;
    this.transitioning = false;
    this.pending = null;
    this.transport.bpm = this.session.tempo;
    this.applyMix();
    this.transport.start(this.ctx!.currentTime + 0.06);
    this.loop();
  }

  transitionToTheme(themeId: OrbitaThemeId, options: TransitionOptions = {}): void {
    if (!this.session || !this.ctx) {
      this.startTheme(themeId, options);
      return;
    }
    const next = createSession({
      themeId,
      seed: options.seed ?? `${themeId.toUpperCase()}-SEED`,
      variationSeed: options.variationSeed,
      profile: options.profile,
    });
    const currentBar = this.transport.beatTime(this.ctx.currentTime).bar;
    this.pending = {
      themeId,
      options,
      switchAtBar: currentBar + Math.max(2, options.bars ?? 2),
      session: next,
    };
    this.transitioning = true;
    const avg = Math.round((this.session.tempo + next.tempo) / 2);
    this.transport.setBpm(avg, this.ctx.currentTime);
    this.mixer?.prepareHarmonicChange(this.ctx.currentTime, 0.45);
  }

  transitionToPlanet(profile: PlanetMusicProfile, options: TransitionOptions = {}): void {
    this.transitionToTheme("procedural", { ...options, profile, seed: profile.seed });
  }

  setIntensity(value: number): void {
    this.targetIntensity = clamp01(value);
  }

  setCombo(combo: number): void {
    this.combo = Math.max(0, Math.min(999, Math.round(combo)));
  }

  setGameMode(mode: GameMode): void {
    this.mode = mode;
    if (mode === "calm") this.targetIntensity = Math.min(this.targetIntensity, 0.28);
  }

  triggerLightPickup(options: LightPickupOptions = {}): void {
    if (!this.session || !this.ctx || !this.mixer) return;
    const now = this.ctx.currentTime;
    const beat = this.transport.beatTime(now);
    const score = this.currentScore();
    const voicing = score?.chord ?? this.lastVoicing;
    if (!voicing) return;

    if (now - this.pickupBurstWindow > 0.35) this.pickupBurstCount = 0;
    this.pickupBurstWindow = now;
    this.pickupBurstCount += 1;
    this.lastPickupTime = now;

    const clickMidi = Math.min(96, 84 + (this.pickupBurstCount % 3));
    this.playAt("click", clickMidi, 0.07, 0.42, now, 0.2, this.mixer.sfx, 10);

    const allowMusical = this.pickupBurstCount <= 2 || now - this.lastMusicalPickup > 0.22;
    if (!allowMusical) return;
    if (!this.layerAudible("gameplay")) return;

    const rng = createPrng(`${this.session.variationSeed}::pickup:${this.pickupHistory.length}:${now.toFixed(3)}`);
    const strong = beat.fractionalBeat % 1 < 0.12 || Math.abs((beat.fractionalBeat % 1) - 0.5) < 0.08;
    const policy = tensionPolicyFor(this.session.themeId, this.session.scale, {
      anomaly: this.mode === "anomaly",
      tension: this.session.dna.tension,
    });
    const midi = choosePickupMidi({
      voicing,
      tonicPc: this.session.tonicPc,
      scale: this.session.scale,
      combo: this.combo,
      strongBeat: strong,
      rng,
      policy,
    });
    if (!validatePickup(midi, voicing, this.session.tonicPc, this.session.scale)) return;
    const velocity = clamp01(options.velocity ?? (0.9 + Math.min(0.1, this.combo * 0.008)));
    this.playAt("pickup", midi, 0.32, velocity, now, undefined, undefined, 10);
    this.pickupHistory.push(midi);
    if (this.pickupHistory.length > 12) this.pickupHistory.shift();
    this.lastMusicalPickup = now;
    if (this.combo >= 14 && this.pickupBurstCount <= 1 && rng.chance(0.55)) {
      const second = choosePickupHarmony(midi, voicing, this.session.tonicPc, this.session.scale, policy, rng);
      if (second !== null) this.playAt("pickup", second, 0.24, velocity * 0.62, now + 0.07, undefined, undefined, 10);
    }
  }

  triggerOrbitIn(): void {
    this.orbitAccent(-5);
  }

  triggerOrbitOut(): void {
    this.orbitAccent(7);
  }

  triggerShieldHit(): void {
    if (!this.session || !this.mixer || !this.ctx) return;
    const midi = (this.lastVoicing?.rootMidi ?? 60) + 12;
    this.playAt("click", midi, 0.12, 0.5, this.ctx.currentTime, undefined, this.mixer.sfx);
  }

  triggerDamage(): void {
    if (!this.session || !this.mixer || !this.ctx) return;
    const root = this.lastVoicing?.rootMidi ?? 48;
    const now = this.ctx.currentTime;
    this.playAt("event", root + 1, 0.14, 0.58, now);
    this.playAt("event", root + 6, 0.1, 0.38, now + 0.04);
  }

  triggerRunEnd(): void {
    if (!this.session || !this.mixer || !this.ctx) return;
    const tonic = 60 + this.session.tonicPc;
    const now = this.ctx.currentTime;
    this.playAt("pad", tonic, 1.6, 0.55, now);
    this.playAt("bell", tonic + 7, 0.8, 0.5, now + 0.18);
    this.playAt("bell", tonic + 12, 1.1, 0.45, now + 0.45);
  }

  setMusicVolume(value: number): void {
    this.config.musicVolume = clamp01(value);
    this.mixer?.setMusicVolume(this.config.musicVolume);
  }

  setSfxVolume(value: number): void {
    this.config.sfxVolume = clamp01(value);
    this.mixer?.setSfxVolume(this.config.sfxVolume);
  }

  setMasterVolume(value: number): void {
    this.config.masterVolume = clamp01(value);
    this.mixer?.setMasterVolume(this.config.masterVolume);
  }

  setSpeakerPreview(on: boolean): void {
    this.mixer?.setSpeakerPreview(on);
  }

  setRevision(revision: EngineRevision): void {
    this.revision = revision;
    this.config.revision = revision;
    this.applyMix();
  }

  setMuted(music: boolean, sfx: boolean): void {
    this.mixer?.setMusicMuted(music);
    this.mixer?.setSfxMuted(sfx);
  }

  setLayerMute(layer: LabLayer, muted: boolean): void {
    if (muted) this.mutedLayers.add(layer);
    else this.mutedLayers.delete(layer);
  }

  setLayerSolo(layer: LabLayer, solo: boolean): void {
    if (solo) this.soloLayers.add(layer);
    else this.soloLayers.delete(layer);
  }

  clearLayerFocus(): void {
    this.mutedLayers.clear();
    this.soloLayers.clear();
  }

  setSectionLoop(section: SectionId | null): void {
    this.sectionLoop = section;
    this.composedBars.clear();
  }

  restartPhrase(): void {
    if (!this.session || !this.ctx) return;
    const bar = this.transport.beatTime(this.ctx.currentTime).bar;
    const window = phraseWindow(this.session, bar, this.sectionLoop ?? undefined);
    this.composedBars.clear();
    this.lastVoicing = undefined;
    this.transport.seekToBar(window.startBar, this.ctx.currentTime);
  }

  nextPhrase(): void {
    if (!this.session || !this.ctx) return;
    const bar = this.transport.beatTime(this.ctx.currentTime).bar;
    const start = nextPhraseStart(this.session, bar);
    this.composedBars.clear();
    this.lastVoicing = undefined;
    this.transport.seekToBar(start, this.ctx.currentTime);
  }

  pause(): void {
    if (!this.ctx) return;
    this.transport.pause(this.ctx.currentTime);
  }

  resume(): void {
    if (!this.ctx) return;
    void this.resumeAudioContext();
    this.transport.resume(this.ctx.currentTime);
    this.loop();
  }

  stop(): void {
    this.stopInternal(true);
  }

  dispose(): void {
    this.stopInternal(true);
    this.mixer?.dispose();
    this.mixer = null;
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.disposed = true;
  }

  getDiagnostics(): EngineDiagnostics {
    const beat = this.ctx ? this.transport.beatTime(this.ctx.currentTime) : { bar: 0, beat: 0 };
    const meter = this.mixer?.readMeter();
    const score = this.currentScore();
    return {
      activeVoices: this.voices.activeVoices,
      scheduledEvents: this.voices.scheduledEvents,
      bpm: this.session?.tempo ?? this.transport.bpm,
      currentBar: beat.bar,
      currentBeat: Number(beat.beat.toFixed(3)),
      beatsPerBar: 4,
      subdivision: 4,
      section: score?.section ?? this.lastSection,
      theme: this.session?.themeId ?? "idle",
      intensity: this.intensity,
      combo: this.combo,
      mode: this.mode,
      seed: this.session?.seed ?? "",
      scale: this.session?.scale ?? "none",
      keyName: this.session ? pcName(this.session.tonicPc) : "-",
      running: this.transport.running,
      paused: this.transport.paused,
      suspended: this.ctx?.state === "suspended",
      masterVolume: this.mixer?.masterVolume ?? this.config.masterVolume,
      musicVolume: this.mixer?.musicVolume ?? this.config.musicVolume,
      sfxVolume: this.mixer?.sfxVolume ?? this.config.sfxVolume,
      peak: meter?.peak ?? 0,
      rms: meter?.rms ?? 0,
      peakDbfs: meter?.peakDbfs ?? -120,
      rmsDbfs: meter?.rmsDbfs ?? -120,
      limiterReduction: meter?.reduction ?? 0,
      compressorReduction: meter?.compressorReduction ?? 0,
      speakerPreview: this.mixer?.speakerPreview ?? false,
      revision: this.revision,
      phrase: score?.phrase,
      sectionLoop: this.sectionLoop,
      mutedLayers: [...this.mutedLayers],
      soloLayers: [...this.soloLayers],
    };
  }

  exportCompositionPlan(): CompositionPlanJson | null {
    if (!this.session) return null;
    return exportPlan(this.session);
  }

  getAnalyser(): AnalyserNode | null {
    return this.mixer?.analyser ?? null;
  }

  getCurrentHarmony(): { midiAllowed: number[]; chord: ChordVoicing | undefined; scale: string } {
    const score = this.currentScore();
    return {
      midiAllowed: score?.chord.midi ?? [],
      chord: score?.chord,
      scale: this.session?.scale ?? "none",
    };
  }

  async renderOffline(seconds: number): Promise<ArrayBuffer> {
    const rendered = await this.renderToBuffer(seconds);
    return encodeWav(rendered);
  }

  async measureOffline(seconds: number): Promise<LoudnessReport> {
    const rendered = await this.renderToBuffer(seconds);
    return measureBuffer(rendered);
  }

  private async renderToBuffer(seconds: number): Promise<AudioBuffer> {
    if (!this.session) throw new Error("Start a theme before rendering");
    const duration = Math.max(4, Math.min(90, seconds));
    const sampleRate = 48000;
    const offline = new OfflineAudioContext(2, Math.floor(sampleRate * duration), sampleRate);
    const mixer = createMixer(offline);
    mixer.setMusicVolume(this.config.musicVolume);
    mixer.setSfxVolume(this.config.sfxVolume);
    mixer.setMasterVolume(this.config.masterVolume);
    if (this.session.themeId === "procedural") mixer.setMixProfile(mixProfileFromDna(this.session.dna, this.revision));
    else mixer.setThemeMix(this.session.themeId, this.revision);

    const session = this.session;
    const spb = 60 / session.tempo;
    const bars = Math.ceil(duration / (spb * 4));
    let prev: ChordVoicing | undefined;
    const localVoices = new VoiceManager(this.config.maxVoices);
    for (let bar = 0; bar < bars; bar++) {
      const score = composeBar({
        session,
        barIndex: bar,
        intensity: this.intensity,
        combo: this.combo,
        mode: this.mode,
        previousVoicing: prev,
        pickupContour: this.pickupHistory,
        polish: this.revision !== "v1.1",
        composer: this.revision === "v1.3",
      });
      prev = score.chord;
      for (const note of score.notes) {
        if (!this.layerAudible(note.layer ?? "atmosphere")) continue;
        const time = bar * 4 * spb + (note.tick / 4) * spb;
        if (time >= duration) continue;
        const dur = (note.durationTicks / 4) * spb;
        const nodes = playVoice(note.voice, {
          ctx: offline,
          dest: mixer.busFor(note.voice),
          time,
          midi: note.midi,
          duration: dur,
          velocity: note.velocity,
          pan: note.pan,
          timbre: session.theme.timbre,
          intensity: this.intensity,
          send: mixer.space.input,
          sendGain: mixer.sendAmount(note.voice) * (score.phrase ? spaceSend(score.phrase.section) : 1),
          cleanTails: this.revision !== "v1.1",
        });
        localVoices.track(nodes, time + dur + 0.3, note.priority ?? voicePriority(note.voice));
      }
    }
    const rendered = await offline.startRendering();
    localVoices.dispose();
    mixer.dispose();
    return rendered;
  }

  private applyMix() {
    if (!this.mixer || !this.session) return;
    if (this.session.themeId === "procedural") this.mixer.setMixProfile(mixProfileFromDna(this.session.dna, this.revision));
    else this.mixer.setThemeMix(this.session.themeId, this.revision);
  }

  private loop = () => {
    if (this.disposed || !this.ctx || !this.session || !this.mixer) return;
    if (!this.transport.running || this.transport.paused) return;
    this.voices.sweep(this.ctx.currentTime);
    this.intensity += (this.targetIntensity - this.intensity) * 0.08;
    this.scheduleAhead();
    this.timer = setTimeout(this.loop, this.config.scheduleIntervalMs);
  };

  private scheduleAhead() {
    const ctx = this.ctx!;
    const lookahead = this.config.lookaheadSec;
    const now = ctx.currentTime;
    const spb = this.transport.secondsPerBeat();
    const startBeats = this.transport.elapsedBeats(now);
    const endBeats = this.transport.elapsedBeats(now + lookahead + 0.08);
    const startBar = Math.max(0, Math.floor(startBeats / 4));
    const endBar = Math.floor(endBeats / 4) + 1;

    for (let bar = startBar; bar <= endBar; bar++) {
      if (this.composedBars.has(bar)) continue;
      if (this.pending && bar >= this.pending.switchAtBar) this.advanceTransition(bar);
      const forceSection =
        this.sectionLoop ??
        (this.transitioning && this.pending && bar < this.pending.switchAtBar ? "TRANSITION" : undefined);
      const composeIndex = this.sectionLoop ? bar % SECTION_BARS[this.sectionLoop] : bar;
      const incomingVoicing =
        forceSection === "TRANSITION" && this.pending
          ? chordAtBar(this.pending.session, "A", 0, this.lastVoicing?.midi)
          : undefined;
      const previousPcs = this.lastVoicing?.pitchClasses.join(",");
      const score = composeBar({
        session: this.session!,
        barIndex: composeIndex,
        intensity: this.mode === "calm" ? Math.min(this.intensity, 0.3) : this.intensity,
        combo: this.combo,
        mode: this.mode,
        previousVoicing: this.lastVoicing,
        pickupContour: this.pickupHistory,
        forceSection,
        incomingVoicing,
        polish: this.revision !== "v1.1",
        composer: this.revision === "v1.3",
      });
      this.composedBars.set(bar, score);
      if (this.revision !== "v1.1" && previousPcs && previousPcs !== score.chord.pitchClasses.join(",")) {
        const barStart = this.transport.timeOfTick(bar, 0);
        this.mixer?.prepareHarmonicChange(barStart, 0.22);
      }
      if (this.revision === "v1.3" && score.phrase) {
        this.mixer?.space.setWetScale(score.phrase ? spaceSend(score.section) : 1, this.transport.timeOfTick(bar, 0));
      }
      this.lastVoicing = score.chord;
      this.lastSection = score.section;
      const barStart = this.transport.timeOfTick(bar, 0);
      for (const note of score.notes) {
        if (!this.layerAudible(note.layer ?? "atmosphere")) continue;
        const time = barStart + (note.tick / 4) * spb;
        if (time < now - 0.02) continue;
        const dur = (note.durationTicks / 4) * spb;
        this.playAt(note.voice, note.midi, dur, note.velocity, time, note.pan, undefined, note.priority);
      }
    }

    if (this.composedBars.size > 64) {
      const minKeep = startBar - 4;
      for (const key of this.composedBars.keys()) {
        if (key < minKeep) this.composedBars.delete(key);
      }
    }
  }

  private layerAudible(layer: LabLayer): boolean {
    if (this.soloLayers.size > 0) return this.soloLayers.has(layer);
    return !this.mutedLayers.has(layer);
  }

  private advanceTransition(_bar: number) {
    if (!this.pending || !this.session) return;
    const next = this.pending.session;
    this.pending = null;
    this.transitioning = false;
    this.session = next;
    if (this.ctx) {
      this.transport.setBpm(this.session.tempo, this.ctx.currentTime);
      this.mixer?.prepareHarmonicChange(this.ctx.currentTime, 0.4);
    }
    this.applyMix();
  }

  private currentScore() {
    if (!this.ctx) return undefined;
    const bar = this.transport.beatTime(this.ctx.currentTime).bar;
    return this.composedBars.get(bar);
  }

  private orbitAccent(offset: number) {
    if (!this.session || !this.mixer || !this.ctx) return;
    if (!this.layerAudible("gameplay")) return;
    const base = this.lastVoicing?.rootMidi ?? 72;
    let midi = base + offset;
    if (!isInScale(midi, this.session.tonicPc, this.session.scale) && this.lastVoicing && !isChordTone(midi, this.lastVoicing)) {
      midi = nearestScaleMidi(midi, this.session.tonicPc, this.session.scale);
    }
    this.playAt("bell", midi, 0.2, 0.46, this.ctx.currentTime, 0.15, this.mixer.sfx, 9);
  }

  private playAt(
    voice: VoiceName,
    midi: number,
    duration: number,
    velocity: number,
    time: number,
    pan?: number,
    destOverride?: AudioNode,
    priority?: number,
  ) {
    if (!this.ctx || !this.session || !this.mixer) return;
    const freq = midiToFreq(midi);
    if (!Number.isFinite(freq) || freq < 20 || freq > 8000) return;
    const dest = destOverride ?? this.mixer.busFor(voice);
    const nodes = playVoice(voice, {
      ctx: this.ctx,
      dest,
      time,
      midi,
      duration,
      velocity: clamp01(velocity),
      pan,
      timbre: this.session.theme.timbre,
      intensity: this.intensity,
      send: this.mixer.space.input,
      sendGain: this.mixer.sendAmount(voice),
      cleanTails: this.revision !== "v1.1",
    });
    this.voices.track(nodes, time + duration + (this.revision === "v1.1" ? 0.4 : 0.22), priority ?? voicePriority(voice));
  }

  private stopInternal(resetTransport: boolean) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.voices.dispose();
    this.composedBars.clear();
    if (resetTransport) this.transport.stop();
  }

  private ensureAudio() {
    if (this.disposed) throw new Error("Engine disposed");
    if (!this.ctx || !this.mixer) {
      throw new Error("Call initialize() before starting audio");
    }
  }
}

export function allowedPickupPitch(engine: OrbitaMusicEngine): boolean {
  const harmony = engine.getCurrentHarmony();
  return Boolean(harmony.chord);
}

function voicePriority(voice: VoiceName): number {
  if (voice === "pickup") return 10;
  if (voice === "event") return 9;
  if (voice === "lead") return 8;
  if (voice === "bass") return 7;
  if (voice === "kick" || voice === "pluck") return 6;
  if (voice === "pad") return 5;
  if (voice === "bell" || voice === "snare") return 4;
  return 2;
}

function spaceSend(section: SectionId): number {
  if (section === "INTRO") return 1.25;
  if (section === "BUILD") return 1.18;
  if (section === "PEAK") return 0.82;
  if (section === "RECOVERY") return 1.32;
  if (section === "TRANSITION") return 1.2;
  return 1;
}
