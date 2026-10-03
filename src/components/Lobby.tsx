import React, { useState } from 'react';
import { Play, Shield, Compass, Sparkles, BookOpen, Layers, Download } from 'lucide-react';
import { CHARACTER_SKINS } from '../game/models';
import { CharacterSkin } from '../game/types';
import bannerArt from '../assets/images/polynite_banner_art_1791058935576.jpg';
import heroAvatar from '../assets/images/polynite_lobby_hero_1791058946352.jpg';

interface LobbyProps {
  onStartGame: (skinId: string) => void;
  onOpenControls: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, onOpenControls }) => {
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkin>(CHARACTER_SKINS[0]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between">
      {/* Background Hero Artwork with Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={bannerArt}
          alt="Polynite Island"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90"
        />
        {/* Measured dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/40" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
      </div>

      {/* TOP BAR CONTRACT: Brand Wordmark - Nav/Tags - Action */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-black font-black font-gaming shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            P
          </div>
          <span className="text-2xl font-black font-gaming tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-400">
            POLYNITE
          </span>
          <span className="text-xs font-gaming px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest ml-2">
            BATTLE ROYALE
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-gaming text-slate-300">
          <a
            href="/polynite-battle-royale-code.zip"
            download="polynite-battle-royale-code.zip"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            title="Download complete source code as a ZIP archive"
          >
            <Download className="w-4 h-4 text-amber-400" />
            DOWNLOAD CODE (.ZIP)
          </a>

          <button
            onClick={onOpenControls}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-300" />
            CONTROLS GUIDE
          </button>
        </div>
      </header>

      {/* MAIN CENTER: Character Showcase & Mode selection */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 max-w-7xl mx-auto w-full">
        {/* Left Side: Title & Game Features */}
        <div className="flex flex-col max-w-lg mb-8 md:mb-0">
          <div className="flex items-center gap-2 text-xs font-gaming text-amber-400 tracking-widest uppercase mb-2">
            <Sparkles className="w-4 h-4" /> LOW-POLY SURVIVAL ARENA
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-gaming tracking-tight leading-none mb-4 text-white drop-shadow-md">
            DROP. LOOT. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              BUILD. WIN.
            </span>
          </h1>

          <p className="text-sm text-slate-300 font-sans leading-relaxed mb-6">
            Skydive onto a faceted low-poly island, open golden chests, gather wood and stone, build defensive walls & ramps, and outlast 15 rivals before the closing storm engulfs the island.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <Compass className="w-5 h-5 text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-gaming font-bold text-white">Randomized Drops</span>
                <span className="text-[11px] text-slate-400">Chests & 6 Rarity Tiers</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <Layers className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-gaming font-bold text-white">Build Mechanics</span>
                <span className="text-[11px] text-slate-400">Walls, Ramps & Floors</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-gaming font-bold text-white">Shield Potions</span>
                <span className="text-[11px] text-slate-400">Minis, Big Pots & Medkits</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-gaming font-bold text-white">Electric Storm</span>
                <span className="text-[11px] text-slate-400">5 Dynamic Shrink Phases</span>
              </div>
            </div>
          </div>

          {/* Primary CTA: DEPLOY */}
          <button
            onClick={() => onStartGame(selectedSkin.id)}
            className="flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-gaming font-black text-xl tracking-wider uppercase transition-all shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-black" />
            DEPLOY NOW · 16 PLAYERS
          </button>
        </div>

        {/* Right Side: Outfit / Skin Selector & Character Visual */}
        <div className="flex flex-col items-center bg-black/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <span className="text-xs font-gaming text-slate-400 tracking-wider">CHOOSE OUTFIT</span>
            <span className="text-xs font-gaming font-bold text-amber-400">{selectedSkin.name}</span>
          </div>

          {/* Skin Preview Portrait */}
          <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-white/15 mb-4 shadow-inner">
            <img
              src={heroAvatar}
              alt="Character Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter"
            />
            {/* Color Accent Indicator */}
            <div
              className="absolute top-2 right-2 w-4 h-4 rounded-full border border-white shadow"
              style={{ backgroundColor: `#${selectedSkin.accentColor.toString(16).padStart(6, '0')}` }}
            />
          </div>

          <p className="text-xs text-slate-300 text-center mb-4 min-h-[32px]">
            {selectedSkin.description}
          </p>

          {/* Skin Choice Buttons */}
          <div className="grid grid-cols-5 gap-2 w-full">
            {CHARACTER_SKINS.map(skin => {
              const isSelected = selectedSkin.id === skin.id;
              const hexColor = `#${skin.accentColor.toString(16).padStart(6, '0')}`;
              return (
                <button
                  key={skin.id}
                  onClick={() => setSelectedSkin(skin)}
                  className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: hexColor }}
                  title={skin.name}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-4 border-t border-white/10 text-[11px] font-gaming text-slate-400">
        <span>POLYNITE BATTLE ROYALE · V1.0 ENGINE</span>
        <div className="flex items-center gap-4">
          <span>MOUSE + KEYBOARD OPTIMIZED</span>
          <span>·</span>
          <span>WEBGL 3D EXPERIENCE</span>
        </div>
      </footer>
    </div>
  );
};
