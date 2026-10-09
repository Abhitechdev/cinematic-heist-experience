import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Eye, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Radio } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export interface CCTVChannel {
  id: string;
  code: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'INTERCEPTED' | 'JAMMED';
  targetSection: string;
  fps: number;
  intel: string;
}

export const CCTV_CHANNELS: CCTVChannel[] = [
  {
    id: 'cam-01',
    code: 'CAM-01',
    name: 'PERIMETER NORTH // COLONNADE',
    location: 'Exterior Plaza & Decoy Van Ingress',
    status: 'ONLINE',
    targetSection: 'target',
    fps: 24,
    intel: 'Decoy transport parked under portico archway. 04 perimeter guards unaware.',
  },
  {
    id: 'cam-02',
    code: 'CAM-02',
    name: 'CENTRAL LOBBY & CASHIER HALL',
    location: 'Level 00 // Tellers & Civilian Reception',
    status: 'INTERCEPTED',
    targetSection: 'crew',
    fps: 20,
    intel: 'Operatives established perimeter control. Civilian communication devices seized.',
  },
  {
    id: 'cam-03',
    code: 'CAM-03',
    name: 'SECURITY CORRIDOR // TRIPWIRES',
    location: 'Sub-Level -01 // Laser Tripwire Tunnel',
    status: 'ONLINE',
    targetSection: 'blueprint',
    fps: 30,
    intel: 'Active pneumatic bulkhead locked. Dual 650nm laser tripwires scanning tunnel.',
  },
  {
    id: 'cam-04',
    code: 'CAM-04',
    name: 'SUB-VAULT 07 // 40-TON SANCTUARY',
    location: 'Sub-Level -02 // Bullion Vault Portal',
    status: 'INTERCEPTED',
    targetSection: 'vault',
    fps: 15,
    intel: '12 radial pneumatic locking bolts armed. Electronic keypad awaiting authorization.',
  },
];

interface CCTVSurveillanceTerminalProps {
  onNavigateSection?: (sectionId: string) => void;
  className?: string;
}

export const CCTVSurveillanceTerminal: React.FC<CCTVSurveillanceTerminalProps> = ({
  onNavigateSection,
  className = '',
}) => {
  const [activeCam, setActiveCam] = useState<CCTVChannel>(CCTV_CHANNELS[0]);
  const [visionMode, setVisionMode] = useState<'normal' | 'thermal' | 'night'>('normal');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const [laserBypassed, setLaserBypassed] = useState(false);
  const [timecode, setTimecode] = useState('11:42:19.45');

  // Realistic timecode clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}.${ms}`);
    }, 75);
    return () => clearInterval(timer);
  }, []);

  const handleSelectChannel = (channel: CCTVChannel) => {
    soundEngine.playStaticGlitch();
    setGlitchActive(true);
    setActiveCam(channel);
    setPanOffset({ x: 0, y: 0 });
    setTimeout(() => {
      setGlitchActive(false);
    }, 280);
  };

  const handlePan = (dx: number, dy: number) => {
    soundEngine.playCameraServo();
    setPanOffset((prev) => ({
      x: Math.max(-28, Math.min(28, prev.x + dx)),
      y: Math.max(-18, Math.min(18, prev.y + dy)),
    }));
  };

  const handleToggleLaserOverride = () => {
    soundEngine.playClick();
    if (!laserBypassed) {
      soundEngine.playPneumaticHiss();
    }
    setLaserBypassed(!laserBypassed);
  };

  const handleJumpToScene = () => {
    soundEngine.playRadarPing(880);
    if (onNavigateSection) {
      onNavigateSection(activeCam.targetSection);
    }
  };

  // Vision mode color themes
  const filterStyle =
    visionMode === 'night'
      ? 'sepia(1) hue-rotate(85deg) saturate(2.5) contrast(1.2)'
      : visionMode === 'thermal'
      ? 'contrast(1.6) invert(0.15) hue-rotate(180deg)'
      : 'none';

  return (
    <div
      className={`cctv-terminal-container ${className}`}
      style={{
        backgroundColor: '#07080a',
        border: '1px solid rgba(201, 20, 20, 0.4)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.9), inset 0 0 25px rgba(201, 20, 20, 0.12)',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      {/* Top Header Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          backgroundColor: 'rgba(15, 17, 22, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444',
              animation: 'beaconPulse 1s infinite',
            }}
          />
          <span className="font-mono-tech" style={{ fontSize: '11px', color: '#f2eee7', letterSpacing: '0.15em' }}>
            TACTICAL CCTV SURVEILLANCE FEED // LIVE INTERCEPT
          </span>
        </div>

        {/* Live Channel Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CCTV_CHANNELS.map((ch) => {
            const isActive = ch.id === activeCam.id;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                style={{
                  backgroundColor: isActive ? '#c91414' : 'rgba(25, 28, 36, 0.8)',
                  color: isActive ? '#fff' : '#888',
                  border: isActive ? '1px solid #ff4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                {ch.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CCTV Monitor Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(280px, 42vw, 460px)',
          backgroundColor: '#020304',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Animated CRT Scanlines Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 3px, 6px 100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Glitch / Static noise flash */}
        {glitchActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              zIndex: 12,
              backdropFilter: 'invert(0.7) blur(2px)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Simulated CCTV Camera View Area with Pan Offset */}
        <div
          style={{
            position: 'relative',
            width: '108%',
            height: '108%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            filter: filterStyle,
          }}
        >
          {/* Architectural Background Pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(30, 35, 45, 0.3) 0%, rgba(5, 7, 10, 0.95) 85%), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
            }}
          />

          {/* Central Target Crosshair & Reticle */}
          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              border: '1px dashed rgba(201, 20, 20, 0.65)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '8px', height: '1px', backgroundColor: '#ef4444' }} />
            <div style={{ height: '8px', width: '1px', backgroundColor: '#ef4444', position: 'absolute' }} />
            <div
              className="font-mono-tech"
              style={{
                position: 'absolute',
                top: '-18px',
                fontSize: '9px',
                color: '#ef4444',
                letterSpacing: '0.12em',
              }}
            >
              OPTICAL TRACKING LOCK
            </div>
          </div>
        </div>

        {/* Top-Left CCTV Telemetry Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '18px',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                animation: 'beaconPulse 1.2s infinite',
              }}
            />
            <span
              className="font-mono-tech"
              style={{ fontSize: '12px', color: '#fff', fontWeight: 700, letterSpacing: '0.12em' }}
            >
              REC ● {timecode}
            </span>
          </div>
          <div className="font-mono-tech" style={{ fontSize: '11px', color: '#c91414', letterSpacing: '0.1em' }}>
            {activeCam.name}
          </div>
          <div className="font-mono-tech" style={{ fontSize: '10px', color: '#888' }}>
            LOC: {activeCam.location}
          </div>
        </div>

        {/* Top-Right CCTV Sensor Indicators */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '18px',
            zIndex: 15,
            pointerEvents: 'none',
            textAlign: 'right',
          }}
        >
          <div
            className="font-mono-tech"
            style={{
              fontSize: '11px',
              color: laserBypassed ? '#f59e0b' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '5px',
            }}
          >
            {laserBypassed ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
            <span>TRIPWIRE: {laserBypassed ? 'OVERRIDDEN' : 'ACTIVE'}</span>
          </div>
          <div className="font-mono-tech" style={{ fontSize: '10px', color: '#888' }}>
            FPS: {activeCam.fps} // 1080P PRORES
          </div>
        </div>

        {/* Bottom-Center Interactive PTZ D-Pad Controller */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '18px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(10, 12, 16, 0.88)',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span className="font-mono-tech" style={{ fontSize: '9px', color: '#888', marginRight: '6px' }}>
            PTZ GIMBAL:
          </span>
          <button
            onClick={() => handlePan(-10, 0)}
            title="Pan Left"
            style={{
              backgroundColor: 'rgba(25, 28, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f2eee7',
              padding: '4px 6px',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => handlePan(0, -8)}
              title="Tilt Up"
              style={{
                backgroundColor: 'rgba(25, 28, 36, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f2eee7',
                padding: '2px 6px',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              <ChevronUp size={11} />
            </button>
            <button
              onClick={() => handlePan(0, 8)}
              title="Tilt Down"
              style={{
                backgroundColor: 'rgba(25, 28, 36, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f2eee7',
                padding: '2px 6px',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              <ChevronDown size={11} />
            </button>
          </div>
          <button
            onClick={() => handlePan(10, 0)}
            title="Pan Right"
            style={{
              backgroundColor: 'rgba(25, 28, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f2eee7',
              padding: '4px 6px',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Bottom Tactical Controls & Jump-To Action */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          backgroundColor: 'rgba(12, 14, 18, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left Intel Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '620px' }}>
          <Eye size={15} color="#c91414" />
          <span style={{ fontSize: '12px', color: '#bbb', fontFamily: "'DM Mono', monospace", lineHeight: 1.4 }}>
            {activeCam.intel}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Vision mode switcher */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setVisionMode((m) => (m === 'normal' ? 'night' : m === 'night' ? 'thermal' : 'normal'));
            }}
            style={{
              backgroundColor: 'rgba(20, 24, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e0e0e0',
              padding: '6px 12px',
              borderRadius: '2px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <RefreshCw size={11} />
            <span>OPTICS: {visionMode.toUpperCase()}</span>
          </button>

          {/* Laser tripwire override button */}
          <button
            onClick={handleToggleLaserOverride}
            style={{
              backgroundColor: laserBypassed ? 'rgba(245, 158, 11, 0.2)' : 'rgba(201, 20, 20, 0.2)',
              border: laserBypassed ? '1px solid #f59e0b' : '1px solid #c91414',
              color: laserBypassed ? '#f59e0b' : '#ef4444',
              padding: '6px 12px',
              borderRadius: '2px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Radio size={11} />
            <span>{laserBypassed ? 'RESTORE TRIPWIRES' : 'BYPASS TRIPWIRES'}</span>
          </button>

          {/* Jump To Associated Scene in 3D Storyline */}
          <button
            onClick={handleJumpToScene}
            data-cursor="explore"
            style={{
              backgroundColor: '#c91414',
              border: '1px solid #ff4444',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '2px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(201, 20, 20, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Camera size={12} />
            <span>INSPECT SCENE IN 3D →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
