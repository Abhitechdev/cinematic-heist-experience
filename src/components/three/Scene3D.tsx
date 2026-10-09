import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createBankExterior, type BankExteriorObject } from './createBankExterior';
import { createBankLobby, type BankLobbyObject } from './createBankLobby';
import { createSecurityCorridor, type SecurityCorridorObject } from './createSecurityCorridor';
import { createVaultAndGoldBullion, type VaultAndGoldBullionObject } from './createVaultAndGoldBullion';
import { createGoldRainController, type GoldRainController } from './createGoldRainController';
import { createBlimpAirship, type BlimpAirshipObject } from './createBlimpAirship';
import { createAtmosphericClouds, type AtmosphericCloudsObject } from './createAtmosphericClouds';
import { createBlimpMoneyRain, type BlimpMoneyRainObject } from './createBlimpMoneyRain';
import { createMoneyFlow3D, type MoneyFlow3DObject } from './createMoneyFlow3D';
import { createParticleField, type ParticleFieldObject } from './createParticleField';
import { createHeistCharacter } from './createHeistCharacter';
import { soundEngine } from '../../lib/soundEngine';
import type { VaultState } from '../../types/heist';

interface Scene3DProps {
  scrollProgress: number; // 0 to 1 across whole page
  activeSection?: string;
  vaultUnlocked?: boolean;
  vaultSequenceProgress?: number; // 0 to 1 automated progression when unlocked
  vaultState?: VaultState;
}

interface CameraWaypoint {
  p: number;
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

// 15 keyframes forming the seamless continuous architectural journey from Courtyard to Blimp Escape
const WAYPOINTS: CameraWaypoint[] = [
  // Shot 01: Wide Courtyard Exterior
  { p: 0.00, pos: new THREE.Vector3(0, 4.2, 52), target: new THREE.Vector3(0, 6.8, 0) },
  // Shot 02: Slow Approach across wet pavement
  { p: 0.07, pos: new THREE.Vector3(0, 3.6, 34), target: new THREE.Vector3(0, 4.6, 0) },
  // Shot 03: Facade becomes detailed, approaching monumental columns
  { p: 0.13, pos: new THREE.Vector3(0, 2.8, 14), target: new THREE.Vector3(0, 3.4, 0) },
  // Shot 04: Approaching central bronze entrance portal
  { p: 0.18, pos: new THREE.Vector3(0, 2.3, 3.5), target: new THREE.Vector3(0, 2.3, -12) },
  // Shot 05 & 06: Doors open, crossing threshold into Grand Lobby
  { p: 0.24, pos: new THREE.Vector3(0, 2.2, -4.5), target: new THREE.Vector3(0, 2.2, -22) },
  // Lobby: Teller counters, marble floor reflections, monitors
  { p: 0.34, pos: new THREE.Vector3(0, 2.2, -18), target: new THREE.Vector3(0, 2.2, -35) },
  // Lobby End: Approaching Security Bulkhead
  { p: 0.43, pos: new THREE.Vector3(0, 2.2, -33), target: new THREE.Vector3(0, 2.1, -52) },
  // Security Corridor: Red laser scanner, tracking CCTV gimbal
  { p: 0.52, pos: new THREE.Vector3(0, 2.1, -50), target: new THREE.Vector3(0, 2.1, -68) },
  // Security Gate Unlocked: Approaching 40-ton Vault Door (Framing frontal view at z = -82)
  { p: 0.60, pos: new THREE.Vector3(0, 2.2, -69), target: new THREE.Vector3(0, 2.2, -82) },
  // Vault Threshold: Mechanical opening sequence, golden light spill
  { p: 0.68, pos: new THREE.Vector3(0, 2.2, -78.5), target: new THREE.Vector3(0, 2.2, -85) },
  // Gold Bullion Reveal: Gliding through open vault into treasury
  { p: 0.76, pos: new THREE.Vector3(0, 2.2, -94), target: new THREE.Vector3(0, 2.2, -118) },
  // Stacks of Gold Bars & Crates (Deep Sanctuary)
  { p: 0.82, pos: new THREE.Vector3(0.4, 2.2, -106), target: new THREE.Vector3(0, 2.2, -128) },
  // ESCAPE ASCENT: Pulling away from treasury, rising into sky & storm clouds
  { p: 0.88, pos: new THREE.Vector3(0, 16, -106), target: new THREE.Vector3(0, 46, -114) },
  // BLIMP REVEAL: Camera ascends into cloud layer, looking directly upward at the airship overhead
  { p: 0.94, pos: new THREE.Vector3(0, 28, -106), target: new THREE.Vector3(0, 72, -115) },
  // MONEY RAIN CLIMAX: Huge cascade of banknotes showering straight down over camera lens
  { p: 1.00, pos: new THREE.Vector3(0, 30, -105), target: new THREE.Vector3(0, 73, -115) },
];

function interpolateCamera(p: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const clamped = Math.max(0, Math.min(1, p));

  // Find adjacent waypoints
  let idx = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (clamped >= WAYPOINTS[i].p && clamped <= WAYPOINTS[i + 1].p) {
      idx = i;
      break;
    }
  }

  const wp0 = WAYPOINTS[idx];
  const wp1 = WAYPOINTS[idx + 1] || wp0;
  const segmentDuration = wp1.p - wp0.p;
  const t = segmentDuration > 0 ? (clamped - wp0.p) / segmentDuration : 0;

  // Smooth Hermite / S-curve easing
  const smoothT = t * t * (3 - 2 * t);

  outPos.lerpVectors(wp0.pos, wp1.pos, smoothT);
  outTarget.lerpVectors(wp0.target, wp1.target, smoothT);
}

export const Scene3D: React.FC<Scene3DProps> = ({
  scrollProgress,
  activeSection: _activeSection,
  vaultUnlocked = false,
  vaultSequenceProgress = 0,
  vaultState = 'AWAITING_PASSWORD',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  // References for scene & objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const bankExteriorRef = useRef<BankExteriorObject | null>(null);
  const bankLobbyRef = useRef<BankLobbyObject | null>(null);
  const securityCorridorRef = useRef<SecurityCorridorObject | null>(null);
  const vaultRef = useRef<VaultAndGoldBullionObject | null>(null);
  const goldRainRef = useRef<GoldRainController | null>(null);
  const blimpRef = useRef<BlimpAirshipObject | null>(null);
  const cloudsRef = useRef<AtmosphericCloudsObject | null>(null);
  const blimpMoneyRainRef = useRef<BlimpMoneyRainObject | null>(null);
  const dustParticlesRef = useRef<ParticleFieldObject | null>(null);
  const goldParticlesRef = useRef<ParticleFieldObject | null>(null);
  const moneyFlowRef = useRef<MoneyFlow3DObject | null>(null);

  // Intensity state for blimp money rain
  const moneyRainIntensityRef = useRef(0);

  // Camera shake & reusable vectors
  const cameraShakeIntensityRef = useRef(0);
  const targetPosRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());

  // Mouse parallax & velocity
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const mouseVelRef = useRef({ x: 0, y: 0 });

  // Scroll velocity tracking
  const prevScrollRef = useRef(0);
  const scrollVelRef = useRef(0);

  // Sound trigger milestones
  const soundMilestonesRef = useRef({
    exteriorDoorServoPlayed: false,
    bulkheadServoPlayed: false,
    vaultUnlockPlayed: false,
    vaultDoorSwingPlayed: false,
    goldRoomEnteredPlayed: false,
    vaultMoneyBurstTriggered: false,
    pneumaticPlayed: false,
    handwheelPlayed: false,
    goldTumblePlayed: false,
    beat1Played: false,
    beat2Played: false,
    beat3Played: false,
    blimpFlyoverPlayed: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to 2D cinematic atmosphere:', err);
      setWebglAvailable(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Atmospheric late-night mist
    scene.fog = new THREE.FogExp2(0x040508, 0.016);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      240
    );
    camera.position.set(0, 4.2, 52);
    cameraRef.current = camera;

    const isInitialMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isInitialMobile ? 1.25 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // --- GLOBAL LIGHTING SYSTEM ---
    // Deep nocturnal ambient fill
    const ambientLight = new THREE.AmbientLight(0x181c24, 1.4);
    scene.add(ambientLight);

    // Moonlight: Directional cool steel-blue light from high angle
    const moonLight = new THREE.DirectionalLight(0xa5c2e0, 2.2);
    moonLight.position.set(25, 65, 35);
    scene.add(moonLight);

    // Subtle atmospheric red security wash
    const redWashLight = new THREE.PointLight(0xc91414, 2.2, 45);
    redWashLight.position.set(-6, 8, 12);
    scene.add(redWashLight);

    // Sky illumination for high-altitude blimp
    const skyLight = new THREE.DirectionalLight(0xc8dcfa, 1.8);
    skyLight.position.set(-15, 95, -90);
    scene.add(skyLight);

    // --- PROCEDURAL 3D HEIST ENVIRONMENT ---
    // 1. Bank Exterior (Facade, Columns, Pediment, Wings, Courtyard)
    const bankExterior = createBankExterior();
    scene.add(bankExterior.group);
    bankExteriorRef.current = bankExterior;

    // 2. Bank Lobby (Marble floor, Teller desks, Bulletproof glass, CCTV, ATMs)
    const bankLobby = createBankLobby();
    scene.add(bankLobby.group);
    bankLobbyRef.current = bankLobby;

    // 3. Security Corridor (Concrete tunnel, CCTV tracking, Red sweeping laser, Bulkhead)
    const securityCorridor = createSecurityCorridor();
    scene.add(securityCorridor.group);
    securityCorridorRef.current = securityCorridor;

    // 4. Massive Vault Door & Gold Bullion Room (Sequential bolts, PBR gold bars, deep sanctuary)
    const vault = createVaultAndGoldBullion();
    scene.add(vault.group);
    vaultRef.current = vault;

    // 5. Dedicated Reusable Gold Rain Controller (Physical PBR gold bars in 3 beats)
    const goldRain = createGoldRainController(-82);
    scene.add(goldRain.group);
    goldRainRef.current = goldRain;

    // 6. Atmospheric Layered Clouds in upper sky
    const clouds = createAtmosphericClouds();
    scene.add(clouds.group);
    cloudsRef.current = clouds;

    // 7. 3D Heist Blimp Airship (High altitude dirigible)
    const blimp = createBlimpAirship();
    scene.add(blimp.group);
    blimpRef.current = blimp;

    // 8. Blimp Money Rain Controller (Cascading banknotes with 3 depth layers)
    const blimpMoneyRain = createBlimpMoneyRain();
    scene.add(blimpMoneyRain.group);
    blimpMoneyRainRef.current = blimpMoneyRain;

    // 9. Environmental Dust Particles (Night mist)
    const dustParticles = createParticleField(450);
    dustParticles.points.position.set(0, 4, 15);
    scene.add(dustParticles.points);
    dustParticlesRef.current = dustParticles;

    // 10. Golden Shimmering Particles inside Vault
    const goldParticles = createParticleField(250);
    goldParticles.points.position.set(0, 4, -100);
    scene.add(goldParticles.points);
    goldParticlesRef.current = goldParticles;

    // 11. Cinematic 3D Money Flow (Instanced Banknotes in early sections)
    const moneyFlow = createMoneyFlow3D();
    scene.add(moneyFlow.group);
    moneyFlowRef.current = moneyFlow;

    // 12. Heist Operatives in scene
    const leaderChar = createHeistCharacter({ isLeader: true, scale: 0.9 });
    leaderChar.position.set(2.4, 2.0, 1.2);
    leaderChar.rotation.y = -0.5;
    scene.add(leaderChar);

    const scoutChar = createHeistCharacter({ isLeader: false, scale: 0.85 });
    scoutChar.position.set(-2.2, 2.0, -14);
    scoutChar.rotation.y = 0.4;
    scene.add(scoutChar);

    // Mouse move parallax listener
    const onMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTargetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Window resize listener with mobile DPR adaptation
    const onResize = () => {
      const isMobile = window.innerWidth < 768;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let prevFrameTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = Math.min(elapsedTime - prevFrameTime, 0.05);
      prevFrameTime = elapsedTime;

      // Lerp mouse parallax smoothly
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.05;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.05;

      // Track mouse velocity
      mouseVelRef.current.x = (mouseCurrentRef.current.x - prevMouseRef.current.x) * 12;
      mouseVelRef.current.y = (mouseCurrentRef.current.y - prevMouseRef.current.y) * 12;
      prevMouseRef.current.x = mouseCurrentRef.current.x;
      prevMouseRef.current.y = mouseCurrentRef.current.y;

      // Decay scroll velocity smoothly
      scrollVelRef.current *= 0.94;

      // Update Bank Exterior (roof beacon strobe)
      if (bankExteriorRef.current) {
        bankExteriorRef.current.update(elapsedTime);
      }

      // Update Bank Lobby (CCTV pan)
      if (bankLobbyRef.current) {
        bankLobbyRef.current.update(elapsedTime);
      }

      // Update Security Corridor (laser sweep & CCTV tracking camera)
      if (securityCorridorRef.current && cameraRef.current) {
        securityCorridorRef.current.update(elapsedTime, cameraRef.current.position);
      }

      // Update Vault (golden light pulse, surveillance camera, emergency beacons)
      if (vaultRef.current) {
        vaultRef.current.update(elapsedTime);
      }

      // Update Dedicated Gold Rain Controller physics
      if (goldRainRef.current && cameraRef.current) {
        goldRainRef.current.update(deltaTime, cameraRef.current);
      }

      // Update Atmospheric Clouds
      if (cloudsRef.current) {
        cloudsRef.current.update(elapsedTime, deltaTime);
      }

      // Update 3D Blimp Airship
      if (blimpRef.current) {
        blimpRef.current.update(elapsedTime, deltaTime);
      }

      // Update Blimp Money Rain Controller
      if (blimpMoneyRainRef.current && blimpRef.current && cameraRef.current) {
        blimpMoneyRainRef.current.update(
          elapsedTime,
          deltaTime,
          cameraRef.current,
          blimpRef.current.hatchPosition,
          moneyRainIntensityRef.current
        );
      }

      // Update Particle Fields
      if (dustParticlesRef.current) {
        dustParticlesRef.current.update(elapsedTime);
      }
      if (goldParticlesRef.current) {
        goldParticlesRef.current.update(elapsedTime);
      }

      // Update 3D Cinematic Money Flow in early sections
      if (moneyFlowRef.current && cameraRef.current) {
        moneyFlowRef.current.update(
          elapsedTime,
          scrollProgress,
          scrollVelRef.current,
          cameraRef.current.position,
          mouseVelRef.current
        );
      }

      // Apply and decay subtle camera impact shake
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion && cameraShakeIntensityRef.current > 0.001) {
        const shakeX = (Math.random() - 0.5) * cameraShakeIntensityRef.current;
        const shakeY = (Math.random() - 0.5) * cameraShakeIntensityRef.current;
        camera.position.x += shakeX;
        camera.position.y += shakeY;
        cameraShakeIntensityRef.current *= 0.88;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Handle ACCESS_DENIED camera shake trigger
  useEffect(() => {
    if (vaultState === 'ACCESS_DENIED') {
      cameraShakeIntensityRef.current = 0.35;
    }
  }, [vaultState]);

  // Sync scroll progress with continuous 3D camera trajectory and environmental mechanics
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const p = scrollProgress;

    // Compute scroll velocity
    const deltaScroll = p - prevScrollRef.current;
    prevScrollRef.current = p;
    scrollVelRef.current = deltaScroll * 55;
    if (Math.abs(scrollVelRef.current) > 2.8) {
      soundEngine.playSoftWhoosh();
    }

    // 1. Compute Base Camera Position & Look Target along the trajectory
    // When vault is locked, pause camera in front of the vault portal (p = 0.615)
    // When unlocking or opening, camera gently inches forward toward opening threshold
    let effectiveP: number;
    if (!vaultUnlocked) {
      effectiveP = p > 0.615 ? 0.615 : p;
    } else {
      // If user is still at vault, allow automated sequence progress to creep forward
      const creepForward = vaultSequenceProgress > 0.65 ? (vaultSequenceProgress - 0.65) * 0.04 : 0;
      effectiveP = Math.max(p, 0.615 + creepForward);
    }

    interpolateCamera(effectiveP, targetPosRef.current, targetLookRef.current);

    // Apply subtle controlled mouse parallax
    const parallaxX = mouseCurrentRef.current.x * 0.45;
    const parallaxY = -mouseCurrentRef.current.y * 0.25;

    camera.position.set(
      targetPosRef.current.x + parallaxX,
      targetPosRef.current.y + parallaxY,
      targetPosRef.current.z
    );
    camera.lookAt(targetLookRef.current.x, targetLookRef.current.y, targetLookRef.current.z);

    // 2. Bank Exterior Bronze Doors opening: p between 0.14 and 0.22
    if (bankExteriorRef.current) {
      if (p >= 0.14 && p <= 0.22) {
        const doorP = (p - 0.14) / 0.08;
        bankExteriorRef.current.setDoorOpenProgress(doorP);
        if (!soundMilestonesRef.current.exteriorDoorServoPlayed) {
          soundEngine.playDoorServo();
          soundMilestonesRef.current.exteriorDoorServoPlayed = true;
        }
      } else if (p > 0.22) {
        bankExteriorRef.current.setDoorOpenProgress(1.0);
      } else {
        bankExteriorRef.current.setDoorOpenProgress(0.0);
        soundMilestonesRef.current.exteriorDoorServoPlayed = false;
      }
    }

    // 3. Security Corridor Bulkhead Door: p between 0.46 and 0.54
    if (securityCorridorRef.current) {
      if (p >= 0.46 && p <= 0.54) {
        const bulkheadP = (p - 0.46) / 0.08;
        securityCorridorRef.current.setDoorProgress(bulkheadP);
        if (!soundMilestonesRef.current.bulkheadServoPlayed) {
          soundEngine.playDoorServo();
          soundMilestonesRef.current.bulkheadServoPlayed = true;
        }
      } else if (p > 0.54) {
        securityCorridorRef.current.setDoorProgress(1.0);
      } else {
        securityCorridorRef.current.setDoorProgress(0.0);
        soundMilestonesRef.current.bulkheadServoPlayed = false;
      }
    }

    // 4. Massive Vault Door Opening Animation:
    // Driven by sequence progress (or scroll if already unlocked)
    if (vaultRef.current) {
      if (vaultUnlocked) {
        const scrollVaultP = p >= 0.58 ? Math.min(1, (p - 0.58) / 0.14) : 0;
        const vaultP = Math.max(vaultSequenceProgress, scrollVaultP);
        const res = vaultRef.current.setUnlockProgress(vaultP);

        // Camera impact shake
        if (res.impactShake > 0) {
          cameraShakeIntensityRef.current = Math.max(cameraShakeIntensityRef.current, res.impactShake);
        }

        // Sound trigger for sequential bolt retraction (all 12 bolts click)
        if (res.boltIndexRetracted !== null) {
          soundEngine.playBoltRetract(res.boltIndexRetracted);
        }

        // Sound trigger for dial rotation at beginning
        if (vaultP > 0.05 && vaultP < 0.25 && Math.random() < 0.2) {
          soundEngine.playVaultClick();
        }

        // Sound trigger for handwheel spin
        if (res.handwheelSpinning && !soundMilestonesRef.current.handwheelPlayed) {
          soundEngine.playHandwheelSpin();
          soundMilestonesRef.current.handwheelPlayed = true;
        }

        // Sound trigger for pneumatic seal release
        if (res.pneumaticReleased && !soundMilestonesRef.current.pneumaticPlayed) {
          soundEngine.playPneumaticHiss();
          soundEngine.playSubBoom();
          soundMilestonesRef.current.pneumaticPlayed = true;
        }

        // Sound trigger for door swing and heavy clank
        if (res.doorOpened && !soundMilestonesRef.current.vaultDoorSwingPlayed) {
          soundEngine.playHeavyMechanicalClank();
          soundEngine.playVaultDoorMovement();
          soundMilestonesRef.current.vaultDoorSwingPlayed = true;

          // Trigger banknotes emerging from the opened vault
          if (moneyFlowRef.current) {
            moneyFlowRef.current.triggerVaultMoneyBurst();
          }
          soundEngine.playPaperFlutter();
        }

        // GOLD RAIN BEAT 1: A few bars emerge as door cracks open (p >= 0.65)
        if (vaultP >= 0.65 && !soundMilestonesRef.current.beat1Played) {
          goldRainRef.current?.triggerBeat(1);
          soundEngine.playGoldTumble();
          soundMilestonesRef.current.beat1Played = true;
        }

        // GOLD RAIN BEAT 2: Strong gold burst when vault door reaches fully open position
        if ((vaultP >= 0.90 || res.goldBurstTriggered) && !soundMilestonesRef.current.beat2Played) {
          goldRainRef.current?.triggerBeat(2);
          soundEngine.playGoldTumble();
          soundEngine.playDeepImpact();
          cameraShakeIntensityRef.current = 0.22;
          soundMilestonesRef.current.beat2Played = true;
        }

        // Sound trigger for gold bullion tumble inside
        if (res.goldBurstTriggered && !soundMilestonesRef.current.goldTumblePlayed) {
          soundEngine.playGoldTumble();
          soundMilestonesRef.current.goldTumblePlayed = true;
        }
      } else {
        // Vault is locked: fully reset vault mechanism
        vaultRef.current.setUnlockProgress(0.0);
        soundMilestonesRef.current.vaultDoorSwingPlayed = false;
        soundMilestonesRef.current.pneumaticPlayed = false;
        soundMilestonesRef.current.handwheelPlayed = false;
        soundMilestonesRef.current.goldTumblePlayed = false;
        soundMilestonesRef.current.beat1Played = false;
        soundMilestonesRef.current.beat2Played = false;
        soundMilestonesRef.current.beat3Played = false;
        goldRainRef.current?.reset();
      }
    }

    // 5. Entering the Gold Room & GOLD RAIN BEAT 3:
    // Short residual shower as the camera enters the treasury (p between 0.74 and 0.83)
    if (vaultUnlocked && p >= 0.74 && p < 0.85) {
      if (!soundMilestonesRef.current.goldRoomEnteredPlayed) {
        soundEngine.playGoldRoomAmbience();
        soundEngine.playSubBoom();
        soundMilestonesRef.current.goldRoomEnteredPlayed = true;
      }
      if (!soundMilestonesRef.current.beat3Played) {
        goldRainRef.current?.triggerBeat(3);
        soundMilestonesRef.current.beat3Played = true;
      }
    } else if (p < 0.72) {
      soundMilestonesRef.current.goldRoomEnteredPlayed = false;
    }

    // 6. CINEMATIC BLIMP ESCAPE & MONEY RAIN SEQUENCE:
    // Triggers when vault is unlocked and user progresses to escape phase (p >= 0.85 to 1.0)
    if (vaultUnlocked && p >= 0.85) {
      // Ramp intensity up from 0 to 1.0 between 0.85 and 0.94
      if (p < 0.94) {
        moneyRainIntensityRef.current = Math.min(1.0, (p - 0.85) / 0.09);
      } else if (p <= 0.98) {
        moneyRainIntensityRef.current = 1.0;
      } else {
        // Gently ease intensity as we reach the very end of exit section
        moneyRainIntensityRef.current = Math.max(0.3, 1.0 - (p - 0.98) / 0.02 * 0.6);
      }

      // Audio trigger for blimp flyover & money cascade
      if (p >= 0.88 && !soundMilestonesRef.current.blimpFlyoverPlayed) {
        soundEngine.playBlimpFlyover();
        soundEngine.playMoneyRainCascade();
        soundMilestonesRef.current.blimpFlyoverPlayed = true;
      }
    } else {
      moneyRainIntensityRef.current = 0;
      if (p < 0.82) {
        soundMilestonesRef.current.blimpFlyoverPlayed = false;
        blimpMoneyRainRef.current?.reset();
      }
    }
  }, [scrollProgress, vaultUnlocked, vaultSequenceProgress, vaultState]);

  if (!webglAvailable) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(37,4,4,0.4) 0%, #050505 85%)',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
};
