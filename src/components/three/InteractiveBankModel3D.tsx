import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundEngine } from '../../lib/soundEngine';
import { RotateCcw, Play, Pause } from 'lucide-react';

export interface SectorTarget {
  id: string;
  code: string;
  name: string;
  pos: THREE.Vector3;
  camPos: THREE.Vector3;
  camLook: THREE.Vector3;
  risk: 'CRITICAL' | 'MODERATE' | 'HIGH';
  desc: string;
}

export const SECTOR_TARGETS: SectorTarget[] = [
  {
    id: 'portico',
    code: 'SEC-A1',
    name: 'GRAND COLONNADE & MAIN INGRESS',
    pos: new THREE.Vector3(0, 3.2, 5.5),
    camPos: new THREE.Vector3(0, 6, 26),
    camLook: new THREE.Vector3(0, 3.5, 2),
    risk: 'CRITICAL',
    desc: 'Main neoclassical portico with 8 reinforced stone pillars. Ingress checkpoint for decoy transport vehicle.',
  },
  {
    id: 'west_wing',
    code: 'SEC-B2',
    name: 'ADMINISTRATION & CASHIER WING',
    pos: new THREE.Vector3(-15, 4.5, 0),
    camPos: new THREE.Vector3(-10, 7, 24),
    camLook: new THREE.Vector3(-15, 4.5, 0),
    risk: 'MODERATE',
    desc: 'Two-story administrative wing. Security station, server racks, and bulletproof counter enclosures.',
  },
  {
    id: 'east_wing',
    code: 'SEC-C3',
    name: 'MINTING & PRINTING PRESS HALL',
    pos: new THREE.Vector3(15, 4.5, 0),
    camPos: new THREE.Vector3(10, 7, 24),
    camLook: new THREE.Vector3(15, 4.5, 0),
    risk: 'HIGH',
    desc: 'Industrial rotary printing halls generating unindexed banknote sheets. Target extraction warehouse.',
  },
  {
    id: 'roof',
    code: 'SEC-R4',
    name: 'ROOFTOP SNIPER PARAPET & SPIRE',
    pos: new THREE.Vector3(0, 16.5, -1),
    camPos: new THREE.Vector3(0, 19, 25),
    camLook: new THREE.Vector3(0, 15, -1),
    risk: 'HIGH',
    desc: 'Tactical sniper parapet, radio broadcast spire, and warning strobe overlooking entire northern perimeter plaza.',
  },
  {
    id: 'vault',
    code: 'SEC-V0',
    name: 'SUBTERRANEAN 40-TON VAULT CORE',
    pos: new THREE.Vector3(0, -4.8, -3.5),
    camPos: new THREE.Vector3(0, -1.5, 22),
    camLook: new THREE.Vector3(0, -4.8, -3.5),
    risk: 'CRITICAL',
    desc: 'Sub-level reinforced sanctuary protected by 12 radial pneumatic locking bolts and flooding countermeasure.',
  },
];

interface InteractiveBankModel3DProps {
  activeSectorId: string;
  onSelectSector: (sector: SectorTarget) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const InteractiveBankModel3D: React.FC<InteractiveBankModel3DProps> = ({
  activeSectorId,
  onSelectSector,
  className = '',
  style = {},
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Three.js internal instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const roomHighlightGroupRef = useRef<THREE.Group | null>(null);
  const sectorMarkersRef = useRef<Map<string, THREE.Group>>(new Map());

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const prevPointerPosRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const activeSectorIdRef = useRef(activeSectorId);
  activeSectorIdRef.current = activeSectorId;

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Handle smooth camera movement when activeSectorId changes
  useEffect(() => {
    const targetSector = SECTOR_TARGETS.find((s) => s.id === activeSectorId);
    if (!targetSector || !cameraRef.current || !rootGroupRef.current) return;

    const cam = cameraRef.current;
    const currentLook = new THREE.Vector3();
    cam.getWorldDirection(currentLook);
    const targetLook = targetSector.camLook;

    // Smoothly animate model rotation and camera position together
    let targetRotY = 0;
    let targetRotX = 0.05;
    if (activeSectorId === 'west_wing') {
      targetRotY = 0.22;
      targetRotX = 0.08;
    } else if (activeSectorId === 'east_wing') {
      targetRotY = -0.22;
      targetRotX = 0.08;
    } else if (activeSectorId === 'roof') {
      targetRotY = 0;
      targetRotX = -0.06;
    } else if (activeSectorId === 'vault') {
      targetRotY = 0;
      targetRotX = 0.14;
    }

    if (rootGroupRef.current) {
      rotVelocityRef.current.x = 0;
      rotVelocityRef.current.y = 0;
      gsap.to(rootGroupRef.current.rotation, {
        x: targetRotX,
        y: targetRotY,
        duration: 1.25,
        ease: 'power3.inOut',
      });
    }

    gsap.to(cam.position, {
      x: targetSector.camPos.x,
      y: targetSector.camPos.y,
      z: targetSector.camPos.z,
      duration: 1.25,
      ease: 'power3.inOut',
    });

    const lookTarget = { x: targetLook.x, y: targetLook.y, z: targetLook.z };
    gsap.to(cam, {
      duration: 1.25,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
      },
    });

    // Update 3D room highlight box
    if (roomHighlightGroupRef.current) {
      const room = roomHighlightGroupRef.current;
      room.position.copy(targetSector.pos);
      room.visible = true;

      // Animate scale pulse
      room.scale.set(0.8, 0.8, 0.8);
      gsap.to(room.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: 'back.out(2)',
      });
    }
  }, [activeSectorId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 10, 36);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(20, 40, 30);
    scene.add(dirLight1);

    const redRimLight = new THREE.PointLight(0xc91414, 3.5, 60);
    redRimLight.position.set(-15, 12, 10);
    scene.add(redRimLight);

    const goldVaultLight = new THREE.PointLight(0xf5ba31, 3.0, 40);
    goldVaultLight.position.set(0, -4, -3);
    scene.add(goldVaultLight);

    // --- 3. MATERIALS ---
    const wireframeRed = new THREE.LineBasicMaterial({
      color: 0xc91414,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.2,
    });
    const wireframeCyan = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
      linewidth: 1,
    });
    const wireframeGold = new THREE.LineBasicMaterial({
      color: 0xf5ba31,
      transparent: true,
      opacity: 0.9,
      linewidth: 1.5,
    });
    const ghostGlass = new THREE.MeshPhysicalMaterial({
      color: 0x0a0c10,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.35,
      transmission: 0.5,
      ior: 1.3,
    });
    const solidStone = new THREE.MeshStandardMaterial({
      color: 0x16181d,
      roughness: 0.8,
      metalness: 0.2,
    });

    // --- 4. ROOT ARCHITECTURAL GROUP ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Helper to add geometric volume with wireframe edges
    const addBuildingBlock = (
      geo: THREE.BufferGeometry,
      pos: THREE.Vector3,
      edgeColor: THREE.LineBasicMaterial = wireframeRed,
      isSolid = false
    ) => {
      const mesh = new THREE.Mesh(geo, isSolid ? solidStone : ghostGlass);
      mesh.position.copy(pos);
      rootGroup.add(mesh);

      const edgesGeo = new THREE.EdgesGeometry(geo);
      const wireframeLines = new THREE.LineSegments(edgesGeo, edgeColor);
      wireframeLines.position.copy(pos);
      rootGroup.add(wireframeLines);

      return { mesh, wireframeLines };
    };

    // Ground Tactical Grid
    const gridHelper = new THREE.GridHelper(70, 28, 0xc91414, 0x331010);
    gridHelper.position.y = -0.05;
    rootGroup.add(gridHelper);

    // Range rings on ground
    [15, 26, 38].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.08, r + 0.08, 48);
      const ringMesh = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xc91414, opacity: 0.18, transparent: true, side: THREE.DoubleSide })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01;
      rootGroup.add(ringMesh);
    });

    // --- 5. NEOCLASSICAL COMPLEX ARCHITECTURE ---
    // Ground Podium Steps
    addBuildingBlock(new THREE.BoxGeometry(46, 0.8, 22), new THREE.Vector3(0, 0.4, 0), wireframeRed);
    addBuildingBlock(new THREE.BoxGeometry(42, 0.8, 20), new THREE.Vector3(0, 1.2, 0), wireframeRed);

    // Central Grand Hall Structure
    addBuildingBlock(new THREE.BoxGeometry(24, 14, 16), new THREE.Vector3(0, 8, -1), wireframeRed);

    // 8 Neoclassical Fluted Columns
    const colPositions = [-10, -7.2, -4.3, -1.5, 1.5, 4.3, 7.2, 10];
    const colHeight = 10.5;
    const colGeo = new THREE.CylinderGeometry(0.55, 0.65, colHeight, 16);
    const colCapGeo = new THREE.BoxGeometry(1.6, 0.6, 1.6);

    colPositions.forEach((x) => {
      const colShaft = new THREE.Mesh(colGeo, ghostGlass);
      colShaft.position.set(x, 6.5, 7.2);
      rootGroup.add(colShaft);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(colGeo), wireframeCyan);
      edges.position.set(x, 6.5, 7.2);
      rootGroup.add(edges);

      const cap = new THREE.Mesh(colCapGeo, ghostGlass);
      cap.position.set(x, 12, 7.2);
      rootGroup.add(cap);
    });

    // Triangular Pediment on top of Colonnade
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-12.5, 0);
    pedimentShape.lineTo(0, 4.8);
    pedimentShape.lineTo(12.5, 0);
    pedimentShape.closePath();
    const pedimentExtrude = new THREE.ExtrudeGeometry(pedimentShape, { depth: 4, bevelEnabled: false });
    const pedimentMesh = new THREE.Mesh(pedimentExtrude, ghostGlass);
    pedimentMesh.position.set(0, 12.2, 5.2);
    rootGroup.add(pedimentMesh);
    const pedimentEdges = new THREE.LineSegments(new THREE.EdgesGeometry(pedimentExtrude), wireframeGold);
    pedimentEdges.position.set(0, 12.2, 5.2);
    rootGroup.add(pedimentEdges);

    // West Wing (Administration & Offices)
    addBuildingBlock(new THREE.BoxGeometry(16, 11, 14), new THREE.Vector3(-19, 6.5, -1), wireframeCyan);
    // Interior floor slabs in West Wing
    addBuildingBlock(new THREE.BoxGeometry(15, 0.3, 13), new THREE.Vector3(-19, 6.0, -1), wireframeCyan);

    // East Wing (Printing Press Hall)
    addBuildingBlock(new THREE.BoxGeometry(16, 11, 14), new THREE.Vector3(19, 6.5, -1), wireframeCyan);
    // Interior floor slabs in East Wing
    addBuildingBlock(new THREE.BoxGeometry(15, 0.3, 13), new THREE.Vector3(19, 6.0, -1), wireframeCyan);

    // Rooftop Command Deck & Spire
    addBuildingBlock(new THREE.BoxGeometry(18, 3, 12), new THREE.Vector3(0, 16, -2), wireframeRed);
    const spireGeo = new THREE.CylinderGeometry(0.1, 0.5, 6, 8);
    const spireMesh = new THREE.Mesh(spireGeo, ghostGlass);
    spireMesh.position.set(0, 20.5, -2);
    rootGroup.add(spireMesh);
    const spireEdges = new THREE.LineSegments(new THREE.EdgesGeometry(spireGeo), wireframeRed);
    spireEdges.position.set(0, 20.5, -2);
    rootGroup.add(spireEdges);

    // Flashing Strobe at Spire Apex
    const beaconSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff1111 })
    );
    beaconSphere.position.set(0, 23.5, -2);
    rootGroup.add(beaconSphere);

    // Subterranean Vault Cutaway (Underground Level)
    const bunkerPitGeo = new THREE.BoxGeometry(26, 6, 18);
    addBuildingBlock(bunkerPitGeo, new THREE.Vector3(0, -4.5, -3), wireframeGold);

    // 3D Circular Vault Door in Bunker Pit
    const vaultDoorGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.8, 24);
    const vaultDoorMesh = new THREE.Mesh(
      vaultDoorGeo,
      new THREE.MeshStandardMaterial({ color: 0x221a0a, metalness: 0.9, roughness: 0.25 })
    );
    vaultDoorMesh.rotation.x = Math.PI / 2;
    vaultDoorMesh.position.set(0, -4.5, 4.5);
    rootGroup.add(vaultDoorMesh);
    const vaultDoorEdges = new THREE.LineSegments(new THREE.EdgesGeometry(vaultDoorGeo), wireframeGold);
    vaultDoorEdges.rotation.x = Math.PI / 2;
    vaultDoorEdges.position.set(0, -4.5, 4.5);
    rootGroup.add(vaultDoorEdges);

    // Stacks of Gold Ingots in Vault Chamber
    for (let gx = -3; gx <= 3; gx += 2) {
      for (let gz = -3; gz <= 1; gz += 2) {
        const barGeo = new THREE.BoxGeometry(1.4, 0.6, 1.0);
        const barMesh = new THREE.Mesh(
          barGeo,
          new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 })
        );
        barMesh.position.set(gx, -6.8, gz - 2);
        rootGroup.add(barMesh);
        const barLines = new THREE.LineSegments(new THREE.EdgesGeometry(barGeo), wireframeGold);
        barLines.position.set(gx, -6.8, gz - 2);
        rootGroup.add(barLines);
      }
    }

    // --- 6. DYNAMIC CLICKABLE ROOM HIGHLIGHT BOX ---
    const roomHighlightGroup = new THREE.Group();
    const hlBoxGeo = new THREE.BoxGeometry(8, 6, 8);
    const hlLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(hlBoxGeo),
      new THREE.LineBasicMaterial({ color: 0xff2222, linewidth: 2 })
    );
    roomHighlightGroup.add(hlLines);

    // Pulsing inner volume
    const innerVol = new THREE.Mesh(
      hlBoxGeo,
      new THREE.MeshBasicMaterial({
        color: 0xc91414,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
    );
    roomHighlightGroup.add(innerVol);

    // Downward target beam
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.4, 18, 12);
    const beamMesh = new THREE.Mesh(
      beamGeo,
      new THREE.MeshBasicMaterial({ color: 0xc91414, transparent: true, opacity: 0.35 })
    );
    beamMesh.position.y = 9;
    roomHighlightGroup.add(beamMesh);

    scene.add(roomHighlightGroup);
    roomHighlightGroupRef.current = roomHighlightGroup;

    // --- 7. INTERACTIVE 3D SECTOR BEACONS & HITBOXES ---
    const sectorMarkers = new Map<string, THREE.Group>();
    const raycastTargets: THREE.Object3D[] = [];

    SECTOR_TARGETS.forEach((sec) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(sec.pos);
      markerGroup.userData = { sector: sec };

      // Outer radar ring
      const ringGeo = new THREE.RingGeometry(0.8, 1.0, 24);
      const ringMesh = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xc91414, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      markerGroup.add(ringMesh);

      // Core pulsing dot
      const dotGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const dotMesh = new THREE.Mesh(
        dotGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      markerGroup.add(dotMesh);

      // Invisible larger click hitbox for smooth touch/pointer interaction
      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.userData = { sector: sec };
      markerGroup.add(hitbox);
      raycastTargets.push(hitbox);

      rootGroup.add(markerGroup);
      sectorMarkers.set(sec.id, markerGroup);
    });
    sectorMarkersRef.current = sectorMarkers;

    // Set initial active sector position
    const initSector = SECTOR_TARGETS.find((s) => s.id === activeSectorId) || SECTOR_TARGETS[0];
    roomHighlightGroup.position.copy(initSector.pos);

    // --- 8. MOUSE & TOUCH ORBIT INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast for hover states
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(raycastTargets, true);
      if (intersects.length > 0) {
        const sec = intersects[0].object.userData.sector as SectorTarget;
        if (sec) {
          setHoveredSector(sec.id);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredSector(null);
        renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - prevPointerPosRef.current.x;
      const deltaY = e.clientY - prevPointerPosRef.current.y;
      prevPointerPosRef.current = { x: e.clientX, y: e.clientY };

      rotVelocityRef.current.y = deltaX * 0.005;
      rotVelocityRef.current.x = deltaY * 0.003;

      rootGroup.rotation.y += rotVelocityRef.current.y;
      rootGroup.rotation.x = Math.max(-0.4, Math.min(0.6, rootGroup.rotation.x + rotVelocityRef.current.x));
    };

    const onPointerUp = (e: PointerEvent) => {
      // Check if it was a click (minimal displacement)
      const dist = Math.hypot(e.clientX - prevPointerPosRef.current.x, e.clientY - prevPointerPosRef.current.y);
      if (dist < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, true);
        if (intersects.length > 0) {
          const sec = intersects[0].object.userData.sector as SectorTarget;
          if (sec) {
            soundEngine.playRadarPing(880);
            onSelectSector(sec);
          }
        }
      }
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // --- 9. RESIZE LISTENER ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 10. ANIMATION LOOP ---
    let rafId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      clock.getDelta();
      const time = clock.getElapsedTime();

      // Damped inertia rotation
      if (!isDraggingRef.current) {
        rotVelocityRef.current.x *= 0.92;
        rotVelocityRef.current.y *= 0.92;
        rootGroup.rotation.x += rotVelocityRef.current.x;
        rootGroup.rotation.y += rotVelocityRef.current.y;

        if (autoRotateRef.current) {
          rootGroup.rotation.y += 0.0035;
        }
      }

      // Animate Strobe Light
      const flash = (Math.sin(time * 6) + Math.sin(time * 12)) > 0.8 ? 1 : 0.2;
      redRimLight.intensity = 2.0 + flash * 3.0;

      // Animate Room Highlight volume breathing
      if (roomHighlightGroupRef.current) {
        const pulse = 1.0 + Math.sin(time * 3.5) * 0.06;
        roomHighlightGroupRef.current.scale.set(pulse, pulse, pulse);
      }

      // Animate sector markers
      sectorMarkers.forEach((grp, id) => {
        const isTarget = id === activeSectorIdRef.current;
        const ring = grp.children[0] as THREE.Mesh;
        if (ring) {
          ring.rotation.z += 0.02;
          const s = isTarget ? 1.3 + Math.sin(time * 4) * 0.2 : 1.0;
          ring.scale.set(s, s, 1);
        }
      });

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  const handleResetCamera = () => {
    soundEngine.playClick();
    if (!cameraRef.current || !rootGroupRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 10,
      z: 36,
      duration: 1.0,
      ease: 'power3.out',
    });
    gsap.to(rootGroupRef.current.rotation, {
      x: 0,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    });
    const defaultSector = SECTOR_TARGETS[0];
    onSelectSector(defaultSector);
  };

  const handleSectorClick = (sec: SectorTarget) => {
    soundEngine.playRadarPing(840);
    onSelectSector(sec);
  };

  return (
    <div
      className={`relative w-full h-full select-none ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        backgroundColor: '#050608',
        borderRadius: '2px',
        overflow: 'hidden',
        border: '1px solid rgba(201, 20, 20, 0.45)',
        boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 50px rgba(201,20,20,0.15)',
        ...style,
      }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      />

      {/* Top HUD Telemetry Banner */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '18px',
          right: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#c91414',
              boxShadow: '0 0 10px #c91414',
              animation: 'beaconPulse 1.2s infinite',
            }}
          />
          <span
            className="font-mono-tech"
            style={{
              fontSize: '11px',
              color: '#f2eee7',
              letterSpacing: '0.15em',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            3D ARCHITECTURAL INGRESS // NEOCLASSICAL BLOCK
          </span>
        </div>

        <div
          className="font-mono-tech hidden-on-small"
          style={{
            fontSize: '10px',
            color: '#888',
            letterSpacing: '0.12em',
          }}
        >
          DRAG TO ORBIT 360° // CLICK SECTORS TO FOCUS
        </div>
      </div>

      {/* Interactive 3D Room Badges (Quick Teleport Buttons Inside/Around Block) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 25,
          pointerEvents: 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(7, 8, 12, 0.78)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Sector Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SECTOR_TARGETS.map((sec) => {
            const isActive = sec.id === activeSectorId;
            const isHovered = sec.id === hoveredSector;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorClick(sec)}
                data-cursor="explore"
                style={{
                  backgroundColor: isActive
                    ? '#c91414'
                    : isHovered
                    ? 'rgba(201, 20, 20, 0.35)'
                    : 'rgba(15, 17, 22, 0.9)',
                  border: isActive
                    ? '1.5px solid #ff4444'
                    : '1px solid rgba(255, 255, 255, 0.18)',
                  color: isActive ? '#ffffff' : '#e0e0e0',
                  padding: '6px 12px',
                  borderRadius: '2px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 16px rgba(201, 20, 20, 0.65)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#fff' : sec.risk === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                  }}
                />
                <span>{sec.code}</span>
                <span className="hidden-on-small" style={{ opacity: 0.75 }}>
                  : {sec.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Controls Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            style={{
              backgroundColor: autoRotate ? 'rgba(201, 20, 20, 0.25)' : 'rgba(20, 22, 28, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: autoRotate ? '#c91414' : '#888',
              padding: '6px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {autoRotate ? <Pause size={12} /> : <Play size={12} />}
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Perspective"
            style={{
              backgroundColor: 'rgba(20, 22, 28, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#888',
              padding: '6px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Tactical Optical Framing Brackets */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '16px',
          height: '16px',
          borderTop: '2px solid #c91414',
          borderLeft: '2px solid #c91414',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '16px',
          height: '16px',
          borderTop: '2px solid #c91414',
          borderRight: '2px solid #c91414',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: '16px',
          height: '16px',
          borderBottom: '2px solid #c91414',
          borderLeft: '2px solid #c91414',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '16px',
          height: '16px',
          borderBottom: '2px solid #c91414',
          borderRight: '2px solid #c91414',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
