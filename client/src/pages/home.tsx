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
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens } from '@shared/schema';
import { PostFilters, WebSocketMessage, TokenEarning } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { canAccessSchoolsDashboard } from '@/lib/roleUtils';
import { StudentDashboard } from '@/components/StudentDashboard';
import { MentorDashboard } from '@/pages/MentorDashboard';

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
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
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
  const { toast } = useToast();
  
  const { location } = useGeolocation();

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['feed', 'schools', 'support', 'summer', 'rewards', 'mentor-dashboard', 'student-dashboard'].includes(tabParam)) {
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
    // For demo purposes, always go to student dashboard for better flow
    // Students should see their dashboard when hitting back
    if (isStudent) {
      setActiveTab('student-dashboard');
    } else if (isTeacher || isAdmin) {
      setActiveTab('schools');
    } else {
      // Default fallback to student dashboard for demo
      setActiveTab('student-dashboard');
    }
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Show different content based on active tab
  if (activeTab === 'schools') {
    // Only teachers and admins can access Schools Dashboard
    if (!canAccessSchoolsDashboard(user.schoolRole)) {
      setTimeout(() => setActiveTab('student-dashboard'), 0);
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#F9FAFB'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#DC2626' }}>
              Access Restricted
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Students cannot access the Schools Dashboard. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <SchoolsDashboard 
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

  if (activeTab === 'mentor-dashboard') {
    return (
      <MentorDashboard />
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