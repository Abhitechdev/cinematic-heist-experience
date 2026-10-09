import * as THREE from 'three';
import { vaultMaterials } from './vaultAssetFamily';

// ============================================================================
// 16 — 42U DATA SERVER RACK ASSET
// ============================================================================
export interface ServerRackAssetObject {
  group: THREE.Group;
  leds: THREE.Mesh[];
  update: (time: number) => void;
}

export function createServerRack(): ServerRackAssetObject {
  const group = new THREE.Group();
  const rackW = 0.9;
  const rackH = 2.2;
  const rackD = 1.1;

  // Outer Steel Enclosure Frame
  const frameGeo = new THREE.BoxGeometry(rackW, rackH, rackD);
  const frame = new THREE.Mesh(frameGeo, vaultMaterials.darkGunmetal);
  frame.position.y = rackH / 2;
  group.add(frame);

  // Perforated Front Glass/Mesh Door
  const doorGeo = new THREE.PlaneGeometry(rackW - 0.08, rackH - 0.08);
  const doorMat = new THREE.MeshPhysicalMaterial({
    color: 0x050608,
    metalness: 0.5,
    roughness: 0.2,
    transmission: 0.4,
    transparent: true,
    opacity: 0.85,
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, rackH / 2, rackD / 2 + 0.005);
  group.add(door);

  // Server Blades & Blinking Activity LEDs
  const leds: THREE.Mesh[] = [];
  const bladeGeo = new THREE.BoxGeometry(rackW - 0.12, 0.08, 0.02);
  const ledGeo = new THREE.BoxGeometry(0.012, 0.012, 0.01);

  for (let u = 0; u < 14; u++) {
    const y = 0.25 + u * 0.13;
    const blade = new THREE.Mesh(bladeGeo, vaultMaterials.castSteelBunker);
    blade.position.set(0, y, rackD / 2 - 0.03);
    group.add(blade);

    // Activity LEDs per blade
    for (let l = 0; l < 4; l++) {
      const ledMat = l === 0 ? vaultMaterials.greenEmissive : l === 1 ? vaultMaterials.amberEmissive : vaultMaterials.brushedSteel;
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.3 + l * 0.03, y, rackD / 2 - 0.015);
      group.add(led);
      if (l < 2) leds.push(led);
    }
  }

  const update = (time: number) => {
    // Random network packet flickering
    leds.forEach((led, idx) => {
      const flicker = Math.sin(time * 12 + idx * 3.7) > 0.1;
      led.visible = flicker;
    });
  };

  return {
    group,
    leds,
    update,
  };
}

// ============================================================================
// 17 — BANK SURVEILLANCE MONITOR ARRAY ASSET
// ============================================================================
export function createBankMonitor(): THREE.Group {
  const group = new THREE.Group();

  // Desktop Stanchion / Articulated Dual-Arm Stand
  const baseGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.03, 20);
  const base = new THREE.Mesh(baseGeo, vaultMaterials.castSteelBunker);
  group.add(base);

  const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 16);
  const post = new THREE.Mesh(postGeo, vaultMaterials.darkGunmetal);
  post.position.y = 0.28;
  group.add(post);

  // Monitor Housing (Bezel)
  const bezelGeo = new THREE.BoxGeometry(0.72, 0.44, 0.04);
  const bezel = new THREE.Mesh(bezelGeo, vaultMaterials.darkGunmetal);
  bezel.position.set(0, 0.46, 0.03);
  group.add(bezel);

  // Active Surveillance CCTV Grid Screen (Canvas)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const ctx = screenCanvas.getContext('2d')!;

  ctx.fillStyle = '#050a08';
  ctx.fillRect(0, 0, 512, 320);

  // 4 surveillance feed quadrants
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 240, 144);
  ctx.strokeRect(264, 8, 240, 144);
  ctx.strokeRect(8, 168, 240, 144);
  ctx.strokeRect(264, 168, 240, 144);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText('CAM 01 // LOBBY PERIMETER', 16, 28);
  ctx.fillText('CAM 02 // SEC CORRIDOR', 272, 28);
  ctx.fillText('CAM 03 // BULKHEAD 07', 16, 188);
  ctx.fillText('CAM 04 // VAULT PORTAL', 272, 188);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });

  const screenGeo = new THREE.PlaneGeometry(0.68, 0.4);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.46, 0.052);
  group.add(screen);

  return group;
}

// ============================================================================
// 18 — BANK TELLER COUNTER ASSET
// ============================================================================
export function createBankTellerCounter(): THREE.Group {
  const group = new THREE.Group();
  const counterW = 3.8;
  const counterH = 1.15;
  const counterD = 1.2;

  // Dark Marquina Marble Counter Base
  const baseGeo = new THREE.BoxGeometry(counterW, counterH, counterD);
  const base = new THREE.Mesh(
    baseGeo,
    new THREE.MeshStandardMaterial({
      color: 0x0a0c0f,
      roughness: 0.25,
      metalness: 0.35,
    })
  );
  base.position.y = counterH / 2;
  group.add(base);

  // Polished Black Marble Top Ledge
  const topLedgeGeo = new THREE.BoxGeometry(counterW + 0.15, 0.08, counterD + 0.15);
  const topLedge = new THREE.Mesh(
    topLedgeGeo,
    new THREE.MeshStandardMaterial({
      color: 0x14181f,
      roughness: 0.15,
      metalness: 0.4,
    })
  );
  topLedge.position.y = counterH + 0.04;
  group.add(topLedge);

  // Bulletproof Bronze Security Grille Frame
  const glassFrameGeo = new THREE.BoxGeometry(counterW - 0.2, 1.4, 0.06);
  const glassFrame = new THREE.Mesh(glassFrameGeo, vaultMaterials.machinedBronze);
  glassFrame.position.set(0, counterH + 0.78, 0.15);
  group.add(glassFrame);

  // Heavy Ballistic Glass Pane
  const glassPaneGeo = new THREE.PlaneGeometry(counterW - 0.4, 1.25);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x081014,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.65,
    transparent: true,
    opacity: 0.85,
  });
  const glassPane = new THREE.Mesh(glassPaneGeo, glassMat);
  glassPane.position.set(0, counterH + 0.78, 0.185);
  group.add(glassPane);

  // Teller Speech Diaphragm & Transaction Pass-Through Scoop
  const scoopGeo = new THREE.BoxGeometry(0.48, 0.06, 0.35);
  const scoop = new THREE.Mesh(scoopGeo, vaultMaterials.brushedSteel);
  scoop.position.set(0, counterH + 0.08, 0.15);
  group.add(scoop);

  return group;
}

// ============================================================================
// 19 — METAL DETECTOR ARCHWAY ASSET
// ============================================================================
export function createMetalDetector(): THREE.Group {
  const group = new THREE.Group();
  const archW = 1.2;
  const archH = 2.4;
  const archD = 0.55;

  // Left & Right Detection Columns
  [-archW / 2, archW / 2].forEach((x) => {
    const colGeo = new THREE.BoxGeometry(0.14, archH, archD);
    const col = new THREE.Mesh(colGeo, vaultMaterials.darkGunmetal);
    col.position.set(x, archH / 2, 0);
    group.add(col);

    // Multi-Zone Threat Level LED Bar on front edge
    for (let z = 0; z < 8; z++) {
      const ledGeo = new THREE.BoxGeometry(0.015, 0.18, 0.01);
      const ledMat = z > 5 ? vaultMaterials.redEmissive : vaultMaterials.greenEmissive;
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(x + (x > 0 ? -0.065 : 0.065), 0.3 + z * 0.24, archD / 2 + 0.005);
      group.add(led);
    }
  });

  // Top Header Transceiver Crossbar
  const headerGeo = new THREE.BoxGeometry(archW + 0.14, 0.24, archD);
  const header = new THREE.Mesh(headerGeo, vaultMaterials.darkGunmetal);
  header.position.set(0, archH + 0.12, 0);
  group.add(header);

  // Status Indicator on Header
  const statusGeo = new THREE.PlaneGeometry(0.24, 0.08);
  const statusMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const statusMesh = new THREE.Mesh(statusGeo, statusMat);
  statusMesh.position.set(0, archH + 0.12, archD / 2 + 0.006);
  group.add(statusMesh);

  return group;
}

// ============================================================================
// 22 — INDUSTRIAL PIPE & CONDUIT KIT ASSET
// ============================================================================
export function createIndustrialPipeKit(length: number = 8.0): THREE.Group {
  const group = new THREE.Group();

  // Primary Heavy High-Pressure Steel Pipe
  const mainPipeGeo = new THREE.CylinderGeometry(0.12, 0.12, length, 24);
  const mainPipe = new THREE.Mesh(mainPipeGeo, vaultMaterials.castSteelBunker);
  mainPipe.rotation.z = Math.PI / 2;
  group.add(mainPipe);

  // Flanged Joint Collars every 2 meters
  const count = Math.floor(length / 2);
  for (let i = -count / 2; i <= count / 2; i++) {
    const flangeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24);
    const flange = new THREE.Mesh(flangeGeo, vaultMaterials.darkGunmetal);
    flange.rotation.z = Math.PI / 2;
    flange.position.x = i * 2.0;
    group.add(flange);
  }

  // Secondary Pneumatic Tube (Machined Bronze)
  const pneuPipeGeo = new THREE.CylinderGeometry(0.06, 0.06, length, 16);
  const pneuPipe = new THREE.Mesh(pneuPipeGeo, vaultMaterials.machinedBronze);
  pneuPipe.rotation.z = Math.PI / 2;
  pneuPipe.position.set(0, -0.22, 0.08);
  group.add(pneuPipe);

  // Analog Bourdon Tube Pressure Gauge
  const gaugeBodyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
  const gaugeBody = new THREE.Mesh(gaugeBodyGeo, vaultMaterials.brushedSteel);
  gaugeBody.rotation.x = Math.PI / 2;
  gaugeBody.position.set(0, 0.24, 0);
  group.add(gaugeBody);

  const gaugeDialGeo = new THREE.CircleGeometry(0.1, 24);
  const gaugeDial = new THREE.Mesh(
    gaugeDialGeo,
    new THREE.MeshBasicMaterial({ color: 0xefede6 })
  );
  gaugeDial.position.set(0, 0.24, 0.035);
  group.add(gaugeDial);

  return group;
}
