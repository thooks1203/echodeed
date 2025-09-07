import { Heart, Sliders } from 'lucide-react';
// import electricLogoUrl from '../assets/echodeed_electric_logo.png';
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
        <div className="flex items-center justify-between mb-4">
          <div className="w-8"> {/* Spacer for balance */}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-20 h-20 flex items-center justify-center animate-logoFloat">
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-gradient' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-gradient)' filter='drop-shadow(0 0 10px rgba(255,102,51,0.6))'/%3E%3C/svg%3E")`,
                  filter: 'drop-shadow(0 0 8px rgba(255,102,51,0.4)) drop-shadow(0 0 16px rgba(255,51,255,0.2))'
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">EchoDeed™</h1>
          </div>
          <button 
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors"
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
            <span className="ml-2 w-5 h-5 flex items-center justify-center text-xl animate-bounce-gentle" key="electric-counter">⚡</span>
          </div>
          <p className="text-primary-foreground/70 text-xs mt-1">acts of kindness shared</p>
        </div>
      </div>
    </header>
  );
}
