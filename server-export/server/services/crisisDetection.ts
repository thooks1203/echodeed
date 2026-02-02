/**
 * Crisis Detection and Intervention Service
 * 
 * This service analyzes anonymous student support posts for signs of:
 * - Self-harm or suicidal ideation
 * - Abuse or violence
 * - Bullying or harassment
 * - Mental health crises
 * 
 * It classifies content into safety levels and triggers appropriate interventions.
 */

export interface CrisisAnalysisResult {
  safetyLevel: 'Safe' | 'Sensitive' | 'High_Risk' | 'Crisis';
  crisisScore: number; // 0-100
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  isCrisis: boolean;
  detectedKeywords: string[];
  recommendedAction: string;
  requiresIntervention: boolean; // Fixed typo: was requiresImmedateIntervention
  shouldHideFromPublic: boolean;
  emergencyResources: EmergencyResource[];
}

export interface EmergencyResource {
  title: string;
  description: string;
  contactInfo: string;
  category: 'suicide' | 'abuse' | 'mental_health' | 'crisis' | 'local';
  isPriority: boolean;
  availableHours: string;
}

export class CrisisDetectionService {
  // CRISIS-LEVEL KEYWORDS - Immediate danger
  private crisisKeywords = [
    // Suicide/Self-harm
    'kill myself', 'want to die', 'end my life', 'suicide', 'suicidal', 
    'not worth living', 'better off dead', 'going to kill', 'plan to die',
    'want to hurt myself', 'cutting myself', 'self harm', 'self-harm',
    'overdose', 'pills to die', 'hanging myself', 'jump off',
    
    // Violence/Abuse
    'going to hurt', 'plan to hurt', 'kill someone', 'murder', 'violent thoughts',
    'abuse at home', 'being abused', 'touched inappropriately', 'sexual abuse',
    'hitting me', 'beating me', 'violence at home', 'fear for my life',
    'threatening to hurt', 'bring a weapon', 'school shooting',
    
    // Immediate danger phrases
    'tonight i will', 'today i plan', 'going to do it', 'cant take it anymore',
    'final decision', 'goodbye forever', 'last time posting'
  ];

  // HIGH RISK KEYWORDS - Serious concerns requiring intervention
  private highRiskKeywords = [
    // Mental health crisis
    'severe depression', 'cant stop crying', 'panic attacks daily', 'psychotic',
    'hearing voices', 'seeing things', 'losing my mind', 'going crazy',
    'breakdown', 'mental breakdown', 'cant function', 'cant get out of bed',
    
    // Bullying/Harassment
    'bullying me', 'threatening me', 'scared at school', 'afraid to go home',
    'cyberbullying', 'online harassment', 'spreading rumors', 'making fun of me',
    'nobody likes me', 'everyone hates me', 'isolated', 'no friends',
    
    // Abuse indicators
    'afraid of dad', 'scared of mom', 'stepparent hits', 'family violence',
    'domestic violence', 'inappropriate touching', 'makes me uncomfortable',
    'dont want to go home', 'afraid at home', 'hiding bruises',
    
    // Substance abuse
    'drinking every day', 'using drugs', 'addicted to', 'overdosed',
    'prescription pills', 'cutting to cope', 'starving myself', 'eating disorder'
  ];

  // SENSITIVE KEYWORDS - Concerns that need monitoring
  private sensitiveKeywords = [
    // Emotional distress
    'really sad', 'feeling hopeless', 'overwhelmed', 'stressed out',
    'anxious all the time', 'panic attacks', 'cant sleep', 'nightmares',
    'feeling alone', 'lonely', 'isolated', 'depressed', 'sad all the time',
    
    // Social issues
    'no friends', 'left out', 'ignored', 'rejected', 'embarrassed',
    'humiliated', 'made fun of', 'teased', 'picked on', 'excluded',
    
    // Family issues
    'parents fighting', 'divorce', 'family problems', 'parents argue',
    'stressed at home', 'family stress', 'money problems', 'moving schools',
    
    // Academic stress
    'failing classes', 'too much homework', 'cant keep up', 'academic pressure',
    'test anxiety', 'performance anxiety', 'disappointing parents'
  ];

  // Emergency resources with immediate access
  private emergencyResources: EmergencyResource[] = [
    {
      title: "988 Suicide & Crisis Lifeline",
      description: "24/7 free and confidential support for people in distress",
      contactInfo: "Call or text 988",
      category: "suicide",
      isPriority: true,
      availableHours: "24/7"
    },
    {
      title: "Crisis Text Line",
      description: "Free, 24/7 support via text message",
      contactInfo: "Text HOME to 741741",
      category: "crisis",
      isPriority: true,
      availableHours: "24/7"
    },
    {
      title: "National Child Abuse Hotline",
      description: "24/7 support for child abuse situations",
      contactInfo: "1-800-4-A-CHILD (1-800-422-4453)",
      category: "abuse",
      isPriority: true,
      availableHours: "24/7"
    },
    {
      title: "Teen Line",
      description: "Teens helping teens - peer support hotline",
      contactInfo: "Call 310-855-4673 or text TEEN to 839863",
      category: "mental_health",
      isPriority: false,
      availableHours: "6 PM - 10 PM PST"
    },
    {
      title: "Your School Counselor",
      description: "Immediate on-campus support and resources",
      contactInfo: "Visit the counseling office or ask a teacher",
      category: "local",
      isPriority: false,
      availableHours: "School hours"
    }
  ];

  /**
   * Analyzes support post content for crisis indicators
   */
  analyzeCrisisRisk(content: string): CrisisAnalysisResult {
    const lowerContent = content.toLowerCase();
    const detectedKeywords: string[] = [];
    let crisisScore = 0;
    let safetyLevel: 'Safe' | 'Sensitive' | 'High_Risk' | 'Crisis' = 'Safe';
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for crisis-level keywords
    for (const keyword of this.crisisKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
        crisisScore += 35; // High weight for crisis keywords
      }
    }

    // Check for high-risk keywords
    for (const keyword of this.highRiskKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
        crisisScore += 20; // Medium weight for high-risk keywords
      }
    }

    // Check for sensitive keywords
    for (const keyword of this.sensitiveKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
        crisisScore += 10; // Lower weight for sensitive keywords
      }
    }

    // Additional pattern analysis
    crisisScore += this.analyzePatterns(lowerContent);

    // Cap the score at 100
    crisisScore = Math.min(crisisScore, 100);

    // Classify safety level based on score and keyword types
    if (crisisScore >= 70 || this.hasCrisisKeywords(detectedKeywords)) {
      safetyLevel = 'Crisis';
      urgencyLevel = 'critical';
    } else if (crisisScore >= 40 || this.hasHighRiskKeywords(detectedKeywords)) {
      safetyLevel = 'High_Risk';
      urgencyLevel = 'high';
    } else if (crisisScore >= 20 || this.hasSensitiveKeywords(detectedKeywords)) {
      safetyLevel = 'Sensitive';
      urgencyLevel = 'medium';
    } else {
      safetyLevel = 'Safe';
      urgencyLevel = 'low';
    }

    const isCrisis = safetyLevel === 'Crisis';
    const requiresIntervention = safetyLevel === 'Crisis' || safetyLevel === 'High_Risk';
    const shouldHideFromPublic = requiresIntervention;

    // Get appropriate emergency resources
    const emergencyResources = this.getRelevantResources(safetyLevel, detectedKeywords);

    const recommendedAction = this.getRecommendedAction(safetyLevel, urgencyLevel);

    return {
      safetyLevel,
      crisisScore,
      urgencyLevel,
      isCrisis,
      detectedKeywords,
      recommendedAction,
      requiresIntervention,
      shouldHideFromPublic,
      emergencyResources
    };
  }

  /**
   * Analyzes content patterns for additional risk indicators
   */
  private analyzePatterns(content: string): number {
    let patternScore = 0;

    // Multiple crisis indicators in same message
    const crisisMatches = this.crisisKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    if (crisisMatches > 1) patternScore += 15;

    // Finality language
    const finalityPatterns = ['never again', 'last time', 'final', 'goodbye', 'forever'];
    if (finalityPatterns.some(pattern => content.includes(pattern))) {
      patternScore += 10;
    }

    // Hopelessness indicators
    const hopelessnessPatterns = ['no hope', 'no point', 'nothing matters', 'give up'];
    if (hopelessnessPatterns.some(pattern => content.includes(pattern))) {
      patternScore += 8;
    }

    // Time-sensitive language
    const urgentPatterns = ['tonight', 'today', 'right now', 'immediately', 'can\'t wait'];
    if (urgentPatterns.some(pattern => content.includes(pattern))) {
      patternScore += 12;
    }

    return patternScore;
  }

  /**
   * Check if detected keywords include crisis-level terms
   */
  private hasCrisisKeywords(keywords: string[]): boolean {
    return keywords.some(keyword => 
      this.crisisKeywords.some(crisis => crisis.toLowerCase() === keyword.toLowerCase())
    );
  }

  /**
   * Check if detected keywords include high-risk terms
   */
  private hasHighRiskKeywords(keywords: string[]): boolean {
    return keywords.some(keyword => 
      this.highRiskKeywords.some(highRisk => highRisk.toLowerCase() === keyword.toLowerCase())
    );
  }

  /**
   * Check if detected keywords include sensitive terms
   */
  private hasSensitiveKeywords(keywords: string[]): boolean {
    return keywords.some(keyword => 
      this.sensitiveKeywords.some(sensitive => sensitive.toLowerCase() === keyword.toLowerCase())
    );
  }

  /**
   * Get emergency resources relevant to the detected risk level
   */
  private getRelevantResources(safetyLevel: string, keywords: string[]): EmergencyResource[] {
    if (safetyLevel === 'Safe') return [];

    let relevantResources = [...this.emergencyResources];

    // For crisis situations, prioritize immediate help
    if (safetyLevel === 'Crisis') {
      relevantResources = relevantResources
        .filter(resource => resource.isPriority)
        .sort((a, b) => a.isPriority ? -1 : 1);
    }

    // Add category-specific resources based on keywords
    const hasAbuse = keywords.some(k => k.includes('abuse') || k.includes('violence'));
    const hasSuicide = keywords.some(k => k.includes('suicide') || k.includes('kill myself'));

    if (hasSuicide) {
      relevantResources = relevantResources.filter(r => 
        r.category === 'suicide' || r.category === 'crisis'
      );
    } else if (hasAbuse) {
      relevantResources = relevantResources.filter(r => 
        r.category === 'abuse' || r.category === 'crisis'
      );
    }

    return relevantResources.slice(0, 3); // Limit to top 3 most relevant
  }

  /**
   * Get recommended action based on safety assessment
   */
  private getRecommendedAction(safetyLevel: string, urgencyLevel: string): string {
    switch (safetyLevel) {
      case 'Crisis':
        return 'IMMEDIATE INTERVENTION REQUIRED: Contact emergency services and school crisis team immediately. Post held from public feed pending professional review.';
      
      case 'High_Risk':
        return 'PROFESSIONAL REVIEW REQUIRED: Route to school counselor within 2 hours. Post held from public feed until reviewed.';
      
      case 'Sensitive':
        return 'MONITORING RECOMMENDED: Flag for counselor awareness. Post visible with wellness resources attached.';
      
      default:
        return 'STANDARD PROCESSING: Post approved for public support circle with standard moderation.';
    }
  }

  /**
   * Get crisis intervention resources for immediate display
   */
  getCrisisInterventionResources(): EmergencyResource[] {
    return this.emergencyResources.filter(resource => resource.isPriority);
  }

  /**
   * Check if content contains any crisis indicators at all
   */
  hasAnyCrisisIndicators(content: string): boolean {
    const lowerContent = content.toLowerCase();
    const allKeywords = [
      ...this.crisisKeywords,
      ...this.highRiskKeywords,
      ...this.sensitiveKeywords
    ];
    
    return allKeywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
  }
}

export const crisisDetectionService = new CrisisDetectionService();