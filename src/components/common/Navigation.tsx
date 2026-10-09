import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldAlert, Music } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

interface NavigationProps {
  onNavigate: (sectionId: string) => void;
  visible: boolean;
  onOpenMusic?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, visible }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(soundEngine.isMusicPlaying());

  useEffect(() => {
    const unsub = soundEngine.subscribeMusic((playing) => {
      setIsMusicPlaying(playing);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'THE PLAN' },
    { id: 'target', label: 'THE TARGET' },
    { id: 'crew', label: 'THE CREW' },
    { id: 'blueprint', label: 'THE BLUEPRINT' },
    { id: 'vault', label: 'THE VAULT' },
    { id: 'exit', label: 'THE EXIT' },
  ];

  const handleClick = (id: string) => {
    soundEngine.playClick();
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 500,
        padding: '20px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.5s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        backgroundColor: scrolled ? 'rgba(5, 5, 5, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(139, 8, 8, 0.25)' : '1px solid transparent',
      }}
      aria-label="Main Navigation"
    >
      {/* Brand Top Left */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }}
        onClick={() => handleClick('hero')}
        data-cursor="open"
      >
        <div
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid rgba(201, 20, 20, 0.5)',
            boxShadow: '0 0 12px rgba(201, 20, 20, 0.4)',
            backgroundColor: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/logo.png"
            alt="Heist Mask Insignia"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
        <span
          className="font-display"
          style={{
            fontSize: '1.45rem',
            letterSpacing: '0.12em',
            color: '#f2eee7',
            fontWeight: 800,
          }}
        >
          ABHI STUDIOS
        </span>
        <span
          className="font-mono-tech"
          style={{
            fontSize: '9px',
            color: '#858585',
            padding: '2px 6px',
            border: '1px solid rgba(139,8,8,0.4)',
            borderRadius: '2px',
            display: window.innerWidth < 640 ? 'none' : 'inline-block',
          }}
        >
          DIRECTIVE 01
        </span>
      </div>

      {/* Desktop Links Top Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
        }}
        className="hidden-mobile"
      >
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => handleClick(link.id)}
            data-cursor="hover"
            style={{
              background: 'none',
              border: 'none',
              color: '#858585',
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.2s ease, transform 0.2s ease',
              padding: '6px 4px',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f2eee7';
              soundEngine.playClick();
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#858585';
            }}
          >
            {link.label}
          </button>
        ))}

        <div
          style={{
            height: '14px',
            width: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 4px',
          }}
        />

        {/* Money Heist Soundtrack Direct Controller */}
        <button
          onClick={() => {
            soundEngine.playClick();
            soundEngine.toggleThemeSong();
          }}
          data-cursor="hover"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isMusicPlaying ? 'rgba(201, 20, 20, 0.16)' : 'rgba(20, 20, 20, 0.75)',
            border: isMusicPlaying ? '1px solid rgba(201, 20, 20, 0.75)' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isMusicPlaying ? '0 0 14px rgba(201, 20, 20, 0.35)' : 'none',
            color: isMusicPlaying ? '#f2eee7' : '#858585',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.14em',
            padding: '5px 12px',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#c91414';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(201, 20, 20, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isMusicPlaying ? 'rgba(201, 20, 20, 0.75)' : 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = isMusicPlaying ? '0 0 14px rgba(201, 20, 20, 0.35)' : 'none';
          }}
          aria-label={isMusicPlaying ? 'Pause Money Heist Theme Song' : 'Play Money Heist Theme Song'}
          title="Money Heist — My Life Is Going On (Click to Play/Pause)"
        >
          <Music size={12} color={isMusicPlaying ? '#c91414' : '#858585'} />
          <span>{isMusicPlaying ? 'MUSIC: ON' : 'MUSIC: OFF'}</span>
          {isMusicPlaying && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', height: '10px', marginLeft: '2px' }}>
              <span style={{ width: '2px', height: '8px', backgroundColor: '#c91414', animation: 'waveformAnim 0.6s infinite alternate' }} />
              <span style={{ width: '2px', height: '11px', backgroundColor: '#e50914', animation: 'waveformAnim 0.8s infinite alternate 0.2s' }} />
              <span style={{ width: '2px', height: '6px', backgroundColor: '#c91414', animation: 'waveformAnim 0.5s infinite alternate 0.4s' }} />
            </span>
          )}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#c91414',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
          }}
        >
          <ShieldAlert size={13} />
          <span>CHANNEL SECURE</span>
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          setMobileOpen(!mobileOpen);
        }}
        style={{
          background: 'none',
          border: '1px solid rgba(139, 8, 8, 0.4)',
          color: '#f2eee7',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'none',
        }}
        className="show-mobile-btn"
        aria-label="Toggle Navigation Menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            width: '100%',
            height: 'calc(100vh - 70px)',
            backgroundColor: 'rgba(5, 5, 5, 0.98)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            zIndex: 499,
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleClick(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f2eee7',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2rem',
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => {
              soundEngine.playClick();
              soundEngine.toggleThemeSong();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isMusicPlaying ? 'rgba(201, 20, 20, 0.2)' : 'rgba(20, 20, 20, 0.85)',
              border: isMusicPlaying ? '1px solid rgba(201, 20, 20, 0.8)' : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isMusicPlaying ? '0 0 14px rgba(201, 20, 20, 0.4)' : 'none',
              color: '#f2eee7',
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.15em',
              padding: '8px 18px',
              borderRadius: '2px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            <Music size={14} color={isMusicPlaying ? '#c91414' : '#858585'} />
            <span>{isMusicPlaying ? 'MONEY HEIST THEME: LIVE' : 'PLAY MONEY HEIST THEME'}</span>
          </button>

          <div
            style={{
              color: '#c91414',
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.2em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <ShieldAlert size={14} />
            <span>OPERATIONAL TIMELINE ACTIVE</span>
          </div>
        </div>
      )}

      {/* Responsive Inline CSS for Mobile Nav */}
      <style>{`
        @media (max-width: 820px) {
          .hidden-mobile { display: none !important; }
          .show-mobile-btn { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </nav>
  );
};
