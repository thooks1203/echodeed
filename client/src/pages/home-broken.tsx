import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
// Removed AI dashboard import - focusing on school market
import { NotificationSetupModal } from '@/components/notification-setup-modal';
import { useTabNavigation } from '@/hooks/useNavigation';
import { BackButton } from '@/components/BackButton';
import { SupportCircle } from '@/components/SupportCircle';
const logoUrl = '/electric-heart-logo.png';
import { WelcomeModal } from '@/components/WelcomeModal';
import { MarketingDashboard } from '@/components/MarketingDashboard';
import { SchoolsDashboard } from '@/components/SchoolsDashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { pushNotifications } from '@/services/pushNotifications';
import { KindnessPost, KindnessCounter, UserTokens, BrandChallenge } from '@shared/schema';
import { PostFilters, WebSocketMessage, Achievement, UserAchievement, AchievementNotification, TokenEarning, CorporateDashboardData, CorporateMetric, ChallengeTemplate } from '@/lib/types';
import { getSessionId, addSessionHeaders } from '@/lib/session';

export default function Home() {
  const queryClient = useQueryClient();
  const [pathname, navigate] = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  
  const { activeTab, setActiveTab, canGoBackInTabs, navigateToTab, goBackInTabs } = useTabNavigation('feed');
  
  
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if user has already been to the platform
    const hasSeenWelcome = localStorage.getItem('echodeed_has_seen_welcome');
    const hasUsedPlatform = localStorage.getItem('echodeed_platform_used');
    return !hasSeenWelcome && !hasUsedPlatform;
  });
  
  const [showNotificationSetup, setShowNotificationSetup] = useState(false);
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<AchievementNotification | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const { location } = useGeolocation();

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['feed', 'schools', 'ai', 'marketing'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Remove the tab parameter from URL to keep it clean
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setActiveTab]);

  // Initialize notification setup for new users
  useEffect(() => {
    // Check if notifications should be set up
    const hasSeenNotificationSetup = localStorage.getItem('echodeed_notification_setup_seen');
    if (!hasSeenNotificationSetup && !pushNotifications.isEnabled()) {
      setTimeout(() => {
        console.log('Auto-showing notification setup for new users');
        setShowNotificationSetup(true);
      }, 2000); // Show after 2 seconds for new users
    }
    
    // Remove any lingering modal overlays from DOM (except welcome modal)
    const overlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
    overlays.forEach(overlay => {
      const style = overlay.getAttribute('style') || '';
      if (style.includes('rgba(0,0,0') && !overlay.closest('[data-welcome-modal]')) {
        overlay.remove();
      }
    });
  }, [activeTab]); // Re-run when tab changes

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('echodeed_has_seen_welcome', 'true');
  };

  const showWelcomeAgain = () => {
    setActiveTab('welcome');
  };

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
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache
  });

  // Fetch user tokens
  const { data: tokens, refetch: refetchTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    retry: 2,
  });

  // Fetch brand challenges with fallback sample data
  const { data: fetchedChallenges = [] } = useQuery<BrandChallenge[]>({
    queryKey: ['/api/challenges'],
  });

  // Sample partner companies (always available)
  const samplePartners = [
    { 
      id: 'starbucks', 
      brandName: 'Starbucks', 
      brandLogo: '☕', 
      category: 'Food & Beverage',
      title: 'Morning Kindness Challenge',
      challengeType: 'daily',
      echoReward: 50,
      bonusReward: 25,
      completionCount: 1247,
      content: 'Share a kind moment during your morning coffee routine'
    },
    { 
      id: 'microsoft', 
      brandName: 'Microsoft', 
      brandLogo: '💻', 
      category: 'Technology',
      title: 'Digital Wellness Initiative',
      challengeType: 'weekly',
      echoReward: 100,
      bonusReward: 50,
      completionCount: 892,
      description: 'Promote healthy technology habits in your community'
    },
    { 
      id: 'nike', 
      brandName: 'Nike', 
      brandLogo: '👟', 
      category: 'Health & Fitness',
      title: 'Move Together Campaign',
      challengeType: 'monthly',
      echoReward: 200,
      bonusReward: 100,
      completionCount: 634,
      description: 'Encourage physical activity and wellness in your workplace'
    },
    { 
      id: 'whole-foods', 
      brandName: 'Whole Foods', 
      brandLogo: '🥬', 
      category: 'Food & Wellness',
      title: 'Healthy Choices Challenge',
      challengeType: 'daily',
      echoReward: 75,
      bonusReward: 30,
      completionCount: 1089,
      description: 'Share healthy eating tips and sustainable food choices'
    },
    { 
      id: 'tesla', 
      brandName: 'Tesla', 
      brandLogo: '🚗', 
      category: 'Sustainability',
      title: 'Green Transportation Initiative',
      challengeType: 'weekly',
      echoReward: 150,
      bonusReward: 75,
      completionCount: 456,
      description: 'Promote eco-friendly transportation choices'
    },
    { 
      id: 'patagonia', 
      brandName: 'Patagonia', 
      brandLogo: '🏔️', 
      category: 'Environmental',
      title: 'Outdoor Conservation Challenge',
      challengeType: 'monthly',
      echoReward: 180,
      bonusReward: 90,
      completionCount: 723,
      description: 'Encourage environmental stewardship and outdoor activities'
    }
  ] as BrandChallenge[];

  // Use sample data if no challenges from API
  const challenges = fetchedChallenges.length > 0 ? fetchedChallenges : samplePartners;

  // Fetch completed challenges
  const { data: completedChallenges = [] } = useQuery<string[]>({
    queryKey: ['/api/challenges/completed'],
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  // Fetch user achievements
  const { data: userAchievements = [], refetch: refetchUserAchievements } = useQuery<UserAchievement[]>({
    queryKey: ['/api/achievements/user'],
  });

  // Removed corporate data fetching - focusing on school market

  // Achievement checking helper
  const checkAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: addSessionHeaders()
      });
      
      if (response.ok) {
        const newAchievements = await response.json();
        if (newAchievements && newAchievements.length > 0) {
          // Show first achievement notification
          const firstAchievement = newAchievements[0];
          const achievement = achievements.find(a => a.id === firstAchievement.achievementId);
          if (achievement) {
            setAchievementNotification({
              achievement,
              echoReward: achievement.echoReward
            });
            
            // Send push notification for achievement
            pushNotifications.sendAchievementNotification({
              title: achievement.title,
              description: achievement.description,
              badge: achievement.badge || '',
              echoReward: achievement.echoReward,
              tier: achievement.tier || 'bronze'
            });
            
            // Auto-hide after 4 seconds
            setTimeout(() => setAchievementNotification(null), 4000);
          }
          
          // Refetch user achievements and tokens
          refetchUserAchievements();
          refetchTokens();
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [achievements, refetchUserAchievements, refetchTokens]);

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
    } else if (message.type === 'CHALLENGE_COMPLETED' || message.type === 'ACHIEVEMENTS_UNLOCKED') {
      // Handle challenge completion and achievement notifications
      console.log('🎉 Challenge/Achievement notification:', message);
      refetchTokens();
      checkAchievements();
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
      
      // Send kindness reminder notification occasionally (10% chance)
      if (Math.random() < 0.1) {
        pushNotifications.sendKindnessReminder({
          action: "Show appreciation to a colleague",
          impact: 85,
          timeframe: "next 2 hours"
        });
      }
      
      // Post and tokens will update via WebSocket
      refetchTokens(); // Force refresh tokens
      
      // Check for new achievements
      await checkAchievements();
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
      
      // Check for new achievements
      await checkAchievements();
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
      
      // Check for new achievements
      await checkAchievements();
    } catch (error: any) {
      console.error('Failed to complete challenge:', error);
      alert(error.message || 'Failed to complete challenge');
    }
  };

  const defaultCounter: KindnessCounter = {
    id: 'global',
    count: 243876,
    updatedAt: new Date()
  };

  // Welcome Page - Check at the very beginning
  if (showWelcome) {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#0f0f23',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 20%, #0f3460 40%, #533483 60%, #7209b7 80%, #2d1b69 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite'
        }} />
        
        {/* Floating Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(139,92,246,0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(6,182,212,0.4), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(16,185,129,0.4), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(245,158,11,0.3), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'sparkle 6s linear infinite'
        }} />

        {/* Welcome Header */}
        <div style={{ 
          position: 'relative',
          zIndex: 2,
          color: 'white', 
          padding: '60px 20px 40px', 
          textAlign: 'center'
        }}>
          {/* Floating Logo */}
          <img 
            src={logoUrl} 
            alt="EchoDeed Logo"
            style={{ 
              width: '480px',
              height: '480px',
              margin: '0 auto 20px',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
              animation: 'logoFloat 3s ease-in-out infinite',
              borderRadius: '0',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }}
          />
          
          {/* Brand Name */}
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '42px', 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'titleShimmer 4s ease-in-out infinite',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em',
            textShadow: '0 0 30px rgba(139,92,246,0.3)'
          }}>
            EchoDeed™
          </h1>
          
          {/* Tagline */}
          <p style={{ 
            fontSize: '22px', 
            fontWeight: '600', 
            margin: '0 0 24px 0', 
            background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.01em',
            textShadow: '0 2px 20px rgba(255,255,255,0.1)'
          }}>
            Your Kindness, Amplified ✨
          </p>
          
          {/* Intro About EchoDeed */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'left',
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <p style={{ margin: '0 0 12px 0' }}>
              💝 <strong>Share your kindness anonymously</strong> - no profiles, just pure positivity
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              🌟 <strong>Join a global movement</strong> of people spreading joy and compassion
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              🎁 <strong>Collect $ECHO tokens</strong> and redeem real rewards for being kind
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><div style={{ width: '16px', height: '16px', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='heart-grad-heart' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6633'/%3E%3Cstop offset='25%25' style='stop-color:%23ff33ff'/%3E%3Cstop offset='75%25' style='stop-color:%23a855f7'/%3E%3Cstop offset='100%25' style='stop-color:%233b82f6'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d='M100,30 C85,10 60,10 60,40 C60,70 100,100 100,100 S140,70 140,40 C140,10 115,10 100,30 Z' fill='url(%23heart-grad-heart)'/%3E%3C/svg%3E")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div> <strong>Heart = "I like this"</strong></span> • 🔁 <strong>Echo = "I'll do this too"</strong>
            </p>
            <p style={{ margin: '0' }}>
              ✨ <strong>For everyone:</strong> individuals seeking connection & teams building wellness
            </p>
          </div>
          
          {/* Global Counter */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', 
            borderRadius: '20px', 
            padding: '24px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            animation: counterPulse ? 'counterPulse 0.6s ease-in-out' : 'none'
          }}>
            <div style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              opacity: 0.9,
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              🌍 Acts of Kindness Shared Globally
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '900', 
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

        {/* Start Button */}
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <button 
            onClick={() => {
              setShowWelcome(false);
              localStorage.setItem('echodeed_platform_used', 'true');
              localStorage.setItem('echodeed_has_seen_welcome', 'true');
            }}
            style={{
              background: 'linear-gradient(135deg, hsl(30, 100%, 60%), hsl(320, 100%, 65%), hsl(280, 100%, 65%), hsl(200, 100%, 60%))',
              backgroundSize: '200% 200%',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,102,51,0.4), 0 0 40px rgba(255,51,255,0.3)',
              animation: 'titleShimmer 3s ease-in-out infinite',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              width: '280px',
              maxWidth: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,51,255,0.6), 0 0 60px rgba(51,153,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,102,51,0.4), 0 0 40px rgba(255,51,255,0.3)';
            }}
          >
            TAP HERE to start spreading kindness
          </button>
          
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '16px',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            Join 250,000+ people spreading kindness worldwide 🌍✨
          </p>
        </div>
      </div>
    );
  }

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

  // Helper function to get tier colors and styling
  const getTierStyling = (tier: string, isUnlocked: boolean) => {
    const baseStyle = {
      opacity: isUnlocked ? 1 : 0.4,
      filter: isUnlocked ? 'none' : 'grayscale(50%)'
    };
    
    switch (tier) {
      case 'bronze':
        return { ...baseStyle, backgroundColor: '#F59E0B', color: 'white' };
      case 'silver':
        return { ...baseStyle, backgroundColor: '#6B7280', color: 'white' };
      case 'gold':
        return { ...baseStyle, backgroundColor: '#EAB308', color: 'white' };
      case 'diamond':
        return { ...baseStyle, backgroundColor: '#06B6D4', color: 'white' };
      case 'legendary':
        return { ...baseStyle, backgroundColor: '#8B5CF6', color: 'white' };
      default:
        return baseStyle;
    }
  };

  // Show Support tab if selected
  if (activeTab === 'support') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <SupportCircle onBack={() => setActiveTab('feed')} />
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }

  // Show Rewards tab if selected
  if (activeTab === 'rewards') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <AppHeader 
          counter={counter || { count: 0, id: 'global', updatedAt: new Date() }} 
          isPulse={counterPulse}
          onBack={canGoBackInTabs ? goBackInTabs : undefined}
          showBackButton={canGoBackInTabs}
        />
        
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
          
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            Redeem your $ECHO tokens for real rewards from our partner companies
          </p>

          {/* Sample Rewards */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              Available Rewards
            </h3>
            
            {[
              { name: 'Starbucks Coffee', cost: '500 $ECHO', icon: '☕', company: 'Starbucks', description: '$5 gift card for your favorite drink' },
              { name: 'Amazon Gift Card', cost: '1000 $ECHO', icon: '🛒', company: 'Amazon', description: '$10 gift card for anything you need' },
              { name: 'Netflix Subscription', cost: '1500 $ECHO', icon: '🎬', company: 'Netflix', description: '1 month free streaming' },
              { name: 'Charity Donation', cost: '750 $ECHO', icon: '💝', company: 'Various', description: '$7.50 donated to charity of your choice' },
              { name: 'Local Restaurant', cost: '800 $ECHO', icon: '🍕', company: 'Local Partners', description: '$8 voucher for local dining' },
              { name: 'Fitness Class', cost: '600 $ECHO', icon: '🧘', company: 'Wellness Partners', description: 'Free yoga or fitness class' }
            ].map((reward, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px'
                }}>
                  {reward.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                    {reward.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                    {reward.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: '#8B5CF6',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}>
                      {reward.company}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                      {reward.cost}
                    </span>
                  </div>
                </div>
                <button style={{
                  backgroundColor: (tokens?.echoBalance || 0) >= parseInt(reward.cost) ? '#10B981' : '#e5e7eb',
                  color: (tokens?.echoBalance || 0) >= parseInt(reward.cost) ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: (tokens?.echoBalance || 0) >= parseInt(reward.cost) ? 'pointer' : 'not-allowed'
                }}>
                  {(tokens?.echoBalance || 0) >= parseInt(reward.cost) ? 'Redeem' : 'Need More'}
                </button>
              </div>
            ))}
          </div>

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
                      display: 'inline-block'
                    }}>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }

  // Default feed view
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AppHeader counter={counter || { count: 0 }} isPulse={counterPulse} />
      <FilterBar 
        activeFilter={activeFilter} 
        location={location}
        onFilterChange={(filter: string, filters: any) => {
          setActiveFilter(filter);
          setFilters(filters);
        }}
      />
      <KindnessFeed 
        posts={posts} 
        isLoading={postsLoading} 
      />
      <FloatingActionButton onClick={() => setIsPostModalOpen(true)} />
      <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      
      {/* Modals */}
      <PostDeedModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onPostSuccess={handlePostSuccess}
      />
      
      <NotificationSetupModal 
        isOpen={showNotificationSetup}
        onClose={() => {
          setShowNotificationSetup(false);
          localStorage.setItem('echodeed_notification_setup_seen', 'true');
        }}
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
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>🪙</span>
          <div>
            <div>+{tokenEarning?.amount} $ECHO</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{tokenEarning?.reason}</div>
          </div>
        </div>
      )}
    </div>
  );
}
