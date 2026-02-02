// AI-Powered Impact Measurement Service for EchoDeed™
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface KindnessAnalysis {
  sentimentScore: number; // 0-100, higher = more positive
  impactScore: number; // 0-100, higher = greater societal impact
  emotionalUplift: number; // 0-100, emotional boost potential
  kindnessCategory: string; // helping, supporting, volunteering, etc.
  rippleEffect: number; // 0-100, likelihood to inspire others
  wellnessContribution: number; // 0-100, mental health benefit
  confidence: number; // 0-100, AI confidence in analysis
  tags: string[]; // auto-generated descriptive tags
}

export class AIAnalyticsService {
  
  /**
   * Analyze a kindness post with comprehensive AI metrics
   */
  async analyzeKindnessPost(content: string): Promise<KindnessAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an advanced AI psychologist and social impact analyst. Analyze acts of kindness for their societal and emotional impact.

Evaluate the following metrics on a 0-100 scale:
- sentimentScore: Overall positivity and emotional tone
- impactScore: Real-world societal benefit and significance
- emotionalUplift: Potential to boost recipient's mental state
- rippleEffect: Likelihood to inspire others to act kindly
- wellnessContribution: Mental health and community wellness benefit
- confidence: Your confidence in this analysis

Also determine:
- kindnessCategory: primary type (helping, supporting, volunteering, gifting, listening, encouraging, teaching, protecting, caring, celebrating)
- tags: 3-5 descriptive keywords

Respond in JSON format only.`
          },
          {
            role: "user",
            content: `Analyze this act of kindness: "${content}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent analysis
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure all required fields with defaults
      return {
        sentimentScore: Math.max(0, Math.min(100, analysis.sentimentScore || 50)),
        impactScore: Math.max(0, Math.min(100, analysis.impactScore || 50)),
        emotionalUplift: Math.max(0, Math.min(100, analysis.emotionalUplift || 50)),
        kindnessCategory: analysis.kindnessCategory || 'helping',
        rippleEffect: Math.max(0, Math.min(100, analysis.rippleEffect || 50)),
        wellnessContribution: Math.max(0, Math.min(100, analysis.wellnessContribution || 50)),
        confidence: Math.max(0, Math.min(100, analysis.confidence || 75)),
        tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : ['kindness']
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback analysis based on simple keyword matching
      return this.getFallbackAnalysis(content);
    }
  }

  /**
   * Generate community wellness insights from multiple posts
   */
  async generateWellnessInsights(posts: any[]): Promise<{
    overallWellness: number;
    trendDirection: 'rising' | 'stable' | 'declining';
    dominantCategories: string[];
    recommendations: string[];
    riskFactors: string[];
  }> {
    try {
      const recentAnalytics = posts.slice(0, 50); // Analyze recent 50 posts
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a community wellness analyst. Analyze patterns in kindness data to provide insights about community mental health and social cohesion.

Based on the kindness analytics data, provide:
- overallWellness: 0-100 score of community wellness
- trendDirection: "rising", "stable", or "declining"
- dominantCategories: top 3 most common kindness types
- recommendations: 3-5 actionable suggestions for improving community wellness
- riskFactors: potential concerns or areas needing attention

Respond in JSON format only.`
          },
          {
            role: "user",
            content: `Analyze this community kindness data: ${JSON.stringify(recentAnalytics.map(p => ({
              category: p.kindnessCategory || 'general',
              impact: p.impactScore || 50,
              sentiment: p.sentimentScore || 50,
              date: p.createdAt
            })))}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Wellness Insights Error:', error);
      return {
        overallWellness: 75,
        trendDirection: 'stable' as const,
        dominantCategories: ['helping', 'supporting', 'encouraging'],
        recommendations: [
          'Continue promoting daily acts of kindness',
          'Encourage peer-to-peer recognition',
          'Focus on community building activities'
        ],
        riskFactors: []
      };
    }
  }

  /**
   * Predict future wellness trends based on current data
   */
  async predictWellnessTrends(historicalData: any[]): Promise<{
    next7Days: number;
    next30Days: number;
    keyFactors: string[];
    interventions: string[];
  }> {
    const avgWellness = historicalData.reduce((sum, d) => sum + (d.wellnessContribution || 50), 0) / historicalData.length;
    const recentTrend = this.calculateTrend(historicalData);
    
    return {
      next7Days: Math.max(0, Math.min(100, avgWellness + recentTrend * 7)),
      next30Days: Math.max(0, Math.min(100, avgWellness + recentTrend * 30)),
      keyFactors: [
        'Community engagement levels',
        'Seasonal mood variations', 
        'Current kindness momentum'
      ],
      interventions: [
        'Encourage micro-kindnesses during low periods',
        'Launch targeted wellness challenges',
        'Promote peer support networks'
      ]
    };
  }

  /**
   * Calculate corporate ROI metrics for wellness programs
   */
  calculateCorporateROI(employeeData: any[]): {
    wellnessImprovement: number;
    engagementBoost: number;
    predictedRetention: number;
    estimatedSavings: number;
  } {
    const avgWellness = employeeData.reduce((sum, e) => sum + (e.wellnessScore || 50), 0) / employeeData.length;
    const engagementScore = employeeData.reduce((sum, e) => sum + (e.engagementLevel || 50), 0) / employeeData.length;
    
    return {
      wellnessImprovement: Math.min(100, avgWellness),
      engagementBoost: Math.min(100, engagementScore),
      predictedRetention: Math.min(100, avgWellness * 0.8 + engagementScore * 0.2),
      estimatedSavings: Math.floor(employeeData.length * avgWellness * 50) // $50 per employee per wellness point
    };
  }

  private getFallbackAnalysis(content: string): KindnessAnalysis {
    const helpingWords = ['help', 'assist', 'support', 'aid'];
    const positiveWords = ['happy', 'joy', 'smile', 'grateful', 'thank'];
    const impactWords = ['community', 'volunteer', 'donate', 'teach'];
    
    let sentimentScore = 60;
    let impactScore = 50;
    let category = 'helping';
    
    const lowerContent = content.toLowerCase();
    
    if (positiveWords.some(word => lowerContent.includes(word))) sentimentScore += 20;
    if (impactWords.some(word => lowerContent.includes(word))) impactScore += 25;
    if (helpingWords.some(word => lowerContent.includes(word))) category = 'helping';
    
    return {
      sentimentScore: Math.min(100, sentimentScore),
      impactScore: Math.min(100, impactScore),
      emotionalUplift: sentimentScore,
      kindnessCategory: category,
      rippleEffect: 65,
      wellnessContribution: 70,
      confidence: 60,
      tags: ['kindness', 'community']
    };
  }

  private calculateTrend(data: any[]): number {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-7);
    const older = data.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + (d.wellnessContribution || 50), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d.wellnessContribution || 50), 0) / older.length;
    
    return (recentAvg - olderAvg) / 7; // Trend per day
  }
}

export const aiAnalytics = new AIAnalyticsService();