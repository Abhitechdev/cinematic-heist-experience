import React from 'react';
import { Timer, AlertOctagon } from 'lucide-react';

interface ClockSectionProps {
  scrollProgress: number;
}

export const ClockSection: React.FC<ClockSectionProps> = ({ scrollProgress }) => {
  // Compute minutes and seconds based on progress
  const totalSeconds = Math.max(0, Math.floor(3599 * (1 - scrollProgress * 0.95)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(Math.random() * 99);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <section
      id="clock"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '140px 36px',
        backgroundColor: '#070505',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1100px', width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <span className="dossier-tag">
            <Timer size={12} />
            COUNTDOWN PROTOCOL // NON-NEGOTIABLE
          </span>
          <span
            className="font-mono-tech"
            style={{
              color: '#c91414',
              fontSize: '11px',
              letterSpacing: '0.15em',
            }}
          >
            LIVE SATELLITE SYNC
          </span>
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            color: '#f2eee7',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '32px',
          }}
        >
          WHEN THE CLOCK RUNS OUT, <span style={{ color: '#c91414' }}>THERE IS NO RESET.</span>
        </h2>

        {/* Giant Monospace Heist Digital Countdown Timer */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#050303',
            border: '2px solid #8b0808',
            boxShadow: '0 0 50px rgba(201, 20, 20, 0.2), inset 0 0 40px rgba(0,0,0,0.9)',
            padding: '40px 20px',
            borderRadius: '4px',
            marginBottom: '32px',
          }}
        >
          <div
            className="font-mono-tech"
            style={{
              fontSize: 'clamp(3.8rem, 12vw, 9.5rem)',
              fontWeight: 800,
              color: '#c91414',
              letterSpacing: '0.06em',
              lineHeight: 1,
              textShadow: '0 0 30px rgba(201, 20, 20, 0.65)',
            }}
          >
            00:{format2(minutes)}:{format2(seconds)}
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: '#858585', marginLeft: '8px' }}>
              .{format2(milliseconds)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '20px',
              borderTop: '1px solid rgba(201, 20, 20, 0.2)',
              paddingTop: '16px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              color: '#858585',
            }}
          >
            <span>HOURS</span>
            <span>MINUTES</span>
            <span>SECONDS</span>
            <span>CENTISECONDS</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#858585',
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
          }}
        >
          <AlertOctagon size={16} color="#c91414" />
          <span>POLICE PERIMETER TACTICAL ETA: 12 MINUTES</span>
        </div>
      </div>
    </section>
  );
};
