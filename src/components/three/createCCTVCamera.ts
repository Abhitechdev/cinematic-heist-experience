import * as THREE from 'three';

export interface CCTVCameraObject {
  group: THREE.Group;
  gimbal: THREE.Group;
  redLed: THREE.Mesh;
  laserCone: THREE.Mesh;
  update: (time: number) => void;
}

export function createCCTVCamera(): CCTVCameraObject {
  const group = new THREE.Group();

  // Materials
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1f2329,
    metalness: 0.8,
    roughness: 0.3,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    roughness: 0.6,
  });

  const ledMat = new THREE.MeshBasicMaterial({
    color: 0xc91414,
  });

  // Base Wall Mount Arm
  const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.15, 16);
  const base = new THREE.Mesh(baseGeo, darkMat);
  base.rotation.x = Math.PI / 2;
  group.add(base);

  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
  const arm = new THREE.Mesh(armGeo, metalMat);
  arm.position.set(0, -0.4, 0.25);
  arm.rotation.x = 0.5;
  group.add(arm);

  // Gimbal Pan/Tilt Head
  const gimbal = new THREE.Group();
  gimbal.position.set(0, -0.7, 0.45);
  group.add(gimbal);

  // Camera Body Housing
  const bodyGeo = new THREE.BoxGeometry(0.4, 0.35, 0.85);
  const body = new THREE.Mesh(bodyGeo, metalMat);
  gimbal.add(body);

  // Sun Shield
  const shieldGeo = new THREE.BoxGeometry(0.44, 0.05, 0.9);
  const shield = new THREE.Mesh(shieldGeo, darkMat);
  shield.position.set(0, 0.2, 0.05);
  gimbal.add(shield);

  // Lens Barrel
  const lensGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.3, 24);
  const lens = new THREE.Mesh(lensGeo, darkMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.52);
  gimbal.add(lens);

  // Blinking Red Recording LED
  const ledGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const redLed = new THREE.Mesh(ledGeo, ledMat);
  redLed.position.set(0.12, 0.12, 0.45);
  gimbal.add(redLed);

  // Volumetric Red Laser Scanning Cone
  const coneGeo = new THREE.ConeGeometry(2.5, 9.0, 32, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xc91414,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const laserCone = new THREE.Mesh(coneGeo, coneMat);
  laserCone.rotation.x = -Math.PI / 2;
  laserCone.position.set(0, 0, 4.8);
  gimbal.add(laserCone);

  const update = (time: number) => {
    // Smooth surveillance pan oscillation
    gimbal.rotation.y = Math.sin(time * 0.8) * 0.5;
    gimbal.rotation.x = -0.3 + Math.cos(time * 0.6) * 0.15;

    // Blink LED every 0.6 seconds
    const blink = Math.sin(time * 5.0) > 0.1;
    ledMat.color.setHex(blink ? 0xc91414 : 0x330000);
  };

  return {
    group,
    gimbal,
    redLed,
    laserCone,
    update,
  };
}
