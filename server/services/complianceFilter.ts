/**
 * Pre-Posting Compliance Filter
 * 
 * STRATEGIC PIVOT: This is a CONTENT MODERATION tool, NOT a crisis intervention system.
 * 
 * Purpose: Filter content BEFORE posting to ensure platform compliance
 * - Block/queue inappropriate content (NO crisis alerts)
 * - Flag content for human review in moderation queue
 * - Provide immediate user feedback on policy violations
 * 
 * Key Differences from Real-Time Monitoring:
 * ✅ NO automatic crisis intervention
 * ✅ NO counselor/parent/admin alerts
 * ✅ Pre-posting filter (not post-posting monitoring)
 * ✅ Simple block/queue/approve decisions
 */

import { behavioralPatternAnalyzer } from './behavioralPatternAnalyzer';
import { storage } from '../storage';

export interface ComplianceResult {
  // Content Decision
  canPost: boolean; // Can this content be posted immediately?
  action: 'approve' | 'block' | 'queue_for_review'; // What happens to this content
  
  // User Feedback (shown to poster)
  userMessage: string; // Friendly explanation to user
  policyViolation?: string; // Specific policy violated (if any)
  
  // Moderation Context (for review queue)
  moderationCategory?: 'profanity' | 'negative_sentiment' | 'concerning_pattern' | 'policy_violation' | 'clean';
  severityLevel?: 'low' | 'medium' | 'high';
  shouldQueueForReview: boolean; // Add to moderation queue?
  reviewPriority: 'low' | 'medium' | 'high'; // Queue priority
  
  // Analytics
  detectedPatterns: string[];
  patternCategories: string[];
}

export class ComplianceFilterService {
  
  /**
   * Filter content BEFORE it's posted
   * Returns immediate decision: approve, block, or queue for review
   */
  async filterContent(
    content: string,
    context: {
      userId?: string;
      schoolId: string;
      postType: 'kindness' | 'support';
      gradeLevel?: string;
    }
  ): Promise<ComplianceResult> {
    
    // 1. Analyze content using Behavioral Pattern Analyzer
    const analysis = behavioralPatternAnalyzer.analyzeContent(content, {
      schoolId: context.schoolId,
      gradeLevel: context.gradeLevel
    });

    // 2. Make compliance decision based on analysis
    let canPost = true;
    let action: 'approve' | 'block' | 'queue_for_review' = 'approve';
    let userMessage = 'Your post has been shared!';
    let policyViolation: string | undefined;
    let shouldQueueForReview = false;
    let reviewPriority: 'low' | 'medium' | 'high' = 'low';

    // 3. Apply filtering rules (NO crisis intervention)
    
    // RULE 1: Block explicit policy violations
    if (analysis.moderationCategory === 'policy_violation' && analysis.severityLevel === 'high') {
      canPost = false;
      action = 'block';
      userMessage = 'We couldn\'t post this content because it may violate our community guidelines. Please review our platform rules and try again with different wording.';
      policyViolation = 'Explicit content policy violation';
    }
    
    // RULE 2: Queue high-severity concerning patterns for review
    else if (analysis.moderationCategory === 'concerning_pattern' && analysis.severityLevel === 'high') {
      canPost = false;
      action = 'queue_for_review';
      userMessage = 'Your post is being reviewed by our moderation team to ensure it meets community guidelines. You\'ll be notified once it\'s approved!';
      shouldQueueForReview = true;
      reviewPriority = 'high';
    }
    
    // RULE 3: Queue medium-severity policy violations for review
    else if (analysis.moderationCategory === 'policy_violation' && analysis.severityLevel === 'medium') {
      canPost = false;
      action = 'queue_for_review';
      userMessage = 'Your post is being reviewed to ensure it aligns with our community standards. This usually takes a few minutes!';
      shouldQueueForReview = true;
      reviewPriority = 'medium';
      policyViolation = 'Potential policy violation';
    }
    
    // RULE 4: Approve clean content immediately
    else if (analysis.moderationCategory === 'clean') {
      canPost = true;
      action = 'approve';
      userMessage = 'Your post has been shared!';
    }
    
    // RULE 5: Approve low-severity content but flag for monitoring
    else if (analysis.severityLevel === 'low') {
      canPost = true;
      action = 'approve';
      userMessage = 'Your post has been shared!';
      shouldQueueForReview = true; // Background monitoring, not blocking
      reviewPriority = 'low';
    }
    
    // RULE 6: Queue everything else for safety
    else {
      canPost = false;
      action = 'queue_for_review';
      userMessage = 'Your post is being reviewed by our team. We\'ll let you know soon!';
      shouldQueueForReview = true;
      reviewPriority = analysis.severityLevel === 'high' ? 'high' : 'medium';
    }

    // 4. If content should be queued, add to moderation queue
    if (shouldQueueForReview && action !== 'approve') {
      await this.addToModerationQueue({
        content,
        postType: context.postType,
        schoolId: context.schoolId,
        userId: context.userId,
        analysis,
        reviewPriority
      });
    }

    return {
      canPost,
      action,
      userMessage,
      policyViolation,
      moderationCategory: analysis.moderationCategory,
      severityLevel: analysis.severityLevel,
      shouldQueueForReview,
      reviewPriority,
      detectedPatterns: analysis.detectedPatterns,
      patternCategories: analysis.patternCategories
    };
  }

  /**
   * Add content to moderation queue for human review
   * This is ADVISORY - human makes final decision (NO automatic alerts)
   */
  private async addToModerationQueue(params: {
    content: string;
    postType: 'kindness' | 'support';
    schoolId: string;
    userId?: string;
    analysis: any;
    reviewPriority: 'low' | 'medium' | 'high';
  }): Promise<void> {
    try {
      // Create moderation queue entry
      await storage.createContentModerationQueueEntry({
        postType: params.postType,
        content: params.content,
        schoolId: params.schoolId,
        userId: params.userId || null,
        moderationCategory: params.analysis.moderationCategory,
        severityLevel: params.analysis.severityLevel,
        detectedPatterns: params.analysis.detectedPatterns,
        aiConfidence: params.analysis.confidenceScore
      });

      console.log('📋 Content queued for moderation:', {
        category: params.analysis.moderationCategory,
        severity: params.analysis.severityLevel,
        priority: params.reviewPriority,
        schoolId: params.schoolId
      });

    } catch (error) {
      console.error('Error adding to moderation queue:', error);
      // Don't fail the whole process if queue insertion fails
    }
  }

  /**
   * Quick check if content is clean (bypasses full analysis)
   * Used for performance optimization
   */
  isContentClean(content: string): boolean {
    return behavioralPatternAnalyzer.isContentClean(content);
  }

  /**
   * Get content filtering statistics (for admin dashboard)
   * Aggregate data only - NO individual student tracking
   */
  async getFilteringStats(schoolId: string, dateRange: { start: Date; end: Date }): Promise<{
    totalFiltered: number;
    blockedCount: number;
    queuedCount: number;
    approvedCount: number;
    topViolationCategories: { category: string; count: number }[];
    averageReviewTime: number; // In minutes
  }> {
    try {
      // Get moderation queue entries for date range
      const queueEntries = await storage.getContentModerationQueueByDateRange(
        schoolId,
        dateRange.start,
        dateRange.end
      );

      // Calculate aggregate statistics
      const blockedCount = queueEntries.filter(e => e.actionTaken === 'blocked').length;
      const queuedCount = queueEntries.filter(e => e.reviewStatus === 'pending' || e.reviewStatus === 'in_review').length;
      const approvedCount = queueEntries.filter(e => e.actionTaken === 'approved').length;

      // Count violation categories
      const categoryCount: Record<string, number> = {};
      queueEntries.forEach(entry => {
        categoryCount[entry.moderationCategory] = (categoryCount[entry.moderationCategory] || 0) + 1;
      });

      const topViolationCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average review time
      const reviewedEntries = queueEntries.filter(e => e.reviewedAt && e.flaggedAt);
      const avgReviewTime = reviewedEntries.length > 0
        ? reviewedEntries.reduce((sum, entry) => {
            const reviewTime = new Date(entry.reviewedAt!).getTime() - new Date(entry.flaggedAt).getTime();
            return sum + reviewTime;
          }, 0) / reviewedEntries.length / 60000 // Convert to minutes
        : 0;

      return {
        totalFiltered: queueEntries.length,
        blockedCount,
        queuedCount,
        approvedCount,
        topViolationCategories,
        averageReviewTime: Math.round(avgReviewTime)
      };

    } catch (error) {
      console.error('Error getting filtering stats:', error);
      return {
        totalFiltered: 0,
        blockedCount: 0,
        queuedCount: 0,
        approvedCount: 0,
        topViolationCategories: [],
        averageReviewTime: 0
      };
    }
  }
}

export const complianceFilter = new ComplianceFilterService();
