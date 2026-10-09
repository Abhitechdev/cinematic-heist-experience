import React, { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number; // ms per frame
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  className?: string;
  style?: React.CSSProperties;
  trigger?: boolean | number | string;
  characters?: string;
}

const DEFAULT_CHARS = '0123456789ABCDEF!@#$%&*?_<>[]{}';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  className = '',
  style = {},
  trigger = true,
  characters = DEFAULT_CHARS,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const isScramblingRef = useRef(false);

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    if (!trigger) {
      setDisplayText(text);
      return;
    }

    isScramblingRef.current = true;
    let iteration = 0;
    const originalText = text;
    const len = originalText.length;

    const interval = setInterval(() => {
      setDisplayText(() => {
        const result = originalText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n') return char;
            // Solve characters progressively as iterations increase
            const solveThreshold = (iteration / maxIterations) * len;
            if (index < solveThreshold) {
              return originalText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
        return result;
      });

      iteration += 1;
      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(originalText);
        isScramblingRef.current = false;
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, trigger, speed, maxIterations, characters]);

  return (
    <span className={className} style={{ fontFamily: 'inherit', ...style }}>
      {displayText}
    </span>
  );
};
