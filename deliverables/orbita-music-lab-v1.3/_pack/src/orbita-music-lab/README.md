# orbita-music-lab

Portable TypeScript + Web Audio procedural soundtrack engine.

Zero runtime dependencies. Import `OrbitaMusicEngine` and call it from any Capacitor / browser game.

v1.3 is a composer pass on v1.2. The public integration API is unchanged except for an optional lab-only `revision` flag (`"v1.1" | "v1.2" | "v1.3"`). Game integrations should omit it; the engine defaults to v1.3.

See `/docs/INTEGRATION.md` in the project root for the full contract.
