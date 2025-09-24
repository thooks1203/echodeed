import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Sparkles, Star, PartyPopper } from 'lucide-react';

interface SurpriseGiveawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  giveaway?: {
    id: string;
    title: string;
    description: string;
    partnerName: string;
    partnerLogo?: string;
    redemptionCode?: string;
    expiresAt?: string;
    location?: string;
  };
  onRedeem?: () => void;
}

export function SurpriseGiveawayModal({ 
  isOpen, 
  onClose, 
  giveaway, 
  onRedeem 
}: SurpriseGiveawayModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(0);
      setShowConfetti(true);
      
      // Animated reveal sequence
      const timer1 = setTimeout(() => setAnimationPhase(1), 500);
      const timer2 = setTimeout(() => setAnimationPhase(2), 1200);
      const timer3 = setTimeout(() => setAnimationPhase(3), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  if (!isOpen || !giveaway) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(6, 182, 212, 0.95) 50%, rgba(16, 185, 129, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        animation: isOpen ? 'surprise-fade-in 0.5s ease-out' : 'none'
      }}
      data-testid="surprise-giveaway-modal"
    >
      {/* Confetti Background Effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              {i % 4 === 0 ? '🎉' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🎊' : '💫'}
            </div>
          ))}
        </div>
      )}

      {/* Main Modal */}
      <Card 
        className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-lg border-2 border-white/50 shadow-2xl"
        style={{
          transform: animationPhase >= 1 ? 'scale(1)' : 'scale(0.8)',
          opacity: animationPhase >= 1 ? 1 : 0,
          transition: 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <CardHeader className="text-center pb-4">
          {/* Celebration Icon */}
          <div 
            className="mx-auto mb-4 relative"
            style={{
              transform: animationPhase >= 2 ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)',
              transition: 'all 0.8s ease-out',
              transitionDelay: '0.3s'
            }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse">
              <Star className="w-5 h-5 text-pink-400" />
            </div>
          </div>

          <CardTitle 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
            style={{
              opacity: animationPhase >= 2 ? 1 : 0,
              transform: animationPhase >= 2 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out',
              transitionDelay: '0.8s'
            }}
          >
            🎉 Surprise Giveaway! 🎉
          </CardTitle>

          <div 
            className="text-lg font-semibold text-gray-700"
            style={{
              opacity: animationPhase >= 3 ? 1 : 0,
              transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out',
              transitionDelay: '1.2s'
            }}
          >
            Congratulations! You were just selected for:
          </div>
        </CardHeader>

        <CardContent 
          className="space-y-6"
          style={{
            opacity: animationPhase >= 3 ? 1 : 0,
            transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out',
            transitionDelay: '1.5s'
          }}
        >
          {/* Reward Details */}
          <div className="text-center space-y-4">
            {giveaway.partnerLogo && (
              <img 
                src={giveaway.partnerLogo} 
                alt={giveaway.partnerName}
                className="w-16 h-16 mx-auto rounded-lg shadow-md"
              />
            )}
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {giveaway.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {giveaway.description}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                <Gift className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-purple-700 font-medium">
                  from {giveaway.partnerName}
                </span>
              </div>
            </div>

            {giveaway.location && (
              <p className="text-sm text-gray-500">
                📍 {giveaway.location}
              </p>
            )}
          </div>

          {/* Redemption Code */}
          {giveaway.redemptionCode && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Your redemption code:</p>
              <div className="font-mono text-lg font-bold text-orange-600 bg-white px-3 py-2 rounded border">
                {giveaway.redemptionCode}
              </div>
            </div>
          )}

          {/* Expiry Info */}
          {giveaway.expiresAt && (
            <p className="text-xs text-gray-500 text-center">
              ⏰ Expires: {new Date(giveaway.expiresAt).toLocaleDateString()}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onRedeem}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              data-testid="redeem-surprise-giveaway"
            >
              <Gift className="w-5 h-5 mr-2" />
              Claim Now!
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 hover:bg-gray-50"
              data-testid="close-surprise-giveaway"
            >
              Later
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            🌟 This surprise giveaway was made possible by our amazing sponsors!
          </p>
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes surprise-fade-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(10px); }
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Export test utilities for demo purposes
export const testSurpriseGiveaway = {
  mockGiveaway: {
    id: 'surprise-123',
    title: 'Free Chicken Sandwich!',
    description: 'Enjoy a delicious original chicken sandwich - our treat!',
    partnerName: 'Chick-fil-A Burlington',
    redemptionCode: 'SURPRISE2024',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: '2710 S Church St, Burlington, NC'
  }
};