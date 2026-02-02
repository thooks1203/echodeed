/**
 * Aggregate Climate Monitor Service
 * 
 * STRATEGIC PIVOT: This is a SCHOOL-WIDE ANALYTICS tool, NOT individual prediction system.
 * 
 * Purpose: Monitor aggregate behavioral health at school/grade level
 * - NO individual student predictions or targeting
 * - School-wide climate metrics only
 * - Aggregate trend analysis for system-level decisions
 * - Recommended actions are policy/program changes, NOT individual interventions
 * 
 * Key Differences from Predictive Wellness:
 * ✅ NO individual student wellness predictions
 * ✅ NO personalized interventions or prescriptions
 * ✅ Aggregate metrics only (school-wide, grade-level)
 * ✅ System-level recommendations (programs, not people)
 */

import { storage } from '../storage';
import { behavioralPatternAnalyzer } from './behavioralPatternAnalyzer';

export interface SchoolClimateMetrics {
  schoolId: string;
  metricDate: Date;
  gradeLevel?: string; // Optional grade-level breakdown (still aggregate)
  
  // Overall Climate Indicators (Aggregate)
  overallClimateScore: number; // 0-100 composite wellness score
  participationRate: number; // % of students posting
  positiveInteractionRate: number; // % of posts with positive reactions
  
  // Content Safety Indicators (Aggregate patterns)
  contentSafetyScore: number; // 0-100 (higher = safer content)
  policyViolationRate: number; // % of posts requiring moderation
  concerningPatternCount: number; // Count of detected behavioral patterns
  
  // Engagement Patterns
  avgDailyPosts: number;
  peakActivityHours: number[]; // Hours with most activity
  
  // Trend Indicators
  weekOverWeekChange: number; // % change in overall climate
  monthOverMonthChange: number;
  
  // System-Level Recommendations (NOT individual interventions)
  recommendedFocus: string[]; // e.g., ['increase_positive_content', 'review_policy_clarity']
}

export interface BehavioralTrend {
  schoolId: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  
  // Aggregate Metrics
  totalPosts: number;
  flaggedContentCount: number;
  
  // Sentiment Aggregates
  avgPositivityScore: number; // 0-100 average across all posts
  negativeContentPercentage: number;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  
  // Pattern Detection (School-wide)
  topConcernCategories: { category: string; frequency: number }[];
  emergingPatterns: string[]; // Behavioral patterns at school level
  
  // Comparison Metrics
  postCountChange: number; // % change from previous period
  sentimentScoreChange: number;
  flaggedContentChange: number;
}

export interface ClimateAlert {
  // NOTE: These are SYSTEM alerts, NOT individual crisis alerts
  id: string;
  type: 'climate_declining' | 'policy_effectiveness' | 'positive_momentum' | 'system_review_needed';
  severity: 'info' | 'attention_needed' | 'action_recommended';
  schoolId: string;
  gradeLevel?: string;
  
  title: string;
  description: string;
  
  // System-Level Recommendations (NOT individual actions)
  recommendedActions: string[];
  expectedOutcome: string;
  confidence: number;
  
  createdAt: Date;
}

export class AggregateClimateMonitorService {
  
  /**
   * Calculate school-wide climate metrics (NO individual students)
   */
  async calculateSchoolClimateMetrics(schoolId: string, dateRange?: { start: Date; end: Date }): Promise<SchoolClimateMetrics> {
    const range = dateRange || {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date()
    };

    // Get all posts for the school in date range
    const posts = await storage.getPosts({ schoolId, limit: 1000 });
    const filteredPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= range.start && postDate <= range.end;
    });

    // Get moderation queue data
    const moderationQueue = await storage.getContentModerationQueueByDateRange(schoolId, range.start, range.end);

    // Calculate aggregate metrics
    const totalPosts = filteredPosts.length;
    // Note: Reaction counts are tracked separately, using post existence as proxy for engagement
    const postsWithReactions = filteredPosts.filter(p => p.rippleEffect && p.rippleEffect > 0).length;
    const positiveInteractionRate = totalPosts > 0 ? (postsWithReactions / totalPosts) * 100 : 0;

    // Analyze content patterns
    const contentAnalyses = filteredPosts.map(post => 
      behavioralPatternAnalyzer.analyzeContent(post.content)
    );
    
    const cleanContent = contentAnalyses.filter(a => a.moderationCategory === 'clean').length;
    const contentSafetyScore = totalPosts > 0 ? (cleanContent / totalPosts) * 100 : 100;
    
    const policyViolations = moderationQueue.filter(q => q.moderationCategory === 'policy_violation').length;
    const policyViolationRate = totalPosts > 0 ? (policyViolations / totalPosts) * 100 : 0;
    
    const concerningPatterns = moderationQueue.filter(q => q.moderationCategory === 'concerning_pattern').length;

    // Calculate overall climate score (composite of multiple factors)
    const overallClimateScore = this.calculateCompositeClimateScore({
      contentSafetyScore,
      positiveInteractionRate,
      participationRate: this.calculateParticipationRate(schoolId, filteredPosts),
      policyViolationRate
    });

    // Engagement patterns
    const avgDailyPosts = totalPosts / 7; // Assuming 7-day range
    const peakActivityHours = this.calculatePeakActivityHours(filteredPosts);

    // Trend calculations
    const previousRange = {
      start: new Date(range.start.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: range.start
    };
    const previousMetrics = await storage.getClimateMetrics(schoolId, previousRange);
    const weekOverWeekChange = this.calculateTrendChange(overallClimateScore, previousMetrics[0]?.overallClimateScore || undefined);

    // System-level recommendations
    const recommendedFocus = this.generateSystemRecommendations({
      contentSafetyScore,
      policyViolationRate,
      positiveInteractionRate,
      weekOverWeekChange
    });

    return {
      schoolId,
      metricDate: new Date(),
      overallClimateScore: Math.round(overallClimateScore),
      participationRate: this.calculateParticipationRate(schoolId, filteredPosts),
      positiveInteractionRate: Math.round(positiveInteractionRate),
      contentSafetyScore: Math.round(contentSafetyScore),
      policyViolationRate: Math.round(policyViolationRate * 10) / 10, // 1 decimal
      concerningPatternCount: concerningPatterns,
      avgDailyPosts: Math.round(avgDailyPosts * 10) / 10,
      peakActivityHours,
      weekOverWeekChange: Math.round(weekOverWeekChange * 10) / 10,
      monthOverMonthChange: 0, // TODO: Calculate monthly trend
      recommendedFocus
    };
  }

  /**
   * Analyze behavioral trends at school level (NO individual tracking)
   */
  async analyzeBehavioralTrends(schoolId: string, periodType: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<BehavioralTrend> {
    const { start, end } = this.getPeriodRange(periodType);

    // Get aggregate data
    const posts = await storage.getPosts({ schoolId, limit: 1000 });
    const periodPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= start && postDate <= end;
    });

    // Analyze content patterns (aggregate only)
    const aggregatePatterns = behavioralPatternAnalyzer.extractAggregatePatterns(
      periodPosts.map(p => p.content)
    );

    // Get moderation data
    const moderationQueue = await storage.getContentModerationQueueByDateRange(schoolId, start, end);
    
    // Sentiment analysis
    const avgPositivityScore = aggregatePatterns.overallSentimentScore;
    const negativeContentPercentage = aggregatePatterns.concerningContentRate;
    
    // Determine sentiment trend
    const previousPeriod = this.getPreviousPeriodRange(periodType);
    const previousData = await storage.getBehavioralTrendAnalytics(schoolId, periodType);
    const sentimentTrend = this.determineSentimentTrend(avgPositivityScore, previousData[0]?.avgPositivityScore || undefined);

    // Pattern detection
    const topConcernCategories = aggregatePatterns.topPatternCategories;
    const previousCategories = previousData[0]?.topConcernCategories ? JSON.parse(JSON.stringify(previousData[0].topConcernCategories)) : undefined;
    const emergingPatterns = this.identifyEmergingPatterns(topConcernCategories, previousCategories);

    // Comparison metrics
    const postCountChange = this.calculateChange(periodPosts.length, previousData[0]?.totalPosts || 0);
    const sentimentScoreChange = this.calculateChange(avgPositivityScore, previousData[0]?.avgPositivityScore || 0);
    const flaggedContentChange = this.calculateChange(moderationQueue.length, previousData[0]?.flaggedContentCount || 0);

    return {
      schoolId,
      periodType,
      periodStart: start,
      periodEnd: end,
      totalPosts: periodPosts.length,
      flaggedContentCount: moderationQueue.length,
      avgPositivityScore: Math.round(avgPositivityScore),
      negativeContentPercentage: Math.round(negativeContentPercentage * 10) / 10,
      sentimentTrend,
      topConcernCategories,
      emergingPatterns,
      postCountChange: Math.round(postCountChange * 10) / 10,
      sentimentScoreChange: Math.round(sentimentScoreChange * 10) / 10,
      flaggedContentChange: Math.round(flaggedContentChange * 10) / 10
    };
  }

  /**
   * Generate system-level climate alerts (NOT individual crisis alerts)
   */
  async generateClimateAlerts(schoolId: string, metrics: SchoolClimateMetrics): Promise<ClimateAlert[]> {
    const alerts: ClimateAlert[] = [];

    // Climate declining alert
    if (metrics.weekOverWeekChange < -10) {
      alerts.push({
        id: `climate_alert_${Date.now()}`,
        type: 'climate_declining',
        severity: 'action_recommended',
        schoolId,
        title: 'School Climate Declining',
        description: `Overall climate score has decreased by ${Math.abs(metrics.weekOverWeekChange)}% this week. Multiple indicators show downward trends.`,
        recommendedActions: [
          'Review recent policy changes or school events',
          'Increase positive content campaigns',
          'Launch school-wide kindness initiatives',
          'Survey students for feedback on school climate'
        ],
        expectedOutcome: 'Improved school climate and student engagement',
        confidence: 75,
        createdAt: new Date()
      });
    }

    // Policy effectiveness alert
    if (metrics.policyViolationRate > 5) {
      alerts.push({
        id: `policy_alert_${Date.now()}`,
        type: 'policy_effectiveness',
        severity: 'attention_needed',
        schoolId,
        title: 'Content Policy Review Recommended',
        description: `${metrics.policyViolationRate}% of posts are flagged for policy violations, suggesting policies may need clarification or adjustment.`,
        recommendedActions: [
          'Review and clarify community guidelines',
          'Provide better examples of acceptable content',
          'Educate students on platform expectations',
          'Adjust automated moderation thresholds'
        ],
        expectedOutcome: 'Reduced policy violations and clearer expectations',
        confidence: 70,
        createdAt: new Date()
      });
    }

    // Positive momentum alert
    if (metrics.weekOverWeekChange > 15 && metrics.positiveInteractionRate > 70) {
      alerts.push({
        id: `positive_alert_${Date.now()}`,
        type: 'positive_momentum',
        severity: 'info',
        schoolId,
        title: 'Positive Climate Momentum',
        description: `School climate has improved ${metrics.weekOverWeekChange}% this week with ${metrics.positiveInteractionRate}% positive interaction rate.`,
        recommendedActions: [
          'Recognize and celebrate school-wide achievements',
          'Share success stories in assemblies',
          'Maintain current positive initiatives',
          'Document what\'s working for future reference'
        ],
        expectedOutcome: 'Sustained positive climate and student wellbeing',
        confidence: 85,
        createdAt: new Date()
      });
    }

    // System review needed
    if (metrics.concerningPatternCount > 20) {
      alerts.push({
        id: `system_alert_${Date.now()}`,
        type: 'system_review_needed',
        severity: 'action_recommended',
        schoolId,
        title: 'Elevated Behavioral Pattern Detection',
        description: `${metrics.concerningPatternCount} concerning behavioral patterns detected this period. System-level review recommended.`,
        recommendedActions: [
          'Review aggregate pattern reports',
          'Consult with counseling team on systemic issues',
          'Consider school-wide support programs',
          'Evaluate effectiveness of current interventions'
        ],
        expectedOutcome: 'Proactive system-level support and climate improvement',
        confidence: 65,
        createdAt: new Date()
      });
    }

    return alerts;
  }

  // Helper methods

  private calculateCompositeClimateScore(factors: {
    contentSafetyScore: number;
    positiveInteractionRate: number;
    participationRate: number;
    policyViolationRate: number;
  }): number {
    // Weighted composite score
    const safetyWeight = 0.4;
    const interactionWeight = 0.3;
    const participationWeight = 0.2;
    const violationPenalty = 0.1;

    return (
      factors.contentSafetyScore * safetyWeight +
      factors.positiveInteractionRate * interactionWeight +
      factors.participationRate * participationWeight -
      factors.policyViolationRate * violationPenalty
    );
  }

  private calculateParticipationRate(schoolId: string, posts: any[]): number {
    // TODO: Get total student count for school
    const estimatedStudentCount = 1200; // Dudley High School estimate
    const uniquePosters = new Set(posts.filter(p => p.userId).map(p => p.userId)).size;
    return (uniquePosters / estimatedStudentCount) * 100;
  }

  private calculatePeakActivityHours(posts: any[]): number[] {
    const hourCounts: Record<number, number> = {};
    posts.forEach(post => {
      const hour = new Date(post.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculateTrendChange(current: number, previous?: number): number {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  private generateSystemRecommendations(factors: {
    contentSafetyScore: number;
    policyViolationRate: number;
    positiveInteractionRate: number;
    weekOverWeekChange: number;
  }): string[] {
    const recommendations: string[] = [];

    if (factors.contentSafetyScore < 70) {
      recommendations.push('increase_content_safety_education');
    }
    if (factors.policyViolationRate > 5) {
      recommendations.push('review_policy_clarity');
    }
    if (factors.positiveInteractionRate < 50) {
      recommendations.push('promote_positive_content_campaigns');
    }
    if (factors.weekOverWeekChange < -5) {
      recommendations.push('investigate_recent_climate_changes');
    }

    return recommendations.length > 0 ? recommendations : ['maintain_current_approach'];
  }

  private getPeriodRange(periodType: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (periodType) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return { start, end };
  }

  private getPreviousPeriodRange(periodType: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
    const current = this.getPeriodRange(periodType);
    const duration = current.end.getTime() - current.start.getTime();
    
    return {
      start: new Date(current.start.getTime() - duration),
      end: current.start
    };
  }

  private determineSentimentTrend(current: number, previous?: number): 'improving' | 'declining' | 'stable' {
    if (!previous) return 'stable';
    const change = current - previous;
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private identifyEmergingPatterns(current: any[], previous?: any[]): string[] {
    if (!previous || previous.length === 0) return [];
    
    const emergingPatterns: string[] = [];
    current.forEach(curr => {
      const prev = previous.find(p => p.category === curr.category);
      if (!prev || curr.frequency > prev.frequency * 1.5) {
        emergingPatterns.push(curr.category);
      }
    });
    
    return emergingPatterns;
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

export const aggregateClimateMonitor = new AggregateClimateMonitorService();
