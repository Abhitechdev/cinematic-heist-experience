import React from 'react';

interface LaserScanOverlayProps {
  label?: string;
  statusText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LaserScanOverlay: React.FC<LaserScanOverlayProps> = ({
  label = 'INFRARED PERIMETER SCAN',
  statusText = 'TARGET ACQUIRED // NO ANOMALY',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Moving Horizontal Laser Beam */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(201, 20, 20, 0.4) 20%, #ff2222 50%, rgba(201, 20, 20, 0.4) 80%, transparent 100%)',
          boxShadow: '0 0 16px rgba(255, 34, 34, 0.8), 0 0 4px #ffffff',
          animation: 'laserScanAnim 3.8s ease-in-out infinite alternate',
          zIndex: 5,
        }}
      />

      {/* Sweep glow wash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(180deg, rgba(201, 20, 20, 0.08) 0%, transparent 100%)',
          animation: 'laserScanAnim 3.8s ease-in-out infinite alternate',
          zIndex: 4,
        }}
      />

      {/* HUD Telemetry Badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 6,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ff2222',
            boxShadow: '0 0 8px #ff2222',
            animation: 'laserPulse 1.2s infinite alternate',
          }}
        />
        <span
          className="font-mono-tech"
          style={{
            fontSize: '9px',
            color: '#c91414',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {label} : {statusText}
        </span>
      </div>

      <style>{`
        @keyframes laserScanAnim {
          0% { transform: translateY(0%); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(520px); opacity: 0.7; }
        }
        @keyframes laserPulse {
          0% { opacity: 0.4; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
