import { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from './game/engine';
import {
  BuildType,
  DamageNumber,
  KillFeedEntry,
  PlayerStats,
  StormState,
  WeaponData,
} from './game/types';
import { DEFAULT_PICKAXE } from './game/weapons';
import { Lobby } from './components/Lobby';
import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { KillFeed } from './components/KillFeed';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ControlsOverlay } from './components/ControlsOverlay';

export default function App() {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'game_over'>('lobby');
  const [selectedSkinId, setSelectedSkinId] = useState<string>('commando');
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  // Engine Settings
  const [sensitivity, setSensitivity] = useState<number>(0.0022);
  const [volume, setVolume] = useState<number>(0.7);

  // Engine Reactive State
  const [stats, setStats] = useState<PlayerStats>({
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
  });

  const [inventory, setInventory] = useState<(WeaponData | null)[]>([
    DEFAULT_PICKAXE,
    null,
    null,
    null,
    null,
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const [storm, setStorm] = useState<StormState>({
    currentCenter: [0, 0],
    currentRadius: 135,
    targetCenter: [0, 0],
    targetRadius: 90,
    phase: 1,
    maxPhases: 5,
    timer: 45,
    phaseDuration: 45,
    isShrinking: false,
    damagePerSec: 1.5,
  });

  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [actionPrompt, setActionPrompt] = useState<string | null>(null);

  const [hitmarkerActive, setHitmarkerActive] = useState<boolean>(false);
  const [hitmarkerHeadshot, setHitmarkerHeadshot] = useState<boolean>(false);

  const [isBuildMode, setIsBuildMode] = useState<boolean>(false);
  const [currentBuildType, setCurrentBuildType] = useState<BuildType>('wall');

  const [minimapData, setMinimapData] = useState<{
    playerPos: [number, number];
    playerHeading: number;
    bots: [number, number][];
    stormCenter: [number, number];
    stormRadius: number;
    safeCenter: [number, number];
    safeRadius: number;
  }>({
    playerPos: [0, 0],
    playerHeading: 0,
    bots: [],
    stormCenter: [0, 0],
    stormRadius: 135,
    safeCenter: [0, 0],
    safeRadius: 90,
  });

  // Three.js Container
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Damage number lifecycle tick
  useEffect(() => {
    if (damageNumbers.length === 0) return;
    const interval = setInterval(() => {
      setDamageNumbers(prev =>
        prev
          .map(d => ({
            ...d,
            age: d.age + 0.05,
            opacity: Math.max(0, d.opacity - 0.04),
          }))
          .filter(d => d.opacity > 0)
      );
    }, 40);
    return () => clearInterval(interval);
  }, [damageNumbers.length]);

  // Start / Spawn Game
  const startGame = useCallback((skinId: string) => {
    setSelectedSkinId(skinId);
    setGameState('playing');
    setIsVictory(false);
    setDamageNumbers([]);
    setKillFeed([]);

    // Destroy existing engine if any
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    // Wait for container to mount
    setTimeout(() => {
      if (!gameContainerRef.current) return;

      const engine = new GameEngine(
        gameContainerRef.current,
        {
          onStatsUpdate: newStats => setStats({ ...newStats }),
          onInventoryUpdate: (newInv, newSlot) => {
            setInventory([...newInv]);
            setActiveSlot(newSlot);
          },
          onStormUpdate: newStorm => setStorm({ ...newStorm }),
          onDamageNumber: dmg => {
            setDamageNumbers(prev => [...prev.slice(-6), dmg]);
          },
          onKillFeed: entry => {
            setKillFeed(prev => [...prev.slice(-8), entry]);
          },
          onActionPrompt: prompt => setActionPrompt(prompt),
          onCrosshairHit: isHead => {
            setHitmarkerActive(true);
            setHitmarkerHeadshot(isHead);
            setTimeout(() => setHitmarkerActive(false), 120);
          },
          onMinimapUpdate: data => {
            setMinimapData(data);
          },
          onGameOver: (won, finalStats) => {
            setIsVictory(won);
            setStats({ ...finalStats });
            setGameState('game_over');
            if (document.exitPointerLock) {
              document.exitPointerLock();
            }
          },
        },
        skinId
      );

      engine.setMouseSensitivity(sensitivity);
      engineRef.current = engine;
    }, 50);
  }, [sensitivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Sync sensitivity
  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    if (engineRef.current) {
      engineRef.current.setMouseSensitivity(val);
    }
  };

  const handleSelectSlot = (slot: number) => {
    if (engineRef.current) {
      engineRef.current.selectSlot(slot);
      setIsBuildMode(false);
    }
  };

  // Keyboard listener for ESC to toggle settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameState === 'playing') {
        setIsSettingsOpen(prev => !prev);
      }
      if (e.code === 'KeyQ') {
        setIsBuildMode(true);
        setCurrentBuildType('wall');
      }
      if (e.code === 'KeyC') {
        setIsBuildMode(true);
        setCurrentBuildType('ramp');
      }
      if (e.code === 'KeyV') {
        setIsBuildMode(true);
        setCurrentBuildType('floor');
      }
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        setIsBuildMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <Lobby
          onStartGame={startGame}
          onOpenControls={() => setIsControlsOpen(true)}
        />
      )}

      {/* 2. PLAYING / GAME OVER 3D CANVAS */}
      <div
        ref={gameContainerRef}
        className={`w-full h-full ${gameState === 'lobby' ? 'hidden' : 'block'}`}
      />

      {/* 3. IN-GAME HUD & OVERLAYS */}
      {gameState === 'playing' && (
        <>
          {/* Minimap in Top Left */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <Minimap
              playerPos={minimapData.playerPos}
              playerHeading={minimapData.playerHeading}
              bots={minimapData.bots}
              stormCenter={minimapData.stormCenter}
              stormRadius={minimapData.stormRadius}
              safeCenter={minimapData.safeCenter}
              safeRadius={minimapData.safeRadius}
            />
          </div>

          {/* KillFeed in Top Right */}
          <div className="absolute top-20 right-6 z-20 pointer-events-none">
            <KillFeed entries={killFeed} />
          </div>

          {/* Core HUD Layer */}
          <HUD
            stats={stats}
            inventory={inventory}
            activeSlot={activeSlot}
            storm={storm}
            damageNumbers={damageNumbers}
            actionPrompt={actionPrompt}
            hitmarkerActive={hitmarkerActive}
            hitmarkerHeadshot={hitmarkerHeadshot}
            isBuildMode={isBuildMode}
            currentBuildType={currentBuildType}
            playerHeading={minimapData.playerHeading}
            aliveCount={minimapData.bots.length + 1}
            onSelectSlot={handleSelectSlot}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </>
      )}

      {/* 4. VICTORY / GAME OVER MODAL */}
      {gameState === 'game_over' && (
        <VictoryModal
          isVictory={isVictory}
          stats={stats}
          onPlayAgain={() => startGame(selectedSkinId)}
          onReturnLobby={() => {
            if (engineRef.current) {
              engineRef.current.destroy();
              engineRef.current = null;
            }
            setGameState('lobby');
          }}
        />
      )}

      {/* 5. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sensitivity={sensitivity}
        onSensitivityChange={handleSensitivityChange}
        volume={volume}
        onVolumeChange={setVolume}
        onReturnLobby={() => {
          setIsSettingsOpen(false);
          if (engineRef.current) {
            engineRef.current.destroy();
            engineRef.current = null;
          }
          setGameState('lobby');
        }}
      />

      {/* 6. HOW TO PLAY / CONTROLS MODAL */}
      <ControlsOverlay
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />
    </div>
  );
}
