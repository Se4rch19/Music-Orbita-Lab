# Campaign motifs

Each campaign planet has a curated signature motif stored as `themes/<world>.motifs[0]`.
These are original Órbita contours — not quotations, not film themes.

Contour numbers are scale degrees relative to the session tonic (`0` = tonic, `4` = fifth, `7` = octave).
Rhythm values are durations in 16th notes.

Signature motifs occupy section **A**. Section **B** uses `motifs[1]`. **INTRO** plays a 3-note fragment, then the full signature. **PEAK** may add a response contour.

v1.3 stages (deterministic, not a coin-flip per bar): prime → repeat → develop → transform. The first two appearances stay recognizable.


## Menta — `menta-horizon`

Feeling: first contact, a held horizon, hope without new-age wash.

| | |
| --- | --- |
| Contour | `0 4 2 7 4` |
| Rhythm  | `4 2 2 4 4` |
| Accents | downbeat and the lifted octave |

The leap to the fifth, a step back, then the high tonic-octave. It is sung, not arpeggiated.

Development: fragment in INTRO; prime in A bar 0; inversion / ending variation later; fifth-motif (`menta-fifth`) as a quiet answer.

## Durazno — `durazno-skip`

Feeling: warm, physical, playful. The planet that must be heard immediately.

| | |
| --- | --- |
| Contour | `0 2 0 4 7 4` |
| Rhythm  | `1 1 2 2 2 4` |
| Accents | skip on 1, punch on the fifth |

Short-short long. Bass and kick carry the body; the motif rides on top.

Development: cell motif (`durazno-cell`) in B; bounce motif at PEAK.

## Lavanda — `lavanda-geo`

Feeling: alien geometry that is still a tune.

| | |
| --- | --- |
| Contour | `0 3 6 4 1 4` |
| Rhythm  | `3 3 2 2 2 4` |
| Accents | first and third events |

A 3+3 grouping against a 4/4 bar. Displaced clicks and 3-against-4 bells complete the identity.

## Glaciar — `glaciar-sparse`

Feeling: crystal, isolated, still present.

| | |
| --- | --- |
| Contour | `0 7 4 0` |
| Rhythm  | `6 4 4 2` |
| Accents | tonic and return |

Four events, long values, high register, bell timbre. Space is part of the motif — not silence instead of music. A second pattern (`glaciar-crystal`) oscillates on the fifth.

## Eclipse — `eclipse-drive`

Feeling: the campaign's last approach. Tension, not constant climax.

| | |
| --- | --- |
| Contour | `0 1 0 3 1 0` |
| Rhythm  | `2 2 2 2 4 4` |
| Accents | tonic, the phrygian second, the landing |

The flattened second is the planet. PEAK adds `eclipse-power`; RECOVERY strips percussion and leaves the pad + fragment.

## Variation operations (generic, not quotations)

`transpose` · `invert` · `ending` · `displace` · `octave` · `fragment` · `extend` · `response`

These are ordinary compositional operations applied to the stored contour. They do not import material from outside Órbita.

## Procedural planets

Post-campaign planets do **not** reuse a campaign motif as-is. `PlanetMusicalDNA.motifDNA` is generated from the planet seed with compatibility rules (dark language rarely gets a playful skip contour). The result still uses Órbita rhythm cells and the same variation operators.
