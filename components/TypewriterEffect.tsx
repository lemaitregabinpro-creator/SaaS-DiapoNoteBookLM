import React, { useState, useEffect, useRef } from 'react';

interface TypewriterEffectProps {
  words: string[];
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (words.length === 0) return;

    let currentIndex = index;
    if (currentIndex >= words.length) {
      currentIndex = 0;
      setIndex(0);
      return;
    }

    const currentWord = words[currentIndex];

    if (subIndex === currentWord.length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, 2000);
      typeTimeoutRef.current = timeout;
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
      return;
    }

    setDisplayedText(currentWord.substring(0, subIndex));

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 50 : 100);
    
    typeTimeoutRef.current = timeout;

    return () => {
      if (typeTimeoutRef.current) {
        clearTimeout(typeTimeoutRef.current);
      }
    };
  }, [subIndex, index, reverse, words]);

  useEffect(() => {
    const handleBlink = () => {
      setBlink((prev) => !prev);
      blinkTimeoutRef.current = setTimeout(handleBlink, 500);
    };

    handleBlink();

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span className="font-mono font-bold text-gold-300 drop-shadow-md">
      {displayedText}
      <span className={`transition-opacity ${blink ? 'opacity-100' : 'opacity-0'}`}>|</span>
    </span>
  );
};
