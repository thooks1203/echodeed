import { db } from '../db';
import { summerChallenges, summerActivities, userSummerProgress, legacyFamilyChallenges, summerNotifications } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface WeeklyChallengeTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
}

export class SummerChallengeEngine {
  // Parent notification storage
  private parentNotifications: any[] = [];
  
  // Weekly themes for the 12-week summer program
  private readonly weeklyThemes: WeeklyChallengeTheme[] = [
    { week: 1, theme: "Acts of Service", description: "Help others without being asked", focus: "Community helpers and everyday kindness", color: "#3B82F6" },
    { week: 2, theme: "Family Appreciation", description: "Show gratitude to family members", focus: "Family bonds and gratitude", color: "#EF4444" },
    { week: 3, theme: "Friend Support", description: "Be there for your friends", focus: "Friendship and loyalty", color: "#10B981" },
    { week: 4, theme: "Community Care", description: "Help your neighborhood", focus: "Local community impact", color: "#F59E0B" },
    { week: 5, theme: "Environmental Kindness", description: "Care for our planet", focus: "Environmental stewardship", color: "#059669" },
    { week: 6, theme: "Creativity & Joy", description: "Spread happiness through creativity", focus: "Artistic expression and joy", color: "#8B5CF6" },
    { week: 7, theme: "Elder Respect", description: "Honor older generations", focus: "Intergenerational connections", color: "#DC2626" },
    { week: 8, theme: "Random Kindness", description: "Surprise acts of kindness", focus: "Spontaneous generosity", color: "#0891B2" },
    { week: 9, theme: "Self-Care & Growth", description: "Be kind to yourself", focus: "Personal development and self-compassion", color: "#7C3AED" },
    { week: 10, theme: "Animal Compassion", description: "Care for animals", focus: "Animal welfare and respect", color: "#059669" },
    { week: 11, theme: "Learning & Teaching", description: "Share knowledge and learn together", focus: "Educational kindness", color: "#EA580C" },
    { week: 12, theme: "Celebration & Reflection", description: "Celebrate progress and plan ahead", focus: "Achievement and future goals", color: "#BE185D" }
  ];

  // Get current week of summer (1-12 based on date)
  getCurrentSummerWeek(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Summer starts June 1st, ends August 31st (12 weeks)
    const summerStart = new Date(currentYear, 5, 1); // June 1st
    const weeksPassed = Math.floor((now.getTime() - summerStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Clamp to 1-12 range, default to week 1 if outside summer
    return Math.max(1, Math.min(12, weeksPassed + 1));
  }

  // Get theme for specific week
  getWeekTheme(week: number): WeeklyChallengeTheme {
    return this.weeklyThemes[week - 1] || this.weeklyThemes[0];
  }

  // Generate age-appropriate challenges for a specific week and age group
  async generateWeeklyChallenges(week: number, ageGroup: '6-8'): Promise<void> {
    const theme = this.getWeekTheme(week);
    
    const challengeTemplates = this.getChallengeTemplatesForAge(theme.theme, ageGroup);
    
    for (const template of challengeTemplates) {
      // Check if challenge already exists
      const existingChallenge = await db.select()
        .from(summerChallenges)
        .where(and(
          eq(summerChallenges.week, week),
          eq(summerChallenges.ageGroup, ageGroup),
          eq(summerChallenges.title, template.title)
        ));

      if (existingChallenge.length === 0) {
        const [challenge] = await db.insert(summerChallenges)
          .values({
            week,
            title: template.title,
            description: template.description,
            category: theme.theme.toLowerCase().replace(/\s+/g, '_'),
            difficulty: template.difficulty,
            points: template.points,
            ageGroup,
            isActive: true
          })
          .returning();

        // Add specific activities for this challenge
        for (const activity of template.activities) {
          await db.insert(summerActivities).values({
            challengeId: challenge.id,
            title: activity.title,
            description: activity.description,
            instructions: activity.instructions,
            timeEstimate: activity.timeEstimate,
            materialsNeeded: activity.materials,
            parentInvolvement: activity.parentRequired
          });
        }
      }
    }
  }

  // Get age-appropriate challenge templates
  private getChallengeTemplatesForAge(theme: string, ageGroup: '6-8') {
    const baseTemplates = {
      'Acts of Service': {
        'k-2': [
          {
            title: "Little Helper Hero",
            description: "Help someone without being asked 3 times this week",
            difficulty: "easy",
            points: 10,
            activities: [
              {
                title: "Set the Table Surprise",
                description: "Set the table for dinner without being asked",
                instructions: "1. Look at the table before dinner. 2. Get plates, forks, and cups. 3. Put them in the right places. 4. Surprise your family!",
                timeEstimate: 10,
                materials: "Plates, forks, cups, napkins",
                parentRequired: false
              },
              {
                title: "Toy Cleanup Mission",
                description: "Clean up toys that aren't yours",
                instructions: "1. Find toys on the floor. 2. Ask whose toys they are. 3. Put them away nicely. 4. Tell that person what you did!",
                timeEstimate: 15,
                materials: "None needed",
                parentRequired: false
              }
            ]
          }
        ],
        '3-5': [
          {
            title: "Service Squad Member",
            description: "Complete 5 acts of service in your community this week",
            difficulty: "medium",
            points: 15,
            activities: [
              {
                title: "Neighbor Garden Helper",
                description: "Offer to help a neighbor with yard work",
                instructions: "1. Ask a parent to come with you. 2. Go to a neighbor's house. 3. Ask if you can help water plants or pull weeds. 4. Work together for 30 minutes.",
                timeEstimate: 30,
                materials: "Gloves, watering can (if needed)",
                parentRequired: true
              },
              {
                title: "Community Clean-up Champion",
                description: "Pick up litter in your neighborhood",
                instructions: "1. Get gloves and a trash bag. 2. Walk around your block with an adult. 3. Pick up any litter you see. 4. Count how many pieces you collected!",
                timeEstimate: 20,
                materials: "Gloves, trash bag",
                parentRequired: true
              }
            ]
          }
        ],
        '6-8': [
          {
            title: "Community Service Leader",
            description: "Organize and lead a service project involving others",
            difficulty: "hard",
            points: 25,
            activities: [
              {
                title: "Charity Drive Organizer",
                description: "Organize a food or clothing drive for your neighborhood",
                instructions: "1. Choose a local charity to support. 2. Make flyers explaining what you're collecting. 3. Ask neighbors to participate. 4. Deliver collected items with your parents.",
                timeEstimate: 120,
                materials: "Paper for flyers, collection boxes, markers",
                parentRequired: true
              }
            ]
          }
        ]
      },
      'Family Appreciation': {
        'k-2': [
          {
            title: "Family Love Express",
            description: "Do something special for each family member",
            difficulty: "easy",
            points: 10,
            activities: [
              {
                title: "Thank You Picture",
                description: "Draw a picture for someone in your family",
                instructions: "1. Think of someone who helps you. 2. Draw a picture showing them being helpful. 3. Write 'Thank You' at the top. 4. Give it to them with a hug!",
                timeEstimate: 20,
                materials: "Paper, crayons or markers",
                parentRequired: false
              }
            ]
          }
        ],
        '3-5': [
          {
            title: "Family Gratitude Champion",
            description: "Express appreciation to family members in creative ways",
            difficulty: "medium",
            points: 15,
            activities: [
              {
                title: "Family Interview Project",
                description: "Interview a family member about their childhood",
                instructions: "1. Pick a family member (parent, grandparent, sibling). 2. Ask questions like 'What was your favorite game as a kid?' 3. Write down their answers. 4. Share what you learned with other family members.",
                timeEstimate: 30,
                materials: "Paper, pencil, maybe a recorder",
                parentRequired: false
              }
            ]
          }
        ],
        '6-8': [
          {
            title: "Family Heritage Guardian",
            description: "Create a family appreciation project that honors your family's story",
            difficulty: "hard",
            points: 25,
            activities: [
              {
                title: "Family Story Documentary",
                description: "Create a video or photo story about your family",
                instructions: "1. Interview family members about family traditions. 2. Collect old photos and stories. 3. Create a presentation or video. 4. Share it at a family dinner.",
                timeEstimate: 90,
                materials: "Camera or phone, computer (optional), photos",
                parentRequired: true
              }
            ]
          }
        ]
      }
      // Additional themes would be added here...
    };

    // Return templates for the specific theme and age group, defaulting to Acts of Service if not found
    const themeTemplates = baseTemplates[theme as keyof typeof baseTemplates];
    return themeTemplates?.['6-8'] || baseTemplates['Acts of Service']['6-8'] || [];
  }

  // Initialize all challenges for the summer
  async initializeSummerProgram(): Promise<void> {
    console.log('🌞 Initializing Summer Challenge Program...');
    
    const ageGroups: Array<'6-8'> = ['6-8'];
    
    for (let week = 1; week <= 12; week++) {
      for (const ageGroup of ageGroups) {
        await this.generateWeeklyChallenges(week, ageGroup);
      }
    }

    // Initialize family challenges
    await this.initializeFamilyChallenges();
    
    console.log('✅ Summer Challenge Program initialized with all 12 weeks!');
  }

  // Initialize special family challenges
  private async initializeFamilyChallenges(): Promise<void> {
    const familyChallengeTemplates = [
      {
        title: "Family Game Night Kindness",
        description: "Host a game night where every game focuses on cooperation instead of competition",
        category: "family_bonding",
        difficulty: "easy",
        estimatedTime: 120,
        pointsForFamily: 30,
        weekAvailable: 2
      },
      {
        title: "Community Service Family Day",
        description: "Spend a day volunteering together as a family",
        category: "community_service",
        difficulty: "medium",
        estimatedTime: 240,
        pointsForFamily: 50,
        weekAvailable: 4
      },
      {
        title: "Family Kindness Chain Challenge",
        description: "Create a paper chain where each link represents a kind act done by any family member",
        category: "creativity",
        difficulty: "easy",
        estimatedTime: 60,
        pointsForFamily: 25,
        weekAvailable: 6
      }
    ];

    for (const template of familyChallengeTemplates) {
      const existing = await db.select()
        .from(legacyFamilyChallenges)
        .where(eq(legacyFamilyChallenges.title, template.title));

      if (existing.length === 0) {
        await db.insert(legacyFamilyChallenges).values(template);
      }
    }
  }

  // Get challenges for current week and age group
  async getCurrentWeekChallenges(ageGroup: '6-8') {
    const currentWeek = this.getCurrentSummerWeek();
    
    return await db.select()
      .from(summerChallenges)
      .where(and(
        eq(summerChallenges.week, currentWeek),
        eq(summerChallenges.ageGroup, ageGroup),
        eq(summerChallenges.isActive, true)
      ));
  }

  // Get activities for a specific challenge
  async getChallengeActivities(challengeId: string) {
    return await db.select()
      .from(summerActivities)
      .where(eq(summerActivities.challengeId, challengeId));
  }

  // Record challenge completion
  async completeChallenge(userId: string, challengeId: string, notes?: string) {
    const [completion] = await db.insert(userSummerProgress)
      .values({
        userId,
        challengeId,
        completedAt: new Date(),
        pointsEarned: 0, // Will be updated when parent approves
        parentApproved: false,
        notes: notes || null
      })
      .returning();

    // Notify parents
    await this.notifyParentOfCompletion(userId, challengeId);
    
    return completion;
  }


  // Notify parents of child's completion
  private async notifyParentOfCompletion(userId: string, challengeId: string) {
    // Get challenge details
    const [challenge] = await db.select()
      .from(summerChallenges)
      .where(eq(summerChallenges.id, challengeId));

    if (challenge) {
      await db.insert(summerNotifications).values({
        parentId: userId, // In real implementation, this would be the actual parent ID
        studentId: userId,
        type: 'progress_update',
        title: `🎉 Challenge Completed!`,
        message: `Your child completed "${challenge.title}"! Review their work to approve and award points.`,
        isRead: false,
        scheduledFor: new Date()
      });
    }
  }

  // Get user's summer progress
  async getUserProgress(userId: string) {
    return await db.select({
      progress: userSummerProgress,
      challenge: summerChallenges
    })
    .from(userSummerProgress)
    .leftJoin(summerChallenges, eq(userSummerProgress.challengeId, summerChallenges.id))
    .where(eq(userSummerProgress.userId, userId));
  }

  // Get weekly summary for parents
  async getWeeklySummary(userId: string, week: number) {
    const weekProgress = await db.select({
      progress: userSummerProgress,
      challenge: summerChallenges
    })
    .from(userSummerProgress)
    .leftJoin(summerChallenges, eq(userSummerProgress.challengeId, summerChallenges.id))
    .where(and(
      eq(userSummerProgress.userId, userId),
      eq(summerChallenges.week, week)
    ));

    const theme = this.getWeekTheme(week);
    
    return {
      week,
      theme,
      completedChallenges: weekProgress.filter(p => p.progress.completedAt),
      totalPoints: weekProgress.reduce((sum, p) => sum + (p.progress.pointsEarned || 0), 0),
      parentApprovalNeeded: weekProgress.filter(p => p.progress.completedAt && !p.progress.parentApproved).length
    };
  }

  // Approve a completed challenge and award points
  async approveCompletion(progressId: string, pointsAwarded: number) {
    try {
      const [updatedProgress] = await db.update(userSummerProgress)
        .set({
          parentApproved: true,
          pointsEarned: pointsAwarded
        })
        .where(eq(userSummerProgress.id, progressId))
        .returning();

      // Check if user qualifies for bonus partner reward based on progress
      await this.checkForBonusReward(updatedProgress.userId, pointsAwarded);

      return updatedProgress;
    } catch (error) {
      throw new Error('Failed to approve challenge completion');
    }
  }

  // Check if user qualifies for a bonus partner reward
  private async checkForBonusReward(userId: string, pointsEarned: number) {
    try {
      // Get user's total approved summer points
      const userTotalProgress = await db.select()
        .from(userSummerProgress)
        .where(and(
          eq(userSummerProgress.userId, userId),
          eq(userSummerProgress.parentApproved, true)
        ));

      const totalPoints = userTotalProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
      
      // Award partner rewards at milestone achievements
      const milestones = [
        { points: 100, partner: 'Starbucks', reward: '$5 Gift Card' },
        { points: 250, partner: 'Amazon', reward: '$10 Gift Card' },
        { points: 500, partner: 'Target', reward: '$15 Gift Card' },
        { points: 750, partner: 'Starbucks', reward: '$20 Gift Card' }
      ];

      const qualifiedMilestone = milestones.find(m => 
        totalPoints >= m.points && 
        (totalPoints - pointsEarned) < m.points // Just crossed this milestone
      );

      if (qualifiedMilestone) {
        await this.awardMilestoneReward(userId, qualifiedMilestone);
      }
    } catch (error) {
      console.error('Error checking for bonus reward:', error);
    }
  }

  // Award milestone reward from specific partner
  private async awardMilestoneReward(userId: string, milestone: { points: number, partner: string, reward: string }) {
    try {
      console.log(`🎁 MILESTONE REWARD! User ${userId} earned ${milestone.reward} from ${milestone.partner} for reaching ${milestone.points} summer points!`);
      
      // In real implementation, this would:
      // 1. Find the partner offer in the database
      // 2. Create a redemption record
      // 3. Use the fulfillment service to generate actual redemption codes
      // 4. Send notification to parent and child
      
      this.parentNotifications.push({
        id: `milestone_${Date.now()}`,
        parentId: 'demo-parent',
        studentId: userId,
        type: 'milestone_reward',
        title: `🎉 Milestone Reward Earned!`,
        message: `Your child earned a ${milestone.reward} from ${milestone.partner} for reaching ${milestone.points} summer kindness points!`,
        isRead: false,
        scheduledFor: new Date()
      });
    } catch (error) {
      console.error('Error awarding milestone reward:', error);
    }
  }
}

export const summerChallengeEngine = new SummerChallengeEngine();