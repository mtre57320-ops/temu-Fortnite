import * as THREE from 'three';
import { sound } from './audio';
import { BotInstance, spawnBots, updateBots } from './bots';
import {
  CHARACTER_SKINS,
  createBuildFloor,
  createBuildRamp,
  createBuildWall,
  createCharacterModel,
  createGliderModel,
  createWeaponMesh,
} from './models';
import { buildIsland, getTerrainHeight, IslandWorld } from './terrain';
import {
  BuildStructure,
  BuildType,
  CharacterSkin,
  DamageNumber,
  GroundItem,
  KillFeedEntry,
  PlayerStats,
  Rarity,
  StormState,
  WeaponData,
} from './types';
import {
  createWeapon,
  DEFAULT_PICKAXE,
  generateConsumableDrop,
  generateRandomLoot,
  RARITY_COLORS,
} from './weapons';

interface RocketProjectile {
  id: string;
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  ownerId: string;
  damage: number;
  life: number;
}

export interface EngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onInventoryUpdate: (inventory: (WeaponData | null)[], activeSlot: number) => void;
  onStormUpdate: (storm: StormState) => void;
  onDamageNumber: (dmg: DamageNumber) => void;
  onKillFeed: (entry: KillFeedEntry) => void;
  onActionPrompt: (prompt: string | null) => void;
  onCrosshairHit: (isHeadshot: boolean) => void;
  onMinimapUpdate: (data: {
    playerPos: [number, number];
    playerHeading: number;
    bots: [number, number][];
    stormCenter: [number, number];
    stormRadius: number;
    safeCenter: [number, number];
    safeRadius: number;
  }) => void;
  onGameOver: (won: boolean, stats: PlayerStats) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // World & Environment
  private island!: IslandWorld;
  private stormMesh!: THREE.Mesh;
  private stormGlowRing!: THREE.Mesh;

  // Player Entity
  private playerSkin: CharacterSkin;
  private playerPos = new THREE.Vector3(0, 75, 50); // initial drop in sky
  private playerVelocity = new THREE.Vector3(0, 0, 0);
  private cameraYaw = 0;
  private cameraPitch = 0;
  private isPointerLocked = false;
  private isAiming = false; // Right-click ADS
  private isGliding = true;
  private isGrounded = false;
  private walkCycle = 0;

  // Player Visuals
  private playerChar!: ReturnType<typeof createCharacterModel>;
  private playerGlider!: THREE.Group;
  private playerWeaponGroup = new THREE.Group();

  // Inventory & Stats
  public inventory: (WeaponData | null)[] = [DEFAULT_PICKAXE, null, null, null, null];
  public activeSlot = 0;
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    wood: 60,
    stone: 30,
    kills: 0,
    damageDealt: 0,
    shotsFired: 0,
    shotsHit: 0,
    placement: 16,
    isAlive: true,
    isGliding: true,
    isReloading: false,
    reloadProgress: 0,
  };

  // Building System
  public isBuildMode = false;
  public currentBuildType: BuildType = 'wall';
  private buildPreviewMesh: THREE.Group | null = null;
  private structures: BuildStructure[] = [];

  // Ground Items & Projectiles
  private groundItems: GroundItem[] = [];
  private rockets: RocketProjectile[] = [];
  private bulletTracers: { line: THREE.Line; life: number }[] = [];

  // Bots
  private bots: BotInstance[] = [];

  // Storm State
  public storm: StormState = {
    currentCenter: [0, 0],
    currentRadius: 135,
    targetCenter: [0, 0],
    targetRadius: 90,
    phase: 1,
    maxPhases: 5,
    timer: 45, // 45 seconds until first shrink
    phaseDuration: 45,
    isShrinking: false,
    damagePerSec: 1.5,
  };

  // Input State
  private keys: Record<string, boolean> = {};
  private mouseSensitivity = 0.0022;
  private isMouseDown = false;
  private fireCooldown = 0;
  private reloadTimer = 0;
  private totalBotsCount = 15;

  constructor(container: HTMLElement, callbacks: EngineCallbacks, skinId: string = 'commando') {
    this.container = container;
    this.callbacks = callbacks;
    this.playerSkin = CHARACTER_SKINS.find(s => s.id === skinId) || CHARACTER_SKINS[0];

    // 1. Scene & Lighting
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // vibrant sky blue
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0055);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 500);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(70, 120, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 300;
    const d = 110;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x166534, 0.5);
    this.scene.add(hemiLight);

    // 5. Initialize World
    this.initWorld();

    // 6. Initialize Player Model
    this.initPlayer();

    // 7. Initialize Storm Barrier
    this.initStorm();

    // 8. Spawn Bots
    this.bots = spawnBots(this.totalBotsCount, this.scene);

    // 9. Initial Weapon Drops
    this.spawnInitialGroundLoot();

    // 10. Bind Input Listeners
    this.bindEvents();

    // 11. Start Loop
    this.startLoop();

    // Initial callbacks
    this.callbacks.onStatsUpdate(this.stats);
    this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);
    this.callbacks.onStormUpdate(this.storm);
  }

  private initWorld() {
    this.island = buildIsland(this.scene);
  }

  private initPlayer() {
    this.playerChar = createCharacterModel(this.playerSkin);
    this.playerGlider = createGliderModel(this.playerSkin.accentColor);
    this.playerChar.root.add(this.playerGlider);
    this.playerChar.weaponSocket.add(this.playerWeaponGroup);
    this.updatePlayerWeaponMesh();

    this.playerChar.root.position.copy(this.playerPos);
    this.scene.add(this.playerChar.root);
  }

  private initStorm() {
    // Translucent closing energy wall cylinder
    const stormGeom = new THREE.CylinderGeometry(
      this.storm.currentRadius,
      this.storm.currentRadius,
      120,
      48,
      1,
      true
    );
    const stormMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.1,
    });
    this.stormMesh = new THREE.Mesh(stormGeom, stormMat);
    this.stormMesh.position.set(this.storm.currentCenter[0], 40, this.storm.currentCenter[1]);
    this.scene.add(this.stormMesh);

    // Glowing border ring on ground
    const ringGeom = new THREE.RingGeometry(this.storm.currentRadius - 0.5, this.storm.currentRadius + 0.5, 48);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, side: THREE.DoubleSide });
    this.stormGlowRing = new THREE.Mesh(ringGeom, ringMat);
    this.stormGlowRing.position.set(this.storm.currentCenter[0], 0.4, this.storm.currentCenter[1]);
    this.scene.add(this.stormGlowRing);
  }

  private spawnInitialGroundLoot() {
    // Scatter 20 randomized weapons across the map
    const spawnPoints: [number, number][] = [
      [-40, -30], [-48, -40], [-20, -50], [40, -20], [50, -30],
      [30, 40], [42, 52], [10, 20], [-10, 30], [-35, 15],
      [0, -10], [15, -35], [-55, 30], [25, -5], [-15, -20],
      [60, 10], [-30, -15], [5, 45], [-60, -35], [20, 25],
    ];

    spawnPoints.forEach(([x, z]) => {
      const y = getTerrainHeight(x, z) + 0.5;
      const weapon = generateRandomLoot(false);
      this.dropItem([x, y, z], weapon);
    });
  }

  public dropItem(pos: [number, number, number], weapon: WeaponData) {
    const group = new THREE.Group();
    const mesh = createWeaponMesh(weapon.category, weapon.rarity);
    mesh.scale.set(1.4, 1.4, 1.4);
    group.add(mesh);
    group.position.set(pos[0], pos[1] + 0.3, pos[2]);

    // Glowing beacon pillar of light
    const rarityInfo = RARITY_COLORS[weapon.rarity];
    const beaconGeom = new THREE.CylinderGeometry(0.08, 0.08, 14, 8);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: rarityInfo.threeHex,
      transparent: true,
      opacity: 0.45,
    });
    const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
    beaconMesh.position.y = 7;
    group.add(beaconMesh);

    this.scene.add(group);
    this.groundItems.push({
      id: `item_${Math.random().toString(36).substring(2, 8)}`,
      weapon,
      position: pos,
      mesh: group,
      beaconMesh,
    });
  }

  private updatePlayerWeaponMesh() {
    // Clear existing
    while (this.playerWeaponGroup.children.length > 0) {
      this.playerWeaponGroup.remove(this.playerWeaponGroup.children[0]);
    }

    const current = this.inventory[this.activeSlot];
    if (current) {
      const mesh = createWeaponMesh(current.category, current.rarity);
      this.playerWeaponGroup.add(mesh);
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('wheel', this.onWheel);
    window.addEventListener('resize', this.onResize);

    this.container.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.container.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });
  }

  public setMouseSensitivity(val: number) {
    this.mouseSensitivity = val;
  }

  private onResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    // Slot keys 1-5
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
      const slot = parseInt(e.code.replace('Digit', '')) - 1;
      this.selectSlot(slot);
    }

    // Toggle Building Mode [Q] for Wall, [C] for Ramp, [V] for Floor
    if (e.code === 'KeyQ') {
      if (this.isBuildMode && this.currentBuildType === 'wall') {
        this.exitBuildMode();
      } else {
        this.enterBuildMode('wall');
      }
    }
    if (e.code === 'KeyC') {
      if (this.isBuildMode && this.currentBuildType === 'ramp') {
        this.exitBuildMode();
      } else {
        this.enterBuildMode('ramp');
      }
    }
    if (e.code === 'KeyV') {
      if (this.isBuildMode && this.currentBuildType === 'floor') {
        this.exitBuildMode();
      } else {
        this.enterBuildMode('floor');
      }
    }

    // Interact [E]
    if (e.code === 'KeyE') {
      this.handleInteract();
    }

    // Reload [R]
    if (e.code === 'KeyR') {
      this.startReload();
    }

    // Toggle Glider [Space] when in mid-air
    if (e.code === 'Space' && !this.isGrounded) {
      this.isGliding = !this.isGliding;
      this.playerGlider.visible = this.isGliding;
      if (this.isGliding) {
        sound.playGliderDeploy();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
      if (this.isBuildMode) {
        this.placeStructure();
      }
    } else if (e.button === 2) {
      e.preventDefault();
      this.isAiming = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    } else if (e.button === 2) {
      this.isAiming = false;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerLocked) return;

    const sens = this.isAiming ? this.mouseSensitivity * 0.55 : this.mouseSensitivity;
    this.cameraYaw -= e.movementX * sens;
    this.cameraPitch -= e.movementY * sens;

    // Clamp pitch between -85 deg and 85 deg
    const maxPitch = (Math.PI / 2) * 0.95;
    this.cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, this.cameraPitch));
  };

  private onWheel = (e: WheelEvent) => {
    if (e.deltaY > 0) {
      this.selectSlot((this.activeSlot + 1) % 5);
    } else if (e.deltaY < 0) {
      this.selectSlot((this.activeSlot - 1 + 5) % 5);
    }
  };

  public selectSlot(slot: number) {
    if (slot < 0 || slot >= 5) return;
    this.activeSlot = slot;
    if (this.isBuildMode) {
      this.exitBuildMode();
    }
    this.updatePlayerWeaponMesh();
    this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);
  }

  // --- Building Methods ---
  public enterBuildMode(type: BuildType) {
    this.isBuildMode = true;
    this.currentBuildType = type;

    // Remove existing preview
    if (this.buildPreviewMesh) {
      this.scene.remove(this.buildPreviewMesh);
      this.buildPreviewMesh = null;
    }

    let mesh: THREE.Group;
    if (type === 'wall') mesh = createBuildWall();
    else if (type === 'ramp') mesh = createBuildRamp();
    else mesh = createBuildFloor();

    // Set translucent blue preview material
    const blueHolo = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      wireframe: false,
    });
    mesh.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = blueHolo;
      }
    });

    this.buildPreviewMesh = mesh;
    this.scene.add(this.buildPreviewMesh);
  }

  public exitBuildMode() {
    this.isBuildMode = false;
    if (this.buildPreviewMesh) {
      this.scene.remove(this.buildPreviewMesh);
      this.buildPreviewMesh = null;
    }
  }

  private placeStructure() {
    if (!this.isBuildMode || !this.buildPreviewMesh) return;
    if (this.stats.wood < 10) {
      // Not enough materials
      sound.playHitmarker(false, false);
      return;
    }

    const pos = this.buildPreviewMesh.position.clone();
    const rotY = this.buildPreviewMesh.rotation.y;

    let realMesh: THREE.Group;
    if (this.currentBuildType === 'wall') realMesh = createBuildWall();
    else if (this.currentBuildType === 'ramp') realMesh = createBuildRamp();
    else realMesh = createBuildFloor();

    realMesh.position.copy(pos);
    realMesh.rotation.y = rotY;
    this.scene.add(realMesh);

    this.structures.push({
      id: `build_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: this.currentBuildType,
      position: [pos.x, pos.y, pos.z],
      rotationY: rotY,
      health: 150,
      maxHealth: 150,
      builderId: 'player',
      mesh: realMesh,
    });

    this.stats.wood -= 10;
    this.callbacks.onStatsUpdate(this.stats);
    sound.playBuild();
  }

  // --- Interaction (Chests, Loot, Consumables) ---
  private handleInteract() {
    // 1. Check nearby chests
    for (const chest of this.island.chests) {
      if (chest.isOpened) continue;
      const d = this.playerPos.distanceTo(new THREE.Vector3(...chest.position));
      if (d < 3.2) {
        // Open Chest!
        chest.isOpened = true;
        chest.lidMesh.rotation.x = -Math.PI / 2.2; // swing lid open
        chest.glowMesh.visible = false;
        sound.playChestOpen();

        // Pop out 1 high quality weapon, 1 consumable, ammo, and wood!
        const lootWeapon = generateRandomLoot(true);
        const lootConsumable = generateConsumableDrop();
        this.dropItem([chest.position[0] - 0.8, chest.position[1] + 0.8, chest.position[2]], lootWeapon);
        this.dropItem([chest.position[0] + 0.8, chest.position[1] + 0.8, chest.position[2]], lootConsumable);

        this.stats.wood += 30;
        this.callbacks.onStatsUpdate(this.stats);
        return;
      }
    }

    // 2. Check nearby ground items
    for (let i = 0; i < this.groundItems.length; i++) {
      const item = this.groundItems[i];
      const d = this.playerPos.distanceTo(new THREE.Vector3(...item.position));
      if (d < 3.0) {
        // Pickup item
        sound.playPickup();
        const pickedWeapon = item.weapon;

        // Remove from world
        this.scene.remove(item.mesh);
        this.groundItems.splice(i, 1);

        // Put into active slot or first empty slot
        const currentInSlot = this.inventory[this.activeSlot];
        if (!currentInSlot || this.activeSlot === 0) {
          // If in slot 0 (pickaxe), place into first free slot 1-4
          const freeSlot = this.inventory.findIndex((w, idx) => idx > 0 && w === null);
          if (freeSlot !== -1) {
            this.inventory[freeSlot] = pickedWeapon;
            this.selectSlot(freeSlot);
          } else {
            // Swap active slot if > 0
            if (this.activeSlot > 0 && currentInSlot) {
              this.dropItem(
                [this.playerPos.x, this.playerPos.y + 0.5, this.playerPos.z],
                currentInSlot
              );
              this.inventory[this.activeSlot] = pickedWeapon;
            } else {
              // Swap slot 1
              if (this.inventory[1]) {
                this.dropItem(
                  [this.playerPos.x, this.playerPos.y + 0.5, this.playerPos.z],
                  this.inventory[1]
                );
              }
              this.inventory[1] = pickedWeapon;
              this.selectSlot(1);
            }
          }
        } else {
          // Swap current slot
          this.dropItem(
            [this.playerPos.x, this.playerPos.y + 0.5, this.playerPos.z],
            currentInSlot
          );
          this.inventory[this.activeSlot] = pickedWeapon;
        }

        this.updatePlayerWeaponMesh();
        this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);
        return;
      }
    }
  }

  // --- Reloading & Consumables ---
  private startReload() {
    const current = this.inventory[this.activeSlot];
    if (!current) return;

    if (current.isConsumable) {
      // Use consumable
      if (this.stats.isReloading) return;
      this.stats.isReloading = true;
      this.reloadTimer = current.reloadTime;
      sound.playPotionDrink();
      return;
    }

    if (current.currentAmmo >= current.magazineSize || current.reserveAmmo <= 0) return;
    if (this.stats.isReloading) return;

    this.stats.isReloading = true;
    this.reloadTimer = current.reloadTime;
    sound.playReload();
  }

  private finishReload() {
    const current = this.inventory[this.activeSlot];
    this.stats.isReloading = false;
    this.stats.reloadProgress = 0;

    if (!current) return;

    if (current.isConsumable) {
      // Apply consumable effect
      if (current.shieldAmount) {
        const cap = current.maxShieldCap || 100;
        const add = Math.min(current.shieldAmount, Math.max(0, cap - this.stats.shield));
        this.stats.shield += add;
      }
      if (current.healAmount) {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + current.healAmount);
      }
      // Decrement consumable count
      current.currentAmmo -= 1;
      if (current.currentAmmo <= 0) {
        this.inventory[this.activeSlot] = null;
        this.selectSlot(0); // switch back to pickaxe
      }
      this.callbacks.onStatsUpdate(this.stats);
      this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);
      return;
    }

    const needed = current.magazineSize - current.currentAmmo;
    const reloadCount = Math.min(needed, current.reserveAmmo);
    current.currentAmmo += reloadCount;
    current.reserveAmmo -= reloadCount;

    this.callbacks.onStatsUpdate(this.stats);
    this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);
  }

  // --- Shooting & Projectiles ---
  private fireWeapon() {
    const current = this.inventory[this.activeSlot];
    if (!current || this.stats.isReloading) return;

    // Pickaxe swing
    if (current.category === 'pickaxe') {
      sound.playPickaxeSwing();
      this.fireCooldown = 1.0 / current.fireRate;
      this.performPickaxeHit();
      return;
    }

    // Consumables don't shoot with left-click; click starts drinking
    if (current.isConsumable) {
      this.startReload();
      return;
    }

    // Check ammo
    if (current.currentAmmo <= 0) {
      this.startReload();
      return;
    }

    current.currentAmmo -= 1;
    this.fireCooldown = 1.0 / current.fireRate;
    this.stats.shotsFired++;
    this.callbacks.onInventoryUpdate(this.inventory, this.activeSlot);

    // Audio per weapon
    switch (current.category) {
      case 'assault_rifle':
        sound.playAssaultRifle();
        break;
      case 'shotgun':
        sound.playShotgun();
        break;
      case 'sniper':
        sound.playSniper();
        break;
      case 'smg':
        sound.playSMG();
        break;
      case 'rpg':
        sound.playRPGLaunch();
        break;
    }

    // Camera recoil kick
    this.cameraPitch += (Math.random() * 0.008 + 0.006) * (current.category === 'sniper' ? 2.5 : 1);

    // Calculate aim ray from camera center
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const origin = raycaster.ray.origin.clone();
    let baseDir = raycaster.ray.direction.clone();

    // RPG projectile
    if (current.category === 'rpg') {
      this.spawnRocket(origin.clone().add(baseDir.clone().multiplyScalar(1.5)), baseDir, current.damage, 'player');
      return;
    }

    // Shotgun fires multiple pellets
    const pelletCount = current.pellets || 1;
    for (let p = 0; p < pelletCount; p++) {
      const spreadX = (Math.random() - 0.5) * current.spread;
      const spreadY = (Math.random() - 0.5) * current.spread;
      const pelletDir = baseDir.clone().add(new THREE.Vector3(spreadX, spreadY, spreadX)).normalize();

      this.performHitscanShot(origin, pelletDir, current.damage, current.headshotMultiplier, current.range);
    }
  }

  private performPickaxeHit() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    raycaster.far = 4.0;

    // 1. Check harvestables (trees, rocks)
    for (const h of this.island.harvestables) {
      if (h.health <= 0) continue;
      const dist = this.playerPos.distanceTo(new THREE.Vector3(...h.position));
      if (dist < 4.5) {
        h.health -= 35;
        sound.playHitHarvest(h.resourceType);

        if (h.resourceType === 'wood') {
          this.stats.wood += 15;
        } else {
          this.stats.stone += 15;
        }

        // Animate slight hit shake
        h.mesh.rotation.y += 0.1;
        h.mesh.scale.multiplyScalar(0.96);

        if (h.health <= 0) {
          this.scene.remove(h.mesh);
        }

        this.callbacks.onStatsUpdate(this.stats);
        return;
      }
    }

    // 2. Check player/bot structures
    for (let i = 0; i < this.structures.length; i++) {
      const s = this.structures[i];
      const dist = this.playerPos.distanceTo(new THREE.Vector3(...s.position));
      if (dist < 4.0) {
        s.health -= 50;
        sound.playHitHarvest('wood');
        this.stats.wood += 5;

        if (s.health <= 0) {
          this.scene.remove(s.mesh);
          this.structures.splice(i, 1);
        }

        this.callbacks.onStatsUpdate(this.stats);
        return;
      }
    }
  }

  private performHitscanShot(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number,
    headshotMult: number,
    range: number
  ) {
    const ray = new THREE.Ray(origin, direction);
    let closestDist = range;
    let hitBot: BotInstance | null = null;
    let isHeadshot = false;

    // Check collision against all alive bots
    for (const bot of this.bots) {
      if (!bot.isAlive) continue;

      // Approximate bounding cylinders/spheres
      const botPos = bot.position.clone();
      const bodyCenter = botPos.clone().add(new THREE.Vector3(0, 1.0, 0));
      const headCenter = botPos.clone().add(new THREE.Vector3(0, 1.8, 0));

      const bodySphere = new THREE.Sphere(bodyCenter, 0.7);
      const headSphere = new THREE.Sphere(headCenter, 0.35);

      const headHit = ray.intersectSphere(headSphere, new THREE.Vector3());
      const bodyHit = ray.intersectSphere(bodySphere, new THREE.Vector3());

      if (headHit) {
        const d = origin.distanceTo(headHit);
        if (d < closestDist) {
          closestDist = d;
          hitBot = bot;
          isHeadshot = true;
        }
      } else if (bodyHit) {
        const d = origin.distanceTo(bodyHit);
        if (d < closestDist) {
          closestDist = d;
          hitBot = bot;
          isHeadshot = false;
        }
      }
    }

    // Tracer line
    const hitPoint = origin.clone().add(direction.clone().multiplyScalar(closestDist));
    this.createTracer(origin, hitPoint);

    if (hitBot) {
      this.stats.shotsHit++;
      const finalDmg = Math.round(damage * (isHeadshot ? headshotMult : 1.0));
      const hasShield = hitBot.shield > 0;

      // Damage Bot
      if (hitBot.shield > 0) {
        hitBot.shield -= finalDmg;
        if (hitBot.shield < 0) {
          hitBot.health += hitBot.shield;
          hitBot.shield = 0;
        }
      } else {
        hitBot.health -= finalDmg;
      }

      this.stats.damageDealt += finalDmg;
      sound.playHitmarker(isHeadshot, hasShield);
      this.callbacks.onCrosshairHit(isHeadshot);

      // Trigger floating damage number
      this.addDamagePopup(finalDmg, isHeadshot, hasShield);

      if (hitBot.health <= 0) {
        // Eliminated!
        hitBot.isAlive = false;
        hitBot.character.root.visible = false;
        this.stats.kills++;
        sound.playElimination();

        // Drop bot's weapon and materials on ground
        this.dropItem(
          [hitBot.position.x, hitBot.position.y + 0.5, hitBot.position.z],
          hitBot.weapon
        );
        this.dropItem(
          [hitBot.position.x + 0.8, hitBot.position.y + 0.5, hitBot.position.z],
          generateConsumableDrop()
        );

        this.callbacks.onKillFeed({
          id: Math.random().toString(),
          killer: 'Player',
          victim: hitBot.name,
          weaponName: this.inventory[this.activeSlot]?.name || 'Weapon',
          rarity: this.inventory[this.activeSlot]?.rarity || 'common',
          isHeadshot,
          distance: Math.round(origin.distanceTo(hitBot.position)),
        });

        this.checkVictoryCondition();
      }

      this.callbacks.onStatsUpdate(this.stats);
    }
  }

  private addDamagePopup(damage: number, isHeadshot: boolean, isShield: boolean) {
    const centerScreenX = window.innerWidth / 2 + (Math.random() * 40 - 20);
    const centerScreenY = window.innerHeight / 2 - 40 + (Math.random() * 30 - 15);

    this.callbacks.onDamageNumber({
      id: Math.random().toString(),
      damage,
      isHeadshot,
      isShield,
      screenX: centerScreenX,
      screenY: centerScreenY,
      opacity: 1.0,
      age: 0,
    });
  }

  private createTracer(start: THREE.Vector3, end: THREE.Vector3) {
    const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.8,
    });
    const line = new THREE.Line(geom, mat);
    this.scene.add(line);
    this.bulletTracers.push({ line, life: 0.08 });
  }

  private spawnRocket(pos: THREE.Vector3, dir: THREE.Vector3, damage: number, ownerId: string) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, flatShading: true })
    );
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, flatShading: true })
    );
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.55;
    group.add(tip);

    group.position.copy(pos);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    this.scene.add(group);

    this.rockets.push({
      id: Math.random().toString(),
      mesh: group,
      velocity: dir.clone().multiplyScalar(40), // 40 m/s rocket speed
      ownerId,
      damage,
      life: 5.0,
    });
  }

  private updateRockets(delta: number) {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life -= delta;
      r.mesh.position.addScaledVector(r.velocity, delta);

      const rPos = r.mesh.position;
      const terrainY = getTerrainHeight(rPos.x, rPos.z);

      let hasCollided = false;

      // Ground hit
      if (rPos.y <= terrainY) {
        hasCollided = true;
      }

      // Check hit against bots or player
      if (r.ownerId === 'player') {
        for (const bot of this.bots) {
          if (bot.isAlive && bot.position.distanceTo(rPos) < 2.5) {
            hasCollided = true;
            break;
          }
        }
      } else {
        if (this.playerPos.distanceTo(rPos) < 2.5) {
          hasCollided = true;
        }
      }

      if (hasCollided || r.life <= 0) {
        // Explosion!
        sound.playExplosion();
        this.explodeRocket(rPos, r.damage, r.ownerId);

        this.scene.remove(r.mesh);
        this.rockets.splice(i, 1);
      }
    }
  }

  private explodeRocket(center: THREE.Vector3, damage: number, ownerId: string) {
    const splashRadius = 8.0;

    // Damage bots in radius
    for (const bot of this.bots) {
      if (!bot.isAlive) continue;
      const d = bot.position.distanceTo(center);
      if (d < splashRadius) {
        const falloff = 1.0 - d / splashRadius;
        const dmg = Math.round(damage * falloff);
        bot.health -= dmg;

        if (ownerId === 'player') {
          this.stats.damageDealt += dmg;
          this.addDamagePopup(dmg, false, false);
          sound.playHitmarker(false, false);

          if (bot.health <= 0) {
            bot.isAlive = false;
            bot.character.root.visible = false;
            this.stats.kills++;
            sound.playElimination();
            this.checkVictoryCondition();
          }
        }
      }
    }

    // Damage player if in radius
    const playerDist = this.playerPos.distanceTo(center);
    if (playerDist < splashRadius) {
      const falloff = 1.0 - playerDist / splashRadius;
      const dmg = Math.round(damage * falloff * 0.7);
      this.damagePlayer(dmg);
    }

    // Destroy structures in radius
    for (let i = this.structures.length - 1; i >= 0; i--) {
      const s = this.structures[i];
      const d = new THREE.Vector3(...s.position).distanceTo(center);
      if (d < splashRadius) {
        this.scene.remove(s.mesh);
        this.structures.splice(i, 1);
      }
    }
  }

  public damagePlayer(amount: number) {
    if (!this.stats.isAlive) return;

    if (this.stats.shield > 0) {
      this.stats.shield -= amount;
      sound.playHitmarker(false, true);
      if (this.stats.shield < 0) {
        this.stats.health += this.stats.shield;
        this.stats.shield = 0;
      }
    } else {
      this.stats.health -= amount;
      sound.playHitmarker(false, false);
    }

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.stats.isAlive = false;
      sound.playElimination();

      const aliveBots = this.bots.filter(b => b.isAlive).length;
      this.stats.placement = aliveBots + 1;
      this.callbacks.onGameOver(false, this.stats);
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private checkVictoryCondition() {
    const aliveBots = this.bots.filter(b => b.isAlive).length;
    if (aliveBots === 0 && this.stats.isAlive) {
      // #1 VICTORY ROYALE!
      this.stats.placement = 1;
      sound.playVictoryRoyale();
      this.callbacks.onGameOver(true, this.stats);
    }
  }

  // --- Main Update Loop ---
  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(0.1, this.clock.getDelta());

      this.update(delta);
      this.render();
    };
    animate();
  }

  private update(delta: number) {
    // 1. Update Reload & Fire Cooldowns
    if (this.fireCooldown > 0) this.fireCooldown -= delta;
    if (this.stats.isReloading) {
      this.reloadTimer -= delta;
      const current = this.inventory[this.activeSlot];
      if (current) {
        this.stats.reloadProgress = 1.0 - Math.max(0, this.reloadTimer) / current.reloadTime;
      }
      if (this.reloadTimer <= 0) {
        this.finishReload();
      }
      this.callbacks.onStatsUpdate(this.stats);
    }

    // Auto-fire when mouse held down
    if (this.isMouseDown && this.fireCooldown <= 0 && this.isPointerLocked && !this.isBuildMode) {
      this.fireWeapon();
    }

    // 2. Update Player Physics & Movement
    this.updatePlayerMovement(delta);

    // 3. Update Camera
    this.updateCamera();

    // 4. Update Building Preview Hologram
    if (this.isBuildMode && this.buildPreviewMesh) {
      this.updateBuildPreview();
    }

    // 5. Update Storm System
    this.updateStorm(delta);

    // 6. Update Bots AI
    updateBots(
      this.bots,
      delta,
      this.storm,
      this.playerPos,
      this.stats.isAlive,
      {
        onShoot: (bot, origin, dir) => {
          // Bot shoots
          if (bot.weapon.category === 'rpg') {
            this.spawnRocket(origin, dir, bot.weapon.damage, bot.id);
          } else {
            // Raycast towards player or other bots
            const ray = new THREE.Ray(origin, dir);
            const playerSphere = new THREE.Sphere(
              this.playerPos.clone().add(new THREE.Vector3(0, 1.0, 0)),
              0.8
            );
            const hit = ray.intersectSphere(playerSphere, new THREE.Vector3());
            const hitPoint = hit || origin.clone().add(dir.clone().multiplyScalar(40));
            this.createTracer(origin, hitPoint);

            if (hit) {
              const dist = origin.distanceTo(hit);
              if (dist < bot.weapon.range) {
                this.damagePlayer(bot.weapon.damage * 0.7);
              }
            }
          }
        },
        onBuildWall: (bot, pos, rotY) => {
          const wall = createBuildWall();
          wall.position.copy(pos);
          wall.rotation.y = rotY;
          this.scene.add(wall);
          this.structures.push({
            id: `bot_wall_${Math.random()}`,
            type: 'wall',
            position: [pos.x, pos.y, pos.z],
            rotationY: rotY,
            health: 150,
            maxHealth: 150,
            builderId: bot.id,
            mesh: wall,
          });
        },
      }
    );

    // 7. Update Rockets & Tracers
    this.updateRockets(delta);

    for (let i = this.bulletTracers.length - 1; i >= 0; i--) {
      const tr = this.bulletTracers[i];
      tr.life -= delta;
      if (tr.life <= 0) {
        this.scene.remove(tr.line);
        this.bulletTracers.splice(i, 1);
      }
    }

    // 8. Update Ground Items Rotation & Bobbing
    const time = this.clock.getElapsedTime();
    for (const item of this.groundItems) {
      item.mesh.rotation.y = time * 1.5;
      item.mesh.position.y = item.position[1] + 0.3 + Math.sin(time * 3 + item.position[0]) * 0.12;
    }

    // 9. Update Interactive HUD Prompts
    this.updateActionPrompts();

    // 10. Update Minimap Pings
    const aliveBotsPositions: [number, number][] = this.bots
      .filter(b => b.isAlive)
      .map(b => [b.position.x, b.position.z]);

    this.callbacks.onMinimapUpdate({
      playerPos: [this.playerPos.x, this.playerPos.z],
      playerHeading: this.cameraYaw,
      bots: aliveBotsPositions,
      stormCenter: this.storm.currentCenter,
      stormRadius: this.storm.currentRadius,
      safeCenter: this.storm.targetCenter,
      safeRadius: this.storm.targetRadius,
    });
  }

  private updatePlayerMovement(delta: number) {
    if (!this.stats.isAlive) return;

    // Movement vector relative to camera yaw
    let forward = 0;
    let strafe = 0;

    if (this.keys['KeyW']) forward += 1;
    if (this.keys['KeyS']) forward -= 1;
    if (this.keys['KeyA']) strafe -= 1;
    if (this.keys['KeyD']) strafe += 1;

    const moveVector = new THREE.Vector3();
    if (forward !== 0 || strafe !== 0) {
      const forwardVec = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      const rightVec = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
      moveVector.addScaledVector(forwardVec, forward);
      moveVector.addScaledVector(rightVec, strafe);
      moveVector.normalize();
    }

    const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const baseSpeed = isSprinting ? 9.5 : 6.0;

    // Gliding Physics
    if (this.isGliding) {
      this.playerVelocity.y = -4.5; // gentle descent
      this.playerVelocity.x = moveVector.x * 12.0;
      this.playerVelocity.z = moveVector.z * 12.0;
    } else {
      // Normal Ground / Fall Physics
      this.playerVelocity.x = moveVector.x * baseSpeed;
      this.playerVelocity.z = moveVector.z * baseSpeed;

      // Gravity
      this.playerVelocity.y -= 28.0 * delta;

      // Jump
      if (this.keys['Space'] && this.isGrounded) {
        this.playerVelocity.y = 11.5;
        this.isGrounded = false;
      }
    }

    // Apply movement
    this.playerPos.addScaledVector(this.playerVelocity, delta);

    // Collision against Island Terrain
    const terrainY = getTerrainHeight(this.playerPos.x, this.playerPos.z);

    // Also check placed structures (standing on ramps and floors)
    let groundLevel = terrainY;
    for (const s of this.structures) {
      const sDist = Math.hypot(this.playerPos.x - s.position[0], this.playerPos.z - s.position[2]);
      if (sDist < 2.5) {
        if (s.type === 'floor' && this.playerPos.y >= s.position[1] - 0.2) {
          groundLevel = Math.max(groundLevel, s.position[1]);
        } else if (s.type === 'ramp') {
          groundLevel = Math.max(groundLevel, s.position[1] + 1.2);
        }
      }
    }

    if (this.playerPos.y <= groundLevel) {
      this.playerPos.y = groundLevel;
      this.playerVelocity.y = 0;
      this.isGrounded = true;

      // Disable glider upon landing
      if (this.isGliding) {
        this.isGliding = false;
        this.playerGlider.visible = false;
      }
    } else {
      this.isGrounded = false;
    }

    // Sync player 3D model
    this.playerChar.root.position.copy(this.playerPos);
    this.playerChar.root.rotation.y = this.cameraYaw;

    // Animate character walk cycle
    const isMoving = moveVector.lengthSq() > 0.01 && this.isGrounded;
    if (isMoving) {
      this.walkCycle += delta * (isSprinting ? 14 : 10);
      const swing = Math.sin(this.walkCycle) * 0.7;
      this.playerChar.leftLeg.rotation.x = swing;
      this.playerChar.rightLeg.rotation.x = -swing;
      this.playerChar.leftArm.rotation.x = -swing * 0.8;
      this.playerChar.rightArm.rotation.x = -0.5 + swing * 0.2;
    } else {
      this.playerChar.leftLeg.rotation.x = 0;
      this.playerChar.rightLeg.rotation.x = 0;
      this.playerChar.leftArm.rotation.x = 0;
      this.playerChar.rightArm.rotation.x = -0.6; // aiming forward
    }

    // Pitch head & weapon aiming
    this.playerChar.headGroup.rotation.x = this.cameraPitch * 0.5;
    this.playerChar.rightArm.rotation.x = -0.6 + this.cameraPitch * 0.8;
  }

  private updateCamera() {
    // 3rd-person chase camera over the right shoulder
    const cameraDistance = this.isAiming ? 1.8 : 3.4;
    const cameraHeight = this.isAiming ? 1.5 : 1.7;
    const shoulderOffset = this.isAiming ? 0.45 : 0.6;

    // Target position above player's head
    const target = this.playerPos.clone().add(new THREE.Vector3(0, cameraHeight, 0));

    // Right-shoulder offset vector
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
    target.addScaledVector(right, shoulderOffset);

    // Camera offset behind target
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);

    const offset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * cameraDistance * cosPitch,
      sinPitch * cameraDistance,
      Math.cos(this.cameraYaw) * cameraDistance * cosPitch
    );

    const idealCamPos = target.clone().add(offset);

    // Prevent camera clipping through ground
    const camTerrainY = getTerrainHeight(idealCamPos.x, idealCamPos.z) + 0.4;
    if (idealCamPos.y < camTerrainY) {
      idealCamPos.y = camTerrainY;
    }

    this.camera.position.copy(idealCamPos);
    this.camera.lookAt(target);

    // ADS field-of-view zoom
    const targetFOV = this.isAiming ? 45 : 70;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.25);
    this.camera.updateProjectionMatrix();
  }

  private updateBuildPreview() {
    if (!this.buildPreviewMesh) return;

    // Snap 3.5m in front of player aligned with grid
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const targetPos = this.playerPos.clone().add(forward.multiplyScalar(3.6));

    // Snap to 4m grid intervals
    const gridSize = 3.8;
    const snapX = Math.round(targetPos.x / gridSize) * gridSize;
    const snapZ = Math.round(targetPos.z / gridSize) * gridSize;
    const snapY = getTerrainHeight(snapX, snapZ);

    this.buildPreviewMesh.position.set(snapX, snapY, snapZ);
    // Snap rotation to 90 deg increments
    const snapRot = Math.round(this.cameraYaw / (Math.PI / 2)) * (Math.PI / 2);
    this.buildPreviewMesh.rotation.y = snapRot;
  }

  private updateStorm(delta: number) {
    this.storm.timer -= delta;

    if (this.storm.timer <= 0) {
      if (!this.storm.isShrinking) {
        // Start shrinking phase
        this.storm.isShrinking = true;
        this.storm.timer = 30; // 30s shrink time
        sound.playStormWarning();
      } else {
        // Finished shrinking; advance phase
        this.storm.isShrinking = false;
        this.storm.currentCenter = [...this.storm.targetCenter];
        this.storm.currentRadius = this.storm.targetRadius;

        if (this.storm.phase < this.storm.maxPhases) {
          this.storm.phase++;
          this.storm.phaseDuration = 40;
          this.storm.timer = 40;
          this.storm.damagePerSec += 1.5;

          // Pick next safe zone center inside current
          const angle = Math.random() * Math.PI * 2;
          const maxShift = this.storm.currentRadius * 0.4;
          this.storm.targetCenter = [
            this.storm.currentCenter[0] + Math.cos(angle) * maxShift,
            this.storm.currentCenter[1] + Math.sin(angle) * maxShift,
          ];
          this.storm.targetRadius = Math.max(12, this.storm.currentRadius * 0.55);
        }
      }
    }

    if (this.storm.isShrinking) {
      // Lerp current storm radius and center toward target
      const shrinkProgress = 1.0 - Math.max(0, this.storm.timer) / 30;
      this.storm.currentRadius = THREE.MathUtils.lerp(
        this.storm.currentRadius,
        this.storm.targetRadius,
        delta * 0.4
      );
    }

    // Scale visual 3D cylinder
    this.stormMesh.scale.set(this.storm.currentRadius, 1, this.storm.currentRadius);
    this.stormMesh.position.set(this.storm.currentCenter[0], 40, this.storm.currentCenter[1]);

    this.stormGlowRing.scale.set(this.storm.currentRadius, this.storm.currentRadius, 1);
    this.stormGlowRing.position.set(this.storm.currentCenter[0], 0.35, this.storm.currentCenter[1]);

    // Check if player is outside storm
    const distFromStorm = Math.hypot(
      this.playerPos.x - this.storm.currentCenter[0],
      this.playerPos.z - this.storm.currentCenter[1]
    );

    if (distFromStorm > this.storm.currentRadius) {
      // Inflict ticking storm damage
      this.damagePlayer(this.storm.damagePerSec * delta);
    }

    this.callbacks.onStormUpdate(this.storm);
  }

  private updateActionPrompts() {
    let promptText: string | null = null;

    // Check Chests
    for (const chest of this.island.chests) {
      if (chest.isOpened) continue;
      const d = this.playerPos.distanceTo(new THREE.Vector3(...chest.position));
      if (d < 3.2) {
        promptText = 'Press [E] to Open Golden Chest';
        break;
      }
    }

    // Check Ground Loot
    if (!promptText) {
      for (const item of this.groundItems) {
        const d = this.playerPos.distanceTo(new THREE.Vector3(...item.position));
        if (d < 3.0) {
          const rarityName = RARITY_COLORS[item.weapon.rarity].label;
          promptText = `Press [E] to pick up ${item.weapon.name} (${rarityName})`;
          break;
        }
      }
    }

    this.callbacks.onActionPrompt(promptText);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
