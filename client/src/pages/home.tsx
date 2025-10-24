import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Heart, Zap } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { LeftSidebar } from '@/components/LeftSidebar';
import { WelcomeModal } from '@/components/WelcomeModal';
import { SchoolsDashboard } from '@/components/SchoolsDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens } from '@shared/schema';
import { PostFilters, WebSocketMessage, TokenEarning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { addSessionHeaders } from '@/lib/session';
import { canAccessSchoolsDashboard } from '@/lib/roleUtils';
import { StudentDashboard } from '@/components/StudentDashboard';
import MentorDashboard from '@/pages/MentorDashboard';
import { SupportCircle } from '@/components/SupportCircle';
import RewardsPage from '@/pages/rewards';
import { SummerChallenges } from '@/components/SummerChallenges';
import { SponsorsPage } from '@/components/SponsorsPage';
import { CommunityService } from '@/components/CommunityService';
import { useKindnessSparksContext } from '@/contexts/KindnessSparksContext';
import ParentDashboard from '@/pages/ParentDashboard';
import FamilyDashboard from '@/pages/FamilyDashboard';
import { KindnessConnectModal } from '@/components/KindnessConnectModal';

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
  const { user, isStudent, isTeacher, isAdmin, isParent, isAuthenticated } = useAuth();
  const { triggerSparks } = useKindnessSparksContext();

  // Remove auto-authentication check that was causing issues
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  const [isKindnessConnectOpen, setIsKindnessConnectOpen] = useState(false);
  const { toast } = useToast();
  
  const { location } = useGeolocation();

  // Handle URL parameters for tab navigation and role-based defaults
  useEffect(() => {
    // If user is not authenticated, redirect to demo login page
    if (!isAuthenticated) {
      navigate('/demo-login');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && ['feed', 'schools', 'support', 'summer', 'community-service', 'rewards', 'mentor-dashboard', 'student-dashboard', 'teacher-dashboard', 'parent-dashboard', 'family-dashboard', 'sponsors', 'reports'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Remove the tab parameter from URL to keep it clean
      window.history.replaceState({}, '', window.location.pathname);
    } else if (activeTab === 'sign-in') {
      // Only set default tab if coming from sign-in, don't override user navigation
      if (isTeacher) {
        setActiveTab('teacher-dashboard');
      } else if (isAdmin) {
        setActiveTab('schools');
      } else if (isParent) {
        setActiveTab('parent-dashboard'); // CRITICAL FIX: Route parents to parent dashboard
      } else {
        setActiveTab('feed'); // Default for students
      }
    }
  }, [isAuthenticated]); // Only depend on authentication status

  // Guard against unauthorized access to schools dashboard
  useEffect(() => {
    const role = user?.schoolRole || 'student';
    if (activeTab === 'schools' && !canAccessSchoolsDashboard(role)) {
      setActiveTab('feed');
    }
  }, [activeTab, user?.schoolRole]);

  // Fetch data - with console debugging
  const { data: posts = [], isLoading: postsLoading, error, status } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async ({ queryKey }) => {
      console.log('🔍 FETCHING POSTS - activeTab:', activeTab, 'filters:', filters);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      
      // Use queryKey but append query params
      const url = params.toString() ? `${queryKey[0]}?${params}` : queryKey[0] as string;
      console.log('🌐 POSTS URL:', url);
      const response = await fetch(url, {
        headers: { 
          'X-Session-ID': localStorage.getItem('echodeed_session') || 'demo-session',
          'X-Demo-Role': localStorage.getItem('echodeed_demo_role') || ''
        },
        credentials: 'include'
      });
      const data = await response.json();
      console.log('✅ POSTS RECEIVED:', data?.length || 0, 'posts');
      return data;
    },
    enabled: true, // Always fetch posts
    staleTime: 0, // Always refetch
    refetchOnMount: true
  });


  const { data: counter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
    enabled: true,
    staleTime: 0,
    refetchOnMount: true
  });

  const { data: tokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    queryFn: async () => {
      const response = await fetch('/api/tokens', {
        headers: addSessionHeaders(),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return response.json();
    }
  });

  // WebSocket temporarily disabled for debugging
  // useWebSocket((message: WebSocketMessage) => {
  //   if (message.type === 'NEW_POST') {
  //     queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  //     queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
  //     setCounterPulse(true);
  //     setTimeout(() => setCounterPulse(false), 1000);
  //   } else if (message.type === 'COUNTER_UPDATE') {
  //     queryClient.invalidateQueries({ queryKey: ['/api/counter'] });
  //     setCounterPulse(true);
  //     setTimeout(() => setCounterPulse(false), 1000);
  //   }
  // });

  const handleFilterChange = useCallback((filter: string, newFilters: PostFilters) => {
    setActiveFilter(filter);
    setFilters(newFilters);
  }, []);

  const handlePostSuccess = useCallback(() => {
    console.log('🎆 POST SUCCESS - Triggering kindness sparks!');
    triggerSparks(); // TRIGGER THE BEAUTIFUL SPARKS!
    
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
  }, [toast, triggerSparks]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('echodeed_has_seen_welcome', 'true');
  };

  const handleBackToDashboard = () => {
    // Role-based dashboard routing
    if (isStudent) {
      setActiveTab('student-dashboard');
    } else if (isTeacher) {
      setActiveTab('teacher-dashboard'); // Teachers get their own dashboard
    } else if (isAdmin) {
      setActiveTab('schools'); // Only admins see district-wide data
    } else {
      // Default fallback to student dashboard for demo
      setActiveTab('student-dashboard');
    }
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Show different content based on active tab
  
  
  if (activeTab === 'mentor-dashboard') {
    try {
      return (
        <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
          <MentorDashboard />
          <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        </div>
      );
    } catch (error) {
      console.error('❌ MentorDashboard error:', error);
      return (
        <div style={{ minHeight: '100vh', background: '#F0F9FF', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>🌟 Mentor Dashboard</h1>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>Loading mentor features...</p>
            <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
              <p style={{ color: '#0066cc', margin: 0 }}>🚀 Please refresh the page if this persists</p>
            </div>
          </div>
          <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        </div>
      );
    }
  }

  if (activeTab === 'support') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <SupportCircle onBack={handleBackToDashboard} />
        <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }

  if (activeTab === 'summer') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <SummerChallenges onBack={handleBackToDashboard} />
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'community-service') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <CommunityService onBack={handleBackToDashboard} />
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Kindness Connect FAB - REMOVED: Community Service has its own UI */}
        {false && <div
          onClick={() => setIsKindnessConnectOpen(true)}
          data-testid="button-kindness-connect-fab"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            cursor: 'pointer',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              border: '3px solid white',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: 'pulse-kindness 2s infinite'
            }}
          >
            <span style={{ fontSize: '32px' }}>💝</span>
          </button>
          <div
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap',
              border: '2px solid white'
            }}
          >
            Kindness Connect
          </div>
        </div>}
      </div>
    );
  }

  if (activeTab === 'sponsors') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', marginLeft: '80px' }}>
        <SponsorsPage />
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'rewards') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <RewardsPage onBack={handleBackToDashboard} />
        <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        
        {/* Kindness Connect FAB - REMOVED: Not relevant on Rewards page */}
        {false && <div
          onClick={() => setIsKindnessConnectOpen(true)}
          data-testid="button-kindness-connect-fab"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            cursor: 'pointer',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              border: '3px solid white',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: 'pulse-kindness 2s infinite'
            }}
          >
            <span style={{ fontSize: '32px' }}>💝</span>
          </button>
          <div
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap',
              border: '2px solid white'
            }}
          >
            Kindness Connect
          </div>
        </div>}
      </div>
    );
  }

  if (activeTab === 'schools') {
    // Only admins can access district-wide Schools Dashboard
    if (user?.schoolRole !== 'admin') {
      return null; // useEffect will redirect to feed
    }
    
    // SchoolsDashboard handles its own BottomNavigation and Kindness Connect FAB
    return (
      <SchoolsDashboard 
        onNavigateToTab={navigateToTab} 
        activeBottomTab={activeTab}
      />
    );
  }
  
  if (activeTab === 'teacher-dashboard') {
    // Only teachers can access teacher dashboard - show feed/overview
    if (user?.schoolRole !== 'teacher') {
      return null; // useEffect will redirect to feed
    }
    
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <TeacherDashboard />
        <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        
        {/* Kindness Connect FAB - REMOVED: Teachers don't need this on their dashboard */}
        {false && <div
          onClick={() => setIsKindnessConnectOpen(true)}
          data-testid="button-kindness-connect-fab"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            cursor: 'pointer',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              border: '3px solid white',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: 'pulse-kindness 2s infinite'
            }}
          >
            <span style={{ fontSize: '32px' }}>💝</span>
          </button>
          <div
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap',
              border: '2px solid white'
            }}
          >
            Kindness Connect
          </div>
        </div>}
      </div>
    );
  }
  
  if (activeTab === 'reports') {
    // Only teachers can access reports - show aggregate reports tab
    if (user?.schoolRole !== 'teacher') {
      return null; // useEffect will redirect to feed
    }
    
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <TeacherDashboard />
        <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        
        {/* Kindness Connect FAB - REMOVED: Teachers don't need this on their dashboard */}
        {false && <div
          onClick={() => setIsKindnessConnectOpen(true)}
          data-testid="button-kindness-connect-fab"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            cursor: 'pointer',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              border: '3px solid white',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: 'pulse-kindness 2s infinite'
            }}
          >
            <span style={{ fontSize: '32px' }}>💝</span>
          </button>
          <div
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              whiteSpace: 'nowrap',
              border: '2px solid white'
            }}
          >
            Kindness Connect
          </div>
        </div>}
      </div>
    );
  }
  
  if (activeTab === 'student-dashboard') {
    try {
      return (
        <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
          <StudentDashboard 
            onNavigateToTab={navigateToTab} 
            activeBottomTab={activeTab}
          />
          <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
          
          {/* Kindness Connect FAB */}
          <div
            onClick={() => setIsKindnessConnectOpen(true)}
            data-testid="button-kindness-connect-fab"
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '16px',
              cursor: 'pointer',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <button
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                border: '3px solid white',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                animation: 'pulse-kindness 2s infinite'
              }}
            >
              <span style={{ fontSize: '32px' }}>💝</span>
            </button>
            <div
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                whiteSpace: 'nowrap',
                border: '2px solid white'
              }}
            >
              Kindness Connect
            </div>
          </div>
          
          <style>{`
            @keyframes pulse-kindness {
              0%, 100% {
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7);
              }
              50% {
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 10px rgba(239, 68, 68, 0);
              }
            }
          `}</style>
          
          <KindnessConnectModal 
            isOpen={isKindnessConnectOpen}
            onClose={() => setIsKindnessConnectOpen(false)}
          />
        </div>
      );
    } catch (error) {
      console.error('❌ StudentDashboard error:', error);
      return (
        <div style={{ minHeight: '100vh', background: '#F0F9FF', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>👨‍🎓 Emma's Dashboard</h1>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>🏥 Community Service Progress</h2>
            <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32', margin: '0 0 10px 0' }}>7.5 Hours Completed</p>
              <p style={{ color: '#4caf50', margin: 0 }}>✅ Great progress, Emma! Keep up the excellent work!</p>
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>🔥 Kindness Streak</h2>
            <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f57c00', margin: '0 0 10px 0' }}>4-Day Streak!</p>
              <p style={{ color: '#ff9800', margin: 0 }}>🌟 You're building an amazing habit of kindness!</p>
            </div>
          </div>
          <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
        </div>
      );
    }
  }
  
  if (activeTab === 'parent-dashboard') {
    // Only parents can access parent dashboard
    if (user?.schoolRole !== 'parent') {
      return null; // useEffect will redirect to feed
    }
    
    return (
      <ParentDashboard />
    );
  }
  
  if (activeTab === 'family-dashboard') {
    // Family dashboard accessible to parents and family members
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', marginLeft: '80px' }}>
        <FamilyDashboard />
        <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
      </div>
    );
  }


  // Default: Show main feed
  console.log('🎯 RENDERING MAIN FEED - activeTab:', activeTab, 'posts:', posts?.length, 'postsLoading:', postsLoading);
  
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      marginLeft: '80px', // Account for left sidebar
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AppHeader 
        counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} 
        isPulse={counterPulse} 
        showBackButton={true}
        onBack={handleBackToDashboard}
        tokens={tokens}
      />
      
      
      <div style={{ paddingBottom: '140px' }}>
        <FilterBar 
          activeFilter={activeFilter} 
          location={location}
          onFilterChange={handleFilterChange}
        />
        
        {/* Share Kindness Button - Enhanced to stand out more */}
        <div className="px-4 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 border-b border-border relative overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 animate-pulse opacity-75 z-0"></div>
          
          {/* Animated Corner Sparkles - z-20 to appear on top */}
          <div className="absolute -top-1 -left-1 text-3xl animate-ping z-20" style={{ animationDuration: '1.5s' }}>✨</div>
          <div className="absolute -top-1 -right-1 text-3xl animate-ping z-20" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}>💫</div>
          <div className="absolute -bottom-1 -left-1 text-3xl animate-ping z-20" style={{ animationDuration: '2s', animationDelay: '0.6s' }}>⭐</div>
          <div className="absolute -bottom-1 -right-1 text-3xl animate-ping z-20" style={{ animationDuration: '1.6s', animationDelay: '0.9s' }}>✨</div>
          
          {/* Rotating Burst Effects at Corners - z-20 to appear on top */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full opacity-60 animate-pulse z-20" style={{ animationDuration: '2s' }}></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-400 rounded-full opacity-60 animate-pulse z-20" style={{ animationDuration: '2.2s', animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-400 rounded-full opacity-60 animate-pulse z-20" style={{ animationDuration: '1.8s', animationDelay: '1s' }}></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 rounded-full opacity-60 animate-pulse z-20" style={{ animationDuration: '2.4s', animationDelay: '1.5s' }}></div>
          
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="relative w-full bg-gradient-to-r from-white to-yellow-50 text-purple-700 py-6 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-4 border-4 border-white/50 z-10"
            data-testid="button-share-kindness"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fde68a 100%)',
              boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4), 0 8px 16px rgba(236, 72, 153, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-4">
                <span className="text-3xl animate-bounce">🌟</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-black tracking-wide">
                  SHARE YOUR KINDNESS
                </span>
                <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
              </div>
              <span className="text-sm font-semibold text-purple-600/80 tracking-wide">
                Click here to post your act of kindness!
              </span>
            </div>
          </button>
        </div>

        {/* Visual Icon Legend - Always visible guide */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-y border-purple-200/50">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-sm font-semibold text-gray-700">Love it!</span>
            </div>
            <div className="w-px h-6 bg-purple-300"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
              <span className="text-sm font-semibold text-gray-700">I'll do this too!</span>
            </div>
          </div>
        </div>
        
        <KindnessFeed 
          posts={posts} 
          isLoading={postsLoading} 
        />
      </div>
      
      <LeftSidebar activeTab={activeTab} onTabChange={navigateToTab} />
      
      {/* Modals */}
      <PostDeedModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        location={location}
        onPostSuccess={handlePostSuccess}
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
      
      {/* Kindness Sparks Animation - Now mounted globally at App root */}
      
      {/* Kindness Connect Floating Action Button - Visible to all authenticated users */}
      {isAuthenticated && (
        <>
          <div
            onClick={() => setIsKindnessConnectOpen(true)}
            data-testid="button-kindness-connect-fab"
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '16px',
              cursor: 'pointer',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <button
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                border: '3px solid white',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                animation: 'pulse-kindness 2s infinite'
              }}
            >
              <span style={{ fontSize: '32px' }}>💝</span>
            </button>
            <div
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                whiteSpace: 'nowrap',
                border: '2px solid white'
              }}
            >
              Kindness Connect
            </div>
          </div>
          
          <style>{`
            @keyframes pulse-kindness {
              0%, 100% {
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7);
              }
              50% {
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 10px rgba(239, 68, 68, 0);
              }
            }
          `}</style>
          
          <KindnessConnectModal 
            isOpen={isKindnessConnectOpen}
            onClose={() => setIsKindnessConnectOpen(false)}
          />
        </>
      )}
    </div>
  );
}