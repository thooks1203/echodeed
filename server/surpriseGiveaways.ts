import { RewardPartner, RewardOffer, KindnessPost } from '../shared/schema';

export interface SurpriseGiveawayConfig {
  id: string;
  name: string;
  isActive: boolean;
  giveawayType: 'user_gift_card' | 'school_fee_refund';
  
  // User gift card config
  giftCardValue?: number; // Dollar amount (e.g., 10 for $10)
  partnerId?: string; // Starbucks, Amazon, etc.
  maxUsersPerDay?: number;
  minActivityScore?: number; // Minimum activity score to qualify
  
  // School fee refund config
  maxSchoolsPerPeriod?: number; // Up to 5 schools per period
  refundPeriod?: 'monthly' | 'quarterly' | 'annually';
  minSchoolActivityScore?: number;
  
  // Timing config
  triggerFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate?: Date;
}

export interface UserActivityScore {
  userId: string;
  score: number;
  postsThisWeek: number;
  heartsReceived: number;
  achievementsUnlocked: number;
  daysActive: number;
  lastActive: Date;
}

export interface SchoolActivityScore {
  schoolId: string;
  schoolName: string;
  score: number;
  totalStudents: number;
  activeStudents: number;
  kindnessActsThisMonth: number;
  teacherEngagement: number;
  averageKindnessScore: number;
}

export interface SurpriseGiveawayResult {
  success: boolean;
  recipients: {
    userId?: string;
    schoolId?: string;
    type: 'gift_card' | 'fee_refund';
    value: number;
    redemptionCode?: string;
    externalId?: string;
  }[];
  nextRunTime?: Date;
}

export class SurpriseGiveawayService {
  private activeConfigs: Map<string, SurpriseGiveawayConfig> = new Map();

  constructor(private storage: any, private fulfillmentService: any) {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    // User gift card surprise config - SUSTAINABLE VERSION
    const userGiftCardConfig: SurpriseGiveawayConfig = {
      id: 'weekly-kindness-surprise',
      name: 'Weekly Kindness Champion Surprise',
      isActive: true,
      giveawayType: 'user_gift_card',
      giftCardValue: 10,
      partnerId: undefined, // Will use first available partner
      maxUsersPerDay: 1, // Reduced from 3 to 1 per week (sustainable)
      minActivityScore: 85, // Raised threshold to 85 (more selective)
      triggerFrequency: 'weekly', // Changed from daily to weekly (7x cost reduction)
      startDate: new Date()
    };

    // School fee refund config - CONSERVATIVE VERSION
    const schoolRefundConfig: SurpriseGiveawayConfig = {
      id: 'quarterly-school-refund',
      name: 'Quarterly Top School Recognition',
      isActive: true,
      giveawayType: 'school_fee_refund',
      maxSchoolsPerPeriod: 3, // Reduced from 5 to 3 schools (more sustainable)
      refundPeriod: 'quarterly',
      minSchoolActivityScore: 90, // Raised threshold (top performers only)
      triggerFrequency: 'quarterly',
      startDate: new Date()
    };

    this.activeConfigs.set(userGiftCardConfig.id, userGiftCardConfig);
    this.activeConfigs.set(schoolRefundConfig.id, schoolRefundConfig);
  }

  async calculateUserActivityScore(userId: string): Promise<UserActivityScore> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Get user's recent posts
      const posts = await this.storage.getUserPosts(userId);
      const recentPosts = posts.filter((p: KindnessPost) => new Date(p.createdAt) > oneWeekAgo);
      
      // Get user tokens/achievements
      const userTokens = await this.storage.getUserTokens(userId);
      const achievements = await this.storage.getUserAchievements(userId);
      
      // Calculate activity metrics
      const postsThisWeek = recentPosts.length;
      const heartsReceived = recentPosts.reduce((sum: number, post: any) => sum + (post.hearts || 0), 0);
      const achievementsUnlocked = achievements.length;
      const daysActive = this.calculateActiveDays(posts);
      
      // Calculate composite score (0-100)
      let score = 0;
      score += Math.min(postsThisWeek * 15, 45); // Up to 45 points for posts
      score += Math.min(heartsReceived * 2, 25); // Up to 25 points for hearts
      score += Math.min(achievementsUnlocked * 5, 20); // Up to 20 points for achievements
      score += Math.min(daysActive * 2, 10); // Up to 10 points for consistency
      
      return {
        userId,
        score: Math.round(score),
        postsThisWeek,
        heartsReceived,
        achievementsUnlocked,
        daysActive,
        lastActive: posts.length > 0 ? new Date(posts[0].createdAt) : new Date(0)
      };
    } catch (error) {
      console.error(`Error calculating activity score for user ${userId}:`, error);
      return {
        userId,
        score: 0,
        postsThisWeek: 0,
        heartsReceived: 0,
        achievementsUnlocked: 0,
        daysActive: 0,
        lastActive: new Date(0)
      };
    }
  }

  async calculateSchoolActivityScore(schoolId: string): Promise<SchoolActivityScore> {
    // Mock implementation - would integrate with actual school data
    const mockScore: SchoolActivityScore = {
      schoolId,
      schoolName: `School ${schoolId}`,
      score: Math.floor(Math.random() * 40) + 60, // 60-100 range
      totalStudents: 450,
      activeStudents: 380,
      kindnessActsThisMonth: 127,
      teacherEngagement: 85,
      averageKindnessScore: 8.4
    };
    
    return mockScore;
  }

  private calculateActiveDays(posts: any[]): number {
    if (!posts.length) return 0;
    
    const uniqueDays = new Set();
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    posts.forEach(post => {
      const postDate = new Date(post.createdAt);
      if (postDate > oneMonthAgo) {
        const dayKey = postDate.toDateString();
        uniqueDays.add(dayKey);
      }
    });
    
    return uniqueDays.size;
  }

  async runSurpriseGiveaway(configId: string): Promise<SurpriseGiveawayResult> {
    const config = this.activeConfigs.get(configId);
    if (!config || !config.isActive) {
      return { success: false, recipients: [] };
    }

    try {
      if (config.giveawayType === 'user_gift_card') {
        return await this.runUserGiftCardGiveaway(config);
      } else if (config.giveawayType === 'school_fee_refund') {
        return await this.runSchoolRefundGiveaway(config);
      }
      
      return { success: false, recipients: [] };
    } catch (error) {
      console.error(`Error running surprise giveaway ${configId}:`, error);
      return { success: false, recipients: [] };
    }
  }

  private async runUserGiftCardGiveaway(config: SurpriseGiveawayConfig): Promise<SurpriseGiveawayResult> {
    // Get all active users
    const users = await this.storage.getActiveUsers(30); // Users active in last 30 days
    
    // Calculate activity scores for eligible users
    const eligibleUsers: UserActivityScore[] = [];
    
    for (const user of users) {
      const activityScore = await this.calculateUserActivityScore(user.id);
      if (activityScore.score >= (config.minActivityScore || 75)) {
        eligibleUsers.push(activityScore);
      }
    }

    // Sort by activity score (highest first)
    eligibleUsers.sort((a, b) => b.score - a.score);
    
    // Select random winners from top performers
    const maxWinners = config.maxUsersPerDay || 3;
    const topCandidates = eligibleUsers.slice(0, Math.min(eligibleUsers.length, maxWinners * 3));
    const winners = this.shuffleArray(topCandidates).slice(0, maxWinners);
    
    // Process gift card fulfillment for winners
    const recipients = [];
    
    for (const winner of winners) {
      try {
        // Create surprise gift card redemption - use sample data for now
        const offers = await this.storage.getRewardOffers({});
        const offer = offers.find((o: any) => o.offerValue === `$${config.giftCardValue}`);
        const allPartners = await this.storage.getRewardPartners();
        const partner = allPartners.find((p: any) => offer && p.id === offer.partnerId);
        
        if (offer && partner) {
          const redemption = await this.storage.redeemReward({
            userId: winner.userId,
            offerId: offer.id,
            partnerId: config.partnerId || offer.partnerId,
            echoSpent: 0, // Free surprise gift
            status: 'pending'
          });
          
          const fulfillmentResult = await this.fulfillmentService.fulfillRedemption(offer, partner, redemption);
          
          if (fulfillmentResult.success) {
            await this.storage.updateRedemptionStatus(
              redemption.id,
              'active',
              fulfillmentResult.redemptionCode
            );
            
            recipients.push({
              userId: winner.userId,
              type: 'gift_card' as const,
              value: config.giftCardValue || 10,
              redemptionCode: fulfillmentResult.redemptionCode,
              externalId: fulfillmentResult.externalId
            });

            // Send surprise notification
            await this.sendSurpriseNotification(winner.userId, 'gift_card', config.giftCardValue || 10, fulfillmentResult.redemptionCode);
          }
        }
      } catch (error) {
        console.error(`Error processing gift card for user ${winner.userId}:`, error);
      }
    }
    
    return {
      success: true,
      recipients,
      nextRunTime: this.calculateNextRunTime(config)
    };
  }

  private async runSchoolRefundGiveaway(config: SurpriseGiveawayConfig): Promise<SurpriseGiveawayResult> {
    // Mock school selection - would integrate with real school data
    const mockSchools = [
      { id: '1', name: 'Lincoln Elementary', annualFee: 2500 },
      { id: '2', name: 'Roosevelt Middle School', annualFee: 3200 },
      { id: '3', name: 'Washington High School', annualFee: 4100 },
      { id: '4', name: 'Jefferson Academy', annualFee: 3800 },
      { id: '5', name: 'Franklin Institute', annualFee: 3600 }
    ];
    
    const eligibleSchools = [];
    
    for (const school of mockSchools) {
      const activityScore = await this.calculateSchoolActivityScore(school.id);
      if (activityScore.score >= (config.minSchoolActivityScore || 85)) {
        eligibleSchools.push({ ...school, activityScore });
      }
    }
    
    // Select winners
    const maxWinners = config.maxSchoolsPerPeriod || 5;
    const winners = this.shuffleArray(eligibleSchools).slice(0, Math.min(maxWinners, eligibleSchools.length));
    
    const recipients = winners.map(winner => ({
      schoolId: winner.id,
      type: 'fee_refund' as const,
      value: winner.annualFee
    }));
    
    // Send notifications to schools (would integrate with school admin system)
    for (const winner of winners) {
      await this.sendSchoolRefundNotification(winner.id, winner.name, winner.annualFee);
    }
    
    return {
      success: true,
      recipients,
      nextRunTime: this.calculateNextRunTime(config)
    };
  }

  private async sendSurpriseNotification(userId: string, type: string, value: number, redemptionCode?: string) {
    // Log surprise giveaway
    console.log(`🎉 SURPRISE! User ${userId} won a $${value} gift card! Redemption: ${redemptionCode}`);
    
    // In a real implementation, this would integrate with WebSocket broadcast
    // For now, just log the notification
    console.log('🎁 Surprise gift card notification ready:', {
      type: 'SURPRISE_GIVEAWAY',
      userId,
      giftCard: {
        type: 'gift_card',
        value,
        partnerName: 'Starbucks',
        redemptionCode,
        message: `🎉 CONGRATS! YOU'VE BEEN SELECTED FOR A FREE STARBUCKS GIFT CARD VALUED AT $${value}!`
      }
    });
  }

  private async sendSchoolRefundNotification(schoolId: string, schoolName: string, refundAmount: number) {
    console.log(`🏆 School Winner: ${schoolName} selected for $${refundAmount} fee refund!`);
    
    // Integration point for school admin notifications
    // await emailService.sendSchoolRefundNotification({
    //   schoolId,
    //   schoolName,
    //   refundAmount,
    //   subject: '🏆 Congratulations! Your school has been selected for a fee refund!',
    //   body: `Based on your students' exceptional kindness activity, ${schoolName} has been selected to receive a $${refundAmount} annual fee refund!`
    // });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateNextRunTime(config: SurpriseGiveawayConfig): Date {
    const now = new Date();
    switch (config.triggerFrequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  // Public API methods
  async getActiveConfigs(): Promise<SurpriseGiveawayConfig[]> {
    return Array.from(this.activeConfigs.values()).filter(config => config.isActive);
  }

  async updateConfig(configId: string, updates: Partial<SurpriseGiveawayConfig>): Promise<boolean> {
    const config = this.activeConfigs.get(configId);
    if (config) {
      Object.assign(config, updates);
      return true;
    }
    return false;
  }

  async getEligibleUsers(): Promise<UserActivityScore[]> {
    const users = await this.storage.getActiveUsers(30);
    const eligibleUsers = [];
    
    for (const user of users) {
      const activityScore = await this.calculateUserActivityScore(user.id);
      if (activityScore.score >= 75) {
        eligibleUsers.push(activityScore);
      }
    }
    
    return eligibleUsers.sort((a, b) => b.score - a.score);
  }

  async getEligibleSchools(): Promise<SchoolActivityScore[]> {
    // Mock implementation - would integrate with real school data
    const mockSchools = ['1', '2', '3', '4', '5'];
    const eligibleSchools = [];
    
    for (const schoolId of mockSchools) {
      const activityScore = await this.calculateSchoolActivityScore(schoolId);
      if (activityScore.score >= 85) {
        eligibleSchools.push(activityScore);
      }
    }
    
    return eligibleSchools.sort((a, b) => b.score - a.score);
  }
}