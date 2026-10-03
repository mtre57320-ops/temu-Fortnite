import * as THREE from 'three';
import { CHARACTER_SKINS, createCharacterModel, createGliderModel, createWeaponMesh } from './models';
import { getTerrainHeight } from './terrain';
import { CharacterSkin, StormState, WeaponData } from './types';
import { createWeapon, generateRandomLoot } from './weapons';

const BOT_NAMES = [
  'xX_ShadowSniper_Xx',
  'NoobSlayer99',
  'VoxelViper',
  'PolyReaper',
  'LootGoblin_77',
  'BushCamper42',
  'SweatyBuilder',
  'PixelCommando',
  'CalamityJane',
  'DriftKing_BR',
  'ApexRaptor',
  'StormChaser_9',
  'RustLord_OG',
  'FortCrafter',
  'LaserFocus',
];

export interface BotInstance {
  id: string;
  name: string;
  skin: CharacterSkin;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  aimPitch: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  isAlive: boolean;
  isGliding: boolean;
  weapon: WeaponData;
  targetPos: THREE.Vector3 | null;
  targetTarget: { id: string; position: THREE.Vector3; isPlayer: boolean } | null;
  state: 'dropping' | 'looting' | 'roaming' | 'engaging' | 'fleeing_storm';
  fireCooldown: number;
  buildCooldown: number;
  decisionTimer: number;
  walkCycle: number;
  character: ReturnType<typeof createCharacterModel>;
  gliderMesh: THREE.Group;
  weaponMeshGroup: THREE.Group;
}

export function spawnBots(count: number, scene: THREE.Scene): BotInstance[] {
  const bots: BotInstance[] = [];

  for (let i = 0; i < count; i++) {
    const name = BOT_NAMES[i % BOT_NAMES.length] + (i >= BOT_NAMES.length ? `_${i}` : '');
    const skin = CHARACTER_SKINS[i % CHARACTER_SKINS.length];
    const character = createCharacterModel(skin);
    const glider = createGliderModel(skin.accentColor);
    character.root.add(glider);

    // Initial drop spawn high in the air
    const angle = (i / count) * Math.PI * 2;
    const r = 30 + Math.random() * 60;
    const spawnX = Math.cos(angle) * r;
    const spawnZ = Math.sin(angle) * r;
    const spawnY = 65 + Math.random() * 25; // drop height

    character.root.position.set(spawnX, spawnY, spawnZ);
    scene.add(character.root);

    // Initial weapon
    const weapon = Math.random() > 0.3 ? generateRandomLoot(false) : createWeapon('assault_rifle', 'common');
    const weaponMeshGroup = new THREE.Group();
    character.weaponSocket.add(weaponMeshGroup);
    weaponMeshGroup.add(createWeaponMesh(weapon.category, weapon.rarity));

    const bot: BotInstance = {
      id: `bot_${i}`,
      name,
      skin,
      position: new THREE.Vector3(spawnX, spawnY, spawnZ),
      velocity: new THREE.Vector3(0, 0, 0),
      rotationY: Math.random() * Math.PI * 2,
      aimPitch: 0,
      health: 100,
      maxHealth: 100,
      shield: 50,
      maxShield: 100,
      isAlive: true,
      isGliding: true,
      weapon,
      targetPos: null,
      targetTarget: null,
      state: 'dropping',
      fireCooldown: 1.0,
      buildCooldown: 3.0,
      decisionTimer: Math.random() * 2,
      walkCycle: Math.random() * 10,
      character,
      gliderMesh: glider,
      weaponMeshGroup,
    };

    bots.push(bot);
  }

  return bots;
}

export interface BotActionEvents {
  onShoot: (bot: BotInstance, origin: THREE.Vector3, dir: THREE.Vector3) => void;
  onBuildWall: (bot: BotInstance, position: THREE.Vector3, rotY: number) => void;
}

/**
 * Updates all bots behavior, movement, AI decision making, and combat.
 */
export function updateBots(
  bots: BotInstance[],
  delta: number,
  storm: StormState,
  playerPos: THREE.Vector3,
  playerIsAlive: boolean,
  events: BotActionEvents
) {
  const aliveBots = bots.filter(b => b.isAlive);

  for (const bot of aliveBots) {
    bot.decisionTimer -= delta;
    bot.fireCooldown -= delta;
    bot.buildCooldown -= delta;

    const terrainY = getTerrainHeight(bot.position.x, bot.position.z);

    // --- State 1: Dropping / Gliding ---
    if (bot.state === 'dropping') {
      bot.velocity.y = -6.5; // slow glide descent
      // Steer toward island center
      const toCenterX = -bot.position.x;
      const toCenterZ = -bot.position.z;
      const dist = Math.hypot(toCenterX, toCenterZ);
      if (dist > 5) {
        bot.velocity.x = (toCenterX / dist) * 7.0;
        bot.velocity.z = (toCenterZ / dist) * 7.0;
        bot.rotationY = Math.atan2(toCenterX, toCenterZ);
      }

      bot.position.addScaledVector(bot.velocity, delta);

      // Check touchdown
      if (bot.position.y <= terrainY + 0.1) {
        bot.position.y = terrainY;
        bot.state = 'roaming';
        bot.isGliding = false;
        bot.gliderMesh.visible = false;
      }

      bot.character.root.position.copy(bot.position);
      bot.character.root.rotation.y = bot.rotationY;
      continue;
    }

    // --- Gravity & Ground clamping ---
    if (bot.position.y > terrainY + 0.1) {
      bot.velocity.y -= 25 * delta;
      bot.position.y += bot.velocity.y * delta;
      if (bot.position.y < terrainY) {
        bot.position.y = terrainY;
        bot.velocity.y = 0;
      }
    } else {
      bot.position.y = terrainY;
      bot.velocity.y = 0;
    }

    // --- Check Storm Proximity ---
    const stormDist = Math.hypot(
      bot.position.x - storm.currentCenter[0],
      bot.position.z - storm.currentCenter[1]
    );
    const isOutsideStorm = stormDist > storm.currentRadius;

    if (isOutsideStorm) {
      bot.state = 'fleeing_storm';
      // Take storm damage
      bot.health -= storm.damagePerSec * delta;
      if (bot.health <= 0) {
        bot.isAlive = false;
        bot.character.root.visible = false;
        continue;
      }
    }

    // --- Decision Making ---
    if (bot.decisionTimer <= 0) {
      bot.decisionTimer = 1.2 + Math.random() * 1.5;

      // Find nearest enemy (player or other bot)
      let nearestDist = 55; // visual scan range
      let nearestTarget: { id: string; position: THREE.Vector3; isPlayer: boolean } | null = null;

      if (playerIsAlive) {
        const d = bot.position.distanceTo(playerPos);
        if (d < nearestDist) {
          nearestDist = d;
          nearestTarget = { id: 'player', position: playerPos, isPlayer: true };
        }
      }

      for (const other of aliveBots) {
        if (other.id === bot.id) continue;
        const d = bot.position.distanceTo(other.position);
        if (d < nearestDist) {
          nearestDist = d;
          nearestTarget = { id: other.id, position: other.position, isPlayer: false };
        }
      }

      if (bot.state !== 'fleeing_storm') {
        if (nearestTarget) {
          bot.state = 'engaging';
          bot.targetTarget = nearestTarget;
        } else {
          bot.state = 'roaming';
          // Pick a random spot inside safe zone
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * Math.max(10, storm.targetRadius * 0.7);
          bot.targetPos = new THREE.Vector3(
            storm.targetCenter[0] + Math.cos(angle) * r,
            0,
            storm.targetCenter[1] + Math.sin(angle) * r
          );
        }
      }
    }

    // --- Execute Behaviors ---
    let moveDir = new THREE.Vector3();
    let moveSpeed = 5.2;

    if (bot.state === 'fleeing_storm') {
      // Run directly towards storm center
      const dx = storm.currentCenter[0] - bot.position.x;
      const dz = storm.currentCenter[1] - bot.position.z;
      const len = Math.hypot(dx, dz);
      if (len > 1) {
        moveDir.set(dx / len, 0, dz / len);
        bot.rotationY = Math.atan2(dx, dz);
      }
      moveSpeed = 6.8; // sprint
    } else if (bot.state === 'engaging' && bot.targetTarget) {
      const targetPos = bot.targetTarget.position;
      const dist = bot.position.distanceTo(targetPos);
      const dx = targetPos.x - bot.position.x;
      const dz = targetPos.z - bot.position.z;

      // Face target
      bot.rotationY = Math.atan2(dx, dz);

      // Pitch upper body towards target height
      const dy = targetPos.y - (bot.position.y + 1.2);
      bot.aimPitch = Math.atan2(dy, Math.hypot(dx, dz));

      // Tactical combat movement: Strafe and advance/retreat
      if (dist > 35) {
        // Move closer
        moveDir.set(dx / dist, 0, dz / dist);
      } else if (dist < 8) {
        // Back up
        moveDir.set(-dx / dist, 0, -dz / dist);
      } else {
        // Strafe sideways
        const strafeDir = Math.sin(Date.now() * 0.003 + bot.position.x) > 0 ? 1 : -1;
        const perpX = -dz / dist;
        const perpZ = dx / dist;
        moveDir.set(perpX * strafeDir, 0, perpZ * strafeDir);
      }

      // Emergency building: If bot has taken damage or in combat, place a wall occasionally
      if (bot.buildCooldown <= 0 && Math.random() < 0.25) {
        bot.buildCooldown = 5.0 + Math.random() * 4.0;
        const wallPos = bot.position.clone().add(new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(2.5));
        events.onBuildWall(bot, wallPos, bot.rotationY);
      }

      // Shoot weapon when cooldown is ready
      if (bot.fireCooldown <= 0 && dist < bot.weapon.range) {
        bot.fireCooldown = 1.0 / bot.weapon.fireRate + (Math.random() * 0.25 - 0.1);

        // Calculate aim direction with small natural spread
        const spreadAmount = bot.weapon.spread * 1.5;
        const aimDir = new THREE.Vector3(
          dx / dist + (Math.random() - 0.5) * spreadAmount,
          (targetPos.y + 0.8 - (bot.position.y + 1.2)) / dist + (Math.random() - 0.5) * spreadAmount,
          dz / dist + (Math.random() - 0.5) * spreadAmount
        ).normalize();

        const muzzlePos = bot.position.clone().add(new THREE.Vector3(0, 1.3, 0));
        events.onShoot(bot, muzzlePos, aimDir);
      }
    } else if (bot.targetPos) {
      // Roaming
      const dx = bot.targetPos.x - bot.position.x;
      const dz = bot.targetPos.z - bot.position.z;
      const len = Math.hypot(dx, dz);
      if (len > 2) {
        moveDir.set(dx / len, 0, dz / len);
        bot.rotationY = Math.atan2(dx, dz);
      } else {
        bot.targetPos = null;
      }
    }

    // Apply movement
    if (moveDir.lengthSq() > 0.01) {
      bot.position.x += moveDir.x * moveSpeed * delta;
      bot.position.z += moveDir.z * moveSpeed * delta;
      bot.walkCycle += delta * 12;

      // Animate walking limbs
      const swing = Math.sin(bot.walkCycle) * 0.6;
      bot.character.leftLeg.rotation.x = swing;
      bot.character.rightLeg.rotation.x = -swing;
      bot.character.leftArm.rotation.x = -swing * 0.7;
      bot.character.rightArm.rotation.x = -0.5 + swing * 0.2; // hold weapon
    } else {
      // Idle pose
      bot.character.leftLeg.rotation.x = 0;
      bot.character.rightLeg.rotation.x = 0;
      bot.character.leftArm.rotation.x = 0;
      bot.character.rightArm.rotation.x = -0.6; // aiming forward
    }

    // Sync 3D transforms
    bot.character.root.position.copy(bot.position);
    bot.character.root.rotation.y = bot.rotationY;
    bot.character.torso.rotation.x = -bot.aimPitch * 0.5;
  }
}
