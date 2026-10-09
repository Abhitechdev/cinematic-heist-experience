import React from 'react';

export const FinalPlanSection: React.FC = () => {
  return (
    <section
      id="final-plan"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '160px 36px',
        backgroundColor: 'transparent',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Solitary Red Spotlight from Above */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 20, 20, 0.28) 0%, transparent 68%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1000px', position: 'relative', zIndex: 2 }}>
        <div
          className="font-mono-tech"
          style={{
            fontSize: '12px',
            color: '#858585',
            letterSpacing: '0.25em',
            marginBottom: '32px',
          }}
        >
          // MASTER PHILOSOPHY
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(3rem, 7.5vw, 6.8rem)',
            color: '#858585',
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}
        >
          EVERYTHING WAS PLANNED.
        </h2>

        <h3
          className="font-display"
          style={{
            fontSize: 'clamp(3.2rem, 8vw, 7.4rem)',
            color: '#c91414',
            letterSpacing: '0.04em',
            lineHeight: 0.96,
            textTransform: 'uppercase',
            textShadow: '0 0 35px rgba(201, 20, 20, 0.7)',
          }}
        >
          BUT NOTHING GOES ACCORDING TO PLAN.
        </h3>

        <p
          style={{
            maxWidth: '600px',
            margin: '40px auto 0',
            color: '#858585',
            fontSize: '1.05rem',
            lineHeight: 1.6,
          }}
        >
          That is why we don't plan for perfection. We plan for the collapse.
        </p>
      </div>
    </section>
  );
};
