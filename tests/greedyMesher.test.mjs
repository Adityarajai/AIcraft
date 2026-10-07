import assert from "node:assert/strict";
import test from "node:test";
import { blockRegistry } from "../src/blocks/registry.js";
import { meshChunk } from "../src/world/greedyMesher.js";

function mapOf(...blocks) {
  return new Map(blocks.map(([x, y, z, type]) => [`${x},${y},${z}`, type]));
}

function quadCount(meshes) {
  return [...meshes.values()].reduce((total, mesh) => total + mesh.indices.length / 6, 0);
}

test("a single voxel emits its six boundary faces", () => {
  const mesh = meshChunk(mapOf([0, 0, 0, 2]), blockRegistry, 0, 0, 2, 0);
  assert.equal(quadCount(mesh), 6);
});

test("adjacent opaque voxels merge and hide their internal face", () => {
  const mesh = meshChunk(mapOf([0, 0, 0, 2], [1, 0, 0, 2]), blockRegistry, 0, 0, 2, 0);
  assert.equal(quadCount(mesh), 6);
});

test("chunk borders are culled against neighboring loaded chunks", () => {
  const blocks = mapOf([1, 0, 0, 2], [2, 0, 0, 2]);
  const west = meshChunk(blocks, blockRegistry, 0, 0, 2, 0);
  const east = meshChunk(blocks, blockRegistry, 1, 0, 2, 0);
  assert.equal(quadCount(west) + quadCount(east), 10);
});

test("opaque shore faces remain visible beside transparent water", () => {
  const mesh = meshChunk(mapOf([0, 0, 0, 2], [1, 0, 0, 13]), blockRegistry, 0, 0, 2, 0);
  assert.equal(quadCount(mesh), 11);
  assert.ok(mesh.has(2));
  assert.ok(mesh.has(13));
});

test("the block registry gives each block a unique id and interaction metadata", async () => {
  const { blockDefinitions } = await import("../src/blocks/registry.js");
  assert.equal(new Set(blockDefinitions.map((block) => block.id)).size, blockDefinitions.length);
  for (const block of blockDefinitions) {
    for (const field of ["hardness", "blastResistance", "collision", "transparent", "requiredTool", "drop", "sound", "emission"]) {
      assert.ok(Object.hasOwn(block, field), `${block.name} is missing ${field}`);
    }
  }
});
