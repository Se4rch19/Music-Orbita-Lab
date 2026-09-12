import { BEATS_PER_BAR, TICKS_PER_BEAT } from "./types.ts";

export type TransportState = {
  bpm: number;
  beatsPerBar: number;
  subdivision: number;
  currentBeat: number;
  currentBar: number;
  running: boolean;
  paused: boolean;
  startTime: number;
  pausedAt: number;
  elapsedBeats: number;
};

export class Transport {
  bpm: number;
  readonly beatsPerBar = BEATS_PER_BAR;
  readonly subdivision = TICKS_PER_BEAT;
  running = false;
  paused = false;
  currentBeat = 0;
  currentBar = 0;
  startTime = 0;
  private pauseOffset = 0;
  private lastTick = -1;

  constructor(bpm = 80) {
    this.bpm = bpm;
  }

  secondsPerBeat(): number {
    return 60 / Math.max(30, this.bpm);
  }

  secondsPerTick(): number {
    return this.secondsPerBeat() / this.subdivision;
  }

  start(audioTime: number) {
    this.running = true;
    this.paused = false;
    this.startTime = audioTime - this.pauseOffset;
    this.lastTick = -1;
  }

  pause(audioTime: number) {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.pauseOffset = audioTime - this.startTime;
  }

  resume(audioTime: number) {
    if (!this.paused) return;
    this.paused = false;
    this.startTime = audioTime - this.pauseOffset;
  }

  stop() {
    this.running = false;
    this.paused = false;
    this.pauseOffset = 0;
    this.currentBeat = 0;
    this.currentBar = 0;
    this.lastTick = -1;
    this.startTime = 0;
  }

  setBpm(bpm: number, audioTime: number) {
    const elapsed = this.elapsedBeats(audioTime);
    this.bpm = Math.max(48, Math.min(160, bpm));
    this.startTime = audioTime - elapsed * this.secondsPerBeat();
  }

  elapsedBeats(audioTime: number): number {
    if (!this.running) return 0;
    const t = this.paused ? this.pauseOffset : audioTime - this.startTime;
    return Math.max(0, t / this.secondsPerBeat());
  }

  beatTime(audioTime: number): { bar: number; beat: number; tick: number; fractionalBeat: number } {
    const beats = this.elapsedBeats(audioTime);
    const bar = Math.floor(beats / this.beatsPerBar);
    const beatInBar = beats - bar * this.beatsPerBar;
    const tick = Math.floor(beatInBar * this.subdivision);
    this.currentBar = bar;
    this.currentBeat = beatInBar;
    return { bar, beat: beatInBar, tick, fractionalBeat: beatInBar };
  }

  timeOfTick(bar: number, tick: number): number {
    const beats = bar * this.beatsPerBar + tick / this.subdivision;
    return this.startTime + beats * this.secondsPerBeat();
  }

  seekToBar(bar: number, audioTime: number) {
    const beats = Math.max(0, bar) * this.beatsPerBar;
    const offset = beats * this.secondsPerBeat();
    if (this.paused) {
      this.pauseOffset = offset;
    } else {
      this.startTime = audioTime - offset;
    }
    this.currentBar = Math.max(0, bar);
    this.currentBeat = 0;
    this.lastTick = Math.max(0, bar) * 16 - 1;
  }

  consumeTicks(audioTime: number, lookaheadSec: number): { bar: number; tick: number; time: number }[] {
    if (!this.running || this.paused) return [];
    const ahead = this.elapsedBeats(audioTime + lookaheadSec);
    const lastBeat = this.lastTick < 0 ? this.elapsedBeats(audioTime) : this.lastTick / this.subdivision;
    const startTick = Math.max(0, Math.floor(lastBeat * this.subdivision + 1e-6) + (this.lastTick < 0 ? 0 : 1));
    const endTick = Math.floor(ahead * this.subdivision);
    const events: { bar: number; tick: number; time: number }[] = [];
    for (let abs = startTick; abs <= endTick; abs++) {
      const bar = Math.floor(abs / 16);
      const tick = abs % 16;
      events.push({ bar, tick, time: this.timeOfTick(bar, abs % 16 + bar * 0) });
      events[events.length - 1]!.time = this.startTime + (abs / this.subdivision) * this.secondsPerBeat();
      this.lastTick = abs;
    }
    return events;
  }
}
