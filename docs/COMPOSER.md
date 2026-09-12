# Composer grammar (v1.3)

v1.3 does not generate layers independently and stack them. A phrase plan is written first. Each bar realizes that plan.

## Hierarchy

WORLD IDENTITY → SECTION → HARMONIC PHRASE → MELODIC PHRASE → BASS PHRASE → RHYTHMIC PHRASE → ORCHESTRATION → ORNAMENTATION

Lower layers read the plan. They do not roll their own contour, chord, or density.

## Campaign worlds are semi-composed

Each world has 5 original progression families (see `composition/grammar.ts`). Section **A** always uses the signature family. Other sections pick from the remaining grammar with the session seed.

Procedural planets choose a grammar from `PlanetMusicalDNA.progressionFamily`, then generate inside it. They do not get unrestricted campaign complexity.

## Phrase shape (8 bars)

| Bars | Role |
| --- | --- |
| 1–2 | statement |
| 3–4 | response |
| 5–6 | development |
| 7–8 | cadence |

4-bar sections (INTRO, BUILD) are statement then cadence/development.

## Motif development

| Appearance | Stage |
| --- | --- |
| INTRO / first A | prime (clear) |
| A_VARIATION | repeat (recognizable) |
| B / second A / BUILD | develop (sequence, fragment) |
| PEAK | transform — but bars 1–2 still repeat so the ear can catch it |

Exact repetition is required for recognition. Transformation is not applied on every bar.

## Cadences

`open | half | resolved | deceptive | suspended`

INTRO stays open. BUILD is suspended. PEAK and RECOVERY resolve (Eclipse B may deceive). The listener should feel HOME / AWAY / RETURN except where Lavanda is deliberately modal or Eclipse is deliberately unstable.

## Dissonance budget

| World | Budget |
| --- | --- |
| Menta | 1 |
| Durazno | 1 |
| Lavanda | 2 |
| Glaciar | 1 |
| Eclipse | 3 |

If the pad already owns color (9ths/11ths), the lead stays simpler. Layers do not all “be interesting” at once.

## Counterpoint

Melody active → counter sparse or silent.
Melody resting → counter may answer.
Melody ascending → counter holds or descends.
Registers are assigned (bass / pad / ostinato / motif / counter / pickup) so lines do not sit on top of each other.

## Bass

Bass is harmonic foundation, not a second melody. Roles: pedal, root-motion, groove-cell, octave-pulse, inversion. Approach notes are kept off the beat.

## Gameplay

Light pickups always click immediately. Musical notes are selected; a rapid burst does not stack ten overlapping melody tones. Optional echoes wait for a response bar.

## Lab-only

Solo/mute layers, section loop, restart/next phrase, and the phrase diagnostic JSON are **not** part of the game API. `revision` is lab-only. Default runtime is v1.3.
