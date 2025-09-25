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
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens } from '@shared/schema';
import { PostFilters, WebSocketMessage, TokenEarning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { canAccessSchoolsDashboard } from '@/lib/roleUtils';
import { StudentDashboard } from '@/components/StudentDashboard';
import MentorDashboard from '@/pages/MentorDashboard';
import { SupportCircle } from '@/components/SupportCircle';
import RewardsPage from '@/pages/rewards';
import { SummerChallenges } from '@/components/SummerChallenges';
import { SponsorsPage } from '@/components/SponsorsPage';
import { CommunityService } from '@/components/CommunityService';
import { useKindnessSparks } from '@/components/KindnessSparks';

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
  const { user, isStudent, isTeacher, isAdmin, isAuthenticated } = useAuth();
  const { triggerSparks, KindnessSparksComponent } = useKindnessSparks();

  // Remove auto-authentication check that was causing issues
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  const { toast } = useToast();
  
  const { location } = useGeolocation();

  // Handle URL parameters for tab navigation and role-based defaults
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && ['feed', 'schools', 'support', 'summer', 'community-service', 'rewards', 'mentor-dashboard', 'student-dashboard'].includes(tabParam)) {
      setActiveTab(tabParam);
      // Remove the tab parameter from URL to keep it clean
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Set default tab based on role if no URL param
      if (user?.schoolRole === 'admin') {
        setActiveTab('schools'); // Only admins see district data
      } else if (user?.schoolRole === 'teacher') {
        setActiveTab('teacher-dashboard'); // Teachers get their own dashboard
      } else if (user?.schoolRole === 'student') {
        setActiveTab('feed');
      } else if (user?.schoolRole === 'parent') {
        // Redirect parents to their dedicated dashboard
        window.location.href = '/parent';
        return;
      } else {
        // Default to feed for all users (including when user is loading)
        setActiveTab('feed');
      }
    }
  }, [user, navigate]);

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
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      
      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();
      return data;
    },
    enabled: true, // Force query to always run
    staleTime: 0, // Always refetch
    refetchOnMount: true
  });


  const { data: counter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
    queryFn: () => fetch('/api/counter').then(r => r.json()),
    enabled: true,
    staleTime: 0,
    refetchOnMount: true
  });

  const { data: tokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    queryFn: () => fetch('/api/tokens').then(r => r.json())
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
    return (
      <MentorDashboard />
    );
  }

  if (activeTab === 'support') {
    return (
      <SupportCircle onBack={handleBackToDashboard} />
    );
  }

  if (activeTab === 'summer') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF' }}>
        <SummerChallenges onBack={handleBackToDashboard} />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'community-service') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF' }}>
        <CommunityService onBack={handleBackToDashboard} />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'sponsors') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <SponsorsPage />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'rewards') {
    return (
      <RewardsPage onBack={handleBackToDashboard} />
    );
  }

  if (activeTab === 'sign-in') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F9FF', paddingBottom: '100px' }}>
        <AppHeader 
          counter={counter || { id: 'global', count: 0, updatedAt: new Date() }} 
          isPulse={counterPulse} 
          showBackButton={false}
          tokens={tokens}
        />
        <div className="p-6 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-blue-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">👤 Who Are You?</h2>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-6 border-2 border-green-300">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-2">🎉 You're signed in as:</div>
                <div className="text-xl font-black text-blue-600">{user?.name || 'User'}</div>
                <div className="text-sm text-gray-600 mt-1">{user?.email || 'No email'}</div>
                <div className="inline-block px-3 py-1 mt-2 text-sm font-bold bg-blue-200 text-blue-800 rounded-full">
                  {user?.schoolRole?.toUpperCase() || 'STUDENT'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-700 text-center mb-3">Want to try someone else? Click below!</div>
              {[
                { role: 'student', name: 'Sarah Chen', desc: '7th Grade Student', emoji: '👩‍🎓' },
                { role: 'teacher', name: 'Ms. Wilson', desc: 'Math Teacher', emoji: '👩‍🏫' },
                { role: 'admin', name: 'Dr. Brown', desc: 'Principal', emoji: '👨‍💼' },
                { role: 'parent', name: 'Mrs. Johnson', desc: 'Parent', emoji: '👩‍👧' }
              ].map((roleInfo) => (
                <button
                  key={roleInfo.role}
                  onClick={() => {
                    localStorage.setItem('echodeed_demo_role', roleInfo.role);
                    window.location.reload();
                  }}
                  className={`w-full p-4 text-left rounded-lg border-3 transition-all hover:scale-105 ${
                    user?.schoolRole === roleInfo.role 
                      ? 'bg-yellow-100 border-yellow-400 shadow-lg' 
                      : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                  data-testid={`sign-in-as-${roleInfo.role}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{roleInfo.emoji}</span>
                    <div>
                      <div className="font-bold text-gray-800">{roleInfo.name}</div>
                      <div className="text-sm text-gray-600">{roleInfo.desc}</div>
                    </div>
                    {user?.schoolRole === roleInfo.role && (
                      <div className="ml-auto text-green-600 font-bold">✓ Current</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-center text-sm text-blue-800">
                <div className="font-bold">🏫 Burlington Christian Academy</div>
                <div>Character Education Demo</div>
              </div>
            </div>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }
  
  if (activeTab === 'schools') {
    // Only admins can access district-wide Schools Dashboard
    if (user?.schoolRole !== 'admin') {
      return null; // useEffect will redirect to feed
    }
    
    return (
      <SchoolsDashboard 
        onNavigateToTab={navigateToTab} 
        activeBottomTab={activeTab}
      />
    );
  }
  
  if (activeTab === 'teacher-dashboard') {
    // Only teachers can access teacher dashboard
    if (user?.schoolRole !== 'teacher') {
      return null; // useEffect will redirect to feed
    }
    
    return (
      <TeacherDashboard 
        onNavigateToTab={navigateToTab} 
        activeBottomTab={activeTab}
      />
    );
  }
  
  if (activeTab === 'student-dashboard') {
    return (
      <StudentDashboard 
        onNavigateToTab={navigateToTab} 
        activeBottomTab={activeTab}
      />
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
        tokens={tokens}
      />
      
      
      <div style={{ paddingBottom: '140px' }}>
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
        onPostSuccess={triggerSparks}
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
      
      {/* Kindness Sparks Animation */}
      <KindnessSparksComponent />
    </div>
  );
}