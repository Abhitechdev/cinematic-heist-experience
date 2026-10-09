import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, CheckCircle2, AlertOctagon, Terminal, Cpu, Lock, Unlock } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { DecryptedText } from './DecryptedText';
import { DEFAULT_VAULT_CODE, VALID_VAULT_CODES } from '../../types/heist';

interface VaultTerminalProps {
  onUnlockSuccess: () => void;
  onUnlockDenied?: () => void;
  isUnlocked: boolean;
  isOpening?: boolean;
}

export const VaultTerminal: React.FC<VaultTerminalProps> = ({
  onUnlockSuccess,
  onUnlockDenied,
  isUnlocked,
  isOpening = false,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [statusState, setStatusState] = useState<'IDLE' | 'DENIED' | 'GRANTED'>('IDLE');
  const [shake, setShake] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isLockedOrOpening = isUnlocked || isOpening || isSubmitting || statusState === 'GRANTED';

  // Listen to global and input keyboard events
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isLockedOrOpening) return;
      // If user presses Escape, clear
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLockedOrOpening]);

  const handleKeyPress = (val: string) => {
    if (isLockedOrOpening) return;
    if (inputCode.length < 6) {
      soundEngine.playKeypadBeep(750 + inputCode.length * 50);
      setInputCode((prev) => (prev.length < 6 ? prev + val : prev));
      if (statusState === 'DENIED') setStatusState('IDLE');
    }
  };

  const handleClear = () => {
    if (isLockedOrOpening) return;
    soundEngine.playKeypadBeep(480);
    setInputCode('');
    setStatusState('IDLE');
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLockedOrOpening) return;

    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      soundEngine.playKeypadBeep(380);
      return;
    }

    setIsSubmitting(true);

    if (VALID_VAULT_CODES.includes(trimmed)) {
      // ACCESS GRANTED!
      soundEngine.playAccessGranted();
      setStatusState('GRANTED');
      // Begin physical vault animation
      setTimeout(() => {
        onUnlockSuccess();
      }, 400);
    } else {
      // ACCESS DENIED!
      soundEngine.playAccessDenied();
      setStatusState('DENIED');
      setShake(true);
      setAttemptCount((c) => c + 1);
      if (onUnlockDenied) {
        onUnlockDenied();
      }

      setTimeout(() => {
        setShake(false);
        setIsSubmitting(false);
      }, 650);
    }
  };

  const handleAutoBypass = () => {
    if (isLockedOrOpening) return;
    soundEngine.playKeypadBeep(1040);
    setInputCode(DEFAULT_VAULT_CODE);
    setTimeout(() => {
      setIsSubmitting(true);
      soundEngine.playAccessGranted();
      setStatusState('GRANTED');
      setTimeout(() => {
        onUnlockSuccess();
      }, 400);
    }, 250);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: 'rgba(8, 8, 10, 0.92)',
        border: isUnlocked || statusState === 'GRANTED'
          ? '1.5px solid #f5ba31'
          : statusState === 'DENIED'
          ? '1.5px solid #ef4444'
          : '1px solid rgba(201, 20, 20, 0.55)',
        boxShadow: isUnlocked || statusState === 'GRANTED'
          ? '0 0 35px rgba(245, 186, 49, 0.35), 0 0 12px rgba(0, 0, 0, 0.9)'
          : statusState === 'DENIED'
          ? '0 0 35px rgba(239, 68, 68, 0.45)'
          : '0 8px 32px rgba(0, 0, 0, 0.85), 0 0 20px rgba(201, 20, 20, 0.2)',
        borderRadius: '4px',
        padding: 'clamp(14px, 4vw, 24px) clamp(12px, 4vw, 26px)',
        backdropFilter: 'blur(16px)',
        transform: shake ? 'translateX(-8px)' : 'translateX(0)',
        transition: 'border 0.3s ease, box-shadow 0.3s ease',
        animation: shake ? 'terminalShake 0.45s ease-in-out' : 'none',
      }}
      role="region"
      aria-label="Secure Vault Access Terminal"
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} color={isUnlocked || statusState === 'GRANTED' ? '#f5ba31' : '#c91414'} />
          <span
            className="font-mono-tech"
            style={{
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#f2eee7',
              fontWeight: 700,
            }}
          >
            SECURE VAULT // BULKHEAD TERMINAL
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isUnlocked || statusState === 'GRANTED' ? '#f5ba31' : statusState === 'DENIED' ? '#ef4444' : '#c91414',
              boxShadow: isUnlocked || statusState === 'GRANTED' ? '0 0 8px #f5ba31' : '0 0 8px #ef4444',
            }}
          />
          <span
            className="font-mono-tech"
            style={{
              fontSize: '10px',
              color: isUnlocked || statusState === 'GRANTED' ? '#f5ba31' : statusState === 'DENIED' ? '#ef4444' : '#c91414',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}
          >
            {isUnlocked || statusState === 'GRANTED' ? 'ACCESS GRANTED' : statusState === 'DENIED' ? 'ACCESS DENIED' : 'SEAL ARMED'}
          </span>
        </div>
      </div>

      {/* Screen Display */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: '#040405',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            padding: '14px clamp(10px, 3vw, 18px)',
            marginBottom: '18px',
            boxShadow: 'inset 0 0 18px rgba(0, 0, 0, 0.9)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* CRT Scanline */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span
              className="font-mono-tech"
              style={{
                fontSize: '11px',
                color: isUnlocked || statusState === 'GRANTED' ? '#f5ba31' : '#aaa',
                letterSpacing: '0.14em',
                fontWeight: 600,
              }}
            >
              ENTER ACCESS CODE
            </span>
            <span className="font-mono-tech" style={{ fontSize: '10px', color: '#c91414' }}>
              ATTEMPTS: {attemptCount}
            </span>
          </div>

          {/* Hidden Accessible Input for Screen Readers and Keyboard Sync */}
          <input
            ref={inputRef}
            id="terminal-keyboard-input"
            type="text"
            value={inputCode}
            onChange={(e) => {
              if (isLockedOrOpening) return;
              const val = e.target.value.toUpperCase().slice(0, 6);
              setInputCode(val);
              if (statusState === 'DENIED') setStatusState('IDLE');
            }}
            maxLength={6}
            autoComplete="off"
            aria-label="Vault Access Code"
            disabled={isLockedOrOpening}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'all',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              cursor: isLockedOrOpening ? 'default' : 'text',
              zIndex: 2,
            }}
          />

          {/* Big 6-Slot Code Readout [ _ _ _ _ _ _ ] */}
          <div
            onClick={() => inputRef.current?.focus()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(4px, 2vw, 8px)',
              padding: '10px 0',
              cursor: 'text',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const char = inputCode[slotIdx];
              const isCurrent = slotIdx === inputCode.length;
              return (
                <div
                  key={slotIdx}
                  style={{
                    width: 'clamp(32px, 11vw, 42px)',
                    height: 'clamp(42px, 13vw, 52px)',
                    border: isUnlocked || statusState === 'GRANTED'
                      ? '2px solid #f5ba31'
                      : statusState === 'DENIED'
                      ? '2px solid #ef4444'
                      : char
                      ? '2px solid #c91414'
                      : isCurrent
                      ? '1.5px solid rgba(245, 186, 49, 0.7)'
                      : '1px dashed rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(15, 15, 18, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Bebas Neue', monospace",
                    fontSize: '2rem',
                    color: isUnlocked || statusState === 'GRANTED'
                      ? '#f5ba31'
                      : statusState === 'DENIED'
                      ? '#ef4444'
                      : '#f2eee7',
                    borderRadius: '2px',
                    boxShadow: char
                      ? '0 0 10px rgba(201, 20, 20, 0.35)'
                      : isCurrent
                      ? '0 0 8px rgba(245, 186, 49, 0.3)'
                      : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {char ? char : isCurrent && !isLockedOrOpening ? <span style={{ animation: 'blink 1s infinite' }}>_</span> : <span style={{ opacity: 0.25 }}>_</span>}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          <div style={{ textAlign: 'center', marginTop: '6px', minHeight: '22px' }}>
            {statusState === 'GRANTED' || isUnlocked ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5ba31', fontSize: '12px' }} className="font-mono-tech">
                <CheckCircle2 size={13} color="#f5ba31" />
                <DecryptedText text="ACCESS GRANTED // 12-BOLT SEAL DISENGAGED" speed={25} />
              </div>
            ) : statusState === 'DENIED' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px' }} className="font-mono-tech">
                <AlertOctagon size={13} color="#ef4444" />
                <span>ACCESS DENIED // INVALID AUTHORIZATION CODE</span>
              </div>
            ) : (
              <span className="font-mono-tech" style={{ fontSize: '11px', color: '#666' }}>
                CLICK TO TYPE ON KEYBOARD OR USE TACTILE KEYPAD
              </span>
            )}
          </div>
        </div>

        {/* Primary [ UNLOCK ] Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="submit"
            disabled={isLockedOrOpening}
            data-cursor="pointer"
            style={{
              width: '100%',
              backgroundColor: isUnlocked || statusState === 'GRANTED'
                ? '#f5ba31'
                : statusState === 'DENIED'
                ? '#ef4444'
                : '#c91414',
              color: isUnlocked || statusState === 'GRANTED' ? '#0a0a0c' : '#ffffff',
              border: 'none',
              borderRadius: '2px',
              padding: '14px 20px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.45rem',
              letterSpacing: '0.12em',
              fontWeight: 800,
              cursor: isLockedOrOpening ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isUnlocked || statusState === 'GRANTED'
                ? '0 0 25px rgba(245, 186, 49, 0.5)'
                : '0 0 20px rgba(201, 20, 20, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLockedOrOpening) {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isUnlocked || statusState === 'GRANTED' ? (
              <>
                <Unlock size={20} />
                <span>VAULT UNLOCKED</span>
              </>
            ) : (
              <>
                <Lock size={19} />
                <span>UNLOCK</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tactile Keypad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'SUBMIT'].map((btn) => {
          const isAction = btn === 'CLR' || btn === 'SUBMIT';
          const isSubmit = btn === 'SUBMIT';
          return (
            <button
              key={btn}
              type="button"
              onClick={() => {
                if (btn === 'CLR') handleClear();
                else if (btn === 'SUBMIT') handleSubmit();
                else handleKeyPress(btn);
              }}
              data-cursor="hover"
              disabled={isLockedOrOpening}
              style={{
                backgroundColor: isSubmit
                  ? 'rgba(201, 20, 20, 0.45)'
                  : isAction
                  ? 'rgba(30, 30, 35, 0.9)'
                  : 'rgba(20, 20, 24, 0.8)',
                border: isSubmit
                  ? '1px solid #c91414'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f2eee7',
                fontFamily: "'DM Mono', monospace",
                fontSize: isAction ? '11px' : '15px',
                fontWeight: 600,
                padding: '11px 6px',
                borderRadius: '2px',
                cursor: isLockedOrOpening ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLockedOrOpening) {
                  e.currentTarget.style.borderColor = '#c91414';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(201, 20, 20, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isSubmit ? '#c91414' : 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {btn}
            </button>
          );
        })}
      </div>

      {/* Intel Hint & Bypass Helper */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyRound size={12} color="#f5ba31" />
          <span className="font-mono-tech" style={{ fontSize: '10px', color: '#888' }}>
            SECURITY PASSCODE: <strong style={{ color: '#f5ba31' }}>{DEFAULT_VAULT_CODE}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleAutoBypass}
          disabled={isLockedOrOpening}
          data-cursor="hover"
          style={{
            background: 'none',
            border: '1px solid rgba(245, 186, 49, 0.45)',
            color: '#f5ba31',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.12em',
            padding: '4px 8px',
            borderRadius: '2px',
            cursor: isLockedOrOpening ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(245, 186, 49, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Cpu size={11} />
          <span>QUICK INJECT</span>
        </button>
      </div>

      <style>{`
        @keyframes terminalShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
