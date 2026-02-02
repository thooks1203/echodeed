import { db } from "./db";
import { users, mentorships, mentorActivities, mentorStats, mentorBadgeAwards, mentorBadges } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function initializeMentorSampleData() {
  console.log('🎓 Initializing mentor sample data...');

  try {
    // Create mentor user (demo)
    const mentorUserId = 'mentor-001';
    
    // Check if mentor exists
    const existingMentor = await db.select().from(users).where(eq(users.id, mentorUserId)).limit(1);
    
    if (existingMentor.length === 0) {
      await db.insert(users).values({
        id: mentorUserId,
        email: 'alex.mentor@echodeed.com',
        firstName: 'Alex',
        lastName: 'Chen',
        schoolRole: 'student',
        schoolId: 'eastern-guilford-hs',
        grade: '11',
      });
      console.log('✓ Created demo mentor user: Alex Chen');
    }

    // Create 3 mentee users
    const menteeUsers = [
      {
        id: 'mentee-001',
        email: 'jasmine.smith@echodeed.com',
        firstName: 'Jasmine',
        lastName: 'Smith',
        schoolRole: 'student' as const,
        schoolId: 'eastern-guilford-hs',
        grade: '9',
      },
      {
        id: 'mentee-002',
        email: 'marcus.brown@echodeed.com',
        firstName: 'Marcus',
        lastName: 'Brown',
        schoolRole: 'student' as const,
        schoolId: 'eastern-guilford-hs',
        grade: '10',
      },
      {
        id: 'mentee-003',
        email: 'emily.johnson@echodeed.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        schoolRole: 'student' as const,
        schoolId: 'eastern-guilford-hs',
        grade: '9',
      },
    ];

    for (const mentee of menteeUsers) {
      const existing = await db.select().from(users).where(eq(users.id, mentee.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(users).values(mentee);
        console.log(`✓ Created mentee: ${mentee.firstName} ${mentee.lastName}`);
      }
    }

    // Create mentorships
    const mentorshipsData = [
      {
        id: 'mentorship-001',
        mentorId: mentorUserId,
        menteeId: 'mentee-001',
        status: 'active' as const,
        kindnessGoal: 'Help spread kindness in the cafeteria during lunch',
        progressNotes: 'Jasmine is doing great! She\'ve organized 3 acts of kindness this week.',
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextSessionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        totalSessions: 8,
        menteeSatisfaction: 5,
      },
      {
        id: 'mentorship-002',
        mentorId: mentorUserId,
        menteeId: 'mentee-002',
        status: 'active' as const,
        kindnessGoal: 'Create a peer support group for new students',
        progressNotes: 'Marcus has shown great leadership. Planning first group session.',
        startedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        nextSessionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalSessions: 5,
        menteeSatisfaction: 4,
      },
      {
        id: 'mentorship-003',
        mentorId: mentorUserId,
        menteeId: 'mentee-003',
        status: 'completed' as const,
        kindnessGoal: 'Organize welcome bags for transfer students',
        progressNotes: 'Successfully completed! Emily created 15 welcome bags with notes.',
        startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        totalSessions: 6,
        menteeSatisfaction: 5,
      },
    ];

    for (const mentorship of mentorshipsData) {
      const existing = await db.select().from(mentorships).where(eq(mentorships.id, mentorship.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(mentorships).values(mentorship);
        console.log(`✓ Created mentorship with ${mentorship.kindnessGoal.substring(0, 30)}...`);
      }
    }

    // Create mentor activities
    const activitiesData = [
      // Upcoming activities
      {
        mentorshipId: 'mentorship-001',
        activityType: 'check-in',
        description: 'Weekly progress check-in with Jasmine',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isCompleted: false,
      },
      {
        mentorshipId: 'mentorship-002',
        activityType: 'planning',
        description: 'Plan first peer support group meeting with Marcus',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isCompleted: false,
      },
      // Completed activities
      {
        mentorshipId: 'mentorship-001',
        activityType: 'reflection',
        description: 'Reflect on cafeteria kindness campaign',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        mentorReflection: 'Jasmine showed great initiative in getting others involved',
        menteeReflection: 'I learned that small acts can inspire bigger movements',
        kindnessActDiscussed: 'Organized "compliment cards" for students eating alone',
      },
      {
        mentorshipId: 'mentorship-002',
        activityType: 'problem-solving',
        description: 'Discuss strategies for engaging shy students',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        mentorReflection: 'Marcus is becoming more confident in his leadership approach',
        menteeReflection: 'Learned to create safe spaces for quiet students to participate',
        kindnessActDiscussed: 'One-on-one welcome sessions for new students',
      },
      {
        mentorshipId: 'mentorship-003',
        activityType: 'check-in',
        description: 'Final celebration session with Emily',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        mentorReflection: 'Emily exceeded all expectations! Proud of her growth.',
        menteeReflection: 'This mentorship taught me that kindness is about action, not just words',
        kindnessActDiscussed: 'Delivered 15 welcome bags with personal notes to new students',
      },
    ];

    for (const activity of activitiesData) {
      await db.insert(mentorActivities).values(activity);
    }
    console.log(`✓ Created ${activitiesData.length} mentor activities`);

    // Create or update mentor stats
    const statsData = {
      mentorId: mentorUserId,
      totalMentees: 3,
      activeMentorships: 2,
      totalSessions: 19, // 8 + 5 + 6
      avgRating: '4.67', // (5 + 4 + 5) / 3
      totalKindnessActsGuided: 23,
      totalTokensEarned: 850,
      badgesEarned: 3,
      mentorLevel: 2,
      nextLevelProgress: 65, // 65% to level 3
      impactScore: 450,
    };

    const existingStats = await db.select().from(mentorStats).where(eq(mentorStats.mentorId, mentorUserId)).limit(1);
    if (existingStats.length === 0) {
      await db.insert(mentorStats).values(statsData);
      console.log('✓ Created mentor stats for Alex Chen');
    } else {
      await db.update(mentorStats)
        .set(statsData)
        .where(eq(mentorStats.mentorId, mentorUserId));
      console.log('✓ Updated mentor stats for Alex Chen');
    }

    // Award some badges to the mentor
    const availableBadges = await db.select().from(mentorBadges).limit(3);
    
    if (availableBadges.length > 0) {
      for (let i = 0; i < Math.min(3, availableBadges.length); i++) {
        const badge = availableBadges[i];
        const existing = await db.select()
          .from(mentorBadgeAwards)
          .where(
            and(
              eq(mentorBadgeAwards.badgeId, badge.id),
              eq(mentorBadgeAwards.mentorId, mentorUserId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(mentorBadgeAwards).values({
            badgeId: badge.id,
            mentorId: mentorUserId,
            awardedBy: 'system',
            evidence: 'Demonstrated excellence in peer mentoring',
            tokenAwarded: badge.tokenReward,
            awardedAt: new Date(Date.now() - (30 - i * 10) * 24 * 60 * 60 * 1000), // Staggered dates
          });
        }
      }
      console.log('✓ Awarded mentor badges');
    }

    console.log('✅ Mentor sample data initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing mentor sample data:', error);
  }
}
