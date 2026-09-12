# Originality

Órbita Music Lab generates music from general music theory and from grammars written specifically for Órbita. It does not reproduce existing songs.

## What this system does

- Uses scales, modes, chord construction, voice leading, arpeggiation, and rhythmic subdivision — all public-domain music theory.
- Encodes **original** chord transition graphs, motif contours, bass cells, and percussion patterns for each world.
- Synthesizes every sound with Web Audio oscillators, noise, filters, and envelopes. There are no audio files.

## What this system does not do

- It does not copy, quote, or arrange any existing melody, bassline, or soundtrack.
- It does not imitate a named composer, film score, game soundtrack, or popular song.
- It does not import MIDI, commercial loops, sample packs, or soundfonts.
- It does not contact any music service, dataset, or model at runtime.
- It does not use AI inference to write notes.

World names (Menta, Durazno, Lavanda, Glaciar, Eclipse) describe **places in Órbita**, not references to other music. Tempo ranges and modal colors are design constraints, not allusions to a particular cue.

v1.1 aims for cinematic scale (long harmonic arcs, evolving pads, ostinato, spatial synthesis). That is a *category* of emotional impact. It is **not** a reproduction of any film score, organ theme, or named composer. Motifs, progressions, and orchestration belong to Órbita. See `docs/MOTIFS.md`.

## Design philosophy

The objective is an original musical language for a small luminous traveler moving between planets.

Each world belongs to one family (orbital, spacious, slightly bell-like, patient phrasing) while remaining immediately distinguishable:

- **Menta** — rising fifths, add9 / maj7, breathing rests.
- **Durazno** — syncopated bass cells, mixolydian color, playful skips. Not a genre pastiche.
- **Lavanda** — displaced downbeats, sus/add6 geometry, 3-against-4 arpeggios.
- **Glaciar** — long space, high bells, slow harmonic rhythm.
- **Eclipse** — phrygian tension, low pulse, controlled dissonance.

Motifs are short original contours. Variations (transpose, invert, fragment, change ending, displace) are generic compositional operations, not quotations.

## Determinism vs. copying

A seed reconstructs the **same grammar choices**. That is reproducibility, not sampling. Two devices given `MENTA-2026-001` should hear the same musical identity because they run the same rules, not because they share an audio asset.

## Legal note

This document describes the **technical creative process**. It is not a legal opinion and does not claim that every possible generated sequence is unique in the abstract. What it does claim, as a matter of engineering:

1. No known work was used as a template.
2. No copyrighted melody was intentionally encoded.
3. No external music corpus is bundled or queried.

If a later integration adds recorded audio, that audio must be original to Órbita and documented separately. The engine as shipped in v1.1 has none.
