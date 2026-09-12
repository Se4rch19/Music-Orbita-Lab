export type LoudnessReport = {
  peak: number;
  rms: number;
  peakDbfs: number;
  rmsDbfs: number;
  /** Ungated K-weighted estimate at 48 kHz only. Null otherwise. Not a broadcast meter. */
  lufsUngated: number | null;
};

function toDbfs(v: number): number {
  return v <= 1e-8 ? -120 : 20 * Math.log10(v);
}

/**
 * Peak / RMS always. Ungated K-weighted loudness when the buffer is 48 kHz
 * (ITU-R BS.1770 pre-filter + RLB coefficients). No gating, no true-peak
 * oversampling — labelled as an estimate, not LUFS-I.
 */
export function measureBuffer(buffer: AudioBuffer): LoudnessReport {
  const ch0 = buffer.getChannelData(0);
  const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
  const n = ch0.length;
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const l = ch0[i] ?? 0;
    const r = ch1[i] ?? 0;
    const a = Math.max(Math.abs(l), Math.abs(r));
    if (a > peak) peak = a;
    sum += l * l + r * r;
  }
  const rms = Math.sqrt(sum / (n * Math.max(1, buffer.numberOfChannels)));
  const lufsUngated =
    Math.abs(buffer.sampleRate - 48000) < 1 ? kWeightedUngated(ch0, ch1) : null;
  return {
    peak,
    rms,
    peakDbfs: toDbfs(peak),
    rmsDbfs: toDbfs(rms),
    lufsUngated,
  };
}

function kWeightedUngated(left: Float32Array, right: Float32Array): number {
  const a = kFilter(left);
  const b = kFilter(right);
  let power = 0;
  const n = a.length;
  for (let i = 0; i < n; i++) power += ((a[i] ?? 0) ** 2 + (b[i] ?? 0) ** 2) * 0.5;
  const mean = power / Math.max(1, n);
  if (mean <= 1e-12) return -70;
  return -0.691 + 10 * Math.log10(mean);
}

function kFilter(input: Float32Array): Float32Array {
  const stage1 = biquad(
    input,
    [1.53512485958697, -2.69169618940638, 1.19839281085285],
    [1, -1.69065929318241, 0.73248077421585],
  );
  return biquad(stage1, [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]);
}

function biquad(input: Float32Array, b: number[], a: number[]): Float32Array {
  const out = new Float32Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  const b0 = b[0] ?? 1;
  const b1 = b[1] ?? 0;
  const b2 = b[2] ?? 0;
  const a1 = a[1] ?? 0;
  const a2 = a[2] ?? 0;
  for (let i = 0; i < input.length; i++) {
    const x = input[i] ?? 0;
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }
  return out;
}

export function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const out = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(out);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const interleaved = new Int16Array(out, headerSize);
  const chans: Float32Array[] = [];
  for (let c = 0; c < channels; c++) chans.push(buffer.getChannelData(c));
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, chans[c]![i] ?? 0));
      interleaved[cursor++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
  }
  return out;
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}
