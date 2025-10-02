/**
 * Behavioral Pattern Analyzer Service
 * 
 * STRATEGIC PIVOT: This is a DECISION-SUPPORT tool, NOT a crisis intervention system.
 * 
 * Purpose: Classify content for moderation and detect aggregate behavioral patterns
 * - Flags content for HUMAN REVIEW (no automatic alerts)
 * - Detects patterns for TREND ANALYTICS (not individual targeting)
 * - Provides CLASSIFICATION (not crisis scoring)
 * 
 * Key Differences from Crisis Detection:
 * ✅ NO automatic crisis intervention
 * ✅ NO emergency alerts or mandatory reporting
 * ✅ Human administrators make final decisions
 * ✅ Focus on aggregate patterns, not individual students
 */

export interface BehavioralAnalysisResult {
  // Content Classification (for moderation queue)
  moderationCategory: 'profanity' | 'negative_sentiment' | 'concerning_pattern' | 'policy_violation' | 'clean';
  severityLevel: 'low' | 'medium' | 'high'; // NO 'critical' or 'crisis'
  shouldFlag: boolean; // Flag for human review, NOT automatic intervention
  
  // Pattern Detection (for aggregate analytics)
  detectedPatterns: string[]; // Anonymized behavioral patterns
  patternCategories: string[]; // For trend tracking: 'emotional_distress', 'social_conflict', 'academic_stress'
  
  // Confidence & Context
  confidenceScore: number; // 0-100
  requiresHumanReview: boolean; // Queue for teacher/admin, NOT automatic action
  suggestedReviewNotes: string; // Context for human reviewer
}

export class BehavioralPatternAnalyzer {
  
  // POLICY VIOLATION PATTERNS - Content that violates platform rules
  private policyViolationPatterns = [
    // Explicit profanity
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap',
    
    // Hate speech indicators
    'hate you', 'kill yourself', 'worthless', 'pathetic loser',
    
    // Harassment language
    'threatening', 'cyberbullying', 'spreading rumors', 'dox',
    
    // Inappropriate content
    'explicit content', 'sexual content', 'drug dealing'
  ];

  // CONCERNING PATTERNS - Behavioral patterns needing monitoring (aggregate level)
  private concerningPatterns = {
    emotional_distress: [
      'feeling hopeless', 'overwhelmed', 'cant cope', 'breaking down',
      'severe anxiety', 'panic attacks', 'depressed', 'isolated',
      'nobody cares', 'give up', 'no point'
    ],
    social_conflict: [
      'bullying', 'threatened', 'scared at school', 'afraid',
      'excluded', 'left out', 'no friends', 'everyone hates me',
      'rumors about me', 'cyberbullying'
    ],
    academic_stress: [
      'failing', 'too much pressure', 'cant keep up', 'disappointing parents',
      'test anxiety', 'academic pressure', 'stressed about grades'
    ],
    family_issues: [
      'parents fighting', 'family problems', 'violence at home',
      'afraid at home', 'family stress', 'divorce'
    ]
  };

  // NEGATIVE SENTIMENT INDICATORS - Content with negative tone
  private negativeSentimentIndicators = [
    'terrible', 'awful', 'horrible', 'worst', 'hate',
    'angry', 'furious', 'upset', 'frustrated', 'annoyed'
  ];

  /**
   * Analyze content for behavioral patterns and moderation needs
   * Returns classification for human review queue (NO automatic alerts)
   */
  analyzeContent(content: string, context?: { schoolId?: string; gradeLevel?: string }): BehavioralAnalysisResult {
    const lowerContent = content.toLowerCase();
    const detectedPatterns: string[] = [];
    const patternCategories: string[] = [];
    let moderationCategory: 'profanity' | 'negative_sentiment' | 'concerning_pattern' | 'policy_violation' | 'clean' = 'clean';
    let severityLevel: 'low' | 'medium' | 'high' = 'low';
    let severityScore = 0;

    // 1. Check for Policy Violations (highest priority for moderation)
    for (const pattern of this.policyViolationPatterns) {
      if (lowerContent.includes(pattern)) {
        detectedPatterns.push(pattern);
        severityScore += 30;
        moderationCategory = 'policy_violation';
      }
    }

    // 2. Check for Concerning Behavioral Patterns (for aggregate trend analysis)
    for (const [category, patterns] of Object.entries(this.concerningPatterns)) {
      for (const pattern of patterns) {
        if (lowerContent.includes(pattern)) {
          detectedPatterns.push(pattern);
          patternCategories.push(category);
          severityScore += 20;
          if (moderationCategory === 'clean') {
            moderationCategory = 'concerning_pattern';
          }
        }
      }
    }

    // 3. Check for Negative Sentiment
    for (const indicator of this.negativeSentimentIndicators) {
      if (lowerContent.includes(indicator)) {
        detectedPatterns.push(indicator);
        severityScore += 10;
        if (moderationCategory === 'clean') {
          moderationCategory = 'negative_sentiment';
        }
      }
    }

    // 4. Pattern intensity analysis (for severity classification)
    severityScore += this.analyzePatternIntensity(lowerContent, detectedPatterns);

    // 5. Classify severity (for human review prioritization)
    if (severityScore >= 60) {
      severityLevel = 'high';
    } else if (severityScore >= 30) {
      severityLevel = 'medium';
    } else if (severityScore > 0) {
      severityLevel = 'low';
    }

    // 6. Determine if human review is needed
    const requiresHumanReview = severityScore >= 30 || moderationCategory === 'policy_violation';
    const shouldFlag = requiresHumanReview;

    // 7. Generate context for human reviewer (NOT automatic action)
    const suggestedReviewNotes = this.generateReviewContext(
      moderationCategory,
      severityLevel,
      patternCategories
    );

    // 8. Calculate confidence (based on pattern matching clarity)
    const confidenceScore = Math.min(
      75 + (detectedPatterns.length * 5),
      95
    );

    return {
      moderationCategory,
      severityLevel,
      shouldFlag,
      detectedPatterns,
      patternCategories: Array.from(new Set(patternCategories)), // Remove duplicates
      confidenceScore,
      requiresHumanReview,
      suggestedReviewNotes
    };
  }

  /**
   * Analyze pattern intensity for additional context
   */
  private analyzePatternIntensity(content: string, patterns: string[]): number {
    let intensityScore = 0;

    // Multiple concerning patterns in same message
    if (patterns.length > 2) intensityScore += 15;

    // Repeated pattern indicators
    const uniquePatterns = new Set(patterns);
    if (patterns.length > uniquePatterns.size) intensityScore += 10;

    // Intensity language
    const intensifiers = ['very', 'extremely', 'really', 'so much', 'always', 'never'];
    if (intensifiers.some(word => content.includes(word))) {
      intensityScore += 8;
    }

    return intensityScore;
  }

  /**
   * Generate contextual notes for human reviewer
   * This is ADVISORY only - human makes final decision
   */
  private generateReviewContext(
    category: string,
    severity: string,
    patternCategories: string[]
  ): string {
    if (category === 'policy_violation') {
      return `Content contains language that may violate platform policies. Severity: ${severity}. Recommended: Review for policy compliance.`;
    }

    if (category === 'concerning_pattern') {
      const patterns = patternCategories.join(', ');
      return `Detected behavioral patterns: ${patterns}. Severity: ${severity}. Recommended: Review context and consider appropriate support resources if needed.`;
    }

    if (category === 'negative_sentiment') {
      return `Content contains negative sentiment. Severity: ${severity}. Recommended: Review if this aligns with platform tone guidelines.`;
    }

    return `Content flagged for review. Severity: ${severity}.`;
  }

  /**
   * Extract aggregate behavioral insights for trend analytics
   * Returns anonymized pattern data (NO individual student identification)
   */
  extractAggregatePatterns(contentSamples: string[]): {
    topPatternCategories: { category: string; frequency: number }[];
    overallSentimentScore: number; // 0-100 (higher = more positive)
    policyViolationRate: number; // Percentage
    concerningContentRate: number; // Percentage
  } {
    const categoryCount: Record<string, number> = {};
    let totalPositive = 0;
    let totalNegative = 0;
    let policyViolations = 0;
    let concerningContent = 0;

    for (const content of contentSamples) {
      const analysis = this.analyzeContent(content);
      
      // Count pattern categories
      for (const category of analysis.patternCategories) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }

      // Track sentiment
      if (analysis.moderationCategory === 'clean') {
        totalPositive++;
      } else {
        totalNegative++;
      }

      // Track violations and concerns
      if (analysis.moderationCategory === 'policy_violation') {
        policyViolations++;
      }
      if (analysis.moderationCategory === 'concerning_pattern') {
        concerningContent++;
      }
    }

    // Calculate aggregate metrics
    const topPatternCategories = Object.entries(categoryCount)
      .map(([category, frequency]) => ({ category, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const overallSentimentScore = Math.round(
      (totalPositive / (totalPositive + totalNegative)) * 100
    );

    const policyViolationRate = (policyViolations / contentSamples.length) * 100;
    const concerningContentRate = (concerningContent / contentSamples.length) * 100;

    return {
      topPatternCategories,
      overallSentimentScore,
      policyViolationRate,
      concerningContentRate
    };
  }

  /**
   * Check if content is clean (no moderation needed)
   */
  isContentClean(content: string): boolean {
    const analysis = this.analyzeContent(content);
    return analysis.moderationCategory === 'clean';
  }

  /**
   * Get pattern categories for trend tracking
   */
  getPatternCategories(): string[] {
    return Object.keys(this.concerningPatterns);
  }
}

export const behavioralPatternAnalyzer = new BehavioralPatternAnalyzer();
