import React from 'react';
import { RotateCcw, ArrowUp, Shield, Terminal, ExternalLink } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { SplitText } from '../react-bits/SplitText';

interface ExitSectionProps {
  onReplay: () => void;
}

export const ExitSection: React.FC<ExitSectionProps> = ({ onReplay }) => {
  return (
    <footer
      id="exit"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '80vh',
        padding: '120px 36px 60px',
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(5, 5, 5, 0.75) 45%, #050505 100%)',
        borderTop: '1px solid rgba(139, 8, 8, 0.35)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <span className="dossier-tag" style={{ marginBottom: '20px' }}>
          <Terminal size={12} />
          OPERATION STATUS // MISSION EXECUTED
        </span>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(3.5rem, 8.5vw, 7.2rem)',
            color: '#f2eee7',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            marginBottom: '20px',
          }}
        >
          <SplitText
            text="GET OUT."
            highlightWords={['OUT.']}
            highlightColor="#c91414"
            stagger={90}
            delay={150}
          />
        </h2>

        {/* Cinematic Epilogue */}
        <div style={{ marginBottom: '36px' }}>
          <p
            className="font-display"
            style={{
              color: '#f2eee7',
              fontSize: 'clamp(1.5rem, 2.6vw, 2.2rem)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            THE PLAN WAS PERFECT.
          </p>
          <p
            className="font-mono-tech"
            style={{
              color: '#c91414',
              fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)',
              letterSpacing: '0.14em',
              fontWeight: 700,
            }}
          >
            THE EXIT WASN'T.
          </p>
        </div>

        <p
          style={{
            color: '#858585',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: '0 auto 40px',
          }}
        >
          The vaults are empty. The cameras recorded a phantom loop.
          The crew has melted into the metropolitan crowd without firing a single weapon.
        </p>

        {/* Action Replay Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '18px',
            marginBottom: '60px',
          }}
        >
          <button
            onClick={() => {
              soundEngine.playSubBoom();
              onReplay();
            }}
            className="btn-heist"
            data-cursor="explore"
          >
            <RotateCcw size={18} />
            REPLAY OPERATION
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-heist-outline"
            data-cursor="hover"
          >
            <ArrowUp size={18} />
            RETURN TO SURFACE
          </button>
        </div>
      </div>

      {/* Credits & Disclaimer */}
      <div
        style={{
          maxWidth: '860px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          width: '100%',
        }}
      >
        {/* Official Music Credit Card */}
        <div
          style={{
            backgroundColor: '#0a0a0c',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 20px',
            marginBottom: '28px',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            textAlign: 'left',
          }}
        >
          <div
            className="font-mono-tech"
            style={{ fontSize: '10px', color: '#c91414', letterSpacing: '0.14em' }}
          >
            CINEMATIC SOUNDTRACK
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              soundEngine.toggleThemeSong();
            }}
            data-cursor="hover"
            style={{
              color: '#f2eee7',
              fontSize: '1.05rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0,
              textAlign: 'left',
            }}
          >
            <span>My Life Is Going On — Cecilia Krull (Money Heist)</span>
            <ExternalLink size={13} color="#c91414" />
          </button>
          <div
            className="font-mono-tech"
            style={{ fontSize: '11px', color: '#858585', display: 'flex', gap: '14px' }}
          >
            <span>Official Heist Theme</span>
            <span>•</span>
            <span style={{ color: '#c91414' }}>
              Integrated Audio Player
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#858585',
            fontSize: '11px',
            fontFamily: "'DM Mono', monospace",
            marginBottom: '14px',
            letterSpacing: '0.12em',
          }}
        >
          <Shield size={12} color="#c91414" />
          <span>FAN-MADE / UNOFFICIAL PROJECT</span>
        </div>

        <div
          style={{
            color: '#666666',
            fontSize: '11px',
            lineHeight: 1.65,
            fontFamily: "'DM Mono', monospace",
            textAlign: 'left',
          }}
        >
          <p style={{ margin: '0 0 10px 0' }}>
            This is an independent, non-official fan-made cinematic web experience inspired by the visual atmosphere and themes of La Casa de Papel / Money Heist.
          </p>
          <p style={{ margin: '0 0 10px 0' }}>
            This project is not affiliated with, endorsed by, sponsored by, or officially connected to Netflix, La Casa de Papel / Money Heist, its producers, cast, creators, music rights holders, or other respective rights holders.
          </p>
          <p style={{ margin: 0 }}>
            All trademarks, character names, artwork, music, and other copyrighted material belong to their respective owners. Fan-made non-commercial interactive cinematic portfolio study.
          </p>
        </div>

        <div
          className="font-mono-tech"
          style={{
            fontSize: '11px',
            color: '#858585',
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          DESIGNED & DIRECTED BY <span style={{ color: '#f2eee7', fontWeight: 600 }}>ABHI STUDIOS</span> // 2026
        </div>
      </div>
    </footer>
  );
};
