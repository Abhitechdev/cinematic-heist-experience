import React, { useRef, useEffect } from 'react';
import { Radio, Crosshair } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { SplitText } from '../react-bits/SplitText';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // Subtle mouse parallax on hero image
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;
      const xOffset = (e.clientX / window.innerWidth - 0.5) * 14;
      const yOffset = (e.clientY / window.innerHeight - 0.5) * 14;
      imageRef.current.style.transform = `scale(1.06) translate(${xOffset}px, ${yOffset}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '640px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(80px, 11vh, 100px) clamp(16px, 4vw, 36px) clamp(24px, 4vh, 40px)',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* LAYER 1: Deep black/red atmosphere base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050505',
          zIndex: 1,
        }}
      />

      {/* LAYER 2: Hero Ensemble Image with cinematic treatment */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        <img
          ref={imageRef}
          src="/assets/references/crew-hero.jpg"
          alt="Original heist crew in red jumpsuits and masks"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 38%',
            transform: 'scale(1.05)',
            filter: 'contrast(1.22) brightness(0.82) saturate(1.15)',
            transition: 'transform 0.4s ease-out',
          }}
          loading="eager"
        />
      </div>

      {/* LAYER 3: Dark Gradient Overlay (edges and bottom falloff) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          background: `
            linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.1) 40%, rgba(5,5,5,0.85) 85%, #050505 100%),
            radial-gradient(circle at 50% 50%, transparent 40%, rgba(5,5,5,0.85) 95%)
          `,
        }}
      />

      {/* LAYER 4: Red Atmospheric Lighting Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          background: 'radial-gradient(circle at 50% 35%, rgba(139, 8, 8, 0.32) 0%, transparent 65%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* LAYER 7: Tactical HUD Foreground Overlays (Crosshairs & Surveillance Metadata) */}
      <div
        className="hidden-on-small"
        style={{
          position: 'absolute',
          inset: 'clamp(14px, 3vw, 30px)',
          zIndex: 5,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            className="font-mono-tech"
            style={{
              color: 'rgba(242, 238, 231, 0.5)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Crosshair size={14} color="#c91414" />
            <span>CAM_01 // OVERHEAD PERIMETER [RECORDING]</span>
          </div>
          <div
            className="font-mono-tech"
            style={{
              color: '#c91414',
              fontSize: '11px',
              letterSpacing: '0.15em',
            }}
          >
            SYS.TIME: 03:00:14:09
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            className="font-mono-tech"
            style={{
              color: '#858585',
              fontSize: '10px',
              letterSpacing: '0.12em',
            }}
          >
            GRID: 40.4168° N, 3.7038° W<br />
            STATUS: SYNCHRONIZED
          </div>
          <div
            className="font-mono-tech"
            style={{
              color: '#858585',
              fontSize: '10px',
              textAlign: 'right',
            }}
          >
            CONTINGENCY: OMEGA-4<br />
            SECURITY DEPLOYMENT: STANDBY
          </div>
        </div>
      </div>

      {/* LAYER 8: Typography & Strategic Phrasing */}
      <div
        style={{
          position: 'relative',
          zIndex: 6,
          maxWidth: '1200px',
          margin: 'auto 0 0',
          width: '100%',
        }}
      >
        {/* Masked reveal sub-labels */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <span className="dossier-tag">
            <Radio size={12} />
            PHASE 01 // INITIATED
          </span>
          <span
            className="font-mono-tech"
            style={{
              color: '#c91414',
              fontSize: '12px',
              letterSpacing: '0.2em',
              fontWeight: 500,
            }}
          >
            EVERY PLAN NEEDS A CREW.
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-display"
          style={{
            fontSize: 'clamp(3.5rem, 8.5vw, 7.8rem)',
            lineHeight: 0.92,
            letterSpacing: '0.03em',
            color: '#f2eee7',
            textTransform: 'uppercase',
            maxWidth: '1100px',
            marginBottom: '24px',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.9)',
          }}
        >
          <SplitText
            text="THE PLAN IS ALREADY IN MOTION."
            highlightWords={['IN', 'MOTION']}
            highlightColor="#c91414"
            stagger={45}
            delay={200}
          />
        </h1>

        {/* Tactical Overview Copy */}
        <p
          style={{
            maxWidth: '580px',
            color: '#858585',
            fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          A synchronized assault on time itself. Five operatives, zero margin for hesitation,
          and a timeline calculated down to the millisecond.
        </p>

        {/* Action CTAs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <button
            onClick={() => {
              soundEngine.playClick();
              onExploreClick();
            }}
            className="btn-heist"
            data-cursor="explore"
          >
            COMMENCE THE BRIEFING
          </button>

          <a
            href="#blueprint"
            onClick={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              const el = document.getElementById('blueprint');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-heist-outline"
            data-cursor="hover"
          >
            INSPECT BLUEPRINT
          </a>
        </div>
      </div>

      {/* LAYER 10: Scroll Indicator */}
      <div
        style={{
          position: 'relative',
          zIndex: 6,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '36px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '36px',
            border: '1.5px solid rgba(242, 238, 231, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '6px',
          }}
        >
          <div
            style={{
              width: '3px',
              height: '8px',
              backgroundColor: '#c91414',
              borderRadius: '2px',
              animation: 'beaconPulse 1.8s infinite ease-in-out',
            }}
          />
        </div>
        <span
          className="font-mono-tech"
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: '#858585',
          }}
        >
          SCROLL TO INFILTRATE
        </span>
      </div>
    </section>
  );
};
