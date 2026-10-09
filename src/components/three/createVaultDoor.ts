import * as THREE from 'three';

export interface VaultDoorObject {
  group: THREE.Group;
  doorHinge: THREE.Group;
  handWheel: THREE.Group;
  dialGroup: THREE.Group;
  bolts: THREE.Mesh[];
  interiorLight: THREE.PointLight;
  setUnlockProgress: (progress: number) => void;
}

export function createVaultDoor(): VaultDoorObject {
  const group = new THREE.Group();

  // Materials
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f47,
    metalness: 0.85,
    roughness: 0.25,
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c20,
    metalness: 0.9,
    roughness: 0.4,
  });

  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xc8963e,
    metalness: 0.95,
    roughness: 0.2,
  });

  const redAccentMat = new THREE.MeshBasicMaterial({
    color: 0xc91414,
  });

  // Outer Vault Rim / Wall Portal
  const outerRimGeo = new THREE.TorusGeometry(3.6, 0.45, 16, 48);
  const outerRim = new THREE.Mesh(outerRimGeo, darkSteelMat);
  group.add(outerRim);

  // Rim Industrial Rivets
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const rivetGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8);
    const rivet = new THREE.Mesh(rivetGeo, steelMat);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(Math.cos(angle) * 3.6, Math.sin(angle) * 3.6, 0.25);
    group.add(rivet);
  }

  // Vault Door Hinge Group on the Left (-3.2, 0, 0)
  const doorHinge = new THREE.Group();
  doorHinge.position.set(-3.2, 0, 0);
  group.add(doorHinge);

  // Door Container relative to hinge
  const doorBody = new THREE.Group();
  doorBody.position.set(3.2, 0, 0);
  doorHinge.add(doorBody);

  // Circular Door Plate
  const doorPlateGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.6, 48);
  const doorPlate = new THREE.Mesh(doorPlateGeo, steelMat);
  doorPlate.rotation.x = Math.PI / 2;
  doorBody.add(doorPlate);

  // Inner Concentric Steel Ring
  const innerRingGeo = new THREE.TorusGeometry(2.1, 0.18, 16, 48);
  const innerRing = new THREE.Mesh(innerRingGeo, darkSteelMat);
  innerRing.position.z = 0.32;
  doorBody.add(innerRing);

  // Locking Radial Bolts around circumference (8 bolts)
  const bolts: THREE.Mesh[] = [];
  const boltGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bolt = new THREE.Mesh(boltGeo, steelMat);
    bolt.rotation.z = angle - Math.PI / 2;
    bolt.position.set(Math.cos(angle) * 2.9, Math.sin(angle) * 2.9, 0);
    doorBody.add(bolt);
    bolts.push(bolt);
  }

  // Central Rotating Combination Dial Group
  const dialGroup = new THREE.Group();
  dialGroup.position.set(0, 0, 0.38);
  doorBody.add(dialGroup);

  const dialBaseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.2, 32);
  const dialBase = new THREE.Mesh(dialBaseGeo, goldBrassMat);
  dialBase.rotation.x = Math.PI / 2;
  dialGroup.add(dialBase);

  // Dial Hash Marks
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const hash = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.15, 0.05),
      i % 5 === 0 ? redAccentMat : darkSteelMat
    );
    hash.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0.12);
    hash.rotation.z = angle;
    dialGroup.add(hash);
  }

  // Heavy 4-Spoke Hand Steering Wheel Group
  const handWheel = new THREE.Group();
  handWheel.position.set(0, 0, 0.65);
  doorBody.add(handWheel);

  const wheelHubGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.25, 24);
  const wheelHub = new THREE.Mesh(wheelHubGeo, darkSteelMat);
  wheelHub.rotation.x = Math.PI / 2;
  handWheel.add(wheelHub);

  const spokeMat = steelMat;
  // 4 spokes + outer handles
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 16), spokeMat);
    spoke.rotation.z = angle;
    handWheel.add(spoke);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 12), goldBrassMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0.15);
    handWheel.add(handle);
  }

  // Red Emergency Interior Backlight (revealed when door opens)
  const interiorLight = new THREE.PointLight(0xc91414, 0, 15);
  interiorLight.position.set(0, 0, -2.5);
  group.add(interiorLight);

  // Unlock progress scrubber:
  // 0.0 - 0.4: Dial rotates & clicks
  // 0.4 - 0.7: Wheel spins, bolts retract
  // 0.7 - 1.0: Hinge opens, red interior light floods outward
  const setUnlockProgress = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));

    // Phase 1: Dial rotation
    const dialP = Math.min(1, p / 0.4);
    dialGroup.rotation.z = dialP * Math.PI * 4.5;

    // Phase 2: Wheel spin & bolt retraction
    if (p > 0.3) {
      const wheelP = Math.min(1, (p - 0.3) / 0.4);
      handWheel.rotation.z = -wheelP * Math.PI * 3;

      // Bolts retract inward
      bolts.forEach((bolt, i) => {
        const angle = (i / bolts.length) * Math.PI * 2;
        const currentDist = 2.9 - wheelP * 0.45;
        bolt.position.set(Math.cos(angle) * currentDist, Math.sin(angle) * currentDist, 0);
      });
    } else {
      handWheel.rotation.z = 0;
      bolts.forEach((bolt, i) => {
        const angle = (i / bolts.length) * Math.PI * 2;
        bolt.position.set(Math.cos(angle) * 2.9, Math.sin(angle) * 2.9, 0);
      });
    }

    // Phase 3: Hinge opens
    if (p > 0.65) {
      const openP = Math.min(1, (p - 0.65) / 0.35);
      doorHinge.rotation.y = -openP * (Math.PI * 0.48);
      interiorLight.intensity = openP * 8.5;
    } else {
      doorHinge.rotation.y = 0;
      interiorLight.intensity = 0;
    }
  };

  return {
    group,
    doorHinge,
    handWheel,
    dialGroup,
    bolts,
    interiorLight,
    setUnlockProgress,
  };
}
