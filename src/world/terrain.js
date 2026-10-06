const seedCache = new Map();

function seedValue(seed) {
  const key = String(seed ?? "aicraft");
  if (seedCache.has(key)) return seedCache.get(key);
  let value = 2166136261;
  for (let i = 0; i < key.length; i++) {
    value ^= key.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  value >>>= 0;
  seedCache.set(key, value);
  return value;
}

function hash3D(seed, x, y, z, salt = 0) {
  let hash = seedValue(seed);
  hash ^= Math.imul(x | 0, 0x8da6b343);
  hash ^= Math.imul(y | 0, 0xd8163841);
  hash ^= Math.imul(z | 0, 0xcb1ab31f);
  hash ^= Math.imul(salt | 0, 0x165667b1);
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function hash2D(seed, x, z, salt = 0) {
  return hash3D(seed, x, salt, z, salt ^ 0x51ed);
}

export function randomAt(seed, x, y, z, salt = 0) {
  return hash3D(seed, x, y, z, salt) / 4294967296;
}

function fade(value) {
  return value * value * (3 - 2 * value);
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function valueNoise2D(seed, x, z, scale, salt) {
  const gx = x / scale;
  const gz = z / scale;
  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const tx = fade(gx - x0);
  const tz = fade(gz - z0);
  const sample = (ix, iz) => randomAt(seed, ix, salt, iz, salt + 11) * 2 - 1;
  const a = lerp(sample(x0, z0), sample(x0 + 1, z0), tx);
  const b = lerp(sample(x0, z0 + 1), sample(x0 + 1, z0 + 1), tx);
  return lerp(a, b, tz);
}

function valueNoise3D(seed, x, y, z, scale, salt) {
  const gx = x / scale;
  const gy = y / scale;
  const gz = z / scale;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const z0 = Math.floor(gz);
  const tx = fade(gx - x0);
  const ty = fade(gy - y0);
  const tz = fade(gz - z0);
  const sample = (ix, iy, iz) => randomAt(seed, ix, iy, iz, salt) * 2 - 1;
  const planes = [];
  for (let dy = 0; dy <= 1; dy++) {
    const north = lerp(sample(x0, y0 + dy, z0), sample(x0 + 1, y0 + dy, z0), tx);
    const south = lerp(sample(x0, y0 + dy, z0 + 1), sample(x0 + 1, y0 + dy, z0 + 1), tx);
    planes.push(lerp(north, south, tz));
  }
  return lerp(planes[0], planes[1], ty);
}

export const SEA_LEVEL = 7;

export function terrainColumn(seed, x, z, dimension = "overworld") {
  if (dimension === "rift") {
    const broad = valueNoise2D(seed, x + 700, z - 430, 64, 227);
    const detail = valueNoise2D(seed, x, z, 17, 228);
    const height = Math.max(3, Math.min(26, Math.round(10 + broad * 7 + detail * 2)));
    return { height, biome: "rift", surface: 10, soil: 2, water: false, river: false };
  }

  const continental = valueNoise2D(seed, x, z, 112, 31);
  const detail = valueNoise2D(seed, x, z, 19, 32);
  const ridge = 1 - Math.abs(valueNoise2D(seed, x, z, 47, 33));
  const temperature = valueNoise2D(seed, x, z, 145, 34) - z * 0.0011;
  const moisture = valueNoise2D(seed, x, z, 86, 35);
  let height = Math.round(8 + continental * 5.5 + detail * 2.2 + Math.max(0, ridge - 0.68) * 34);
  height = Math.max(2, Math.min(28, height));

  const river = Math.abs(valueNoise2D(seed, x, z, 39, 36)) < 0.035 && height < 16;
  const water = height < SEA_LEVEL - 1 || river;
  let biome = "plains";
  if (height < SEA_LEVEL - 2) biome = "ocean";
  else if (height >= 21 && temperature < 0.28) biome = "snowy_mountains";
  else if (temperature < -0.46) biome = "tundra";
  else if (temperature > 0.34 && moisture < -0.02) biome = "desert";
  else if (moisture > 0.08) biome = "forest";
  else if (water) biome = "coast";

  const sandy = biome === "desert" || biome === "ocean" || biome === "coast";
  const snowy = biome === "tundra" || biome === "snowy_mountains";
  return {
    height,
    biome,
    surface: snowy ? 16 : sandy ? 5 : 0,
    soil: sandy ? 5 : 1,
    water,
    river,
  };
}

export function isCave(seed, x, y, z, surfaceY) {
  if (y < 3 || y > surfaceY - 3) return false;
  const tunnel = Math.abs(valueNoise3D(seed, x, y * 1.15, z, 18, 401));
  const branch = valueNoise3D(seed, x, y, z, 9, 402);
  return tunnel < 0.105 && branch > -0.28;
}

export function oreAt(seed, x, y, z) {
  if (y < 3) return null;
  const roll = randomAt(seed, x, y, z, 501);
  if (y < 11 && roll < 0.012) return 15;
  if (y < 21 && roll < 0.045) return 14;
  return null;
}

export function makeWorldSeed() {
  try {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `${values[0].toString(36)}-${values[1].toString(36)}`;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
