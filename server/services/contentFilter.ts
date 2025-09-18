export class ContentFilterService {
  private profanityWords = [
    // Add profanity words here - keeping it simple for MVP
    'damn', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'death', 'murder'
  ];
  
  private negativeKeywords = [
    'awful', 'terrible', 'worst', 'horrible', 'disgusting', 'pathetic',
    'useless', 'worthless', 'failure', 'loser', 'stupid', 'dumb'
  ];

  isContentAppropriate(content: string, context: 'kindness' | 'support' = 'kindness'): { isValid: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();
    
    // Create word boundary regex for more precise matching
    const words: string[] = lowerContent.match(/\b\w+\b/g) || [];
    
    // Check for profanity (exact word matches only)
    for (const word of this.profanityWords) {
      if (words.includes(word.toLowerCase())) {
        return { isValid: false, reason: 'Content contains inappropriate language' };
      }
    }
    
    // For support posts, negative keywords are expected (students sharing challenges)
    // For kindness posts, we want positive content only
    if (context === 'kindness') {
      // Check for negative keywords (exact word matches only)
      for (const keyword of this.negativeKeywords) {
        if (words.includes(keyword.toLowerCase())) {
          return { isValid: false, reason: 'Content contains negative language. EchoDeed is for positive acts of kindness only.' };
        }
      }
    }
    
    // Check minimum length with appropriate message (support posts can be shorter)
    const minLength = context === 'support' ? 3 : 10; // Support posts: 3 chars, Kindness posts: 10 chars
    if (content.trim().length < minLength) {
      const minLengthMessage = context === 'support' 
        ? 'Please share what you\'re feeling (minimum 3 characters)'
        : 'Please provide more details about your act of kindness (minimum 10 characters)';
      return { isValid: false, reason: minLengthMessage };
    }
    
    // Check maximum length
    const maxLength = context === 'support' ? 500 : 280; // Support posts can be longer
    if (content.length > maxLength) {
      return { isValid: false, reason: `Content is too long (maximum ${maxLength} characters)` };
    }
    
    return { isValid: true };
  }
}

export const contentFilter = new ContentFilterService();
