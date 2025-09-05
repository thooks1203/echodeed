import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens, BrandChallenge } from '@shared/schema';
import { PostFilters, WebSocketMessage } from '@/lib/types';
import { getSessionId, addSessionHeaders } from '@/lib/session';

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tokenEarning, setTokenEarning] = useState<{amount: number, reason: string} | null>(null);

  const { location } = useGeolocation();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, filterParams] = queryKey;
      const searchParams = new URLSearchParams();
      
      if (filterParams && typeof filterParams === 'object') {
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) searchParams.set(key, value as string);
        });
      }
      
      const url = searchParams.toString() ? `${baseUrl}?${searchParams}` : baseUrl as string;
      const response = await fetch(url, { 
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Fetch counter
  const { data: counter, refetch: refetchCounter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
  });

  // Fetch user tokens
  const { data: tokens, refetch: refetchTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    retry: 2,
  });

  // Fetch brand challenges
  const { data: challenges = [] } = useQuery<BrandChallenge[]>({
    queryKey: ['/api/challenges'],
  });

  // Fetch completed challenges
  const { data: completedChallenges = [] } = useQuery<string[]>({
    queryKey: ['/api/challenges/completed'],
  });

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'NEW_POST') {
      refetchPosts();
    } else if (message.type === 'COUNTER_UPDATE') {
      refetchCounter();
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 600);
    } else if (message.type === 'POST_UPDATE') {
      refetchPosts(); // Refetch posts to get updated counts
      refetchTokens(); // Refetch tokens to get updated balance
    }
  }, [refetchPosts, refetchCounter, refetchTokens]);

  // Initialize WebSocket
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const handleFilterChange = (filter: string, newFilters: PostFilters) => {
    setActiveFilter(filter);
    setFilters(newFilters);
  };

  const handleHeartPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/heart`, { 
        method: 'POST',
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to add heart');
      
      // Show earning feedback popup
      setTokenEarning({ amount: 1, reason: 'Showing love! 💜' });
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Post and tokens will update via WebSocket
      refetchTokens(); // Force refresh tokens
    } catch (error) {
      console.error('Failed to add heart:', error);
    }
  };

  const handleEchoPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/echo`, { 
        method: 'POST',
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to add echo');
      
      // Show earning feedback popup
      setTokenEarning({ amount: 2, reason: 'Echoing kindness! 🌊' });
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Post and tokens will update via WebSocket  
      refetchTokens(); // Force refresh tokens
    } catch (error) {
      console.error('Failed to add echo:', error);
    }
  };

  const handleCompleteChallenge = async (challengeId: string, brandName: string, reward: number) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: addSessionHeaders({
          'Content-Type': 'application/json',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const data = await response.json();
      
      // Show token earning popup
      setTokenEarning({
        amount: reward,
        reason: `${brandName} challenge! 🏆`,
      });
      
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/completed'] });
      refetchTokens();
    } catch (error: any) {
      console.error('Failed to complete challenge:', error);
      alert(error.message || 'Failed to complete challenge');
    }
  };

  const defaultCounter: KindnessCounter = {
    id: 'global',
    count: 247891,
    updatedAt: new Date(),
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#8B5CF6',
    color: 'white'
  };

  // Partners tab content
  const renderPartnersTab = () => (
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
        Our Kindness Partners 🤝
      </h2>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#6b7280', 
        marginBottom: '24px',
        fontSize: '14px'
      }}>
        Companies supporting our mission to amplify kindness worldwide
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {challenges.map((challenge) => (
          <div key={challenge.id} style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>
                {challenge.brandLogo}
              </span>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  color: '#1f2937'
                }}>
                  {challenge.brandName}
                </h3>
                <div style={{
                  fontSize: '12px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  Partner Sponsor
                </div>
              </div>
            </div>
            
            <p style={{ 
              color: '#4b5563', 
              fontSize: '14px', 
              lineHeight: '1.5',
              margin: '0 0 12px 0'
            }}>
              Supporting kindness through: <strong>{challenge.category}</strong>
            </p>
            
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <strong>Current Challenge:</strong> {challenge.title}
              <br />
              <strong>Reward:</strong> {challenge.echoReward} $ECHO tokens
              <br />
              <strong>Completions:</strong> {challenge.completionCount} kindness acts inspired
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          Interested in Partnering?
        </h4>
        <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
          Contact us to sponsor kindness challenges and support positive community impact
        </p>
      </div>
    </div>
  );

  // Welcome Page
  if (showWelcome) {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Welcome Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          color: 'white', 
          padding: '40px 20px', 
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px'
          }}>
            ❤️
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>EchoDeed™</h1>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '500', 
            margin: '0 0 30px 0', 
            opacity: 0.95 
          }}>
            Your Kindness, Amplified
          </p>
          
          {/* Global Counter */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '16px', 
            padding: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>
              Global Kindness Counter
            </div>
            <div style={{ 
              fontSize: '42px', 
              fontWeight: 'bold', 
              margin: '8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {(counter || defaultCounter).count.toLocaleString()}
              <span style={{ fontSize: '36px' }}>❤️</span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              acts of kindness shared worldwide
            </div>
          </div>
        </div>

        {/* Mission & Examples */}
        <div style={{ padding: '30px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: '0 0 15px 0',
              color: '#374151'
            }}>
              Inspire Kindness Everywhere
            </h2>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              Share your anonymous acts of kindness and inspire others to spread positivity. 
              Every small gesture creates ripples of goodness across the world.
            </p>
          </div>

          {/* How It Works */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '30px',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 15px 0',
              color: '#374151',
              textAlign: 'center'
            }}>
              How to Amplify Kindness:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#8B5CF6', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>💜</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Purple Heart
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    Tap to show love and appreciation for an act of kindness
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#06B6D4', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>🌊</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Echo Ripple
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    Tap when you're inspired to duplicate this act of kindness
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Posts */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 15px 0',
              color: '#374151'
            }}>
              Recent Acts of Kindness:
            </h3>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #f3f4f6'
            }}>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.5', color: '#374151' }}>
                "Helped an elderly woman carry her groceries up three flights of stairs. Her smile made my whole week brighter."
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                📍 San Francisco, CA • Helping Others
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #f3f4f6'
            }}>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.5', color: '#374151' }}>
                "Left encouraging sticky notes on random cars in the parking lot. Hope it brightens someone's day!"
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                📍 Austin, TX • Spreading Positivity
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowWelcome(false)}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                width: '100%',
                marginBottom: '15px'
              }}
            >
              Start Spreading Kindness ❤️
            </button>
            
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              margin: '0',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Join thousands of people making the world a little brighter, one kind act at a time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show Partners tab if selected
  if (activeTab === 'partners') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                ❤️
              </div>
              <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™</h1>
            </div>
            
            {/* $ECHO Balance */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>🪙</span>
              <span>{tokens?.echoBalance || 0} $ECHO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Your Kindness, Amplified</div>
        </div>

        {renderPartnersTab()}

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '430px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100
        }}>
          {[
            { id: 'feed', label: 'Feed', icon: '🏠' },
            { id: 'local', label: 'Local', icon: '📍' },
            { id: 'spacer', label: '', icon: '' },
            { id: 'partners', label: 'Partners', icon: '🤝' },
            { id: 'impact', label: 'Impact', icon: '📈' },
          ].map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} style={{ width: '32px' }} />;
            }
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Token Earning Popup */}
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
            animation: 'slideIn 0.3s ease-out',
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

  // Main App
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              ❤️
            </div>
            <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™</h1>
          </div>
          
          {/* $ECHO Balance */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '16px' }}>🪙</span>
            <span>{tokens?.echoBalance || 0} $ECHO</span>
          </div>
        </div>
        
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.9 }}>Global Kindness Counter</div>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: '8px 0',
          className: counterPulse ? 'counter-pulse' : ''
        }}>
          {(counter || defaultCounter).count.toLocaleString()} ❤️
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>acts of kindness shared</div>
      </div>
      
      {/* Filter Bar */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <button 
          style={activeFilter === 'global' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('global', {})}
        >
          🌍 Global
        </button>
        <button 
          style={activeFilter === 'helping' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('helping', { category: 'Helping Others' })}
        >
          🤝 Helping Others
        </button>
        <button 
          style={activeFilter === 'community' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('community', { category: 'Community Action' })}
        >
          👥 Community
        </button>
        <button 
          style={activeFilter === 'positivity' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('positivity', { category: 'Spreading Positivity' })}
        >
          😊 Positivity
        </button>
      </div>
      
      {/* Feed */}
      <div style={{ backgroundColor: '#f8f9fa', paddingBottom: '100px' }}>
        
        {/* Brand Challenges Section */}
        {challenges.length > 0 && (
          <div style={{ padding: '16px 16px 0 16px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              🏆 Brand Challenges - Higher Rewards!
            </h3>
            {challenges.slice(0, 2).map((challenge) => { // Show only 2 challenges in feed
              const isCompleted = completedChallenges.includes(challenge.id);
              return (
                <div key={challenge.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #10B981',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Sponsored Label */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}>
                    SPONSORED
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    paddingRight: '80px' // Make room for sponsored label
                  }}>
                    <span style={{ fontSize: '32px', marginRight: '12px' }}>
                      {challenge.brandLogo}
                    </span>
                    <div>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        margin: 0,
                        color: '#1f2937'
                      }}>
                        {challenge.title}
                      </h4>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#10B981', 
                        margin: '2px 0 0 0',
                        fontWeight: '600'
                      }}>
                        by {challenge.brandName}
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: '#4b5563', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {challenge.content}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <span style={{ 
                        backgroundColor: '#fef3c7', 
                        color: '#92400e',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        marginRight: '8px',
                        fontWeight: '500'
                      }}>
                        {challenge.category}
                      </span>
                      <strong>{challenge.echoReward} $ECHO</strong> reward
                    </div>
                    
                    <button
                      onClick={() => handleCompleteChallenge(challenge.id, challenge.brandName, challenge.echoReward)}
                      disabled={isCompleted}
                      style={{
                        backgroundColor: isCompleted ? '#9ca3af' : '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isCompleted ? 'not-allowed' : 'pointer',
                        opacity: isCompleted ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isCompleted ? '✅ Completed' : `Complete (+${challenge.echoReward} $ECHO)`}
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#9ca3af',
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    {challenge.completionCount} people have completed this challenge
                  </div>
                </div>
              );
            })}
            
            {/* View more challenges link */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('partners')}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View All Partner Challenges 🤝
              </button>
            </div>
          </div>
        )}
        
        {postsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div>Loading acts of kindness...</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No acts of kindness found</h3>
            <p>Be the first to share a kind deed in this area!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} style={{ 
              backgroundColor: 'white',
              margin: '1px 0',
              padding: '20px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  ❤️
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    lineHeight: '1.5',
                    color: '#374151'
                  }}>
                    {post.content}
                  </p>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📍 {post.location}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span style={{ 
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {post.category}
                    </span>
                  </div>
                  
                  {/* Interaction Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}>
                    <button
                      onClick={() => handleHeartPost(post.id)}
                      title="Show love for this kindness! (Earn 1 $ECHO 🪙)"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#8B5CF6';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#8B5CF6';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>💜</span>
                      <span>{post.heartsCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleEchoPost(post.id)}
                      title="Echo this kindness! Commit to doing it too! (Earn 2 $ECHO 🪙)"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#06B6D4';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#06B6D4';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>🌊</span>
                      <span>{post.echoesCount || 0} Echo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          backgroundColor: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        +
      </button>
      
      {/* Post Modal */}
      <PostDeedModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        location={location}
      />
      
      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '430px',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        zIndex: 100
      }}>
        {[
          { id: 'feed', label: 'Feed', icon: '🏠' },
          { id: 'local', label: 'Local', icon: '📍' },
          { id: 'spacer', label: '', icon: '' },
          { id: 'partners', label: 'Partners', icon: '🤝' },
          { id: 'impact', label: 'Impact', icon: '📈' },
        ].map((tab) => {
          if (tab.id === 'spacer') {
            return <div key={tab.id} style={{ width: '32px' }} />;
          }
          
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                fontSize: '12px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Token Earning Popup */}
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
          animation: 'slideIn 0.3s ease-out',
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
