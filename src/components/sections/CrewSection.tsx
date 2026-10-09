import React, { useState } from 'react';
import { CREW_MEMBERS } from '../../data/crew';
import type { CrewMember } from '../../types/heist';
import { Shield, Radio, Activity, Eye } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { TiltedCard } from '../react-bits/TiltedCard';
import { DecryptedText } from '../react-bits/DecryptedText';

export const CrewSection: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<CrewMember>(CREW_MEMBERS[0]);
  const [isPlayingQuote, setIsPlayingQuote] = useState(false);
  const [deployedMembers, setDeployedMembers] = useState<Record<string, boolean>>({
    professor: true,
    berlin: true,
  });

  const handleSelect = (member: CrewMember) => {
    soundEngine.playRadarPing(720);
    setSelectedMember(member);
    setIsPlayingQuote(false);
  };

  const handlePlayVoiceIntercept = () => {
    soundEngine.playRadioVoiceIntercept();
    setIsPlayingQuote(true);
    setTimeout(() => {
      setIsPlayingQuote(false);
    }, 2800);
  };

  const handleToggleDeploy = (id: string) => {
    soundEngine.playClick();
    setDeployedMembers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="crew"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        padding: '120px 36px',
        backgroundColor: 'rgba(7, 7, 7, 0.62)',
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
              <Shield size={12} />
              PERSONNEL DOSSIER // DECLASSIFIED
            </span>
            <span
              className="font-mono-tech"
              style={{
                color: '#858585',
                fontSize: '11px',
                letterSpacing: '0.15em',
              }}
            >
              SUBJECTS: 05 OPERATIVES
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
            THE ASSEMBLED <span style={{ color: '#c91414' }}>CREW</span>
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
            Anonymous. Methodical. Irreplaceable. Each specialist was chosen for a single indispensable talent,
            operating beneath identical red jumpsuits and blank masks.
          </p>
        </div>

        {/* Crew Interactive Master Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '40px',
          }}
        >
          {CREW_MEMBERS.map((member) => {
            const isSelected = selectedMember.id === member.id;
            return (
              <TiltedCard
                key={member.id}
                isSelected={isSelected}
                onClick={() => handleSelect(member)}
                maxTilt={6}
                style={{
                  backgroundColor: isSelected ? '#1c0505' : '#0e0404',
                  background: isSelected
                    ? 'linear-gradient(180deg, rgba(38, 8, 8, 0.95) 0%, rgba(16, 4, 4, 0.95) 100%)'
                    : 'linear-gradient(180deg, rgba(20, 6, 6, 0.9) 0%, rgba(10, 3, 3, 0.9) 100%)',
                  border: isSelected ? '1px solid #c91414' : '1px solid rgba(139, 8, 8, 0.25)',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  boxShadow: isSelected
                    ? '0 0 28px rgba(201, 20, 20, 0.35), inset 0 0 20px rgba(201, 20, 20, 0.15)'
                    : '0 4px 20px rgba(0, 0, 0, 0.6)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Individual Operative Portrait with Animated Red Laser Scan */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                    border: isSelected ? '1px solid #c91414' : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: '#120404',
                  }}
                >
                  <img
                    src={member.portraitUrl || '/assets/hero-ensemble.jpg'}
                    alt={member.codename}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                      filter: isSelected
                        ? 'contrast(1.2) brightness(0.95) saturate(1.1)'
                        : 'contrast(1.15) brightness(0.78) grayscale(0.2)',
                      transition: 'all 0.3s ease',
                    }}
                  />

                  {/* Dark Red Gradient Vignette */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20, 4, 4, 0.4) 60%, rgba(10, 2, 2, 0.95) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Animated Red Laser Scanning Line (Reference 4) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#c91414',
                      boxShadow: '0 0 8px #c91414, 0 0 16px rgba(201, 20, 20, 0.8)',
                      animation: 'crewLaserScan 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      pointerEvents: 'none',
                      opacity: isSelected ? 0.9 : 0.45,
                    }}
                  />

                  {/* Code Number Watermark in Top Left */}
                  <div
                    className="font-mono-tech"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isSelected ? '#ffffff' : '#a39f99',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 6px',
                      border: '1px solid rgba(201, 20, 20, 0.4)',
                    }}
                  >
                    #{member.codeNumber}
                  </div>

                  {/* Operative Clearance Status Badge in Top Right */}
                  <div
                    className="font-mono-tech"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '9px',
                      color: member.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 6px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {member.status}
                  </div>
                </div>

                {/* Small Uppercase Role Label */}
                <div
                  className="font-mono-tech"
                  style={{
                    fontSize: '10px',
                    color: isSelected ? '#c91414' : '#8f7b7b',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  <DecryptedText text={member.role} speed={25} trigger={isSelected} />
                </div>

                {/* Operative Codename */}
                <h3
                  className="font-display"
                  style={{
                    fontSize: '1.9rem',
                    color: isSelected ? '#f2eee7' : '#ded9d0',
                    letterSpacing: '0.05em',
                    lineHeight: 1.05,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {member.codename}
                </h3>

                {/* Quote */}
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: isSelected ? '#f2eee7' : '#998e8e',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    borderLeft: `2px solid ${isSelected ? '#c91414' : '#451515'}`,
                    paddingLeft: '8px',
                    marginBottom: '6px',
                  }}
                >
                  "{member.quote}"
                </p>

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#c91414',
                      fontSize: '10px',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    <Eye size={12} />
                    <span>INSPECTING</span>
                  </div>
                )}
              </TiltedCard>
            );
          })}
        </div>

        {/* Selected Member Detailed Tactical Dossier */}
        <div
          style={{
            backgroundColor: '#0c0707',
            border: '1px solid rgba(201, 20, 20, 0.35)',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle corner tech stamps */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              color: '#858585',
            }}
          >
            DOSSIER REF: #{selectedMember.codeNumber} // {selectedMember.audioFreq}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            {/* Left side details */}
            <div>
              <span className="dossier-tag" style={{ marginBottom: '12px' }}>
                <Radio size={12} />
                CLEARANCE: {selectedMember.clearanceLevel}
              </span>

              <h3
                className="font-display"
                style={{
                  fontSize: '2.5rem',
                  color: '#f2eee7',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {selectedMember.codename}
              </h3>

              <div
                className="font-mono-tech"
                style={{
                  color: '#c91414',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                PRIMARY SPECIALTY: {selectedMember.specialty}
              </div>

              <p
                style={{
                  color: '#b0aaa2',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                }}
              >
                {selectedMember.description}
              </p>

              {/* Audio Voice Intercept Player */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 6, 6, 0.75)',
                  border: isPlayingQuote ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '14px 16px',
                  borderRadius: '2px',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c91414', fontSize: '11px', fontFamily: "'DM Mono', monospace" }}>
                    <Radio size={13} />
                    <span>SECURE FREQ: {selectedMember.audioFreq}</span>
                  </div>
                  {isPlayingQuote && (
                    <span className="font-mono-tech" style={{ fontSize: '10px', color: '#ef4444', animation: 'beaconPulse 0.8s infinite' }}>
                      TRANSMITTING LIVE...
                    </span>
                  )}
                </div>

                <div style={{ fontStyle: 'italic', color: isPlayingQuote ? '#ffffff' : '#cfcac2', fontSize: '0.92rem', marginBottom: '12px', lineHeight: 1.5 }}>
                  "{selectedMember.quote}"
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handlePlayVoiceIntercept}
                    style={{
                      backgroundColor: isPlayingQuote ? '#c91414' : 'rgba(30, 10, 10, 0.8)',
                      border: '1px solid #c91414',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Activity size={12} />
                    <span>{isPlayingQuote ? 'MONITORING COMMS...' : 'PLAY COMMS INTERCEPT'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleDeploy(selectedMember.id)}
                    style={{
                      backgroundColor: deployedMembers[selectedMember.id] ? '#166534' : 'rgba(20, 24, 30, 0.8)',
                      border: deployedMembers[selectedMember.id] ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: deployedMembers[selectedMember.id] ? '#86efac' : '#bbb',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {deployedMembers[selectedMember.id] ? '✓ ACTIVE IN SQUAD' : '+ ASSIGN TO MISSION'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side tactical radar stats */}
            <div
              style={{
                backgroundColor: 'rgba(5, 5, 5, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '24px',
                borderRadius: '2px',
              }}
            >
              <h4
                className="font-mono-tech"
                style={{
                  fontSize: '12px',
                  color: '#f2eee7',
                  letterSpacing: '0.15em',
                  marginBottom: '18px',
                  textTransform: 'uppercase',
                }}
              >
                TACTICAL CAPABILITY RATINGS
              </h4>

              {Object.entries(selectedMember.stats).map(([stat, val]) => (
                <div key={stat} style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '11px',
                      color: '#858585',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>{stat}</span>
                    <span style={{ color: '#c91414', fontWeight: 600 }}>{val}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${val}%`,
                        height: '100%',
                        backgroundColor: '#c91414',
                        boxShadow: '0 0 8px rgba(201, 20, 20, 0.8)',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes crewLaserScan {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};
