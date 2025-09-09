/**
 * REVOLUTIONARY #1: AI-Powered Anonymous Conflict Resolution Engine
 * World's first real-time conflict detection and AI-mediated resolution system for schools
 */

interface ConflictAnalysis {
  severity: 'low' | 'medium' | 'high' | 'urgent';
  emotionalImpact: string;
  conflictType: 'peer_conflict' | 'exclusion' | 'verbal_disagreement' | 'physical_incident';
  aiInsights: string;
  resolutionSteps: string[];
  mediationScript: string;
  teacherAlertRequired: boolean;
  confidenceScore: number;
}

export class ConflictResolutionAI {
  private static keywords = {
    urgentSignals: ['fight', 'hit', 'hurt', 'blood', 'scared', 'threatening', 'weapon', 'dangerous'],
    highSeverity: ['bullying', 'mean', 'exclude', 'hate', 'stupid', 'ugly', 'worthless', 'alone', 'crying'],
    mediumSeverity: ['argument', 'disagreement', 'upset', 'mad', 'angry', 'frustrated', 'ignored'],
    lowSeverity: ['misunderstanding', 'confused', 'different opinion', 'small issue'],
    emotionalWords: ['sad', 'hurt', 'scared', 'angry', 'lonely', 'confused', 'frustrated', 'embarrassed']
  };

  static analyzeConflict(description: string, location: string, involvedParties: string): ConflictAnalysis {
    const lowerDesc = description.toLowerCase();
    
    // Determine severity based on keywords
    const severity = this.determineSeverity(lowerDesc);
    
    // Analyze emotional impact
    const emotionalImpact = this.analyzeEmotionalImpact(lowerDesc);
    
    // Classify conflict type
    const conflictType = this.classifyConflictType(lowerDesc);
    
    // Generate AI insights
    const aiInsights = this.generateInsights(description, location, severity);
    
    // Create resolution steps
    const resolutionSteps = this.generateResolutionSteps(conflictType, severity);
    
    // Generate mediation script
    const mediationScript = this.generateMediationScript(conflictType, emotionalImpact);
    
    // Determine if teacher alert is needed
    const teacherAlertRequired = severity === 'high' || severity === 'urgent';
    
    // Calculate confidence (based on keyword matches and description length)
    const confidenceScore = this.calculateConfidence(lowerDesc, description.length);

    return {
      severity,
      emotionalImpact,
      conflictType,
      aiInsights,
      resolutionSteps,
      mediationScript,
      teacherAlertRequired,
      confidenceScore
    };
  }

  private static determineSeverity(description: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (this.keywords.urgentSignals.some(word => description.includes(word))) {
      return 'urgent';
    }
    if (this.keywords.highSeverity.some(word => description.includes(word))) {
      return 'high';
    }
    if (this.keywords.mediumSeverity.some(word => description.includes(word))) {
      return 'medium';
    }
    return 'low';
  }

  private static analyzeEmotionalImpact(description: string): string {
    const emotions = this.keywords.emotionalWords.filter(word => description.includes(word));
    
    if (emotions.length === 0) {
      return "Neutral emotional state detected";
    }
    
    if (emotions.includes('scared') || emotions.includes('hurt')) {
      return "High emotional distress - immediate support needed";
    }
    
    if (emotions.includes('sad') || emotions.includes('lonely')) {
      return "Emotional vulnerability - gentle intervention recommended";
    }
    
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
      return "Heightened emotions - cooling-off period suggested";
    }
    
    return `Emotional impact detected: ${emotions.join(', ')}`;
  }

  private static classifyConflictType(description: string): 'peer_conflict' | 'exclusion' | 'verbal_disagreement' | 'physical_incident' {
    if (description.includes('hit') || description.includes('push') || description.includes('fight')) {
      return 'physical_incident';
    }
    
    if (description.includes('exclude') || description.includes('left out') || description.includes('alone')) {
      return 'exclusion';
    }
    
    if (description.includes('said') || description.includes('called') || description.includes('told')) {
      return 'verbal_disagreement';
    }
    
    return 'peer_conflict';
  }

  private static generateInsights(description: string, location: string, severity: string): string {
    const insights = [
      `Conflict detected in ${location} with ${severity} severity level.`,
    ];

    if (severity === 'urgent' || severity === 'high') {
      insights.push("Immediate intervention recommended to prevent escalation.");
    }
    
    if (location.includes('playground') || location.includes('recess')) {
      insights.push("Playground conflicts often stem from game rules or inclusion issues.");
    }
    
    if (location.includes('classroom')) {
      insights.push("Classroom conflicts may be related to academic pressure or group work dynamics.");
    }

    insights.push("Anonymous reporting shows student feels safe to seek help.");
    
    return insights.join(' ');
  }

  private static generateResolutionSteps(conflictType: string, severity: string): string[] {
    const baseSteps = [
      "Create safe space for dialogue",
      "Allow each party to share their perspective",
      "Identify common ground and shared interests"
    ];

    switch (conflictType) {
      case 'physical_incident':
        return [
          "Ensure immediate safety of all students",
          "Separate involved parties temporarily",
          "Assess any injuries and provide first aid if needed",
          ...baseSteps,
          "Establish agreement on respectful behavior",
          "Schedule follow-up check-in within 24 hours"
        ];
        
      case 'exclusion':
        return [
          "Acknowledge feelings of being left out",
          "Explore why exclusion occurred",
          ...baseSteps,
          "Discuss inclusive behaviors and friendship skills",
          "Create opportunities for positive interaction",
          "Monitor group dynamics over next week"
        ];
        
      case 'verbal_disagreement':
        return [
          "Help students calm down if emotions are high",
          ...baseSteps,
          "Practice using 'I' statements",
          "Find compromise or agree to disagree respectfully",
          "Role-play better communication strategies"
        ];
        
      default:
        return [
          ...baseSteps,
          "Work together to find solution",
          "Establish plan for future interactions",
          "Schedule follow-up if needed"
        ];
    }
  }

  private static generateMediationScript(conflictType: string, emotionalImpact: string): string {
    const scripts = {
      opening: "I understand there's been a situation that's bothering someone. Thank you for trusting us with this. Let's work together to make things better.",
      
      physical_incident: "First, I want to make sure everyone is safe. Physical conflicts can be scary and we need to find better ways to handle disagreements. Let's talk about what happened and how we can solve this peacefully.",
      
      exclusion: "Feeling left out really hurts. Everyone deserves to feel included and valued. Let's explore what happened and find ways to build stronger friendships where everyone feels welcome.",
      
      verbal_disagreement: "Words can hurt just as much as actions sometimes. Let's practice sharing our feelings in ways that help others understand us better, rather than causing more hurt.",
      
      peer_conflict: "Conflicts between friends happen, and that's normal. What matters is how we handle them. Let's find a way to understand each other better and strengthen your relationship."
    };

    let script = scripts.opening + "\n\n";
    script += scripts[conflictType as keyof typeof scripts] || scripts.peer_conflict;
    
    if (emotionalImpact.includes('distress')) {
      script += "\n\nI can see this situation has been really hard on you. Your feelings are important and valid.";
    }
    
    script += "\n\nWould you like to start by telling me what happened from your perspective?";
    
    return script;
  }

  private static calculateConfidence(description: string, length: number): number {
    let confidence = 50; // Base confidence
    
    // Longer descriptions generally more reliable
    if (length > 100) confidence += 20;
    if (length > 200) confidence += 10;
    
    // Specific keywords increase confidence
    const totalKeywords = [
      ...this.keywords.urgentSignals,
      ...this.keywords.highSeverity,
      ...this.keywords.mediumSeverity,
      ...this.keywords.emotionalWords
    ];
    
    const keywordMatches = totalKeywords.filter(word => description.includes(word)).length;
    confidence += Math.min(keywordMatches * 5, 30);
    
    return Math.min(confidence, 95); // Cap at 95%
  }

  // Generate prevention strategies based on school data
  static generatePreventionStrategies(schoolId: string, recentConflicts: any[]): string[] {
    const strategies = [
      "Implement morning circle time for emotional check-ins",
      "Create conflict resolution peer mediator program",
      "Develop empathy-building activities during character education",
      "Establish clear playground rules and rotation systems",
      "Train staff in de-escalation techniques"
    ];

    // Customize based on recent conflict patterns
    const conflictTypes = recentConflicts.map(c => c.conflictType);
    
    if (conflictTypes.includes('exclusion')) {
      strategies.push("Focus on inclusion activities and buddy systems");
    }
    
    if (conflictTypes.includes('physical_incident')) {
      strategies.push("Increase supervision in high-risk areas");
      strategies.push("Implement anger management workshops");
    }

    return strategies;
  }
}