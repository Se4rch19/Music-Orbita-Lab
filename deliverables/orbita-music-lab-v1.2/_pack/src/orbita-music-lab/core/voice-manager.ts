import { MAX_VOICES_DEFAULT } from "./types.ts";

export type TrackedVoice = {
  nodes: AudioNode[];
  stopAt: number;
  priority: number;
};

export class VoiceManager {
  private voices: TrackedVoice[] = [];
  readonly maxVoices: number;
  scheduledEvents = 0;

  constructor(maxVoices = MAX_VOICES_DEFAULT) {
    this.maxVoices = maxVoices;
  }

  get activeVoices(): number {
    return this.voices.length;
  }

  peekPriorities(): number[] {
    return this.voices.map((v) => v.priority);
  }

  track(nodes: AudioNode[], stopAt: number, priority = 1) {
    this.voices.push({ nodes, stopAt, priority });
    this.scheduledEvents += 1;
    while (this.voices.length > this.maxVoices) {
      let idx = 0;
      for (let i = 1; i < this.voices.length; i++) {
        const a = this.voices[i]!;
        const b = this.voices[idx]!;
        if (a.priority < b.priority || (a.priority === b.priority && a.stopAt < b.stopAt)) idx = i;
      }
      const victim = this.voices.splice(idx, 1)[0];
      if (victim) this.stopNow(victim);
    }
  }

  sweep(now: number) {
    const keep: TrackedVoice[] = [];
    for (const voice of this.voices) {
      if (voice.stopAt <= now) this.disconnect(voice);
      else keep.push(voice);
    }
    this.voices = keep;
  }

  dispose() {
    for (const voice of this.voices) this.stopNow(voice);
    this.voices = [];
    this.scheduledEvents = 0;
  }

  private stopNow(voice: TrackedVoice) {
    for (const node of voice.nodes) {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          (node as OscillatorNode).stop();
        }
      } catch {
        /* already stopped */
      }
    }
    this.disconnect(voice);
  }

  private disconnect(voice: TrackedVoice) {
    for (const node of voice.nodes) {
      try {
        node.disconnect();
      } catch {
        /* already disconnected */
      }
    }
  }
}
