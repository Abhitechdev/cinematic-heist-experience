import React, { useRef, useCallback } from 'react';

interface TiltedCardProps {
  children: React.ReactNode;
  maxTilt?: number; // max degrees tilt
  perspective?: number; // px
  scaleOnHover?: number;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  maxTilt = 8,
  perspective = 1000,
  scaleOnHover = 1.025,
  className = '',
  style = {},
  isSelected = false,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1)`;
      if (glareRef.current) {
        const glareX = ((x / rect.width) * 100).toFixed(1);
        const glareY = ((y / rect.height) * 100).toFixed(1);
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(201, 20, 20, 0.35) 0%, transparent 65%)`;
        glareRef.current.style.opacity = '1';
      }
    },
    [maxTilt, perspective, scaleOnHover]
  );

  const handleMouseEnter = () => {
    if (glareRef.current) glareRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = isSelected ? '0.7' : '0';
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Specular Glare & Red Scan Highlight */}
      <div
        ref={glareRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: 'inherit',
          transition: 'opacity 0.2s ease',
          opacity: isSelected ? 0.7 : 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(201, 20, 20, 0.25) 0%, transparent 65%)',
        }}
      />
      {children}
    </div>
  );
};
