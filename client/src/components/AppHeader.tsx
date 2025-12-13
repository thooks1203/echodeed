import { Heart, Sliders, User, LogOut, Coins } from 'lucide-react';
import { KindnessCounter, UserTokens } from '@shared/schema';
import { ElectricHeart } from './ElectricHeart';
import { BackButton } from './BackButton';
import { useAuth, switchDemoRole, getDemoRoles } from '@/hooks/useAuth';
import { useState } from 'react';

interface AppHeaderProps {
  counter: KindnessCounter;
  isPulse: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  tokens?: UserTokens;
}

export function AppHeader({ counter, isPulse, onBack, showBackButton, tokens }: AppHeaderProps) {
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
    window.location.href = '/';
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="p-4 max-w-full overflow-hidden">
        {/* Logo and Title Section */}
        <div className="flex items-center justify-center mb-4 max-w-full">
          <div className="flex items-center space-x-2 max-w-full">
            <img src="/electric-heart-logo.png" alt="EchoDeed Electric Heart" className="w-28 h-auto md:w-36 flex-shrink-0 animate-logoFloat object-contain" />
            <div className="text-center flex-shrink min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate" data-testid="text-app-title">EchoDeed™</h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1" data-testid="text-tagline">Character Education, Reimagined</p>
            </div>
          </div>
        </div>

        {/* Kid-Friendly User Menu - Prominent Position */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg border-3 border-yellow-300 hover:scale-105 w-full max-w-xs"
              data-testid="button-user-menu"
              style={{ 
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              <div className="flex items-center gap-2">
                <User size={20} />
                <span className="text-sm font-bold">Signed in as:</span>
              </div>
              <span className="text-base font-bold">{user?.name || 'User'}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">👆 Click to see current user & sign out!</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border-3 border-yellow-300 z-[100]">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">👋 Hi {user?.name?.split(' ')[0] || 'User'}!</div>
                    <div className="text-sm text-gray-600">{user?.email || 'No email'}</div>
                    <div className="inline-block px-3 py-1 mt-2 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                      You are: {user?.schoolRole?.toUpperCase() || 'STUDENT'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="text-sm font-bold text-gray-700 px-2 py-2 text-center">🔄 Want to try a different user?</div>
                  {demoRoles.map((roleInfo) => (
                    <button
                      key={roleInfo.role}
                      onClick={() => handleRoleSwitch(roleInfo.role)}
                      className={`w-full text-left px-3 py-3 text-sm hover:bg-yellow-50 rounded-lg border-2 mb-2 transition-colors ${user?.schoolRole === roleInfo.role ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}
                      data-testid={`switch-to-${roleInfo.role}`}
                    >
                      <div className="font-bold text-gray-800">{roleInfo.label}</div>
                      <div className="text-xs text-gray-600">{roleInfo.description}</div>
                    </button>
                  ))}
                </div>
                
                <div className="border-t-3 border-yellow-200 p-3 bg-red-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-lg font-bold text-red-700 hover:bg-red-100 rounded-lg border-2 border-red-300 transition-colors"
                    data-testid="sign-out"
                  >
                    <LogOut size={18} />
                    🚪 Sign Out (Go Back to Default)
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
            
          </div>
        </div>
        
      </div>
    </header>
  );
}
