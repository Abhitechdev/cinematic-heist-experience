import React, { useState } from 'react';
import { Building2, ShieldAlert, Eye, ScanLine } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { InteractiveBankModel3D, type SectorTarget } from '../three/InteractiveBankModel3D';

interface Hotspot {
  id: string;
  name: string;
  code: string;
  intel: string;
  risk: 'CRITICAL' | 'MODERATE' | 'HIGH';
}

const BANK_HOTSPOTS: Hotspot[] = [
  {
    id: 'portico',
    name: 'NEOCLASSICAL COLONNADE & INGRESS',
    code: 'SEC-A1',
    intel: 'Main central portico flanked by eight reinforced stone pillars. Primary ingress point for the decoy armored transport vehicle.',
    risk: 'CRITICAL',
  },
  {
    id: 'west_wing',
    name: 'ADMINISTRATION & CASHIER WING',
    code: 'SEC-B2',
    intel: 'Double-glazed bulletproof perimeter glass. 18 civilian personnel stationed during operational shift.',
    risk: 'MODERATE',
  },
  {
    id: 'east_wing',
    name: 'MINTING & PRINTING PRESS HALL',
    code: 'SEC-C3',
    intel: 'Industrial machinery printing unindexed euro notes at 8,000 sheets/hour. Primary objective for the extraction hold.',
    risk: 'HIGH',
  },
  {
    id: 'roof',
    name: 'ROOFTOP SNIPER PARAPET & SPIRE',
    code: 'SEC-R4',
    intel: 'Command post elevation overlooking the entire northern plaza. Broadcast antenna and warning strobe with zero blind spots.',
    risk: 'HIGH',
  },
  {
    id: 'vault',
    name: 'SUBTERRANEAN 40-TON VAULT CORE',
    code: 'SEC-V0',
    intel: 'Sub-level reinforced sanctuary protected by 12 radial pneumatic locking bolts, seismic sensors, and flooding countermeasures.',
    risk: 'CRITICAL',
  },
];

export const BankRevealSection: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(BANK_HOTSPOTS[0]);

  const handleSelectSector = (sec: SectorTarget) => {
    soundEngine.playRadarPing(920);
    const matched = BANK_HOTSPOTS.find((h) => h.id === sec.id);
    if (matched) setActiveHotspot(matched);
  };

  return (
    <section
      id="target"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '70px 24px',
        backgroundColor: 'rgba(6, 6, 6, 0.58)',
        backdropFilter: 'blur(3px)',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="dossier-tag">
              <Building2 size={12} />
              THE TARGET // ARCHITECTURAL REVEAL
            </span>
            <span
              className="font-mono-tech"
              style={{
                color: '#858585',
                fontSize: '11px',
                letterSpacing: '0.15em',
              }}
            >
              3D PERSPECTIVE RECONNAISSANCE
            </span>
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
              lineHeight: 0.95,
              color: '#f2eee7',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            THE ROYAL <span style={{ color: '#c91414' }}>MINT</span>
          </h2>

          <p
            style={{
              color: '#858585',
              maxWidth: '650px',
              fontSize: '1.05rem',
              marginTop: '14px',
              lineHeight: 1.6,
            }}
          >
            An unyielding neoclassical fortress of steel, granite, and surveillance optics.
            Inspect the 3D architectural block below — click any security room or sector to glide directly inside.
          </p>
        </div>

        {/* 3D Interactive Building Showcase Frame (Real Three.js Neoclassical Wireframe & Clickable Rooms) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(460px, 56vw, 640px)',
            marginBottom: '32px',
          }}
        >
          <InteractiveBankModel3D
            activeSectorId={activeHotspot.id}
            onSelectSector={handleSelectSector}
          />
        </div>

        {/* Selected Sector Intel Panel */}
        <div
          style={{
            backgroundColor: '#0c0707',
            border: '1px solid rgba(201, 20, 20, 0.35)',
            padding: '28px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="dossier-tag">
                <ScanLine size={12} />
                SECTOR REF: {activeHotspot.code}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  color: activeHotspot.risk === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldAlert size={12} />
                ALERT: {activeHotspot.risk}
              </span>
            </div>

            <h3
              className="font-display"
              style={{
                fontSize: '2rem',
                color: '#f2eee7',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              {activeHotspot.name}
            </h3>

            <p style={{ color: '#b0aaa2', fontSize: '1rem', lineHeight: 1.6 }}>
              {activeHotspot.intel}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(5, 5, 5, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              className="font-mono-tech"
              style={{
                fontSize: '11px',
                color: '#c91414',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Eye size={13} />
              <span>RECONNAISSANCE SATELLITE SUMMARY</span>
            </div>

            <div style={{ color: '#858585', fontSize: '12px', fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
              • All optical surveillance feeds tap directly into local junction box 04.<br />
              • Structural breach charges must be calibrated under 85 decibels.<br />
              • Internal communication relays operating on 142.85 MHz backup frequency.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scannerSweep {
          0% { left: 5%; }
          100% { left: 95%; }
        }
      `}</style>
    </section>
  );
};

export default BankRevealSection;
