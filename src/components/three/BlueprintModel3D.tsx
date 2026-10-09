import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundEngine } from '../../lib/soundEngine';
import { RotateCcw, Play, Pause } from 'lucide-react';
import type { BlueprintNode } from '../../types/heist';
import { BLUEPRINT_NODES } from '../../data/blueprintNodes';

interface BlueprintModel3DProps {
  activeNodeId: string;
  onSelectNode: (node: BlueprintNode) => void;
  className?: string;
  style?: React.CSSProperties;
}

// 3D Spatial coordinates mapped to architectural levels
const NODE_3D_POSITIONS: Record<string, { pos: THREE.Vector3; camPos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
  entry: {
    pos: new THREE.Vector3(-18, -3.5, 8),
    camPos: new THREE.Vector3(-16, 6, 26),
    lookAt: new THREE.Vector3(-16, -2, 4),
  },
  security: {
    pos: new THREE.Vector3(-8, 3.2, 0),
    camPos: new THREE.Vector3(-6, 12, 18),
    lookAt: new THREE.Vector3(-6, 3, 0),
  },
  control: {
    pos: new THREE.Vector3(4, 7.5, -4),
    camPos: new THREE.Vector3(6, 16, 14),
    lookAt: new THREE.Vector3(4, 7, -4),
  },
  vault: {
    pos: new THREE.Vector3(14, -4.5, -6),
    camPos: new THREE.Vector3(14, 4, 16),
    lookAt: new THREE.Vector3(14, -4, -6),
  },
  exit: {
    pos: new THREE.Vector3(22, -6.5, 10),
    camPos: new THREE.Vector3(22, 2, 28),
    lookAt: new THREE.Vector3(20, -5, 8),
  },
};

export const BlueprintModel3D: React.FC<BlueprintModel3DProps> = ({
  activeNodeId,
  onSelectNode,
  className = '',
  style = {},
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const activeFocusBoxRef = useRef<THREE.Group | null>(null);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const prevPointerPosRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0 });

  const activeNodeIdRef = useRef(activeNodeId);
  activeNodeIdRef.current = activeNodeId;

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Smooth camera glide when activeNodeId changes
  useEffect(() => {
    const coords = NODE_3D_POSITIONS[activeNodeId];
    if (!coords || !cameraRef.current) return;

    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: coords.camPos.x,
      y: coords.camPos.y,
      z: coords.camPos.z,
      duration: 1.2,
      ease: 'power3.inOut',
    });

    const lookTarget = { x: coords.lookAt.x, y: coords.lookAt.y, z: coords.lookAt.z };
    gsap.to(cam, {
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
      },
    });

    if (activeFocusBoxRef.current) {
      const box = activeFocusBoxRef.current;
      box.position.copy(coords.pos);
      box.scale.set(0.7, 0.7, 0.7);
      gsap.to(box.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'back.out(2)',
      });
    }
  }, [activeNodeId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 18, 38);
    camera.lookAt(0, 0, 0);
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

    // Ambient and directional lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const redLight = new THREE.PointLight(0xc91414, 3.5, 70);
    redLight.position.set(0, 15, 10);
    scene.add(redLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // --- 3D TACTICAL BLUEPRINT ARCHITECTURAL FLOORS ---
    // Floor Slabs (Ground level, Upper level, Sub-level 1, Sub-level 2)
    const floorLevels = [
      { y: 7.0, w: 28, d: 20, label: 'LEVEL +1: MEZZANINE & RELAY' },
      { y: 2.8, w: 52, d: 28, label: 'LEVEL 00: GROUND PERIMETER & SECURITY' },
      { y: -3.8, w: 46, d: 24, label: 'LEVEL -1: HYDRAULIC CONDUIT & SERVICE' },
      { y: -7.0, w: 32, d: 18, label: 'LEVEL -2: SUBTERRANEAN 40-TON VAULT' },
    ];

    floorLevels.forEach((fl) => {
      // Floor perimeter frame
      const frameGeo = new THREE.BoxGeometry(fl.w, 0.25, fl.d);
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x161c24, transparent: true, opacity: 0.45 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.y = fl.y;
      rootGroup.add(frameMesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(frameGeo),
        new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.65 })
      );
      edges.position.y = fl.y;
      rootGroup.add(edges);

      // Floor grid lines
      const grid = new THREE.GridHelper(fl.w, Math.floor(fl.w / 4), 0xc91414, 0x1e293b);
      grid.position.y = fl.y + 0.15;
      rootGroup.add(grid);
    });

    // Vertical structural columns connecting the levels
    const columnCoords = [
      [-20, 10], [20, 10], [-20, -10], [20, -10],
      [-10, 8], [10, 8], [-10, -8], [10, -8]
    ];
    columnCoords.forEach(([cx, cz]) => {
      const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 16, 8);
      const colMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 0, cz);
      rootGroup.add(col);
    });

    // --- 3D PULSING LASER TRAJECTORY PATH ---
    const trajectoryPoints = BLUEPRINT_NODES.map((n) => {
      const c = NODE_3D_POSITIONS[n.id];
      return c ? c.pos : new THREE.Vector3(0, 0, 0);
    });

    const curve = new THREE.CatmullRomCurve3(trajectoryPoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xc91414,
      transparent: true,
      opacity: 0.95,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    rootGroup.add(tubeMesh);

    // Laser glow casing
    const glowTubeGeo = new THREE.TubeGeometry(curve, 64, 0.35, 8, false);
    const glowTubeMat = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.22,
    });
    const glowTubeMesh = new THREE.Mesh(glowTubeGeo, glowTubeMat);
    rootGroup.add(glowTubeMesh);

    // --- 3D CLICKABLE NODES ---
    const raycastTargets: THREE.Object3D[] = [];
    const nodeMarkers = new Map<string, THREE.Group>();

    BLUEPRINT_NODES.forEach((node) => {
      const coords = NODE_3D_POSITIONS[node.id];
      if (!coords) return;

      const group = new THREE.Group();
      group.position.copy(coords.pos);
      group.userData = { blueprintNode: node };

      // Ground radar ring
      const ringGeo = new THREE.RingGeometry(0.9, 1.15, 24);
      const ringMesh = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xc91414, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      group.add(ringMesh);

      // Core beacon sphere
      const sphereGeo = new THREE.SphereGeometry(0.42, 12, 12);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      // Vertical laser antenna
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
      const beamMesh = new THREE.Mesh(
        beamGeo,
        new THREE.MeshBasicMaterial({ color: 0xc91414, transparent: true, opacity: 0.7 })
      );
      beamMesh.position.y = 1.75;
      group.add(beamMesh);

      // Large invisible click hitbox for seamless touch
      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.userData = { blueprintNode: node };
      group.add(hitbox);
      raycastTargets.push(hitbox);

      rootGroup.add(group);
      nodeMarkers.set(node.id, group);
    });

    // Active Sector Focus Bounding Box
    const focusGroup = new THREE.Group();
    const focusBoxGeo = new THREE.BoxGeometry(6.5, 4.5, 6.5);
    const focusBoxEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(focusBoxGeo),
      new THREE.LineBasicMaterial({ color: 0xff2222, linewidth: 2 })
    );
    focusGroup.add(focusBoxEdges);

    const focusFill = new THREE.Mesh(
      focusBoxGeo,
      new THREE.MeshBasicMaterial({ color: 0xc91414, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    focusGroup.add(focusFill);
    rootGroup.add(focusGroup);
    activeFocusBoxRef.current = focusGroup;

    // Set initial active position
    const initCoords = NODE_3D_POSITIONS[activeNodeId] || NODE_3D_POSITIONS['entry'];
    focusGroup.position.copy(initCoords.pos);

    // --- RAYCASTER & INTERACTION ---
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

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(raycastTargets, true);
      if (hits.length > 0) {
        const bpNode = hits[0].object.userData.blueprintNode as BlueprintNode;
        if (bpNode) {
          setHoveredNodeId(bpNode.id);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredNodeId(null);
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
      const dist = Math.hypot(e.clientX - prevPointerPosRef.current.x, e.clientY - prevPointerPosRef.current.y);
      if (dist < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(raycastTargets, true);
        if (hits.length > 0) {
          const bpNode = hits[0].object.userData.blueprintNode as BlueprintNode;
          if (bpNode) {
            soundEngine.playRadarPing(840);
            onSelectNode(bpNode);
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

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix;
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let rafId: number;
    const clock = new THREE.Clock();

    const loop = () => {
      const time = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        rotVelocityRef.current.x *= 0.92;
        rotVelocityRef.current.y *= 0.92;
        rootGroup.rotation.x += rotVelocityRef.current.x;
        rootGroup.rotation.y += rotVelocityRef.current.y;

        if (autoRotateRef.current) {
          rootGroup.rotation.y += 0.003;
        }
      }

      // Animate node radar rings
      nodeMarkers.forEach((grp, id) => {
        const isTarget = id === activeNodeIdRef.current;
        const ring = grp.children[0] as THREE.Mesh;
        if (ring) {
          ring.rotation.z += 0.02;
          const s = isTarget ? 1.35 + Math.sin(time * 4) * 0.25 : 1.0;
          ring.scale.set(s, s, 1);
        }
      });

      // Animate laser glow pulse
      glowTubeMat.opacity = 0.18 + Math.sin(time * 3) * 0.12;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  const handleReset = () => {
    soundEngine.playClick();
    if (!cameraRef.current || !rootGroupRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 18,
      z: 38,
      duration: 1.0,
      ease: 'power3.out',
    });
    gsap.to(rootGroupRef.current.rotation, {
      x: 0,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    });
  };

  return (
    <div
      className={`relative w-full h-full select-none ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        backgroundColor: '#07080a',
        borderRadius: '2px',
        overflow: 'hidden',
        border: '1px solid rgba(201, 20, 20, 0.45)',
        boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 50px rgba(201,20,20,0.15)',
        ...style,
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      />

      {/* Top Telemetry Header */}
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
            3D HOLOGRAPHIC BLUEPRINT // ISOMETRIC ELEVATION
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
          DRAG TO ROTATE // CLICK 3D NODES TO INSPECT
        </div>
      </div>

      {/* Quick Node Navigation Strip along bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          zIndex: 10,
          pointerEvents: 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {BLUEPRINT_NODES.map((node) => {
            const isActive = node.id === activeNodeId;
            const isHovered = node.id === hoveredNodeId;
            return (
              <button
                key={node.id}
                onClick={() => {
                  soundEngine.playRadarPing(840);
                  onSelectNode(node);
                }}
                data-cursor="explore"
                style={{
                  backgroundColor: isActive
                    ? '#c91414'
                    : isHovered
                    ? 'rgba(201, 20, 20, 0.35)'
                    : 'rgba(12, 14, 18, 0.85)',
                  border: isActive
                    ? '1px solid #ff4444'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isActive ? '#ffffff' : '#e0e0e0',
                  padding: '5px 10px',
                  borderRadius: '2px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
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
                    backgroundColor: isActive ? '#fff' : node.securityRisk === 'OMEGA' ? '#ef4444' : '#f59e0b',
                  }}
                />
                <span>{node.code}</span>
                <span className="hidden-on-small" style={{ opacity: 0.75 }}>
                  : {node.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Controls */}
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
            onClick={handleReset}
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
    </div>
  );
};
