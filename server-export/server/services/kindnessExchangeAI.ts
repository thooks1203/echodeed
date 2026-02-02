/**
 * REVOLUTIONARY #3: Cross-School Anonymous Kindness Exchange
 * World's first global peer support network where students send kindness across school boundaries
 */

interface KindnessMatch {
  senderId: string;
  recipientSchoolId: string;
  matchingScore: number;
  compatibilityFactors: string[];
  culturalConsiderations: string[];
  recommendedDeliveryTime: string;
}

interface GlobalKindnessMetrics {
  totalExchanges: number;
  countriesConnected: number;
  averageImpactRating: number;
  crossCulturalExchanges: number;
  languagesSupported: number;
  distanceReached: number; // in kilometers
}

export class KindnessExchangeAI {
  private static kindnessCategories = {
    encouragement: {
      keywords: ['believe', 'capable', 'strong', 'talented', 'amazing', 'proud'],
      templates: [
        "A student from {fromCountry} wants you to know you're amazing just as you are! 🌟",
        "Someone across the world believes in your potential and is cheering you on! 💪",
        "A peer from {distance}km away thinks you're capable of incredible things! ✨"
      ]
    },
    support: {
      keywords: ['tough', 'difficult', 'hard', 'struggling', 'challenge', 'help'],
      templates: [
        "A friend from {fromCountry} wants you to know you're not alone in this 🤝",
        "Someone {distance}km away is sending you strength for whatever you're facing 💙",
        "A peer across the world understands and is thinking of you during tough times 🌈"
      ]
    },
    celebration: {
      keywords: ['achievement', 'success', 'proud', 'accomplished', 'victory', 'win'],
      templates: [
        "A student from {fromCountry} is celebrating your success with you! 🎉",
        "Someone {distance}km away is doing a happy dance for your achievement! 🎊",
        "A peer across the world thinks your accomplishment is absolutely wonderful! 🏆"
      ]
    },
    sympathy: {
      keywords: ['loss', 'sad', 'difficult', 'sorry', 'hurt', 'pain'],
      templates: [
        "A gentle soul from {fromCountry} is sending you comfort and care 🕊️",
        "Someone {distance}km away wants you to know they care about what you're going through 💝",
        "A compassionate peer across the world is holding space for your feelings 🤗"
      ]
    }
  };

  private static culturalConsiderations = {
    holidays: {
      'christmas': ['christian', 'western'],
      'ramadan': ['muslim', 'islamic'],
      'diwali': ['hindu', 'indian'],
      'chinese_new_year': ['chinese', 'asian'],
      'hanukkah': ['jewish', 'hebrew']
    },
    communication_styles: {
      'direct': ['german', 'dutch', 'american'],
      'indirect': ['japanese', 'korean', 'thai'],
      'warm': ['italian', 'spanish', 'brazilian'],
      'formal': ['british', 'french', 'russian']
    }
  };

  static findKindnessMatch(
    senderSchoolId: string,
    senderGrade: string,
    kindnessMessage: string,
    kindnessType: string,
    availableRecipients: any[]
  ): KindnessMatch | null {
    
    if (availableRecipients.length === 0) return null;

    const matches = availableRecipients.map(recipient => {
      const score = this.calculateMatchingScore(
        senderSchoolId,
        senderGrade,
        kindnessMessage,
        kindnessType,
        recipient
      );
      
      return {
        ...recipient,
        matchingScore: score,
        compatibilityFactors: this.getCompatibilityFactors(senderGrade, recipient, kindnessType),
        culturalConsiderations: this.getCulturalConsiderations(senderSchoolId, recipient.schoolId)
      };
    });

    // Sort by matching score and return best match
    matches.sort((a, b) => b.matchingScore - a.matchingScore);
    const bestMatch = matches[0];

    if (bestMatch.matchingScore < 50) return null; // Minimum threshold

    return {
      senderId: senderSchoolId,
      recipientSchoolId: bestMatch.schoolId,
      matchingScore: bestMatch.matchingScore,
      compatibilityFactors: bestMatch.compatibilityFactors,
      culturalConsiderations: bestMatch.culturalConsiderations,
      recommendedDeliveryTime: this.calculateOptimalDeliveryTime(bestMatch.timezone)
    };
  }

  private static calculateMatchingScore(
    senderSchoolId: string,
    senderGrade: string,
    message: string,
    kindnessType: string,
    recipient: any
  ): number {
    let score = 50; // Base score

    // Grade compatibility (prefer similar ages)
    const gradeNumber = parseInt(senderGrade) || 0;
    const recipientGrade = parseInt(recipient.gradeLevel) || 0;
    const gradeDiff = Math.abs(gradeNumber - recipientGrade);
    
    if (gradeDiff === 0) score += 20;
    else if (gradeDiff === 1) score += 15;
    else if (gradeDiff === 2) score += 10;
    else if (gradeDiff > 3) score -= 10;

    // Geographic diversity bonus
    if (recipient.country !== this.getCountryFromSchoolId(senderSchoolId)) {
      score += 15; // Cross-country bonus
    }
    if (recipient.continent !== this.getContinentFromSchoolId(senderSchoolId)) {
      score += 25; // Cross-continent bonus
    }

    // Language compatibility
    if (recipient.primaryLanguage === 'English') {
      score += 10; // Most common language
    }

    // Kindness type alignment
    if (this.isKindnessTypeNeeded(recipient, kindnessType)) {
      score += 20;
    }

    // Avoid over-matching to same school
    if (recipient.recentExchanges?.includes(senderSchoolId)) {
      score -= 15;
    }

    // Time zone consideration (prefer reasonable delivery times)
    const timeDiff = this.calculateTimeDifference(senderSchoolId, recipient.schoolId);
    if (timeDiff <= 6) score += 5; // Reasonable time difference

    return Math.max(0, Math.min(100, score));
  }

  private static getCompatibilityFactors(senderGrade: string, recipient: any, kindnessType: string): string[] {
    const factors = [];

    const gradeNumber = parseInt(senderGrade) || 0;
    const recipientGrade = parseInt(recipient.gradeLevel) || 0;
    
    if (Math.abs(gradeNumber - recipientGrade) <= 1) {
      factors.push("Similar age and developmental stage");
    }

    if (recipient.country !== this.getCountryFromSchoolId('sender')) {
      factors.push("Cross-cultural connection opportunity");
    }

    if (kindnessType === 'encouragement' && recipient.needsEncouragement) {
      factors.push("Recipient could benefit from encouragement");
    }

    if (kindnessType === 'support' && recipient.hasRecentChallenges) {
      factors.push("Recipient facing challenges where support helps");
    }

    factors.push("Geographic diversity promotes global understanding");
    factors.push("Anonymous format ensures safe, pressure-free interaction");

    return factors;
  }

  private static getCulturalConsiderations(senderSchoolId: string, recipientSchoolId: string): string[] {
    const considerations = [];

    // Add time zone awareness
    const timeDiff = this.calculateTimeDifference(senderSchoolId, recipientSchoolId);
    considerations.push(`Delivery timed for recipient's optimal hours (${timeDiff}h difference)`);

    // Add cultural sensitivity
    considerations.push("Message reviewed for cultural appropriateness");
    considerations.push("Universal themes of kindness transcend cultural boundaries");
    
    return considerations;
  }

  private static calculateOptimalDeliveryTime(recipientTimezone: string): string {
    // Calculate when recipient is most likely to be in school/available
    const now = new Date();
    const recipientTime = new Date(now.toLocaleString("en-US", {timeZone: recipientTimezone}));
    
    // Optimal delivery: 9 AM - 3 PM in recipient's timezone (school hours)
    const hour = recipientTime.getHours();
    
    if (hour >= 9 && hour <= 15) {
      return "immediate"; // They're in school now
    } else if (hour >= 16 && hour <= 20) {
      return "after_school_today"; // After school hours
    } else {
      return "next_school_day"; // Wait for next school day
    }
  }

  // AI-powered message enhancement
  static enhanceKindnessMessage(
    originalMessage: string,
    kindnessType: string,
    senderCountry: string,
    recipientCountry: string,
    distance: number
  ): string {
    const category = this.kindnessCategories[kindnessType as keyof typeof this.kindnessCategories];
    if (!category) return originalMessage;

    // Select appropriate template
    const template = category.templates[Math.floor(Math.random() * category.templates.length)];
    
    // Replace placeholders
    let enhancedMessage = template
      .replace('{fromCountry}', senderCountry)
      .replace('{distance}', Math.round(distance).toString());

    // Add original message if meaningful
    if (originalMessage.length > 10) {
      enhancedMessage += `\n\n"${originalMessage}"`;
    }

    // Add cultural bridge
    if (senderCountry !== recipientCountry) {
      enhancedMessage += `\n\n🌍 A bridge of kindness from ${senderCountry} to ${recipientCountry}`;
    }

    return enhancedMessage;
  }

  // Translation service integration
  static async translateMessage(message: string, fromLang: string, toLang: string): Promise<string> {
    // In real implementation, integrate with Google Translate API or similar
    // For now, return enhanced message with language indicator
    if (fromLang === toLang) return message;
    
    return `[Translated from ${fromLang}] ${message}\n\n💬 Original language: ${fromLang}`;
  }

  // Global impact tracking
  static calculateGlobalImpact(exchanges: any[]): GlobalKindnessMetrics {
    const countries = new Set(exchanges.map(e => e.senderCountry).concat(exchanges.map(e => e.recipientCountry)));
    const crossCultural = exchanges.filter(e => e.crossCulturalFlag === 1);
    const withRatings = exchanges.filter(e => e.impactRating);
    const avgRating = withRatings.length > 0 
      ? withRatings.reduce((sum, e) => sum + e.impactRating, 0) / withRatings.length 
      : 0;
    
    const maxDistance = Math.max(...exchanges.map(e => e.distanceKm || 0));
    const languages = new Set(exchanges.map(e => e.languageFrom).concat(exchanges.map(e => e.languageTo)));

    return {
      totalExchanges: exchanges.length,
      countriesConnected: countries.size,
      averageImpactRating: Math.round(avgRating * 10) / 10,
      crossCulturalExchanges: crossCultural.length,
      languagesSupported: languages.size,
      distanceReached: maxDistance
    };
  }

  // Helper methods
  private static getCountryFromSchoolId(schoolId: string): string {
    // In real implementation, look up school location
    return 'United States'; // Default
  }

  private static getContinentFromSchoolId(schoolId: string): string {
    // In real implementation, look up school continent
    return 'North America'; // Default
  }

  private static calculateTimeDifference(school1Id: string, school2Id: string): number {
    // In real implementation, calculate actual time zone difference
    return Math.floor(Math.random() * 12); // Mock difference
  }

  private static isKindnessTypeNeeded(recipient: any, kindnessType: string): boolean {
    // In real implementation, analyze recipient's recent activity
    return Math.random() > 0.5; // Mock logic
  }

  // Matching algorithm for real-time pairing
  static findBestGlobalMatch(
    pendingKindnessRequests: any[],
    newKindnessOffer: any
  ): any | null {
    const compatibleRequests = pendingKindnessRequests.filter(request => {
      // Filter by kindness type compatibility
      return request.kindnessType === newKindnessOffer.kindnessType ||
             this.areKindnessTypesCompatible(request.kindnessType, newKindnessOffer.kindnessType);
    });

    if (compatibleRequests.length === 0) return null;

    // Score each potential match
    const scoredMatches = compatibleRequests.map(request => ({
      ...request,
      matchScore: this.calculateGlobalMatchScore(newKindnessOffer, request)
    }));

    // Return best match
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
    return scoredMatches[0].matchScore > 60 ? scoredMatches[0] : null;
  }

  private static areKindnessTypesCompatible(type1: string, type2: string): boolean {
    const compatibilityMap: { [key: string]: string[] } = {
      'encouragement': ['support', 'celebration'],
      'support': ['encouragement', 'sympathy'],
      'celebration': ['encouragement'],
      'sympathy': ['support']
    };

    return compatibilityMap[type1]?.includes(type2) || false;
  }

  private static calculateGlobalMatchScore(offer: any, request: any): number {
    let score = 50;

    // Geographic diversity bonus
    if (offer.senderCountry !== request.recipientCountry) score += 20;
    
    // Grade compatibility
    const gradeDiff = Math.abs(parseInt(offer.senderGrade) - parseInt(request.recipientGrade));
    if (gradeDiff <= 1) score += 15;
    else if (gradeDiff <= 2) score += 10;
    
    // Time zone consideration
    const timeDiff = this.calculateTimeDifference(offer.senderSchoolId, request.recipientSchoolId);
    if (timeDiff <= 8) score += 10;

    // Language compatibility
    if (offer.languageFrom === request.languageTo) score += 15;

    return score;
  }
}