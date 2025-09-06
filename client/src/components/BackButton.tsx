import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'minimal' | 'floating';
}

export function BackButton({ 
  onClick, 
  label = "Back", 
  className = "",
  style = {},
  variant = 'default'
}: BackButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    ...style
  };

  const variantStyles = {
    default: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: 'white'
    },
    minimal: {
      background: 'transparent',
      color: '#6b7280'
    },
    floating: {
      position: 'fixed' as const,
      top: '20px',
      left: '20px',
      background: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      color: '#374151',
      zIndex: 1000
    }
  };

  const combinedStyles = { ...baseStyles, ...variantStyles[variant] };

  return (
    <button
      onClick={onClick}
      className={className}
      style={combinedStyles}
      data-testid="button-back"
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        if (variant === 'default') {
          target.style.background = 'rgba(255,255,255,0.2)';
        } else if (variant === 'minimal') {
          target.style.background = 'rgba(107,114,128,0.1)';
        } else if (variant === 'floating') {
          target.style.transform = 'translateY(-2px)';
          target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        if (variant === 'default') {
          target.style.background = 'rgba(255,255,255,0.1)';
        } else if (variant === 'minimal') {
          target.style.background = 'transparent';
        } else if (variant === 'floating') {
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
    >
      <ArrowLeft size={16} />
      {label && <span>{label}</span>}
    </button>
  );
}