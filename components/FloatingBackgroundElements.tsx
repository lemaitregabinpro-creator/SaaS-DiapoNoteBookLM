import React from 'react';

export const FloatingBackgroundElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Élément Gauche */}
      <img 
        src="/logo.png" 
        alt="Element décoratif IA" 
        className="absolute -top-20 -left-20 md:top-1/4 md:-left-24 w-64 h-64 md:w-96 md:h-96 object-contain opacity-20 blur-sm animate-spin-slow"
      />
      
      {/* Élément Droite */}
      <img 
        src="/logo.png" 
        alt="Element décoratif IA" 
        className="absolute -bottom-20 -right-20 md:bottom-1/4 md:-right-24 w-64 h-64 md:w-96 md:h-96 object-contain opacity-20 blur-sm animate-spin-reverse-slow"
      />
    </div>
  );
};
