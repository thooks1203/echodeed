import { db } from '../db';
import { users, kindnessPosts, communityServiceLogs, tokenTransactions, adminRewardRedemptions, schoolInclusionScores, schoolInclusionTrendDaily } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

interface ComponentScores {
  participation: number; // 0-35
  diversity: number; // 0-15
  sentiment: number; // 0-20
  serviceVelocity: number; // 0-15
  engagement: number; // 0-15
}

interface InclusionScoreResult {
  score: number; // 0-100
  components: ComponentScores;
  breakdown: {
    participationRate: number;
    kindnessDiversityScore: number;
    positiveClimateScore: number;
    serviceCompletionRate: number;
    engagementScore: number;
  };
  qualitativeBand: 'needs_action' | 'watch' | 'healthy' | 'thriving';
  activeStudentCount: number;
  totalKindnessPosts: number;
  topInclusionActs: Array<{ category: string; count: number }>;
}

/**
 * Inclusion Score Calculator Service
 * 
 * Calculates real-time school climate and belonging metric (0-100) based on:
 * 1. Student Participation (35%): unique posters ÷ active students
 * 2. Kindness Diversity (15%): entropy across categories
 * 3. Positive Climate Sentiment (20%): positive vs concerning posts
 * 4. Service Completion Velocity (15%): verified hours ÷ goal pace
 * 5. Engagement Follow-Through (15%): recent token redemptions & events
 */
export async function calculateInclusionScore(schoolId: string, daysLookback: number = 30): Promise<InclusionScoreResult> {
  try {
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - daysLookback);

    // 1. PARTICIPATION COMPONENT (35 points max)
    // Get active students (those enrolled in the school)
    const activeStudents = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.schoolId, schoolId),
          eq(users.schoolRole, 'student')
        )
      );

    const activeStudentCount = activeStudents.length || 1; // Avoid division by zero

    // Get unique posters in the last N days
    const uniquePosters = await db
      .selectDistinct({ userId: kindnessPosts.userId })
      .from(kindnessPosts)
      .where(
        and(
          eq(kindnessPosts.schoolId, schoolId),
          gte(kindnessPosts.createdAt, lookbackDate)
        )
      );

    const participationRate = (uniquePosters.length / activeStudentCount) * 100;
    const participationScore = Math.min(35, (participationRate / 100) * 35); // Max 35 points

    // 2. KINDNESS DIVERSITY COMPONENT (15 points max)
    // Calculate entropy across categories
    const categoryCounts = await db
      .select({ 
        category: kindnessPosts.category,
        count: sql<number>`count(*)::int`
      })
      .from(kindnessPosts)
      .where(
        and(
          eq(kindnessPosts.schoolId, schoolId),
          gte(kindnessPosts.createdAt, lookbackDate)
        )
      )
      .groupBy(kindnessPosts.category);

    const totalPosts = categoryCounts.reduce((sum, cat) => sum + cat.count, 0) || 1;
    
    // Calculate Shannon entropy for diversity
    let entropy = 0;
    for (const cat of categoryCounts) {
      const probability = cat.count / totalPosts;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    
    // Normalize entropy (max entropy for 8 categories is ~3)
    const maxEntropy = Math.log2(Math.max(categoryCounts.length, 1));
    const normalizedDiversity = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
    const diversityScore = Math.min(15, (normalizedDiversity / 100) * 15); // Max 15 points

    // 3. POSITIVE CLIMATE SENTIMENT (20 points max)
    // Count posts that are positive vs concerning
    const allPosts = await db
      .select({ content: kindnessPosts.content })
      .from(kindnessPosts)
      .where(
        and(
          eq(kindnessPosts.schoolId, schoolId),
          gte(kindnessPosts.createdAt, lookbackDate)
        )
      );

    // Simple sentiment: Check for positive keywords
    const positiveKeywords = ['helped', 'thanked', 'shared', 'listened', 'supported', 'included', 'welcomed', 'encouraged', 'appreciated'];
    const concerningKeywords = ['alone', 'excluded', 'ignored', 'sad', 'worried'];
    
    let positiveCount = 0;
    let concerningCount = 0;
    
    for (const post of allPosts) {
      const content = (post.content || '').toLowerCase();
      if (positiveKeywords.some(kw => content.includes(kw))) positiveCount++;
      if (concerningKeywords.some(kw => content.includes(kw))) concerningCount++;
    }
    
    const totalAnalyzed = allPosts.length || 1;
    const positiveRatio = (positiveCount / totalAnalyzed) * 100;
    const sentimentScore = Math.min(20, (positiveRatio / 100) * 20); // Max 20 points

    // 4. SERVICE COMPLETION VELOCITY (15 points max)
    // Calculate verified hours vs annual goal pace
    const serviceStats = await db
      .select({
        totalVerified: sql<number>`sum(CAST(${communityServiceLogs.hoursLogged} AS NUMERIC))::float`,
        studentCount: sql<number>`count(distinct ${communityServiceLogs.userId})::int`
      })
      .from(communityServiceLogs)
      .where(
        and(
          eq(communityServiceLogs.schoolId, schoolId),
          eq(communityServiceLogs.verificationStatus, 'verified'),
          gte(communityServiceLogs.serviceDate, lookbackDate)
        )
      );

    const verifiedHours = serviceStats[0]?.totalVerified || 0;
    const serviceStudentCount = serviceStats[0]?.studentCount || 1;
    
    // Assume 200-hour diploma goal over 4 years = ~50 hours/year
    const annualGoalPerStudent = 50;
    const paceExpected = (annualGoalPerStudent / 365) * daysLookback;
    const avgHoursPerStudent = verifiedHours / serviceStudentCount;
    const completionRate = Math.min(100, (avgHoursPerStudent / paceExpected) * 100);
    const serviceVelocityScore = Math.min(15, (completionRate / 100) * 15); // Max 15 points

    // 5. ENGAGEMENT FOLLOW-THROUGH (15 points max)
    // Recent token redemptions + activity
    const recentRedemptions = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminRewardRedemptions)
      .where(
        and(
          eq(adminRewardRedemptions.schoolId, schoolId),
          gte(adminRewardRedemptions.createdAt, lookbackDate)
        )
      );

    const redemptionCount = recentRedemptions[0]?.count || 0;
    const redemptionRate = Math.min(100, (redemptionCount / activeStudentCount) * 100);
    const engagementScore = Math.min(15, (redemptionRate / 100) * 15); // Max 15 points

    // CALCULATE COMPOSITE SCORE
    const totalScore = Math.round(
      participationScore +
      diversityScore +
      sentimentScore +
      serviceVelocityScore +
      engagementScore
    );

    // Determine qualitative band
    let qualitativeBand: 'needs_action' | 'watch' | 'healthy' | 'thriving';
    if (totalScore < 55) qualitativeBand = 'needs_action';
    else if (totalScore < 70) qualitativeBand = 'watch';
    else if (totalScore < 85) qualitativeBand = 'healthy';
    else qualitativeBand = 'thriving';

    // Get top inclusion acts (top 5 categories)
    const topInclusionActs = categoryCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(cat => ({ category: cat.category, count: cat.count }));

    return {
      score: totalScore,
      components: {
        participation: Math.round(participationScore),
        diversity: Math.round(diversityScore),
        sentiment: Math.round(sentimentScore),
        serviceVelocity: Math.round(serviceVelocityScore),
        engagement: Math.round(engagementScore)
      },
      breakdown: {
        participationRate: Math.round(participationRate * 100) / 100,
        kindnessDiversityScore: Math.round(normalizedDiversity * 100) / 100,
        positiveClimateScore: Math.round(positiveRatio * 100) / 100,
        serviceCompletionRate: Math.round(completionRate * 100) / 100,
        engagementScore: Math.round(redemptionRate * 100) / 100
      },
      qualitativeBand,
      activeStudentCount,
      totalKindnessPosts: totalPosts,
      topInclusionActs
    };
  } catch (error) {
    console.error('Error calculating inclusion score:', error);
    // Return fallback score
    return {
      score: 0,
      components: { participation: 0, diversity: 0, sentiment: 0, serviceVelocity: 0, engagement: 0 },
      breakdown: {
        participationRate: 0,
        kindnessDiversityScore: 0,
        positiveClimateScore: 0,
        serviceCompletionRate: 0,
        engagementScore: 0
      },
      qualitativeBand: 'needs_action',
      activeStudentCount: 0,
      totalKindnessPosts: 0,
      topInclusionActs: []
    };
  }
}

// In-memory cache with 15-minute TTL
const scoreCache = new Map<string, { score: InclusionScoreResult; expiresAt: number }>();

export async function getInclusionScoreWithCache(schoolId: string, forceFresh: boolean = false): Promise<InclusionScoreResult> {
  const cacheKey = `school:${schoolId}`;
  const now = Date.now();

  // Check cache
  if (!forceFresh && scoreCache.has(cacheKey)) {
    const cached = scoreCache.get(cacheKey)!;
    if (cached.expiresAt > now) {
      console.log(`📊 Inclusion Score cache HIT for ${schoolId}`);
      return cached.score;
    }
  }

  // Calculate fresh score
  console.log(`📊 Calculating fresh Inclusion Score for ${schoolId}...`);
  const score = await calculateInclusionScore(schoolId);
  
  // Cache for 15 minutes
  scoreCache.set(cacheKey, {
    score,
    expiresAt: now + (15 * 60 * 1000)
  });

  return score;
}

/**
 * Save daily snapshot for trend tracking (called by nightly cron job)
 */
export async function saveDailySnapshot(schoolId: string): Promise<void> {
  try {
    const score = await calculateInclusionScore(schoolId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get scores from 7 and 30 days ago for delta calculation
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [weekOldScore] = await db
      .select({ score: schoolInclusionTrendDaily.score })
      .from(schoolInclusionTrendDaily)
      .where(
        and(
          eq(schoolInclusionTrendDaily.schoolId, schoolId),
          eq(schoolInclusionTrendDaily.date, weekAgo)
        )
      )
      .limit(1);

    const [monthOldScore] = await db
      .select({ score: schoolInclusionTrendDaily.score })
      .from(schoolInclusionTrendDaily)
      .where(
        and(
          eq(schoolInclusionTrendDaily.schoolId, schoolId),
          eq(schoolInclusionTrendDaily.date, monthAgo)
        )
      )
      .limit(1);

    const weekDelta = weekOldScore ? score.score - weekOldScore.score : null;
    const monthDelta = monthOldScore ? score.score - monthOldScore.score : null;

    await db.insert(schoolInclusionTrendDaily).values({
      schoolId,
      date: today,
      score: score.score,
      componentBreakdown: score.components,
      qualitativeBand: score.qualitativeBand,
      weekDelta: weekDelta as number | null,
      monthDelta: monthDelta as number | null
    });

    console.log(`✅ Saved daily Inclusion Score snapshot for ${schoolId}: ${score.score}/100`);
  } catch (error) {
    console.error(`Failed to save daily snapshot for ${schoolId}:`, error);
  }
}

/**
 * Get historical trend data
 */
export async function getHistoricalTrends(schoolId: string, daysBack: number = 90): Promise<any[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const trends = await db
      .select()
      .from(schoolInclusionTrendDaily)
      .where(
        and(
          eq(schoolInclusionTrendDaily.schoolId, schoolId),
          gte(schoolInclusionTrendDaily.date, startDate)
        )
      )
      .orderBy(desc(schoolInclusionTrendDaily.date));

    return trends;
  } catch (error) {
    console.error('Error fetching historical trends:', error);
    return [];
  }
}
