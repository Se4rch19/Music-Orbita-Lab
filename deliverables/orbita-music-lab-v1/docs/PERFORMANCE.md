# Performance

Target: a lightweight Android WebView game that is already drawing orbits. Audio must not become the frame-time budget.

## Limits

| Budget | Value |
| --- | --- |
| Maximum simultaneous synth voices | 18 (configurable) |
| Typical active voices, Menta/Glaciar | 6–10 |
| Typical active voices, Durazno/Eclipse at high intensity | 10–16 |
| Oscillators per tonal voice | 1–3 |
| Scheduler lookahead | 120 ms |
| Scheduler poll | 25 ms (`setTimeout`, not `setInterval` audio timing) |
| Analyser FFT (demo only) | 256 bins |

Musical time is computed from `AudioContext.currentTime`. Visual frame rate does not drive the beat.

## Event frequency

At 80 BPM, 16th-note resolution is ~5.3 ticks/sec. Most ticks do not spawn a voice. A dense Eclipse bar might schedule ~18–25 short events; a Glaciar bar might schedule ~6–10.

Pickup / orbit / damage events are one or two extra voices, stolen first if the ceiling is hit.

## Memory

- One cached 0.4 s noise buffer per AudioContext.
- Composed bars are kept in a sliding window (~64 bars max) and discarded.
- Voices disconnect after envelope + 400 ms.
- `dispose()` closes the context.

There are no sample maps, no decode step, no asset cache.

## CPU safeguards

- Voice stealing when `maxVoices` is exceeded (oldest first).
- Pad voices use triangles, not stacks of supersaw unison.
- Reverb is **not** used; space comes from envelope and filter.
- Intensity and combo add layers by **un-gating existing grammars**, not by cloning engines.
- Offline render is opt-in and must never run during gameplay.

## Mobile speakers

- Bass floor: MIDI 36 (~65 Hz).
- Kick body around 46–148 Hz, with a tiny click so it reads on small drivers.
- Stereo pan clamped to ±0.7, most energy remains centered.
- Master compressor (ratio ~3, threshold −14 dB) prevents pickup transients from clipping.

## Recommended integration budget

On a mid-range Android device, keep the analyser **off** in production (it is demo-only). Do not call `renderOffline` on device. Poll `getDiagnostics()` at 4–10 Hz if you show a debug HUD; not every frame.

If a low-end device still struggles, drop `maxVoices` to 12 and prefer Calm / Menta-like densities. The grammar still holds.
