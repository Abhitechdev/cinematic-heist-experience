import * as THREE from 'three';

export interface BlimpAirshipObject {
  group: THREE.Group;
  hatchPosition: THREE.Vector3;
  update: (time: number, deltaTime: number) => void;
}

export function createBlimpAirship(): BlimpAirshipObject {
  const group = new THREE.Group();
  group.name = 'BlimpAirship';

  // Base World Coordinates for the blimp (high above the escape zone)
  const baseX = 0;
  const baseY = 72;
  const baseZ = -115;
  group.position.set(baseX, baseY, baseZ);

  // --- 1. MATERIALS ---
  // Matte composite titanium airship skin
  const envelopeMat = new THREE.MeshStandardMaterial({
    color: 0xdae2eb,
    roughness: 0.38,
    metalness: 0.22,
  });

  // Dark gunmetal underside & structure
  const darkGunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x181c22,
    roughness: 0.45,
    metalness: 0.85,
  });

  // Deep crimson resistance accent
  const resistanceRedMat = new THREE.MeshStandardMaterial({
    color: 0xba1414,
    roughness: 0.3,
    metalness: 0.5,
  });

  // Tinted cockpit glass
  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0a1018,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x1e293b,
    emissiveIntensity: 0.3,
  });

  // Navigation strobe red
  const strobeMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff0000,
    emissiveIntensity: 2.0,
  });

  // --- 2. STREAMLINED AIRSHIP ENVELOPE (HULL) ---
  // Create an aerodynamic dirigible envelope using LatheGeometry
  // Length ~ 54m, Diameter ~ 16m
  const points: THREE.Vector2[] = [];
  const segments = 24;
  const totalLength = 54;
  const maxRadius = 7.8;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 (nose) to 1 (tail)
    const z = (t - 0.42) * totalLength; // Nose at -22.7, Tail at +31.3

    // Aerodynamic dirigible thickness distribution
    let r = 0;
    if (t < 0.4) {
      // Blunt elliptical nose
      const nt = t / 0.4;
      r = Math.sqrt(Math.max(0, 1 - Math.pow(1 - nt, 2))) * maxRadius;
    } else {
      // Slender streamlined tail taper
      const tt = (t - 0.4) / 0.6;
      r = (1 - Math.pow(tt, 1.45)) * maxRadius;
    }
    points.push(new THREE.Vector2(Math.max(0.01, r), z));
  }

  const envelopeGeo = new THREE.LatheGeometry(points, 48);
  // Orient hull along Z axis (Lathe creates along Y by default)
  envelopeGeo.rotateX(Math.PI / 2);

  const envelopeMesh = new THREE.Mesh(envelopeGeo, envelopeMat);
  envelopeMesh.castShadow = true;
  envelopeMesh.receiveShadow = true;
  group.add(envelopeMesh);

  // --- 3. RESISTANCE RACING STRIPES & DECALS ---
  // Crimson aerodynamic trim stripe along hull midline
  const stripePoints: THREE.Vector2[] = [];
  for (let i = 2; i <= segments - 3; i++) {
    const t = i / segments;
    const z = (t - 0.42) * totalLength;
    let r = 0;
    if (t < 0.4) {
      const nt = t / 0.4;
      r = Math.sqrt(Math.max(0, 1 - Math.pow(1 - nt, 2))) * maxRadius + 0.04;
    } else {
      const tt = (t - 0.4) / 0.6;
      r = (1 - Math.pow(tt, 1.45)) * maxRadius + 0.04;
    }
    stripePoints.push(new THREE.Vector2(Math.max(0.01, r), z));
  }
  const stripeGeo = new THREE.LatheGeometry(stripePoints, 48, 0, Math.PI * 0.16);
  stripeGeo.rotateX(Math.PI / 2);

  // Port and Starboard lateral accent stripes
  const portStripe = new THREE.Mesh(stripeGeo, resistanceRedMat);
  portStripe.rotation.z = Math.PI * 0.42;
  group.add(portStripe);

  const starStripe = new THREE.Mesh(stripeGeo, resistanceRedMat);
  starStripe.rotation.z = -Math.PI * 0.58;
  group.add(starStripe);

  // Nose Mooring Cone & Radar Cap
  const noseConeGeo = new THREE.CylinderGeometry(0.3, 1.4, 2.2, 24);
  const noseCone = new THREE.Mesh(noseConeGeo, darkGunmetalMat);
  noseCone.rotation.x = -Math.PI / 2;
  noseCone.position.set(0, 0, -23.2);
  group.add(noseCone);

  // Nose Spindle Probe
  const probeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12);
  const probe = new THREE.Mesh(probeGeo, darkGunmetalMat);
  probe.rotation.x = -Math.PI / 2;
  probe.position.set(0, 0, -24.8);
  group.add(probe);

  // --- 4. SUSPENDED GONDOLA (CABIN & COCKPIT) ---
  const gondolaGroup = new THREE.Group();
  gondolaGroup.position.set(0, -8.2, -4);
  group.add(gondolaGroup);

  // Gondola Main Hull (Streamlined pod)
  const gondolaBodyGeo = new THREE.BoxGeometry(3.6, 2.4, 14.5);
  const gondolaBody = new THREE.Mesh(gondolaBodyGeo, darkGunmetalMat);
  gondolaBody.castShadow = true;
  gondolaGroup.add(gondolaBody);

  // Rounded Front Cockpit Nose
  const cockpitNoseGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.4, 20);
  const cockpitNose = new THREE.Mesh(cockpitNoseGeo, darkGunmetalMat);
  cockpitNose.position.set(0, 0, -7.2);
  gondolaGroup.add(cockpitNose);

  // Panoramic Observation Windows (Sides and front)
  const windowStripGeo = new THREE.BoxGeometry(3.64, 0.9, 11);
  const windowStrip = new THREE.Mesh(windowStripGeo, cockpitGlassMat);
  windowStrip.position.set(0, 0.3, -1);
  gondolaGroup.add(windowStrip);

  // Cockpit Front Windshield
  const frontWindshieldGeo = new THREE.BoxGeometry(2.8, 0.9, 1.8);
  const frontWindshield = new THREE.Mesh(frontWindshieldGeo, cockpitGlassMat);
  frontWindshield.position.set(0, 0.3, -7.0);
  gondolaGroup.add(frontWindshield);

  // Catenary Rigging Cables (Structural steel struts connecting gondola to hull)
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x111317 });
  const cablePositions = [-5, -2, 1, 4];
  cablePositions.forEach((zOff) => {
    [-1.6, 1.6].forEach((xOff) => {
      const cableGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6);
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(xOff, 2.1, zOff);
      gondolaGroup.add(cable);
    });
  });

  // --- 5. TWIN OUTRIGGER TURBOPROP ENGINES ---
  const leftPropeller: THREE.Mesh[] = [];
  const rightPropeller: THREE.Mesh[] = [];

  [-2.8, 2.8].forEach((pylonX, pylonIdx) => {
    // Aerodynamic Support Pylon
    const pylonGeo = new THREE.BoxGeometry(1.2, 0.3, 1.4);
    const pylon = new THREE.Mesh(pylonGeo, darkGunmetalMat);
    pylon.position.set(pylonX, 0, 1.5);
    gondolaGroup.add(pylon);

    // Engine Nacelle Pod
    const nacelleGeo = new THREE.CylinderGeometry(0.55, 0.65, 3.2, 16);
    const nacelle = new THREE.Mesh(nacelleGeo, darkGunmetalMat);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(pylonX > 0 ? pylonX + 0.6 : pylonX - 0.6, 0, 1.5);
    gondolaGroup.add(nacelle);

    // Engine Cowling Red Accent Ring
    const cowlRingGeo = new THREE.TorusGeometry(0.66, 0.05, 8, 24);
    const cowlRing = new THREE.Mesh(cowlRingGeo, resistanceRedMat);
    cowlRing.position.set(pylonX > 0 ? pylonX + 0.6 : pylonX - 0.6, 0, 0.1);
    gondolaGroup.add(cowlRing);

    // 4-Blade Spinning Propeller Assembly
    const propHubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12);
    const propHub = new THREE.Mesh(propHubGeo, darkGunmetalMat);
    propHub.rotation.x = Math.PI / 2;
    propHub.position.set(pylonX > 0 ? pylonX + 0.6 : pylonX - 0.6, 0, -0.2);
    gondolaGroup.add(propHub);

    // 4 Blades
    for (let b = 0; b < 4; b++) {
      const bladeAngle = (b / 4) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.12, 1.6, 0.04);
      const blade = new THREE.Mesh(bladeGeo, darkGunmetalMat);
      blade.position.set(Math.cos(bladeAngle) * 0.75, Math.sin(bladeAngle) * 0.75, 0);
      blade.rotation.z = bladeAngle;
      propHub.add(blade);
      if (pylonIdx === 0) leftPropeller.push(blade);
      else rightPropeller.push(blade);
    }
  });

  // --- 6. UNDERCARRIAGE MONEY CARGO RELEASE HATCH ---
  // The chute where money pours out!
  const hatchBayGeo = new THREE.BoxGeometry(2.2, 0.6, 4.2);
  const hatchBay = new THREE.Mesh(hatchBayGeo, darkGunmetalMat);
  hatchBay.position.set(0, -1.3, 0);
  gondolaGroup.add(hatchBay);

  // Open Chute Interior (Dark void with interior red release light)
  const chuteVoidGeo = new THREE.BoxGeometry(1.8, 0.2, 3.6);
  const chuteVoid = new THREE.Mesh(chuteVoidGeo, new THREE.MeshBasicMaterial({ color: 0x050505 }));
  chuteVoid.position.set(0, -1.52, 0);
  gondolaGroup.add(chuteVoid);

  // Red Navigation Strobe on Ventral Keel
  const strobeGeo = new THREE.SphereGeometry(0.14, 10, 8);
  const strobeMesh = new THREE.Mesh(strobeGeo, strobeMat);
  strobeMesh.position.set(0, -1.65, 3.2);
  gondolaGroup.add(strobeMesh);

  const strobeLight = new THREE.PointLight(0xff1111, 1.8, 18);
  strobeLight.position.set(0, -1.8, 3.2);
  gondolaGroup.add(strobeLight);

  // --- 7. EMPENNAGE (4 CRUCIFORM TAIL FINS) ---
  const finGeo = new THREE.BoxGeometry(0.24, 6.2, 6.5);
  // Shape the fin: leading edge sweep
  const finPositions = [
    { rotZ: 0, y: 7.2, z: 24.5 }, // Dorsal (Top)
    { rotZ: Math.PI, y: -7.2, z: 24.5 }, // Ventral (Bottom)
    { rotZ: Math.PI / 2, y: 0, x: 7.2, z: 24.5 }, // Starboard (Right)
    { rotZ: -Math.PI / 2, y: 0, x: -7.2, z: 24.5 }, // Port (Left)
  ];

  finPositions.forEach((fp) => {
    const fin = new THREE.Mesh(finGeo, darkGunmetalMat);
    fin.position.set(fp.x || 0, fp.y, fp.z);
    fin.rotation.z = fp.rotZ;
    group.add(fin);

    // Red Trim Tip on Fin
    const finTipGeo = new THREE.BoxGeometry(0.28, 1.2, 6.2);
    const finTip = new THREE.Mesh(finTipGeo, resistanceRedMat);
    finTip.position.set(0, 2.6, 0);
    fin.add(finTip);
  });

  // Believable release point in world space for money particles:
  // Located at gondola cargo chute: (baseX, baseY - 9.8, baseZ - 4)
  const hatchPosition = new THREE.Vector3(baseX, baseY - 9.8, baseZ - 4);

  // Animation updates
  let propAngle = 0;
  const update = (time: number, deltaTime: number) => {
    // 1. Gentle floating atmospheric oscillation (yaw, pitch, roll sway)
    const dt = Math.min(deltaTime, 0.05);
    group.position.x = baseX + Math.sin(time * 0.35) * 1.8;
    group.position.y = baseY + Math.cos(time * 0.28) * 0.9;
    group.position.z = baseZ + Math.sin(time * 0.22) * 1.2;

    group.rotation.y = Math.sin(time * 0.2) * 0.05; // slight yaw
    group.rotation.x = Math.sin(time * 0.3) * 0.02; // slight pitch
    group.rotation.z = Math.cos(time * 0.25) * 0.02; // slight roll

    // 2. Twin Turboprop spin
    propAngle += dt * 32;
    leftPropeller.forEach((b, idx) => {
      b.rotation.z = propAngle + (idx * Math.PI) / 2;
    });
    rightPropeller.forEach((b, idx) => {
      b.rotation.z = -propAngle + (idx * Math.PI) / 2;
    });

    // 3. Flashing beacon strobe (pulsing every 1.1s)
    const strobePhase = (time % 1.1) / 1.1;
    const isFlash = strobePhase < 0.12;
    strobeLight.intensity = isFlash ? 3.5 : 0.2;
    (strobeMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isFlash ? 3.0 : 0.3;

    // Keep hatch position synced with current world transform
    hatchPosition.set(
      group.position.x,
      group.position.y - 9.8,
      group.position.z - 4
    );
  };

  return {
    group,
    hatchPosition,
    update,
  };
}
