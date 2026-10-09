import * as THREE from 'three';
import {
  createVaultPasswordTerminal,
  createVaultHandwheel,
  createHydraulicPiston,
  createVaultHinge,
  type VaultTerminalAssetObject,
} from './assets/vaultAssetFamily';
import {
  createCCTVCamera,
  createEmergencyWarningLight,
  type CCTVCameraAssetObject,
} from './assets/securityAssetFamily';
import {
  createHeroGoldBullionBar,
  createGoldTransportPallet,
  createSafetyDepositLockerWall,
  createTreasuryDisplayPlinth,
  createSecureBriefcase,
  createCashSecurityCrate,
} from './assets/goldAndTreasuryAssetFamily';

export interface VaultUnlockResult {
  boltIndexRetracted: number | null;
  doorOpened: boolean;
  pneumaticReleased: boolean;
  handwheelSpinning: boolean;
  goldBurstTriggered: boolean;
  impactShake: number;
}

export interface VaultAndGoldBullionObject {
  group: THREE.Group;
  doorHinge: THREE.Group;
  handWheel: THREE.Group;
  dialGroup: THREE.Group;
  bolts: THREE.Mesh[];
  goldSpillLight: THREE.PointLight;
  goldSpotLight: THREE.SpotLight;
  goldBarsMesh: THREE.InstancedMesh;
  heroGoldBars: THREE.Mesh[];
  terminalAsset: VaultTerminalAssetObject;
  cctvVault: CCTVCameraAssetObject;
  setUnlockProgress: (progress: number) => VaultUnlockResult;
  update: (time: number) => void;
}

export function createVaultAndGoldBullion(): VaultAndGoldBullionObject {
  const group = new THREE.Group();
  const floorY = 1.96;
  const ceilingY = 7.5;
  const vaultDoorZ = -82;

  // --- 1. MATERIALS ---
  // High-grade heavy armor steel
  const armorSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2b3038,
    metalness: 0.9,
    roughness: 0.28,
  });

  const darkBunkerSteelMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    metalness: 0.92,
    roughness: 0.42,
  });

  const polishedChromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde5,
    metalness: 0.98,
    roughness: 0.12,
  });

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc9963e,
    metalness: 0.95,
    roughness: 0.22,
  });

  // Authentic PBR Gold Material (Not yellow plastic!)
  const goldPBRMat = new THREE.MeshStandardMaterial({
    color: 0xf5ba31,
    metalness: 0.98,
    roughness: 0.18,
  });



  const industrialShelfMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    metalness: 0.85,
    roughness: 0.4,
  });

  const concreteWallMat = new THREE.MeshStandardMaterial({
    color: 0x0f1114,
    roughness: 0.9,
    metalness: 0.15,
  });

  const redBeaconMat = new THREE.MeshBasicMaterial({
    color: 0xff1515,
  });

  const depositBoxMat = new THREE.MeshStandardMaterial({
    color: 0x4a4338,
    metalness: 0.88,
    roughness: 0.25,
  });

  // --- 2. MONUMENTAL VAULT PORTAL & WALL (Z = -82) ---
  const portalWallGeo = new THREE.BoxGeometry(22, ceilingY - floorY + 2, 2.5);
  const portalWall = new THREE.Mesh(portalWallGeo, concreteWallMat);
  portalWall.position.set(0, (floorY + ceilingY) / 2, vaultDoorZ);
  group.add(portalWall);

  // Circular Steel Portal Rim
  const portalRimGeo = new THREE.TorusGeometry(4.2, 0.55, 20, 56);
  const portalRim = new THREE.Mesh(portalRimGeo, darkBunkerSteelMat);
  portalRim.position.set(0, (floorY + ceilingY) / 2, vaultDoorZ + 0.9);
  group.add(portalRim);

  // 24 Heavy Outer Portal Rivets
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const rivetGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10);
    const rivet = new THREE.Mesh(rivetGeo, polishedChromeMat);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(
      Math.cos(angle) * 4.2,
      (floorY + ceilingY) / 2 + Math.sin(angle) * 4.2,
      vaultDoorZ + 1.2
    );
    group.add(rivet);
  }

  // --- 3. 40-TON CIRCULAR STEEL VAULT DOOR ASSEMBLY ---
  const doorHinge = new THREE.Group();
  doorHinge.position.set(-3.8, (floorY + ceilingY) / 2, vaultDoorZ + 1.0);
  group.add(doorHinge);

  // Modular Heavy Vault Hinge Asset Assembly
  const vaultHingeAsset = createVaultHinge();
  vaultHingeAsset.group.position.set(0, 0, 0);
  doorHinge.add(vaultHingeAsset.group);

  const doorBody = new THREE.Group();
  doorBody.position.set(3.8, 0, 0);
  doorHinge.add(doorBody);

  // Massive circular door plug
  const doorPlateGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.8, 56);
  const doorPlate = new THREE.Mesh(doorPlateGeo, armorSteelMat);
  doorPlate.rotation.x = Math.PI / 2;
  doorBody.add(doorPlate);

  // Concentric reinforcing steel ring
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.22, 16, 48), darkBunkerSteelMat);
  ring1.position.z = 0.42;
  doorBody.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.18, 16, 48), darkBunkerSteelMat);
  ring2.position.z = 0.44;
  doorBody.add(ring2);

  // 12 Heavy Locking Radial Bolts
  const bolts: THREE.Mesh[] = [];
  const boltGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.95, 16);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bolt = new THREE.Mesh(boltGeo, polishedChromeMat);
    bolt.rotation.z = angle - Math.PI / 2;
    bolt.position.set(Math.cos(angle) * 3.4, Math.sin(angle) * 3.4, 0);
    doorBody.add(bolt);
    bolts.push(bolt);
  }

  // Central Combination Dial Group
  const dialGroup = new THREE.Group();
  dialGroup.position.set(0, 0, 0.52);
  doorBody.add(dialGroup);

  const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.25, 36), brassTrimMat);
  dialBase.rotation.x = Math.PI / 2;
  dialGroup.add(dialBase);

  // Dial Index Numbers / Marks
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const mark = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.16, 0.04),
      i % 6 === 0 ? redBeaconMat : darkBunkerSteelMat
    );
    mark.position.set(Math.cos(angle) * 0.88, Math.sin(angle) * 0.88, 0.14);
    mark.rotation.z = angle;
    dialGroup.add(mark);
  }

  // Modular Precision Vault Handwheel Asset (Machined bronze hub & knurled grips)
  const handwheelAsset = createVaultHandwheel();
  handwheelAsset.group.position.set(0, 0, 0.82);
  doorBody.add(handwheelAsset.group);
  const handWheel = handwheelAsset.wheelPivot;

  // Modular Hydraulic Actuator Piston (Door closer/opener)
  const hydraulicPiston = createHydraulicPiston();
  hydraulicPiston.group.position.set(-1.8, (floorY + ceilingY) / 2 + 2.4, vaultDoorZ + 1.1);
  hydraulicPiston.group.rotation.z = Math.PI * 0.38;
  group.add(hydraulicPiston.group);

  // Modular Vault Password Terminal (Wall-mounted at user eye-level)
  const terminalAsset = createVaultPasswordTerminal();
  terminalAsset.group.position.set(4.6, (floorY + ceilingY) / 2 - 0.2, vaultDoorZ + 1.25);
  terminalAsset.group.rotation.y = -Math.PI / 12;
  group.add(terminalAsset.group);

  // High-Mounted CCTV Surveillance Camera tracking entrance
  const cctvVault = createCCTVCamera();
  cctvVault.group.position.set(3.8, ceilingY - 0.1, vaultDoorZ + 3.2);
  group.add(cctvVault.group);

  // Warning strobe lights flanking vault portal (Modular Emergency Light Beacons)
  const warningLightLeft = createEmergencyWarningLight();
  warningLightLeft.group.position.set(-4.8, (floorY + ceilingY) / 2 + 3.2, vaultDoorZ + 1.2);
  group.add(warningLightLeft.group);

  const warningLightRight = createEmergencyWarningLight();
  warningLightRight.group.position.set(4.8, (floorY + ceilingY) / 2 + 3.2, vaultDoorZ + 1.2);
  group.add(warningLightRight.group);

  // --- 4. DRAMATIC GOLDEN LIGHT SPILL & INTERIOR LIGHTING ---
  // Powerful warm golden point light right behind the door
  const goldSpillLight = new THREE.PointLight(0xffaa11, 0, 35);
  goldSpillLight.position.set(0, (floorY + ceilingY) / 2, vaultDoorZ - 3.0);
  group.add(goldSpillLight);

  // Golden volumetric spotlight aimed outwards through the door opening
  const goldSpotLight = new THREE.SpotLight(0xffd700, 0, 45, Math.PI / 3, 0.6);
  goldSpotLight.position.set(0, (floorY + ceilingY) / 2 + 1, vaultDoorZ - 2);
  goldSpotLight.target.position.set(0, (floorY + ceilingY) / 2, vaultDoorZ + 20);
  group.add(goldSpotLight);
  group.add(goldSpotLight.target);

  // --- 5. THE GOLD BULLION ROOM (Z = -82 to Z = -120) ---
  const vaultRoomLength = 38;
  const vaultRoomWidth = 18;
  const vaultRoomCenterZ = -101;

  // Vault Floor
  const vaultFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(vaultRoomWidth, vaultRoomLength),
    new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      roughness: 0.16,
      metalness: 0.78,
    })
  );
  vaultFloor.rotation.x = -Math.PI / 2;
  vaultFloor.position.set(0, floorY, vaultRoomCenterZ);
  vaultFloor.receiveShadow = true;
  group.add(vaultFloor);

  // Dedicated Warm Amber Spotlights Illuminating Bullion Stacks (Reference 2)
  const corridorGoldSpot = new THREE.SpotLight(0xffb833, 3.8, 25, Math.PI / 3, 0.45);
  corridorGoldSpot.position.set(0, 5.8, -71);
  corridorGoldSpot.target.position.set(0, floorY, -76);
  group.add(corridorGoldSpot);
  group.add(corridorGoldSpot.target);

  const treasuryInnerSpot = new THREE.SpotLight(0xffd700, 4.2, 35, Math.PI / 2.8, 0.5);
  treasuryInnerSpot.position.set(0, 6.2, -94);
  treasuryInnerSpot.target.position.set(0, floorY, -100);
  group.add(treasuryInnerSpot);
  group.add(treasuryInnerSpot.target);

  // Vault Ceiling
  const vaultCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(vaultRoomWidth, vaultRoomLength),
    concreteWallMat
  );
  vaultCeiling.rotation.x = Math.PI / 2;
  vaultCeiling.position.set(0, ceilingY, vaultRoomCenterZ);
  group.add(vaultCeiling);

  // Left & Right Reinforced Steel Walls
  const vaultWallGeo = new THREE.PlaneGeometry(vaultRoomLength, ceilingY - floorY);
  const leftVaultWall = new THREE.Mesh(vaultWallGeo, darkBunkerSteelMat);
  leftVaultWall.rotation.y = Math.PI / 2;
  leftVaultWall.position.set(-vaultRoomWidth / 2, (floorY + ceilingY) / 2, vaultRoomCenterZ);
  group.add(leftVaultWall);

  const rightVaultWall = new THREE.Mesh(vaultWallGeo, darkBunkerSteelMat);
  rightVaultWall.rotation.y = -Math.PI / 2;
  rightVaultWall.position.set(vaultRoomWidth / 2, (floorY + ceilingY) / 2, vaultRoomCenterZ);
  group.add(rightVaultWall);

  // Heavy Duty Industrial Shelving Racks along left and right (flanking from corridor to deep sanctum)
  [-6.4, 6.4].forEach((rackX) => {
    for (let rz = -74; rz >= -116; rz -= 7.5) {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rackX, floorY, rz);

      // 4 Upright Steel Posts
      const postGeo = new THREE.BoxGeometry(0.12, 4.2, 0.12);
      [-1.1, 1.1].forEach((px) => {
        [-1.8, 1.8].forEach((pz) => {
          const post = new THREE.Mesh(postGeo, industrialShelfMat);
          post.position.set(px, 2.1, pz);
          rackGroup.add(post);
        });
      });

      // 3 Shelf Tiers
      for (let t = 1; t <= 3; t++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 3.8), industrialShelfMat);
        shelf.position.set(0, t * 1.1, 0);
        rackGroup.add(shelf);
      }

      group.add(rackGroup);
    }
  });

  // Modular Industrial Gold Transport Pallets with steel corner protectors (Matching Reference 2 layout)
  const palletPositions = [
    // Foreground Corridor Pallets in front of vault door (Z = -74 to -77)
    { x: -2.2, z: -74 },
    { x: 2.1, z: -76 },
    // Treasury Entrance behind 40-ton door
    { x: -3.2, z: -88 },
    { x: 3.0, z: -90 },
    { x: -2.8, z: -98 },
    { x: 2.8, z: -100 },
    { x: 0.0, z: -106 },
    { x: -2.5, z: -112 },
    { x: 2.5, z: -114 },
    { x: 0.0, z: -117 },
  ];

  palletPositions.forEach((pos) => {
    const pallet = createGoldTransportPallet();
    pallet.position.set(pos.x, floorY, pos.z);
    group.add(pallet);
  });

  // Centerpiece: Belgian Black Marble Treasury Display Plinth (Z = -101)
  const displayPlinth = createTreasuryDisplayPlinth();
  displayPlinth.position.set(0, floorY, -101);
  group.add(displayPlinth);

  // 3 Stamped Hero Bullion Bars arranged on the plinth
  [-0.32, 0, 0.32].forEach((xOff, i) => {
    const heroBar = createHeroGoldBullionBar();
    heroBar.position.set(xOff, floorY + 1.34, -101 + (i % 2 === 0 ? 0.04 : -0.04));
    heroBar.rotation.y = (i - 1) * 0.12;
    group.add(heroBar);
  });

  // Modular Stainless Safety Deposit Locker Wall (Covering back wall Z = -119.5)
  const lockerWall = createSafetyDepositLockerWall(8, 14);
  lockerWall.position.set(0, floorY, -119.2);
  group.add(lockerWall);

  // Carbon Financial Briefcases & Armored Cash Crates
  const briefcase1 = createSecureBriefcase();
  briefcase1.position.set(-2.5, floorY + 0.36, -91.6);
  briefcase1.rotation.y = 0.35;
  group.add(briefcase1);

  const briefcase2 = createSecureBriefcase();
  briefcase2.position.set(2.6, floorY + 0.36, -93.8);
  briefcase2.rotation.y = -0.28;
  group.add(briefcase2);

  const cashCrate1 = createCashSecurityCrate();
  cashCrate1.position.set(-6.6, floorY + 1.42, -96);
  group.add(cashCrate1);

  const cashCrate2 = createCashSecurityCrate();
  cashCrate2.position.set(6.6, floorY + 1.42, -104);
  group.add(cashCrate2);

  // --- 6. REALISTIC PBR GOLD BARS (THREE.InstancedMesh) ---
  // Standard 400 oz bullion bar dimensions (0.85m x 0.26m x 0.40m approx)
  const barGeo = new THREE.BoxGeometry(0.78, 0.22, 0.38);
  const totalGoldBars = 750;
  const goldBarsMesh = new THREE.InstancedMesh(barGeo, goldPBRMat, totalGoldBars);
  goldBarsMesh.castShadow = true;
  goldBarsMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let barIndex = 0;

  // Stacks on Pallets (Pyramid & multi-tier arrangement)
  palletPositions.forEach((palletPos) => {
    // 3 layers of bars
    const baseRows = 3;
    const baseCols = 4;
    for (let layer = 0; layer < 3; layer++) {
      const rows = baseRows - layer;
      const cols = baseCols - layer;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (barIndex >= totalGoldBars) break;
          const xOffset = palletPos.x + (c - (cols - 1) / 2) * 0.44;
          const yOffset = floorY + 0.22 + layer * 0.24 + 0.11;
          const zOffset = palletPos.z + (r - (rows - 1) / 2) * 0.82;

          dummy.position.set(xOffset, yOffset, zOffset);
          dummy.rotation.y = layer % 2 === 0 ? 0 : Math.PI / 2;
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();

          goldBarsMesh.setMatrixAt(barIndex, dummy.matrix);
          barIndex++;
        }
      }
    }
  });

  // Additional Stacks on the Industrial Shelving Racks (Corridor & Vault Shelves)
  [-6.4, 6.4].forEach((rackX) => {
    for (let rz = -74; rz >= -116; rz -= 7.5) {
      for (let tier = 1; tier <= 2; tier++) {
        for (let b = 0; b < 6; b++) {
          if (barIndex >= totalGoldBars) break;
          const bx = rackX + (b % 2 === 0 ? -0.4 : 0.4);
          const by = floorY + tier * 1.1 + 0.14;
          const bz = rz + (Math.floor(b / 2) - 1) * 0.85;

          dummy.position.set(bx, by, bz);
          dummy.rotation.y = 0;
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();

          goldBarsMesh.setMatrixAt(barIndex, dummy.matrix);
          barIndex++;
        }
      }
    }
  });

  goldBarsMesh.instanceMatrix.needsUpdate = true;
  group.add(goldBarsMesh);

  // --- 7. SECONDARY DEEP CHAMBER (Z = -120 to Z = -155) ---
  const deepLength = 35;
  const deepCenterZ = -137.5;

  // Deep Chamber Floor & Ceiling
  const deepFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(vaultRoomWidth, deepLength),
    new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.4, metalness: 0.3 })
  );
  deepFloor.rotation.x = -Math.PI / 2;
  deepFloor.position.set(0, floorY, deepCenterZ);
  group.add(deepFloor);

  const deepCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(vaultRoomWidth, deepLength),
    concreteWallMat
  );
  deepCeiling.rotation.x = Math.PI / 2;
  deepCeiling.position.set(0, ceilingY, deepCenterZ);
  group.add(deepCeiling);

  // Massive Safety Deposit Box Back Wall Grid (At Z = -155)
  const depositWallGeo = new THREE.BoxGeometry(vaultRoomWidth, ceilingY - floorY, 1.2);
  const depositWall = new THREE.Mesh(depositWallGeo, darkBunkerSteelMat);
  depositWall.position.set(0, (floorY + ceilingY) / 2, -155);
  group.add(depositWall);

  // Individual metallic safety deposit box panels
  const boxRows = 8;
  const boxCols = 16;
  const boxW = 0.95;
  const boxH = 0.55;
  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      const bx = -7.5 + c * 1.0;
      const by = floorY + 0.6 + r * 0.62;
      const boxDoor = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, 0.08), depositBoxMat);
      boxDoor.position.set(bx, by, -154.3);
      group.add(boxDoor);

      // Keyhole
      const keyhole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8),
        new THREE.MeshBasicMaterial({ color: 0x050505 })
      );
      keyhole.rotation.x = Math.PI / 2;
      keyhole.position.set(bx + 0.3, by, -154.24);
      group.add(keyhole);
    }
  }

  // Encrypted Server Drive Racks with Flashing LEDs (Z = -135, Left Wall)
  const serverRack = new THREE.Group();
  serverRack.position.set(-6.5, floorY, -135);
  const serverCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 2.2), darkBunkerSteelMat);
  serverCabinet.position.y = 2.25;
  serverRack.add(serverCabinet);

  // Server LED panels
  for (let s = 1; s <= 6; s++) {
    const led1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    led1.position.set(0.72, s * 0.6, -0.6);
    serverRack.add(led1);

    const led2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    led2.position.set(0.72, s * 0.6, -0.2);
    serverRack.add(led2);
  }
  group.add(serverRack);

  // Opened Tactical Heist Briefcases & Crates (Z = -130, Center Table)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(0, floorY, -130);
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.2), industrialShelfMat);
  tableTop.position.y = 1.2;
  tableGroup.add(tableTop);

  // Tactical Briefcase on table
  const caseBottom = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.22, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })
  );
  caseBottom.position.set(-0.8, 1.35, 0);
  tableGroup.add(caseBottom);

  const caseLid = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.22, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })
  );
  caseLid.position.set(-0.8, 1.55, -0.35);
  caseLid.rotation.x = -Math.PI / 2.8;
  tableGroup.add(caseLid);

  // Cash / Gold bundles inside briefcase
  const bundle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.45), brassTrimMat);
  bundle.position.set(-0.8, 1.38, 0);
  tableGroup.add(bundle);

  group.add(tableGroup);

  // --- 8. HERO GOLD BAR OBJECT POOL (28 Chamfered High-Gloss Bullion Bars) ---
  // Object pooling: instantiated strictly once at init. Zero runtime rAF allocations!
  const heroGoldGroup = new THREE.Group();
  group.add(heroGoldGroup);

  const heroGoldBars: THREE.Mesh[] = [];
  const heroBarGeo = new THREE.BoxGeometry(0.82, 0.26, 0.42);
  const heroGoldMat = new THREE.MeshStandardMaterial({
    color: 0xf5ba31,
    metalness: 0.99,
    roughness: 0.14,
    envMapIntensity: 2.2,
  });

  interface HeroBarPhysics {
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    rotAxis: THREE.Vector3;
    rotSpeed: number;
    arcHeight: number;
  }
  const heroBarsPhysics: HeroBarPhysics[] = [];

  // Generate 28 pooled hero bars
  for (let i = 0; i < 28; i++) {
    const bar = new THREE.Mesh(heroBarGeo, heroGoldMat);
    bar.castShadow = true;
    bar.receiveShadow = true;
    bar.visible = false;
    heroGoldGroup.add(bar);
    heroGoldBars.push(bar);

    const isCameraBurst = i < 14; // First 14 bars fly forward toward camera
    const startX = (Math.random() - 0.5) * 4.0;
    const startY = floorY + 0.3 + Math.random() * 2.5;
    const startZ = vaultDoorZ - 2.5 - Math.random() * 6.0;

    let targetX: number;
    let targetY: number;
    let targetZ: number;

    if (isCameraBurst) {
      // Tumble forward toward the camera across threshold into corridor
      targetX = (Math.random() - 0.5) * 5.0;
      targetY = floorY + 0.6 + Math.random() * 3.2;
      targetZ = vaultDoorZ + 12.0 + Math.random() * 10.0; // flies out to Z = -70 to -60
    } else {
      // Scatter and tumble across the viewport sides and floor
      targetX = (Math.random() - 0.5) * 9.5;
      targetY = floorY + 0.15; // settles on floor
      targetZ = vaultDoorZ + 2.0 + Math.random() * 8.0;
    }

    heroBarsPhysics.push({
      startPos: new THREE.Vector3(startX, startY, startZ),
      targetPos: new THREE.Vector3(targetX, targetY, targetZ),
      rotAxis: new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize(),
      rotSpeed: 4.0 + Math.random() * 8.0,
      arcHeight: 1.2 + Math.random() * 2.2,
    });
  }

  // --- 9. PNEUMATIC SEAL STEAM PUFFS (High-pressure decompression vapor) ---
  const steamPuffGroup = new THREE.Group();
  group.add(steamPuffGroup);

  const steamGeo = new THREE.SphereGeometry(0.35, 12, 10);
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const steamPuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const puff = new THREE.Mesh(steamGeo, steamMat.clone());
    puff.position.set(
      Math.cos(angle) * 3.8,
      (floorY + ceilingY) / 2 + Math.sin(angle) * 3.8,
      vaultDoorZ + 0.8
    );
    steamPuffGroup.add(puff);
    steamPuffs.push(puff);
  }

  // --- 10. MECHANICAL UNLOCKING SCRUBBER SEQUENCE ---
  // 1. Central combination dial rotates rapidly (p: 0.00 - 0.25)
  // 2. 12 radial locking bolts retract sequentially (p: 0.20 - 0.55)
  // 3. Central handwheel spins rapidly (p: 0.40 - 0.65)
  // 4. Pneumatic seal depressurizes (p: 0.50 - 0.68)
  // 5. 40-ton vault door swings open heavily (p: 0.65 - 1.0)
  // 6. Volumetric golden light floods outward (p: 0.66 - 1.0)
  // 7. Hero gold bars tumble forward out of treasury (p: 0.68 - 1.0)

  let lastRetractedCount = -1;
  let lastGoldBurstState = false;

  const setUnlockProgress = (progress: number): VaultUnlockResult => {
    const p = Math.max(0, Math.min(1, progress));
    let impactShake = 0;

    // Phase 1: Dial rotation
    const dialP = Math.min(1, p / 0.25);
    dialGroup.rotation.z = dialP * Math.PI * 5;

    // Phase 2: Sequential Bolt Retraction (12 bolts retract one after another)
    const boltStart = 0.20;
    const boltEnd = 0.55;
    const boltWindow = (boltEnd - boltStart) / bolts.length;

    let currentRetracted = 0;
    let newlyRetractedIndex: number | null = null;

    bolts.forEach((bolt, idx) => {
      const idxStart = boltStart + idx * boltWindow;
      const idxEnd = idxStart + boltWindow;
      const angle = (idx / bolts.length) * Math.PI * 2;

      let boltFraction = 0;
      if (p >= idxEnd) {
        boltFraction = 1;
        currentRetracted++;
      } else if (p > idxStart) {
        boltFraction = (p - idxStart) / boltWindow;
      }

      // Inward retraction distance: 3.4 down to 2.85
      const currentDist = 3.4 - boltFraction * 0.55;
      bolt.position.set(Math.cos(angle) * currentDist, Math.sin(angle) * currentDist, 0);
    });

    if (currentRetracted > lastRetractedCount) {
      newlyRetractedIndex = currentRetracted - 1;
      lastRetractedCount = currentRetracted;
      impactShake = 0.04; // Micro shake on each bolt retraction click
    } else if (currentRetracted < lastRetractedCount) {
      lastRetractedCount = currentRetracted;
    }

    // Phase 3: Handwheel rapid spin (p: 0.40 to 0.65)
    let handwheelSpinning = false;
    if (p > 0.40 && p <= 0.68) {
      const wheelP = Math.min(1, (p - 0.40) / 0.25);
      handWheel.rotation.z = -wheelP * Math.PI * 4;
      handwheelSpinning = true;
    } else if (p > 0.68) {
      handWheel.rotation.z = -Math.PI * 4;
    } else {
      handWheel.rotation.z = 0;
    }

    // Phase 4: Pneumatic seal release & steam puffs (p: 0.50 to 0.68)
    let pneumaticReleased = false;
    if (p >= 0.52 && p <= 0.68) {
      pneumaticReleased = true;
      const steamP = (p - 0.52) / 0.16;
      const scale = 1.0 + steamP * 2.8;
      const alpha = Math.sin(steamP * Math.PI) * 0.45;
      steamPuffs.forEach((puff) => {
        puff.scale.set(scale, scale, scale);
        (puff.material as THREE.MeshBasicMaterial).opacity = alpha;
      });
      if (steamP > 0.4 && steamP < 0.6) {
        impactShake = Math.max(impactShake, 0.06);
      }
    } else {
      steamPuffs.forEach((puff) => {
        (puff.material as THREE.MeshBasicMaterial).opacity = 0;
      });
    }

    // Phase 5 & 6: Door Swing Open & Warm Golden Light Spill (p: 0.65 to 1.0)
    let doorOpened = false;
    let goldBurstTriggered = false;

    if (p > 0.65) {
      const openP = Math.min(1, (p - 0.65) / 0.35);
      // Heavy slow swing: up to -78 degrees
      doorHinge.rotation.y = -openP * (Math.PI * 0.43);
      doorOpened = true;

      // Extend hydraulic actuator rod with door swing
      hydraulicPiston.setStroke(openP);
      terminalAsset.updateStatus('GRANTED');

      if (!lastGoldBurstState) {
        goldBurstTriggered = true;
        lastGoldBurstState = true;
        impactShake = 0.12; // Heavy door break-away clank shake!
      }

      // Golden light floods dramatically outward
      goldSpillLight.intensity = openP * 14.0;
      goldSpotLight.intensity = openP * 9.5;

      // Phase 7: Hero gold bars tumble and cascade outward!
      const burstP = Math.min(1, openP * 1.35);
      heroGoldBars.forEach((bar, i) => {
        const phys = heroBarsPhysics[i];
        bar.visible = true;

        // Position: interpolate start to target + parabolic arc
        const currentP = Math.min(1, Math.max(0, burstP - i * 0.015));
        bar.position.lerpVectors(phys.startPos, phys.targetPos, currentP);
        bar.position.y += Math.sin(currentP * Math.PI) * phys.arcHeight;

        // 3D rotation tumbling
        bar.rotation.x = phys.rotAxis.x * currentP * phys.rotSpeed;
        bar.rotation.y = phys.rotAxis.y * currentP * phys.rotSpeed;
        bar.rotation.z = phys.rotAxis.z * currentP * phys.rotSpeed;
      });
    } else {
      doorHinge.rotation.y = 0;
      goldSpillLight.intensity = 0;
      goldSpotLight.intensity = 0;
      lastGoldBurstState = false;
      hydraulicPiston.setStroke(0);
      terminalAsset.updateStatus(p > 0.02 ? 'LOCKED' : 'LOCKED');

      // Reset hero gold bars
      heroGoldBars.forEach((bar, i) => {
        bar.visible = false;
        bar.position.copy(heroBarsPhysics[i].startPos);
      });
    }

    return {
      boltIndexRetracted: newlyRetractedIndex,
      doorOpened,
      pneumaticReleased,
      handwheelSpinning,
      goldBurstTriggered,
      impactShake,
    };
  };

  const update = (time: number) => {
    // Subtle breathing pulse of gold light inside vault
    if (goldSpillLight.intensity > 1) {
      goldSpillLight.intensity += Math.sin(time * 3) * 0.4;
    }
    // Subtle hover/shimmer for hero bars when active
    heroGoldBars.forEach((bar, idx) => {
      if (bar.visible) {
        bar.rotation.y += Math.sin(time * 2 + idx) * 0.005;
      }
    });
    // Update emergency warning beacons & surveillance camera
    warningLightLeft.update(time);
    warningLightRight.update(time);
    cctvVault.update(time);
  };

  return {
    group,
    doorHinge,
    handWheel,
    dialGroup,
    bolts,
    goldSpillLight,
    goldSpotLight,
    goldBarsMesh,
    heroGoldBars,
    terminalAsset,
    cctvVault,
    setUnlockProgress,
    update,
  };
}
