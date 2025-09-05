import { useState, useEffect } from 'react';
import logoUrl from '@assets/ECHODEED_1757095612642.png';

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
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="EchoDeed Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to EchoDeed™</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Share anonymous acts of kindness and inspire others. <strong>Your Kindness, Amplified.</strong>
        </p>
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-start-kindness"
        >
          Start Spreading Kindness
        </button>
      </div>
    </div>
  );
}
