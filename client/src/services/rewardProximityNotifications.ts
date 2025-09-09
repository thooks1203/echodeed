// Reward Proximity Notification Service for EchoDeed™
// Sends motivational push notifications when users are close to earning rewards

import { PushNotificationService } from './pushNotifications';

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

interface UserTokens {
  echoBalance: number;
  totalEarned: number;
}

export class RewardProximityNotificationService {
  private pushService: PushNotificationService;
  private notificationThresholds = [50, 25, 10, 5]; // Tokens away thresholds

  constructor() {
    this.pushService = new PushNotificationService();
  }

  /**
   * Analyze user's token balance against available rewards and send proximity notifications
   */
  async checkAndNotifyRewardProximity(userTokens: UserTokens, availableRewards: RewardOffer[]): Promise<void> {
    if (!this.pushService.isEnabled()) {
      return;
    }

    // Find rewards within notification thresholds
    const proximityRewards = this.findRewardsWithinThresholds(userTokens.echoBalance, availableRewards);
    
    if (proximityRewards.length === 0) {
      return;
    }

    // Send notifications for the most appealing rewards
    await this.sendProximityNotifications(userTokens.echoBalance, proximityRewards);
  }

  /**
   * Find rewards that are within our notification thresholds
   */
  private findRewardsWithinThresholds(currentBalance: number, rewards: RewardOffer[]): Array<{
    reward: RewardOffer;
    tokensNeeded: number;
    threshold: number;
  }> {
    const proximityRewards: Array<{
      reward: RewardOffer;
      tokensNeeded: number;
      threshold: number;
    }> = [];

    for (const reward of rewards) {
      const tokensNeeded = reward.echoCost - currentBalance;
      
      // Only consider rewards that user can potentially earn
      if (tokensNeeded > 0 && tokensNeeded <= Math.max(...this.notificationThresholds)) {
        // Find which threshold this falls into
        const threshold = this.notificationThresholds.find(t => tokensNeeded <= t);
        if (threshold) {
          proximityRewards.push({
            reward,
            tokensNeeded,
            threshold
          });
        }
      }
    }

    // Sort by priority: dual rewards first, then local rewards, then by fewest tokens needed
    return proximityRewards.sort((a, b) => {
      // Prioritize dual rewards
      if (a.reward.isDualReward && !b.reward.isDualReward) return -1;
      if (!a.reward.isDualReward && b.reward.isDualReward) return 1;
      
      // Then prioritize local Burlington/Alamance County rewards
      const aIsLocal = this.isLocalReward(a.reward);
      const bIsLocal = this.isLocalReward(b.reward);
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;
      
      // Finally, sort by fewest tokens needed
      return a.tokensNeeded - b.tokensNeeded;
    });
  }

  /**
   * Check if reward is from local Burlington/Alamance County partners
   */
  private isLocalReward(reward: RewardOffer): boolean {
    const localPartners = [
      'Burlington City Park Carousel',
      'Putt-Putt Fun Center Burlington', 
      'Burlington Sock Puppets Baseball',
      'Sir Pizza Burlington',
      'Chick-fil-A Burlington',
      'Children\'s Museum of Alamance County',
      'Graham Theater',
      'The Verdict on the Square',
      'Whit\'s Frozen Custard Graham',
      'Blue Ribbon Diner Mebane',
      'Buffaloe Lanes Mebane',
      'Muffin\'s Ice Cream Shoppe'
    ];
    
    return localPartners.includes(reward.partnerName) || 
           Boolean(reward.location && (reward.location.includes('Burlington') || 
                               reward.location.includes('Graham') || 
                               reward.location.includes('Mebane')));
  }

  /**
   * Send motivational proximity notifications
   */
  private async sendProximityNotifications(currentBalance: number, proximityRewards: Array<{
    reward: RewardOffer;
    tokensNeeded: number;
    threshold: number;
  }>): Promise<void> {
    // Send notification for the top priority reward
    const topReward = proximityRewards[0];
    
    if (!topReward) return;

    const message = this.createProximityMessage(topReward.reward, topReward.tokensNeeded);
    
    await this.pushService.sendNotification({
      title: message.title,
      body: message.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-monochrome.png',
      tag: `reward-proximity-${topReward.reward.id}`,
      requireInteraction: true,
      data: {
        type: 'achievement',
        url: '/rewards',
        actionRequired: false
      },
      actions: [
        {
          action: 'view-rewards',
          title: '🎁 View Rewards',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'earn-more',
          title: '💫 Do Kindness',
          icon: '/icons/icon-192x192.png'
        }
      ]
    });
  }

  /**
   * Create personalized proximity messages based on reward type and location
   */
  private createProximityMessage(reward: RewardOffer, tokensNeeded: number): {
    title: string;
    body: string;
  } {
    const tokenWord = tokensNeeded === 1 ? 'token' : 'tokens';
    
    // Special messages for dual rewards
    if (reward.isDualReward) {
      return {
        title: '🎯 Family Reward Almost Yours!',
        body: `Just ${tokensNeeded} more ${tokenWord} and both you AND your parent get rewards! ${reward.kidReward} + ${reward.parentReward} 🎉`
      };
    }

    // Special messages for local Burlington/Alamance County partners
    if (this.isLocalReward(reward)) {
      const locationEmoji = this.getLocationEmoji(reward.partnerName);
      return {
        title: `${locationEmoji} Almost There!`,
        body: `Only ${tokensNeeded} more ${tokenWord} until your ${reward.offerValue} at ${reward.partnerName}! Keep spreading kindness! 💝`
      };
    }

    // Generic proximity message
    return {
      title: '🌟 Reward Within Reach!',
      body: `You're ${tokensNeeded} ${tokenWord} away from ${reward.title}! ${reward.offerValue} awaits! 🎁`
    };
  }

  /**
   * Get emoji for specific local partners
   */
  private getLocationEmoji(partnerName: string): string {
    const emojiMap: Record<string, string> = {
      'Burlington City Park Carousel': '🎠',
      'Putt-Putt Fun Center Burlington': '⛳',
      'Burlington Sock Puppets Baseball': '⚾',
      'Sir Pizza Burlington': '🍕',
      'Chick-fil-A Burlington': '🐔',
      'Children\'s Museum of Alamance County': '🏛️',
      'Graham Theater': '🎬',
      'The Verdict on the Square': '🍽️',
      'Whit\'s Frozen Custard Graham': '🍦',
      'Blue Ribbon Diner Mebane': '🥞',
      'Buffaloe Lanes Mebane': '🎳',
      'Muffin\'s Ice Cream Shoppe': '🧁'
    };
    
    return emojiMap[partnerName] || '🎁';
  }

  /**
   * Schedule periodic checks for reward proximity (called from main app)
   */
  async startProximityChecking(): Promise<void> {
    // Check every 30 minutes when app is active
    setInterval(async () => {
      try {
        // Fetch current user tokens and rewards
        const [tokensResponse, rewardsResponse] = await Promise.all([
          fetch('/api/tokens'),
          fetch('/api/rewards/offers')
        ]);
        
        if (tokensResponse.ok && rewardsResponse.ok) {
          const userTokens: UserTokens = await tokensResponse.json();
          const rewards: RewardOffer[] = await rewardsResponse.json();
          
          await this.checkAndNotifyRewardProximity(userTokens, rewards);
        }
      } catch (error) {
        console.error('Error checking reward proximity:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Manual trigger for testing or immediate checks
   */
  async triggerImmediateCheck(): Promise<void> {
    try {
      const [tokensResponse, rewardsResponse] = await Promise.all([
        fetch('/api/tokens'),
        fetch('/api/rewards/offers')
      ]);
      
      if (tokensResponse.ok && rewardsResponse.ok) {
        const userTokens: UserTokens = await tokensResponse.json();
        const rewards: RewardOffer[] = await rewardsResponse.json();
        
        await this.checkAndNotifyRewardProximity(userTokens, rewards);
      }
    } catch (error) {
      console.error('Error in immediate proximity check:', error);
    }
  }
}

// Global service instance
export const rewardProximityService = new RewardProximityNotificationService();