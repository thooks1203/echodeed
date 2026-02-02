export class ContentFilterService {
  private profanityWords = [
    // Add profanity words here - keeping it simple for MVP
    'damn', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'death', 'murder'
  ];
  
  private negativeKeywords = [
    'awful', 'terrible', 'worst', 'horrible', 'disgusting', 'pathetic',
    'useless', 'worthless', 'failure', 'loser', 'stupid', 'dumb'
  ];

  // Common first names to protect student anonymity
  private commonNames = [
    // Popular names in schools (K-12)
    'aaron', 'abby', 'adam', 'alex', 'alice', 'amanda', 'amy', 'andrew', 'anna', 'anthony',
    'ashley', 'austin', 'benjamin', 'brandon', 'brian', 'brittany', 'brooke', 'caleb', 'cameron',
    'carlos', 'charlotte', 'chloe', 'chris', 'christian', 'christopher', 'claire', 'daniel',
    'david', 'derek', 'dylan', 'elizabeth', 'emily', 'emma', 'eric', 'ethan', 'evan', 'grace',
    'hannah', 'hunter', 'isabella', 'jack', 'jacob', 'james', 'jason', 'jennifer', 'jessica',
    'john', 'jonathan', 'jordan', 'joseph', 'joshua', 'justin', 'kayla', 'kevin', 'lauren',
    'lily', 'logan', 'lucas', 'madison', 'maria', 'mark', 'matthew', 'megan', 'michael',
    'michelle', 'nicholas', 'nicole', 'noah', 'olivia', 'paige', 'rachel', 'rebecca', 'ryan',
    'samantha', 'sarah', 'sophia', 'stephanie', 'taylor', 'thomas', 'tyler', 'victoria', 'william',
    'zachary', 'zoe'
  ];

  // Check if a word could be a proper name (capitalized word that's not at sentence start)
  private isPotentialProperName(content: string): { isName: boolean; name?: string } {
    // Look for capitalized words that aren't at the start of sentences
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // Skip first word of each sentence (normal capitalization)
      for (let i = 1; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
        
        // Check if word is capitalized and could be a name
        if (word.length > 1 && 
            word[0] === word[0].toUpperCase() && 
            word.slice(1) === word.slice(1).toLowerCase() &&
            !this.isCommonNonNameWord(word)) {
          
          // Check if it's a known name
          if (this.commonNames.includes(word.toLowerCase())) {
            return { isName: true, name: word };
          }
          
          // Check if it looks like a name (not a common word like "Monday", "Math", etc.)
          if (word.length >= 3 && !this.isCommonNonNameWord(word)) {
            return { isName: true, name: word };
          }
        }
      }
    }
    
    return { isName: false };
  }

  // Common capitalized words that aren't names
  private isCommonNonNameWord(word: string): boolean {
    const commonWords = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
      'math', 'english', 'science', 'history', 'spanish', 'french', 'chinese', 'german',
      'christmas', 'halloween', 'thanksgiving', 'easter', 'valentine', 'america', 'american',
      'school', 'teacher', 'principal', 'library', 'cafeteria', 'gym', 'office'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }

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
    
    // Check for proper names to maintain anonymity (applies to all contexts)
    const nameCheck = this.isPotentialProperName(content);
    if (nameCheck.isName) {
      return { 
        isValid: false, 
        reason: `To protect everyone's privacy and maintain anonymity, please don't use specific names. Try "I helped a friend" or "I helped a classmate" instead.` 
      };
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
