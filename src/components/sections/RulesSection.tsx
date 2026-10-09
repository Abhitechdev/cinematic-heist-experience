import React, { useState } from 'react';
import { HEIST_RULES } from '../../data/blueprintNodes';
import { soundEngine } from '../../lib/soundEngine';

export const RulesSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="rules"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '140px 36px',
        backgroundColor: '#040404',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '60px' }}>
          <span className="dossier-tag" style={{ marginBottom: '14px' }}>
            OPERATIONAL DOCTRINE // UNCONDITIONAL
          </span>
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
            THE FOUR <span style={{ color: '#c91414' }}>COMMANDMENTS</span>
          </h2>
        </div>

        {/* The Rules Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {HEIST_RULES.map((rule, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={rule.number}
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  soundEngine.playClick();
                }}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '32px',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(60px, 90px) 1fr',
                  gap: '24px',
                  alignItems: 'baseline',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  borderColor: isHovered ? '#c91414' : 'rgba(255, 255, 255, 0.08)',
                  transform: isHovered ? 'translateX(12px)' : 'none',
                }}
              >
                <div
                  className="font-mono-tech"
                  style={{
                    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                    color: isHovered ? '#c91414' : '#858585',
                    fontWeight: 700,
                  }}
                >
                  {rule.number}
                </div>

                <div>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
                      color: isHovered ? '#c91414' : '#f2eee7',
                      letterSpacing: '0.04em',
                      lineHeight: 1.05,
                      marginBottom: '10px',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {rule.title}
                  </h3>

                  <p
                    style={{
                      color: isHovered ? '#f2eee7' : '#858585',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      maxWidth: '750px',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {rule.statement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
