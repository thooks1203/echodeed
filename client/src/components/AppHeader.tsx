import { Heart, Sliders, User, LogOut } from 'lucide-react';
import { KindnessCounter } from '@shared/schema';
import { ElectricHeart } from './ElectricHeart';
import { BackButton } from './BackButton';
import { useAuth, switchDemoRole, getDemoRoles } from '@/hooks/useAuth';
import { useState } from 'react';

interface AppHeaderProps {
  counter: KindnessCounter;
  isPulse: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function AppHeader({ counter, isPulse, onBack, showBackButton }: AppHeaderProps) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const demoRoles = getDemoRoles();

  const handleRoleSwitch = (role: string) => {
    switchDemoRole(role as any);
    setShowUserMenu(false);
    window.location.reload(); // Refresh to apply new role
  };

  const handleSignOut = () => {
    localStorage.removeItem('echodeed_demo_role');
    setShowUserMenu(false);
    window.location.reload();
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="p-4">
        {/* Logo and Title Section */}
        <div className="flex items-center justify-center mb-4 relative">
          <div className="flex items-center space-x-4">
            <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" style={{width: '120px', height: '120px'}} className="animate-logoFloat" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-title">EchoDeed™</h1>
              <p className="text-sm text-muted-foreground font-medium mt-1" data-testid="text-tagline">Character Education, Reimagined</p>
            </div>
          </div>
          <div className="absolute right-0 relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
              data-testid="button-user-menu"
            >
              <User size={14} />
              <span className="text-xs font-medium">{user.name}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <span className="text-xs font-medium text-blue-600 mt-1">{user.schoolRole.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-600 px-2 py-1">Switch Demo User:</div>
                  {demoRoles.map((roleInfo) => (
                    <button
                      key={roleInfo.role}
                      onClick={() => handleRoleSwitch(roleInfo.role)}
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded ${user.schoolRole === roleInfo.role ? 'bg-blue-50' : ''}`}
                      data-testid={`switch-to-${roleInfo.role}`}
                    >
                      <div className="font-medium">{roleInfo.label}</div>
                      <div className="text-xs text-gray-500">{roleInfo.description}</div>
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    data-testid="sign-out"
                  >
                    <LogOut size={14} />
                    Sign Out (Reset to Default)
                  </button>
                </div>
              </div>
            )}
          </div>
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
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-4 rounded-2xl text-center shadow-xl transform hover:scale-105 transition-all duration-500 overflow-hidden max-w-2xl mx-auto">
          {/* Electric Heart positioned ABOVE the counter */}
          <div className="flex justify-center mb-2">
            <img 
              src="/electric-heart-logo.png" 
              alt="Electric Heart" 
              className="w-8 h-8 object-contain animate-pulse filter drop-shadow-lg" 
            />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/90 text-lg font-bold mb-2 animate-fade-in tracking-wide">
              🌟 GLOBAL KINDNESS COUNTER 🌟
            </p>
            
            {/* PERFECT SIZE NUMBER DISPLAY */}
            <div className="mb-3">
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
            <p className="text-white/90 text-xl md:text-2xl font-bold mb-3 animate-fade-in-delay tracking-wide">
              ✨ ACTS OF KINDNESS SHARED ✨
            </p>
            
            <div className="flex justify-center items-center gap-2 text-white/80 text-sm animate-fade-in-delay-2">
              <span className="inline-block animate-bounce">💝</span>
              <span>Making the world brighter, one deed at a time</span>
              <span className="inline-block animate-bounce delay-150">🌈</span>
            </div>
            
            {/* Progress bar showing growth */}
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full animate-pulse"
                style={{ width: '78%' }}
              ></div>
            </div>
            <p className="text-white/70 text-sm mt-2">🎯 On track to reach 300,000!</p>
          </div>
        </div>
        
      </div>
    </header>
  );
}
