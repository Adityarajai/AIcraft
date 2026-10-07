import assert from "node:assert/strict";
import test from "node:test";
import { hash2D, isCave, oreAt, terrainColumn } from "../src/world/terrain.js";

test("terrain samples are stable for a seed and coordinate", () => {
  const a = terrainColumn("fixed-seed", -73, 141);
  const b = terrainColumn("fixed-seed", -73, 141);
  assert.deepEqual(a, b);
  assert.equal(hash2D("fixed-seed", -73, 141), hash2D("fixed-seed", -73, 141));
});

test("different seeds produce different terrain", () => {
  let differs = false;
  for (let x = -80; x <= 80; x += 8) {
    for (let z = -80; z <= 80; z += 8) {
      if (terrainColumn("seed-one", x, z).height !== terrainColumn("seed-two", x, z).height) differs = true;
    }
  }
  assert.equal(differs, true);
});

test("the world generator produces several biomes, caves, and ores", () => {
  const biomes = new Set();
  let caves = 0;
  let ores = 0;
  for (let x = -240; x <= 240; x += 4) {
    for (let z = -240; z <= 240; z += 4) biomes.add(terrainColumn("qa-seed", x, z).biome);
  }
  for (let x = -24; x < 24; x++) {
    for (let z = -24; z < 24; z++) {
      for (let y = 3; y < 14; y++) {
        if (isCave("qa-seed", x, y, z, 22)) caves++;
        if (oreAt("qa-seed", x, y, z) !== null) ores++;
      }
    }
  }
  assert.ok(biomes.size >= 5, `expected 5+ biomes; got ${[...biomes].join(", ")}`);
  assert.ok(caves > 0, "expected deterministic cave cells");
  assert.ok(ores > 0, "expected deterministic ore cells");
});

test("the Rift has its own terrain profile and no surface water", () => {
  const rift = terrainColumn("fixed-seed", 12, -9, "rift");
  assert.equal(rift.biome, "rift");
  assert.equal(rift.water, false);
  assert.ok(rift.height >= 3 && rift.height <= 26);
});
