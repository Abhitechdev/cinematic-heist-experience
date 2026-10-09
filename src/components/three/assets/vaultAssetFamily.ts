import * as THREE from 'three';

// --- SHARED PBR MATERIALS FOR VAULT ASSET FAMILY ---
// All assets share these materials to minimize draw calls and ensure unified art direction
export const vaultMaterials = {
  darkGunmetal: new THREE.MeshStandardMaterial({
    color: 0x1f2329,
    metalness: 0.88,
    roughness: 0.32,
  }),
  brushedSteel: new THREE.MeshStandardMaterial({
    color: 0x8a929e,
    metalness: 0.94,
    roughness: 0.22,
  }),
  polishedChrome: new THREE.MeshStandardMaterial({
    color: 0xdce2ec,
    metalness: 0.98,
    roughness: 0.1,
  }),
  castSteelBunker: new THREE.MeshStandardMaterial({
    color: 0x15181c,
    metalness: 0.82,
    roughness: 0.52,
  }),
  machinedBronze: new THREE.MeshStandardMaterial({
    color: 0xb58232,
    metalness: 0.92,
    roughness: 0.28,
  }),
  blackGlass: new THREE.MeshPhysicalMaterial({
    color: 0x050507,
    metalness: 0.2,
    roughness: 0.08,
    transmission: 0.2,
    thickness: 0.5,
  }),
  biometricScannerGlass: new THREE.MeshStandardMaterial({
    color: 0x0d2818,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
    metalness: 0.1,
    roughness: 0.15,
  }),
  keypadRubber: new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.75,
    metalness: 0.15,
  }),
  hydraulicHoseRubber: new THREE.MeshStandardMaterial({
    color: 0x0a0c0e,
    roughness: 0.85,
    metalness: 0.1,
  }),
  redEmissive: new THREE.MeshStandardMaterial({
    color: 0xff1e1e,
    emissive: 0xff1111,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  }),
  greenEmissive: new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  }),
  amberEmissive: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  }),
};

// ============================================================================
// 01 — VAULT PASSWORD TERMINAL ASSET
// ============================================================================
export interface VaultTerminalAssetObject {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  redLedMesh: THREE.Mesh;
  greenLedMesh: THREE.Mesh;
  updateStatus: (status: 'LOCKED' | 'DENIED' | 'GRANTED') => void;
}

export function createVaultPasswordTerminal(): VaultTerminalAssetObject {
  const group = new THREE.Group();

  // Wall Mount Bracket / Steel Standoff
  const bracketGeo = new THREE.BoxGeometry(0.52, 0.72, 0.04);
  const bracket = new THREE.Mesh(bracketGeo, vaultMaterials.castSteelBunker);
  bracket.position.z = -0.02;
  group.add(bracket);

  // Armored Gunmetal Body with beveled profile
  const bodyGeo = new THREE.BoxGeometry(0.46, 0.66, 0.09);
  const body = new THREE.Mesh(bodyGeo, vaultMaterials.darkGunmetal);
  body.position.z = 0.045;
  group.add(body);

  // Brushed Steel Front Bezel Frame
  const bezelGeo = new THREE.BoxGeometry(0.44, 0.64, 0.015);
  const bezel = new THREE.Mesh(bezelGeo, vaultMaterials.brushedSteel);
  bezel.position.z = 0.095;
  group.add(bezel);

  // Corner Hex Screws (4x)
  const screwGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6);
  const screwPositions = [
    [-0.2, 0.3],
    [0.2, 0.3],
    [-0.2, -0.3],
    [0.2, -0.3],
  ];
  screwPositions.forEach(([x, y]) => {
    const screw = new THREE.Mesh(screwGeo, vaultMaterials.polishedChrome);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, 0.105);
    group.add(screw);
  });

  // Dynamic Terminal Screen (Procedural Canvas Texture)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 256;
  const ctx = screenCanvas.getContext('2d')!;

  function drawScreen(status: 'LOCKED' | 'DENIED' | 'GRANTED') {
    ctx.fillStyle = '#06080b';
    ctx.fillRect(0, 0, 512, 256);

    // Scanline grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 512, 1);
    }

    // Top Header
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('SUB-VAULT 07 // BULKHEAD INTERFACE', 24, 42);

    // Divider
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 56);
    ctx.lineTo(488, 56);
    ctx.stroke();

    if (status === 'LOCKED') {
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText('ENTER ACCESS CODE', 24, 118);
      ctx.font = '28px monospace';
      ctx.fillStyle = '#c91414';
      ctx.fillText('[ _ _ _ _ _ _ ]', 24, 168);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('SECURITY SEAL: ARMED // PNEUMATIC LOCKS ENGAGED', 24, 218);
    } else if (status === 'DENIED') {
      ctx.font = 'bold 40px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('ACCESS DENIED', 24, 120);
      ctx.font = '22px monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText('ERR 0x7E: INVALID DIRECTIVE', 24, 168);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('WARNING: SURVEILLANCE NOTIFIED', 24, 218);
    } else {
      ctx.font = 'bold 40px monospace';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('ACCESS GRANTED', 24, 120);
      ctx.font = '22px monospace';
      ctx.fillStyle = '#86efac';
      ctx.fillText('DIRECTIVE AUTHORIZED: 2807', 24, 168);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText('DISENGAGING 12 RADIAL BOLTS...', 24, 218);
    }
  }

  drawScreen('LOCKED');

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.minFilter = THREE.LinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;

  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
  });

  const screenGeo = new THREE.PlaneGeometry(0.38, 0.2);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0.16, 0.106);
  group.add(screenMesh);

  // Keypad Housing Plate
  const keypadPlateGeo = new THREE.BoxGeometry(0.26, 0.22, 0.01);
  const keypadPlate = new THREE.Mesh(keypadPlateGeo, vaultMaterials.castSteelBunker);
  keypadPlate.position.set(-0.06, -0.11, 0.105);
  group.add(keypadPlate);

  // 12 Keypad Buttons (3 cols x 4 rows)
  const buttonGeo = new THREE.BoxGeometry(0.06, 0.038, 0.012);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const btn = new THREE.Mesh(buttonGeo, vaultMaterials.keypadRubber);
      const bx = -0.13 + col * 0.07 + 0.01;
      const by = -0.045 - row * 0.045;
      btn.position.set(bx, by, 0.115);
      group.add(btn);
    }
  }

  // Biometric Fingerprint Scanner (Right side)
  const scannerHousingGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.018, 24);
  const scannerHousing = new THREE.Mesh(scannerHousingGeo, vaultMaterials.darkGunmetal);
  scannerHousing.rotation.x = Math.PI / 2;
  scannerHousing.position.set(0.12, -0.06, 0.11);
  group.add(scannerHousing);

  const scannerGlassGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.005, 24);
  const scannerGlass = new THREE.Mesh(scannerGlassGeo, vaultMaterials.biometricScannerGlass);
  scannerGlass.rotation.x = Math.PI / 2;
  scannerGlass.position.set(0.12, -0.06, 0.12);
  group.add(scannerGlass);

  // Speaker Grille Slits (Below scanner)
  for (let s = 0; s < 5; s++) {
    const slitGeo = new THREE.BoxGeometry(0.08, 0.004, 0.005);
    const slit = new THREE.Mesh(slitGeo, vaultMaterials.castSteelBunker);
    slit.position.set(0.12, -0.13 - s * 0.012, 0.106);
    group.add(slit);
  }

  // Status LEDs (Flanking the screen)
  const ledGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.008, 12);

  const redLedMesh = new THREE.Mesh(ledGeo, vaultMaterials.redEmissive);
  redLedMesh.rotation.x = Math.PI / 2;
  redLedMesh.position.set(-0.17, 0.28, 0.108);
  group.add(redLedMesh);

  const greenLedMesh = new THREE.Mesh(ledGeo, vaultMaterials.castSteelBunker);
  greenLedMesh.rotation.x = Math.PI / 2;
  greenLedMesh.position.set(0.17, 0.28, 0.108);
  group.add(greenLedMesh);

  // Armored Steel Conduit / Wiring Pipe running from bottom
  const conduitGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.4, 16);
  const conduit = new THREE.Mesh(conduitGeo, vaultMaterials.brushedSteel);
  conduit.position.set(0, -0.48, 0.04);
  group.add(conduit);

  const updateStatus = (status: 'LOCKED' | 'DENIED' | 'GRANTED') => {
    drawScreen(status);
    screenTexture.needsUpdate = true;
    if (status === 'GRANTED') {
      redLedMesh.material = vaultMaterials.castSteelBunker;
      greenLedMesh.material = vaultMaterials.greenEmissive;
    } else if (status === 'DENIED') {
      redLedMesh.material = vaultMaterials.redEmissive;
      greenLedMesh.material = vaultMaterials.castSteelBunker;
    } else {
      redLedMesh.material = vaultMaterials.redEmissive;
      greenLedMesh.material = vaultMaterials.castSteelBunker;
    }
  };

  return {
    group,
    screenMesh,
    redLedMesh,
    greenLedMesh,
    updateStatus,
  };
}

// ============================================================================
// 02 — HEAVY-DUTY VAULT HANDWHEEL ASSET
// ============================================================================
export interface VaultHandwheelAssetObject {
  group: THREE.Group;
  wheelPivot: THREE.Group;
  setRotation: (angleRad: number) => void;
}

export function createVaultHandwheel(): VaultHandwheelAssetObject {
  const group = new THREE.Group();

  // Mounting Flange / Thrust Bearing Base
  const baseFlangeGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.12, 32);
  const baseFlange = new THREE.Mesh(baseFlangeGeo, vaultMaterials.castSteelBunker);
  baseFlange.rotation.x = Math.PI / 2;
  group.add(baseFlange);

  // Wheel Pivot Group (Centered at 0,0,0 for exact rotation)
  const wheelPivot = new THREE.Group();
  wheelPivot.position.z = 0.08;
  group.add(wheelPivot);

  // Central Bronze Gear Hub
  const bronzeHubGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.22, 28);
  const bronzeHub = new THREE.Mesh(bronzeHubGeo, vaultMaterials.machinedBronze);
  bronzeHub.rotation.x = Math.PI / 2;
  wheelPivot.add(bronzeHub);

  // Steel Center Hub Cap with Locking Bolt Pattern
  const hubCapGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.24, 24);
  const hubCap = new THREE.Mesh(hubCapGeo, vaultMaterials.darkGunmetal);
  hubCap.rotation.x = Math.PI / 2;
  hubCap.position.z = 0.02;
  wheelPivot.add(hubCap);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6),
      vaultMaterials.polishedChrome
    );
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0.14);
    wheelPivot.add(bolt);
  }

  // Heavy Outer Ring / Rim (Toroid)
  const outerRimGeo = new THREE.TorusGeometry(1.22, 0.09, 16, 48);
  const outerRim = new THREE.Mesh(outerRimGeo, vaultMaterials.darkGunmetal);
  wheelPivot.add(outerRim);

  // Inner Accent Ring (Polished Steel)
  const innerRimGeo = new THREE.TorusGeometry(1.08, 0.03, 12, 48);
  const innerRim = new THREE.Mesh(innerRimGeo, vaultMaterials.brushedSteel);
  innerRim.position.z = 0.02;
  wheelPivot.add(innerRim);

  // 4 Monumental Radial Spokes + Knurled Machine Handles
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 2.3, 16),
      vaultMaterials.brushedSteel
    );
    spoke.rotation.z = angle;
    wheelPivot.add(spoke);

    // Turned Machined Grip Handles on outer rim
    const handleStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.28, 12),
      vaultMaterials.polishedChrome
    );
    handleStem.rotation.x = Math.PI / 2;
    handleStem.position.set(Math.cos(angle) * 1.22, Math.sin(angle) * 1.22, 0.14);
    wheelPivot.add(handleStem);

    const handleGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.24, 16),
      vaultMaterials.machinedBronze
    );
    handleGrip.rotation.x = Math.PI / 2;
    handleGrip.position.set(Math.cos(angle) * 1.22, Math.sin(angle) * 1.22, 0.26);
    wheelPivot.add(handleGrip);
  }

  const setRotation = (angleRad: number) => {
    wheelPivot.rotation.z = angleRad;
  };

  return {
    group,
    wheelPivot,
    setRotation,
  };
}

// ============================================================================
// 03 — VAULT LOCKING BOLT ASSET (Instanceable 12x)
// ============================================================================
export interface VaultLockingBoltAssetObject {
  group: THREE.Group;
  boltMesh: THREE.Mesh;
  housingGroup: THREE.Group;
  setExtension: (t: number) => void; // 0 = retracted, 1 = extended
}

export function createLockingBolt(): VaultLockingBoltAssetObject {
  const group = new THREE.Group();

  // Sleeve Guide Housing (Fixed to door plate)
  const housingGroup = new THREE.Group();
  group.add(housingGroup);

  const housingGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.6, 20);
  const housing = new THREE.Mesh(housingGeo, vaultMaterials.castSteelBunker);
  housing.rotation.z = Math.PI / 2;
  housingGroup.add(housing);

  // Mounting Flange with Hex Studs
  const flangeGeo = new THREE.BoxGeometry(0.55, 0.38, 0.08);
  const flange = new THREE.Mesh(flangeGeo, vaultMaterials.darkGunmetal);
  housingGroup.add(flange);

  // Precision Ground Linear Sliding Bolt
  // Origin at base so translating along X directly extends/retracts
  const boltGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.95, 24);
  const boltMesh = new THREE.Mesh(boltGeo, vaultMaterials.polishedChrome);
  boltMesh.rotation.z = Math.PI / 2;
  boltMesh.position.x = 0.35; // Default extended
  group.add(boltMesh);

  // Hardened Chamfered Nose Cap
  const noseCapGeo = new THREE.ConeGeometry(0.18, 0.12, 24);
  const noseCap = new THREE.Mesh(noseCapGeo, vaultMaterials.brushedSteel);
  noseCap.rotation.z = -Math.PI / 2;
  noseCap.position.y = 0.52; // Tip of bolt cylinder
  boltMesh.add(noseCap);

  // Locking Collar Ring with Grease Groove
  const collarGeo = new THREE.TorusGeometry(0.19, 0.02, 12, 24);
  const collar = new THREE.Mesh(collarGeo, vaultMaterials.machinedBronze);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = -0.2;
  boltMesh.add(collar);

  const setExtension = (t: number) => {
    // t = 1: extended (x = 0.35), t = 0: retracted (x = -0.15)
    boltMesh.position.x = -0.15 + t * 0.5;
  };

  return {
    group,
    boltMesh,
    housingGroup,
    setExtension,
  };
}

// ============================================================================
// 04 — VAULT HYDRAULIC PISTON ASSET
// ============================================================================
export interface VaultHydraulicPistonAssetObject {
  group: THREE.Group;
  cylinderMesh: THREE.Mesh;
  rodMesh: THREE.Mesh;
  setStroke: (t: number) => void; // 0 = retracted, 1 = extended
}

export function createHydraulicPiston(): VaultHydraulicPistonAssetObject {
  const group = new THREE.Group();

  // Base Mounting Clevis Bracket
  const clevisBaseGeo = new THREE.BoxGeometry(0.28, 0.28, 0.22);
  const clevisBase = new THREE.Mesh(clevisBaseGeo, vaultMaterials.castSteelBunker);
  group.add(clevisBase);

  // Pivot Pin (Cross bolt)
  const pinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.34, 16);
  const pin = new THREE.Mesh(pinGeo, vaultMaterials.polishedChrome);
  pin.rotation.z = Math.PI / 2;
  group.add(pin);

  // Hydraulic Barrel Cylinder (Fixed casing)
  const cylinderGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.4, 24);
  const cylinderMesh = new THREE.Mesh(cylinderGeo, vaultMaterials.darkGunmetal);
  cylinderMesh.position.y = 0.8;
  group.add(cylinderMesh);

  // Cylinder End Caps with Pressure Rings
  const endCapGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.12, 24);
  const bottomCap = new THREE.Mesh(endCapGeo, vaultMaterials.castSteelBunker);
  bottomCap.position.y = 0.16;
  group.add(bottomCap);

  const topCap = new THREE.Mesh(endCapGeo, vaultMaterials.castSteelBunker);
  topCap.position.y = 1.46;
  group.add(topCap);

  // High-Pressure Swivel Fittings (Brass)
  const fittingGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const port1 = new THREE.Mesh(fittingGeo, vaultMaterials.machinedBronze);
  port1.position.set(0.16, 0.3, 0);
  group.add(port1);

  const port2 = new THREE.Mesh(fittingGeo, vaultMaterials.machinedBronze);
  port2.position.set(0.16, 1.3, 0);
  group.add(port2);

  // Hydraulic Flexible Hose running along barrel
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.16, 0.3, 0),
    new THREE.Vector3(0.22, 0.8, 0.05),
    new THREE.Vector3(0.16, 1.3, 0),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 16, 0.02, 8, false);
  const hose = new THREE.Mesh(hoseGeo, vaultMaterials.hydraulicHoseRubber);
  group.add(hose);

  // Sliding Hard Chrome Plated Piston Rod
  const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 24);
  const rodMesh = new THREE.Mesh(rodGeo, vaultMaterials.polishedChrome);
  rodMesh.position.y = 1.5; // Stroke position
  group.add(rodMesh);

  // Rod Eyelet End (Attaches to door)
  const rodEyeGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.18, 16);
  const rodEye = new THREE.Mesh(rodEyeGeo, vaultMaterials.castSteelBunker);
  rodEye.rotation.x = Math.PI / 2;
  rodEye.position.y = 0.6; // Top of rod
  rodMesh.add(rodEye);

  const setStroke = (t: number) => {
    // t = 0 (retracted): y = 1.3, t = 1 (extended): y = 1.95
    rodMesh.position.y = 1.3 + t * 0.65;
  };

  return {
    group,
    cylinderMesh,
    rodMesh,
    setStroke,
  };
}

// ============================================================================
// 05 — MONUMENTAL VAULT HINGE ASSET
// ============================================================================
export interface VaultHingeAssetObject {
  group: THREE.Group;
  hingePinMesh: THREE.Mesh;
}

export function createVaultHinge(): VaultHingeAssetObject {
  const group = new THREE.Group();

  // Wall-Side Hinge Bracket Block
  const wallBracketGeo = new THREE.BoxGeometry(0.65, 3.2, 0.8);
  const wallBracket = new THREE.Mesh(wallBracketGeo, vaultMaterials.castSteelBunker);
  wallBracket.position.set(-0.35, 0, 0);
  group.add(wallBracket);

  // Mounting Studs into concrete portal
  for (let y = -1.2; y <= 1.2; y += 0.6) {
    const stud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6),
      vaultMaterials.polishedChrome
    );
    stud.rotation.z = Math.PI / 2;
    stud.position.set(-0.68, y, 0);
    group.add(stud);
  }

  // Heavy Hinge Barrel Knuckles (Dual shear brackets)
  const knuckleGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.75, 28);
  const topKnuckle = new THREE.Mesh(knuckleGeo, vaultMaterials.darkGunmetal);
  topKnuckle.position.y = 1.0;
  group.add(topKnuckle);

  const bottomKnuckle = new THREE.Mesh(knuckleGeo, vaultMaterials.darkGunmetal);
  bottomKnuckle.position.y = -1.0;
  group.add(bottomKnuckle);

  // Center Door-Side Knuckle
  const centerKnuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.95, 28), vaultMaterials.brushedSteel);
  centerKnuckle.position.y = 0;
  group.add(centerKnuckle);

  // Solid Forged Chrome Hinge Pin running through entire assembly
  const pinGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.4, 32);
  const hingePinMesh = new THREE.Mesh(pinGeo, vaultMaterials.polishedChrome);
  group.add(hingePinMesh);

  // Machined Bronze Thrust Bushings between knuckles
  [-0.5, 0.5].forEach((y) => {
    const bushing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.08, 28),
      vaultMaterials.machinedBronze
    );
    bushing.position.y = y;
    group.add(bushing);
  });

  return {
    group,
    hingePinMesh,
  };
}
