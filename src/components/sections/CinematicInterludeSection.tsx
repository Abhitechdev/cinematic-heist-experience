import React from 'react';
import { Radio, Crosshair } from 'lucide-react';

export const CinematicInterludeSection: React.FC = () => {
  return (
    <section
      id="cinematic-interlude"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '65vh',
        height: '75vh',
        maxHeight: '750px',
        overflow: 'hidden',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderTop: '1px solid rgba(201, 20, 20, 0.3)',
        borderBottom: '1px solid rgba(201, 20, 20, 0.3)',
      }}
    >
      {/* Background Widescreen Cinematic Image (Reference Image 5) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/references/crew-interlude-cinematic.jpg"
          alt="Masked Operatives Perimeter Standoff"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 45%',
            filter: 'contrast(1.25) brightness(0.72) saturate(1.15)',
            transform: 'scale(1.04)',
            transition: 'transform 8s ease-out',
          }}
        />
      </div>

      {/* Cinematic Anamorphic Letterbox Bars (Top & Bottom) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '48px',
          backgroundColor: '#030303',
          zIndex: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48px',
          backgroundColor: '#030303',
          zIndex: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* Dark Vignette & Red Perimeter Ambience Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(139, 8, 8, 0.28) 0%, rgba(5, 5, 5, 0.75) 75%, #050505 100%),
            linear-gradient(to right, rgba(5, 5, 5, 0.85) 0%, transparent 30%, transparent 70%, rgba(5, 5, 5, 0.85) 100%)
          `,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Cinematic Technical HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '64px',
          left: '36px',
          right: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <div
          className="font-mono-tech"
          style={{
            color: '#c91414',
            fontSize: '11px',
            letterSpacing: '0.18em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Crosshair size={14} />
          <span>CINEMATIC INTERLUDE // SURVEILLANCE FEED 07</span>
        </div>

        <div
          className="font-mono-tech"
          style={{
            color: 'rgba(255, 255, 255, 0.45)',
            fontSize: '10px',
            letterSpacing: '0.12em',
          }}
        >
          PERIMETER LOCK: ENGAGED // 67 HOSTAGES SECURED
        </div>
      </div>

      {/* Center Cinematic Narrative Quote */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: '920px',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(201, 20, 20, 0.25)',
            border: '1px solid #c91414',
            padding: '4px 12px',
            borderRadius: '2px',
            marginBottom: '20px',
          }}
        >
          <Radio size={12} color="#c91414" />
          <span
            className="font-mono-tech"
            style={{
              color: '#f2eee7',
              fontSize: '10px',
              letterSpacing: '0.2em',
            }}
          >
            INTERCEPTED TRANSMISSION // 154.20 MHz
          </span>
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
            lineHeight: 1.02,
            letterSpacing: '0.04em',
            color: '#f2eee7',
            textTransform: 'uppercase',
            marginBottom: '16px',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.9)',
          }}
        >
          "WE ARE NOT STEALING ANYONE'S MONEY.<br />
          <span style={{ color: '#c91414' }}>WE ARE PRINTING OUR OWN."</span>
        </h2>

        <p
          className="font-mono-tech"
          style={{
            color: '#8f857e',
            fontSize: 'clamp(0.82rem, 1vw, 0.95rem)',
            letterSpacing: '0.1em',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          PROTOCOL ZERO: CIVILIAN CASUALTIES = 0. DRILL PENETRATION RATE = 1.8mm/SEC.<br />
          APPROACHING SUB-GROUND LEVEL 03 // VAULT PASSCODE TERMINAL.
        </p>
      </div>

      {/* Bottom Technical Readout */}
      <div
        style={{
          position: 'absolute',
          bottom: '64px',
          left: '36px',
          right: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <div
          className="font-mono-tech"
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '10px',
          }}
        >
          NATIONAL RESERVE SANCTUARY // MADRID
        </div>
        <div
          className="font-mono-tech"
          style={{
            color: '#c91414',
            fontSize: '10px',
            letterSpacing: '0.15em',
          }}
        >
          NEXT PHASE: INFILTRATION BLUEPRINT &rarr;
        </div>
      </div>
    </section>
  );
};
