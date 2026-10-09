import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './lib/gsap';
import { Preloader } from './components/common/Preloader';
import { Navigation } from './components/common/Navigation';
import { CustomCursor } from './components/common/CustomCursor';
import { AudioController } from './components/common/AudioController';
import { VignetteGrain } from './components/common/VignetteGrain';
import { Scene3D } from './components/three/Scene3D';

import { soundEngine } from './lib/soundEngine';
import type { VaultState } from './types/heist';

import { HeroSection } from './components/sections/HeroSection';
import { BankRevealSection } from './components/sections/BankRevealSection';
import { CrewSection } from './components/sections/CrewSection';
import { CinematicInterludeSection } from './components/sections/CinematicInterludeSection';
import { BlueprintSection } from './components/sections/BlueprintSection';
import { VaultSection } from './components/sections/VaultSection';
import { HeistSection } from './components/sections/HeistSection';
import { RulesSection } from './components/sections/RulesSection';
import { ClockSection } from './components/sections/ClockSection';
import { CrewMovesSection } from './components/sections/CrewMovesSection';
import { FinalPlanSection } from './components/sections/FinalPlanSection';
import { ExitSection } from './components/sections/ExitSection';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  // Explicit Vault State Machine (Section 7)
  const [vaultState, setVaultState] = useState<VaultState>('APPROACHING_VAULT');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultSequenceProgress, setVaultSequenceProgress] = useState(0);
  const [cinematicVaultMode, setCinematicVaultMode] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const vaultTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize Lenis smooth scroll and GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.8,
      syncTouch: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { progress: number }) => {
      const p = e.progress;
      setScrollProgress(p);
      ScrollTrigger.update();

      // Rule: Do not bypass password by scrolling forward when locked
      // Vault section threshold is around progress 0.61 - 0.63
      if (!isVaultUnlocked && p > 0.62) {
        // Prevent skipping ahead of vault without authorization
        const vaultEl = document.getElementById('vault');
        if (vaultEl) {
          lenis.scrollTo(vaultEl, { immediate: false, duration: 0.4 });
        }
      }

      // Update state machine based on scroll progress if not in active unlocking timeline
      if (!isVaultUnlocked) {
        if (p < 0.54) {
          setVaultState('APPROACHING_VAULT');
        } else {
          setVaultState('AWAITING_PASSWORD');
        }
      } else {
        if (p >= 0.74 && p < 0.95) {
          setVaultState('TREASURY');
        } else if (p >= 0.95) {
          setVaultState('COMPLETE');
        }
      }
    });

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, [isVaultUnlocked]);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -20, duration: 1.4 });
      setActiveSection(sectionId);
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Coordinated Master GSAP Timeline for Physical 3D Vault Opening (Section 5)
  const handleVaultUnlock = () => {
    if (isVaultUnlocked) return;
    setIsVaultUnlocked(true);
    setVaultState('UNLOCKING');
    setCinematicVaultMode(true);
    soundEngine.startCinematicAmbient();

    // Kill any existing timeline
    if (vaultTimelineRef.current) {
      vaultTimelineRef.current.kill();
    }

    const animObj = { progress: 0 };
    const tl = gsap.timeline();
    vaultTimelineRef.current = tl;

    // Phase A & B: Lockdown & Mechanical Unlocking
    // Dial rotation -> 12 bolts sequential retraction -> Handwheel spin -> Pneumatic decompression
    tl.to(animObj, {
      progress: 0.65,
      duration: 3.8,
      ease: 'power1.inOut',
      onUpdate: () => {
        setVaultSequenceProgress(animObj.progress);
      },
    });

    // Phase C: Heavy Door Swing Open around Left Hinge (Gold rain Beat 1 emerges)
    tl.to(animObj, {
      progress: 0.92,
      duration: 3.6,
      ease: 'power2.inOut',
      onStart: () => {
        setVaultState('OPENING');
      },
      onUpdate: () => {
        setVaultSequenceProgress(animObj.progress);
      },
    });

    // Phase D & E: Treasury Reveal & Gold Eruption (Impact Clank + Gold rain Beat 2 burst)
    tl.to(animObj, {
      progress: 1.0,
      duration: 2.2,
      ease: 'power2.out',
      onStart: () => {
        setVaultState('GOLD_REVEAL');
      },
      onUpdate: () => {
        setVaultSequenceProgress(animObj.progress);
      },
      onComplete: () => {
        setTimeout(() => {
          setCinematicVaultMode(false);
        }, 1600);
      },
    });
  };

  const handleVaultDenied = () => {
    setVaultState('ACCESS_DENIED');
    setTimeout(() => {
      setVaultState('AWAITING_PASSWORD');
    }, 1200);
  };

  const handleEnterTreasury = () => {
    setVaultState('TREASURY');
    handleNavigate('rules');
  };

  const handleReplay = () => {
    if (vaultTimelineRef.current) {
      vaultTimelineRef.current.kill();
    }
    setIsVaultUnlocked(false);
    setVaultSequenceProgress(0);
    setCinematicVaultMode(false);
    setVaultState('APPROACHING_VAULT');
    soundEngine.stopCinematicAmbient();

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.8 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveSection('hero');
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#050505' }}>
      {/* Cinematic Preloader */}
      {loading && (
        <Preloader
          onComplete={() => {
            setLoading(false);
            soundEngine.playThemeSong();
          }}
        />
      )}

      {/* Custom Precision Cursor */}
      <CustomCursor />

      {/* Atmospheric Overlays */}
      <VignetteGrain />

      {/* Fixed 3D WebGL Canvas Layer */}
      <Scene3D
        scrollProgress={scrollProgress}
        activeSection={activeSection}
        vaultUnlocked={isVaultUnlocked}
        vaultSequenceProgress={vaultSequenceProgress}
        vaultState={vaultState}
      />

      {/* Subtle Restrained Golden Flash on Impact (Only brief micro-bloom, never covering 3D meshes) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.25) 0%, rgba(255, 170, 0, 0.1) 40%, rgba(0, 0, 0, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: isVaultUnlocked && vaultSequenceProgress >= 0.90 && vaultSequenceProgress <= 0.98 ? 0.35 : 0,
          mixBlendMode: 'screen',
          transition: 'opacity 0.35s ease-out',
        }}
      />

      {/* Navigation Bar (fades out during immersive cinematic vault opening sequence) */}
      <Navigation
        onNavigate={handleNavigate}
        visible={!loading && !cinematicVaultMode}
      />

      {/* Direct Money Heist Soundtrack Controller */}
      <AudioController />

      {/* Main Cinematic Scroll Storyline */}
      <main style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'hidden' }}>
        <HeroSection onExploreClick={() => handleNavigate('target')} />
        <BankRevealSection />
        <CrewSection />
        <CinematicInterludeSection />
        <BlueprintSection />
        <VaultSection
          isVaultUnlocked={isVaultUnlocked}
          onVaultUnlock={handleVaultUnlock}
          onVaultDenied={handleVaultDenied}
          vaultSequenceProgress={vaultSequenceProgress}
          vaultState={vaultState}
          onEnterTreasury={handleEnterTreasury}
          onProceedToEscape={() => handleNavigate('final-plan')}
        />
        <HeistSection />
        <RulesSection />
        <ClockSection scrollProgress={scrollProgress} />
        <CrewMovesSection />
        <FinalPlanSection />
        <ExitSection onReplay={handleReplay} />
      </main>
    </div>
  );
};

export default App;
