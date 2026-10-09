import React, { useState } from 'react';
import { HEIST_STEPS } from '../../data/blueprintNodes';
import { Clock, ShieldAlert, ChevronRight } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export const HeistSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepClick = (index: number) => {
    soundEngine.playSubBoom();
    setActiveStep(index);
  };

  return (
    <section
      id="heist"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '140px 36px',
        backgroundColor: 'rgba(5, 5, 5, 0.62)',
        backdropFilter: 'blur(3px)',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="dossier-tag">
              <ShieldAlert size={12} />
              TACTICAL SEQUENCE // 4 PHASES
            </span>
            <span
              className="font-mono-tech"
              style={{
                color: '#858585',
                fontSize: '11px',
                letterSpacing: '0.15em',
              }}
            >
              EXECUTION WINDOW: 60 MINUTES
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
            THE FOUR <span style={{ color: '#c91414' }}>MOVEMENTS</span>
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
            A symphony composed in four relentless acts. From subterranean silence to high-noon evasion,
            every transition is triggered by the ticking second hand.
          </p>
        </div>

        {/* Phase Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {HEIST_STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.step}
                onClick={() => handleStepClick(idx)}
                data-cursor="hover"
                style={{
                  background: isActive ? '#1c0606' : '#0b0b0b',
                  border: isActive ? '1px solid #c91414' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: 'none',
                }}
              >
                <div
                  className="font-mono-tech"
                  style={{
                    fontSize: '11px',
                    color: isActive ? '#c91414' : '#858585',
                    marginBottom: '4px',
                  }}
                >
                  {step.step}
                </div>
                <div
                  className="font-display"
                  style={{
                    fontSize: '1.6rem',
                    color: isActive ? '#f2eee7' : '#cfcac2',
                    letterSpacing: '0.05em',
                  }}
                >
                  {step.title}
                </div>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      backgroundColor: '#c91414',
                      boxShadow: '0 0 10px #c91414',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Phase Detailed Cinematic Breakdown */}
        {(() => {
          const step = HEIST_STEPS[activeStep];
          return (
            <div
              style={{
                backgroundColor: '#0c0707',
                border: '1px solid rgba(201, 20, 20, 0.35)',
                padding: '40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '36px',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <span className="dossier-tag">
                    <Clock size={12} />
                    {step.timerOffset}
                  </span>
                  <span
                    className="font-mono-tech"
                    style={{
                      color: '#858585',
                      fontSize: '11px',
                    }}
                  >
                    CODENAME: {step.subtitle}
                  </span>
                </div>

                <h3
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                    color: '#f2eee7',
                    letterSpacing: '0.04em',
                    lineHeight: 1.05,
                    marginBottom: '16px',
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: '#b0aaa2',
                    fontSize: '1.1rem',
                    lineHeight: 1.65,
                    marginBottom: '24px',
                  }}
                >
                  {step.objective}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                    color: '#c91414',
                  }}
                >
                  <span>NEXT TRANSITION IN SEQUENCE</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Contingency Protocol Box */}
              <div
                style={{
                  backgroundColor: 'rgba(5, 5, 5, 0.7)',
                  border: '1px solid rgba(201, 20, 20, 0.25)',
                  padding: '28px',
                }}
              >
                <div
                  className="font-mono-tech"
                  style={{
                    fontSize: '11px',
                    color: '#c91414',
                    letterSpacing: '0.15em',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                  }}
                >
                  CONTINGENCY PROTOCOL (FAIL-SAFE)
                </div>

                <p
                  style={{
                    color: '#f2eee7',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  "{step.contingency}"
                </p>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: '#858585',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>RADIO ENCRYPTION: ACTIVE</span>
                  <span style={{ color: '#22c55e' }}>READY</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
