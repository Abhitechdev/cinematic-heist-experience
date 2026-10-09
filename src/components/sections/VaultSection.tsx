import React from 'react';
import { KeyRound, ChevronRight, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { VaultTerminal } from '../react-bits/VaultTerminal';
import { DecryptedText } from '../react-bits/DecryptedText';
import type { VaultState } from '../../types/heist';

interface VaultSectionProps {
  isVaultUnlocked?: boolean;
  onVaultUnlock?: () => void;
  onVaultDenied?: () => void;
  vaultSequenceProgress?: number;
  vaultState?: VaultState;
  onEnterTreasury?: () => void;
  onProceedToEscape?: () => void;
}

export const VaultSection: React.FC<VaultSectionProps> = ({
  isVaultUnlocked = false,
  onVaultUnlock,
  onVaultDenied,
  vaultSequenceProgress = 0,
  vaultState = 'AWAITING_PASSWORD',
  onEnterTreasury,
  onProceedToEscape,
}) => {
  const isOpeningOrUnlocking =
    vaultState === 'UNLOCKING' ||
    vaultState === 'OPENING' ||
    (isVaultUnlocked && vaultSequenceProgress > 0 && vaultSequenceProgress < 0.95);

  const isFullyRevealed =
    isVaultUnlocked && (vaultSequenceProgress >= 0.95 || vaultState === 'GOLD_REVEAL' || vaultState === 'TREASURY' || vaultState === 'COMPLETE');

  // Compute number of disengaged bolts based on sequence progress
  // Bolt window: 0.20 to 0.55
  const retractedBoltsCount = isVaultUnlocked
    ? vaultSequenceProgress >= 0.55
      ? 12
      : vaultSequenceProgress > 0.20
      ? Math.min(12, Math.floor(((vaultSequenceProgress - 0.20) / 0.35) * 12))
      : 0
    : 0;

  return (
    <section
      id="vault"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '120px 36px',
        backgroundColor: 'transparent',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pointerEvents: isOpeningOrUnlocking ? 'none' : 'auto',
        transition: 'opacity 0.6s ease',
        opacity: isOpeningOrUnlocking ? 0.2 : 1,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="dossier-tag">
              <KeyRound size={12} />
              SUB-VAULT 07 // BULKHEAD
            </span>
            <span
              className="font-mono-tech"
              style={{
                color: isVaultUnlocked ? '#f5ba31' : '#c91414',
                fontSize: '11px',
                letterSpacing: '0.15em',
                fontWeight: 600,
              }}
            >
              {isVaultUnlocked
                ? isFullyRevealed
                  ? 'STATUS: SANCTUARY BREACHED // GOLD ACCESSIBLE'
                  : 'STATUS: DISENGAGING MECHANICAL HYDRAULICS'
                : 'STATUS: 12-BOLT PNEUMATIC SEAL ENGAGED'}
            </span>
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
              lineHeight: 0.95,
              color: '#f2eee7',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}
          >
            {isVaultUnlocked ? (
              <span>THE VAULT IS <span style={{ color: '#f5ba31' }}>OPENING</span></span>
            ) : (
              <span>THE 40-TON <span style={{ color: '#c91414' }}>VAULT DOOR</span></span>
            )}
          </h2>

          <p
            style={{
              color: '#a3a3a3',
              maxWidth: '640px',
              margin: '0 auto',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {isVaultUnlocked ? (
              <span style={{ color: '#f5ba31' }}>
                12 radial bolts retracted. Handwheel disengaged. 40-ton circular door swinging on massive forged steel hinges, revealing stacks of unindexed gold bullion.
              </span>
            ) : (
              <span>
                Enter the operational authorization passcode on the terminal below to disengage the 12 radial locking bolts and initiate physical door unsealing.
              </span>
            )}
          </p>
        </div>

        {/* Unlocked Cinematic Banner / Locked Terminal Display */}
        {!isVaultUnlocked ? (
          <div>
            <VaultTerminal
              onUnlockSuccess={() => {
                if (onVaultUnlock) onVaultUnlock();
              }}
              onUnlockDenied={onVaultDenied}
              isUnlocked={isVaultUnlocked}
              isOpening={isOpeningOrUnlocking}
            />

            {/* 12 Bolts Radial Telemetry Strip */}
            <div
              style={{
                marginTop: '28px',
                backgroundColor: 'rgba(8, 8, 10, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 20px',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '560px',
                margin: '28px auto 0',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono-tech" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.12em' }}>
                  12-BOLT PNEUMATIC SEAL LOCKING GRID
                </span>
                <span className="font-mono-tech" style={{ fontSize: '10px', color: '#c91414', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={11} />
                  ALL 12 ARMED
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '8px',
                      backgroundColor: '#c91414',
                      borderRadius: '1px',
                      boxShadow: '0 0 6px #c91414',
                    }}
                    title={`Locking Bolt #${i + 1} Armed`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unlocked Cinematic State */
          <div
            style={{
              textAlign: 'center',
              padding: '36px 28px',
              backgroundColor: 'rgba(12, 10, 8, 0.88)',
              border: '1.5px solid rgba(245, 186, 49, 0.75)',
              boxShadow: '0 0 45px rgba(245, 186, 49, 0.3), 0 0 90px rgba(0, 0, 0, 0.95)',
              borderRadius: '4px',
              maxWidth: '680px',
              margin: '0 auto',
              backdropFilter: 'blur(16px)',
              animation: 'goldGlow 2.5s infinite alternate',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f5ba31',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '14px',
              }}
              className="font-mono-tech"
            >
              <Sparkles size={16} color="#f5ba31" />
              <DecryptedText text="TREASURY SANCTUARY COMPROMISED // GOLD SPILL ACTIVE" speed={20} />
            </div>

            {/* Live Bolt Telemetry during or after opening */}
            <div style={{ marginBottom: '18px', maxWidth: '420px', margin: '0 auto 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="font-mono-tech" style={{ fontSize: '10px', color: '#f5ba31' }}>
                  BOLT RETRACTION STATUS: {retractedBoltsCount}/12 DISENGAGED
                </span>
                <span className="font-mono-tech" style={{ fontSize: '10px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={10} />
                  HYDRAULIC RELEASED
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '8px',
                      backgroundColor: i < retractedBoltsCount ? '#f5ba31' : '#444',
                      borderRadius: '1px',
                      boxShadow: i < retractedBoltsCount ? '0 0 8px #f5ba31' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="font-display"
              style={{
                fontSize: '2.5rem',
                color: '#ffffff',
                textTransform: 'uppercase',
                marginBottom: '12px',
                textShadow: '0 0 24px rgba(245, 186, 49, 0.7)',
              }}
            >
              THE PRIZE IS WITHIN REACH
            </div>

            <p style={{ color: '#d4d4d4', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '20px' }}>
              The 40-ton circular door has fully pivoted open. Freshly minted bullion bars and unindexed currency await in the inner chamber.
            </p>

            {/* Authentic 24K Gold Bullion Ingot Showcase (Requested Gold Bars) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                padding: '16px 20px',
                backgroundColor: 'rgba(15, 12, 6, 0.85)',
                border: '1px solid rgba(245, 186, 49, 0.35)',
                borderRadius: '4px',
                marginBottom: '24px',
                maxWidth: '540px',
                margin: '0 auto 24px',
              }}
            >
              <img
                src="/assets/gold-bar-angle-transparent.png"
                alt="24K London Good Delivery Gold Bar"
                style={{
                  height: '76px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 18px rgba(245, 186, 49, 0.55))',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div
                  className="font-mono-tech"
                  style={{
                    color: '#f5ba31',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    marginBottom: '4px',
                  }}
                >
                  24K FINE GOLD // PURITY 999.9
                </div>
                <div
                  style={{
                    color: '#e5e5e5',
                    fontSize: '13px',
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.4,
                  }}
                >
                  STANDARD: 1000g BULLION INGOT<br />
                  SERIAL: <span style={{ color: '#ffd700' }}>ES-2807-ALPHA</span> // MADRID VAULT
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
              {onEnterTreasury && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onEnterTreasury();
                  }}
                  data-cursor="open"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#f5ba31',
                    color: '#050505',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.4rem',
                    letterSpacing: '0.1em',
                    padding: '14px 28px',
                    borderRadius: '2px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: '0 0 30px rgba(245, 186, 49, 0.55)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffd700';
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5ba31';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>EXPLORE TREASURY</span>
                  <ChevronRight size={18} />
                </button>
              )}

              {onProceedToEscape && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onProceedToEscape();
                  }}
                  data-cursor="explore"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(201, 20, 20, 0.9)',
                    color: '#f2eee7',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.4rem',
                    letterSpacing: '0.1em',
                    padding: '14px 28px',
                    borderRadius: '2px',
                    border: '1px solid #c91414',
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: '0 0 30px rgba(201, 20, 20, 0.55)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e51a1a';
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(201, 20, 20, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>BLIMP ESCAPE SEQUENCE</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes goldGlow {
          0% { box-shadow: 0 0 30px rgba(245, 186, 49, 0.2), 0 0 80px rgba(0, 0, 0, 0.9); }
          100% { box-shadow: 0 0 50px rgba(245, 186, 49, 0.5), 0 0 90px rgba(0, 0, 0, 0.9); }
        }
      `}</style>
    </section>
  );
};
