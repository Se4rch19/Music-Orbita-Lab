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

v1.3 does not add oscillators. The phrase planner is pure CPU on already-scheduled bars (one object per 8 bars). Effects wet is scaled by section using the existing space bus.

## Event frequency

At 80 BPM, 16th-note resolution is ~5.3 ticks/sec. Most ticks do not spawn a voice. A dense Eclipse bar might schedule ~20–28 short events; a Glaciar bar might schedule ~10–16 (pads and a crystalline bell always occupy the bar).

Pickup / orbit / damage events are one or two extra voices, stolen first if the ceiling is hit. Rapid pickup bursts keep the tactile click and thin the musical notes.

## Memory

- One cached 0.4 s noise buffer per AudioContext.
- One persistent FDN (4 delays) on the mixer.
- Composed bars are kept in a sliding window (~64 bars max) and discarded.
- Voices disconnect after envelope + 400 ms.
- `dispose()` closes the context.

There are no sample maps, no decode step, no asset cache.

## CPU safeguards

- Voice stealing when `maxVoices` is exceeded (lowest priority first: hats/clicks/tails, then pads, never pickups or the primary motif if something quieter exists).
- Pads are a 5-oscillator bed with one chorus delay, not a supersaw stack.
- Space is a small FDN, not convolution.
- Intensity and combo add layers by **un-gating existing grammars**, not by cloning engines.
- Offline render is opt-in and must never run during gameplay.

## Mastering chain (v1.2 / v1.3)

instrument buses (pad / bass / lead / perc)
→ music bus (user volume only — **no makeup here**)
→ SFX + space return
→ highpass ~70–80 Hz (per world)
→ mud cut ~260 Hz (−2.0 to −2.8 dB)
→ presence ~2.3 kHz (+1.4 to +1.8 dB)
→ air high-shelf ~7 kHz
→ compressor (threshold −14 dB, ratio 1.8 — Web Audio also applies hidden makeup)
→ **post-compressor theme makeup** (`POST_COMP_MAKEUP` × theme makeup, near unity)
→ 10% tanh saturation blend
→ limiter (threshold −1.2 dB, ratio 20)
→ master gain
→ optional speaker-preview EQ (lab only)
→ destination

v1.2 ducks the space send and feedback for ~250 ms at chord and world changes so old tails do not sit on top of the next harmony. v1.3 additionally scales space wet with form (INTRO larger, PEAK tighter). Makeup still lives after glue.

## Loudness (lab)

Live Peak / RMS are analyser estimates from a 2048-point time-domain window — not LUFS.

`measureOffline(seconds)` renders at 48 kHz and reports peak, RMS, and an **ungated** K-weighted estimate (`lufsUngated`) using ITU-R BS.1770 48 kHz coefficients **without** gating. Treat it as a mix diagnostic, not a broadcast meter.

Target for an 8–30 s evaluation render: roughly −16 to −14 LUFS ungated if the arrangement is dense, with sample peak below −1 dBFS. Sparse Glaciar will read quieter on RMS and still be clearly audible.
