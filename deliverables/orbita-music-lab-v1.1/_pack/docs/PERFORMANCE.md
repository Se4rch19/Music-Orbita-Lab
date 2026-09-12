# Performance

Target: a lightweight Android WebView game that is already drawing orbits. Audio must not become the frame-time budget.

## Limits

| Budget | Value |
| --- | --- |
| Maximum simultaneous synth voices | 28 (configurable, default) |
| Typical active voices, Menta/Glaciar | 10–20 |
| Typical active voices, Durazno/Eclipse at high intensity | 16–26 |
| Oscillators per tonal voice | pad 5, lead 3, bass 3, others 1–2 |
| Scheduler lookahead | 120 ms |
| Scheduler poll | 25 ms (`setTimeout`, not `setInterval` audio timing) |
| Analyser FFT (demo only) | 256 bins (visual) + 2048 (meter) |
| Space | 4-delay FDN, one persistent bus |

Musical time is computed from `AudioContext.currentTime`. Visual frame rate does not drive the beat.

## Event frequency

At 80 BPM, 16th-note resolution is ~5.3 ticks/sec. Most ticks do not spawn a voice. A dense Eclipse bar might schedule ~20–28 short events; a Glaciar bar might schedule ~10–16 (pads and a crystalline bell always occupy the bar).

Pickup / orbit / damage events are one or two extra voices, stolen first if the ceiling is hit.

## Memory

- One cached 0.4 s noise buffer per AudioContext.
- One persistent FDN (4 delays) on the mixer.
- Composed bars are kept in a sliding window (~64 bars max) and discarded.
- Voices disconnect after envelope + 400 ms.
- `dispose()` closes the context.

There are no sample maps, no decode step, no asset cache.

## CPU safeguards

- Voice stealing when `maxVoices` is exceeded (lowest priority, then oldest).
- Pads are a 5-oscillator bed with one chorus delay, not a supersaw stack.
- Space is a small FDN, not convolution.
- Intensity and combo add layers by **un-gating existing grammars**, not by cloning engines.
- Offline render is opt-in and must never run during gameplay.

## Mastering chain (v1.1)

instrument buses (pad / bass / lead / perc)
→ music bus (user volume only — **no makeup here**)
→ SFX + space return
→ highpass 62 Hz
→ mud cut ~280 Hz (−1.6 dB)
→ presence ~2.4 kHz (+2.6 dB)
→ air high-shelf ~6.8 kHz (+1.6 dB)
→ compressor (threshold −14 dB, ratio 1.8 — Web Audio also applies hidden makeup)
→ **post-compressor theme makeup** (`POST_COMP_MAKEUP` × theme makeup, near unity)
→ 12% tanh saturation blend
→ limiter (threshold −1.2 dB, ratio 20)
→ master gain
→ optional speaker-preview EQ (lab only)
→ destination

v1 applied theme makeup *before* the compressor. Sparse worlds never reached the threshold, so they stayed quiet; dense worlds were then squashed. Makeup now lives after glue. Do not stack extra makeup on top of the Web Audio compressor’s hidden makeup, or the limiter will brickwall. Do not add a second limiter in the game.

## Loudness (lab)

Live Peak / RMS are analyser estimates from a 2048-point time-domain window — not LUFS.

`measureOffline(seconds)` renders at 48 kHz and reports peak, RMS, and an **ungated** K-weighted estimate (`lufsUngated`) using ITU-R BS.1770 48 kHz coefficients **without** gating. Treat it as a mix diagnostic, not a broadcast meter.

Target for an 8–30 s evaluation render: roughly −16 to −14 LUFS ungated if the arrangement is dense, with sample peak below −1 dBFS. Sparse Glaciar will read quieter on RMS and still be clearly audible.
