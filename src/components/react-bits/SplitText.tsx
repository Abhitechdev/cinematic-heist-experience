import React, { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number; // base delay in ms
  stagger?: number; // ms per word/char
  by?: 'words' | 'chars';
  style?: React.CSSProperties;
  highlightWords?: string[];
  highlightColor?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  stagger = 35,
  by = 'words',
  style = {},
  highlightWords = [],
  highlightColor = '#c91414',
}) => {
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const timer = setTimeout(() => {
      setRevealed(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (by === 'words') {
    const words = text.split(' ');
    return (
      <span
        ref={containerRef}
        className={className}
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          gap: '0.28em',
          ...style,
        }}
        aria-label={text}
      >
        {words.map((word, i) => {
          const isHighlighted = highlightWords.some(
            (hw) => hw.toLowerCase() === word.replace(/[^a-zA-Z]/g, '').toLowerCase()
          );
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'top',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  color: isHighlighted ? highlightColor : 'inherit',
                  transform: revealed ? 'translateY(0) scale(1)' : 'translateY(110%) scale(0.96)',
                  opacity: revealed ? 1 : 0,
                  filter: revealed ? 'blur(0px)' : 'blur(8px)',
                  transition: `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms, opacity 0.75s ease ${i * stagger}ms, filter 0.8s ease ${i * stagger}ms`,
                  willChange: 'transform, opacity, filter',
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </span>
    );
  }

  // Split by characters
  const chars = Array.from(text);
  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-block',
        ...style,
      }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            transform: revealed ? 'translateY(0)' : 'translateY(100%)',
            opacity: revealed ? 1 : 0,
            filter: revealed ? 'blur(0px)' : 'blur(6px)',
            transition: `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms, opacity 0.6s ease ${i * stagger}ms, filter 0.7s ease ${i * stagger}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};
