import { Heart, Sliders } from 'lucide-react';
import { KindnessCounter } from '@shared/schema';
import { ElectricHeart } from './ElectricHeart';
import { BackButton } from './BackButton';

interface AppHeaderProps {
  counter: KindnessCounter;
  isPulse: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function AppHeader({ counter, isPulse, onBack, showBackButton }: AppHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="p-4">
        {/* Logo and Title Section */}
        <div className="flex items-center justify-center mb-4 relative">
          <div className="flex items-center space-x-4">
            <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" style={{width: '120px', height: '120px'}} className="animate-logoFloat" />
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-title">EchoDeed™</h1>
          </div>
          <button 
            className="absolute right-0 p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition-colors"
            data-testid="button-settings"
          >
            <Sliders size={14} />
          </button>
        </div>

        {/* Dashboard Section - Below Logo */}
        {(showBackButton && onBack) && (
          <div className="mb-4">
            <BackButton 
              onClick={onBack} 
              label="Dashboard"
              variant="minimal"
              style={{ 
                color: '#6B7280', 
                fontSize: '12px', 
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            />
          </div>
        )}
        
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
            <img src="/electric-heart-logo.png" alt="Electric Heart" className="ml-2 w-5 h-5 object-contain" />
          </div>
          <p className="text-primary-foreground/70 text-xs mt-1">acts of kindness shared</p>
        </div>
        
      </div>
    </header>
  );
}
