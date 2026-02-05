import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SurpriseGiveawayModal } from './SurpriseGiveawayModal';
import { pushNotifications } from '@/services/pushNotifications';

interface SurpriseGiveaway {
  id: string;
  title: string;
  description: string;
  partnerName: string;
  partnerLogo?: string;
  redemptionCode?: string;
  expiresAt?: string;
  location?: string;
}

export function SurpriseGiveawayManager() {
  const [currentGiveaway, setCurrentGiveaway] = useState<SurpriseGiveaway | null>(null);
  const [showModal, setShowModal] = useState(false);
  const hasInitialized = useRef(false);
  const checkInterval = useRef<NodeJS.Timeout>();

  // Check for surprise giveaways periodically
  const { data: campaigns } = useQuery({
    queryKey: ['/api/surprise-giveaways/campaigns'],
    refetchInterval: 60000, // Check every 60 seconds (1 minute)
  });

  // Initialize surprise giveaway checking
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Start checking for surprise giveaways
      startGiveawayPolling();
      
      // Listen for push notifications about giveaways
      setupPushNotificationListener();
    }

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  const startGiveawayPolling = () => {
    // Check for surprise giveaway notifications every 60 seconds
    checkInterval.current = setInterval(async () => {
      await checkForSurpriseGiveaway();
    }, 60000);
    
    // Also check immediately
    checkForSurpriseGiveaway();
  };

  const setupPushNotificationListener = () => {
    // Listen for browser notifications about surprise giveaways
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'surprise-giveaway') {
          const giveaway = event.data.giveaway;
          showSurpriseGiveaway(giveaway);
        }
      });
    }
  };

  const checkForSurpriseGiveaway = async () => {
    try {
      // Check if user has been selected for a surprise giveaway
      const response = await fetch('/api/surprise-giveaways/check-user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasGiveaway && data.giveaway) {
          showSurpriseGiveaway(data.giveaway);
        }
      }
    } catch (error) {
      // Silent fail - don't spam console in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Surprise giveaway check failed:', error);
      }
    }
  };

  const showSurpriseGiveaway = (giveaway: SurpriseGiveaway) => {
    setCurrentGiveaway(giveaway);
    setShowModal(true);
    
    // Send browser notification if permissions are granted
    pushNotifications.sendNotification({
      title: '🎉 Surprise Giveaway!',
      body: `You won: ${giveaway.title} from ${giveaway.partnerName}!`,
      tag: 'surprise_giveaway',
      data: { type: 'surprise_giveaway' }
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentGiveaway(null);
  };

  const handleRedeem = async () => {
    try {
      if (!currentGiveaway) return;

      // Mark giveaway as redeemed
      const response = await fetch('/api/surprise-giveaways/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ giveawayId: currentGiveaway.id })
      });

      if (response.ok) {
        // Show success message via push notification
        pushNotifications.sendNotification({
          title: '✅ Giveaway Redeemed!',
          body: `Your ${currentGiveaway.title} is ready to use!`,
          tag: 'giveaway-redeemed'
        });
      }
    } catch (error) {
      console.error('Failed to redeem giveaway:', error);
    }
    
    handleCloseModal();
  };

  return null;
  /*
  return (
    <SurpriseGiveawayModal
      isOpen={showModal}
      onClose={handleCloseModal}
      giveaway={currentGiveaway || undefined}
      onRedeem={handleRedeem}
    />
  );
  */
}

// Export test utilities
export const testSurpriseGiveaway = {
  /**
   * Manually trigger a surprise giveaway for testing
   */
  async triggerTestGiveaway() {
    try {
      const response = await fetch('/api/surprise-giveaways/test-trigger', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎉 Test giveaway triggered:', result);
        return result;
      }
    } catch (error) {
      console.error('Failed to trigger test giveaway:', error);
      throw error;
    }
  },

  /**
   * Check eligible users for testing
   */
  async checkEligibleUsers() {
    try {
      const response = await fetch('/api/surprise-giveaways/eligible-users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get eligible users:', error);
      throw error;
    }
  }
};