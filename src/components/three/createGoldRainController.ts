import * as THREE from 'three';
import { createGoldBarGeometry, treasuryMaterials } from './assets/goldAndTreasuryAssetFamily';

export interface GoldRainController {
  group: THREE.Group;
  triggerBeat: (beat: 1 | 2 | 3) => void;
  update: (deltaTime: number, camera: THREE.Camera) => void;
  reset: () => void;
  setMasterOpacity: (opacity: number) => void;
  getActiveBarCount: () => number;
}

interface GoldBarParticle {
  mesh: THREE.Mesh;
  active: boolean;
  beat: 1 | 2 | 3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  angVel: THREE.Vector3;
  scale: number;
  lifetime: number;
  maxLifetime: number;
  initialY: number;
  tumbleSpeed: number;
}

export function createGoldRainController(vaultDoorZ = -82): GoldRainController {
  const group = new THREE.Group();
  group.name = 'GoldRainController';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const poolSize = isMobile ? 14 : 36;

  // Use the realistic tapered trapezoidal bullion geometry with chamfers
  const barGeo = createGoldBarGeometry(true);

  // Dedicated PBR gold material for hero rain bars with rich specular sheen
  const rainGoldMat = treasuryMaterials.heroFineGold.clone();
  rainGoldMat.metalness = 0.99;
  rainGoldMat.roughness = 0.15;
  rainGoldMat.envMapIntensity = 2.4;

  // Stamped Inscription Plate texture for hero bullion bars
  const stampCanvas = document.createElement('canvas');
  stampCanvas.width = 256;
  stampCanvas.height = 128;
  const sCtx = stampCanvas.getContext('2d')!;
  sCtx.fillStyle = '#f5ba31';
  sCtx.fillRect(0, 0, 256, 128);
  sCtx.fillStyle = '#9e6e16';
  sCtx.font = 'bold 22px monospace';
  sCtx.textAlign = 'center';
  sCtx.fillText('999.9 FINE GOLD', 128, 44);
  sCtx.font = 'bold 16px monospace';
  sCtx.fillText('1000g // RESERVA', 128, 74);
  sCtx.font = '14px monospace';
  sCtx.fillText('ES-2807-X', 128, 102);
  sCtx.strokeStyle = '#9e6e16';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(10, 10, 236, 108);

  const stampTexture = new THREE.CanvasTexture(stampCanvas);
  const stampMat = new THREE.MeshStandardMaterial({
    map: stampTexture,
    metalness: 0.98,
    roughness: 0.22,
  });

  const particles: GoldBarParticle[] = [];

  // Dedicated Celebratory Banknote Texture for Vault Opening Burst (Reference Image 3)
  const noteCanvas = document.createElement('canvas');
  noteCanvas.width = 256;
  noteCanvas.height = 128;
  const nCtx = noteCanvas.getContext('2d')!;
  nCtx.fillStyle = '#1e2420';
  nCtx.fillRect(0, 0, 256, 128);
  nCtx.fillStyle = '#2d3e33';
  nCtx.fillRect(8, 8, 240, 112);
  nCtx.strokeStyle = '#c91414';
  nCtx.lineWidth = 3;
  nCtx.strokeRect(12, 12, 232, 104);
  nCtx.fillStyle = '#d4d8cf';
  nCtx.font = 'bold 28px serif';
  nCtx.fillText('500', 28, 42);
  nCtx.font = 'bold 12px sans-serif';
  nCtx.fillText('BANCO NACIONAL DE RESERVA', 28, 70);
  nCtx.fillText('CINEMATIC HEIST UNINDEXED', 28, 92);

  const noteTexture = new THREE.CanvasTexture(noteCanvas);
  const noteMat = new THREE.MeshStandardMaterial({
    map: noteTexture,
    roughness: 0.75,
    metalness: 0.08,
    side: THREE.DoubleSide,
    transparent: true,
  });

  interface CelebrationNoteParticle {
    mesh: THREE.Mesh;
    active: boolean;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Euler;
    angVel: THREE.Vector3;
    scale: number;
    lifetime: number;
    maxLifetime: number;
  }

  const notePoolSize = isMobile ? 8 : 20;
  const celebrationNotes: CelebrationNoteParticle[] = [];
  const noteGeo = new THREE.PlaneGeometry(0.55, 0.28);

  for (let i = 0; i < notePoolSize; i++) {
    const noteMesh = new THREE.Mesh(noteGeo, noteMat.clone());
    noteMesh.visible = false;
    group.add(noteMesh);

    celebrationNotes.push({
      mesh: noteMesh,
      active: false,
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      scale: 1,
      lifetime: 0,
      maxLifetime: 4.2,
    });
  }

  // Pre-allocate mesh pool strictly at initialization (Zero allocations during rAF loop)
  for (let i = 0; i < poolSize; i++) {
    const barMesh = new THREE.Mesh(barGeo, rainGoldMat);
    barMesh.castShadow = true;
    barMesh.receiveShadow = true;
    barMesh.visible = false;

    // Attach stamped serial plate to top surface of bar
    const stampPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.24), stampMat);
    stampPlate.rotation.x = -Math.PI / 2;
    stampPlate.position.y = 0.132;
    barMesh.add(stampPlate);

    group.add(barMesh);

    particles.push({
      mesh: barMesh,
      active: false,
      beat: 1,
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      scale: 1,
      lifetime: 0,
      maxLifetime: 4.5,
      initialY: 0,
      tumbleSpeed: 1,
    });
  }

  // Helper to spawn a bar with specific cinematic parameters
  const spawnBar = (p: GoldBarParticle, beat: 1 | 2 | 3, indexInBurst: number, totalBurst: number) => {
    p.active = true;
    p.beat = beat;
    p.lifetime = 0;

    if (beat === 1) {
      // BEAT 1: A few bars emerge through the first crack of the opening door
      // Emanating from the left-center crack at vault door
      p.maxLifetime = 3.5 + Math.random() * 1.0;
      p.scale = 0.85 + Math.random() * 0.25;

      // Start at opening crack (x ~ 0.5 to 2.2, y ~ 2.4 to 4.2, z ~ vaultDoorZ - 1.5)
      p.pos.set(
        0.4 + (indexInBurst / totalBurst) * 1.8 + (Math.random() - 0.5) * 0.4,
        2.2 + Math.random() * 1.8,
        vaultDoorZ - 1.0 - Math.random() * 2.0
      );

      // Emerge forward and outward with tumbling velocity
      p.vel.set(
        (Math.random() - 0.3) * 1.8,
        -0.8 - Math.random() * 1.2,
        3.5 + Math.random() * 2.5 // move towards camera in corridor
      );

      p.angVel.set(
        (Math.random() - 0.5) * 5.0,
        (Math.random() - 0.5) * 6.0,
        (Math.random() - 0.5) * 4.0
      );
    } else if (beat === 2) {
      // BEAT 2: Strong gold-rain burst when vault door is fully swung open
      p.maxLifetime = 4.2 + Math.random() * 1.8;

      // Distribute across three spatial styles:
      // A) Tumbling outward through the open portal toward the camera
      // B) Cascading down from upper viewport like cinematic gold rain
      // C) Hero foreground bar passing close to camera
      const type = indexInBurst % 3;

      if (type === 0) {
        // Tumbling forward from inside the vault into the corridor
        p.scale = 0.95 + Math.random() * 0.35;
        p.pos.set(
          (Math.random() - 0.5) * 4.5,
          2.6 + Math.random() * 2.8,
          vaultDoorZ - 2.0 - Math.random() * 5.0
        );
        p.vel.set(
          (Math.random() - 0.5) * 3.2,
          -0.6 - Math.random() * 1.8,
          5.0 + Math.random() * 4.5 // rushing out towards camera (Z ~ -75 to -60)
        );
      } else if (type === 1) {
        // Falling down through the viewport across the corridor frame
        p.scale = 0.8 + Math.random() * 0.4;
        p.pos.set(
          (Math.random() - 0.5) * 8.0,
          7.2 + Math.random() * 2.5, // high up near ceiling
          vaultDoorZ + 1.0 + Math.random() * 12.0
        );
        p.vel.set(
          (Math.random() - 0.5) * 1.5,
          -3.2 - Math.random() * 2.5, // falling down
          (Math.random() - 0.5) * 2.0
        );
      } else {
        // Hero bar passing close to camera view
        p.scale = 1.1 + Math.random() * 0.35;
        p.pos.set(
          (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.5),
          3.2 + Math.random() * 2.0,
          vaultDoorZ + 6.0 + Math.random() * 8.0
        );
        p.vel.set(
          (Math.random() - 0.5) * 2.2,
          -1.5 - Math.random() * 2.0,
          3.8 + Math.random() * 3.0
        );
      }

      p.angVel.set(
        (Math.random() - 0.5) * 8.0,
        (Math.random() - 0.5) * 9.0,
        (Math.random() - 0.5) * 7.0
      );
    } else {
      // BEAT 3: Residual gentle shower inside the treasury room
      p.maxLifetime = 3.8 + Math.random() * 1.2;
      p.scale = 0.75 + Math.random() * 0.3;

      p.pos.set(
        (Math.random() - 0.5) * 7.0,
        6.5 + Math.random() * 2.0,
        vaultDoorZ - 8.0 - Math.random() * 18.0 // deep inside treasury (-90 to -110)
      );
      p.vel.set(
        (Math.random() - 0.5) * 1.2,
        -2.5 - Math.random() * 1.8,
        (Math.random() - 0.5) * 1.5
      );
      p.angVel.set(
        (Math.random() - 0.5) * 4.0,
        (Math.random() - 0.5) * 5.0,
        (Math.random() - 0.5) * 4.0
      );
    }

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

  const triggerBeat = (beat: 1 | 2 | 3) => {
    let countToSpawn = 0;
    if (beat === 1) {
      countToSpawn = isMobile ? 4 : 6;
    } else if (beat === 2) {
      countToSpawn = isMobile ? 10 : 26;

      // Burst celebratory banknotes alongside gold bars (Reference Image 3: Vault Celebration)
      const notesToSpawn = isMobile ? 6 : 16;
      for (let n = 0; n < notesToSpawn && n < notePoolSize; n++) {
        const note = celebrationNotes[n];
        note.active = true;
        note.lifetime = 0;
        note.maxLifetime = 3.8 + Math.random() * 1.5;
        note.scale = 0.85 + Math.random() * 0.35;
        note.mesh.scale.set(note.scale, note.scale, note.scale);
        note.mesh.visible = true;

        // Erupt forward & upward from open vault portal
        note.pos.set(
          (Math.random() - 0.5) * 5.2,
          3.2 + Math.random() * 2.4,
          vaultDoorZ - 1.2 - Math.random() * 3.5
        );
        note.vel.set(
          (Math.random() - 0.5) * 4.2,
          2.4 + Math.random() * 3.2,
          4.0 + Math.random() * 5.2 // rushing outward into the corridor towards camera
        );
        note.angVel.set(
          (Math.random() - 0.5) * 8.0,
          (Math.random() - 0.5) * 9.0,
          (Math.random() - 0.5) * 7.0
        );
      }
    } else {
      countToSpawn = isMobile ? 5 : 12;
    }

    let spawned = 0;
    for (let i = 0; i < poolSize && spawned < countToSpawn; i++) {
      const p = particles[i];
      if (!p.active) {
        spawnBar(p, beat, spawned, countToSpawn);
        spawned++;
      }
    }

    // If all pooled were active, steal earliest expired
    if (spawned < countToSpawn) {
      for (let i = 0; i < poolSize && spawned < countToSpawn; i++) {
        const p = particles[i];
        if (p.lifetime > p.maxLifetime * 0.6) {
          spawnBar(p, beat, spawned, countToSpawn);
          spawned++;
        }
      }
    }
  };

  const gravity = -6.8;

  const update = (deltaTime: number, camera: THREE.Camera) => {
    const dt = Math.min(deltaTime, 0.05); // clamp delta time for stability

    for (let i = 0; i < poolSize; i++) {
      const p = particles[i];
      if (!p.active) continue;

      p.lifetime += dt;

      // Apply physics integration
      p.vel.y += gravity * dt;

      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.pos.z += p.vel.z * dt;

      p.rot.x += p.angVel.x * dt;
      p.rot.y += p.angVel.y * dt;
      p.rot.z += p.angVel.z * dt;

      // Ground bounce / settle threshold (floor is around y = 1.96)
      if (p.pos.y < 2.05) {
        p.pos.y = 2.05;
        // Bounce with high restitution damping
        p.vel.y = -p.vel.y * 0.28;
        p.vel.x *= 0.65;
        p.vel.z *= 0.65;
        p.angVel.multiplyScalar(0.5);
      }

      // Sync mesh
      p.mesh.position.copy(p.pos);
      p.mesh.rotation.copy(p.rot);

      // Fade out near end of lifetime or if far behind camera
      const lifeRatio = p.lifetime / p.maxLifetime;
      if (lifeRatio >= 1.0 || (camera && p.pos.z > camera.position.z + 10)) {
        p.active = false;
        p.mesh.visible = false;
      }
    }

    // Update celebratory banknotes (Reference Image 3: Money Burst)
    for (let i = 0; i < notePoolSize; i++) {
      const note = celebrationNotes[i];
      if (!note.active) continue;

      note.lifetime += dt;

      // Aerodynamic paper flutter & gentle air resistance
      note.vel.y += -2.8 * dt; // gentle flutter gravity
      note.vel.multiplyScalar(0.985); // air drag

      // Sinusoidal aerodynamic wobble
      const flutter = Math.sin(note.lifetime * 10 + i) * 0.8;
      note.pos.x += (note.vel.x + flutter) * dt;
      note.pos.y += note.vel.y * dt;
      note.pos.z += note.vel.z * dt;

      note.rot.x += note.angVel.x * dt;
      note.rot.y += note.angVel.y * dt;
      note.rot.z += (note.angVel.z + flutter * 2.0) * dt;

      note.mesh.position.copy(note.pos);
      note.mesh.rotation.copy(note.rot);

      const lifeRatio = note.lifetime / note.maxLifetime;
      const noteMaterial = note.mesh.material as THREE.MeshStandardMaterial;
      if (noteMaterial) {
        noteMaterial.opacity = Math.max(0, 1.0 - Math.pow(lifeRatio, 2));
      }

      if (lifeRatio >= 1.0 || (camera && note.pos.z > camera.position.z + 10)) {
        note.active = false;
        note.mesh.visible = false;
      }
    }
  };

  const reset = () => {
    particles.forEach((p) => {
      p.active = false;
      p.lifetime = 0;
      p.mesh.visible = false;
      p.pos.set(0, -100, 0);
      p.mesh.position.copy(p.pos);
    });

    celebrationNotes.forEach((n) => {
      n.active = false;
      n.lifetime = 0;
      n.mesh.visible = false;
      n.pos.set(0, -100, 0);
      n.mesh.position.copy(n.pos);
    });
  };

  const setMasterOpacity = (opacity: number) => {
    rainGoldMat.transparent = opacity < 1.0;
    rainGoldMat.opacity = opacity;
    rainGoldMat.needsUpdate = true;
  };

  const getActiveBarCount = () => {
    return particles.filter((p) => p.active).length;
  };

  return {
    group,
    triggerBeat,
    update,
    reset,
    setMasterOpacity,
    getActiveBarCount,
  };
}
