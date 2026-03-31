'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore, selectBoidSpecies } from '@/store/useGameStore';
import type { Boid } from '@/types';

interface BoidEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  level: number;
  species: string;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
  // Smooth movement properties
  targetVx: number;
  targetVy: number;
  wanderAngle: number;
}

interface FlockCanvasProps {
  width: number;
  height: number;
}

// Spawn effect particle
interface SpawnEffect {
  id: number;
  x: number;
  y: number;
  color: string;
  age: number;
  maxAge: number;
}

export default function FlockCanvas({ width, height }: FlockCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boidsRef = useRef<BoidEntity[]>([]);
  const ambientBirdsRef = useRef<BoidEntity[]>([]);
  const spawnEffectsRef = useRef<SpawnEffect[]>([]);
  const animationRef = useRef<number>(0);
  const lastSpawnRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef<boolean>(false);
  const prevBoidsLengthRef = useRef<number>(0);

  const { boids, currentLevel, addBoid, lastSpawnedBird } = useGameStore();

  // Initialize ambient birds that always fly around
  useEffect(() => {
    if (initializedRef.current || width === 0 || height === 0) return;
    initializedRef.current = true;
    
    // Create 15 ambient birds that fly freely in the background
    const ambientBirds: BoidEntity[] = [];
    const birdHues = [15, 25, 35, 340, 350, 5]; // Warm/orange tones to stand out against blue sky
    
    for (let i = 0; i < 15; i++) {
      ambientBirds.push({
        id: -1000 - i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 1.5,
        ax: 0,
        ay: 0,
        level: 1,
        species: 'Ambient',
        color: `hsl(${birdHues[i % birdHues.length]}, ${60 + Math.random() * 20}%, ${50 + Math.random() * 15}%)`,
        size: 6 + Math.random() * 4,
        trail: [],
        targetVx: 0,
        targetVy: 0,
        wanderAngle: Math.random() * Math.PI * 2,
      });
    }
    ambientBirdsRef.current = ambientBirds;
  }, [width, height]);

  // Convert store boids to simulation entities
  const syncBoids = useCallback(() => {
    const currentIds = new Set(boidsRef.current.map((b) => b.id));
    
    boids.forEach((boid) => {
      if (!currentIds.has(boid.id)) {
        const speciesInfo = selectBoidSpecies(boid.level);
        
        // Create spawn effect at bird's position
        const spawnX = boid.x || Math.random() * width;
        const spawnY = boid.y || Math.random() * height;
        
        // Create multiple particles for spawn effect
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i;
          spawnEffectsRef.current.push({
            id: Date.now() + i,
            x: spawnX,
            y: spawnY,
            color: speciesInfo.color,
            age: 0,
            maxAge: 40,
          });
        }
        
        boidsRef.current.push({
          id: boid.id,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          ax: 0,
          ay: 0,
          level: boid.level,
          species: speciesInfo.species,
          color: speciesInfo.color,
          size: speciesInfo.size,
          trail: [],
          targetVx: (Math.random() - 0.5) * 2,
          targetVy: (Math.random() - 0.5) * 2,
          wanderAngle: Math.random() * Math.PI * 2,
        });
      }
    });

    // Remove boids that are no longer in store
    const storeIds = new Set(boids.map((b) => b.id));
    boidsRef.current = boidsRef.current.filter((b) => storeIds.has(b.id));
  }, [boids, width, height]);

  // Handle new bird spawning
  useEffect(() => {
    if (lastSpawnedBird && !lastSpawnRef.current) {
      lastSpawnRef.current = lastSpawnedBird;
      
      const speciesInfo = selectBoidSpecies(currentLevel);
      const newBoid: BoidEntity = {
        id: Date.now(),
        x: lastSpawnedBird.x,
        y: lastSpawnedBird.y,
        vx: (Math.random() - 0.5) * 3,
        vy: -3,
        ax: 0,
        ay: 0,
        level: currentLevel,
        species: speciesInfo.species,
        color: speciesInfo.color,
        size: speciesInfo.size,
        trail: [],
        targetVx: (Math.random() - 0.5) * 3,
        targetVy: -3,
        wanderAngle: Math.random() * Math.PI * 2,
      };
      
      boidsRef.current.push(newBoid);
      
      // Add to store
      addBoid({
        id: newBoid.id,
        x: newBoid.x,
        y: newBoid.y,
        vx: newBoid.vx,
        vy: newBoid.vy,
        level: newBoid.level,
        species: newBoid.species,
        color: newBoid.color,
        size: newBoid.size,
        trail: [],
      });

      setTimeout(() => {
        lastSpawnRef.current = null;
      }, 100);
    }
  }, [lastSpawnedBird, currentLevel, addBoid]);

  // Boids algorithm parameters based on level
  const getBoidWeights = useCallback(() => {
    const progress = currentLevel / 50;
    
    // As level increases, weights shift toward more cohesive movement
    return {
      separation: 1.5 - progress * 0.3, // Decrease separation
      alignment: 1.0 + progress * 0.5, // Increase alignment
      cohesion: 1.0 + progress * 0.8,   // Increase cohesion significantly
      maxSpeed: 3 + progress * 2,
      maxForce: 0.05 + progress * 0.03,
    };
  }, [currentLevel]);

  // Boid behaviors
  const separation = useCallback((boid: BoidEntity, neighbors: BoidEntity[], weight: number) => {
    let steerX = 0;
    let steerY = 0;
    let count = 0;
    const desiredSeparation = 25 + boid.size;

    neighbors.forEach((other) => {
      if (other.id === boid.id) return;
      const dx = boid.x - other.x;
      const dy = boid.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > 0 && d < desiredSeparation) {
        const diffX = dx / d;
        const diffY = dy / d;
        steerX += diffX;
        steerY += diffY;
        count++;
      }
    });

    if (count > 0) {
      steerX /= count;
      steerY /= count;
      const len = Math.sqrt(steerX * steerX + steerY * steerY);
      if (len > 0) {
        steerX = (steerX / len) * weight;
        steerY = (steerY / len) * weight;
      }
    }

    return { x: steerX, y: steerY };
  }, []);

  const alignment = useCallback((boid: BoidEntity, neighbors: BoidEntity[], weight: number) => {
    let avgVX = 0;
    let avgVY = 0;
    let count = 0;
    const neighborDist = 50 + boid.size * 2;

    neighbors.forEach((other) => {
      if (other.id === boid.id) return;
      const dx = boid.x - other.x;
      const dy = boid.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > 0 && d < neighborDist) {
        avgVX += other.vx;
        avgVY += other.vy;
        count++;
      }
    });

    if (count > 0) {
      avgVX /= count;
      avgVY /= count;
      const len = Math.sqrt(avgVX * avgVX + avgVY * avgVY);
      if (len > 0) {
        avgVX = (avgVX / len) * weight;
        avgVY = (avgVY / len) * weight;
      }
    }

    return { x: avgVX - boid.vx, y: avgVY - boid.vy };
  }, []);

  const cohesion = useCallback((boid: BoidEntity, neighbors: BoidEntity[], weight: number) => {
    let centerX = 0;
    let centerY = 0;
    let count = 0;
    const neighborDist = 50 + boid.size * 2;

    neighbors.forEach((other) => {
      if (other.id === boid.id) return;
      const dx = boid.x - other.x;
      const dy = boid.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > 0 && d < neighborDist) {
        centerX += other.x;
        centerY += other.y;
        count++;
      }
    });

    if (count > 0) {
      centerX /= count;
      centerY /= count;
      return { x: (centerX - boid.x) * 0.01 * weight, y: (centerY - boid.y) * 0.01 * weight };
    }

    return { x: 0, y: 0 };
  }, []);

  // Smooth wander behavior for natural movement
  const wander = useCallback((boid: BoidEntity) => {
    // Slowly change the wander angle
    boid.wanderAngle += (Math.random() - 0.5) * 0.3;
    
    // Calculate target velocity from wander angle
    const speed = 2.5;
    boid.targetVx = Math.cos(boid.wanderAngle) * speed;
    boid.targetVy = Math.sin(boid.wanderAngle) * speed;
    
    return { x: boid.targetVx, y: boid.targetVy };
  }, []);

  // Smooth steering toward target velocity
  const smoothSteer = useCallback((boid: BoidEntity, targetX: number, targetY: number, turnSpeed: number) => {
    const steerX = (targetX - boid.vx) * turnSpeed;
    const steerY = (targetY - boid.vy) * turnSpeed;
    return { x: steerX, y: steerY };
  }, []);

  const borders = useCallback((boid: BoidEntity, width: number, height: number) => {
    const margin = 50;
    let turnX = 0;
    let turnY = 0;

    if (boid.x < margin) turnX = 1;
    if (boid.x > width - margin) turnX = -1;
    if (boid.y < margin) turnY = 1;
    if (boid.y > height - margin) turnY = -1;

    return { x: turnX, y: turnY };
  }, []);

  // Sky gradient colors based on level
  const getSkyColors = useCallback(() => {
    const progress = currentLevel / 50;
    
    // Dawn (Level 1) to Night (Level 50) - now blue tones
    const dawn = { r: 135, g: 206, b: 250 };   // Light sky blue
    const noon = { r: 70, g: 130, b: 180 };    // Steel blue
    const dusk = { r: 25, g: 25, b: 95 };      // Deep blue
    const night = { r: 5, g: 5, b: 30 };        // Dark navy

    if (progress < 0.25) {
      const t = progress / 0.25;
      return {
        top: lerpColor(dawn, night, t * 0.2),
        bottom: lerpColor(dawn, noon, t),
      };
    } else if (progress < 0.5) {
      const t = (progress - 0.25) / 0.25;
      return {
        top: lerpColor(lerpColor(dawn, night, 0.2), { r: 20, g: 20, b: 60 }, t),
        bottom: lerpColor(noon, dusk, t),
      };
    } else if (progress < 0.75) {
      const t = (progress - 0.5) / 0.25;
      return {
        top: lerpColor({ r: 20, g: 20, b: 60 }, night, t * 0.5),
        bottom: lerpColor(dusk, night, t),
      };
    } else {
      const t = (progress - 0.75) / 0.25;
      return {
        top: lerpColor(lerpColor({ r: 20, g: 20, b: 60 }, night, 0.5), night, t),
        bottom: lerpColor(night, { r: 3, g: 3, b: 15 }, t),
      };
    }
  }, [currentLevel]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const weights = getBoidWeights();
    const colors = getSkyColors();

    const animate = () => {
      // Draw sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `rgb(${colors.top.r}, ${colors.top.g}, ${colors.top.b})`);
      gradient.addColorStop(1, `rgb(${colors.bottom.r}, ${colors.bottom.g}, ${colors.bottom.b})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars for night levels
      if (currentLevel > 30) {
        const starAlpha = Math.min(1, (currentLevel - 30) / 20);
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * 0.8})`;
        for (let i = 0; i < 50; i++) {
          const sx = (i * 137.5) % width;
          const sy = (i * 73.3) % (height * 0.6);
          const size = (i % 3) + 1;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw boids
      syncBoids();

      boidsRef.current.forEach((boid) => {
        // Find neighbors
        const neighbors = boidsRef.current;

        // Get wander target
        const wanderTarget = wander(boid);

        // Apply behaviors
        const sep = separation(boid, neighbors, weights.separation);
        const ali = alignment(boid, neighbors, weights.alignment);
        const coh = cohesion(boid, neighbors, weights.cohesion);
        const border = borders(boid, width, height);

        // Apply smooth steering - blend between current velocity and target
        const wanderSteer = smoothSteer(boid, wanderTarget.x, wanderTarget.y, 0.02);

        // Update acceleration with smoother weights
        boid.ax = sep.x * 0.8 + ali.x * 0.5 + coh.x * 0.3 + border.x * 0.4 + wanderSteer.x * 0.6;
        boid.ay = sep.y * 0.8 + ali.y * 0.5 + coh.y * 0.3 + border.y * 0.4 + wanderSteer.y * 0.6;

        // Add some damping to prevent erratic changes
        boid.vx *= 0.98;
        boid.vy *= 0.98;

        // Update velocity
        boid.vx += boid.ax;
        boid.vy += boid.ay;

        // Limit speed
        const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
        if (speed > weights.maxSpeed) {
          boid.vx = (boid.vx / speed) * weights.maxSpeed;
          boid.vy = (boid.vy / speed) * weights.maxSpeed;
        }

        // Ensure minimum speed for smooth movement
        const minSpeed = 1.5;
        if (speed < minSpeed) {
          const scale = minSpeed / (speed || 1);
          boid.vx *= scale;
          boid.vy *= scale;
        }

        // Update position
        boid.x += boid.vx;
        boid.y += boid.vy;

        // Update trail
        if (currentLevel >= 31) {
          boid.trail.push({ x: boid.x, y: boid.y });
          if (boid.trail.length > 20) boid.trail.shift();
        }

        // Draw trail (for Phoenix)
        if (boid.trail.length > 1 && currentLevel >= 31) {
          ctx.beginPath();
          ctx.moveTo(boid.trail[0].x, boid.trail[0].y);
          for (let i = 1; i < boid.trail.length; i++) {
            ctx.lineTo(boid.trail[i].x, boid.trail[i].y);
          }
          ctx.strokeStyle = `rgba(255, ${Math.min(255, 100 + boid.level)}, 0, 0.4)`;
          ctx.lineWidth = boid.size * 0.5;
          ctx.stroke();
        }

        // Draw bird based on level
        drawBird(ctx, boid, currentLevel);
      });

      // Update and draw ambient background birds
      if (ambientBirdsRef.current.length > 0) {
        const ambientWeights = { separation: 1.2, alignment: 0.8, cohesion: 0.6, maxSpeed: 1.8, maxForce: 0.03 };
        
        ambientBirdsRef.current.forEach((bird) => {
          // Get wander target for smooth movement
          const wanderTarget = wander(bird);
          
          // Simple flocking for ambient birds
          const neighbors = ambientBirdsRef.current;
          const sep = separation(bird, neighbors, ambientWeights.separation);
          const ali = alignment(bird, neighbors, ambientWeights.alignment);
          const coh = cohesion(bird, neighbors, ambientWeights.cohesion);
          const border = borders(bird, width, height);
          
          // Apply smooth steering
          const wanderSteer = smoothSteer(bird, wanderTarget.x, wanderTarget.y, 0.015);
          
          // Gentle movement with smooth blending
          bird.ax = sep.x * 0.4 + ali.x * 0.25 + coh.x * 0.15 + border.x * 0.25 + wanderSteer.x * 0.5;
          bird.ay = sep.y * 0.4 + ali.y * 0.25 + coh.y * 0.15 + border.y * 0.25 + wanderSteer.y * 0.5;
          
          // Velocity damping for smoothness
          bird.vx *= 0.97;
          bird.vy *= 0.97;
          
          // Update velocity
          bird.vx += bird.ax;
          bird.vy += bird.ay;
          
          // Limit speed
          const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
          if (speed > ambientWeights.maxSpeed) {
            bird.vx = (bird.vx / speed) * ambientWeights.maxSpeed;
            bird.vy = (bird.vy / speed) * ambientWeights.maxSpeed;
          }
          
          // Ensure minimum speed
          const minSpeed = 0.8;
          if (speed < minSpeed) {
            const scale = minSpeed / (speed || 1);
            bird.vx *= scale;
            bird.vy *= scale;
          }
          
          // Update position
          bird.x += bird.vx;
          bird.y += bird.vy;
          
          // Soft borders - gently steer back
          const margin = 80;
          if (bird.x < margin) bird.vx += 0.08;
          if (bird.x > width - margin) bird.vx -= 0.08;
          if (bird.y < margin) bird.vy += 0.08;
          if (bird.y > height - margin) bird.vy -= 0.08;
          
          // Draw as simple silhouettes
          ctx.save();
          ctx.translate(bird.x, bird.y);
          ctx.rotate(Math.atan2(bird.vy, bird.vx));
          ctx.globalAlpha = 0.5; // Semi-transparent
          ctx.fillStyle = bird.color;
          
          // Simple V-shape
          ctx.beginPath();
          ctx.moveTo(bird.size, 0);
          ctx.lineTo(-bird.size * 0.6, -bird.size * 0.5);
          ctx.lineTo(-bird.size * 0.3, 0);
          ctx.lineTo(-bird.size * 0.6, bird.size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // Draw and update spawn effects (particles)
      spawnEffectsRef.current = spawnEffectsRef.current.filter((effect) => {
        effect.age++;
        const progress = effect.age / effect.maxAge;
        
        if (progress >= 1) return false;
        
        // Draw particle
        const particleRadius = 4 * (1 - progress);
        const alpha = 1 - progress;
        const expansion = progress * 30;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Expanding ring
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, expansion, 0, Math.PI * 2);
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Center glow
        const gradient = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, particleRadius * 3);
        gradient.addColorStop(0, effect.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, particleRadius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, currentLevel, getBoidWeights, getSkyColors, syncBoids, separation, alignment, cohesion, borders]);

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

// Helper functions
function lerpColor(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function drawBird(ctx: CanvasRenderingContext2D, boid: BoidEntity, level: number) {
  const angle = Math.atan2(boid.vy, boid.vx);
  const size = boid.size;

  ctx.save();
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);

  // All birds are simple pointer/chevron shapes - clean and consistent
  ctx.fillStyle = boid.color;
  
  // Pointer shape pointing right (direction of movement)
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0);           // Pointed nose
  ctx.lineTo(-size * 0.8, -size * 0.6); // Top wing
  ctx.lineTo(-size * 0.3, 0);           // Inner notch
  ctx.lineTo(-size * 0.8, size * 0.6);  // Bottom wing
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function parseHSL(color: string): { h: number; s: number; l: number } {
  // Simple parser for hsl strings
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3]),
    };
  }
  // Handle hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2 / 255;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
