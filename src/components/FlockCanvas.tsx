'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore, selectBoidSpecies } from '@/store/useGameStore';
import type { Boid } from '@/types';

interface ShipEntity {
  id: number;
  x: number;
  y: number;
  vx: number;        // horizontal speed (positive = right, negative = left)
  heading: 1 | -1;  // 1 = right, -1 = left
  type: 'tugboat' | 'cargo' | 'container' | 'supertanker' | 'ambient';
  color: string;
  size: number;
  lane: number;      // normalised y offset within water band (0–1)
  wakeOffset: number;
}

interface SpawnEffect {
  id: number;
  x: number;
  y: number;
  color: string;
  age: number;
  maxAge: number;
}

interface FlockCanvasProps {
  width: number;
  height: number;
}

export default function FlockCanvas({ width, height }: FlockCanvasProps) {
  const canvasRef              = useRef<HTMLCanvasElement>(null);
  const shipsRef               = useRef<ShipEntity[]>([]);
  const ambientShipsRef        = useRef<ShipEntity[]>([]);
  const spawnEffectsRef        = useRef<SpawnEffect[]>([]);
  const animationRef           = useRef<number>(0);
  const frameRef               = useRef<number>(0);
  const initializedRef         = useRef<boolean>(false);
  const prevBoidsLengthRef     = useRef<number>(0);

  const { boids, currentLevel, addBoid, lastSpawnedBird } = useGameStore();

  // Horizon line splits sky (above) from water (below)
  const horizonY = useCallback(() => height * 0.58, [height]);

  // ── Ambient background ships ──────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current || width === 0 || height === 0) return;
    initializedRef.current = true;

    const hz = height * 0.58;
    const waterH = height - hz;

    const ambient: ShipEntity[] = [];
    for (let i = 0; i < 8; i++) {
      const heading: 1 | -1 = i % 2 === 0 ? 1 : -1;
      ambient.push({
        id: -1000 - i,
        x: (i / 8) * width,
        y: hz + waterH * (0.15 + (i % 4) * 0.18),
        vx: heading * (0.15 + (i % 3) * 0.08),
        heading,
        type: 'ambient',
        color: '#c9a84c',
        size: 10,
        lane: 0.15 + (i % 4) * 0.18,
        wakeOffset: Math.random() * Math.PI * 2,
      });
    }
    ambientShipsRef.current = ambient;
  }, [width, height]);

  // ── Sync store boids → ShipEntity list ───────────────────────────────────
  const syncShips = useCallback(() => {
    const currentIds = new Set(shipsRef.current.map((s) => s.id));
    const hz = height * 0.58;
    const waterH = height - hz;

    boids.forEach((boid) => {
      if (currentIds.has(boid.id)) return;
      const info = selectBoidSpecies(boid.level);
      const laneIdx = shipsRef.current.length % 5;
      const laneY = hz + waterH * (0.12 + laneIdx * 0.17);

      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        spawnEffectsRef.current.push({
          id: Date.now() + i,
          x: boid.x || width * 0.5,
          y: laneY,
          color: info.color,
          age: 0,
          maxAge: 50,
        });
      }

      shipsRef.current.push({
        id: boid.id,
        x: boid.x || 0,
        y: laneY,
        vx: 0.4 + Math.random() * 0.3,
        heading: 1,
        type: levelToShipType(boid.level),
        color: info.color,
        size: info.size,
        lane: 0.12 + laneIdx * 0.17,
        wakeOffset: Math.random() * Math.PI * 2,
      });
    });

    const storeIds = new Set(boids.map((b) => b.id));
    shipsRef.current = shipsRef.current.filter((s) => storeIds.has(s.id));
  }, [boids, width, height]);

  // ── Handle newly spawned ship ─────────────────────────────────────────────
  const lastSpawnRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!lastSpawnedBird || lastSpawnRef.current) return;
    lastSpawnRef.current = lastSpawnedBird;

    const info = selectBoidSpecies(currentLevel);
    const hz = height * 0.58;
    const waterH = height - hz;
    const laneIdx = shipsRef.current.length % 5;
    const laneY = hz + waterH * (0.12 + laneIdx * 0.17);

    const newShip: ShipEntity = {
      id: Date.now(),
      x: -60,
      y: laneY,
      vx: 0.5 + Math.random() * 0.3,
      heading: 1,
      type: levelToShipType(currentLevel),
      color: info.color,
      size: info.size,
      lane: 0.12 + laneIdx * 0.17,
      wakeOffset: 0,
    };

    shipsRef.current.push(newShip);
    addBoid({
      id: newShip.id,
      x: newShip.x,
      y: newShip.y,
      vx: newShip.vx,
      vy: 0,
      level: currentLevel,
      species: info.species,
      color: info.color,
      size: info.size,
      trail: [],
    });

    setTimeout(() => { lastSpawnRef.current = null; }, 100);
  }, [lastSpawnedBird, currentLevel, addBoid, height]);

  // ── Sky gradient progression ──────────────────────────────────────────────
  const getSkyColors = useCallback(() => {
    const p = currentLevel / 50;
    const dawn  = { r: 255, g: 200, b: 100 };
    const day   = { r: 100, g: 160, b: 230 };
    const dusk  = { r:  60, g:  60, b: 130 };
    const night = { r:   8, g:  12, b:  35 };

    if (p < 0.25) return { top: lerp(dawn, night, p * 0.3),   bottom: lerp(dawn, day,   p / 0.25) };
    if (p < 0.5)  return { top: lerp(night, dusk, (p - 0.25) / 0.25 * 0.5), bottom: lerp(day, dusk, (p - 0.25) / 0.25) };
    if (p < 0.75) return { top: lerp(dusk, night, (p - 0.5) / 0.25),  bottom: lerp(dusk, night, (p - 0.5) / 0.25) };
    return { top: night, bottom: night };
  }, [currentLevel]);

  // ── Main animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      frameRef.current++;
      const frame = frameRef.current;
      const hz = horizonY();
      const waterH = height - hz;
      const sky = getSkyColors();

      // ── Sky ──────────────────────────────────────────────────────────────
      const skyGrad = ctx.createLinearGradient(0, 0, 0, hz);
      skyGrad.addColorStop(0, rgb(sky.top));
      skyGrad.addColorStop(1, rgb(sky.bottom));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, hz);

      // ── Stars ────────────────────────────────────────────────────────────
      if (currentLevel > 30) {
        const alpha = Math.min(1, (currentLevel - 30) / 20) * 0.85;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        for (let i = 0; i < 60; i++) {
          const sx = (i * 137.5) % width;
          const sy = (i * 61.3) % (hz * 0.75);
          const sz = (i % 3 === 0) ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Singapore skyline silhouette ────────────────────────────────────
      drawSkyline(ctx, width, hz, currentLevel);

      // ── Water ────────────────────────────────────────────────────────────
      const waterGrad = ctx.createLinearGradient(0, hz, 0, height);
      waterGrad.addColorStop(0, '#0a2840');
      waterGrad.addColorStop(0.5, '#071e32');
      waterGrad.addColorStop(1, '#040f1a');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, hz, width, waterH);

      // ── Water shimmer lines ──────────────────────────────────────────────
      for (let i = 0; i < 12; i++) {
        const shimmerY  = hz + waterH * (0.05 + i * 0.08);
        const shimmerOff = ((frame * 0.3 + i * 47) % width);
        ctx.strokeStyle = `rgba(100,180,255,${0.04 + (i % 3) * 0.02})`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = shimmerY + Math.sin((x + shimmerOff) * 0.03) * 2;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── Sync + move player ships ─────────────────────────────────────────
      syncShips();
      shipsRef.current.forEach((ship) => {
        ship.x += ship.vx * ship.heading;
        // Wrap around
        const hull = hullWidth(ship.type, ship.size);
        if (ship.heading === 1  && ship.x > width + hull) ship.x = -hull;
        if (ship.heading === -1 && ship.x < -hull)        ship.x = width + hull;

        drawWake(ctx, ship, frame);
        drawShip(ctx, ship);
      });

      // ── Ambient ships ────────────────────────────────────────────────────
      ambientShipsRef.current.forEach((ship) => {
        ship.x += ship.vx;
        const hull = hullWidth('ambient', ship.size);
        if (ship.vx > 0 && ship.x > width + hull) ship.x = -hull;
        if (ship.vx < 0 && ship.x < -hull)        ship.x = width + hull;
        drawWake(ctx, ship, frame);
        drawShip(ctx, ship);
      });

      // ── Spawn effects (horn rings) ───────────────────────────────────────
      spawnEffectsRef.current = spawnEffectsRef.current.filter((eff) => {
        eff.age++;
        const t = eff.age / eff.maxAge;
        if (t >= 1) return false;
        ctx.save();
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.strokeStyle = eff.color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(eff.x, eff.y, t * 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [width, height, currentLevel, getSkyColors, syncShips, horizonY]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function levelToShipType(level: number): ShipEntity['type'] {
  if (level <= 15) return 'tugboat';
  if (level <= 30) return 'cargo';
  if (level <= 40) return 'container';
  return 'supertanker';
}

function hullWidth(type: ShipEntity['type'], size: number): number {
  if (type === 'supertanker') return size * 5;
  if (type === 'container')   return size * 4;
  if (type === 'cargo')       return size * 3.5;
  return size * 2.5;
}

function lerp(a: {r:number;g:number;b:number}, b: {r:number;g:number;b:number}, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgb(c: {r:number;g:number;b:number}) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function drawWake(ctx: CanvasRenderingContext2D, ship: ShipEntity, frame: number) {
  const stern = ship.heading === 1 ? ship.x - hullWidth(ship.type, ship.size) * 0.5 : ship.x + hullWidth(ship.type, ship.size) * 0.5;
  for (let i = 0; i < 3; i++) {
    const wx = stern - ship.heading * (i * 12 + 8);
    const wy = ship.y + Math.sin((frame * 0.05 + ship.wakeOffset + i) * 2) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.12 - i * 0.03;
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth   = ship.size * 0.25 - i * 0.5;
    ctx.beginPath();
    ctx.moveTo(wx - 8, wy);
    ctx.lineTo(wx + 8, wy);
    ctx.stroke();
    ctx.restore();
  }
}

function drawShip(ctx: CanvasRenderingContext2D, ship: ShipEntity) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  if (ship.heading === -1) ctx.scale(-1, 1);

  const s = ship.size;
  const alpha = ship.type === 'ambient' ? 0.45 : 0.9;
  ctx.globalAlpha = alpha;

  switch (ship.type) {
    case 'ambient':
    case 'tugboat':
      drawTugboat(ctx, s, ship.color);
      break;
    case 'cargo':
      drawCargo(ctx, s, ship.color);
      break;
    case 'container':
      drawContainer(ctx, s, ship.color);
      break;
    case 'supertanker':
      drawSupertanker(ctx, s, ship.color);
      break;
  }

  ctx.restore();
}

function drawTugboat(ctx: CanvasRenderingContext2D, s: number, color: string) {
  // Hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 1.2, 0);
  ctx.lineTo( s * 1.2, 0);
  ctx.lineTo( s * 1.0, s * 0.7);
  ctx.lineTo(-s * 1.0, s * 0.7);
  ctx.closePath();
  ctx.fill();
  // Cabin
  ctx.fillStyle = lighten(color, 0.3);
  ctx.fillRect(-s * 0.3, -s * 0.9, s * 0.7, s * 0.9);
  // Funnel
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(s * 0.1, -s * 1.4, s * 0.2, s * 0.55);
}

function drawCargo(ctx: CanvasRenderingContext2D, s: number, color: string) {
  // Hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 1.7, 0);
  ctx.lineTo( s * 1.7, 0);
  ctx.lineTo( s * 1.4, s * 0.8);
  ctx.lineTo(-s * 1.4, s * 0.8);
  ctx.closePath();
  ctx.fill();
  // Superstructure
  ctx.fillStyle = lighten(color, 0.25);
  ctx.fillRect(-s * 0.5, -s * 1.1, s * 1.0, s * 1.1);
  // Crane arm
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = s * 0.1;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 1.1);
  ctx.lineTo(-s * 1.0, -s * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 1.0, -s * 1.9);
  ctx.lineTo(-s * 1.0, -s * 1.1);
  ctx.stroke();
}

function drawContainer(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const containerColors = ['#ef4444','#3b82f6','#f59e0b','#10b981','#8b5cf6','#ec4899'];
  // Hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 2.0, 0);
  ctx.lineTo( s * 2.0, 0);
  ctx.lineTo( s * 1.7, s * 0.8);
  ctx.lineTo(-s * 1.7, s * 0.8);
  ctx.closePath();
  ctx.fill();
  // Stacked containers (2 rows of 4)
  const boxW = s * 0.65, boxH = s * 0.45;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = containerColors[(row * 4 + col) % containerColors.length];
      ctx.fillRect(-s * 1.9 + col * (boxW + 1), -s * 0.1 - row * (boxH + 1) - boxH, boxW, boxH);
    }
  }
  // Bridge
  ctx.fillStyle = lighten(color, 0.3);
  ctx.fillRect(s * 1.1, -s * 1.4, s * 0.7, s * 1.4);
}

function drawSupertanker(ctx: CanvasRenderingContext2D, s: number, color: string) {
  // Very long low hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 2.5, 0);
  ctx.lineTo( s * 2.5, 0);
  ctx.lineTo( s * 2.2, s * 0.9);
  ctx.lineTo(-s * 2.2, s * 0.9);
  ctx.closePath();
  ctx.fill();
  // Deck stripe
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(-s * 2.4, -s * 0.1, s * 4.8, s * 0.15);
  // Superstructure at stern
  ctx.fillStyle = lighten(color, 0.3);
  ctx.fillRect(s * 1.6, -s * 1.6, s * 0.8, s * 1.6);
  // "LCB" text
  ctx.fillStyle = 'rgba(201,168,76,0.9)';
  ctx.font = `bold ${Math.max(6, s * 0.35)}px "IBM Plex Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('LCB', -s * 0.3, s * 0.55);
  // Funnel
  ctx.fillStyle = '#c9a84c';
  ctx.fillRect(s * 1.75, -s * 2.0, s * 0.25, s * 0.45);
}

function lighten(hex: string, amount: number): string {
  // Convert hex or named colour to lighter version by blending with white
  let r = 100, g = 100, b = 100;
  if (hex.startsWith('#') && hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgb(${Math.min(255, r + (255 - r) * amount)},${Math.min(255, g + (255 - g) * amount)},${Math.min(255, b + (255 - b) * amount)})`;
}

// ── Singapore skyline ─────────────────────────────────────────────────────────
// Stylised silhouette of Marina Bay skyline drawn as filled shapes
function drawSkyline(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  level: number,
) {
  const nightAlpha = Math.min(1, level / 40);
  const baseColor  = `rgba(10,18,40,${0.6 + nightAlpha * 0.35})`;

  // Buildings defined as { x_pct, w_pct, h_pct of horizonY }
  const buildings = [
    // Financial district skyscrapers
    { x: 0.55, w: 0.015, h: 0.55 },
    { x: 0.57, w: 0.022, h: 0.70 },
    { x: 0.60, w: 0.018, h: 0.60 },
    { x: 0.63, w: 0.025, h: 0.80 },  // tallest CBD tower
    { x: 0.66, w: 0.020, h: 0.65 },
    { x: 0.69, w: 0.018, h: 0.55 },
    { x: 0.72, w: 0.022, h: 0.70 },
    // Marina Bay Sands — 3 towers + skypark bar
    { x: 0.43, w: 0.018, h: 0.62 },
    { x: 0.46, w: 0.018, h: 0.62 },
    { x: 0.49, w: 0.018, h: 0.62 },
    // Short foreground buildings
    { x: 0.75, w: 0.03,  h: 0.40 },
    { x: 0.79, w: 0.025, h: 0.45 },
    { x: 0.35, w: 0.025, h: 0.42 },
    { x: 0.38, w: 0.030, h: 0.50 },
    { x: 0.31, w: 0.020, h: 0.35 },
    { x: 0.27, w: 0.022, h: 0.38 },
  ];

  ctx.fillStyle = baseColor;
  buildings.forEach(b => {
    const bx = b.x * width;
    const bw = b.w * width;
    const bh = b.h * horizonY;
    ctx.fillRect(bx - bw / 2, horizonY - bh, bw, bh);
  });

  // Marina Bay Sands skypark (connecting bar across the 3 towers)
  ctx.fillStyle = baseColor;
  ctx.fillRect(0.43 * width, horizonY - 0.66 * horizonY, 0.075 * width, 0.06 * horizonY);

  // Windows: tiny gold dots for lit levels > 10
  if (level > 10) {
    const winAlpha = Math.min(0.8, (level - 10) / 20);
    ctx.fillStyle = `rgba(201,168,76,${winAlpha * 0.5})`;
    buildings.forEach(b => {
      const bx = b.x * width;
      const bw = b.w * width;
      const bh = b.h * horizonY;
      const cols = Math.max(1, Math.floor(bw / 4));
      const rows = Math.max(1, Math.floor(bh / 6));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 3 === 0) continue; // skip some for realism
          ctx.fillRect(
            bx - bw / 2 + c * 4 + 1,
            horizonY - bh + r * 6 + 2,
            1.5, 2
          );
        }
      }
    });
  }

  // Reflection strip at waterline
  const reflGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 30);
  reflGrad.addColorStop(0, 'rgba(201,168,76,0.15)');
  reflGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, horizonY, width, 30);
}
