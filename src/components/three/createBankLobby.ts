import * as THREE from 'three';
import {
  createMetalDetector,
  createBankMonitor,
} from './assets/lobbyAndCorridorAssetFamily';
import {
  createCCTVCamera,
  type CCTVCameraAssetObject,
} from './assets/securityAssetFamily';

export interface BankLobbyObject {
  group: THREE.Group;
  cctvAsset: CCTVCameraAssetObject;
  update: (time: number) => void;
}

export function createBankLobby(): BankLobbyObject {
  const group = new THREE.Group();
  // Sits inside the building from Z = 0 to Z = -35, floor at Y = 1.96
  const floorY = 1.96;
  const ceilingY = 10.2;
  const hallWidth = 26;
  const hallLength = 36;
  const hallCenterZ = -18;

  // --- MATERIALS ---
  const blackMarbleMat = new THREE.MeshStandardMaterial({
    color: 0x07080a,
    roughness: 0.14,
    metalness: 0.5,
  });

  const wallStoneMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.85,
    metalness: 0.15,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x1e1510,
    roughness: 0.65,
    metalness: 0.1,
  });

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xb58c38,
    metalness: 0.9,
    roughness: 0.25,
  });

  const bulletproofGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7799aa,
    transparent: true,
    opacity: 0.38,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
  });

  const atmGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // ATM cyan
  });

  const ceilingTileMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d10,
    roughness: 0.9,
    metalness: 0.2,
  });

  // --- 1. POLISHED MARBLE FLOOR ---
  const floorGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
  const floor = new THREE.Mesh(floorGeo, blackMarbleMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, hallCenterZ);
  floor.receiveShadow = true;
  group.add(floor);

  // Floor Brass Inlay Lines
  [-5, 5].forEach((lineX) => {
    const inlayGeo = new THREE.BoxGeometry(0.08, 0.02, hallLength - 2);
    const inlay = new THREE.Mesh(inlayGeo, brassTrimMat);
    inlay.position.set(lineX, floorY + 0.01, hallCenterZ);
    group.add(inlay);
  });

  // --- 2. CEILING & LIGHT FIXTURES ---
  const ceilingGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingTileMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ceilingY, hallCenterZ);
  group.add(ceiling);

  // Recessed warm downlight panels along the ceiling
  for (let z = -6; z >= -30; z -= 8) {
    [-4, 4].forEach((x) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.1, 1.6),
        new THREE.MeshBasicMaterial({ color: 0xffeedd })
      );
      panel.position.set(x, ceilingY - 0.05, z);
      group.add(panel);

      const downlight = new THREE.PointLight(0xffeedd, 1.4, 16);
      downlight.position.set(x, ceilingY - 0.6, z);
      group.add(downlight);
    });
  }

  // --- 3. WALLS & COLONNADE ---
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(hallLength, ceilingY - floorY), wallStoneMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-hallWidth / 2, (floorY + ceilingY) / 2, hallCenterZ);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(hallLength, ceilingY - floorY), wallStoneMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(hallWidth / 2, (floorY + ceilingY) / 2, hallCenterZ);
  group.add(rightWall);

  // Interior Square Granite Pillars
  const pillarGeo = new THREE.BoxGeometry(1.4, ceilingY - floorY, 1.4);
  [-6, 6].forEach((colX) => {
    [-10, -18, -26].forEach((colZ) => {
      const pillar = new THREE.Mesh(pillarGeo, wallStoneMat);
      pillar.position.set(colX, (floorY + ceilingY) / 2, colZ);
      group.add(pillar);
    });
  });

  // --- 4. MODULAR METAL DETECTOR SECURITY ARCH (Z = -3.5) ---
  const metalDetector = createMetalDetector();
  metalDetector.position.set(0, floorY, -3.5);
  group.add(metalDetector);

  // --- 5. TELLER COUNTERS & BULLETPROOF PARTITIONS (Left and Right) ---
  [-9.2, 9.2].forEach((counterX, sideIdx) => {
    const isLeft = sideIdx === 0;
    const counterGroup = new THREE.Group();
    counterGroup.position.set(counterX, floorY, -18);

    // Counter Base
    const counterLength = 16;
    const counterBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.2, counterLength),
      darkWoodMat
    );
    counterBase.position.y = 0.6;
    counterGroup.add(counterBase);

    // Counter Top
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.12, counterLength + 0.2),
      blackMarbleMat
    );
    counterTop.position.y = 1.25;
    counterGroup.add(counterTop);

    // Bulletproof Glass Screens with Teller Windows
    for (let w = -6; w <= 6; w += 4) {
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.8, 3.6),
        bulletproofGlassMat
      );
      glassPane.position.set(isLeft ? 1.0 : -1.0, 2.2, w);
      counterGroup.add(glassPane);

      // Modular Bank Surveillance Monitor behind glass
      const monitor = createBankMonitor();
      monitor.position.set(isLeft ? -0.4 : 0.4, 1.3, w);
      monitor.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      counterGroup.add(monitor);
    }

    group.add(counterGroup);
  });

  // --- 6. RECESSED ATM KIOSKS (Left Wall Z = -10, Z = -14) ---
  const atmMat = new THREE.MeshStandardMaterial({ color: 0x252830, metalness: 0.8, roughness: 0.3 });
  [-10, -14].forEach((atmZ) => {
    const atm = new THREE.Group();
    atm.position.set(-hallWidth / 2 + 0.6, floorY, atmZ);

    const atmBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 2.2, 1.2),
      atmMat
    );
    atmBody.position.y = 1.1;
    atm.add(atmBody);

    const atmScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.5, 0.65),
      atmGlowMat
    );
    atmScreen.position.set(0.48, 1.3, 0);
    atm.add(atmScreen);

    group.add(atm);
  });

  // --- 7. MODULAR MOTORIZED CEILING CCTV CAMERA ---
  const cctvAsset = createCCTVCamera();
  cctvAsset.group.position.set(0, ceilingY - 0.2, -22);
  group.add(cctvAsset.group);

  // --- 8. SECURITY BULKHEAD PORTAL TO CORRIDOR (Z = -35) ---
  const lobbyEndPortal = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 5.0, 1.2),
    wallStoneMat
  );
  lobbyEndPortal.position.set(0, floorY + 2.5, -35);
  group.add(lobbyEndPortal);

  // Update loop for subtle CCTV scanning
  const update = (time: number) => {
    cctvAsset.panJoint.rotation.y = Math.sin(time * 0.7) * 0.55;
    cctvAsset.tiltJoint.rotation.x = -0.3 + Math.cos(time * 0.4) * 0.08;
    cctvAsset.update(time);
  };

  return {
    group,
    cctvAsset,
    update,
  };
}
