export class ContentFilterService {
  private profanityWords = [
    // Add profanity words here - keeping it simple for MVP
    'damn', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'death', 'murder'
  ];
  
  private negativeKeywords = [
    'awful', 'terrible', 'worst', 'horrible', 'disgusting', 'pathetic',
    'useless', 'worthless', 'failure', 'loser', 'stupid', 'dumb'
  ];

  isContentAppropriate(content: string): { isValid: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();
    
    // Check for profanity
    for (const word of this.profanityWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        return { isValid: false, reason: 'Content contains inappropriate language' };
      }
    }
    
    // Check for negative keywords
    for (const keyword of this.negativeKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        return { isValid: false, reason: 'Content contains negative language. EchoDeed is for positive acts of kindness only.' };
      }
    }
    
    // Check minimum length
    if (content.trim().length < 10) {
      return { isValid: false, reason: 'Please provide more details about your act of kindness (minimum 10 characters)' };
    }
    
    // Check maximum length
    if (content.length > 280) {
      return { isValid: false, reason: 'Content is too long (maximum 280 characters)' };
    }
    
    return { isValid: true };
  }
}

export const contentFilter = new ContentFilterService();
