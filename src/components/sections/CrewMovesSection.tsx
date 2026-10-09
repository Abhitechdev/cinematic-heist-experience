import React, { useRef } from 'react';
import { Eye, Radio, Shield } from 'lucide-react';

export const CrewMovesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="crew-moves"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '120px 36px',
        backgroundColor: '#050505',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background Hero Image with Deep Red Treatment */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.35,
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/hero-ensemble.jpg"
          alt="Ensemble crew viewed through heightened tension lens"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 45%',
            filter: 'contrast(1.3) brightness(0.6) saturate(1.4) hue-rotate(-10deg)',
            transform: 'scale(1.12)',
          }}
          loading="lazy"
        />
      </div>

      {/* Radial Wash and vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'radial-gradient(circle at center, rgba(37,4,4,0.7) 0%, rgba(5,5,5,0.95) 85%)',
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '1100px',
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <span className="dossier-tag">
            <Radio size={12} />
            CLIMACTIC SYNCHRONIZATION
          </span>
          <span
            className="font-mono-tech"
            style={{
              color: '#858585',
              fontSize: '11px',
            }}
          >
            CONVERGENCE AT CENTRAL CORRIDOR
          </span>
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(3rem, 7vw, 6.2rem)',
            color: '#f2eee7',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            lineHeight: 0.95,
            marginBottom: '24px',
          }}
        >
          THE CREW <span style={{ color: '#c91414' }}>ADVANCES</span>
        </h2>

        <p
          style={{
            color: '#cfcac2',
            fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)',
            lineHeight: 1.7,
            maxWidth: '780px',
            margin: '0 auto 36px',
          }}
        >
          Masks lowered. Breathing disciplined. The difference between an unforgettable heist
          and a federal disaster is five seconds of total collective restraint.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            color: '#858585',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={13} color="#c91414" />
            <span>RADIAL SURVEILLANCE: BLIND</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} color="#22c55e" />
            <span>CREW RECOVERY VECTOR: SECURED</span>
          </div>
        </div>
      </div>
    </section>
  );
};
