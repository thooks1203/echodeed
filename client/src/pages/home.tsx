import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { WelcomeModal } from '@/components/WelcomeModal';
import { SchoolsDashboard } from '@/components/SchoolsDashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens } from '@shared/schema';
import { PostFilters, WebSocketMessage, TokenEarning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const queryClient = useQueryClient();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('schools');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('echodeed_has_seen_welcome');
    return !hasSeenWelcome;
  });
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  const { toast } = useToast();
  
  const { location } = useGeolocation();

  // Fetch data
  const { data: posts = [], isLoading: postsLoading } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      
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

  // WebSocket for real-time updates
  useWebSocket((message: WebSocketMessage) => {
    if (message.type === 'kindness_post') {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 1000);
    } else if (message.type === 'token_earned') {
      setTokenEarning(message.data);
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      setTimeout(() => setTokenEarning(null), 3000);
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

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Show different content based on active tab
  if (activeTab === 'schools') {
    return <SchoolsDashboard />;
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
        <AppHeader counter={counter || { count: 0 }} isPulse={counterPulse} />
        
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
            
            {[
              { name: 'Starbucks Coffee', cost: 500, icon: '☕', description: '$5 gift card' },
              { name: 'Amazon Gift Card', cost: 1000, icon: '🛒', description: '$10 gift card' },
              { name: 'Netflix Subscription', cost: 1500, icon: '🎬', description: '1 month free' },
              { name: 'Charity Donation', cost: 750, icon: '💝', description: '$7.50 to charity' },
            ].map((reward, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ fontSize: '32px' }}>{reward.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {reward.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {reward.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#8B5CF6', marginBottom: '8px' }}>
                    {reward.cost} $ECHO
                  </div>
                  <button style={{
                    backgroundColor: (tokens?.echoBalance || 0) >= reward.cost ? '#10B981' : '#e5e7eb',
                    color: (tokens?.echoBalance || 0) >= reward.cost ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: (tokens?.echoBalance || 0) >= reward.cost ? 'pointer' : 'not-allowed'
                  }}>
                    {(tokens?.echoBalance || 0) >= reward.cost ? 'Redeem' : 'Need More'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
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
        <AppHeader counter={counter || { count: 0 }} isPulse={counterPulse} />
        
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
      <AppHeader counter={counter || { count: 0 }} isPulse={counterPulse} />
      
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