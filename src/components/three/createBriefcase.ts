import * as THREE from 'three';

export interface BriefcaseObject {
  group: THREE.Group;
  lid: THREE.Group;
  update: (time: number) => void;
}

export function createBriefcase(): BriefcaseObject {
  const group = new THREE.Group();

  // Materials
  const blackAlloyMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.8,
    roughness: 0.35,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.95,
    roughness: 0.1,
  });

  const redLedMat = new THREE.MeshBasicMaterial({
    color: 0xc91414,
  });

  // Base shell
  const baseShell = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.6), blackAlloyMat);
  baseShell.position.y = 0.225;
  group.add(baseShell);

  // Chrome reinforced corners
  const cornerGeo = new THREE.BoxGeometry(0.2, 0.46, 0.2);
  [[-1.15, -0.75], [1.15, -0.75], [-1.15, 0.75], [1.15, 0.75]].forEach(([cx, cz]) => {
    const corner = new THREE.Mesh(cornerGeo, chromeMat);
    corner.position.set(cx, 0.225, cz);
    group.add(corner);
  });

  // Lid Hinge at rear (z = -0.8)
  const lid = new THREE.Group();
  lid.position.set(0, 0.45, -0.8);
  group.add(lid);

  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.6), blackAlloyMat);
  lidMesh.position.set(0, 0.225, 0.8);
  lid.add(lidMesh);

  // Numeric Combination Tumblers
  [-0.45, 0.45].forEach((tx) => {
    const tumbler = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.15), chromeMat);
    tumbler.position.set(tx, 0.45, 0.82);
    group.add(tumbler);
  });

  // Handle
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 12, 24, Math.PI), chromeMat);
  handle.position.set(0, 0.3, 0.95);
  handle.rotation.x = Math.PI / 2;
  group.add(handle);

  // Red Status Light
  const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), redLedMat);
  statusLight.position.set(0, 0.46, 0.5);
  group.add(statusLight);

  const update = (time: number) => {
    // Subtle float and tilt
    group.rotation.y = Math.sin(time * 0.5) * 0.25;
    group.rotation.x = 0.1 + Math.cos(time * 0.7) * 0.08;
    group.position.y = Math.sin(time * 1.2) * 0.1;
  };

  return {
    group,
    lid,
    update,
  };
}
