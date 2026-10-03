import React, { useEffect, useRef } from 'react';

interface MinimapProps {
  playerPos: [number, number];
  playerHeading: number;
  bots: [number, number][];
  stormCenter: [number, number];
  stormRadius: number;
  safeCenter: [number, number];
  safeRadius: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerHeading,
  bots,
  stormCenter,
  stormRadius,
  safeCenter,
  safeRadius,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const worldRadius = 140; // max world distance shown in radar
    const scale = (size * 0.42) / worldRadius;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save for clipping to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, Math.PI * 2);
    ctx.clip();

    // Map background: Dark ocean
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Island landmass base circle
    const worldToMap = (wx: number, wz: number) => {
      // Relative to player or fixed world center?
      // Fixed island center gives the best Battle Royale orientation
      const mx = center + wx * scale;
      const my = center + wz * scale;
      return [mx, my];
    };

    // Island green mass
    const [ix, iy] = worldToMap(0, 0);
    ctx.beginPath();
    ctx.arc(ix, iy, 115 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#166534';
    ctx.fill();

    // Mountain center ring
    ctx.beginPath();
    ctx.arc(ix, iy, 40 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#15803d';
    ctx.fill();

    // Storm Circle (Purple)
    const [stX, stY] = worldToMap(stormCenter[0], stormCenter[1]);
    ctx.beginPath();
    ctx.arc(stX, stY, stormRadius * scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Safe Zone Circle (White dashed)
    const [sfX, sfY] = worldToMap(safeCenter[0], safeCenter[1]);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.arc(sfX, sfY, safeRadius * scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Enemy bots pings
    ctx.fillStyle = '#f87171';
    for (const [bx, bz] of bots) {
      const [bmx, bmy] = worldToMap(bx, bz);
      ctx.beginPath();
      ctx.arc(bmx, bmy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player marker & heading cone
    const [pmx, pmy] = worldToMap(playerPos[0], playerPos[1]);

    // Heading cone
    ctx.save();
    ctx.translate(pmx, pmy);
    ctx.rotate(playerHeading);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -16);
    ctx.lineTo(6, -16);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fill();

    // Player center icon (Golden arrow)
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    ctx.restore(); // end clip

    // Circular metallic border ring
    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cardinal Points (N, S, E, W)
    ctx.font = '10px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', center, 14);
    ctx.fillText('S', center, size - 14);
    ctx.fillText('E', size - 14, center);
    ctx.fillText('W', 14, center);
  }, [playerPos, playerHeading, bots, stormCenter, stormRadius, safeCenter, safeRadius]);

  return (
    <div className="relative p-1 bg-black/50 backdrop-blur-md rounded-full border border-white/15 shadow-xl">
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        className="rounded-full block"
      />
    </div>
  );
};
