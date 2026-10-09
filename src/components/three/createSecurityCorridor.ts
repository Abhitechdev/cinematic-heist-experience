import * as THREE from 'three';
import {
  createCCTVCamera,
  createSecurityAccessTerminal,
  createSecurityLaserEmitter,
  createEmergencyWarningLight,
  type CCTVCameraAssetObject,
  type EmergencyWarningLightAssetObject,
} from './assets/securityAssetFamily';
import {
  createServerRack,
  createIndustrialPipeKit,
  type ServerRackAssetObject,
} from './assets/lobbyAndCorridorAssetFamily';

export interface SecurityCorridorObject {
  group: THREE.Group;
  cctvAsset: CCTVCameraAssetObject;
  laserBeam: THREE.Mesh;
  laserPlane: THREE.Mesh;
  bulkheadLeft: THREE.Mesh;
  bulkheadRight: THREE.Mesh;
  accessGrantedMesh: THREE.Mesh;
  setDoorProgress: (progress: number) => void;
  update: (time: number, cameraPosition: THREE.Vector3) => void;
}

export function createSecurityCorridor(): SecurityCorridorObject {
  const group = new THREE.Group();
  const floorY = 1.96;
  const ceilingY = 6.8;
  const corridorWidth = 6.2;
  const startZ = -35;
  const endZ = -72;
  const corridorLength = Math.abs(endZ - startZ);
  const centerZ = (startZ + endZ) / 2; // -53.5

  // --- MATERIALS ---
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x111316,
    roughness: 0.92,
    metalness: 0.15,
  });

  const ribbedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1d2127,
    roughness: 0.6,
    metalness: 0.75,
  });

  const heavyDoorMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    metalness: 0.85,
    roughness: 0.35,
  });

  const yellowHazardMat = new THREE.MeshBasicMaterial({
    color: 0xeab308,
  });

  const laserRedMat = new THREE.MeshBasicMaterial({
    color: 0xff1111,
    transparent: true,
    opacity: 0.85,
  });

  const laserPlaneMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });

  const accessGreenMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
  });

  // --- 1. FLOOR, CEILING & WALLS ---
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(corridorWidth, corridorLength),
    concreteMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, centerZ);
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(corridorWidth, corridorLength),
    concreteMat
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ceilingY, centerZ);
  group.add(ceiling);

  const wallGeo = new THREE.PlaneGeometry(corridorLength, ceilingY - floorY);

  const leftWall = new THREE.Mesh(wallGeo, concreteMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-corridorWidth / 2, (floorY + ceilingY) / 2, centerZ);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, concreteMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(corridorWidth / 2, (floorY + ceilingY) / 2, centerZ);
  group.add(rightWall);

  // --- 2. OVERHEAD INDUSTRIAL PIPE & CONDUIT KIT ---
  const pipeKitLeft = createIndustrialPipeKit(corridorLength);
  pipeKitLeft.position.set(-corridorWidth / 2 + 0.35, ceilingY - 0.45, centerZ);
  pipeKitLeft.rotation.y = Math.PI / 2;
  group.add(pipeKitLeft);

  const pipeKitRight = createIndustrialPipeKit(corridorLength);
  pipeKitRight.position.set(corridorWidth / 2 - 0.35, ceilingY - 0.45, centerZ);
  pipeKitRight.rotation.y = Math.PI / 2;
  group.add(pipeKitRight);

  // --- 3. SERVER RACKS IN ALCOVES (Z = -40 and Z = -44) ---
  const serverRacks: ServerRackAssetObject[] = [];
  const server1 = createServerRack();
  server1.group.position.set(-corridorWidth / 2 + 0.6, floorY, -40);
  server1.group.rotation.y = Math.PI / 2;
  group.add(server1.group);
  serverRacks.push(server1);

  const server2 = createServerRack();
  server2.group.position.set(-corridorWidth / 2 + 0.6, floorY, -44);
  server2.group.rotation.y = Math.PI / 2;
  group.add(server2.group);
  serverRacks.push(server2);

  // --- 4. STRUCTURAL STEEL REINFORCING RIBS & WARNING BEACONS ---
  const warningBeacons: EmergencyWarningLightAssetObject[] = [];
  for (let z = startZ - 2; z >= endZ + 2; z -= 4.5) {
    const ribGroup = new THREE.Group();
    ribGroup.position.set(0, 0, z);

    // Left rib column
    const ribColL = new THREE.Mesh(new THREE.BoxGeometry(0.4, ceilingY - floorY, 0.5), ribbedSteelMat);
    ribColL.position.set(-corridorWidth / 2 + 0.2, (floorY + ceilingY) / 2, 0);
    ribGroup.add(ribColL);

    // Right rib column
    const ribColR = new THREE.Mesh(new THREE.BoxGeometry(0.4, ceilingY - floorY, 0.5), ribbedSteelMat);
    ribColR.position.set(corridorWidth / 2 - 0.2, (floorY + ceilingY) / 2, 0);
    ribGroup.add(ribColR);

    // Overhead beam
    const ribBeam = new THREE.Mesh(new THREE.BoxGeometry(corridorWidth, 0.45, 0.5), ribbedSteelMat);
    ribBeam.position.set(0, ceilingY - 0.22, 0);
    ribGroup.add(ribBeam);

    // Modular Emergency Warning Beacon
    if (Math.round(Math.abs(z)) % 9 === 0) {
      const beacon = createEmergencyWarningLight();
      beacon.group.position.set(0, ceilingY - 0.5, 0);
      ribGroup.add(beacon.group);
      warningBeacons.push(beacon);
    }

    group.add(ribGroup);
  }

  // --- 5. WALL-MOUNTED MOTORIZED CCTV CAMERA (Mounted at Z = -48, Right Wall) ---
  const cctvAsset = createCCTVCamera();
  cctvAsset.group.position.set(corridorWidth / 2 - 0.35, 5.0, -48);
  cctvAsset.group.rotation.y = -Math.PI / 2;
  group.add(cctvAsset.group);

  // --- 6. SWEEPING RED LASER SECURITY SCANNER & HARDWARE EMITTERS ---
  const laserBeamGeo = new THREE.CylinderGeometry(0.025, 0.025, corridorWidth - 0.4, 8);
  const laserBeam = new THREE.Mesh(laserBeamGeo, laserRedMat);
  laserBeam.rotation.z = Math.PI / 2;
  laserBeam.position.set(0, 3.2, -54);
  group.add(laserBeam);

  const laserPlaneGeo = new THREE.PlaneGeometry(corridorWidth - 0.4, 2.5);
  const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
  laserPlane.position.set(0, 3.2, -54);
  group.add(laserPlane);

  // Modular Hardware Laser Emitters on both walls
  const emitterLeft = createSecurityLaserEmitter();
  emitterLeft.group.position.set(-corridorWidth / 2 + 0.12, 3.2, -54);
  emitterLeft.group.rotation.y = Math.PI / 2;
  group.add(emitterLeft.group);

  const emitterRight = createSecurityLaserEmitter();
  emitterRight.group.position.set(corridorWidth / 2 - 0.12, 3.2, -54);
  emitterRight.group.rotation.y = -Math.PI / 2;
  group.add(emitterRight.group);

  // --- 7. MODULAR WALL SECURITY ACCESS TERMINAL (At Z = -63) ---
  const accessTerminal = createSecurityAccessTerminal();
  accessTerminal.group.position.set(corridorWidth / 2 - 0.08, 3.2, -63);
  accessTerminal.group.rotation.y = -Math.PI / 2;
  group.add(accessTerminal.group);

  const accessGrantedMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.45), accessGreenMat);
  accessGrantedMesh.position.set(corridorWidth / 2 - 0.15, 3.65, -63);
  group.add(accessGrantedMesh);

  // --- 6. PNEUMATIC BULKHEAD SECURITY DOOR (At Z = -66) ---
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(corridorWidth, ceilingY - floorY, 0.8), ribbedSteelMat);
  doorFrame.position.set(0, (floorY + ceilingY) / 2, -66);
  group.add(doorFrame);

  // Hazard stripe on top of frame
  const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(corridorWidth - 0.4, 0.25, 0.85), yellowHazardMat);
  hazardStripe.position.set(0, ceilingY - 0.6, -66);
  group.add(hazardStripe);

  // Left Door Half
  const doorHalfW = (corridorWidth - 0.8) / 2;
  const doorH = ceilingY - floorY - 0.8;
  const bulkheadLeft = new THREE.Mesh(new THREE.BoxGeometry(doorHalfW, doorH, 0.35), heavyDoorMat);
  bulkheadLeft.position.set(-doorHalfW / 2, floorY + doorH / 2, -66);
  group.add(bulkheadLeft);

  // Right Door Half
  const bulkheadRight = new THREE.Mesh(new THREE.BoxGeometry(doorHalfW, doorH, 0.35), heavyDoorMat);
  bulkheadRight.position.set(doorHalfW / 2, floorY + doorH / 2, -66);
  group.add(bulkheadRight);

  // Door opening scrubber
  const setDoorProgress = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));
    bulkheadLeft.position.x = -doorHalfW / 2 - p * (doorHalfW + 0.2);
    bulkheadRight.position.x = doorHalfW / 2 + p * (doorHalfW + 0.2);
  };

  // Pre-allocated vector for CCTV tracking to prevent rAF GC churn
  const cctvTarget = new THREE.Vector3();

  // Update loop for laser sweeping & CCTV camera tracking
  const update = (time: number, cameraPosition: THREE.Vector3) => {
    // Laser sweep back and forth across Z and oscillating in Y
    const sweepZ = -54 + Math.sin(time * 2.2) * 5.5;
    const sweepY = 3.4 + Math.cos(time * 3.0) * 0.7;
    laserBeam.position.z = sweepZ;
    laserBeam.position.y = sweepY;
    laserPlane.position.z = sweepZ;
    laserPlane.position.y = sweepY;

    // Track CCTV motorized head toward camera position
    cctvTarget.copy(cameraPosition);
    cctvAsset.trackTarget(cctvTarget);
    cctvAsset.update(time);

    // Update server rack network activity LEDs
    serverRacks.forEach((rack) => rack.update(time));

    // Update emergency warning beacons
    warningBeacons.forEach((beacon) => beacon.update(time));
  };

  return {
    group,
    cctvAsset,
    laserBeam,
    laserPlane,
    bulkheadLeft,
    bulkheadRight,
    accessGrantedMesh,
    setDoorProgress,
    update,
  };
}
