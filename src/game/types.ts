import type * as THREE from 'three';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type WeaponCategory = 
  | 'pickaxe'
  | 'assault_rifle'
  | 'shotgun'
  | 'sniper'
  | 'smg'
  | 'rpg'
  | 'shield_pot'
  | 'mini_shield'
  | 'medkit';

export interface WeaponData {
  id: string;
  name: string;
  category: WeaponCategory;
  rarity: Rarity;
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  currentAmmo: number;
  reserveAmmo: number;
  reloadTime: number; // seconds
  spread: number;
  range: number;
  bulletSpeed?: number;
  pellets?: number;
  isConsumable?: boolean;
  healAmount?: number;
  shieldAmount?: number;
  maxShieldCap?: number;
  description: string;
}

export type BuildType = 'wall' | 'ramp' | 'floor';

export interface BuildStructure {
  id: string;
  type: BuildType;
  position: [number, number, number];
  rotationY: number;
  health: number;
  maxHealth: number;
  builderId: string; // 'player' or bot id
  mesh: THREE.Group;
}

export interface GroundItem {
  id: string;
  weapon: WeaponData;
  position: [number, number, number];
  mesh: THREE.Group;
  beaconMesh: THREE.Mesh;
}

export interface ChestObject {
  id: string;
  position: [number, number, number];
  rotationY: number;
  isOpened: boolean;
  mesh: THREE.Group;
  lidMesh: THREE.Group;
  glowMesh: THREE.Mesh;
}

export interface HarvestableObject {
  id: string;
  type: 'tree' | 'rock';
  position: [number, number, number];
  health: number;
  maxHealth: number;
  resourceType: 'wood' | 'stone';
  resourceAmount: number;
  mesh: THREE.Group;
}

export interface DamageNumber {
  id: string;
  damage: number;
  isHeadshot: boolean;
  isShield: boolean;
  screenX: number;
  screenY: number;
  opacity: number;
  age: number;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weaponName: string;
  rarity: Rarity;
  isHeadshot: boolean;
  distance: number;
}

export interface StormState {
  currentCenter: [number, number];
  currentRadius: number;
  targetCenter: [number, number];
  targetRadius: number;
  phase: number;
  maxPhases: number;
  timer: number;
  phaseDuration: number;
  isShrinking: boolean;
  damagePerSec: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  wood: number;
  stone: number;
  kills: number;
  damageDealt: number;
  shotsFired: number;
  shotsHit: number;
  placement: number;
  isAlive: boolean;
  isGliding: boolean;
  isReloading: boolean;
  reloadProgress: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  primaryColor: number;
  accentColor: number;
  skinColor: number;
  visorColor: number;
}
