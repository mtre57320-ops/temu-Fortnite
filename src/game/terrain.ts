import * as THREE from 'three';
import {
  createBoulder,
  createCabin,
  createChestModel,
  createPineTree,
  createWatchtower,
} from './models';
import { ChestObject, HarvestableObject } from './types';

export const ISLAND_SIZE = 260; // 260m x 260m island
const SEGMENTS = 80;

/**
 * Procedural low-poly island height function.
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.hypot(x, z);
  const islandRadius = ISLAND_SIZE * 0.45;

  // Ocean border falloff
  if (distFromCenter > islandRadius) {
    const falloff = Math.min(1, (distFromCenter - islandRadius) / 25);
    return -4.0 * falloff;
  }

  // Gentle hills using sinusoidal combinations
  const h1 = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 5.5;
  const h2 = Math.sin(x * 0.07 + 1.2) * Math.sin(z * 0.07 + 0.8) * 2.2;
  const h3 = Math.cos(x * 0.015 - z * 0.015) * 3.5;

  // Center plateau elevation
  const centerWeight = Math.max(0, 1 - distFromCenter / islandRadius);
  const baseElev = centerWeight * 4.0;

  return Math.max(0.2, baseElev + h1 + h2 + h3);
}

export interface IslandWorld {
  terrainMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  chests: ChestObject[];
  harvestables: HarvestableObject[];
  landmarks: { name: string; position: [number, number, number] }[];
}

/**
 * Builds the entire low-poly Island environment, chests, trees, and buildings.
 */
export function buildIsland(scene: THREE.Scene): IslandWorld {
  // 1. Terrain Geometry
  const geom = new THREE.PlaneGeometry(ISLAND_SIZE, ISLAND_SIZE, SEGMENTS, SEGMENTS);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  const colors: number[] = [];

  const grassColor = new THREE.Color(0x3ea842);
  const grassHighColor = new THREE.Color(0x2d8a31);
  const sandColor = new THREE.Color(0xded09b);
  const rockColor = new THREE.Color(0x78716c);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getTerrainHeight(x, z);
    pos.setY(i, y);

    // Color vertex based on elevation
    const c = new THREE.Color();
    if (y < 0.8) {
      c.copy(sandColor);
    } else if (y > 9.0) {
      c.copy(rockColor);
    } else if (y > 5.0) {
      c.copy(grassHighColor);
    } else {
      c.copy(grassColor);
    }
    // slight natural variation
    c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
    colors.push(c.r, c.g, c.b);
  }

  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(geom, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // 2. Surrounding Ocean Water Plane
  const waterGeom = new THREE.PlaneGeometry(ISLAND_SIZE * 2.2, ISLAND_SIZE * 2.2);
  waterGeom.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.y = -0.5;
  scene.add(waterMesh);

  const chests: ChestObject[] = [];
  const harvestables: HarvestableObject[] = [];
  const landmarks: { name: string; position: [number, number, number] }[] = [];

  // 3. Landmarks
  // Landmark A: Pleasant Cabins (x: -45, z: -35)
  const cabin1 = createCabin();
  const c1y = getTerrainHeight(-45, -35);
  cabin1.position.set(-45, c1y, -35);
  cabin1.rotation.y = 0.4;
  scene.add(cabin1);
  landmarks.push({ name: 'Pleasant Cabins', position: [-45, c1y, -35] });

  // Chest inside Cabin 1
  const chest1 = createChestModel();
  chest1.group.position.set(-45, c1y + 0.3, -33);
  scene.add(chest1.group);
  chests.push({
    id: 'chest_cabin1',
    position: [-45, c1y + 0.3, -33],
    rotationY: 0.4,
    isOpened: false,
    mesh: chest1.group,
    lidMesh: chest1.lid,
    glowMesh: chest1.glow,
  });

  // Cabin 2 (x: -25, z: -48)
  const cabin2 = createCabin();
  const c2y = getTerrainHeight(-25, -48);
  cabin2.position.set(-25, c2y, -48);
  cabin2.rotation.y = -0.3;
  scene.add(cabin2);

  const chest2 = createChestModel();
  chest2.group.position.set(-25, c2y + 0.3, -46);
  scene.add(chest2.group);
  chests.push({
    id: 'chest_cabin2',
    position: [-25, c2y + 0.3, -46],
    rotationY: -0.3,
    isOpened: false,
    mesh: chest2.group,
    lidMesh: chest2.lid,
    glowMesh: chest2.glow,
  });

  // Landmark B: Salty Spire Observation Watchtower (x: 45, z: -25)
  const tower1 = createWatchtower();
  const t1y = getTerrainHeight(45, -25);
  tower1.position.set(45, t1y, -25);
  scene.add(tower1);
  landmarks.push({ name: 'Salty Spire', position: [45, t1y, -25] });

  // Chest at top of tower!
  const chestTower = createChestModel();
  chestTower.group.position.set(45, t1y + 9.2, -25);
  scene.add(chestTower.group);
  chests.push({
    id: 'chest_tower1',
    position: [45, t1y + 9.2, -25],
    rotationY: 0,
    isOpened: false,
    mesh: chestTower.group,
    lidMesh: chestTower.lid,
    glowMesh: chestTower.glow,
  });

  // Landmark C: Low-Poly Landing / Tilted Outpost (x: 35, z: 45)
  const cabin3 = createCabin();
  const c3y = getTerrainHeight(35, 45);
  cabin3.position.set(35, c3y, 45);
  cabin3.rotation.y = 1.2;
  scene.add(cabin3);
  landmarks.push({ name: 'Low-Poly Landing', position: [35, c3y, 45] });

  const tower2 = createWatchtower();
  const t2y = getTerrainHeight(55, 40);
  tower2.position.set(55, t2y, 40);
  scene.add(tower2);

  const chestLanding1 = createChestModel();
  chestLanding1.group.position.set(35, c3y + 0.3, 47);
  scene.add(chestLanding1.group);
  chests.push({
    id: 'chest_landing1',
    position: [35, c3y + 0.3, 47],
    rotationY: 1.2,
    isOpened: false,
    mesh: chestLanding1.group,
    lidMesh: chestLanding1.lid,
    glowMesh: chestLanding1.glow,
  });

  // Landmark D: Center Mountain Shrine (x: 0, z: 0)
  const centerHeight = getTerrainHeight(0, 0);
  landmarks.push({ name: 'Mount Royale', position: [0, centerHeight, 0] });
  const centerChest = createChestModel();
  centerChest.group.position.set(0, centerHeight + 0.2, 0);
  scene.add(centerChest.group);
  chests.push({
    id: 'chest_center_mountain',
    position: [0, centerHeight + 0.2, 0],
    rotationY: 0,
    isOpened: false,
    mesh: centerChest.group,
    lidMesh: centerChest.lid,
    glowMesh: centerChest.glow,
  });

  // Additional Scattered Golden Chests (total ~14 chests)
  const chestSpots: [number, number][] = [
    [-60, 20],
    [-40, 55],
    [-15, 65],
    [10, -65],
    [-70, -20],
    [65, -50],
    [70, 15],
    [-20, 15],
    [20, -20],
  ];

  chestSpots.forEach(([cx, cz], idx) => {
    const cy = getTerrainHeight(cx, cz);
    const chest = createChestModel();
    chest.group.position.set(cx, cy + 0.2, cz);
    chest.group.rotation.y = Math.random() * Math.PI * 2;
    scene.add(chest.group);
    chests.push({
      id: `chest_scatter_${idx}`,
      position: [cx, cy + 0.2, cz],
      rotationY: chest.group.rotation.y,
      isOpened: false,
      mesh: chest.group,
      lidMesh: chest.lid,
      glowMesh: chest.glow,
    });
  });

  // 4. Plant Pine Trees across the Island (Harvestable Wood)
  const treeCount = 55;
  for (let i = 0; i < treeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 15 + Math.random() * 85;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r;
    const ty = getTerrainHeight(tx, tz);

    if (ty > 0.8) {
      const tree = createPineTree();
      const scale = 0.8 + Math.random() * 0.45;
      tree.scale.set(scale, scale, scale);
      tree.position.set(tx, ty, tz);
      scene.add(tree);

      harvestables.push({
        id: `tree_${i}`,
        type: 'tree',
        position: [tx, ty, tz],
        health: 120,
        maxHealth: 120,
        resourceType: 'wood',
        resourceAmount: 20,
        mesh: tree,
      });
    }
  }

  // 5. Scatter Boulders / Rocks (Harvestable Stone)
  const rockCount = 35;
  for (let i = 0; i < rockCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 20 + Math.random() * 80;
    const rx = Math.cos(angle) * r;
    const rz = Math.sin(angle) * r;
    const ry = getTerrainHeight(rx, rz);

    if (ry > 0.5) {
      const boulder = createBoulder();
      const scale = 0.75 + Math.random() * 0.6;
      boulder.scale.set(scale, scale, scale);
      boulder.position.set(rx, ry, rz);
      scene.add(boulder);

      harvestables.push({
        id: `rock_${i}`,
        type: 'rock',
        position: [rx, ry, rz],
        health: 150,
        maxHealth: 150,
        resourceType: 'stone',
        resourceAmount: 20,
        mesh: boulder,
      });
    }
  }

  return {
    terrainMesh,
    waterMesh,
    chests,
    harvestables,
    landmarks,
  };
}
