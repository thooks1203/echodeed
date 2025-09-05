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
  const defaultCounter: KindnessCounter = {
    id: 'global',
    count: 247891,
    updatedAt: new Date(),
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <AppHeader 
        counter={defaultCounter} 
        isPulse={false}
      />
      
      <div style={{ backgroundColor: 'red', padding: '20px', margin: '20px' }}>
        <h2 style={{ color: 'white', fontSize: '18px' }}>DEBUG: This should show below the header</h2>
      </div>
      
      <div style={{ backgroundColor: 'blue', padding: '20px', margin: '20px' }}>
        <h2 style={{ color: 'white', fontSize: '18px' }}>DEBUG: This is a simple div test</h2>
      </div>
    </div>
  );
}
