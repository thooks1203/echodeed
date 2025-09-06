import { Heart, Sliders } from 'lucide-react';
import { KindnessCounter } from '@shared/schema';
// import logoUrl from '@assets/ECHODEED_1757095612642.png';

interface AppHeaderProps {
  counter: KindnessCounter;
  isPulse: boolean;
}

export function AppHeader({ counter, isPulse }: AppHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-logoFloat">
              <Heart className="text-primary-foreground" size={14} />
            </div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">EchoDeed™</h1>
          </div>
          <button 
            className="absolute right-0 p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors"
            data-testid="button-settings"
          >
            <Sliders size={14} />
          </button>
        </div>
        
        {/* Global Kindness Counter */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-lg text-center">
          <p className="text-primary-foreground/80 text-sm font-medium mb-1">Global Kindness Counter</p>
          <div className="flex items-center justify-center">
            <span 
              className={`text-3xl font-bold text-primary-foreground ${isPulse ? 'counter-pulse' : ''}`}
              data-testid="text-kindness-counter"
            >
              {counter.count.toLocaleString()}
            </span>
            <Heart className="ml-2 text-primary-foreground animate-bounce-gentle" size={20} />
          </div>
          <p className="text-primary-foreground/70 text-xs mt-1">acts of kindness shared</p>
        </div>
      </div>
    </header>
  );
}
