import * as THREE from 'three';

export interface BlimpMoneyRainObject {
  group: THREE.Group;
  update: (
    time: number,
    deltaTime: number,
    camera: THREE.Camera,
    hatchPos: THREE.Vector3,
    intensity: number
  ) => void;
  reset: () => void;
  setIntensity: (val: number) => void;
  getIntensity: () => number;
}

interface NoteParticle {
  mesh: THREE.Mesh;
  layer: 'bg' | 'mid' | 'fg';
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  angVel: THREE.Vector3;
  scale: number;
  flutterPhase: number;
  flutterFreq: number;
  active: boolean;
  baseFallSpeed: number;
}

// Procedural high-resolution cinematic banknote texture
function createCinematicBanknoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Subtle gradient: crisp off-white banknote paper with soft intaglio slate-green tone
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#e6ede8');
  grad.addColorStop(0.5, '#f0f5f1');
  grad.addColorStop(1, '#dfe6e0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Intaglio security pattern frame
  ctx.strokeStyle = '#1b382b';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.strokeStyle = '#2d5a45';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 220);

  // Micro fine-line waves
  ctx.strokeStyle = 'rgba(45, 90, 69, 0.25)';
  ctx.lineWidth = 1;
  for (let y = 26; y < 230; y += 7) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.bezierCurveTo(150, y + 10, 350, y - 10, 488, y);
    ctx.stroke();
  }

  // Large Corner Numerals
  ctx.fillStyle = '#1b382b';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillText('100', 30, 56);
  ctx.fillText('100', 416, 56);
  ctx.fillText('100', 30, 224);
  ctx.fillText('100', 416, 224);

  // Central Vignette Oval Portrait Frame
  ctx.beginPath();
  ctx.ellipse(256, 128, 85, 62, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#1b382b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Central Watermark / Stylized Architecture Motif
  ctx.fillStyle = 'rgba(27, 56, 43, 0.2)';
  ctx.beginPath();
  ctx.arc(256, 128, 42, 0, Math.PI * 2);
  ctx.fill();

  // Red Resistance Seal Stamp on right
  ctx.beginPath();
  ctx.arc(380, 128, 26, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186, 20, 20, 0.45)';
  ctx.fill();
  ctx.strokeStyle = '#ba1414';
  ctx.lineWidth = 2;
  ctx.stroke();

  // "BANCO DE ESPAÑA // HEIST" Microtext
  ctx.fillStyle = '#1b382b';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CIEN EUROS // 100', 256, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

export function createBlimpMoneyRain(): BlimpMoneyRainObject {
  const group = new THREE.Group();
  group.name = 'BlimpMoneyRain';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const poolSize = isMobile ? 38 : 105;

  const noteWidth = 1.45;
  const noteHeight = 0.62;
  const noteGeo = new THREE.PlaneGeometry(noteWidth, noteHeight, 2, 2);

  const texture = createCinematicBanknoteTexture();
  const noteMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.65,
    metalness: 0.15,
    transparent: true,
    opacity: 0.95,
  });

  const particles: NoteParticle[] = [];
  let currentIntensity = 0;

  // Pre-allocate note mesh pool strictly once at initialization
  for (let i = 0; i < poolSize; i++) {
    const mesh = new THREE.Mesh(noteGeo, noteMat.clone());
    mesh.castShadow = true;
    mesh.visible = false;
    group.add(mesh);

    // Distribute into 3 distinct depth layers:
    // 0 to 45%: Background (small scale, high up near blimp)
    // 45% to 85%: Midground (medium scale, swirling in middle sky)
    // 85% to 100%: Foreground Hero (large scale, passes close to camera lens)
    let layer: 'bg' | 'mid' | 'fg' = 'mid';
    let scale = 1.0;

    const ratio = i / poolSize;
    if (ratio < 0.42) {
      layer = 'bg';
      scale = 0.45 + Math.random() * 0.25;
    } else if (ratio < 0.84) {
      layer = 'mid';
      scale = 0.95 + Math.random() * 0.35;
    } else {
      layer = 'fg';
      scale = 1.9 + Math.random() * 0.7; // Large foreground hero note!
    }

    particles.push({
      mesh,
      layer,
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      scale,
      flutterPhase: Math.random() * Math.PI * 2,
      flutterFreq: 2.2 + Math.random() * 2.5,
      active: false,
      baseFallSpeed: 3.5 + Math.random() * 2.8,
    });
  }

  // Respawn a particle at the blimp release point
  const respawnNote = (p: NoteParticle, hatchPos: THREE.Vector3, randomizeY: boolean = false) => {
    p.active = true;

    // Release spread beneath the blimp gondola chute
    const spreadX = (Math.random() - 0.5) * 8.0;
    const spreadZ = (Math.random() - 0.5) * 12.0;

    // If initial stagger, distribute across the vertical column between blimp (Y ~ 62) and camera (Y ~ 28)
    const initialY = randomizeY
      ? hatchPos.y - Math.random() * (hatchPos.y - 20)
      : hatchPos.y - Math.random() * 1.5;

    p.pos.set(
      hatchPos.x + spreadX,
      initialY,
      hatchPos.z + spreadZ
    );

    // Extra positioning for foreground hero notes: bias them closer to camera view line
    if (p.layer === 'fg') {
      p.pos.x = hatchPos.x + (Math.random() - 0.5) * 5.0;
      p.pos.z = hatchPos.z + 4.0 + (Math.random() - 0.5) * 6.0;
    }

    // Varied fall velocity with slight wind drift towards positive X and Z
    p.vel.set(
      0.8 + (Math.random() - 0.5) * 1.2, // gentle wind drift
      -p.baseFallSpeed,
      0.5 + (Math.random() - 0.5) * 1.0
    );

    // Aerodynamic tumbling angular velocity
    p.angVel.set(
      (Math.random() - 0.5) * 6.0,
      (Math.random() - 0.5) * 8.0,
      (Math.random() - 0.5) * 5.0
    );

    p.rot.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    p.mesh.position.copy(p.pos);
    p.mesh.rotation.copy(p.rot);
    p.mesh.scale.set(p.scale, p.scale, p.scale);
    p.mesh.visible = true;
  };

  const update = (
    time: number,
    deltaTime: number,
    camera: THREE.Camera,
    hatchPos: THREE.Vector3,
    intensity: number
  ) => {
    currentIntensity = intensity;
    const dt = Math.min(deltaTime, 0.05);

    // If intensity is 0 and no notes active, keep disabled
    if (currentIntensity <= 0.001) {
      particles.forEach((p) => {
        if (p.active) {
          p.active = false;
          p.mesh.visible = false;
        }
      });
      return;
    }

    // Determine how many notes in the pool should be active based on intensity
    const targetActiveCount = Math.floor(poolSize * currentIntensity);

    particles.forEach((p, idx) => {
      if (!p.active) {
        if (idx < targetActiveCount) {
          respawnNote(p, hatchPos, true);
        }
        return;
      }

      // If intensity reduced below this note's index, allow it to fall out without respawning
      if (idx >= targetActiveCount) {
        // Will despawn when it hits the bottom boundary
      }

      // Aerodynamic paper flutter oscillation (sinusoidal wind lift)
      const flutter = Math.sin(time * p.flutterFreq + p.flutterPhase);
      const flutterLift = flutter * 0.8;

      // Integrate velocity
      p.pos.x += (p.vel.x + flutter * 1.5) * dt;
      p.pos.y += (p.vel.y + flutterLift) * dt;
      p.pos.z += p.vel.z * dt;

      // Integrate tumbling rotation
      p.rot.x += (p.angVel.x + flutter * 2.0) * dt;
      p.rot.y += p.angVel.y * dt;
      p.rot.z += (p.angVel.z + flutter * 1.5) * dt;

      p.mesh.position.copy(p.pos);
      p.mesh.rotation.copy(p.rot);

      // Bottom recycling threshold:
      // When banknote falls below the camera's lower viewing threshold (or below Y = 16)
      const bottomThreshold = camera ? camera.position.y - 12 : 16;
      if (p.pos.y < bottomThreshold) {
        if (idx < targetActiveCount) {
          // Recycle back up to the blimp hatch
          respawnNote(p, hatchPos, false);
        } else {
          // Fade out / deactivate
          p.active = false;
          p.mesh.visible = false;
        }
      }
    });
  };

  const reset = () => {
    particles.forEach((p) => {
      p.active = false;
      p.mesh.visible = false;
      p.pos.set(0, -100, 0);
      p.mesh.position.copy(p.pos);
    });
    currentIntensity = 0;
  };

  const setIntensity = (val: number) => {
    currentIntensity = Math.max(0, Math.min(1, val));
  };

  const getIntensity = () => currentIntensity;

  return {
    group,
    update,
    reset,
    setIntensity,
    getIntensity,
  };
}
