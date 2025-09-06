import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
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
        <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
          <Heart className="text-2xl text-primary-foreground" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to EchoDeed™</h2>
        <p className="text-muted-foreground mb-3 leading-relaxed">
          EchoDeed™ is an anonymous kindness platform designed to inspire and track acts of kindness through a community-driven feed. Share your kind acts, browse a global feed of positivity, and watch our real-time global kindness counter grow. <strong>Your Kindness, Amplified.</strong>
        </p>
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-start-kindness"
        >
          Click Here to Start Spreading Kindness!
        </button>
      </div>
    </div>
  );
}
