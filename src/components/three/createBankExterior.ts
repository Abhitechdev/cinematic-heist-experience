import * as THREE from 'three';

export interface BankExteriorObject {
  group: THREE.Group;
  leftDoor: THREE.Group;
  rightDoor: THREE.Group;
  redBeaconLight: THREE.PointLight;
  beaconMesh: THREE.Mesh;
  setDoorOpenProgress: (progress: number) => void;
  update: (time: number) => void;
}

export function createBankExterior(): BankExteriorObject {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // --- REUSABLE MATERIALS ---
  const agedStoneMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c1e,
    roughness: 0.88,
    metalness: 0.12,
  });

  const darkGraniteMat = new THREE.MeshStandardMaterial({
    color: 0x0f1012,
    roughness: 0.82,
    metalness: 0.2,
  });

  const columnStoneMat = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.75,
    metalness: 0.15,
  });

  const bronzeMetalMat = new THREE.MeshStandardMaterial({
    color: 0x3d3122,
    metalness: 0.85,
    roughness: 0.35,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x121417,
    roughness: 0.7,
    metalness: 0.3,
  });

  // Warm glowing interior windows
  const warmWindowMat = new THREE.MeshBasicMaterial({
    color: 0xffb347,
  });

  const darkWindowMat = new THREE.MeshStandardMaterial({
    color: 0x070b10,
    metalness: 0.9,
    roughness: 0.1,
  });

  const redBeaconMat = new THREE.MeshBasicMaterial({
    color: 0xff1a1a,
  });

  // Wet pavement with specular sheen
  const wetPavementMat = new THREE.MeshStandardMaterial({
    color: 0x090a0c,
    roughness: 0.28,
    metalness: 0.45,
  });

  // --- 1. COURTYARD & GROUND ---
  const groundGeo = new THREE.PlaneGeometry(120, 100);
  const ground = new THREE.Mesh(groundGeo, wetPavementMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, 30);
  ground.receiveShadow = true;
  group.add(ground);

  // Grand Entrance Steps (Podium / Stylobate)
  const stepsCount = 7;
  for (let s = 0; s < stepsCount; s++) {
    const stepWidth = 44 + (stepsCount - s) * 0.8;
    const stepDepth = 2.4;
    const stepHeight = 0.28;
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMesh = new THREE.Mesh(stepGeo, darkGraniteMat);
    stepMesh.position.set(0, s * stepHeight, 3.2 - s * 0.6);
    group.add(stepMesh);
  }

  const porchY = stepsCount * 0.28; // ~1.96

  // --- 2. MAIN CENTRAL PORTICO & FACADE ---
  // Central Main Hall Behind Columns
  const mainWallGeo = new THREE.BoxGeometry(32, 16, 8);
  const mainWall = new THREE.Mesh(mainWallGeo, agedStoneMat);
  mainWall.position.set(0, porchY + 8, -4);
  group.add(mainWall);

  // Portico Entablature (Architrave & Frieze)
  const entablatureGeo = new THREE.BoxGeometry(28, 2.2, 7.5);
  const entablature = new THREE.Mesh(entablatureGeo, columnStoneMat);
  entablature.position.set(0, porchY + 13.5, 0);
  group.add(entablature);

  // Classical Triangular Pediment
  const pedimentShape = new THREE.Shape();
  pedimentShape.moveTo(-14, 0);
  pedimentShape.lineTo(0, 4.2);
  pedimentShape.lineTo(14, 0);
  pedimentShape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 4.5,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.3,
    bevelSegments: 2,
  };
  const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, extrudeSettings);
  const pediment = new THREE.Mesh(pedimentGeo, columnStoneMat);
  pediment.position.set(0, porchY + 14.6, -1.8);
  group.add(pediment);

  // Pediment Tympanum Relief Inscription Band
  const reliefBandGeo = new THREE.BoxGeometry(16, 0.9, 0.4);
  const reliefBand = new THREE.Mesh(reliefBandGeo, darkTrimMat);
  reliefBand.position.set(0, porchY + 15.6, 2.9);
  group.add(reliefBand);

  // --- 3. MONUMENTAL FLUTED COLUMNS (8 Columns in Hexastyle/Octastyle) ---
  const columnPositions = [-11.5, -8.2, -4.9, -1.8, 1.8, 4.9, 8.2, 11.5];
  const columnHeight = 11.4;
  const colShaftGeo = new THREE.CylinderGeometry(0.72, 0.82, columnHeight, 20);
  const colCapGeo = new THREE.BoxGeometry(2.1, 0.9, 2.1);
  const colBaseGeo = new THREE.BoxGeometry(2.2, 0.7, 2.2);

  columnPositions.forEach((colX) => {
    // Column Group
    const colGroup = new THREE.Group();
    colGroup.position.set(colX, porchY, 2.8);

    // Base
    const base = new THREE.Mesh(colBaseGeo, columnStoneMat);
    base.position.set(0, 0.35, 0);
    colGroup.add(base);

    // Shaft
    const shaft = new THREE.Mesh(colShaftGeo, columnStoneMat);
    shaft.position.set(0, 0.7 + columnHeight / 2, 0);
    colGroup.add(shaft);

    // Capital
    const cap = new THREE.Mesh(colCapGeo, columnStoneMat);
    cap.position.set(0, 0.7 + columnHeight + 0.45, 0);
    colGroup.add(cap);

    group.add(colGroup);
  });

  // --- 4. GRAND BRONZE ENTRANCE PORTAL & DOORS ---
  const portalFrameGeo = new THREE.BoxGeometry(6.6, 7.8, 1.2);
  const portalFrame = new THREE.Mesh(portalFrameGeo, darkTrimMat);
  portalFrame.position.set(0, porchY + 3.9, 0.1);
  group.add(portalFrame);

  // Symmetrical Double Bronze Doors (will slide/swing open as camera approaches)
  const leftDoor = new THREE.Group();
  leftDoor.position.set(-1.45, porchY, 0.4);
  const leftDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.8, 0.2), bronzeMetalMat);
  leftDoorLeaf.position.set(0.7, 3.4, 0);
  leftDoor.add(leftDoorLeaf);
  // Door stud details
  for (let r = 1; r <= 5; r++) {
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), bronzeMetalMat);
    stud.rotation.x = Math.PI / 2;
    stud.position.set(0.7, r * 1.1, 0.12);
    leftDoor.add(stud);
  }
  group.add(leftDoor);

  const rightDoor = new THREE.Group();
  rightDoor.position.set(1.45, porchY, 0.4);
  const rightDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.8, 0.2), bronzeMetalMat);
  rightDoorLeaf.position.set(-0.7, 3.4, 0);
  rightDoor.add(rightDoorLeaf);
  for (let r = 1; r <= 5; r++) {
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), bronzeMetalMat);
    stud.rotation.x = Math.PI / 2;
    stud.position.set(-0.7, r * 1.1, 0.12);
    rightDoor.add(stud);
  }
  group.add(rightDoor);

  // Entrance Transom Arch over Door
  const transomGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16, 1, false, 0, Math.PI);
  const transom = new THREE.Mesh(transomGeo, bronzeMetalMat);
  transom.rotation.z = Math.PI / 2;
  transom.rotation.y = Math.PI / 2;
  transom.position.set(0, porchY + 6.8, 0.35);
  group.add(transom);

  // --- 5. EAST & WEST WINGS (Symmetrical Multi-story with Glowing Windows) ---
  const wingWidth = 32;
  const wingHeight = 18;
  const wingDepth = 12;
  const wingGeo = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);

  // West Wing (-32)
  const westWing = new THREE.Mesh(wingGeo, agedStoneMat);
  westWing.position.set(-32, porchY + wingHeight / 2 - 1, -2);
  group.add(westWing);

  // East Wing (+32)
  const eastWing = new THREE.Mesh(wingGeo, agedStoneMat);
  eastWing.position.set(32, porchY + wingHeight / 2 - 1, -2);
  group.add(eastWing);

  // Multi-tier Balustrade & Cornice across wings
  [-32, 32].forEach((wingX) => {
    const corniceGeo = new THREE.BoxGeometry(wingWidth + 2, 0.9, wingDepth + 1);
    const cornice = new THREE.Mesh(corniceGeo, darkTrimMat);
    cornice.position.set(wingX, porchY + wingHeight - 0.5, -2);
    group.add(cornice);
  });

  // Symmetrical Window Grids on East & West Wings
  const windowRows = 3;
  const windowCols = 5;
  const winW = 2.4;
  const winH = 3.6;
  const winFrameGeo = new THREE.BoxGeometry(winW, winH, 0.3);
  const winGlassGeo = new THREE.PlaneGeometry(winW - 0.3, winH - 0.3);

  [-32, 32].forEach((wingCenter) => {
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const winX = wingCenter - 10 + col * 5.0;
        const winY = porchY + 2.5 + row * 4.8;
        const winZ = 4.05;

        // Window frame
        const frame = new THREE.Mesh(winFrameGeo, darkTrimMat);
        frame.position.set(winX, winY, winZ);
        group.add(frame);

        // Window glass (randomized warm interior glow vs dark office)
        const isLit = (row + col) % 3 !== 0;
        const glass = new THREE.Mesh(winGlassGeo, isLit ? warmWindowMat : darkWindowMat);
        glass.position.set(winX, winY, winZ + 0.16);
        group.add(glass);
      }
    }
  });

  // --- 6. ROOFTOP STRUCTURE & CENTRAL DOME / RED BEACON ---
  const roofBlockGeo = new THREE.BoxGeometry(22, 3.5, 14);
  const roofBlock = new THREE.Mesh(roofBlockGeo, darkGraniteMat);
  roofBlock.position.set(0, porchY + 19, -4);
  group.add(roofBlock);

  // Roof Balustrade / Spire
  const spireGeo = new THREE.CylinderGeometry(0.12, 0.6, 6.0, 8);
  const spire = new THREE.Mesh(spireGeo, darkTrimMat);
  spire.position.set(0, porchY + 23.5, -4);
  group.add(spire);

  // Red Security Warning Strobe on Spire Tip
  const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), redBeaconMat);
  beaconMesh.position.set(0, porchY + 26.5, -4);
  group.add(beaconMesh);

  const redBeaconLight = new THREE.PointLight(0xff1a1a, 2.5, 45);
  redBeaconLight.position.set(0, porchY + 26.5, -4);
  group.add(redBeaconLight);

  // --- 7. STREET LEVEL ENVIRONMENT & COURTYARD OBJECTS ---
  // Courtyard Security Bollards
  const bollardGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 12);
  const bollardCapGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const bollardMat = bronzeMetalMat;

  for (let b = -18; b <= 18; b += 4) {
    if (Math.abs(b) < 3.5) continue; // Gap for central entrance walkway
    const bollard = new THREE.Group();
    bollard.position.set(b, 0.5, 12);
    const post = new THREE.Mesh(bollardGeo, bollardMat);
    const cap = new THREE.Mesh(bollardCapGeo, bollardMat);
    cap.position.y = 0.55;
    bollard.add(post);
    bollard.add(cap);
    group.add(bollard);
  }

  // Classical Street Lamps (Casting pools of light on wet ground)
  [-16, 16].forEach((lampX) => {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(lampX, 0, 22);

    const postGeo = new THREE.CylinderGeometry(0.15, 0.25, 6.5, 12);
    const post = new THREE.Mesh(postGeo, darkTrimMat);
    post.position.y = 3.25;
    lampGroup.add(post);

    const headGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
    const head = new THREE.Mesh(headGeo, bronzeMetalMat);
    head.position.y = 6.6;
    lampGroup.add(head);

    const lampLight = new THREE.PointLight(0xffb86c, 1.8, 18);
    lampLight.position.y = 6.4;
    lampGroup.add(lampLight);

    group.add(lampGroup);
  });

  // Silhouetted Urban Trees Framing the Courtyard
  const treePositions = [
    { x: -36, z: 18 },
    { x: -42, z: 28 },
    { x: 36, z: 18 },
    { x: 42, z: 28 },
  ];

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.95 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x07110c, roughness: 0.9 });

  treePositions.forEach((pos) => {
    const tree = new THREE.Group();
    tree.position.set(pos.x, 0, pos.z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 6, 8), barkMat);
    trunk.position.y = 3;
    tree.add(trunk);

    const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 1), foliageMat);
    foliage1.position.y = 6.8;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), foliageMat);
    foliage2.position.y = 9.2;
    tree.add(foliage2);

    group.add(tree);
  });

  // --- DOOR OPENING CONTROL ---
  // Doors slide outward and pivot slightly open
  const setDoorOpenProgress = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));
    // Left door slides left
    leftDoor.position.x = -1.45 - p * 1.8;
    leftDoor.rotation.y = -p * 0.45;

    // Right door slides right
    rightDoor.position.x = 1.45 + p * 1.8;
    rightDoor.rotation.y = p * 0.45;
  };

  // --- PER-FRAME UPDATE ---
  const update = (time: number) => {
    // Red beacon periodic double flash
    const strobe = (Math.sin(time * 5.5) + Math.sin(time * 11)) > 0.8 ? 1 : 0.15;
    redBeaconLight.intensity = 1.5 + strobe * 3.5;
  };

  return {
    group,
    leftDoor,
    rightDoor,
    redBeaconLight,
    beaconMesh,
    setDoorOpenProgress,
    update,
  };
}
