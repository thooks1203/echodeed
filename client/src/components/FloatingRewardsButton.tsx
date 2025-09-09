import { useState, useEffect } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FloatingRewardsButtonProps {
  onRewardsClick: () => void;
}

interface UserTokens {
  echoTokens: number;
}

export function FloatingRewardsButton({ onRewardsClick }: FloatingRewardsButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Fetch user tokens to show balance
  const { data: userTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
  });

  // Add pulsing effect periodically to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 15000); // Pulse every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999,
        background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%)',
        borderRadius: '50px',
        padding: '12px 20px',
        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
        cursor: 'pointer',
        transform: isPulsing ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        animation: isPulsing ? 'rewards-pulse 2s ease-in-out' : 'none'
      }}
      onClick={onRewardsClick}
      data-testid="floating-rewards-button"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        <Gift className="w-5 h-5" />
        <span>💎 {userTokens?.echoTokens || 0}</span>
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* Floating sparkle effect */}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          animation: 'sparkle-float 3s ease-in-out infinite',
          fontSize: '12px'
        }}
      >
        ✨
      </div>


      <style>
        {`
          @keyframes rewards-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6); }
          }
          @keyframes sparkle-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
            50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
}