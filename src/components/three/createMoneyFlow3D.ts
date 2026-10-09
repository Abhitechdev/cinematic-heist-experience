import * as THREE from 'three';

export interface MoneyFlow3DObject {
  group: THREE.Group;
  instancedMesh: THREE.InstancedMesh;
  update: (
    time: number,
    scrollProgress: number,
    scrollVelocity: number,
    cameraPos: THREE.Vector3,
    mouseVel: { x: number; y: number }
  ) => void;
  triggerVaultMoneyBurst: () => void;
}

interface NoteParticleData {
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  scale: number;
  depthLayer: 'bg' | 'mid' | 'fg';
  phase: number;
  speed: number;
  isVaultNote: boolean;
}

// Procedurally generate a muted, stylized generic banknote texture via HTML5 canvas
function createBanknoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background: dark charcoal / muted slate-green tint
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#151c18');
  grad.addColorStop(0.5, '#1e2823');
  grad.addColorStop(1, '#111714');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Outer guilloche border
  ctx.strokeStyle = 'rgba(165, 195, 175, 0.35)';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  // Inner border
  ctx.strokeStyle = 'rgba(195, 215, 205, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 472, 216);

  // Corner denomination numerals
  ctx.fillStyle = 'rgba(215, 235, 225, 0.45)';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('100', 30, 55);
  ctx.fillText('100', 420, 55);
  ctx.fillText('100', 30, 225);
  ctx.fillText('100', 420, 225);

  // Central vignette oval frame
  ctx.beginPath();
  ctx.ellipse(256, 128, 90, 65, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(215, 235, 225, 0.3)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Central watermark silhouette & stylized emblem
  ctx.fillStyle = 'rgba(215, 235, 225, 0.15)';
  ctx.beginPath();
  ctx.arc(256, 128, 45, 0, Math.PI * 2);
  ctx.fill();

  // Subtle security fine-line intaglio waves
  ctx.strokeStyle = 'rgba(165, 195, 175, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 30; y < 230; y += 8) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.bezierCurveTo(150, y + 12, 350, y - 12, 480, y);
    ctx.stroke();
  }

  // Official seal stamp (muted dark crimson)
  ctx.beginPath();
  ctx.arc(380, 128, 28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(165, 30, 30, 0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 40, 40, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export function createMoneyFlow3D(): MoneyFlow3DObject {
  const group = new THREE.Group();

  // Standard banknote proportions: ~156mm x 66mm (ratio ~2.36)
  const noteWidth = 1.45;
  const noteHeight = 0.62;
  const geometry = new THREE.PlaneGeometry(noteWidth, noteHeight, 2, 2);

  const texture = createBanknoteTexture();
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.75,
    metalness: 0.12,
    transparent: true,
    opacity: 0.88,
  });

  // Particle pool count: 85 particles (desktop cap 100)
  const totalCount = 85;
  const instancedMesh = new THREE.InstancedMesh(geometry, material, totalCount);
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(instancedMesh);

  // Initialize Particle Data across 3 Depth Layers
  const particles: NoteParticleData[] = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < totalCount; i++) {
    // 3 Depth layers:
    // 0-35: Background (small, wide spread, slower)
    // 36-65: Midground (normal scale)
    // 66-84: Foreground (closer to camera trajectory, passes close)
    let depthLayer: 'bg' | 'mid' | 'fg' = 'mid';
    let layerScale = 1.0;
    let radiusX = 14;
    let radiusY = 8;

    if (i < 30) {
      depthLayer = 'bg';
      layerScale = 0.55 + Math.random() * 0.3;
      radiusX = 22;
      radiusY = 12;
    } else if (i > 65) {
      depthLayer = 'fg';
      layerScale = 1.25 + Math.random() * 0.45;
      radiusX = 7;
      radiusY = 4.5;
    }

    // Spread along the Z-axis of the bank experience from Z = +45 down to Z = -145
    const zDistribution = 45 - Math.random() * 190;
    const x = (Math.random() - 0.5) * radiusX * 2;
    const y = 1.5 + (Math.random() - 0.5) * radiusY;

    // Last 15 notes reserved specifically for the vault opening emergence
    const isVaultNote = i >= totalCount - 15;

    particles.push({
      baseX: x,
      baseY: y,
      baseZ: isVaultNote ? -83 : zDistribution,
      x: isVaultNote ? (Math.random() - 0.5) * 3 : x,
      y: isVaultNote ? 2.5 + Math.random() * 2 : y,
      z: isVaultNote ? -83 : zDistribution,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.03,
      vz: (Math.random() - 0.5) * 0.05,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: (Math.random() - 0.5) * Math.PI,
      vRotX: (Math.random() - 0.5) * 0.8,
      vRotY: (Math.random() - 0.5) * 1.2,
      vRotZ: (Math.random() - 0.5) * 0.6,
      scale: layerScale,
      depthLayer,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.8,
      isVaultNote,
    });
  }

  // Trigger burst of banknotes emerging from the vault door
  const triggerVaultMoneyBurst = () => {
    particles.forEach((p) => {
      if (p.isVaultNote) {
        p.z = -82.5;
        p.x = (Math.random() - 0.5) * 2.8;
        p.y = 2.4 + Math.random() * 2.2;
        p.vz = 0.15 + Math.random() * 0.25; // drift outward toward camera
        p.vx = (Math.random() - 0.5) * 0.12;
        p.vy = (Math.random() - 0.5) * 0.08;
      }
    });
  };

  // Update animation loop
  const update = (
    time: number,
    scrollProgress: number,
    scrollVelocity: number,
    cameraPos: THREE.Vector3,
    mouseVel: { x: number; y: number }
  ) => {
    // Environmental Density based on current section (scrollProgress):
    // THE PLAN (0.00-0.12): very subtle
    // THE CREW (0.12-0.25): subtle edges
    // THE BLUEPRINT (0.25-0.38): almost none
    // THE VAULT (0.45-0.65): noticeable
    // GOLD REVEAL (0.65-0.80): golden & emerging notes
    // THE HEIST (0.80-0.90): stronger
    // THE EXIT (0.90-1.00): large flow
    let sectionMultiplier = 0.35;
    if (scrollProgress < 0.12) {
      sectionMultiplier = 0.25;
    } else if (scrollProgress >= 0.25 && scrollProgress < 0.40) {
      sectionMultiplier = 0.15; // Blueprint section quiet
    } else if (scrollProgress >= 0.40 && scrollProgress < 0.60) {
      sectionMultiplier = 0.55;
    } else if (scrollProgress >= 0.60 && scrollProgress < 0.80) {
      sectionMultiplier = 0.95; // Vault & Gold Reveal
    } else if (scrollProgress >= 0.80) {
      sectionMultiplier = 1.35; // Final Heist & Exit Flow
    }

    // Scroll influence: scroll down -> notes flow toward camera / down
    const scrollPushZ = scrollVelocity * 0.45;
    const scrollPushY = -Math.abs(scrollVelocity) * 0.2;

    // Mouse velocity wake influence
    const mousePushX = mouseVel.x * 0.15;
    const mousePushY = -mouseVel.y * 0.15;

    for (let i = 0; i < totalCount; i++) {
      const p = particles[i];

      // Vault emergence handling
      if (p.isVaultNote) {
        if (scrollProgress >= 0.62) {
          // Vault is open, notes drift forward out of vault
          p.z += p.vz * 0.8;
          p.x += p.vx + Math.sin(time * 2 + p.phase) * 0.02;
          p.y += p.vy + Math.cos(time * 1.5 + p.phase) * 0.015;
          p.rotX += p.vRotX * 0.04;
          p.rotY += p.vRotY * 0.04;
          p.rotZ += p.vRotZ * 0.03;

          // Recycle if drifted too far forward past vault
          if (p.z > -65) {
            p.z = -82.5;
            p.x = (Math.random() - 0.5) * 2.8;
            p.y = 2.4 + Math.random() * 2.2;
          }
        } else {
          // Inside sealed vault, hide/rest behind door
          dummy.position.set(0, -50, 0);
          dummy.scale.set(0.001, 0.001, 0.001);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(i, dummy.matrix);
          continue;
        }
      } else {
        // Natural turbulence & air resistance
        const wobbleX = Math.sin(time * p.speed + p.phase) * 0.03;
        const wobbleY = Math.cos(time * (p.speed * 0.8) + p.phase) * 0.025;
        const wobbleZ = Math.sin(time * (p.speed * 1.2) + p.phase) * 0.04;

        // Apply velocities with inertia decay
        p.vx = (p.vx + mousePushX * 0.05) * 0.94;
        p.vy = (p.vy + mousePushY * 0.05) * 0.94;
        p.vz = (p.vz + scrollPushZ * 0.08) * 0.92;

        p.x += wobbleX + p.vx;
        p.y += wobbleY + p.vy + scrollPushY * 0.04;
        p.z += wobbleZ + p.vz;

        // 3D rotation tumbling
        p.rotX += (p.vRotX + Math.abs(scrollVelocity) * 0.5) * 0.02;
        p.rotY += (p.vRotY + mouseVel.x * 0.4) * 0.02;
        p.rotZ += p.vRotZ * 0.015;

        // Keep particles bounded around camera vicinity
        const distFromCameraZ = p.z - cameraPos.z;
        if (distFromCameraZ > 25) {
          p.z = cameraPos.z - 35 - Math.random() * 15;
        } else if (distFromCameraZ < -45) {
          p.z = cameraPos.z + 18 + Math.random() * 10;
        }
      }

      // Compute display scale modulated by section density & depth layer
      const activeScale = p.scale * sectionMultiplier;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(activeScale, activeScale, activeScale);
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    instancedMesh,
    update,
    triggerVaultMoneyBurst,
  };
}
