import { storage } from "./storage";

export async function initializeMentorBadges() {
  console.log('🎓 Initializing Mentor Badge System...');
  
  try {
    // FORCE COMPREHENSIVE RE-SEEDING FOR COMPLETE DEMO DATA
    console.log('🔄 FORCE RE-SEEDING: Creating comprehensive mentor badge system');
    const existingBadges = await storage.getMentorBadges();
    if (existingBadges.length > 0) {
      console.log('🔄 Re-creating mentor badges for comprehensive demo');
    }

    console.log('📛 Creating sample mentor badges...');

    // STARTER TIER BADGES - Build foundation and confidence
    const starterBadges = [
      {
        badgeName: 'First Friend',
        description: 'Welcome your first mentee and start building connections!',
        badgeIcon: '👋',
        tier: 'starter' as const,
        category: 'connection' as const,
        requirements: { totalMentees: 1 },
        tokenReward: 50,
        isActive: true,
        sortOrder: 1
      },
      {
        badgeName: 'Good Listener',
        description: 'Complete 3 mentor sessions showing active listening skills.',
        badgeIcon: '👂',
        tier: 'starter' as const,
        category: 'communication' as const,
        requirements: { totalSessions: 3, avgRating: 4.0 },
        tokenReward: 75,
        isActive: true,
        sortOrder: 2
      },
      {
        badgeName: 'Helper Hero',
        description: 'Help a mentee complete their first kindness challenge.',
        badgeIcon: '🦸',
        tier: 'starter' as const,
        category: 'guidance' as const,
        requirements: { challengesHelped: 1 },
        tokenReward: 100,
        isActive: true,
        sortOrder: 3
      }
    ];

    // BRONZE TIER BADGES - Developing skills and consistency
    const bronzeBadges = [
      {
        badgeName: 'Consistent Buddy',
        description: 'Meet with mentees regularly for 2 weeks straight.',
        badgeIcon: '🤝',
        tier: 'bronze' as const,
        category: 'consistency' as const,
        requirements: { consistentWeeks: 2, totalSessions: 6 },
        tokenReward: 150,
        isActive: true,
        sortOrder: 4
      },
      {
        badgeName: 'Problem Solver',
        description: 'Help mentees overcome 5 different challenges.',
        badgeIcon: '🧩',
        tier: 'bronze' as const,
        category: 'guidance' as const,
        requirements: { problemsSolved: 5, avgRating: 4.2 },
        tokenReward: 200,
        isActive: true,
        sortOrder: 5
      },
      {
        badgeName: 'Kindness Catalyst',
        description: 'Inspire mentees to complete 10 acts of kindness.',
        badgeIcon: '✨',
        tier: 'bronze' as const,
        category: 'inspiration' as const,
        requirements: { kindnessActsInspired: 10 },
        tokenReward: 250,
        isActive: true,
        sortOrder: 6
      }
    ];

    // SILVER TIER BADGES - Advanced mentoring and leadership
    const silverBadges = [
      {
        badgeName: 'Multi-Mentor',
        description: 'Successfully mentor 3 different students simultaneously.',
        badgeIcon: '🎯',
        tier: 'silver' as const,
        category: 'leadership' as const,
        requirements: { totalMentees: 3, activeMentorships: 3 },
        tokenReward: 400,
        isActive: true,
        sortOrder: 7
      },
      {
        badgeName: 'Growth Guide',
        description: 'Help a mentee improve their kindness score by 50%.',
        badgeIcon: '📈',
        tier: 'silver' as const,
        category: 'development' as const,
        requirements: { menteeGrowthPercent: 50, completedMentorships: 2 },
        tokenReward: 500,
        isActive: true,
        sortOrder: 8
      },
      {
        badgeName: 'Trusted Advisor',
        description: 'Receive 4.5+ average rating from all mentees.',
        badgeIcon: '⭐',
        tier: 'silver' as const,
        category: 'excellence' as const,
        requirements: { avgRating: 4.5, totalRatings: 10 },
        tokenReward: 600,
        isActive: true,
        sortOrder: 9
      }
    ];

    // GOLD TIER BADGES - Master mentors and exceptional impact
    const goldBadges = [
      {
        badgeName: 'Master Mentor',
        description: 'Complete 5 successful long-term mentorships.',
        badgeIcon: '🏆',
        tier: 'gold' as const,
        category: 'mastery' as const,
        requirements: { completedMentorships: 5, avgMentorshipDuration: 90 },
        tokenReward: 1000,
        isActive: true,
        sortOrder: 10
      },
      {
        badgeName: 'Community Builder',
        description: 'Organize group mentoring sessions bringing kids together.',
        badgeIcon: '🌟',
        tier: 'gold' as const,
        category: 'community' as const,
        requirements: { groupSessions: 3, participantsReached: 15 },
        tokenReward: 1200,
        isActive: true,
        sortOrder: 11
      },
      {
        badgeName: 'Kindness Champion',
        description: 'Inspire 100 acts of kindness through your mentoring.',
        badgeIcon: '👑',
        tier: 'gold' as const,
        category: 'impact' as const,
        requirements: { kindnessActsInspired: 100, impactScore: 1000 },
        tokenReward: 1500,
        isActive: true,
        sortOrder: 12
      }
    ];

    // SPECIAL ACHIEVEMENT BADGES - Unique recognition for exceptional contributions
    const specialBadges = [
      {
        badgeName: 'Crisis Helper',
        description: 'Provide support during a peer crisis situation.',
        badgeIcon: '🚨',
        tier: 'special' as const,
        category: 'support' as const,
        requirements: { crisisSupport: 1, trainingCompleted: true },
        tokenReward: 2000,
        isActive: true,
        sortOrder: 13
      },
      {
        badgeName: 'Innovation Leader',
        description: 'Create new mentoring activities adopted by others.',
        badgeIcon: '💡',
        tier: 'special' as const,
        category: 'innovation' as const,
        requirements: { innovationsCreated: 1, adoptionRate: 75 },
        tokenReward: 2500,
        isActive: true,
        sortOrder: 14
      },
      {
        badgeName: 'School Ambassador',
        description: 'Represent the mentor program to parents and teachers.',
        badgeIcon: '🎓',
        tier: 'special' as const,
        category: 'leadership' as const,
        requirements: { presentationsGiven: 2, parentFeedbackScore: 4.8 },
        tokenReward: 3000,
        isActive: true,
        sortOrder: 15
      }
    ];

    // Combine all badges
    const allBadges = [
      ...starterBadges,
      ...bronzeBadges, 
      ...silverBadges,
      ...goldBadges,
      ...specialBadges
    ];

    // Insert badges into database
    for (const badge of allBadges) {
      await storage.createMentorBadge(badge);
    }

    console.log('✅ Created', allBadges.length, 'mentor badges successfully!');
    console.log('🎯 Badge categories: Connection, Communication, Guidance, Consistency, Inspiration, Leadership, Development, Excellence, Mastery, Community, Impact, Support, Innovation');
    console.log('🏅 Badge tiers: Starter (3), Bronze (3), Silver (3), Gold (3), Special (3)');

  } catch (error) {
    console.error('❌ Failed to initialize mentor badges:', error);
    throw error;
  }
}

// Function to award achievement badges automatically
export async function checkAndAwardMentorBadges(userId: string) {
  try {
    const eligibleBadges = await storage.checkMentorBadgeEligibility(userId);
    
    for (const badge of eligibleBadges) {
      await storage.awardMentorBadge(userId, badge.id);
      console.log(`🏆 Awarded badge "${badge.badgeName}" to user ${userId}`);
      
      // Award tokens for the badge
      const userTokens = await storage.getUserTokens(userId);
      if (userTokens) {
        await storage.updateUserTokens(userId, {
          echoBalance: userTokens.echoBalance + (badge.tokenReward || 0),
          totalEarned: userTokens.totalEarned + (badge.tokenReward || 0)
        });
        console.log(`💰 Awarded ${badge.tokenReward} tokens for badge "${badge.badgeName}"`);
      }
    }
    
    return eligibleBadges;
  } catch (error) {
    console.error('Error checking/awarding mentor badges:', error);
    return [];
  }
}