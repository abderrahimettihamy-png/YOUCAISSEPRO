import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 120, variant = 'full' }) => {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#f093fb" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="iconShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Fond circulaire moderne avec triple gradient */}
        <circle cx="50" cy="50" r="47" fill="url(#gradient1)" filter="url(#iconShadow)" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
        
        {/* Caisse futuriste */}
        <rect x="28" y="35" width="44" height="32" rx="4" fill="white" opacity="0.97" filter="url(#iconShadow)"/>
        
        {/* Écran holographique avec effet glow */}
        <rect x="31" y="39" width="38" height="12" rx="2" fill="url(#accentGrad)" filter="url(#glow)"/>
        <text x="50" y="48" fontSize="8" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="1.5">YOU</text>
        
        {/* Interface tactile moderne */}
        <g opacity="0.85">
          <rect x="32" y="54" width="7" height="5" rx="1" fill="#667eea"/>
          <rect x="40.5" y="54" width="7" height="5" rx="1" fill="#764ba2"/>
          <rect x="49" y="54" width="7" height="5" rx="1" fill="#f093fb"/>
          <rect x="57.5" y="54" width="10" height="5" rx="1" fill="url(#goldGrad)"/>
          
          <rect x="32" y="61" width="7" height="5" rx="1" fill="#667eea"/>
          <rect x="40.5" y="61" width="7" height="5" rx="1" fill="#764ba2"/>
          <rect x="49" y="61" width="7" height="5" rx="1" fill="#f093fb"/>
          <rect x="57.5" y="61" width="10" height="5" rx="1" fill="url(#goldGrad)"/>
        </g>
        
        {/* LED indicateur */}
        <circle cx="67" cy="38" r="1.8" fill="#4ade80" opacity="0.95" filter="url(#glow)"/>
        
        {/* Badge Premium */}
        <g transform="translate(77, 23)">
          <circle cx="0" cy="0" r="10" fill="url(#goldGrad)" filter="url(#iconShadow)"/>
          <circle cx="0" cy="0" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
          <path d="M0,-5.5 L1.5,-2 L5,-1.5 L2.5,1 L3,5 L0,3 L-3,5 L-2.5,1 L-5,-1.5 L-1.5,-2 Z" fill="white" filter="url(#glow)"/>
        </g>
      </svg>
    );
  }

  return (
    <svg width={size * 2.5} height={size} viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="goldBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="fullShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.35"/>
        </filter>
        <filter id="textGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Icône moderne à gauche */}
      <circle cx="50" cy="50" r="46" fill="url(#logoGradient1)" filter="url(#fullShadow)" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      
      <rect x="28" y="37" width="44" height="30" rx="4" fill="white" opacity="0.97" />
      <rect x="31" y="40" width="38" height="11" rx="2" fill="url(#logoGradient2)" filter="url(#textGlow)"/>
      <text x="50" y="48.5" fontSize="7.5" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="1.5">YOU</text>
      
      <g opacity="0.85">
        <rect x="32" y="54" width="7" height="4.5" rx="1" fill="#667eea"/>
        <rect x="40.5" y="54" width="7" height="4.5" rx="1" fill="#764ba2"/>
        <rect x="49" y="54" width="7" height="4.5" rx="1" fill="#f093fb"/>
        <rect x="57.5" y="54" width="10" height="4.5" rx="1" fill="url(#goldBadge)"/>
        <rect x="32" y="60" width="7" height="4.5" rx="1" fill="#667eea"/>
        <rect x="40.5" y="60" width="7" height="4.5" rx="1" fill="#764ba2"/>
        <rect x="49" y="60" width="7" height="4.5" rx="1" fill="#f093fb"/>
        <rect x="57.5" y="60" width="10" height="4.5" rx="1" fill="url(#goldBadge)"/>
      </g>
      
      <circle cx="67" cy="39.5" r="1.7" fill="#4ade80" opacity="0.95" filter="url(#textGlow)"/>
      
      <g transform="translate(76, 24)">
        <circle cx="0" cy="0" r="9" fill="url(#goldBadge)" filter="url(#fullShadow)"/>
        <circle cx="0" cy="0" r="7" fill="none" stroke="white" strokeWidth="0.8" opacity="0.4"/>
        <path d="M0,-5 L1.3,-1.8 L4.5,-1.3 L2.2,1 L2.7,4.5 L0,2.7 L-2.7,4.5 L-2.2,1 L-4.5,-1.3 L-1.3,-1.8 Z" fill="white" filter="url(#textGlow)"/>
      </g>
      
      {/* Texte YOU avec effet moderne */}
      <text x="110" y="48" fontSize="38" fontWeight="900" fill="url(#logoGradient1)" fontFamily="Arial, sans-serif" letterSpacing="1" filter="url(#textGlow)">
        YOU
      </text>
      
      {/* Texte CAISSE */}
      <text x="110" y="76" fontSize="26" fontWeight="700" fill="#2d3748" fontFamily="Arial, sans-serif" letterSpacing="0.5">
        CAISSE
      </text>
      
      {/* Badge PREMIUM modernisé */}
      <rect x="215" y="52" width="72" height="26" rx="13" fill="url(#goldBadge)" filter="url(#fullShadow)" />
      <rect x="217" y="54" width="68" height="22" rx="11" fill="none" stroke="white" strokeWidth="1" opacity="0.35"/>
      <text x="251" y="69.5" fontSize="13" fontWeight="800" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="1.2">
        PREMIUM
      </text>
    </svg>
  );
};

export default Logo;
