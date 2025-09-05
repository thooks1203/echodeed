import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter } from '@shared/schema';
import { PostFilters, WebSocketMessage } from '@/lib/types';

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);

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
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Fetch counter
  const { data: counter, refetch: refetchCounter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
  });

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'NEW_POST') {
      refetchPosts();
    } else if (message.type === 'COUNTER_UPDATE') {
      refetchCounter();
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 600);
    }
  }, [refetchPosts, refetchCounter]);

  // Initialize WebSocket
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const handleFilterChange = (filter: string, newFilters: PostFilters) => {
    setActiveFilter(filter);
    setFilters(newFilters);
  };

  const defaultCounter: KindnessCounter = {
    id: 'global',
    count: 247891,
    updatedAt: new Date(),
  };

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', backgroundColor: '#f8f9fa' }}>
      <OnboardingOverlay onComplete={() => {}} />
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
        <AppHeader 
          counter={counter || defaultCounter} 
          isPulse={counterPulse}
        />
      </div>
      
      {/* Visible Test */}
      <div style={{ 
        backgroundColor: '#dc2626', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        position: 'relative',
        zIndex: 1
      }}>
        ✅ SUCCESS! You should see this red box clearly below the counter
      </div>
      
      {/* Filter Bar */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <FilterBar 
          activeFilter={activeFilter}
          location={location}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      {/* Feed */}
      <div style={{ backgroundColor: '#f8f9fa' }}>
        <KindnessFeed 
          posts={posts}
          isLoading={postsLoading}
        />
      </div>
      
      {/* Modals and UI */}
      <PostDeedModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        location={location}
      />
      
      <FloatingActionButton 
        onClick={() => setIsPostModalOpen(true)}
      />
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
