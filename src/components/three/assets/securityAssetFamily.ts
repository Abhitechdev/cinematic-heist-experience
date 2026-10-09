import * as THREE from 'three';
import { vaultMaterials } from './vaultAssetFamily';

// ============================================================================
// 06 — CCTV CAMERA ASSET (Active pan/tilt tracking)
// ============================================================================
export interface CCTVCameraAssetObject {
  group: THREE.Group;
  panJoint: THREE.Group;
  tiltJoint: THREE.Group;
  recordingLed: THREE.Mesh;
  trackTarget: (targetPos: THREE.Vector3) => void;
  update: (time: number) => void;
}

export function createCCTVCamera(): CCTVCameraAssetObject {
  const group = new THREE.Group();

  // Ceiling/Wall Base Mounting Flange
  const mountBaseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.06, 24);
  const mountBase = new THREE.Mesh(mountBaseGeo, vaultMaterials.castSteelBunker);
  group.add(mountBase);

  // Mounting Arm Drop Stem
  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16);
  const arm = new THREE.Mesh(armGeo, vaultMaterials.darkGunmetal);
  arm.position.y = -0.18;
  group.add(arm);

  // Motorized Pan Joint (Rotates around Y)
  const panJoint = new THREE.Group();
  panJoint.position.y = -0.35;
  group.add(panJoint);

  const panHubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 20);
  const panHub = new THREE.Mesh(panHubGeo, vaultMaterials.darkGunmetal);
  panJoint.add(panHub);

  // Tilt Joint (Rotates around X)
  const tiltJoint = new THREE.Group();
  tiltJoint.position.set(0, -0.06, 0);
  panJoint.add(tiltJoint);

  // Camera Body Casing (Weatherproof surveillance housing)
  const cameraBodyGeo = new THREE.BoxGeometry(0.18, 0.16, 0.42);
  const cameraBody = new THREE.Mesh(cameraBodyGeo, vaultMaterials.darkGunmetal);
  cameraBody.position.z = 0.08;
  tiltJoint.add(cameraBody);

  // Brushed Aluminum Sunshield / Top Hood
  const hoodGeo = new THREE.BoxGeometry(0.2, 0.02, 0.46);
  const hood = new THREE.Mesh(hoodGeo, vaultMaterials.brushedSteel);
  hood.position.set(0, 0.09, 0.08);
  tiltJoint.add(hood);

  // Optical Lens Bezel & Glass Lens Element
  const lensBezelGeo = new THREE.CylinderGeometry(0.07, 0.075, 0.05, 24);
  const lensBezel = new THREE.Mesh(lensBezelGeo, vaultMaterials.polishedChrome);
  lensBezel.rotation.x = Math.PI / 2;
  lensBezel.position.set(0, 0, 0.31);
  tiltJoint.add(lensBezel);

  const lensGlassGeo = new THREE.SphereGeometry(0.055, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const lensGlass = new THREE.Mesh(lensGlassGeo, vaultMaterials.blackGlass);
  lensGlass.rotation.x = -Math.PI / 2;
  lensGlass.position.set(0, 0, 0.33);
  tiltJoint.add(lensGlass);

  // Active Red Recording LED
  const ledGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12);
  const recordingLed = new THREE.Mesh(ledGeo, vaultMaterials.redEmissive);
  recordingLed.rotation.x = Math.PI / 2;
  recordingLed.position.set(-0.06, 0.05, 0.3);
  tiltJoint.add(recordingLed);

  // Tracking function with smooth interpolation toward a world coordinate
  const currentPanTarget = { y: 0 };
  const currentTiltTarget = { x: 0 };

  const trackTarget = (targetPos: THREE.Vector3) => {
    // Compute local relative offset
    const worldPos = new THREE.Vector3();
    group.getWorldPosition(worldPos);

    const dx = targetPos.x - worldPos.x;
    const dy = targetPos.y - worldPos.y;
    const dz = targetPos.z - worldPos.z;

    const angleY = Math.atan2(dx, dz);
    const distXZ = Math.sqrt(dx * dx + dz * dz);
    const angleX = -Math.atan2(dy, distXZ);

    currentPanTarget.y = angleY;
    currentTiltTarget.x = THREE.MathUtils.clamp(angleX, -0.6, 0.6);
  };

  const update = (_time: number) => {
    panJoint.rotation.y += (currentPanTarget.y - panJoint.rotation.y) * 0.06;
    tiltJoint.rotation.x += (currentTiltTarget.x - tiltJoint.rotation.x) * 0.06;
  };

  return {
    group,
    panJoint,
    tiltJoint,
    recordingLed,
    trackTarget,
    update,
  };
}

// ============================================================================
// 07 — SECURITY ACCESS TERMINAL ASSET (Lobby / Corridor Wall)
// ============================================================================
export interface SecurityAccessTerminalAssetObject {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  statusLed: THREE.Mesh;
}

export function createSecurityAccessTerminal(): SecurityAccessTerminalAssetObject {
  const group = new THREE.Group();

  // Slim Beveled Wall Mount Chassis
  const chassisGeo = new THREE.BoxGeometry(0.24, 0.42, 0.05);
  const chassis = new THREE.Mesh(chassisGeo, vaultMaterials.darkGunmetal);
  group.add(chassis);

  // Brushed Steel Faceplate
  const plateGeo = new THREE.BoxGeometry(0.22, 0.4, 0.01);
  const plate = new THREE.Mesh(plateGeo, vaultMaterials.brushedSteel);
  plate.position.z = 0.03;
  group.add(plate);

  // OLED Access Screen
  const screenGeo = new THREE.PlaneGeometry(0.18, 0.12);
  const screenMat = new THREE.MeshBasicMaterial({
    color: 0x081018,
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0.09, 0.036);
  group.add(screenMesh);

  // Keycard Magnetic Swipe Slot (Right Edge)
  const slotGeo = new THREE.BoxGeometry(0.012, 0.28, 0.015);
  const slot = new THREE.Mesh(slotGeo, vaultMaterials.castSteelBunker);
  slot.position.set(0.095, -0.04, 0.035);
  group.add(slot);

  // Biometric Thumb Reader Ring
  const thumbRingGeo = new THREE.TorusGeometry(0.035, 0.006, 12, 24);
  const thumbRing = new THREE.Mesh(thumbRingGeo, vaultMaterials.machinedBronze);
  thumbRing.position.set(-0.02, -0.08, 0.036);
  group.add(thumbRing);

  // Status LED Bar
  const ledGeo = new THREE.BoxGeometry(0.14, 0.008, 0.005);
  const statusLed = new THREE.Mesh(ledGeo, vaultMaterials.redEmissive);
  statusLed.position.set(0, 0.165, 0.036);
  group.add(statusLed);

  return {
    group,
    screenMesh,
    statusLed,
  };
}

// ============================================================================
// 08 — SECURITY BLAST DOOR ASSET (Hydraulic sliding bulkhead)
// ============================================================================
export interface SecurityBlastDoorAssetObject {
  group: THREE.Group;
  doorPanelLeft: THREE.Group;
  doorPanelRight: THREE.Group;
  setOpenProgress: (t: number) => void; // 0 = closed, 1 = opened
}

export function createSecurityBlastDoor(): SecurityBlastDoorAssetObject {
  const group = new THREE.Group();

  // Heavy Outer Steel Frame / Portal Header
  const frameTopGeo = new THREE.BoxGeometry(6.2, 0.6, 0.5);
  const frameTop = new THREE.Mesh(frameTopGeo, vaultMaterials.castSteelBunker);
  frameTop.position.y = 4.2;
  group.add(frameTop);

  [-2.9, 2.9].forEach((x) => {
    const jambGeo = new THREE.BoxGeometry(0.5, 4.4, 0.5);
    const jamb = new THREE.Mesh(jambGeo, vaultMaterials.castSteelBunker);
    jamb.position.set(x, 2.0, 0);
    group.add(jamb);
  });

  // Left Door Leaf
  const doorPanelLeft = new THREE.Group();
  doorPanelLeft.position.set(-1.35, 2.0, 0);
  group.add(doorPanelLeft);

  const leafGeo = new THREE.BoxGeometry(2.7, 4.0, 0.22);
  const leafLeft = new THREE.Mesh(leafGeo, vaultMaterials.darkGunmetal);
  doorPanelLeft.add(leafLeft);

  // Chevron Stiffener Ribs on door
  for (let y = -1.2; y <= 1.2; y += 0.8) {
    const ribGeo = new THREE.BoxGeometry(2.4, 0.12, 0.04);
    const rib = new THREE.Mesh(ribGeo, vaultMaterials.brushedSteel);
    rib.position.set(0, y, 0.13);
    doorPanelLeft.add(rib);
  }

  // Right Door Leaf
  const doorPanelRight = new THREE.Group();
  doorPanelRight.position.set(1.35, 2.0, 0);
  group.add(doorPanelRight);

  const leafRight = new THREE.Mesh(leafGeo, vaultMaterials.darkGunmetal);
  doorPanelRight.add(leafRight);

  for (let y = -1.2; y <= 1.2; y += 0.8) {
    const ribGeo = new THREE.BoxGeometry(2.4, 0.12, 0.04);
    const rib = new THREE.Mesh(ribGeo, vaultMaterials.brushedSteel);
    rib.position.set(0, y, 0.13);
    doorPanelRight.add(rib);
  }

  // Warning Hazard Light on Portal Header
  const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16);
  const beacon = new THREE.Mesh(beaconGeo, vaultMaterials.amberEmissive);
  beacon.position.set(0, 4.6, 0.15);
  group.add(beacon);

  const setOpenProgress = (t: number) => {
    // Slide left leaf leftward (-1.35 to -3.8), right leaf rightward (1.35 to 3.8)
    doorPanelLeft.position.x = -1.35 - t * 2.45;
    doorPanelRight.position.x = 1.35 + t * 2.45;
  };

  return {
    group,
    doorPanelLeft,
    doorPanelRight,
    setOpenProgress,
  };
}

// ============================================================================
// 09 — SECURITY LASER EMITTER ASSET
// ============================================================================
export interface SecurityLaserEmitterAssetObject {
  group: THREE.Group;
  emitterLenses: THREE.Mesh[];
}

export function createSecurityLaserEmitter(): SecurityLaserEmitterAssetObject {
  const group = new THREE.Group();

  // Mounting Stanchion / Wall Plate
  const plateGeo = new THREE.BoxGeometry(0.18, 0.55, 0.06);
  const plate = new THREE.Mesh(plateGeo, vaultMaterials.castSteelBunker);
  group.add(plate);

  // Extruded Heat Sink Enclosure
  const housingGeo = new THREE.BoxGeometry(0.14, 0.48, 0.18);
  const housing = new THREE.Mesh(housingGeo, vaultMaterials.darkGunmetal);
  housing.position.z = 0.11;
  group.add(housing);

  // Heat Sink Cooling Fins
  for (let y = -0.18; y <= 0.18; y += 0.06) {
    const finGeo = new THREE.BoxGeometry(0.16, 0.012, 0.08);
    const fin = new THREE.Mesh(finGeo, vaultMaterials.brushedSteel);
    fin.position.set(0, y, 0.22);
    group.add(fin);
  }

  // Dual Laser Collimator Apertures (Brass barrels with red emissive diodes)
  const emitterLenses: THREE.Mesh[] = [];
  [-0.12, 0.12].forEach((y) => {
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.08, 16);
    const barrel = new THREE.Mesh(barrelGeo, vaultMaterials.machinedBronze);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, y, 0.24);
    group.add(barrel);

    const diodeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.02, 12);
    const diode = new THREE.Mesh(diodeGeo, vaultMaterials.redEmissive);
    diode.rotation.x = Math.PI / 2;
    diode.position.set(0, y, 0.285);
    group.add(diode);
    emitterLenses.push(diode);
  });

  return {
    group,
    emitterLenses,
  };
}

// ============================================================================
// 10 — EMERGENCY RED WARNING LIGHT BEACON ASSET
// ============================================================================
export interface EmergencyWarningLightAssetObject {
  group: THREE.Group;
  domeMesh: THREE.Mesh;
  pointLight: THREE.PointLight;
  update: (time: number) => void;
}

export function createEmergencyWarningLight(): EmergencyWarningLightAssetObject {
  const group = new THREE.Group();

  // Cylindrical Heavy Steel Mounting Base
  const baseGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.08, 20);
  const base = new THREE.Mesh(baseGeo, vaultMaterials.castSteelBunker);
  group.add(base);

  // Red Faceted Fresnel Glass Dome
  const domeGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 20);
  const domeMesh = new THREE.Mesh(domeGeo, vaultMaterials.redEmissive);
  domeMesh.position.y = 0.14;
  group.add(domeMesh);

  // Protective Wire Guard Cage (4 vertical bars + top ring)
  const cageRingGeo = new THREE.TorusGeometry(0.145, 0.012, 8, 24);
  const cageRing = new THREE.Mesh(cageRingGeo, vaultMaterials.brushedSteel);
  cageRing.rotation.x = Math.PI / 2;
  cageRing.position.y = 0.24;
  group.add(cageRing);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const barGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8);
    const bar = new THREE.Mesh(barGeo, vaultMaterials.brushedSteel);
    bar.position.set(Math.cos(angle) * 0.145, 0.14, Math.sin(angle) * 0.145);
    group.add(bar);
  }

  // Dynamic Red Strobe Point Light
  const pointLight = new THREE.PointLight(0xff1515, 1.8, 12);
  pointLight.position.y = 0.18;
  group.add(pointLight);

  const update = (time: number) => {
    // Pulse light with urgent military strobe rhythm
    const strobe = (Math.sin(time * 6) + 1) * 0.5;
    pointLight.intensity = 0.4 + strobe * 1.8;
  };

  return {
    group,
    domeMesh,
    pointLight,
    update,
  };
}
