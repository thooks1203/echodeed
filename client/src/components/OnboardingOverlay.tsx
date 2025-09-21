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
        <div className="flex items-center justify-center gap-4 mb-6">
          <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" style={{width: '120px', height: '120px'}} />
          <h2 className="text-3xl font-bold text-foreground">Welcome to EchoDeed™</h2>
        </div>
        <p className="text-muted-foreground mb-1 leading-relaxed">
          EchoDeed™ is an innovative character education platform that transforms how students learn empathy and social responsibility. Share anonymous acts of kindness, track character development, and build positive school culture through our evidence-based approach. <strong>Character Education, Reimagined.</strong>
        </p>
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-start-kindness"
        >
          TAP HERE to start building character
        </button>
      </div>
    </div>
  );
}
