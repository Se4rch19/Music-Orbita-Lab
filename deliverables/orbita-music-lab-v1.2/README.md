# Órbita Music Lab

A standalone, offline procedural composition engine for the mobile game **Órbita**.

This is not a loop player and not a collection of random beeps. It generates original structured music — tempo, harmony, bass, percussion, motifs, sections — and reacts to gameplay (intensity, combo, light pickups, orbit changes) in real time.

**v1.1** is a cinematic mix / musical impact pass: louder, mastered, spatially wider, with distinct planet DNA. The architecture from v1 is the same. Makeup now lives after the compressor (v1 put it before, which is why sparse worlds stayed quiet). Pad cutoffs were 520–1100 Hz; they now occupy the midrange laptop and phone speakers can actually reproduce.

**v1.2** is a harmony and mix polish on top of that identity: chord-aware melody, resolving passing tones, tighter tails, and cleaner space. Worlds still sound like themselves — just less accidental clash. A/B the lab between **v1.1** and **v1.2**.

## What it is

- Fully offline. No APIs, no samples, no soundfonts, no streaming.
- Deterministic when seeded (`MENTA-2026-001` always yields the same musical identity).
- Lightweight. Almost entirely code. Suitable for Capacitor / Android WebView.
- Five curated campaign worlds — Menta, Durazno, Lavanda, Glaciar, Eclipse — plus procedural planets with `PlanetMusicalDNA`.
- Light pickups become notes inside the current harmony, not random SFX.

## Listening lab

Open the app and tap **Play**. Master, Music and Events default to **100%**. Start with **Menta**. Let it run for a minute, then:

1. Raise **Intensity** and hear density, percussion, and brightness change — not just volume.
2. Tap **Collect light** and listen for notes that belong to the chord.
3. Switch worlds and hear a short musical transition, not a hard cut.
4. Use **A/B** (each world at 50% intensity) and **Campaign showcase** (five planets, ~36s each).
5. Toggle **Phone speaker preview** for a crude small-speaker EQ. It is a lab tool, not a device emulator.

Peak / RMS (dBFS) and limiter reduction are shown live. They are analyser estimates, not LUFS.

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
  → Bar composer (harmony, bass, percussion, motif, arp, pulse)
    → Synth voices (oscillators, filters, envelopes)
      → Instrument buses → music / SFX
        → space (4-delay FDN)
        → EQ → compressor → saturator → limiter → master
```

Composition is pure and deterministic. Audio is a renderer. That split is what makes tests meaningful and keeps the soundtrack stable if the game frame rate stutters.

## Worlds

| World | Character |
| --- | --- |
| Menta | Beginning, discovery, luminous horizon motif, ~76 BPM, Lydian / major pentatonic |
| Durazno | Warm, playful skip motif, audible groove, ~98 BPM, Mixolydian |
| Lavanda | Alien geometry, 3-against-4, ~84 BPM, Dorian / Lydian mixture |
| Glaciar | Sparse crystal bells, large space, still present, ~70 BPM, Aeolian |
| Eclipse | Deep, tense phrygian drive, ~108 BPM, harmonic minor |

Procedural planets generate a `PlanetMusicalDNA` fingerprint (tempo, mode, motif, bass/rhythm personality, space) instead of cloning a campaign world.

See `docs/MOTIFS.md` and `docs/ORIGINALITY.md`.

## Determinism

`seed` chooses key, scale, tempo (within the world range), motifs, and progression graphs.

`variationSeed` (defaults to `seed::v0`) chooses bar-level ornaments so two sessions can share identity without being sample-identical if you pass a different variation seed.

## Integration

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for the contract another coding agent should follow when wiring this into Órbita.

Originality process: [docs/ORIGINALITY.md](docs/ORIGINALITY.md)  
Motifs: [docs/MOTIFS.md](docs/MOTIFS.md)  
Mobile/CPU notes: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)

## Offline guarantee

Runtime requires no network. Fonts in the demo UI are the only remote request, and they are not part of the engine. The soundtrack itself is synthesised on device.

## License

MIT. Compositions are generated from general music theory. No copyrighted musical material is bundled.
