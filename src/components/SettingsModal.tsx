import React from 'react';
import { X, Volume2, MousePointer, Keyboard, Download } from 'lucide-react';
import { sound } from '../game/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onReturnLobby?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sensitivity,
  onSensitivityChange,
  volume,
  onVolumeChange,
  onReturnLobby,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold font-gaming text-white tracking-wide">
            SETTINGS & CONTROLS
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-5 my-6">
          {/* Mouse Sensitivity */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-gaming text-slate-300">
              <span className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-sky-400" /> MOUSE SENSITIVITY
              </span>
              <span className="font-mono-numbers text-amber-400 font-bold">
                {Math.round(sensitivity * 10000)}
              </span>
            </div>
            <input
              type="range"
              min="0.0008"
              max="0.0050"
              step="0.0002"
              value={sensitivity}
              onChange={e => onSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-gaming text-slate-300">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" /> MASTER AUDIO VOLUME
              </span>
              <span className="font-mono-numbers text-amber-400 font-bold">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                onVolumeChange(v);
                sound.setVolume(v);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Keybinds Guide */}
        <div className="flex flex-col gap-2 mb-6">
          <span className="flex items-center gap-2 text-xs font-gaming font-semibold text-slate-400 tracking-wider">
            <Keyboard className="w-4 h-4 text-amber-400" /> QUICK CONTROLS REFERENCE
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-gaming p-3 bg-black/40 rounded-2xl border border-white/5">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">WASD / Shift</span>
              <span className="text-white font-bold">Move & Sprint</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Space</span>
              <span className="text-white font-bold">Jump / Glider</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Left-Click</span>
              <span className="text-white font-bold">Fire / Chop / Build</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Right-Click</span>
              <span className="text-white font-bold">Aim Down Sights (ADS)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">E</span>
              <span className="text-white font-bold">Open Chests / Loot</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">R</span>
              <span className="text-white font-bold">Reload / Drink Pot</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Q / C / V</span>
              <span className="text-amber-400 font-bold">Wall / Ramp / Floor</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">1 - 5 / Wheel</span>
              <span className="text-white font-bold">Slot Selector</span>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-gaming font-bold rounded-xl transition-colors cursor-pointer"
          >
            RESUME GAME
          </button>
          <a
            href="/polynite-battle-royale-code.zip"
            download="polynite-battle-royale-code.zip"
            className="flex items-center gap-1.5 py-3 px-4 bg-white/10 hover:bg-white/15 text-amber-300 font-gaming text-xs rounded-xl transition-colors cursor-pointer"
            title="Download ZIP"
          >
            <Download className="w-4 h-4 text-amber-400" />
            DOWNLOAD ZIP
          </a>
          {onReturnLobby && (
            <button
              onClick={onReturnLobby}
              className="py-3 px-5 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-gaming rounded-xl transition-colors cursor-pointer"
            >
              QUIT TO LOBBY
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
