import * as THREE from 'three';
import { vaultMaterials } from './vaultAssetFamily';

// --- AUTHENTIC PBR GOLD MATERIAL DEFINITION ---
// Not yellow plastic: high metalness, low roughness, subtle warm specular reflection
export const treasuryMaterials = {
  pbrFineGold: new THREE.MeshStandardMaterial({
    color: 0xf5ba31,
    metalness: 0.98,
    roughness: 0.18,
  }),
  heroFineGold: new THREE.MeshStandardMaterial({
    color: 0xf7c244,
    metalness: 0.99,
    roughness: 0.14,
  }),
  industrialPalletWood: new THREE.MeshStandardMaterial({
    color: 0x302419,
    roughness: 0.88,
    metalness: 0.04,
  }),
  reinforcedCornerSteel: new THREE.MeshStandardMaterial({
    color: 0x1f2328,
    metalness: 0.9,
    roughness: 0.35,
  }),
  treasuryRackingSteel: new THREE.MeshStandardMaterial({
    color: 0x181a1e,
    metalness: 0.86,
    roughness: 0.42,
  }),
  safetyDepositStainless: new THREE.MeshStandardMaterial({
    color: 0x7a838f,
    metalness: 0.92,
    roughness: 0.24,
  }),
  belgianBlackMarble: new THREE.MeshStandardMaterial({
    color: 0x090a0d,
    roughness: 0.18,
    metalness: 0.3,
  }),
  briefcaseCarbon: new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.45,
    metalness: 0.6,
  }),
  cratePolymer: new THREE.MeshStandardMaterial({
    color: 0x221c17,
    roughness: 0.7,
    metalness: 0.2,
  }),
};

// ============================================================================
// 11 & 12 — GOLD BULLION BAR ASSETS (Background & Hero)
// ============================================================================
// Real-world 1kg London Good Delivery Bar: trapezoidal cross section ~ 11.5cm x 5.5cm x 3.5cm
export function createGoldBarGeometry(isHero: boolean = false): THREE.BufferGeometry {
  if (!isHero) {
    // Optimized standard chamfered box
    return new THREE.BoxGeometry(0.7, 0.25, 1.4);
  }
  // Hero Bar with trapezoidal taper
  // Top face narrower than bottom face
  const wTop = 0.62;
  const wBot = 0.72;
  const h = 0.26;
  const lTop = 1.32;
  const lBot = 1.44;

  const geo = new THREE.BufferGeometry();
  // 8 vertices of a trapezoidal frustum
  const halfWT = wTop / 2;
  const halfWB = wBot / 2;
  const halfLT = lTop / 2;
  const halfLB = lBot / 2;
  const halfH = h / 2;

  // prettier-ignore
  const vertices = new Float32Array([
    // Top face (y = +halfH)
    -halfWT,  halfH, -halfLT,   halfWT,  halfH, -halfLT,   halfWT,  halfH,  halfLT,  -halfWT,  halfH,  halfLT,
    // Bottom face (y = -halfH)
    -halfWB, -halfH, -halfLB,   halfWB, -halfH, -halfLB,   halfWB, -halfH,  halfLB,  -halfWB, -halfH,  halfLB,
  ]);

  // Triangular indices
  // prettier-ignore
  const indices = [
    // Top
    0, 1, 2,  0, 2, 3,
    // Bottom
    5, 4, 7,  5, 7, 6,
    // Front (z = +)
    3, 2, 6,  3, 6, 7,
    // Back (z = -)
    1, 0, 4,  1, 4, 5,
    // Left (x = -)
    0, 3, 7,  0, 7, 4,
    // Right (x = +)
    2, 1, 5,  2, 5, 6,
  ];

  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createHeroGoldBullionBar(): THREE.Group {
  const group = new THREE.Group();
  const geo = createGoldBarGeometry(true);
  const barMesh = new THREE.Mesh(geo, treasuryMaterials.heroFineGold);
  barMesh.castShadow = true;
  group.add(barMesh);

  // Stamped Inscription Plate on top face
  // "999.9 FINE GOLD // 1000g // BANK OF SPAIN"
  const stampCanvas = document.createElement('canvas');
  stampCanvas.width = 256;
  stampCanvas.height = 128;
  const ctx = stampCanvas.getContext('2d')!;
  ctx.fillStyle = '#f7c244';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#a67215';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('999.9 FINE GOLD', 128, 42);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('1000g // RESERVA', 128, 72);
  ctx.font = '14px monospace';
  ctx.fillText('ES-2807-X', 128, 98);

  // Stamped border
  ctx.strokeStyle = '#a67215';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 232, 104);

  const stampTexture = new THREE.CanvasTexture(stampCanvas);
  const stampMat = new THREE.MeshStandardMaterial({
    map: stampTexture,
    metalness: 0.98,
    roughness: 0.22,
  });

  const stampMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.24), stampMat);
  stampMesh.rotation.x = -Math.PI / 2;
  stampMesh.position.y = 0.132;
  group.add(stampMesh);

  return group;
}

// ============================================================================
// 13 — GOLD TRANSPORT PALLET ASSET
// ============================================================================
export function createGoldTransportPallet(): THREE.Group {
  const group = new THREE.Group();
  const palletW = 2.4;
  const palletL = 3.2;
  const palletH = 0.32;

  // Top Deck Slats (7 wooden planks)
  for (let i = 0; i < 7; i++) {
    const plankGeo = new THREE.BoxGeometry(palletW, 0.05, 0.34);
    const plank = new THREE.Mesh(plankGeo, treasuryMaterials.industrialPalletWood);
    plank.position.set(0, palletH - 0.025, -palletL / 2 + 0.25 + i * 0.45);
    group.add(plank);
  }

  // 3 Longitudinal Stringer Runners
  [-palletW / 2 + 0.15, 0, palletW / 2 - 0.15].forEach((x) => {
    const stringerGeo = new THREE.BoxGeometry(0.18, 0.2, palletL);
    const stringer = new THREE.Mesh(stringerGeo, treasuryMaterials.industrialPalletWood);
    stringer.position.set(x, palletH / 2, 0);
    group.add(stringer);
  });

  // Reinforced Heavy Steel Corner Brackets with Hex Rivets
  const cornerPositions = [
    [-palletW / 2, -palletL / 2],
    [palletW / 2, -palletL / 2],
    [-palletW / 2, palletL / 2],
    [palletW / 2, palletL / 2],
  ];
  cornerPositions.forEach(([x, z]) => {
    const bracketGeo = new THREE.BoxGeometry(0.18, palletH + 0.02, 0.18);
    const bracket = new THREE.Mesh(bracketGeo, treasuryMaterials.reinforcedCornerSteel);
    bracket.position.set(x, palletH / 2, z);
    group.add(bracket);
  });

  return group;
}

// ============================================================================
// 14 — TREASURY STEEL STORAGE RACK / SHELF ASSET
// ============================================================================
export function createTreasurySteelShelf(): THREE.Group {
  const group = new THREE.Group();
  const shelfW = 5.4;
  const shelfH = 4.8;
  const shelfD = 1.4;

  // 4 Corner Vertical Slotted Uprights
  const uprightPositions = [
    [-shelfW / 2, -shelfD / 2],
    [shelfW / 2, -shelfD / 2],
    [-shelfW / 2, shelfD / 2],
    [shelfW / 2, shelfD / 2],
  ];
  uprightPositions.forEach(([x, z]) => {
    const postGeo = new THREE.BoxGeometry(0.12, shelfH, 0.12);
    const post = new THREE.Mesh(postGeo, treasuryMaterials.treasuryRackingSteel);
    post.position.set(x, shelfH / 2, z);
    group.add(post);
  });

  // 4 Heavy-Duty Storage Tiers / Levels
  for (let lvl = 1; lvl <= 4; lvl++) {
    const y = lvl * 1.1;

    // Shelf Deck Platform
    const deckGeo = new THREE.BoxGeometry(shelfW, 0.08, shelfD);
    const deck = new THREE.Mesh(deckGeo, treasuryMaterials.treasuryRackingSteel);
    deck.position.set(0, y, 0);
    group.add(deck);

    // Front/Rear Load Beams
    [-shelfD / 2, shelfD / 2].forEach((z) => {
      const beamGeo = new THREE.BoxGeometry(shelfW + 0.08, 0.12, 0.06);
      const beam = new THREE.Mesh(beamGeo, vaultMaterials.brushedSteel);
      beam.position.set(0, y - 0.04, z);
      group.add(beam);
    });
  }

  // Cross Diagonal Bracing on rear
  const braceGeo = new THREE.CylinderGeometry(0.02, 0.02, Math.sqrt(shelfW * shelfW + shelfH * shelfH), 8);
  const brace1 = new THREE.Mesh(braceGeo, vaultMaterials.castSteelBunker);
  brace1.rotation.z = Math.atan2(shelfH, shelfW);
  brace1.position.set(0, shelfH / 2, -shelfD / 2);
  group.add(brace1);

  return group;
}

// ============================================================================
// 15 — SAFETY DEPOSIT LOCKER WALL ASSET
// ============================================================================
export function createSafetyDepositLockerWall(rows: number = 6, cols: number = 8): THREE.Group {
  const group = new THREE.Group();
  const boxW = 0.42;
  const boxH = 0.28;
  const boxD = 0.65;

  const totalW = cols * boxW;
  const totalH = rows * boxH;

  // Solid Backing Enclosure
  const enclosureGeo = new THREE.BoxGeometry(totalW + 0.1, totalH + 0.1, boxD);
  const enclosure = new THREE.Mesh(enclosureGeo, vaultMaterials.castSteelBunker);
  enclosure.position.set(0, totalH / 2, -boxD / 2);
  group.add(enclosure);

  // Instanced Stainless Faceplates & Keyholes
  const lockerFaceGeo = new THREE.BoxGeometry(boxW - 0.015, boxH - 0.015, 0.02);
  const keyholeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -totalW / 2 + boxW / 2 + c * boxW;
      const y = boxH / 2 + r * boxH;

      const door = new THREE.Mesh(lockerFaceGeo, treasuryMaterials.safetyDepositStainless);
      door.position.set(x, y, 0.01);
      group.add(door);

      // Dual Keyholes (Bank Custodian + Client Keyway)
      [-0.08, 0.08].forEach((kx) => {
        const keyhole = new THREE.Mesh(keyholeGeo, vaultMaterials.darkGunmetal);
        keyhole.rotation.x = Math.PI / 2;
        keyhole.position.set(x + kx, y, 0.025);
        group.add(keyhole);
      });
    }
  }

  return group;
}

// ============================================================================
// 20 — SECURE FINANCIAL BRIEFCASE ASSET
// ============================================================================
export function createSecureBriefcase(): THREE.Group {
  const group = new THREE.Group();

  // Carbon Fiber Hard Shell Case (48cm x 36cm x 14cm)
  const shellGeo = new THREE.BoxGeometry(0.48, 0.36, 0.14);
  const shell = new THREE.Mesh(shellGeo, treasuryMaterials.briefcaseCarbon);
  group.add(shell);

  // Brushed Aluminum Perimeter Frame
  const frameGeo = new THREE.BoxGeometry(0.49, 0.37, 0.02);
  const frame = new THREE.Mesh(frameGeo, vaultMaterials.brushedSteel);
  group.add(frame);

  // Dual Latches with Combination Wheels
  [-0.14, 0.14].forEach((x) => {
    const latchGeo = new THREE.BoxGeometry(0.04, 0.06, 0.02);
    const latch = new THREE.Mesh(latchGeo, vaultMaterials.polishedChrome);
    latch.position.set(x, 0.18, 0.06);
    group.add(latch);
  });

  // Ergonomic Steel Handle
  const handleGeo = new THREE.TorusGeometry(0.06, 0.014, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, vaultMaterials.brushedSteel);
  handle.position.set(0, 0.22, 0);
  group.add(handle);

  return group;
}

// ============================================================================
// 21 — CASH SECURITY CRATE ASSET
// ============================================================================
export function createCashSecurityCrate(): THREE.Group {
  const group = new THREE.Group();
  const w = 0.85;
  const h = 0.55;
  const d = 0.65;

  // Armored Composite Crate Body
  const bodyGeo = new THREE.BoxGeometry(w, h, d);
  const body = new THREE.Mesh(bodyGeo, treasuryMaterials.cratePolymer);
  group.add(body);

  // Reinforced Corner Ribs
  for (let dx of [-1, 1]) {
    for (let dz of [-1, 1]) {
      const ribGeo = new THREE.BoxGeometry(0.08, h + 0.02, 0.08);
      const rib = new THREE.Mesh(ribGeo, vaultMaterials.castSteelBunker);
      rib.position.set(dx * (w / 2 - 0.03), 0, dz * (d / 2 - 0.03));
      group.add(rib);
    }
  }

  // Steel Butterfly Latches
  [-0.22, 0.22].forEach((x) => {
    const latchGeo = new THREE.BoxGeometry(0.08, 0.08, 0.03);
    const latch = new THREE.Mesh(latchGeo, vaultMaterials.machinedBronze);
    latch.position.set(x, 0, d / 2 + 0.015);
    group.add(latch);
  });

  return group;
}

// ============================================================================
// 23 — GOLD TREASURY DISPLAY PLINTH ASSET
// ============================================================================
export function createTreasuryDisplayPlinth(): THREE.Group {
  const group = new THREE.Group();

  // Honed Belgian Black Marble Column Pedestal
  const columnGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
  const column = new THREE.Mesh(columnGeo, treasuryMaterials.belgianBlackMarble);
  column.position.y = 0.6;
  group.add(column);

  // Brushed Bronze Base & Top Moldings
  [0.04, 1.22].forEach((y) => {
    const moldingGeo = new THREE.BoxGeometry(1.72, 0.08, 1.72);
    const molding = new THREE.Mesh(moldingGeo, vaultMaterials.machinedBronze);
    molding.position.y = y;
    group.add(molding);
  });

  // Recessed Golden Perimeter Uplight
  const uplight = new THREE.PointLight(0xffbe3b, 1.5, 6);
  uplight.position.set(0, 1.35, 0);
  group.add(uplight);

  return group;
}
