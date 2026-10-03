import * as THREE from 'three';
import { CharacterSkin, Rarity, WeaponCategory } from './types';
import { RARITY_COLORS } from './weapons';

// Shared materials cache to minimize WebGL state changes and draw calls
const materials = {
  woodDark: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85, flatShading: true }),
  woodPlank: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8, flatShading: true }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0xa06535, roughness: 0.8, flatShading: true }),
  stoneGray: new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9, flatShading: true }),
  pineLeaves: new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75, flatShading: true }),
  pineLeavesLight: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75, flatShading: true }),
  chestGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7, flatShading: true }),
  chestWood: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, flatShading: true }),
  chestGlow: new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5, metalness: 0.8, flatShading: true }),
  metalSilver: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7, flatShading: true }),
  potionBottle: new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, roughness: 0.1, transmission: 0.8, transparent: true, opacity: 0.85 }),
  potionLiquid: new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
  medkitRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6, flatShading: true }),
  medkitWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6, flatShading: true }),
  gliderFabric: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, flatShading: true, side: THREE.DoubleSide }),
};

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'commando',
    name: 'Tactical Commando',
    description: 'Special forces operative equipped for all terrain.',
    primaryColor: 0x1e293b,
    accentColor: 0x38bdf8,
    skinColor: 0xd97706,
    visorColor: 0x06b6d4,
  },
  {
    id: 'cyber',
    name: 'Cyber Scout',
    description: 'High-tech neon runner with augmented optics.',
    primaryColor: 0x09090b,
    accentColor: 0xec4899,
    skinColor: 0xe2e8f0,
    visorColor: 0xf43f5e,
  },
  {
    id: 'forest',
    name: 'Forest Ranger',
    description: 'Guerilla wilderness hunter camouflaged in the pines.',
    primaryColor: 0x14532d,
    accentColor: 0x84cc16,
    skinColor: 0xb45309,
    visorColor: 0xa3e635,
  },
  {
    id: 'golden',
    name: 'Golden Champion',
    description: 'Legendary battle royale victor in gleaming armor.',
    primaryColor: 0x78350f,
    accentColor: 0xf59e0b,
    skinColor: 0xfde047,
    visorColor: 0xffffff,
  },
  {
    id: 'crimson',
    name: 'Crimson Ninja',
    description: 'Deadly stealth striker with blood-red plating.',
    primaryColor: 0x450a0a,
    accentColor: 0xef4444,
    skinColor: 0xfca5a5,
    visorColor: 0xff0055,
  },
];

/**
 * Creates a low-poly character model with movable limbs.
 */
export function createCharacterModel(skin: CharacterSkin = CHARACTER_SKINS[0]) {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: skin.primaryColor, roughness: 0.7, flatShading: true });
  const accentMat = new THREE.MeshStandardMaterial({ color: skin.accentColor, roughness: 0.6, flatShading: true });
  const skinMat = new THREE.MeshStandardMaterial({ color: skin.skinColor, roughness: 0.8, flatShading: true });
  const visorMat = new THREE.MeshBasicMaterial({ color: skin.visorColor });

  // Pelvis / Hips
  const hips = new THREE.Group();
  hips.position.y = 1.0;
  root.add(hips);

  const hipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.4), bodyMat);
  hips.add(hipMesh);

  // Torso / Chest
  const torso = new THREE.Group();
  torso.position.y = 0.3;
  hips.add(torso);

  const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.45), bodyMat);
  chestMesh.position.y = 0.32;
  torso.add(chestMesh);

  // Tactical Vest plate
  const vestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.5, 0.48), accentMat);
  vestMesh.position.set(0, 0.35, 0.02);
  torso.add(vestMesh);

  // Back-Bling / Backpack
  const backpackMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.22), accentMat);
  backpackMesh.position.set(0, 0.35, -0.32);
  torso.add(backpackMesh);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.8, 0);
  torso.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.38), skinMat);
  headGroup.add(headMesh);

  // Helmet / Hair cap
  const helmetMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), bodyMat);
  helmetMesh.position.set(0, 0.15, 0);
  headGroup.add(helmetMesh);

  // Visor / Goggles
  const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), visorMat);
  visorMesh.position.set(0, 0.04, 0.18);
  headGroup.add(visorMesh);

  // Right Arm (Weapon Aiming Arm)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 0.58, 0);
  torso.add(rightArm);

  const rightBicep = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.18), bodyMat);
  rightBicep.position.y = -0.19;
  rightArm.add(rightBicep);

  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.38, 0);
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.35, 0.16), skinMat);
  rightForearmMesh.position.y = -0.16;
  rightForearm.add(rightForearmMesh);

  // Weapon attachment socket at the right hand
  const weaponSocket = new THREE.Group();
  weaponSocket.position.set(0, -0.32, 0.15);
  rightForearm.add(weaponSocket);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 0.58, 0);
  torso.add(leftArm);

  const leftBicep = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.18), bodyMat);
  leftBicep.position.y = -0.19;
  leftArm.add(leftBicep);

  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.38, 0);
  leftArm.add(leftForearm);

  const leftForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.35, 0.16), skinMat);
  leftForearmMesh.position.y = -0.16;
  leftForearm.add(leftForearmMesh);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, -0.15, 0);
  hips.add(rightLeg);

  const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), bodyMat);
  rightThigh.position.y = -0.22;
  rightLeg.add(rightThigh);

  const rightShin = new THREE.Group();
  rightShin.position.set(0, -0.45, 0);
  rightLeg.add(rightShin);

  const rightShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.2), accentMat);
  rightShinMesh.position.y = -0.22;
  rightShin.add(rightShinMesh);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.3), materials.metalDark);
  rightBoot.position.set(0, -0.42, 0.05);
  rightShin.add(rightBoot);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, -0.15, 0);
  hips.add(leftLeg);

  const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), bodyMat);
  leftThigh.position.y = -0.22;
  leftLeg.add(leftThigh);

  const leftShin = new THREE.Group();
  leftShin.position.set(0, -0.45, 0);
  leftLeg.add(leftShin);

  const leftShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.2), accentMat);
  leftShinMesh.position.y = -0.22;
  leftShin.add(leftShinMesh);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.3), materials.metalDark);
  leftBoot.position.set(0, -0.42, 0.05);
  leftShin.add(leftBoot);

  return {
    root,
    hips,
    torso,
    headGroup,
    rightArm,
    leftArm,
    rightForearm,
    leftForearm,
    rightLeg,
    leftLeg,
    rightShin,
    leftShin,
    weaponSocket,
  };
}

/**
 * Creates low-poly Hang Glider mesh deployed above player head.
 */
export function createGliderModel(colorHex: number = 0x0284c7): THREE.Group {
  const glider = new THREE.Group();

  const fabricMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.6,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  // Wing Canopy
  const wingGeom = new THREE.BufferGeometry();
  // Triangular delta wing vertices
  const vertices = new Float32Array([
    0, 0.2, 1.2,    // Nose
    -2.4, -0.2, -1.0, // Left tip
    0, 0, -0.8,     // Center rear
    
    0, 0.2, 1.2,    // Nose
    0, 0, -0.8,     // Center rear
    2.4, -0.2, -1.0,  // Right tip
  ]);
  wingGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  wingGeom.computeVertexNormals();

  const wingMesh = new THREE.Mesh(wingGeom, fabricMat);
  glider.add(wingMesh);

  // Crossbar & struts
  const frameGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.8);
  frameGeom.rotateZ(Math.PI / 2);
  const frameMesh = new THREE.Mesh(frameGeom, materials.metalSilver);
  frameMesh.position.set(0, -0.1, -0.5);
  glider.add(frameMesh);

  // Twin handles hanging down for hands
  const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), materials.metalDark);
  handleL.position.set(-0.5, -0.5, -0.2);
  handleL.rotation.z = 0.2;
  glider.add(handleL);

  const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), materials.metalDark);
  handleR.position.set(0.5, -0.5, -0.2);
  handleR.rotation.z = -0.2;
  glider.add(handleR);

  glider.position.y = 2.4;
  return glider;
}

/**
 * Creates low-poly Golden Treasure Chest with opening lid.
 */
export function createChestModel(): { group: THREE.Group; lid: THREE.Group; glow: THREE.Mesh } {
  const group = new THREE.Group();

  // Bottom Box
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.8), materials.chestWood);
  baseMesh.position.y = 0.3;
  group.add(baseMesh);

  // Gold Corners / Bands
  const bandMesh = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 0.25), materials.chestGold);
  bandMesh.position.y = 0.3;
  group.add(bandMesh);

  const lockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), materials.chestGold);
  lockMesh.position.set(0, 0.35, 0.44);
  group.add(lockMesh);

  // Hinged Lid Group (pivot at back edge: z = -0.4, y = 0.6)
  const lid = new THREE.Group();
  lid.position.set(0, 0.6, -0.4);
  group.add(lid);

  const lidCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.22, 12, 1, false, 0, Math.PI),
    materials.chestWood
  );
  lidCylinder.rotation.z = Math.PI / 2;
  lidCylinder.rotation.y = Math.PI / 2;
  lidCylinder.position.set(0, 0, 0.4);
  lid.add(lidCylinder);

  const lidGoldTrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.43, 0.26, 12, 1, false, 0, Math.PI),
    materials.chestGold
  );
  lidGoldTrim.rotation.z = Math.PI / 2;
  lidGoldTrim.rotation.y = Math.PI / 2;
  lidGoldTrim.position.set(0, 0, 0.4);
  lid.add(lidGoldTrim);

  // Golden radiant aura
  const glowGeom = new THREE.SphereGeometry(1.2, 8, 8);
  const glow = new THREE.Mesh(glowGeom, materials.chestGlow);
  glow.position.y = 0.6;
  group.add(glow);

  return { group, lid, glow };
}

/**
 * Creates low-poly 3D models for each weapon category.
 */
export function createWeaponMesh(category: WeaponCategory, rarity: Rarity): THREE.Group {
  const group = new THREE.Group();
  const rarityInfo = RARITY_COLORS[rarity];
  const accentMat = new THREE.MeshStandardMaterial({
    color: rarityInfo.threeHex,
    roughness: 0.4,
    metalness: 0.6,
    flatShading: true,
  });

  switch (category) {
    case 'pickaxe': {
      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1), materials.woodPlank);
      shaft.position.y = 0.55;
      group.add(shaft);

      // Metal Pick Head
      const pickHead = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.12), materials.metalSilver);
      pickHead.position.set(0, 1.05, 0);
      group.add(pickHead);

      const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), materials.metalDark);
      tipL.rotation.z = Math.PI / 2;
      tipL.position.set(-0.4, 1.05, 0);
      group.add(tipL);

      const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), materials.metalDark);
      tipR.rotation.z = -Math.PI / 2;
      tipR.position.set(0.4, 1.05, 0);
      group.add(tipR);

      group.rotation.x = Math.PI / 4;
      break;
    }

    case 'assault_rifle': {
      // Main receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.6), materials.metalDark);
      group.add(receiver);

      // Accent body plate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.3), accentMat);
      plate.position.set(0, 0.02, -0.05);
      group.add(plate);

      // Long Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), materials.metalSilver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, 0.5);
      group.add(barrel);

      // Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.3), materials.woodPlank);
      stock.position.set(0, -0.05, -0.4);
      group.add(stock);

      // Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.12), materials.metalSilver);
      mag.position.set(0, -0.15, 0.08);
      mag.rotation.x = -0.2;
      group.add(mag);

      // Holo sight
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), materials.metalDark);
      sight.position.set(0, 0.11, -0.05);
      group.add(sight);
      break;
    }

    case 'shotgun': {
      // Heavy wide receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.55), materials.metalDark);
      group.add(receiver);

      // Thick double barrel
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.45), materials.metalSilver);
      barrel.position.set(0, 0.04, 0.45);
      group.add(barrel);

      // Wooden pump grip
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), materials.woodPlank);
      pump.position.set(0, -0.05, 0.35);
      group.add(pump);

      // Wood buttstock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.35), materials.woodPlank);
      stock.position.set(0, -0.06, -0.4);
      group.add(stock);

      // Accent badge
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.2), accentMat);
      badge.position.set(0, 0.02, 0);
      group.add(badge);
      break;
    }

    case 'sniper': {
      // Long rifle body
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.7), materials.metalDark);
      group.add(receiver);

      // Extra long barrel with muzzle brake
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8), materials.metalSilver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, 0.7);
      group.add(barrel);

      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.1), materials.metalDark);
      muzzle.position.set(0, 0.04, 1.12);
      group.add(muzzle);

      // Sniper Optical Scope
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.45), accentMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.15, -0.05);
      group.add(scope);

      // Scope lens ring
      const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05), materials.metalSilver);
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.set(0, 0.15, 0.18);
      group.add(lensRing);

      // Bipod legs folded
      const bipod = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), materials.metalSilver);
      bipod.position.set(0, -0.1, 0.45);
      group.add(bipod);
      break;
    }

    case 'smg': {
      // Compact receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.4), materials.metalDark);
      group.add(receiver);

      // Short barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25), materials.metalSilver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, 0.3);
      group.add(barrel);

      // Foregrip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), materials.metalDark);
      grip.position.set(0, -0.14, 0.16);
      group.add(grip);

      // Extended magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.08), accentMat);
      mag.position.set(0, -0.18, -0.05);
      group.add(mag);
      break;
    }

    case 'rpg': {
      // Green bazooka launch tube
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x2e4c1e, roughness: 0.7, flatShading: true });
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2), tubeMat);
      tube.rotation.x = Math.PI / 2;
      group.add(tube);

      // Rocket warhead loaded in front
      const rocketHead = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 6), accentMat);
      rocketHead.rotation.x = Math.PI / 2;
      rocketHead.position.set(0, 0, 0.75);
      group.add(rocketHead);

      // Rocket fins
      const fins = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.04), materials.metalSilver);
      fins.position.set(0, 0, 0.55);
      group.add(fins);

      // Exhaust cone in back
      const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.15, 6), materials.metalDark);
      exhaust.rotation.x = -Math.PI / 2;
      exhaust.position.set(0, 0, -0.65);
      group.add(exhaust);
      break;
    }

    case 'mini_shield':
    case 'shield_pot': {
      // Translucent potion bottle
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 8), materials.potionBottle);
      group.add(bottle);

      // Glowing liquid inside
      const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.28, 8), materials.potionLiquid);
      liquid.position.y = -0.02;
      group.add(liquid);

      // Cork
      const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08), materials.woodPlank);
      cork.position.y = 0.21;
      group.add(cork);
      break;
    }

    case 'medkit': {
      // Red first aid briefcase
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.18), materials.medkitRed);
      group.add(box);

      // White cross
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.02), materials.medkitWhite);
      crossV.position.z = 0.1;
      group.add(crossV);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.02), materials.medkitWhite);
      crossH.position.z = 0.1;
      group.add(crossH);
      break;
    }
  }

  return group;
}

/**
 * Creates low-poly Pine Tree.
 */
export function createPineTree(): THREE.Group {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeom = new THREE.CylinderGeometry(0.3, 0.45, 2.5, 6);
  const trunk = new THREE.Mesh(trunkGeom, materials.woodDark);
  trunk.position.y = 1.25;
  tree.add(trunk);

  // 3-tier foliage cones
  const tiers = [
    { radius: 2.2, height: 2.5, y: 3.0 },
    { radius: 1.7, height: 2.2, y: 4.5 },
    { radius: 1.1, height: 2.0, y: 5.8 },
  ];

  tiers.forEach(tier => {
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(tier.radius, tier.height, 6),
      materials.pineLeaves
    );
    foliage.position.y = tier.y;
    foliage.rotation.y = Math.random() * Math.PI;
    tree.add(foliage);
  });

  return tree;
}

/**
 * Creates low-poly Boulder / Rock.
 */
export function createBoulder(): THREE.Group {
  const group = new THREE.Group();
  const geom = new THREE.DodecahedronGeometry(1.4, 0);

  // Perturb vertices slightly for faceted natural rock look
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const scale = 0.85 + Math.random() * 0.3;
    pos.setXYZ(i, vx * scale, vy * scale * 0.8, vz * scale);
  }
  geom.computeVertexNormals();

  const rock = new THREE.Mesh(geom, Math.random() > 0.5 ? materials.stoneGray : materials.stoneDark);
  rock.position.y = 1.0;
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  group.add(rock);

  return group;
}

/**
 * Creates low-poly Wooden Wall structure for player building.
 */
export function createBuildWall(): THREE.Group {
  const group = new THREE.Group();

  // 4 horizontal wooden planks
  for (let i = 0; i < 4; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.7, 0.18), materials.woodPlank);
    plank.position.set(0, 0.4 + i * 0.75, 0);
    group.add(plank);
  }

  // Vertical support side posts
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.1, 0.24), materials.woodDark);
  postL.position.set(-1.8, 1.5, 0);
  group.add(postL);

  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.1, 0.24), materials.woodDark);
  postR.position.set(1.8, 1.5, 0);
  group.add(postR);

  // Diagonal brace
  const brace = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 0.14), materials.woodLight);
  brace.position.set(0, 1.5, 0.12);
  brace.rotation.z = Math.PI / 4.5;
  group.add(brace);

  return group;
}

/**
 * Creates low-poly Wooden Ramp / Stairs for player building.
 */
export function createBuildRamp(): THREE.Group {
  const group = new THREE.Group();

  // 5 steps angled up at 45 degrees
  const stepCount = 5;
  for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.75), materials.woodPlank);
    const progress = i / (stepCount - 1);
    step.position.set(0, 0.3 + progress * 2.4, -1.5 + progress * 3.0);
    group.add(step);
  }

  // Side stringer beams
  const beamL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 4.4), materials.woodDark);
  beamL.rotation.x = Math.PI / 4.8;
  beamL.position.set(-1.8, 1.5, 0);
  group.add(beamL);

  const beamR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 4.4), materials.woodDark);
  beamR.rotation.x = Math.PI / 4.8;
  beamR.position.set(1.8, 1.5, 0);
  group.add(beamR);

  return group;
}

/**
 * Creates low-poly Wooden Floor structure for player building.
 */
export function createBuildFloor(): THREE.Group {
  const group = new THREE.Group();

  for (let i = 0; i < 4; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 0.9), materials.woodPlank);
    plank.position.set(0, 0.07, -1.35 + i * 0.9);
    group.add(plank);
  }

  // Under-beams
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 3.8), materials.woodDark);
  beam1.position.set(-1.5, -0.08, 0);
  group.add(beam1);

  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 3.8), materials.woodDark);
  beam2.position.set(1.5, -0.08, 0);
  group.add(beam2);

  return group;
}

/**
 * Creates low-poly Cabin / House with doorway and roof.
 */
export function createCabin(): THREE.Group {
  const house = new THREE.Group();

  // Walls (Back, Left, Right, Front with doorway)
  const wallMat = materials.woodPlank;
  const darkMat = materials.woodDark;

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 8), darkMat);
  floor.position.y = 0.15;
  house.add(floor);

  // Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.3), wallMat);
  backWall.position.set(0, 2.0, -3.85);
  house.add(backWall);

  // Left Wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 8), wallMat);
  leftWall.position.set(-3.85, 2.0, 0);
  house.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 8), wallMat);
  rightWall.position.set(3.85, 2.0, 0);
  house.add(rightWall);

  // Front Wall Left side
  const frontL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4, 0.3), wallMat);
  frontL.position.set(-2.6, 2.0, 3.85);
  house.add(frontL);

  // Front Wall Right side
  const frontR = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4, 0.3), wallMat);
  frontR.position.set(2.6, 2.0, 3.85);
  house.add(frontR);

  // Front Wall Top Lintle over doorway
  const frontLintle = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.3), wallMat);
  frontLintle.position.set(0, 3.4, 3.85);
  house.add(frontLintle);

  // Gabled Roof
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 8.6), darkMat);
  roofL.position.set(-1.8, 5.0, 0);
  roofL.rotation.z = Math.PI / 6;
  house.add(roofL);

  const roofR = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 8.6), darkMat);
  roofR.position.set(1.8, 5.0, 0);
  roofR.rotation.z = -Math.PI / 6;
  house.add(roofR);

  return house;
}

/**
 * Creates low-poly Observation Watchtower.
 */
export function createWatchtower(): THREE.Group {
  const tower = new THREE.Group();

  // 4 Main corner posts (height: 9m)
  const postGeom = new THREE.CylinderGeometry(0.2, 0.25, 9, 6);
  const coords = [
    [-2.2, -2.2],
    [2.2, -2.2],
    [-2.2, 2.2],
    [2.2, 2.2],
  ];

  coords.forEach(([x, z]) => {
    const post = new THREE.Mesh(postGeom, materials.woodDark);
    post.position.set(x, 4.5, z);
    tower.add(post);
  });

  // Cross braces
  for (let h = 2.5; h <= 6.5; h += 2.0) {
    const brace1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 0.16), materials.woodPlank);
    brace1.position.set(0, h, 2.2);
    tower.add(brace1);
    const brace2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 0.16), materials.woodPlank);
    brace2.position.set(0, h, -2.2);
    tower.add(brace2);
  }

  // Top Observation Deck Platform
  const platform = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), materials.woodPlank);
  platform.position.y = 9.0;
  tower.add(platform);

  // Platform Railings
  const railF = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.0, 0.1), materials.woodDark);
  railF.position.set(0, 9.7, 2.6);
  tower.add(railF);
  const railB = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.0, 0.1), materials.woodDark);
  railB.position.set(0, 9.7, -2.6);
  tower.add(railB);
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 5.2), materials.woodDark);
  railL.position.set(-2.6, 9.7, 0);
  tower.add(railL);
  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 5.2), materials.woodDark);
  railR.position.set(2.6, 9.7, 0);
  tower.add(railR);

  // Small roof over top
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.8, 4), materials.woodDark);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 12.2;
  tower.add(roof);

  return tower;
}
