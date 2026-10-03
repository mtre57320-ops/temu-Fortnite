import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, Crosshair, Award, RotateCcw, Home } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface VictoryModalProps {
  isVictory: boolean;
  stats: PlayerStats;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isVictory,
  stats,
  onPlayAgain,
  onReturnLobby,
}) => {
  useEffect(() => {
    if (isVictory) {
      // Fire confetti bursts
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isVictory]);

  const accuracy = stats.shotsFired > 0
    ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-black border border-white/15 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-32 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isVictory ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />

        {/* Header Badge */}
        {isVictory ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Trophy className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-gaming text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-wider">
              #1 VICTORY ROYALE!
            </h1>
            <p className="text-sm font-gaming text-amber-200/80 mt-1">
              You are the last champion standing on the island!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mb-4">
              <Skull className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-gaming text-rose-500 tracking-wider">
              ELIMINATED
            </h1>
            <p className="text-sm font-gaming text-slate-400 mt-1">
              Placed #{stats.placement} in the Battle Royale
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
          <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-2xl">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-gaming">PLACEMENT</span>
            <span className="text-xl font-bold font-gaming text-white font-mono-numbers">
              #{stats.placement}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-2xl">
            <Skull className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-gaming">ELIMINATIONS</span>
            <span className="text-xl font-bold font-gaming text-white font-mono-numbers">
              {stats.kills}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-2xl">
            <Crosshair className="w-5 h-5 text-sky-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-gaming">DAMAGE DEALT</span>
            <span className="text-xl font-bold font-gaming text-white font-mono-numbers">
              {stats.damageDealt}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-2xl">
            <Trophy className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-gaming">ACCURACY</span>
            <span className="text-xl font-bold font-gaming text-white font-mono-numbers">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-gaming font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>

          <button
            onClick={onReturnLobby}
            className="flex items-center justify-center gap-2 py-3.5 px-6 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-gaming font-semibold text-base rounded-xl transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" />
            LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
