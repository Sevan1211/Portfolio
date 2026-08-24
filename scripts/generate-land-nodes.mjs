import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(ROOT, "src/features/Landing/data/landNodes.ts");
const WORLD_ATLAS_PATH = resolve(
  ROOT,
  "node_modules/world-atlas/land-110m.json",
);
const TARGET_NODE_COUNT = 3840;
const CANDIDATE_COUNT = 20000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const topology = JSON.parse(readFileSync(WORLD_ATLAS_PATH, "utf8"));
const land = feature(topology, topology.objects.land);
const packedNormals = [];

for (
  let index = 0;
  index < CANDIDATE_COUNT && packedNormals.length / 3 < TARGET_NODE_COUNT;
  index += 1
) {
  const y = 1 - (index / (CANDIDATE_COUNT - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = index * GOLDEN_ANGLE;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  const longitude = Math.atan2(z, x) * (180 / Math.PI);
  const latitude = Math.asin(y) * (180 / Math.PI);

  if (!geoContains(land, [longitude, latitude])) continue;

  for (const value of [x, y, z]) {
    packedNormals.push(Math.round((value * 0.5 + 0.5) * 65535));
  }
}

if (packedNormals.length / 3 < TARGET_NODE_COUNT) {
  throw new Error(
    `Only generated ${packedNormals.length / 3} land nodes; expected ${TARGET_NODE_COUNT}.`,
  );
}

const binary = Buffer.from(new Uint16Array(packedNormals).buffer);
const encoded = binary.toString("base64");
const chunks = encoded.match(/.{1,120}/g) ?? [];
const source = `/**\n * Generated from world-atlas land-110m using scripts/generate-land-nodes.mjs.\n * The globe renders these unit normals as one instanced land-only point field.\n */\nexport const LAND_NODE_COUNT = ${TARGET_NODE_COUNT};\n\nconst encodedLandNormals = [\n${chunks.map((chunk) => `  '${chunk}',`).join("\n")}\n].join('');\n\nconst decodeLandNormals = (encoded: string): Uint16Array => {\n  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));\n  return new Uint16Array(bytes.buffer);\n};\n\nexport const LAND_NODE_NORMALS = decodeLandNormals(encodedLandNormals);\n`;

writeFileSync(OUTPUT_PATH, source);
console.log(`Wrote ${TARGET_NODE_COUNT} land nodes to ${OUTPUT_PATH}`);
