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
        
        {/* 🎉 SPECTACULAR Global Kindness Counter 🎉 */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-4 rounded-2xl text-center shadow-xl transform hover:scale-105 transition-all duration-500 overflow-hidden">
          {/* Electric Heart positioned ABOVE the counter */}
          <div className="flex justify-center mb-2">
            <img 
              src="/electric-heart-logo.png" 
              alt="Electric Heart" 
              className="w-8 h-8 object-contain animate-pulse filter drop-shadow-lg" 
            />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/90 text-sm font-bold mb-1 animate-fade-in tracking-wide">
              🌟 GLOBAL KINDNESS COUNTER 🌟
            </p>
            
            {/* PERFECT SIZE NUMBER DISPLAY */}
            <div className="mb-2">
              <span 
                className={`text-4xl md:text-5xl font-black text-white drop-shadow-xl ${isPulse ? 'animate-bounce' : 'animate-pulse'} tracking-tight`}
                data-testid="text-kindness-counter"
                style={{ 
                  textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)',
                  background: 'linear-gradient(45deg, #fff, #ffd700, #fff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {counter.count.toLocaleString()}
              </span>
            </div>
            
            {/* Spectacular description with emojis */}
            <p className="text-white/90 text-base md:text-lg font-bold mb-2 animate-fade-in-delay tracking-wide">
              ✨ ACTS OF KINDNESS SHARED ✨
            </p>
            
            <div className="flex justify-center items-center gap-2 text-white/80 text-xs animate-fade-in-delay-2">
              <span className="inline-block animate-bounce">💝</span>
              <span>Making the world brighter, one deed at a time</span>
              <span className="inline-block animate-bounce delay-150">🌈</span>
            </div>
            
            {/* Progress bar showing growth */}
            <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full animate-pulse"
                style={{ width: '78%' }}
              ></div>
            </div>
            <p className="text-white/70 text-xs mt-1">🎯 On track to reach 300,000!</p>
          </div>
        </div>
        
      </div>
    </header>
  );
}
