// Reward Notification Manager - Handles proximity notifications for dual rewards
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rewardProximityService } from '@/services/rewardProximityNotifications';
import { pushNotifications } from '@/services/pushNotifications';

interface UserTokens {
  echoBalance: number;
  totalEarned: number;
}

interface RewardOffer {
  id: string;
  title: string;
  description: string;
  echoCost: number;
  offerValue: string;
  partnerName: string;
  isDualReward?: boolean;
  kidReward?: string;
  parentReward?: string;
  location?: string;
}

export function RewardNotificationManager() {
  const hasInitialized = useRef(false);
  const lastBalance = useRef<number>(0);

  // Fetch user tokens
  const { data: userTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch available rewards
  const { data: rewards } = useQuery<RewardOffer[]>({
    queryKey: ['/api/rewards/offers/all/all'],
    refetchInterval: 60000, // Check every minute
  });

  // Initialize notification system and start proximity checking
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Request notification permission
      pushNotifications.requestPermission().then((granted) => {
        if (granted) {
          console.log('🔔 Reward proximity notifications enabled!');
          // Start periodic proximity checking
          rewardProximityService.startProximityChecking();
        }
      });
    }
  }, []);

  // Check for proximity notifications when balance changes
  useEffect(() => {
    if (userTokens && rewards && userTokens.echoBalance !== lastBalance.current) {
      lastBalance.current = userTokens.echoBalance;
      
      // Check if user is close to any rewards
      rewardProximityService.checkAndNotifyRewardProximity(userTokens, rewards);
    }
  }, [userTokens, rewards]);

  // This component doesn't render anything - it just manages notifications
  return null;
}

// Export additional utility functions for manual testing
export const testRewardProximity = {
  /**
   * Test proximity notifications with mock data
   */
  async testWithMockData() {
    const mockTokens: UserTokens = { echoBalance: 75, totalEarned: 150 };
    const mockRewards: RewardOffer[] = [
      {
        id: '1',
        title: 'Family Movie Experience',
        description: 'Movie ticket with free popcorn refills at Graham Theater!',
        echoCost: 100,
        offerValue: 'Movie + Popcorn',
        partnerName: 'Graham Theater',
        location: 'Graham, NC'
      },
      {
        id: '2', 
        title: 'Book Bundle + Parent Amazon Credit',
        description: 'Kid gets $10 Scholastic book bundle, parent gets $10 Amazon gift card!',
        echoCost: 125,
        offerValue: 'Book + $10 Credit',
        partnerName: 'Scholastic Books',
        isDualReward: true,
        kidReward: '$10 Scholastic Book Bundle',
        parentReward: '$10 Amazon Gift Card'
      },
      {
        id: '3',
        title: 'Premium Custard Treat',
        description: 'Delicious frozen custard treat at Whit\'s in Graham!',
        echoCost: 85,
        offerValue: 'Custard Treat',
        partnerName: 'Whit\'s Frozen Custard Graham',
        location: 'Graham, NC'
      }
    ];
    
    await rewardProximityService.checkAndNotifyRewardProximity(mockTokens, mockRewards);
    console.log('🧪 Test proximity notifications sent!');
  },

  /**
   * Trigger immediate check with real data
   */
  async triggerImmediateCheck() {
    await rewardProximityService.triggerImmediateCheck();
    console.log('🔔 Immediate proximity check triggered!');
  }
};