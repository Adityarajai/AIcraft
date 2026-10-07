function blockKey(x, y, z) {
  return `${x},${y},${z}`;
}

function exposesFace(type, neighborType, registry) {
  if (type === neighborType) return false;
  const current = registry.get(type);
  const neighbor = registry.get(neighborType);
  if (!neighbor) return true;
  if (current?.transparent) return neighbor.transparent === true;
  return neighbor.transparent === true;
}

function faceBucket() {
  return { positions: [], normals: [], uvs: [], indices: [] };
}

function appendQuad(bucket, origin, uAxis, vAxis, width, height, axis, sign) {
  const p0 = [...origin];
  const p1 = [...origin];
  const p2 = [...origin];
  const p3 = [...origin];
  p1[uAxis] += width;
  p2[uAxis] += width;
  p2[vAxis] += height;
  p3[vAxis] += height;
  const points = sign > 0 ? [p0, p1, p2, p3] : [p0, p3, p2, p1];
  const axisNormal = [0, 0, 0];
  axisNormal[axis] = sign;
  const vertexOffset = bucket.positions.length / 3;
  const faceUvs = sign > 0
    ? [[0, 0], [width, 0], [width, height], [0, height]]
    : [[0, 0], [0, height], [width, height], [width, 0]];

  for (let i = 0; i < 4; i++) {
    bucket.positions.push(points[i][0], points[i][1], points[i][2]);
    bucket.normals.push(axisNormal[0], axisNormal[1], axisNormal[2]);
    bucket.uvs.push(faceUvs[i][0], faceUvs[i][1]);
  }
  bucket.indices.push(
    vertexOffset, vertexOffset + 1, vertexOffset + 2,
    vertexOffset, vertexOffset + 2, vertexOffset + 3,
  );
}

export function meshChunk(blocks, registry, chunkX, chunkZ, chunkSize = 16, maxY = 40) {
  const dimensions = [chunkSize, Math.max(1, maxY + 1), chunkSize];
  const originX = chunkX * chunkSize;
  const originZ = chunkZ * chunkSize;
  const typeBuckets = new Map();
  const sampleCache = new Map();

  function sample(x, y, z) {
    if (y < 0 || y >= dimensions[1]) return null;
    const key = blockKey(originX + x, y, originZ + z);
    if (sampleCache.has(key)) return sampleCache.get(key);
    const type = blocks.get(key);
    const result = type === undefined ? null : type;
    sampleCache.set(key, result);
    return result;
  }

  function bucketFor(type, materialIndex) {
    if (!typeBuckets.has(type)) typeBuckets.set(type, Array.from({ length: 6 }, faceBucket));
    return typeBuckets.get(type)[materialIndex];
  }

  for (let axis = 0; axis < 3; axis++) {
    const uAxis = (axis + 1) % 3;
    const vAxis = (axis + 2) % 3;
    const mask = new Int32Array(dimensions[uAxis] * dimensions[vAxis]);
    const position = [0, 0, 0];
    const neighbor = [0, 0, 0];
    const width = dimensions[uAxis];
    const height = dimensions[vAxis];
    const q = [0, 0, 0];
    q[axis] = 1;

    for (let slice = -1; slice < dimensions[axis];) {
      let offset = 0;
      position[axis] = slice;
      for (let j = 0; j < height; j++) {
        position[vAxis] = j;
        for (let i = 0; i < width; i++) {
          position[uAxis] = i;
          neighbor[0] = position[0] + q[0];
          neighbor[1] = position[1] + q[1];
          neighbor[2] = position[2] + q[2];
          const a = sample(position[0], position[1], position[2]);
          const b = sample(neighbor[0], neighbor[1], neighbor[2]);
          let value = 0;
          if (a !== null && (b === null || exposesFace(a, b, registry))) value = a + 1;
          else if (b !== null && (a === null || exposesFace(b, a, registry))) value = -(b + 1);
          mask[offset++] = value;
        }
      }

      slice++;
      position[axis] = slice;
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width;) {
          const index = i + j * width;
          const value = mask[index];
          if (!value) {
            i++;
            continue;
          }

          let quadWidth = 1;
          while (i + quadWidth < width && mask[index + quadWidth] === value) quadWidth++;
          let quadHeight = 1;
          let canGrow = true;
          while (j + quadHeight < height && canGrow) {
            const rowStart = index + quadHeight * width;
            for (let k = 0; k < quadWidth; k++) {
              if (mask[rowStart + k] !== value) {
                canGrow = false;
                break;
              }
            }
            if (canGrow) quadHeight++;
          }

          const sign = value > 0 ? 1 : -1;
          const type = Math.abs(value) - 1;
          const materialIndex = axis * 2 + (sign > 0 ? 0 : 1);
          const quadOrigin = [0, 0, 0];
          quadOrigin[axis] = slice;
          quadOrigin[uAxis] = i;
          quadOrigin[vAxis] = j;
          appendQuad(bucketFor(type, materialIndex), quadOrigin, uAxis, vAxis, quadWidth, quadHeight, axis, sign);

          for (let dy = 0; dy < quadHeight; dy++) {
            const rowStart = index + dy * width;
            for (let dx = 0; dx < quadWidth; dx++) mask[rowStart + dx] = 0;
          }
          i += quadWidth;
        }
      }
    }
  }

  const result = new Map();
  for (const [type, buckets] of typeBuckets) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const groups = [];
    let vertexOffset = 0;
    for (let materialIndex = 0; materialIndex < buckets.length; materialIndex++) {
      const bucket = buckets[materialIndex];
      if (!bucket.indices.length) continue;
      groups.push({ start: indices.length, count: bucket.indices.length, materialIndex });
      for (const value of bucket.positions) positions.push(value);
      for (const value of bucket.normals) normals.push(value);
      for (const value of bucket.uvs) uvs.push(value);
      for (const index of bucket.indices) indices.push(index + vertexOffset);
      vertexOffset += bucket.positions.length / 3;
    }
    result.set(type, { positions, normals, uvs, indices, groups });
  }
  return result;
}
