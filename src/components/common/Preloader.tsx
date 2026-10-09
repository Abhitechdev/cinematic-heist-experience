import React, { useEffect, useState } from 'react';
import { soundEngine } from '../../lib/soundEngine';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Ultra-fast responsive loading under 500ms
    const steps = [
      { target: 45, delay: 100 },
      { target: 80, delay: 250 },
      { target: 100, delay: 420 },
    ];

    const timeouts = steps.map(({ target, delay }) =>
      setTimeout(() => {
        setProgress(target);
        if (target === 100) {
          setIsReady(true);
          soundEngine.playRadarPing(520);
          soundEngine.playThemeSong();
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              onComplete();
            }, 300);
          }, 200);
        }
      }, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  // Instant skip on click/tap
  const handleInstantDismiss = () => {
    soundEngine.playThemeSong();
    setFadeOut(true);
    setTimeout(onComplete, 150);
  };

  return (
    <div
      onClick={handleInstantDismiss}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-700 ease-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
        cursor: 'pointer',
      }}
    >
      {/* Background Red Glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,20,20,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)',
          transition: 'all 0.5s ease',
          transform: isReady ? 'scale(1.4)' : 'scale(1)',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '380px',
          width: '90%',
          padding: '24px',
        }}
      >
        {/* Heist Mask Insignia */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid rgba(201, 20, 20, 0.65)',
            boxShadow: '0 0 24px rgba(201, 20, 20, 0.55)',
            marginBottom: '18px',
            backgroundColor: '#050505',
          }}
        >
          <img
            src="/assets/logo.png"
            alt="Heist Mask Emblem"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Red blinking indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#c91414',
              boxShadow: '0 0 10px #c91414',
              animation: 'beaconPulse 1.2s infinite ease-in-out',
            }}
          />
          <span
            className="font-mono-tech"
            style={{
              color: '#858585',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            SYSTEM PROTOCOL // 004
          </span>
        </div>

        {/* Status text */}
        <h2
          className="font-display"
          style={{
            color: '#f2eee7',
            fontSize: '2rem',
            letterSpacing: '0.12em',
            textAlign: 'center',
            marginBottom: '18px',
          }}
        >
          {isReady ? 'THE PLAN IS READY.' : 'INITIALIZING THE PLAN'}
        </h2>

        {/* Progress Bar Container */}
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#c91414',
              boxShadow: '0 0 12px #c91414',
              transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Numerical Counter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            color: '#858585',
          }}
        >
          <span>CLEARANCE GRANTED</span>
          <span style={{ color: '#c91414', fontWeight: 600 }}>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
