import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
// import electricLogoUrl from '../assets/echodeed_electric_logo.png';
// import logoUrl from '@assets/ECHODEED_1757095612642.png';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('echoDeedOnboarded');
    if (!hasOnboarded) {
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('echoDeedOnboarded', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg mx-4 text-center shadow-xl max-w-sm">
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
          <img 
            src="/heart-logo-new.png?v=NUCLEAR1757267450&refresh=NOW" 
            alt="EchoDeed Electric Heart" 
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(255,102,51,0.4)) drop-shadow(0 0 24px rgba(255,51,255,0.2))'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="w-20 h-20 flex items-center justify-center text-6xl">⚡</div>';
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to EchoDeed™</h2>
        <p className="text-muted-foreground mb-1 leading-relaxed">
          EchoDeed™ is an anonymous kindness platform designed to inspire and track acts of kindness through a community-driven feed. Share your kind acts, browse a global feed of positivity, and watch our real-time global kindness counter grow. <strong>Your Kindness, Amplified.</strong>
        </p>
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-start-kindness"
        >
          TAP HERE to start spreading kindness
        </button>
      </div>
    </div>
  );
}
