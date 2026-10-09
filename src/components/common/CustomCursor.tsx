import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { soundEngine } from '../../lib/soundEngine';

interface BanknoteParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  denomination: '10' | '20' | '50' | '100';
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  life: number;
  maxLife: number;
  depth: number;
  scale: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobblePhase: number;
}

const MUTED_DENOMINATIONS: Array<{
  value: '10' | '20' | '50' | '100';
  accent: string;
  start: string;
  end: string;
}> = [
  { value: '10', accent: '#7f2828', start: '#451212', end: '#1a0707' },
  { value: '20', accent: '#445b70', start: '#1f2b37', end: '#0e141a' },
  { value: '50', accent: '#8c6c2e', start: '#523c15', end: '#1c1507' },
  { value: '100', accent: '#395e4a', start: '#1b2f24', end: '#0a140f' },
];

export const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Pure ref-based position coordinates (Zero React state updates during mouse movement!)
  const mousePosRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100, time: 0 });
  const trailAnchorRef = useRef({ x: -100, y: -100 });
  const lastSpawnTimeRef = useRef(0);
  const prevHoverStateRef = useRef(false);

  // Pre-allocated particle pool
  const poolSize = 36;
  const particlesRef = useRef<BanknoteParticle[]>([]);

  useEffect(() => {
    // Detect mobile phones / coarse-only touch screens and disable custom cursor
    if (
      typeof window !== 'undefined' &&
      ((window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
        !window.matchMedia('(pointer: fine)').matches) ||
        window.innerWidth < 768)
    ) {
      setIsTouchDevice(true);
      return;
    }

    // Initialize particle pool once
    const pool: BanknoteParticle[] = [];
    for (let i = 0; i < poolSize; i++) {
      pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 17,
        height: 9.5,
        denomination: '50',
        accentColor: '#8c6c2e',
        gradientStart: '#523c15',
        gradientEnd: '#1c1507',
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        vRotX: 0,
        vRotY: 0,
        vRotZ: 0,
        life: 0,
        maxLife: 0.8,
        depth: 0.8,
        scale: 0.9,
        wobbleSpeed: 3,
        wobbleAmp: 0.5,
        wobblePhase: 0,
      });
    }
    particlesRef.current = pool;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Helper to spawn notes from pool
    const spawnNote = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      isBurst = false,
      burstEnergy = 0
    ) => {
      if (prefersReducedMotion) return;
      const pool = particlesRef.current;
      let p: BanknoteParticle | null = null;
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].active) {
          p = pool[i];
          break;
        }
      }
      if (!p) {
        let oldestIndex = 0;
        let highestLife = -1;
        for (let i = 0; i < pool.length; i++) {
          if (pool[i].life > highestLife) {
            highestLife = pool[i].life;
            oldestIndex = i;
          }
        }
        p = pool[oldestIndex];
      }
      if (!p) return;

      p.active = true;
      p.x = x;
      p.y = y;
      const energyMod = isBurst ? 1.0 + burstEnergy * 0.08 : 1.0;
      p.vx = vx * energyMod;
      p.vy = vy * energyMod;

      const denom = MUTED_DENOMINATIONS[Math.floor(Math.random() * MUTED_DENOMINATIONS.length)];
      p.denomination = denom.value;
      p.accentColor = denom.accent;
      p.gradientStart = denom.start;
      p.gradientEnd = denom.end;

      p.rotX = (Math.random() - 0.5) * 0.5;
      p.rotY = (Math.random() - 0.5) * 0.5;
      p.rotZ = Math.random() * Math.PI * 2;

      p.vRotX = (Math.random() - 0.5) * 5.0 * energyMod;
      p.vRotY = (Math.random() - 0.5) * 7.0 * energyMod;
      p.vRotZ = (Math.random() - 0.5) * 3.5 * energyMod;

      p.life = 0;
      p.maxLife = isBurst ? 0.7 + Math.random() * 0.35 : 0.55 + Math.random() * 0.3;
      p.depth = 0.55 + Math.random() * 0.45;
      p.scale = isBurst ? 0.85 + Math.random() * 0.3 : 0.75 + Math.random() * 0.25;
      p.wobbleSpeed = 2.5 + Math.random() * 2.5;
      p.wobbleAmp = 0.4 + Math.random() * 0.4;
      p.wobblePhase = Math.random() * Math.PI * 2;
    };

    const getActiveCount = (): number => {
      let count = 0;
      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        if (pool[i].active) count++;
      }
      return count;
    };

    // Ultra-Fast Direct Hardware-Accelerated Mouse Move (Zero React re-renders!)
    const onMouseMove = (e: MouseEvent) => {
      const curX = e.clientX;
      const curY = e.clientY;
      mousePosRef.current.x = curX;
      mousePosRef.current.y = curY;

      // Update dot instantly with translate3d
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
      }

      // Check hover target
      const target = e.target as HTMLElement | null;
      let nextCursorType: 'default' | 'hover' | 'explore' | 'open' = 'default';
      if (target) {
        if (target.closest('[data-cursor="explore"]')) {
          nextCursorType = 'explore';
        } else if (target.closest('[data-cursor="open"]')) {
          nextCursorType = 'open';
        } else if (target.closest('button, a, input, [role="button"], .interactive-cursor')) {
          nextCursorType = 'hover';
        }
      }

      const isHovering = nextCursorType === 'hover';
      if (dotRef.current) {
        if (isHovering) {
          dotRef.current.classList.add('cursor-euro');
          dotRef.current.textContent = '€';
        } else {
          dotRef.current.classList.remove('cursor-euro');
          dotRef.current.textContent = '';
        }
      }

      if (ringRef.current) {
        ringRef.current.className = `custom-cursor-ring ${
          isHovering
            ? 'cursor-euro-ring'
            : nextCursorType === 'explore' || nextCursorType === 'open'
            ? 'cursor-explore'
            : ''
        }`;
      }

      if (isHovering && !prevHoverStateRef.current) {
        for (let b = 0; b < 2; b++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.0 + Math.random() * 1.5;
          spawnNote(curX, curY, Math.cos(angle) * speed, Math.sin(angle) * speed - 0.4, true, 6);
        }
      }
      prevHoverStateRef.current = isHovering;

      // Velocity trail
      const now = performance.now();
      const prev = prevMouseRef.current;
      if (prev.x >= 0) {
        const dx = curX - prev.x;
        const dy = curY - prev.y;
        const dt = Math.max(16, now - prev.time);
        const dist = Math.hypot(dx, dy);
        const speed = (dist / dt) * 16;

        const trail = trailAnchorRef.current;
        trail.x += (curX - trail.x) * 0.14;
        trail.y += (curY - trail.y) * 0.14;

        const timeSinceLastSpawn = now - lastSpawnTimeRef.current;
        const activeCount = getActiveCount();

        if (speed > 4.0 && timeSinceLastSpawn > 70 && activeCount < 3) {
          lastSpawnTimeRef.current = now;
          const noteVx = dx * 0.12 + (Math.random() - 0.5) * 0.5;
          const noteVy = dy * 0.12 + (Math.random() - 0.5) * 0.5;
          spawnNote(trail.x, trail.y, noteVx, noteVy, false, 2);
        }
      } else {
        trailAnchorRef.current = { x: curX, y: curY };
      }
      prevMouseRef.current = { x: curX, y: curY, time: now };
    };

    const onMouseClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = target?.closest(
        'button, a, input, [role="button"], [data-cursor="explore"], [data-cursor="open"]'
      );
      const burstCount = isInteractive ? 4 : 2;

      for (let b = 0; b < burstCount; b++) {
        const angle = (b / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 2.2 + Math.random() * 1.8;
        spawnNote(
          e.clientX,
          e.clientY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 0.5,
          true,
          8
        );
      }
      soundEngine.playPaperFlutter();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onMouseClick, { passive: true });

    // Single buttery-smooth 60-120 FPS requestAnimationFrame loop
    let lastFrame = performance.now();
    let rafId: number;

    const animateLoop = () => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastFrame) / 1000, 0.04);
      lastFrame = now;

      // Spring-smoothed ring interpolation (Pure direct DOM transform!)
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;
      if (targetX >= 0) {
        ringPosRef.current.x += (targetX - ringPosRef.current.x) * 0.22;
        ringPosRef.current.y += (targetY - ringPosRef.current.y) * 0.22;

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`;
        }
      }

      // Clear Canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Render banknote particles
      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.life += deltaSec;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = Math.max(0, 1.0 - Math.pow(lifeRatio, 2)) * p.depth * 0.85;

        p.vy += 12 * deltaSec; // subtle falling drift
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.wobblePhase += p.wobbleSpeed * deltaSec;
        const wobbleX = Math.sin(p.wobblePhase) * p.wobbleAmp;

        p.x += (p.vx + wobbleX) * (deltaSec * 60);
        p.y += p.vy * (deltaSec * 60);

        p.rotX += p.vRotX * deltaSec;
        p.rotY += p.vRotY * deltaSec;
        p.rotZ += p.vRotZ * deltaSec;

        const scaleX = Math.cos(p.rotY) * p.scale;
        const scaleY = Math.cos(p.rotX) * p.scale;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotZ);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = alpha;

        const w = p.width;
        const h = p.height;
        ctx.fillStyle = p.gradientStart;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        ctx.strokeStyle = p.accentColor;
        ctx.lineWidth = 0.6;
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        ctx.fillStyle = 'rgba(242, 238, 231, 0.7)';
        ctx.font = '600 6px "DM Mono", monospace';
        ctx.fillText(`€${p.denomination}`, -w / 2 + 1.5, -h / 2 + 6);

        ctx.restore();
      }

      rafId = requestAnimationFrame(animateLoop);
    };

    rafId = requestAnimationFrame(animateLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  if (isTouchDevice) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
        aria-hidden="true"
      />

      {/* Main Precision Cursor Center */}
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 10000,
          willChange: 'transform',
        }}
      />

      {/* Trailing Inertial Ring */}
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
    </>
  );
};
