import * as THREE from 'three';

export interface AtmosphericCloudsObject {
  group: THREE.Group;
  update: (time: number, deltaTime: number) => void;
}

export function createAtmosphericClouds(): AtmosphericCloudsObject {
  const group = new THREE.Group();
  group.name = 'AtmosphericClouds';

  // Procedural soft cloud texture via Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Radial soft puff gradient
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(215, 225, 235, 0.45)');
  grad.addColorStop(0.35, 'rgba(175, 190, 205, 0.28)');
  grad.addColorStop(0.7, 'rgba(120, 135, 150, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const cloudTexture = new THREE.CanvasTexture(canvas);
  cloudTexture.minFilter = THREE.LinearFilter;
  cloudTexture.magFilter = THREE.LinearFilter;

  const cloudMat = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
  });

  const cloudPlanes: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; rotSpeed: number }[] = [];
  const planeGeo = new THREE.PlaneGeometry(38, 26);

  // Position 24 cloud clusters across the upper sky (Y: 35 to 85, Z: -80 to -145)
  for (let i = 0; i < 24; i++) {
    const mesh = new THREE.Mesh(planeGeo, cloudMat);
    const x = (Math.random() - 0.5) * 85;
    const y = 35 + Math.random() * 45;
    const z = -80 - Math.random() * 65;

    mesh.position.set(x, y, z);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    // Angle slightly upwards towards camera look trajectory
    mesh.rotation.x = -Math.PI * 0.25 + (Math.random() - 0.5) * 0.2;

    const scale = 0.8 + Math.random() * 0.9;
    mesh.scale.set(scale, scale, 1);

    group.add(mesh);
    cloudPlanes.push({
      mesh,
      basePos: new THREE.Vector3(x, y, z),
      speed: 0.4 + Math.random() * 0.6,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    });
  }

  const update = (time: number, _deltaTime: number) => {
    // Gentle high-altitude wind drift from left to right
    cloudPlanes.forEach((cp) => {
      cp.mesh.position.x = cp.basePos.x + Math.sin(time * 0.1 * cp.speed + cp.basePos.z) * 6;
      cp.mesh.position.y = cp.basePos.y + Math.cos(time * 0.08 * cp.speed) * 1.5;
      cp.mesh.rotation.z += cp.rotSpeed * 0.01;
    });
  };

  return {
    group,
    update,
  };
}
