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
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      border: 'none'
    },
    minimal: {
      background: 'linear-gradient(135deg, #10B981, #06B6D4)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      border: 'none',
      fontWeight: '700',
      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
    },
    floating: {
      position: 'fixed' as const,
      top: '20px',
      left: '20px',
      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
      border: 'none',
      color: 'white',
      fontWeight: '700',
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
        target.style.transform = 'translateY(-1px)';
        if (variant === 'default') {
          target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        } else if (variant === 'minimal') {
          target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
        } else if (variant === 'floating') {
          target.style.transform = 'translateY(-2px)';
          target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
        if (variant === 'default') {
          target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        } else if (variant === 'minimal') {
          target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        } else if (variant === 'floating') {
          target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
        }
      }}
    >
      <ArrowLeft size={16} />
      {label && <span>{label}</span>}
    </button>
  );
}