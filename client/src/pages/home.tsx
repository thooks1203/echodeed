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
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      
      {/* Simple Header Test */}
      <div style={{ 
        backgroundColor: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', 
        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>EchoDeed™</h1>
        <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
          {defaultCounter.count.toLocaleString()} ❤️
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>acts of kindness shared</div>
      </div>
      
      {/* Test Content */}
      <div style={{ 
        backgroundColor: '#22C55E', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🎉 GREEN BOX - Can you see this clearly?
      </div>
      
      <div style={{ 
        backgroundColor: '#EF4444', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🔴 RED BOX - This should be below the green box
      </div>
      
      <div style={{ 
        backgroundColor: '#3B82F6', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🔵 BLUE BOX - Final visibility test
      </div>
      
      {/* Sample Posts */}
      <div style={{ padding: '20px', backgroundColor: 'white' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Sample Kindness Posts:</h2>
        <div style={{ backgroundColor: '#F3F4F6', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          <p>Helped an elderly woman carry her groceries up three flights of stairs today. Her smile made my whole week brighter.</p>
          <small style={{ color: '#666' }}>San Francisco, CA • 2 hours ago</small>
        </div>
        <div style={{ backgroundColor: '#F3F4F6', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          <p>Left encouraging sticky notes on random cars in the parking lot. Hope it brightens someone's day!</p>
          <small style={{ color: '#666' }}>Austin, TX • 4 hours ago</small>
        </div>
      </div>
      
    </div>
  );
}
