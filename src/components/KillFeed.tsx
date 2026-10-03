import React from 'react';
import { KillFeedEntry } from '../game/types';
import { RARITY_COLORS } from '../game/weapons';

interface KillFeedProps {
  entries: KillFeedEntry[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ entries }) => {
  return (
    <div className="flex flex-col gap-1.5 items-end pointer-events-none select-none">
      {entries.slice(-5).map(entry => {
        const rarity = RARITY_COLORS[entry.rarity] || RARITY_COLORS.common;
        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-xs font-gaming tracking-wide animate-fade-in text-white/90"
          >
            <span className={entry.killer === 'Player' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {entry.killer}
            </span>
            <span className="text-slate-500 text-[10px]">eliminated</span>
            <span className={entry.victim === 'Player' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {entry.victim}
            </span>
            <span className="text-slate-500 text-[10px]">with</span>
            <span className={`${rarity.textClass} font-semibold flex items-center gap-1`}>
              {entry.weaponName}
              {entry.isHeadshot && (
                <span className="text-yellow-400 font-bold text-[10px] bg-yellow-400/20 px-1 rounded">
                  CRIT
                </span>
              )}
            </span>
            <span className="text-slate-500 text-[10px] tabular-nums">[{entry.distance}m]</span>
          </div>
        );
      })}
    </div>
  );
};
