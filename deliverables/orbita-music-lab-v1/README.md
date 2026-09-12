# Órbita Music Lab

A standalone, offline procedural composition engine for the mobile game **Órbita**.

This is not a loop player and not a collection of random beeps. It generates original structured music — tempo, harmony, bass, percussion, motifs, sections — and reacts to gameplay (intensity, combo, light pickups, orbit changes) in real time.

The engine is portable TypeScript + Web Audio. The page you are looking at is the listening lab: pick a world, press Play, and judge whether it actually sounds like music.

## What it is

- Fully offline. No APIs, no samples, no soundfonts, no streaming.
- Deterministic when seeded (`MENTA-2026-001` always yields the same musical identity).
- Lightweight. Almost entirely code. Suitable for Capacitor / Android WebView.
- Five curated campaign worlds — Menta, Durazno, Lavanda, Glaciar, Eclipse — plus procedural planets.
- Light pickups become notes inside the current harmony, not random SFX.

## Listening lab

Open the app and tap **Play**. Start with **Menta**. Let it run for a minute, then:

1. Raise **Intensity** and hear density, percussion, and brightness change — not just volume.
2. Tap **Collect light** and listen for notes that belong to the chord.
3. Switch worlds and hear a short musical transition, not a hard cut.
4. Try **Calm** mode: more space, less percussion, same identity.

## Engine location

```
src/orbita-music-lab/
```

Import from the package entry:

```ts
import {
  OrbitaMusicEngine,
  type PlanetMusicProfile,
  type OrbitaTheme,
} from "./orbita-music-lab";
```

## Commands

| Task | Command |
| --- | --- |
| Dev lab | `npm run dev` |
| Tests | `npm run test:engine` |
| Typecheck | `npm run typecheck` |
| Production build | `npm run build` |

## Architecture

```
Transport (lookahead scheduler)
  → Bar composer (harmony, bass, percussion, motif, arp)
    → Synth voices (oscillators, filters, envelopes)
      → Music / SFX buses → compressor → master
```

Composition is pure and deterministic. Audio is a renderer. That split is what makes tests meaningful and keeps the soundtrack stable if the game frame rate stutters.

## Worlds

| World | Character |
| --- | --- |
| Menta | Beginning, discovery, luminous, ~76 BPM, Lydian / major pentatonic |
| Durazno | Warm, playful, rhythmic confidence, ~98 BPM, Mixolydian |
| Lavanda | Alien geometry, dreamlike, ~84 BPM, Dorian / Lydian mixture |
| Glaciar | Sparse, crystalline, elegant, ~70 BPM, Aeolian |
| Eclipse | Deep, tense, final, ~108 BPM, Phrygian / harmonic minor |

Procedural planets map biome, mood, danger, luminosity and anomaly onto the same grammar system.

## Determinism

`seed` chooses key, scale, tempo (within the world range), motifs, and progression graphs.

`variationSeed` (defaults to `seed::v0`) chooses bar-level ornaments so two sessions can share identity without being sample-identical if you pass a different variation seed.

## Integration

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for the contract another coding agent should follow when wiring this into Órbita.

Originality process: [docs/ORIGINALITY.md](docs/ORIGINALITY.md)  
Mobile/CPU notes: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)

## Offline guarantee

Runtime requires no network. Fonts in the demo UI are the only remote request, and they are not part of the engine. The soundtrack itself is synthesised on device.

## License

MIT. Compositions are generated from general music theory. No copyrighted musical material is bundled.
