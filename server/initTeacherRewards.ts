import { db } from './db';
import { teacherRewardCriteria, teacherRewards, sponsors } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function initializeTeacherRewardSystem() {
  console.log('🏆 Initializing Teacher Reward System...');
  
  try {
    // Check if criteria already exist
    const existingCriteria = await db.select().from(teacherRewardCriteria);
    
    if (existingCriteria.length === 0) {
      console.log('📋 Creating teacher reward criteria...');
      
      // Service Hours Excellence Rewards
      await db.insert(teacherRewardCriteria).values([
        {
          name: 'Service Hours Champion - Monthly',
          description: 'Approve 10+ community service hours in a month',
          category: 'service_hours',
          threshold: 10,
          period: 'monthly',
          rewardType: 'coffee_carafe',
          sponsorRequired: 1,
          isActive: 1
        },
        {
          name: 'Service Hours Excellence - Quarterly',
          description: 'Maintain 90%+ 24-hour response rate for service hour verifications',
          category: 'service_hours',
          threshold: 90,
          period: 'quarterly',
          rewardType: 'restaurant_card',
          sponsorRequired: 1,
          isActive: 1
        },
        
        // Wellness Champions Rewards
        {
          name: 'Wellness Champion - Weekly',
          description: 'Complete daily wellness check-ins for 3+ weeks',
          category: 'wellness',
          threshold: 3,
          period: 'monthly',
          rewardType: 'coffee_carafe',
          sponsorRequired: 1,
          isActive: 1
        },
        {
          name: 'Wellness Guardian - Quarterly',
          description: 'Achieve 80%+ student participation in wellness activities',
          category: 'wellness',
          threshold: 80,
          period: 'quarterly',
          rewardType: 'restaurant_card',
          sponsorRequired: 1,
          isActive: 1
        },
        
        // Community Builders Rewards
        {
          name: 'Community Builder - Monthly',
          description: 'Facilitate 5+ classroom kindness posts monthly',
          category: 'engagement',
          threshold: 5,
          period: 'monthly',
          rewardType: 'coffee_carafe',
          sponsorRequired: 1,
          isActive: 1
        },
        {
          name: 'Parent Engagement Excellence',
          description: 'Maintain excellent parent communication and engagement',
          category: 'engagement',
          threshold: 1,
          period: 'quarterly',
          rewardType: 'spa_day',
          sponsorRequired: 1,
          isActive: 1
        }
      ]);
      
      console.log('✅ Created 6 teacher reward criteria');
    } else {
      console.log(`ℹ️ Teacher reward criteria already exist (${existingCriteria.length} records)`);
    }
    
    // Create Burlington sponsor partnerships for teacher rewards
    const existingSponsors = await db.select().from(sponsors);
    
    if (existingSponsors.length === 0) {
      console.log('🤝 Creating local sponsor partnerships...');
      
      await db.insert(sponsors).values([
        {
          companyName: 'Starbucks Burlington',
          contactName: 'Store Manager',
          contactEmail: 'burlington@starbucks.com',
          category: 'coffee',
          location: 'Burlington, NC',
          monthlyBudget: 50000, // $500 monthly budget
          sponsorshipTier: 'local',
          isActive: 1
        },
        {
          companyName: 'Chick-fil-A Burlington',
          contactName: 'Franchise Owner',
          contactEmail: 'owner@cfaburlington.com',
          category: 'local_restaurant',
          location: 'Burlington, NC',
          monthlyBudget: 75000, // $750 monthly budget
          sponsorshipTier: 'local',
          isActive: 1
        },
        {
          companyName: 'Target Burlington',
          contactName: 'Community Relations',
          contactEmail: 'community@target.com',
          category: 'retail',
          location: 'Burlington, NC',
          monthlyBudget: 100000, // $1000 monthly budget
          sponsorshipTier: 'regional',
          isActive: 1
        }
      ]);
      
      console.log('✅ Created 3 local sponsor partnerships');
    }
    
    console.log('🎉 Teacher Reward System initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing teacher reward system:', error);
    throw error;
  }
}