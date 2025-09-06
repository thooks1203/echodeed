import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflinePost {
  id: string;
  text: string;
  category: string;
  location?: string;
  timestamp: number;
}

export default function OfflineDataHandler() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check for offline data on load
    checkOfflineData();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOfflineData = () => {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline-kindness') || '[]');
      setPendingSyncCount(offlineData.length);
      
      if (offlineData.length > 0 && isOnline) {
        syncOfflineData();
      }
    } catch (error) {
      console.error('Error checking offline data:', error);
    }
  };

  const syncOfflineData = async () => {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline-kindness') || '[]');
      
      if (offlineData.length === 0) return;

      let successCount = 0;
      
      for (const post of offlineData) {
        try {
          const response = await fetch('/api/kindness', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: post.text,
              category: post.category,
              location: post.location
            })
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error('Failed to sync post:', error);
        }
      }

      if (successCount > 0) {
        // Remove successfully synced posts
        const remainingData = offlineData.slice(successCount);
        localStorage.setItem('offline-kindness', JSON.stringify(remainingData));
        setPendingSyncCount(remainingData.length);

        toast({
          title: "🎉 Data Synced!",
          description: `${successCount} kindness posts have been synced successfully!`,
        });

        // Trigger a refresh of the kindness feed
        window.dispatchEvent(new CustomEvent('kindness-synced'));
      }

    } catch (error) {
      console.error('Failed to sync offline data:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync offline data. Will retry when connection improves.",
        variant: "destructive",
      });
    }
  };

  // Provide global function to save data offline
  useEffect(() => {
    (window as any).saveOfflineKindness = (postData: Omit<OfflinePost, 'id' | 'timestamp'>) => {
      try {
        const offlineData = JSON.parse(localStorage.getItem('offline-kindness') || '[]');
        const newPost: OfflinePost = {
          ...postData,
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        
        offlineData.push(newPost);
        localStorage.setItem('offline-kindness', JSON.stringify(offlineData));
        setPendingSyncCount(offlineData.length);
        
        toast({
          title: "📱 Saved Offline",
          description: "Your kindness will be shared when you're back online!",
        });
        
        // Register for background sync if available
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(registration => {
            return registration.sync.register('kindness-sync');
          });
        }
        
        return true;
      } catch (error) {
        console.error('Failed to save offline data:', error);
        return false;
      }
    };

    // Cleanup
    return () => {
      delete (window as any).saveOfflineKindness;
    };
  }, [toast]);

  // Don't render anything visible - this is a utility component
  return null;
}

// Utility function to check if we're offline
export const useOfflineCapable = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOffline = (postData: { text: string; category: string; location?: string }) => {
    if (typeof window !== 'undefined' && (window as any).saveOfflineKindness) {
      return (window as any).saveOfflineKindness(postData);
    }
    return false;
  };

  return {
    isOnline,
    saveOffline,
    canWorkOffline: 'serviceWorker' in navigator
  };
};