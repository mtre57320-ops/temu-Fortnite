import { Rarity, WeaponCategory, WeaponData } from './types';

export const RARITY_COLORS: Record<Rarity, { hex: string; threeHex: number; label: string; bgClass: string; textClass: string }> = {
  common: { hex: '#94a3b8', threeHex: 0x94a3b8, label: 'Common', bgClass: 'bg-slate-500/20 border-slate-400', textClass: 'text-slate-300' },
  uncommon: { hex: '#22c55e', threeHex: 0x22c55e, label: 'Uncommon', bgClass: 'bg-emerald-500/20 border-emerald-400', textClass: 'text-emerald-400' },
  rare: { hex: '#3b82f6', threeHex: 0x3b82f6, label: 'Rare', bgClass: 'bg-blue-500/20 border-blue-400', textClass: 'text-blue-400' },
  epic: { hex: '#a855f7', threeHex: 0xa855f7, label: 'Epic', bgClass: 'bg-purple-500/20 border-purple-400', textClass: 'text-purple-400' },
  legendary: { hex: '#f59e0b', threeHex: 0xf59e0b, label: 'Legendary', bgClass: 'bg-amber-500/20 border-amber-400', textClass: 'text-amber-400' },
  mythic: { hex: '#ef4444', threeHex: 0xef4444, label: 'Mythic', bgClass: 'bg-rose-500/20 border-rose-400', textClass: 'text-rose-400' },
};

export const DEFAULT_PICKAXE: WeaponData = {
  id: 'default_pickaxe',
  name: 'Low-Poly Pickaxe',
  category: 'pickaxe',
  rarity: 'common',
  damage: 20,
  headshotMultiplier: 1.0,
  fireRate: 2.0,
  magazineSize: 1,
  currentAmmo: 1,
  reserveAmmo: 999,
  reloadTime: 0,
  spread: 0,
  range: 3.5,
  description: 'Gathers 15 wood or stone per hit. Melee weapon.',
};

export function createWeapon(category: WeaponCategory, rarity: Rarity): WeaponData {
  const uid = Math.random().toString(36).substring(2, 9);
  
  // Multipliers based on rarity
  const rarityMult = {
    common: 1.0,
    uncommon: 1.12,
    rare: 1.25,
    epic: 1.4,
    legendary: 1.6,
    mythic: 1.85,
  }[rarity];

  switch (category) {
    case 'assault_rifle': {
      const baseDmg = 28;
      const dmg = Math.round(baseDmg * rarityMult);
      return {
        id: `ar_${rarity}_${uid}`,
        name: rarity === 'mythic' ? 'Mythic Havoc Rifle' : `${RARITY_COLORS[rarity].label} Assault Rifle`,
        category: 'assault_rifle',
        rarity,
        damage: dmg,
        headshotMultiplier: 1.5,
        fireRate: 5.5, // 5.5 shots/sec
        magazineSize: 30,
        currentAmmo: 30,
        reserveAmmo: 120,
        reloadTime: 2.2,
        spread: 0.025,
        range: 120,
        description: 'Rapid-firing automatic rifle with high precision and reliable range.',
      };
    }

    case 'shotgun': {
      const baseDmg = 16; // 6 pellets = ~96 base dmg if all hit
      const dmg = Math.round(baseDmg * rarityMult);
      return {
        id: `sg_${rarity}_${uid}`,
        name: rarity === 'legendary' ? 'Golden Pump Shotgun' : `${RARITY_COLORS[rarity].label} Pump Shotgun`,
        category: 'shotgun',
        rarity,
        damage: dmg,
        headshotMultiplier: 2.0,
        fireRate: 1.1,
        magazineSize: 5,
        currentAmmo: 5,
        reserveAmmo: 25,
        reloadTime: 3.5,
        spread: 0.08,
        range: 28,
        pellets: 6,
        description: 'Deadly close-range spread. Devastating headshots at point blank.',
      };
    }

    case 'sniper': {
      const baseDmg = 85;
      const dmg = Math.round(baseDmg * rarityMult);
      return {
        id: `snp_${rarity}_${uid}`,
        name: rarity === 'mythic' ? 'Heavy Anti-Material Sniper' : `${RARITY_COLORS[rarity].label} Bolt Sniper`,
        category: 'sniper',
        rarity,
        damage: dmg,
        headshotMultiplier: 2.5, // one-shot headshot capability!
        fireRate: 0.7,
        magazineSize: 3,
        currentAmmo: 3,
        reserveAmmo: 15,
        reloadTime: 3.0,
        spread: 0.005,
        range: 250,
        bulletSpeed: 220,
        description: 'High-damage precision rifle with optical scope zoom [Right-Click].',
      };
    }

    case 'smg': {
      const baseDmg = 17;
      const dmg = Math.round(baseDmg * rarityMult);
      return {
        id: `smg_${rarity}_${uid}`,
        name: `${RARITY_COLORS[rarity].label} Rapid SMG`,
        category: 'smg',
        rarity,
        damage: dmg,
        headshotMultiplier: 1.4,
        fireRate: 10.0, // 10 shots per sec
        magazineSize: 35,
        currentAmmo: 35,
        reserveAmmo: 140,
        reloadTime: 1.8,
        spread: 0.045,
        range: 65,
        description: 'High rate of fire submachine gun shredding opponents up close.',
      };
    }

    case 'rpg': {
      const baseDmg = 100;
      const dmg = Math.round(baseDmg * rarityMult);
      return {
        id: `rpg_${rarity}_${uid}`,
        name: rarity === 'legendary' ? 'Golden Rocket Launcher' : `${RARITY_COLORS[rarity].label} Rocket Launcher`,
        category: 'rpg',
        rarity,
        damage: dmg,
        headshotMultiplier: 1.0,
        fireRate: 0.6,
        magazineSize: 1,
        currentAmmo: 1,
        reserveAmmo: 6,
        reloadTime: 3.8,
        spread: 0.01,
        range: 150,
        bulletSpeed: 38,
        description: 'Fires explosive rocket destroying walls and dealing massive splash damage.',
      };
    }

    case 'mini_shield': {
      return {
        id: `mini_${uid}`,
        name: 'Mini Shield Potion',
        category: 'mini_shield',
        rarity: 'uncommon',
        damage: 0,
        headshotMultiplier: 1,
        fireRate: 0.5,
        magazineSize: 3,
        currentAmmo: 3,
        reserveAmmo: 0,
        reloadTime: 2.0,
        spread: 0,
        range: 0,
        isConsumable: true,
        shieldAmount: 25,
        maxShieldCap: 50,
        description: 'Drink for +25 Shield (Caps at 50 max shield). Takes 2s.',
      };
    }

    case 'shield_pot': {
      return {
        id: `big_pot_${uid}`,
        name: 'Big Shield Potion',
        category: 'shield_pot',
        rarity: 'rare',
        damage: 0,
        headshotMultiplier: 1,
        fireRate: 0.3,
        magazineSize: 2,
        currentAmmo: 2,
        reserveAmmo: 0,
        reloadTime: 3.5,
        spread: 0,
        range: 0,
        isConsumable: true,
        shieldAmount: 50,
        maxShieldCap: 100,
        description: 'Drink for +50 Shield (Up to full 100 shield). Takes 3.5s.',
      };
    }

    case 'medkit': {
      return {
        id: `medkit_${uid}`,
        name: 'Medical Kit',
        category: 'medkit',
        rarity: 'rare',
        damage: 0,
        headshotMultiplier: 1,
        fireRate: 0.2,
        magazineSize: 1,
        currentAmmo: 1,
        reserveAmmo: 0,
        reloadTime: 5.0,
        spread: 0,
        range: 0,
        isConsumable: true,
        healAmount: 100,
        description: 'Restores full health to 100 HP. Takes 5s.',
      };
    }

    default:
      return DEFAULT_PICKAXE;
  }
}

/**
 * Returns a randomized weapon drop for ground loot or chest.
 */
export function generateRandomLoot(isChest: boolean = false): WeaponData {
  const rarities: Rarity[] = isChest
    ? ['uncommon', 'uncommon', 'rare', 'rare', 'epic', 'legendary']
    : ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'];

  const chosenRarity = rarities[Math.floor(Math.random() * rarities.length)];

  // Categories weighted
  const roll = Math.random();
  let category: WeaponCategory;
  if (roll < 0.38) {
    category = 'assault_rifle';
  } else if (roll < 0.65) {
    category = 'shotgun';
  } else if (roll < 0.82) {
    category = 'smg';
  } else if (roll < 0.93) {
    category = 'sniper';
  } else {
    category = 'rpg';
  }

  return createWeapon(category, chosenRarity);
}

export function generateConsumableDrop(): WeaponData {
  const roll = Math.random();
  if (roll < 0.45) {
    return createWeapon('mini_shield', 'uncommon');
  } else if (roll < 0.8) {
    return createWeapon('shield_pot', 'rare');
  } else {
    return createWeapon('medkit', 'rare');
  }
}
