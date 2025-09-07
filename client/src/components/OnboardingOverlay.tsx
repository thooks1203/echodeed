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
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-gradient3' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-gradient3)' filter='drop-shadow(0 0 10px rgba(255,102,51,0.6))'/%3E%3Cg transform='translate(100,100)'%3E%3Cpath d='M0,0 Q-50,-30 -80,0 Q-50,30 0,0 Q50,30 80,0 Q50,-30 0,0' fill='none' stroke='url(%23heart-gradient3)' stroke-width='2' opacity='0.4'/%3E%3Cpath d='M0,0 Q-60,-40 -100,0 Q-60,40 0,0 Q60,40 100,0 Q60,-40 0,0' fill='none' stroke='url(%23heart-gradient3)' stroke-width='1' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'drop-shadow(0 0 12px rgba(255,102,51,0.4)) drop-shadow(0 0 24px rgba(255,51,255,0.2))'
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
