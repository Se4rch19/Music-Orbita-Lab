import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPrng, hashSeed } from "./prng.ts";

describe("prng", () => {
  it("is deterministic for the same seed", () => {
    const a = createPrng("MENTA-2026-001");
    const b = createPrng("MENTA-2026-001");
    const seqA = Array.from({ length: 32 }, () => a.next());
    const seqB = Array.from({ length: 32 }, () => b.next());
    assert.deepEqual(seqA, seqB);
  });

  it("diverges for different seeds", () => {
    const a = createPrng("MENTA-2026-001");
    const b = createPrng("DURAZNO-2026-001");
    assert.notEqual(a.next(), b.next());
  });

  it("forks named streams independently of draw order", () => {
    const parent = createPrng("ORB");
    const forkA = parent.fork("motifs");
    parent.next();
    const forkB = createPrng("ORB").fork("motifs");
    assert.equal(forkA.next(), forkB.next());
  });

  it("weighted pick respects exclusive support", () => {
    const rng = createPrng("w");
    const item = rng.weighted([
      { item: "only", weight: 1 },
      { item: "never", weight: 0 },
    ]);
    assert.equal(item, "only");
  });

  it("hash is stable", () => {
    assert.equal(hashSeed("abc"), hashSeed("abc"));
    assert.notEqual(hashSeed("abc"), hashSeed("abd"));
  });
});
