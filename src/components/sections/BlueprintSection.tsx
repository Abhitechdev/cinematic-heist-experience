import React, { useState } from 'react';
import { BLUEPRINT_NODES } from '../../data/blueprintNodes';
import type { BlueprintNode } from '../../types/heist';
import { MapPin, AlertTriangle, Layers, Info, Box } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { DecryptedText } from '../react-bits/DecryptedText';
import { BlueprintModel3D } from '../three/BlueprintModel3D';

export const BlueprintSection: React.FC = () => {
  const [activeNode, setActiveNode] = useState<BlueprintNode>(BLUEPRINT_NODES[0]);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const handleNodeClick = (node: BlueprintNode) => {
    soundEngine.playRadarPing(840);
    setActiveNode(node);
  };

  return (
    <section
      id="blueprint"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '120px 36px',
        backgroundColor: 'rgba(5, 5, 5, 0.62)',
        backdropFilter: 'blur(3px)',
        borderTop: '1px solid rgba(139, 8, 8, 0.25)',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '36px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="dossier-tag">
                <Layers size={12} />
                ARCHITECTURAL SCHEMATIC // TOP SECRET
              </span>
              <span
                className="font-mono-tech"
                style={{
                  color: '#858585',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                }}
              >
                METROPOLITAN VAULT COMPLEX
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
              THE INTERACTIVE <span style={{ color: '#c91414' }}>BLUEPRINT</span>
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
              Five critical checkpoints mapped to millimeter tolerance across subterranean and ground levels.
              Click any 3D node below to focus camera trajectory and countermeasures.
            </p>
          </div>

          {/* 3D vs 2D View Mode Selector */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(12, 14, 18, 0.85)', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '2px' }}>
            <button
              onClick={() => {
                soundEngine.playClick();
                setViewMode('3d');
              }}
              style={{
                backgroundColor: viewMode === '3d' ? '#c91414' : 'transparent',
                color: viewMode === '3d' ? '#fff' : '#888',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '2px',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Box size={13} />
              <span>3D ISOMETRIC PROJECTION</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setViewMode('2d');
              }}
              style={{
                backgroundColor: viewMode === '2d' ? '#c91414' : 'transparent',
                color: viewMode === '2d' ? '#fff' : '#888',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '2px',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Layers size={13} />
              <span>2D CAD SCHEMATIC</span>
            </button>
          </div>
        </div>

        {/* Blueprint Interactive Canvas Board (3D Isometric or 2D Schematic) */}
        {viewMode === '3d' ? (
          <div style={{ width: '100%', height: '540px', marginBottom: '32px' }}>
            <BlueprintModel3D
              activeNodeId={activeNode.id}
              onSelectNode={handleNodeClick}
            />
          </div>
        ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '520px',
            backgroundColor: '#080808',
            border: '1px solid rgba(201, 20, 20, 0.4)',
            borderRadius: '2px',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 25px rgba(201,20,20,0.1)',
            backgroundImage: `
              linear-gradient(rgba(139, 8, 8, 0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 8, 8, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            marginBottom: '32px',
          }}
        >
          {/* Schematic SVG connecting lines */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Pulsing laser connection path */}
            <polyline
              points={BLUEPRINT_NODES.map((n) => `${n.x},${n.y}`).join(' ')}
              fill="none"
              stroke="#c91414"
              strokeWidth="0.4"
              strokeDasharray="1.5 1"
              style={{
                filter: 'drop-shadow(0 0 6px #c91414)',
              }}
            />

            {/* Perimeter schematic walls */}
            <rect x="5%" y="10%" width="90%" height="80%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="68%" y1="10%" x2="68%" y2="90%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Interactive Blueprint Nodes */}
          {BLUEPRINT_NODES.map((node) => {
            const isActive = activeNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                data-cursor="explore"
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Node Outer Radar Ring */}
                <div
                  style={{
                    position: 'relative',
                    width: isActive ? '36px' : '26px',
                    height: isActive ? '36px' : '26px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'rgba(201, 20, 20, 0.3)' : 'rgba(11, 11, 11, 0.8)',
                    border: `2px solid ${isActive ? '#c91414' : 'rgba(201,20,20,0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 0 20px #c91414' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#f2eee7' : '#c91414',
                    }}
                  />
                </div>

                {/* Node Tag Label */}
                <div
                  className="font-mono-tech"
                  style={{
                    marginTop: '6px',
                    padding: '2px 8px',
                    backgroundColor: isActive ? '#c91414' : 'rgba(5, 5, 5, 0.9)',
                    color: isActive ? '#fff' : '#f2eee7',
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    border: '1px solid rgba(201, 20, 20, 0.5)',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {node.code}: {node.label}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Selected Node Tactical Details Panel */}
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
                <MapPin size={12} />
                {activeNode.code} // PHASE 0{activeNode.phase}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  color: activeNode.securityRisk === 'OMEGA' ? '#ef4444' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertTriangle size={12} />
                RISK LEVEL: {activeNode.securityRisk}
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
              {activeNode.label}
            </h3>

            <p style={{ color: '#858585', fontSize: '0.98rem', lineHeight: 1.55 }}>
              {activeNode.description}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(5, 5, 5, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
            }}
          >
            <div
              className="font-mono-tech"
              style={{
                fontSize: '11px',
                color: '#c91414',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Info size={13} />
              <span>TACTICAL ENGAGEMENT BRIEFING</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {activeNode.details.map((detail, idx) => (
                <li
                  key={idx}
                  style={{
                    color: '#cfcac2',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ color: '#c91414', fontWeight: 700 }}>•</span>
                  <span>
                    <DecryptedText text={detail} speed={22} trigger={activeNode.id} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
