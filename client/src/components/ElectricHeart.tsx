interface ElectricHeartProps {
  size?: number;
  className?: string;
}

export function ElectricHeart({ size = 24, className = "" }: ElectricHeartProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      style={{
        filter: 'drop-shadow(0 0 8px rgba(255,102,51,0.4)) drop-shadow(0 0 16px rgba(255,51,255,0.2))'
      }}
    >
      <defs>
        <radialGradient id={`heart-gradient-${size}`} cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#ff6633' }} />
          <stop offset="25%" style={{ stopColor: '#ff33ff' }} />
          <stop offset="75%" style={{ stopColor: '#a855f7' }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
        </radialGradient>
      </defs>
      <path 
        d="M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z" 
        fill={`url(#heart-gradient-${size})`}
      />
      <g transform="translate(100,100)">
        <path 
          d="M0,0 Q-50,-30 -80,0 Q-50,30 0,0 Q50,30 80,0 Q50,-30 0,0" 
          fill="none" 
          stroke={`url(#heart-gradient-${size})`}
          strokeWidth="2" 
          opacity="0.4"
        />
        <path 
          d="M0,0 Q-60,-40 -100,0 Q-60,40 0,0 Q60,40 100,0 Q60,-40 0,0" 
          fill="none" 
          stroke={`url(#heart-gradient-${size})`}
          strokeWidth="1" 
          opacity="0.3"
        />
      </g>
    </svg>
  );
}