import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(soundEngine.isMusicPlaying());
  const [volume, setVolume] = useState(soundEngine.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Subscribe to soundEngine music playback status
    const unsub = soundEngine.subscribeMusic((playing) => {
      setIsPlaying(playing);
    });

    // Keyboard shortcut 'M' to toggle mute/pause
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsub();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSound = () => {
    soundEngine.playClick();
    const nextPlaying = soundEngine.toggleThemeSong();
    setIsPlaying(nextPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(11, 11, 11, 0.92)',
        backdropFilter: 'blur(16px)',
        border: isPlaying ? '1px solid rgba(201, 20, 20, 0.65)' : '1px solid rgba(139, 8, 8, 0.35)',
        boxShadow: isPlaying ? '0 4px 24px rgba(201, 20, 20, 0.25), 0 0 12px rgba(0, 0, 0, 0.8)' : '0 4px 20px rgba(0, 0, 0, 0.7)',
        padding: '8px 14px',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
      role="region"
      aria-label="Money Heist Soundtrack Controller"
    >
      {/* Audio Waveform Animation when active */}
      {isPlaying && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '16px',
            paddingRight: '2px',
          }}
          aria-hidden="true"
        >
          {[0.6, 1.3, 0.8, 1.5, 0.9].map((heightScale, i) => (
            <span
              key={i}
              style={{
                width: '2px',
                height: `${heightScale * 10}px`,
                backgroundColor: '#c91414',
                borderRadius: '1px',
                animation: `waveformAnim 0.75s ease-in-out infinite alternate ${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Single Money Heist Audio Toggle Button */}
      <button
        onClick={toggleSound}
        data-cursor="hover"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: isPlaying ? '#f2eee7' : '#858585',
          cursor: 'pointer',
          padding: 0,
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.12em',
        }}
        aria-label={isPlaying ? 'Pause Money Heist Soundtrack' : 'Play Money Heist Soundtrack'}
        title="Press 'M' or click to toggle Money Heist Soundtrack"
      >
        {isPlaying ? (
          <Volume2 size={16} color="#c91414" />
        ) : (
          <VolumeX size={16} color="#858585" />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ fontWeight: 600, color: isPlaying ? '#f2eee7' : '#999', fontSize: '10.5px' }}>
            {isPlaying ? 'MONEY HEIST: LIVE' : 'MONEY HEIST: OFF'}
          </span>
          <span style={{ fontSize: '8.5px', color: '#777', letterSpacing: '0.08em' }}>
            MY LIFE IS GOING ON
          </span>
        </div>
      </button>

      {/* Volume Slider Drawer on Hover */}
      {showVolumeSlider && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '6px',
            paddingLeft: '8px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Soundtrack Volume"
            style={{
              width: '60px',
              accentColor: '#c91414',
              cursor: 'pointer',
            }}
          />
        </div>
      )}

      {/* Key shortcut indicator */}
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          color: isPlaying ? '#c91414' : '#555',
          border: isPlaying ? '1px solid rgba(201, 20, 20, 0.4)' : '1px solid #333',
          padding: '1px 5px',
          borderRadius: '2px',
        }}
      >
        [M]
      </span>

      <style>{`
        @keyframes waveformAnim {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
};
