import React from 'react';
import { X, Keyboard, ShieldAlert } from 'lucide-react';

interface ControlsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in pointer-events-auto select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-gaming text-white tracking-wide">
              HOW TO PLAY & CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-xs font-gaming">
          {/* Movement & Gliding */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              Movement & Gliding
            </span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">WASD</span>
              <span className="text-white">Run / Steer</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Shift</span>
              <span className="text-white">Sprint Fast</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Space</span>
              <span className="text-white">Jump / Toggle Glider</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Mouse</span>
              <span className="text-white">Look Around (360°)</span>
            </div>
          </div>

          {/* Combat & Shooting */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
            <span className="text-rose-400 font-bold uppercase tracking-wider">
              Combat & Weapons
            </span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Left-Click</span>
              <span className="text-white">Fire / Chop / Place</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Right-Click</span>
              <span className="text-white">Aim Down Sights (ADS)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">R</span>
              <span className="text-white">Reload / Drink Potions</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">1 - 5 / Wheel</span>
              <span className="text-white">Switch Weapon Slots</span>
            </div>
          </div>

          {/* Building Mechanics */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
            <span className="text-sky-400 font-bold uppercase tracking-wider">
              Building Mechanics
            </span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Q</span>
              <span className="text-white">Wood Wall (10 Wood)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">C</span>
              <span className="text-white">Wood Ramp (10 Wood)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">V</span>
              <span className="text-white">Wood Floor (10 Wood)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Pickaxe (1)</span>
              <span className="text-white">Harvest Trees & Rocks</span>
            </div>
          </div>

          {/* Looting & Storm */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
            <span className="text-purple-400 font-bold uppercase tracking-wider">
              Chests & Storm
            </span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">E</span>
              <span className="text-white">Open Golden Chests</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">E</span>
              <span className="text-white">Pick up Ground Items</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Purple Zone</span>
              <span className="text-rose-400 font-bold">Takes Storm Dmg</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">White Ring</span>
              <span className="text-emerald-400 font-bold">Next Safe Eye</span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-gaming text-amber-300 mb-6">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>PRO TIP: Aim for the head with the Pump Shotgun or Heavy Bolt Sniper for massive critical damage!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-gaming font-bold rounded-xl transition-colors cursor-pointer"
        >
          GOT IT, LET'S PLAY
        </button>
      </div>
    </div>
  );
};
