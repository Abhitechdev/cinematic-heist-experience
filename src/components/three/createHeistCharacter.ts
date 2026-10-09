import * as THREE from 'three';

export interface HeistCharacterOptions {
  jumpsuitColor?: number;
  maskColor?: number;
  scale?: number;
  isLeader?: boolean;
}

export function createHeistCharacter(options: HeistCharacterOptions = {}): THREE.Group {
  const {
    jumpsuitColor = 0x8b0808, // Heist Red
    maskColor = 0xf2eee7,     // Off-white anonymous mask
    scale = 1.0,
    isLeader = false,
  } = options;

  const characterGroup = new THREE.Group();
  characterGroup.scale.set(scale, scale, scale);

  // Materials
  const jumpsuitMat = new THREE.MeshStandardMaterial({
    color: jumpsuitColor,
    roughness: 0.65,
    metalness: 0.1,
  });

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x22262c, // Charcoal grey suit for leader
    roughness: 0.7,
    metalness: 0.15,
  });

  const maskMat = new THREE.MeshStandardMaterial({
    color: maskColor,
    roughness: 0.35,
    metalness: 0.2,
  });

  const blackGearMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
    metalness: 0.5,
  });

  const bootsMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.8,
    metalness: 0.2,
  });

  const activeMat = isLeader ? suitMat : jumpsuitMat;

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.85, 1.25, 0.45);
  const torso = new THREE.Mesh(torsoGeo, activeMat);
  torso.position.y = 1.65;
  torso.castShadow = true;
  torso.receiveShadow = true;
  characterGroup.add(torso);

  // Tactical Vest / Harness (if not leader)
  if (!isLeader) {
    const vestGeo = new THREE.BoxGeometry(0.9, 0.85, 0.5);
    const vest = new THREE.Mesh(vestGeo, blackGearMat);
    vest.position.set(0, 1.75, 0);
    characterGroup.add(vest);

    // Red distress strap
    const strapGeo = new THREE.BoxGeometry(0.92, 0.08, 0.52);
    const strapMat = new THREE.MeshBasicMaterial({ color: 0xc91414 });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(0, 1.6, 0);
    characterGroup.add(strap);
  } else {
    // Tie for leader
    const tieGeo = new THREE.BoxGeometry(0.12, 0.7, 0.48);
    const tie = new THREE.Mesh(tieGeo, blackGearMat);
    tie.position.set(0, 1.7, 0.02);
    characterGroup.add(tie);
  }

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.25, 16);
  const neck = new THREE.Mesh(neckGeo, isLeader ? maskMat : activeMat);
  neck.position.y = 2.35;
  characterGroup.add(neck);

  // Head Group (for rotation animation)
  const headGroup = new THREE.Group();
  headGroup.position.y = 2.7;

  // Head / Hood
  const hoodGeo = new THREE.SphereGeometry(0.38, 24, 24);
  const hood = new THREE.Mesh(hoodGeo, isLeader ? blackGearMat : activeMat);
  hood.scale.set(1, 1.15, 1.1);
  headGroup.add(hood);

  // Anonymous Mask / Face
  const maskGeo = new THREE.SphereGeometry(0.32, 24, 24, 0, Math.PI);
  const mask = new THREE.Mesh(maskGeo, maskMat);
  mask.rotation.y = -Math.PI / 2;
  mask.position.set(0, 0.02, 0.16);
  mask.scale.set(0.9, 1.1, 0.6);
  headGroup.add(mask);

  // Mask eye slits
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.05), eyeMat);
  leftEye.position.set(-0.11, 0.06, 0.44);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.05), eyeMat);
  rightEye.position.set(0.11, 0.06, 0.44);
  headGroup.add(rightEye);

  // Mustache / Stylized Heist Mask Contour
  const contourMat = new THREE.MeshBasicMaterial({ color: 0x1f0606 });
  const contour = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 16, Math.PI), contourMat);
  contour.rotation.x = Math.PI;
  contour.rotation.z = Math.PI;
  contour.position.set(0, -0.06, 0.44);
  headGroup.add(contour);

  characterGroup.add(headGroup);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.16, 0.14, 1.05, 16);

  // Left Arm
  const leftArm = new THREE.Mesh(armGeo, activeMat);
  leftArm.position.set(-0.58, 1.6, 0);
  leftArm.rotation.z = 0.1;
  characterGroup.add(leftArm);

  // Left Glove
  const gloveGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const leftGlove = new THREE.Mesh(gloveGeo, blackGearMat);
  leftGlove.position.set(-0.64, 1.0, 0);
  characterGroup.add(leftGlove);

  // Right Arm
  const rightArm = new THREE.Mesh(armGeo, activeMat);
  rightArm.position.set(0.58, 1.6, 0);
  rightArm.rotation.z = -0.1;
  characterGroup.add(rightArm);

  // Right Glove
  const rightGlove = new THREE.Mesh(gloveGeo, blackGearMat);
  rightGlove.position.set(0.64, 1.0, 0);
  characterGroup.add(rightGlove);

  // Belt
  const beltGeo = new THREE.BoxGeometry(0.88, 0.14, 0.48);
  const belt = new THREE.Mesh(beltGeo, blackGearMat);
  belt.position.set(0, 1.0, 0);
  characterGroup.add(belt);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 1.1, 16);

  const leftLeg = new THREE.Mesh(legGeo, activeMat);
  leftLeg.position.set(-0.25, 0.5, 0);
  characterGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, activeMat);
  rightLeg.position.set(0.25, 0.5, 0);
  characterGroup.add(rightLeg);

  // Tactical Combat Boots
  const bootGeo = new THREE.BoxGeometry(0.26, 0.22, 0.42);
  const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
  leftBoot.position.set(-0.25, 0.05, 0.06);
  characterGroup.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
  rightBoot.position.set(0.25, 0.05, 0.06);
  characterGroup.add(rightBoot);

  // Store references for idle breathing and micro-movement
  characterGroup.userData = {
    headGroup,
    torso,
    leftArm,
    rightArm,
    initialY: characterGroup.position.y,
  };

  return characterGroup;
}
