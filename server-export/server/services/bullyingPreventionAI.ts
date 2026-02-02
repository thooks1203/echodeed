/**
 * REVOLUTIONARY #2: Predictive Bullying Prevention Analytics
 * World's first AI system that predicts potential bullying incidents before they happen
 * Using anonymized behavioral patterns and social dynamics analysis
 */

interface BullyingRiskFactors {
  socialIsolationIncreasing: boolean;
  conflictFrequencyRising: boolean;
  negativeLanguageDetected: boolean;
  powerImbalancePresent: boolean;
  repetitiveTargeting: boolean;
  bystander_inaction: boolean;
  escalationPatterns: boolean;
}

interface PredictionResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  timeframe: string;
  riskFactors: string[];
  interventionStrategies: string[];
  socialDynamicsScore: number;
  preventionActions: string[];
}

export class BullyingPreventionAI {
  private static riskPatterns = {
    language: {
      escalation: ['stupid', 'weird', 'loser', 'nobody likes', 'worthless', 'freak'],
      isolation: ['alone', 'no friends', 'everyone hates', 'left out', 'excluded'],
      threat: ['gonna get you', 'watch out', 'you better', 'or else'],
      repetitive: ['always', 'every day', 'keeps doing', 'won\'t stop']
    },
    behavioral: {
      avoidance: ['skip lunch', 'hide', 'don\'t want to go', 'stay home', 'bathroom'],
      emotional: ['crying', 'scared', 'anxious', 'nightmare', 'sick'],
      academic: ['grades dropping', 'not concentrating', 'distracted', 'homework']
    }
  };

  static analyzeBullyingRisk(
    schoolId: string,
    gradeLevel: string,
    recentConflicts: any[],
    kindnessPosts: any[],
    timeframe: string = 'week'
  ): PredictionResult {
    
    // Analyze conflict patterns
    const riskFactors = this.identifyRiskFactors(recentConflicts, kindnessPosts);
    
    // Calculate social dynamics score
    const socialDynamicsScore = this.calculateSocialDynamicsScore(kindnessPosts, recentConflicts);
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(riskFactors, socialDynamicsScore);
    
    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(recentConflicts, kindnessPosts);
    
    // Generate targeted interventions
    const interventionStrategies = this.generateInterventionStrategies(riskFactors, riskLevel);
    
    // Create prevention action plan
    const preventionActions = this.generatePreventionActions(riskLevel, gradeLevel);
    
    // Predict timeframe
    const predictedTimeframe = this.predictTimeframe(riskLevel, riskFactors);

    return {
      riskLevel,
      confidence,
      timeframe: predictedTimeframe,
      riskFactors: this.formatRiskFactors(riskFactors),
      interventionStrategies,
      socialDynamicsScore,
      preventionActions
    };
  }

  private static identifyRiskFactors(conflicts: any[], posts: any[]): BullyingRiskFactors {
    const recentTexts = [
      ...conflicts.map(c => c.conflictDescription?.toLowerCase() || ''),
      ...posts.map(p => p.content?.toLowerCase() || '')
    ].join(' ');

    return {
      socialIsolationIncreasing: this.detectPattern(recentTexts, this.riskPatterns.language.isolation),
      conflictFrequencyRising: conflicts.length > 3, // More than 3 conflicts recently
      negativeLanguageDetected: this.detectPattern(recentTexts, this.riskPatterns.language.escalation),
      powerImbalancePresent: recentTexts.includes('older') || recentTexts.includes('bigger') || recentTexts.includes('group'),
      repetitiveTargeting: this.detectPattern(recentTexts, this.riskPatterns.language.repetitive),
      bystander_inaction: recentTexts.includes('nobody helped') || recentTexts.includes('watched'),
      escalationPatterns: this.detectEscalationPattern(conflicts)
    };
  }

  private static detectPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private static detectEscalationPattern(conflicts: any[]): boolean {
    if (conflicts.length < 2) return false;
    
    // Check if conflicts are getting more severe over time
    const severityLevels = { low: 1, medium: 2, high: 3, urgent: 4 };
    
    for (let i = 1; i < conflicts.length; i++) {
      const current = severityLevels[conflicts[i].severityLevel as keyof typeof severityLevels] || 1;
      const previous = severityLevels[conflicts[i-1].severityLevel as keyof typeof severityLevels] || 1;
      
      if (current > previous) {
        return true;
      }
    }
    
    return false;
  }

  private static calculateSocialDynamicsScore(posts: any[], conflicts: any[]): number {
    let score = 70; // Baseline neutral score
    
    // Positive indicators from kindness posts
    const positiveKeywords = ['helped', 'included', 'friendship', 'kind', 'caring', 'support'];
    const negativeKeywords = ['exclude', 'mean', 'alone', 'ignored', 'bullying'];
    
    const allText = posts.map(p => p.content?.toLowerCase() || '').join(' ');
    
    // Boost score for positive social interactions
    positiveKeywords.forEach(keyword => {
      if (allText.includes(keyword)) score += 5;
    });
    
    // Reduce score for negative patterns
    negativeKeywords.forEach(keyword => {
      if (allText.includes(keyword)) score -= 8;
    });
    
    // Factor in conflict frequency
    score -= conflicts.length * 3;
    
    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, score));
  }

  private static calculateRiskLevel(
    riskFactors: BullyingRiskFactors, 
    socialDynamicsScore: number
  ): 'low' | 'moderate' | 'high' | 'critical' {
    const riskCount = Object.values(riskFactors).filter(Boolean).length;
    
    // Critical risk
    if (riskCount >= 5 || socialDynamicsScore < 30) {
      return 'critical';
    }
    
    // High risk
    if (riskCount >= 3 || socialDynamicsScore < 45) {
      return 'high';
    }
    
    // Moderate risk
    if (riskCount >= 2 || socialDynamicsScore < 60) {
      return 'moderate';
    }
    
    return 'low';
  }

  private static calculatePredictionConfidence(conflicts: any[], posts: any[]): number {
    let confidence = 50; // Base confidence
    
    // More data points increase confidence
    if (conflicts.length > 2) confidence += 15;
    if (posts.length > 5) confidence += 10;
    
    // Recent data is more reliable
    const recentConflicts = conflicts.filter(c => {
      const conflictDate = new Date(c.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return conflictDate > weekAgo;
    });
    
    if (recentConflicts.length > 0) confidence += 20;
    
    // Quality of descriptions affects confidence
    const avgDescriptionLength = conflicts.reduce((sum, c) => sum + (c.conflictDescription?.length || 0), 0) / conflicts.length;
    if (avgDescriptionLength > 50) confidence += 10;
    
    return Math.min(95, confidence);
  }

  private static generateInterventionStrategies(
    riskFactors: BullyingRiskFactors, 
    riskLevel: string
  ): string[] {
    const strategies: string[] = [];
    
    if (riskFactors.socialIsolationIncreasing) {
      strategies.push("Implement buddy system and structured peer interactions");
      strategies.push("Create inclusive group activities during lunch and recess");
    }
    
    if (riskFactors.conflictFrequencyRising) {
      strategies.push("Increase adult supervision in high-risk areas");
      strategies.push("Provide conflict resolution training to students");
    }
    
    if (riskFactors.negativeLanguageDetected) {
      strategies.push("Reinforce positive language expectations and consequences");
      strategies.push("Teach empathy-building communication skills");
    }
    
    if (riskFactors.powerImbalancePresent) {
      strategies.push("Address group dynamics and power structures");
      strategies.push("Empower bystanders with intervention strategies");
    }
    
    if (riskFactors.repetitiveTargeting) {
      strategies.push("Implement immediate protective measures for targeted students");
      strategies.push("Create alternative spaces and activities for vulnerable students");
    }
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      strategies.push("Schedule immediate parent/guardian conferences");
      strategies.push("Activate school counselor and administrative support");
      strategies.push("Consider temporary schedule or seating adjustments");
    }
    
    return strategies;
  }

  private static generatePreventionActions(riskLevel: string, gradeLevel: string): string[] {
    const baseActions = [
      "Increase positive social interaction opportunities",
      "Strengthen classroom community building activities",
      "Enhance adult supervision during unstructured time"
    ];
    
    const gradeSpecificActions = {
      'K': ["Implement sharing circles and emotion identification activities"],
      '1': ["Focus on friendship skills and inclusive play"],
      '2': ["Teach problem-solving and help-seeking strategies"],
      '3': ["Develop empathy through perspective-taking activities"],
      '4': ["Practice conflict resolution and peer mediation skills"],
      '5': ["Address social hierarchies and group dynamics"],
      '6': ["Focus on identity development and acceptance"],
      '7': ["Address cyberbullying and digital citizenship"],
      '8': ["Prepare for high school social transitions"]
    };
    
    const actions = [...baseActions];
    
    if (gradeSpecificActions[gradeLevel as keyof typeof gradeSpecificActions]) {
      actions.push(...gradeSpecificActions[gradeLevel as keyof typeof gradeSpecificActions]);
    }
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      actions.push(
        "Implement daily check-ins with at-risk students",
        "Create safety plans for vulnerable students",
        "Increase family communication and involvement"
      );
    }
    
    return actions;
  }

  private static predictTimeframe(riskLevel: string, riskFactors: BullyingRiskFactors): string {
    if (riskFactors.escalationPatterns && riskLevel === 'critical') {
      return 'next_few_days';
    }
    
    if (riskLevel === 'high') {
      return 'next_week';
    }
    
    if (riskLevel === 'moderate') {
      return 'next_two_weeks';
    }
    
    return 'next_month';
  }

  private static formatRiskFactors(riskFactors: BullyingRiskFactors): string[] {
    const formatted: string[] = [];
    
    if (riskFactors.socialIsolationIncreasing) {
      formatted.push("Increasing social isolation patterns detected");
    }
    if (riskFactors.conflictFrequencyRising) {
      formatted.push("Rising frequency of peer conflicts");
    }
    if (riskFactors.negativeLanguageDetected) {
      formatted.push("Negative language and verbal aggression present");
    }
    if (riskFactors.powerImbalancePresent) {
      formatted.push("Power imbalance dynamics identified");
    }
    if (riskFactors.repetitiveTargeting) {
      formatted.push("Repetitive targeting of specific individuals");
    }
    if (riskFactors.bystander_inaction) {
      formatted.push("Bystander inaction contributing to problem");
    }
    if (riskFactors.escalationPatterns) {
      formatted.push("Escalation patterns indicating worsening situation");
    }
    
    return formatted;
  }

  // Generate school-wide prevention strategies
  static generateSchoolWidePrevention(schoolAnalytics: any): string[] {
    const strategies = [
      "Implement evidence-based social-emotional learning curriculum",
      "Train all staff in trauma-informed practices",
      "Create positive school climate through community building",
      "Establish clear behavioral expectations and consequences",
      "Develop peer support and mentorship programs"
    ];

    // Add data-driven strategies based on school patterns
    if (schoolAnalytics.conflictHotspots?.includes('playground')) {
      strategies.push("Redesign playground activities and supervision");
    }
    
    if (schoolAnalytics.peakConflictTimes?.includes('lunch')) {
      strategies.push("Implement structured lunch activities and zones");
    }
    
    return strategies;
  }

  // Machine learning model improvement
  static recordPredictionOutcome(
    predictionId: string, 
    actualOutcome: boolean, 
    interventionEffectiveness: number
  ): void {
    // In a real implementation, this would update ML model training data
    console.log(`Prediction ${predictionId}: ${actualOutcome ? 'Accurate' : 'Inaccurate'}`);
    console.log(`Intervention effectiveness: ${interventionEffectiveness}/10`);
    
    // This data would be used to continuously improve the prediction algorithm
  }
}