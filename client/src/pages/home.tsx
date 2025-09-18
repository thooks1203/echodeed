import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { WelcomeModal } from '@/components/WelcomeModal';
import { SchoolsDashboard } from '@/components/SchoolsDashboard';
import { SummerChallenges } from '@/components/SummerChallenges';
import { ConflictReportModal } from '@/components/ConflictReportModal';
import { BullyingPreventionDashboard } from '@/components/BullyingPreventionDashboard';
import { KindnessExchangeModal } from '@/components/KindnessExchangeModal';
import { SupportCircle } from '@/components/SupportCircle';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens } from '@shared/schema';
import { PostFilters, WebSocketMessage, TokenEarning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface RewardOffer {
  id: string;
  title: string;
  echoCost: number;
  description: string;
  partnerName: string;
  isDualReward?: boolean;
}

export default function Home() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('echodeed_has_seen_welcome');
    return !hasSeenWelcome;
  });
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  
  // Revolutionary Features Modal States
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showKindnessExchangeModal, setShowKindnessExchangeModal] = useState(false);
  const { toast } = useToast();
  
  const { location } = useGeolocation();

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['feed', 'schools', 'support', 'summer', 'rewards'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Remove the tab parameter from URL to keep it clean
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch data
  const { data: posts = [], isLoading: postsLoading } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      
      const response = await fetch(`/api/posts?${params}`);
      return response.json();
    }
  });

  const { data: counter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
    queryFn: () => fetch('/api/counter').then(r => r.json())
  });

  const { data: tokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    queryFn: () => fetch('/api/tokens').then(r => r.json())
  });

  // Fetch real Burlington/Alamance County rewards
  const { data: realRewards = [] } = useQuery<RewardOffer[]>({
    queryKey: ['/api/rewards/offers/all/all'],
    queryFn: () => fetch('/api/rewards/offers/all/all').then(r => r.json())
  });

  // WebSocket for real-time updates
  useWebSocket((message: WebSocketMessage) => {
    if (message.type === 'NEW_POST') {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 1000);
    } else if (message.type === 'COUNTER_UPDATE') {
      queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 1000);
    }
  });

  const handleFilterChange = useCallback((filter: string, newFilters: PostFilters) => {
    setActiveFilter(filter);
    setFilters(newFilters);
  }, []);

  const handlePostSuccess = useCallback(() => {
    setIsPostModalOpen(false);
    toast({
      title: "Thank you for sharing!",
      description: "Your act of kindness has been added to the feed.",
    });
    // Show token earning animation
    setTimeout(() => {
      setTokenEarning({ amount: 10, reason: "Posted a deed!" });
      setTimeout(() => setTokenEarning(null), 3000);
    }, 500);
  }, [toast]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('echodeed_has_seen_welcome', 'true');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Show different content based on active tab
  if (activeTab === 'schools') {
    return (
      <SchoolsDashboard 
        onNavigateToTab={navigateToTab} 
        activeBottomTab={activeTab}
      />
    );
  }

  if (activeTab === 'ai-safety') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <AppHeader counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} isPulse={counterPulse} />
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', 
          color: 'white', 
          padding: '32px 20px', 
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
            🛡️ AI-Powered School Safety Revolution
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Three groundbreaking AI systems that no other platform has in the world
          </p>
        </div>
        
        <div style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => setShowConflictModal(true)}
              style={{
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.borderColor = '#8B5CF6';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.borderColor = '#E5E7EB';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
              data-testid="conflict-resolution-button"
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                Anonymous Conflict Resolution
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                World's first AI-powered anonymous conflict reporting system with real-time mediation 
                and teacher alert integration. Report conflicts safely and get immediate AI guidance.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('bullying-prevention')}
              style={{
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.borderColor = '#8B5CF6';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.borderColor = '#E5E7EB';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
              data-testid="bullying-prevention-button"
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                Predictive Bullying Prevention
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                Revolutionary AI that predicts potential bullying incidents before they happen using 
                behavioral analysis and social dynamics. Prevent problems before they start.
              </p>
            </button>

            <button
              onClick={() => setShowKindnessExchangeModal(true)}
              style={{
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.borderColor = '#8B5CF6';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.borderColor = '#E5E7EB';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
              data-testid="kindness-exchange-button"
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                Global Kindness Exchange
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                Send anonymous kindness messages to students worldwide with AI-powered cultural 
                matching and translation. Build global empathy one message at a time.
              </p>
            </button>
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Revolutionary Features Modals */}
        <ConflictReportModal 
          isOpen={showConflictModal} 
          onClose={() => setShowConflictModal(false)} 
        />
        <KindnessExchangeModal 
          isOpen={showKindnessExchangeModal} 
          onClose={() => setShowKindnessExchangeModal(false)} 
        />
      </div>
    );
  }

  if (activeTab === 'bullying-prevention') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <AppHeader counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} isPulse={counterPulse} />
        <BullyingPreventionDashboard />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'summer') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF' }}>
        <SummerChallenges />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'rewards') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <AppHeader counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} isPulse={counterPulse} />
        
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '16px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎁 Rewards & Partners
          </h2>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Your $ECHO Balance
            </h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
              {tokens?.echoBalance || 0} $ECHO
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Available Rewards
            </h3>
            
            {realRewards.slice(0, 8).map((reward, index) => {
              // Get appropriate icons for Burlington/Alamance County rewards
              const getRewardIcon = (partnerName: string, title: string) => {
                if (partnerName?.includes('Carousel')) return '🎠';
                if (partnerName?.includes('Theater') || title?.includes('Movie')) return '🎬';
                if (partnerName?.includes('Museum')) return '🏛️';
                if (partnerName?.includes('Custard') || partnerName?.includes('Ice Cream')) return '🍦';
                if (partnerName?.includes('Putt-Putt') || title?.includes('Mini Golf')) return '⛳';
                if (partnerName?.includes('Baseball') || partnerName?.includes('Sock Puppets')) return '⚾';
                if (partnerName?.includes('Pizza')) return '🍕';
                if (partnerName?.includes('Chick-fil-A')) return '🐔';
                if (partnerName?.includes('Libraries') || title?.includes('Reading')) return '📚';
                if (partnerName?.includes('Diner')) return '🥞';
                if (partnerName?.includes('Bowling') || partnerName?.includes('Buffaloe')) return '🎳';
                if (reward.isDualReward) return '🎁';
                return '🎯';
              };
              
              return (
                <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ fontSize: '32px' }}>{getRewardIcon(reward.partnerName, reward.title)}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {reward.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {reward.partnerName} - {reward.description.substring(0, 50)}...
                  </p>
                  {reward.isDualReward && (
                    <p style={{ fontSize: '10px', color: '#8B5CF6', margin: '2px 0 0 0', fontWeight: '600' }}>
                      🚀 DUAL REWARD - Kid + Parent!
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#8B5CF6', marginBottom: '8px' }}>
                    {reward.echoCost} $ECHO
                  </div>
                  <button 
                    onClick={() => window.location.href = '/rewards'}
                    style={{
                      backgroundColor: (tokens?.echoBalance || 0) >= reward.echoCost ? '#10B981' : '#e5e7eb',
                      color: (tokens?.echoBalance || 0) >= reward.echoCost ? 'white' : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {(tokens?.echoBalance || 0) >= reward.echoCost ? 'Redeem' : 'Need More'}
                  </button>
                </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }

  if (activeTab === 'support') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <AppHeader counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} isPulse={counterPulse} />
        <SupportCircle onBack={() => {
          console.log('home.tsx: onBack called, setting activeTab to feed');
          setActiveTab('feed');
          console.log('home.tsx: activeTab set to feed');
        }} />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'badges') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <AppHeader counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} isPulse={counterPulse} />
        
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '16px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏅 Badges & Achievements
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Your Achievements
            </h3>
            
            {[
              { name: 'First Spark', description: 'Posted your first deed', icon: '⚡', earned: true },
              { name: 'Kind Heart', description: 'Posted 5 deeds', icon: '💝', earned: false },
              { name: 'Community Helper', description: 'Posted 10 deeds', icon: '🤝', earned: false },
              { name: 'Kindness Champion', description: 'Posted 25 deeds', icon: '🏆', earned: false },
            ].map((badge, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: badge.earned ? 1 : 0.6
              }}>
                <div style={{ 
                  fontSize: '32px',
                  filter: badge.earned ? 'none' : 'grayscale(100%)'
                }}>
                  {badge.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {badge.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {badge.description}
                  </p>
                </div>
                {badge.earned && (
                  <div style={{ 
                    backgroundColor: '#10B981', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Earned!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }

  // Default: Show main feed
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AppHeader 
        counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} 
        isPulse={counterPulse} 
        showBackButton={true}
        onBack={handleBackToDashboard}
      />
      
      <div style={{ paddingBottom: '100px' }}>
        <FilterBar 
          activeFilter={activeFilter} 
          location={location}
          onFilterChange={handleFilterChange}
        />
        
        <KindnessFeed 
          posts={posts} 
          isLoading={postsLoading} 
        />
      </div>
      
      <FloatingActionButton onClick={() => setIsPostModalOpen(true)} />
      <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      
      {/* Modals */}
      <PostDeedModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        location={location}
      />
      
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
      />

      {/* Token earning notification */}
      {tokenEarning && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>🪙</span>
          <div>
            <div>+{tokenEarning.amount} $ECHO</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{tokenEarning.reason}</div>
          </div>
        </div>
      )}
    </div>
  );
}