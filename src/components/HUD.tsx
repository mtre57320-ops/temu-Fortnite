import React from 'react';
import { Shield, Heart, Axe, Layers, Zap, Crosshair } from 'lucide-react';
import { BuildType, DamageNumber, PlayerStats, StormState, WeaponData } from '../game/types';
import { RARITY_COLORS } from '../game/weapons';

interface HUDProps {
  stats: PlayerStats;
  inventory: (WeaponData | null)[];
  activeSlot: number;
  storm: StormState;
  damageNumbers: DamageNumber[];
  actionPrompt: string | null;
  hitmarkerActive: boolean;
  hitmarkerHeadshot: boolean;
  isBuildMode: boolean;
  currentBuildType: BuildType;
  playerHeading: number;
  aliveCount: number;
  onSelectSlot: (slot: number) => void;
  onOpenSettings: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  inventory,
  activeSlot,
  storm,
  damageNumbers,
  actionPrompt,
  hitmarkerActive,
  hitmarkerHeadshot,
  isBuildMode,
  currentBuildType,
  playerHeading,
  aliveCount,
  onSelectSlot,
  onOpenSettings,
}) => {
  // Convert heading radians to degrees (0 - 360)
  const deg = Math.round(((-playerHeading * 180) / Math.PI + 360) % 360);

  // Storm countdown formatting
  const minutes = Math.floor(Math.max(0, storm.timer) / 60);
  const seconds = Math.floor(Math.max(0, storm.timer) % 60);
  const formattedTimer = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const currentWeapon = inventory[activeSlot];

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-6">
      {/* 1. TOP BAR: Compass, Match Stats, Storm Timer */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Match Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-gaming tracking-wider">ALIVE</span>
              <span className="text-xl font-bold font-gaming text-white tracking-wide tabular-nums">
                {aliveCount}
              </span>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-gaming tracking-wider">ELIMS</span>
              <span className="text-xl font-bold font-gaming text-amber-400 tracking-wide tabular-nums">
                {stats.kills}
              </span>
            </div>
          </div>
        </div>

        {/* Top Center: Compass & Heading */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center px-6 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg font-gaming text-xs font-bold text-slate-200 tracking-widest gap-4">
            <span className={deg >= 345 || deg <= 15 ? 'text-amber-400 scale-110 font-black' : 'text-slate-500'}>N</span>
            <span className={deg >= 75 && deg <= 105 ? 'text-amber-400 scale-110 font-black' : 'text-slate-500'}>E</span>
            <span className="text-white text-sm font-mono-numbers px-2">{deg}°</span>
            <span className={deg >= 165 && deg <= 195 ? 'text-amber-400 scale-110 font-black' : 'text-slate-500'}>S</span>
            <span className={deg >= 255 && deg <= 285 ? 'text-amber-400 scale-110 font-black' : 'text-slate-500'}>W</span>
          </div>

          {/* Storm Phase & Countdown */}
          <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-purple-950/70 border border-purple-500/30 rounded-lg text-xs font-gaming text-purple-200">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>
              {storm.isShrinking ? 'STORM SHRINKING' : `STORM EYE PHASE ${storm.phase}`}
            </span>
            <span className="font-mono-numbers font-bold text-white ml-1">{formattedTimer}</span>
          </div>
        </div>

        {/* Top Right: Settings Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-xs font-gaming text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ESC / SETTINGS
          </button>
        </div>
      </div>

      {/* 2. CENTER: Dynamic Crosshair & Hitmarkers & Floating Damage Numbers */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Floating Damage Numbers */}
        {damageNumbers.map(d => (
          <div
            key={d.id}
            style={{
              left: `${d.screenX}px`,
              top: `${d.screenY - d.age * 55}px`,
              opacity: d.opacity,
            }}
            className={`absolute font-gaming font-extrabold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all pointer-events-none ${
              d.isHeadshot
                ? 'text-yellow-400 scale-125'
                : d.isShield
                ? 'text-cyan-400'
                : 'text-white'
            }`}
          >
            {d.damage}
          </div>
        ))}

        {/* Crosshair Graphic */}
        {!isBuildMode && (
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Center dot */}
            <div className={`w-1.5 h-1.5 rounded-full ${hitmarkerActive ? 'bg-red-500 scale-125' : 'bg-white/80'}`} />

            {/* Crosshair ticks */}
            <div className={`absolute top-0 w-0.5 h-2 ${hitmarkerActive ? 'bg-red-400' : 'bg-white/70'}`} />
            <div className={`absolute bottom-0 w-0.5 h-2 ${hitmarkerActive ? 'bg-red-400' : 'bg-white/70'}`} />
            <div className={`absolute left-0 h-0.5 w-2 ${hitmarkerActive ? 'bg-red-400' : 'bg-white/70'}`} />
            <div className={`absolute right-0 h-0.5 w-2 ${hitmarkerActive ? 'bg-red-400' : 'bg-white/70'}`} />

            {/* Hitmarker X tick */}
            {hitmarkerActive && (
              <div
                className={`absolute w-5 h-5 flex items-center justify-center animate-ping ${
                  hitmarkerHeadshot ? 'text-yellow-400' : 'text-red-500'
                }`}
              >
                <Crosshair className="w-5 h-5" />
              </div>
            )}
          </div>
        )}

        {/* Building Mode Reticle */}
        {isBuildMode && (
          <div className="flex flex-col items-center gap-1 bg-black/60 px-4 py-2 rounded-lg border border-sky-400/40 text-sky-300 font-gaming text-xs">
            <span className="font-bold tracking-wider uppercase">BUILDING: {currentBuildType}</span>
            <span className="text-[10px] text-slate-300">Left-Click to Place (10 Wood)</span>
          </div>
        )}
      </div>

      {/* Action Prompt (Floating above inventory) */}
      {actionPrompt && (
        <div className="self-center mb-4 px-5 py-2 bg-black/80 backdrop-blur-md border border-amber-400/50 rounded-xl shadow-2xl text-amber-300 font-gaming text-sm font-semibold tracking-wide animate-bounce">
          {actionPrompt}
        </div>
      )}

      {/* Glider Prompt */}
      {stats.isGliding && (
        <div className="self-center mb-3 px-4 py-1.5 bg-sky-950/80 backdrop-blur-md border border-sky-400/40 rounded-lg text-sky-200 font-gaming text-xs">
          GLIDER DEPLOYED · [SPACE] TO DIVE FASTER · WASD TO STEER
        </div>
      )}

      {/* 3. BOTTOM BAR: Health/Shield (Left), 5-Slot Inventory (Center), Mats & Build (Right) */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Health & Shield Vitals */}
        <div className="flex flex-col gap-2 w-72 bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl shadow-xl">
          {/* Shield Bar (Cyan) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-gaming font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Shield className="w-3.5 h-3.5" /> SHIELD
              </span>
              <span className="text-white font-mono-numbers">{Math.round(stats.shield)} / 100</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-200"
                style={{ width: `${Math.max(0, Math.min(100, stats.shield))}%` }}
              />
            </div>
          </div>

          {/* Health Bar (Green) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-gaming font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Heart className="w-3.5 h-3.5 fill-emerald-500/20" /> HEALTH
              </span>
              <span className="text-white font-mono-numbers">{Math.round(stats.health)} / 100</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-200"
                style={{ width: `${Math.max(0, Math.min(100, stats.health))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Center: 5-Slot Inventory Hotbar */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          {/* Reload indicator */}
          {stats.isReloading && currentWeapon && (
            <div className="flex flex-col items-center gap-1 text-xs font-gaming text-amber-400">
              <span>{currentWeapon.isConsumable ? 'CONSUMING...' : 'RELOADING...'}</span>
              <div className="w-48 h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-400/40">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${stats.reloadProgress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 5 Slots */}
          <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
            {inventory.map((item, idx) => {
              const isActive = activeSlot === idx;
              const rarity = item ? RARITY_COLORS[item.rarity] : null;

              return (
                <button
                  key={idx}
                  onClick={() => onSelectSlot(idx)}
                  className={`relative w-20 h-20 rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer transition-all border ${
                    isActive
                      ? 'border-amber-400 bg-white/10 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                      : 'border-white/10 hover:border-white/30 bg-black/40'
                  }`}
                >
                  {/* Slot Number keybadge */}
                  <span className="absolute top-1 left-2 text-[10px] font-bold font-gaming text-slate-400">
                    {idx + 1}
                  </span>

                  {/* Weapon Icon / Name */}
                  {item ? (
                    <>
                      <div className="my-auto flex flex-col items-center">
                        <span className="text-xs font-gaming font-bold text-center line-clamp-2 text-white">
                          {item.name}
                        </span>
                        <span className={`text-[9px] font-gaming font-medium ${rarity?.textClass}`}>
                          {rarity?.label}
                        </span>
                      </div>

                      {/* Ammo or Count */}
                      <div className="w-full flex justify-between items-center text-[10px] font-mono-numbers text-slate-300">
                        {item.category === 'pickaxe' ? (
                          <Axe className="w-3.5 h-3.5 text-slate-400" />
                        ) : item.isConsumable ? (
                          <span className="text-cyan-300 font-bold ml-auto">{item.currentAmmo}x</span>
                        ) : (
                          <>
                            <span className="font-bold text-white">{item.currentAmmo}</span>
                            <span className="text-slate-500">/ {item.reserveAmmo}</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="my-auto text-xs text-slate-600 font-gaming">EMPTY</span>
                  )}

                  {/* Rarity Bottom Stripe */}
                  {rarity && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                      style={{ backgroundColor: rarity.hex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Right: Materials & Quick Build Selector */}
        <div className="flex flex-col gap-2 items-end">
          {/* Quick Building selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-xl font-gaming text-xs">
            <div
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                isBuildMode && currentBuildType === 'wall'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-300 bg-white/5'
              }`}
            >
              <span className="font-mono-numbers text-slate-400 text-[10px]">[Q]</span>
              <span>WALL</span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                isBuildMode && currentBuildType === 'ramp'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-300 bg-white/5'
              }`}
            >
              <span className="font-mono-numbers text-slate-400 text-[10px]">[C]</span>
              <span>RAMP</span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                isBuildMode && currentBuildType === 'floor'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-300 bg-white/5'
              }`}
            >
              <span className="font-mono-numbers text-slate-400 text-[10px]">[V]</span>
              <span>FLOOR</span>
            </div>
          </div>

          {/* Materials Count */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl font-gaming">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-400">WOOD</span>
              <span className="text-base font-bold text-white font-mono-numbers">{stats.wood}</span>
            </div>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">STONE</span>
              <span className="text-base font-bold text-white font-mono-numbers">{stats.stone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
