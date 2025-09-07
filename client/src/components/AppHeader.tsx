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
            <div className="w-8 h-8 flex items-center justify-center animate-logoFloat">
              <img src="/images/echodeed_electric_logo.png" alt="EchoDeed" className="w-8 h-8 object-contain border-2 border-red-500" onLoad={() => console.log('Header logo loaded successfully!')} onError={(e) => { console.log('Header logo failed to load'); e.currentTarget.innerHTML = '⚡'; e.currentTarget.style.display = 'flex'; e.currentTarget.style.alignItems = 'center'; e.currentTarget.style.justifyContent = 'center'; e.currentTarget.style.fontSize = '20px'; }} />
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
            <span className="ml-2 w-5 h-5 flex items-center justify-center text-xl animate-bounce-gentle">⚡</span>
          </div>
          <p className="text-primary-foreground/70 text-xs mt-1">acts of kindness shared</p>
        </div>
      </div>
    </header>
  );
}
