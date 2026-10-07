export const blockDefinitions = [
  { id: 0, name: "Grass", color: "#6d9c43", side: "#79563b", drop: 1, hardness: 0.6, blastResistance: 3, requiredTool: "shovel", sound: "grass", collision: true, transparent: false, emission: 0 },
  { id: 1, name: "Dirt", color: "#79563b", drop: 1, hardness: 0.5, blastResistance: 2.5, requiredTool: "shovel", sound: "dirt", collision: true, transparent: false, emission: 0 },
  { id: 2, name: "Stone", color: "#858780", drop: 2, hardness: 1.5, blastResistance: 6, requiredTool: "pickaxe", sound: "stone", collision: true, transparent: false, emission: 0 },
  { id: 3, name: "Oak log", color: "#76502e", top: "#ae8950", drop: 3, hardness: 2, blastResistance: 3, requiredTool: "axe", sound: "wood", collision: true, transparent: false, emission: 0 },
  { id: 4, name: "Oak leaves", color: "#45743b", drop: 4, hardness: 0.2, blastResistance: 0.2, requiredTool: "shears", sound: "leaves", collision: true, transparent: true, emission: 0 },
  { id: 5, name: "Sand", color: "#d7c47b", drop: 5, hardness: 0.5, blastResistance: 2.5, requiredTool: "shovel", sound: "sand", collision: true, transparent: false, emission: 0 },
  { id: 6, name: "Oak planks", color: "#bb8a50", drop: 6, hardness: 2, blastResistance: 3, requiredTool: "axe", sound: "wood", collision: true, transparent: false, emission: 0 },
  { id: 7, name: "Crafting table", color: "#95643a", drop: 7, hardness: 2.5, blastResistance: 3, requiredTool: "axe", sound: "wood", collision: true, transparent: false, emission: 0 },
  { id: 8, name: "Bedrock", color: "#454846", drop: null, hardness: Infinity, blastResistance: 3600000, requiredTool: null, sound: "stone", collision: true, transparent: false, emission: 0 },
  { id: 9, name: "Rift portal", color: "#783dd0", drop: 9, hardness: 0.3, blastResistance: 1, requiredTool: null, sound: "magic", collision: false, transparent: true, emission: 7 },
  { id: 10, name: "Rift crystal", color: "#45c8c8", drop: 10, hardness: 1.5, blastResistance: 4, requiredTool: "pickaxe", sound: "crystal", collision: true, transparent: false, emission: 2 },
  { id: 11, name: "Wild berries", color: "#c64347", drop: 11, food: 5, hardness: 0.2, blastResistance: 0.3, requiredTool: null, sound: "plant", collision: true, transparent: false, emission: 0 },
  { id: 12, name: "Gravel", color: "#85827c", drop: 12, hardness: 0.6, blastResistance: 3, requiredTool: "shovel", sound: "gravel", collision: true, transparent: false, emission: 0 },
  { id: 13, name: "Water", color: "#4785c7", drop: null, hardness: Infinity, blastResistance: 100, requiredTool: null, sound: "water", collision: false, transparent: true, emission: 0, fluid: "water" },
  { id: 14, name: "Coal ore", color: "#424441", drop: 14, hardness: 3, blastResistance: 6, requiredTool: "pickaxe", sound: "stone", collision: true, transparent: false, emission: 0 },
  { id: 15, name: "Iron ore", color: "#9d8973", drop: 15, hardness: 3, blastResistance: 6, requiredTool: "pickaxe", sound: "stone", collision: true, transparent: false, emission: 0 },
  { id: 16, name: "Snow", color: "#e8f1f2", drop: 16, hardness: 0.2, blastResistance: 0.2, requiredTool: "shovel", sound: "snow", collision: true, transparent: false, emission: 0 },
  { id: 17, name: "Glass", color: "#a8d7e5", drop: 17, hardness: 0.3, blastResistance: 0.3, requiredTool: null, sound: "glass", collision: true, transparent: true, emission: 0 },
];

export const blockRegistry = new Map(blockDefinitions.map((block) => [block.id, block]));
