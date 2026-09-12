# Integration contract

This document is for the coding agent that will wire Órbita Music Lab into the Órbita Capacitor app. The engine is standalone. Do not couple it to this demo UI.

## 1. Requirements

- TypeScript project
- Web Audio API (Chrome, Edge, Android WebView, Capacitor)
- A user gesture before audible playback (browser autoplay policy)
- No network at runtime

Copy `src/orbita-music-lab/` into the game, or import it as a workspace package. Runtime dependency count: **zero**.

```ts
import {
  OrbitaMusicEngine,
  type PlanetMusicProfile,
  type OrbitaTheme,
} from "./orbita-music-lab";
```

## 2. Initialization

```ts
const music = new OrbitaMusicEngine({
  musicVolume: 1,
  sfxVolume: 1,
  masterVolume: 1,
  maxVoices: 24,
});

await music.initialize();
```

`initialize()` constructs the `AudioContext` and mixer. It is safe if the context starts `suspended`.

## 3. User-gesture unlock

On the first tap / swipe that the OS considers a gesture:

```ts
await music.resumeAudioContext();
```

Call this again when the app returns from background if Android suspended the context.

Do not throw if resume is a no-op.

## 4. Starting music

```ts
music.startTheme("menta", {
  seed: runSeed, // e.g. "MENTA-2026-001"
});
```

Valid themes: `"menta" | "durazno" | "lavanda" | "glaciar" | "eclipse" | "procedural"`.

For a post-campaign planet:

```ts
const profile: PlanetMusicProfile = {
  seed: planetSeed,
  biome: "ocean",
  mood: "hopeful",
  intensity: 0.4,
  temperature: 0.5,
  luminosity: 0.7,
  danger: 0.2,
  anomaly: 0.1,
};
music.startTheme("procedural", { seed: planetSeed, profile });
```

## 5. Game intensity

```ts
game.on("intensity", (value: number) => {
  music.setIntensity(value); // 0..1
});
```

Intensity changes **density, percussion, brightness, harmonic activity**. It does not simply raise volume. Values are smoothed internally. Prefer updating every few hundred milliseconds, not every frame.

## 6. Combo

```ts
game.on("combo", (value: number) => {
  music.setCombo(value);
});
```

Higher combo may lift register, add a quiet counterline, and add rhythmic detail. Keep it from the game’s real combo counter; do not invent a second curve.

## 7. Light pickups (critical)

```ts
game.on("lightCollected", () => {
  music.triggerLightPickup();
});
```

The engine:

- plays an immediate transient (no perceptible lag)
- chooses a pitch from the **current chord / scale**
- prefers chord tones on strong beats
- may add a short second tone at high combo, interval-checked so it does not clash
- stores the pitch contour so later phrases can echo the player, subtly

Do **not** play a separate generic coin SFX on top unless it is very quiet. The pickup is already part of the soundtrack.

Optional diagnostics (v1.1, additive — ignore if unused):

- `getDiagnostics()` includes `peakDbfs`, `rmsDbfs`, `limiterReduction`, `compressorReduction`.
- `measureOffline(seconds)` returns peak / RMS and an ungated K-weighted estimate at 48 kHz. Lab tool, not a runtime path.

## 8. Orbit movement

```ts
game.on("orbitIn", () => music.triggerOrbitIn());
game.on("orbitOut", () => music.triggerOrbitOut());
```

These are small scalar accents, not stingers.

Optional:

```ts
music.triggerShieldHit();
music.triggerDamage();
music.triggerRunEnd();
```

## 9. Switching planets / worlds

Campaign:

```ts
game.on("worldChanged", (world: OrbitaTheme) => {
  music.transitionToTheme(world, { seed: nextSeed });
});
```

Infinite Journey planets:

```ts
music.transitionToPlanet(profile);
```

Transitions wait for a bar boundary, pass through a short pivot, and interpolate tempo. Do not call `stop()` between worlds.

## 10. Game modes

```ts
music.setGameMode("expedition"); // campaign default
music.setGameMode("calm");
music.setGameMode("daily");
music.setGameMode("infinite");
music.setGameMode("anomaly");
```

One engine, parameterized. Calm reduces percussion and tension without muting identity.

## 11. Pausing the app

```ts
document.addEventListener("visibilitychange", () => {
  if (document.hidden) music.pause();
  else {
    void music.resumeAudioContext();
    music.resume();
  }
});
```

`pause()` freezes musical time. `resume()` continues from the same bar. `stop()` ends the run. `dispose()` tears down nodes and closes the context (call on teardown only).

## 12. Volume settings

The game owns UI.

```ts
music.setMasterVolume(1); // 0..1, default 1. Intended engine level.
music.setMusicVolume(1);  // 0..1, default 1
music.setSfxVolume(1);
music.setMuted(false, false); // music, events
```

v1.1 restaged the mix. Do **not** initialize music at 0.85 unless you want it quieter than the lab. Pickup / orbit / damage use the SFX bus so a player can lower music and still hear events.

`getDiagnostics()` now also reports `masterVolume`, `musicVolume`, `sfxVolume`, `peakDbfs`, `rmsDbfs`, and `limiterReduction`. These are live estimates from an analyser, not LUFS.

`exportCompositionPlan()` includes optional `dna` (`PlanetMusicalDNA`) describing the session fingerprint.

Lab-only (ignore in the game): `setRevision("v1.1" | "v1.2")` and `EngineConfig.revision` compare the v1.1 mix against the v1.2 harmonic polish. The game should omit this and stay on the default (`v1.2`).

## 13. Cleanup

```ts
music.stop();
music.dispose();
```

Always dispose when leaving a scene that will not return. Voice nodes disconnect themselves after envelopes; `dispose()` is the hard guarantee.

## 14. Mobile considerations

- Do not expect sub-30 Hz bass; the engine stays at MIDI 36+.
- Stereo width is modest so phone speakers still read the pulse.
- Keep `maxVoices` around 22–28 (engine default is 28). Voice stealing drops hats/clicks/tails first; pickups and the primary motif are protected.
- Unlock audio on the first swipe, not on page load.
- Test on a real device speaker, not only headphones.

## 15. Expected performance

See [PERFORMANCE.md](./PERFORMANCE.md). Typical load is well under a competing render thread if voice limits are respected. `getDiagnostics()` is cheap; poll it for a debug overlay if needed.

```ts
music.getDiagnostics();
// { activeVoices, scheduledEvents, bpm, currentBar, section, theme, intensity }
```

Debug export (development only):

```ts
const plan = music.exportCompositionPlan();
```

Offline WAV render is **not** for production gameplay. It exists for evaluation:

```ts
const wav = await music.renderOffline(30);
```

## Example wiring (pseudo)

```ts
const music = new OrbitaMusicEngine();
await music.initialize();

music.startTheme("menta", { seed: runSeed });

game.on("intensity", (value) => music.setIntensity(value));
game.on("combo", (value) => music.setCombo(value));
game.on("lightCollected", () => music.triggerLightPickup());
game.on("orbitIn", () => music.triggerOrbitIn());
game.on("orbitOut", () => music.triggerOrbitOut());
game.on("worldChanged", (world) => music.transitionToTheme(world));
```

The engine does not depend on Órbita’s event bus. Translate however the game already emits signals.

## 16. Revision (lab only)

Game code should construct `new OrbitaMusicEngine()` with no `revision`. The default is **v1.3**.

```ts
// Lab A/B/C only — do not ship this in Órbita.
music.setRevision("v1.2");
```

Lab-only methods (solo/mute, section loop, phrase seek) must not be called from the game.

