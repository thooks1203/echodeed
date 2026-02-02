/**
 * 🚨 REVOLUTIONARY: Real-Time AI Safety Monitoring Engine
 * Continuous content analysis with immediate alert generation for school safety
 */

import OpenAI from 'openai';
import { BullyingPreventionAI } from './bullyingPreventionAI';
import { AIAnalyticsService } from './aiAnalytics';
import { storage } from '../storage';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface SafetyAnalysis {
  isSafe: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  concerns: string[];
  bullyingRisk: number; // 0-100
  emotionalDistress: number; // 0-100
  immediateAction: boolean;
  suggestedInterventions: string[];
  parentNotification: boolean;
  counselorAlert: boolean;
  adminEscalation: boolean;
  confidence: number;
}

export interface MonitoringAlert {
  id: string;
  type: 'bullying_risk' | 'emotional_distress' | 'crisis_indicator' | 'safety_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  studentUserId: string;
  postId?: string;
  title: string;
  description: string;
  riskFactors: string[];
  recommendedActions: string[];
  requiresParentNotification: boolean;
  requiresCounselorAlert: boolean;
  requiresAdminEscalation: boolean;
  confidence: number;
  createdAt: Date;
  status: 'active' | 'reviewed' | 'resolved';
}

export class RealTimeMonitoringService {
  private aiAnalytics = new AIAnalyticsService();

  /**
   * 🎯 Core function: Analyze any content posted by students in real-time
   */
  async analyzeStudentContent(
    content: string, 
    studentUserId: string, 
    schoolId: string,
    gradeLevel: string,
    postId?: string
  ): Promise<SafetyAnalysis> {
    try {
      // 1. Multi-layered AI safety analysis
      const [basicSafety, advancedAnalysis, contextualRisk] = await Promise.all([
        this.performBasicSafetyCheck(content),
        this.performAdvancedAIAnalysis(content),
        this.analyzeStudentContext(studentUserId, schoolId, gradeLevel)
      ]);

      // 2. Combine all analysis results
      const safetyAnalysis = this.combineSafetyResults(
        basicSafety, 
        advancedAnalysis, 
        contextualRisk
      );

      // 3. Generate alerts if needed
      if (!safetyAnalysis.isSafe) {
        await this.generateSafetyAlert(
          safetyAnalysis, 
          studentUserId, 
          schoolId, 
          postId
        );
      }

      // 4. Trigger parent notifications if warranted
      if (safetyAnalysis.parentNotification) {
        await this.triggerParentNotification(
          studentUserId, 
          safetyAnalysis, 
          content
        );
      }

      return safetyAnalysis;

    } catch (error) {
      console.error('🚨 Real-time monitoring error:', error);
      
      // Fallback: Flag for manual review if AI fails
      return {
        isSafe: false,
        riskLevel: 'medium',
        concerns: ['AI analysis failed - requires manual review'],
        bullyingRisk: 50,
        emotionalDistress: 50,
        immediateAction: true,
        suggestedInterventions: ['Manual review by counselor'],
        parentNotification: false,
        counselorAlert: true,
        adminEscalation: false,
        confidence: 30
      };
    }
  }

  /**
   * 🔍 Advanced AI Analysis using GPT-5 for nuanced understanding
   */
  private async performAdvancedAIAnalysis(content: string): Promise<any> {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert school psychologist and safety specialist. Analyze student content for potential risks.

CRITICAL SAFETY INDICATORS TO DETECT:
- Bullying language (direct or indirect threats, name-calling, exclusion)
- Emotional distress (expressions of sadness, anger, fear, hopelessness)
- Self-harm indicators (mentions of hurting self, feeling worthless)
- Crisis signals (family problems, academic stress, social isolation)
- Inappropriate content (violence, inappropriate topics for age)

Evaluate on 0-100 scales:
- bullyingRisk: Likelihood this indicates bullying situation
- emotionalDistress: Level of emotional distress expressed
- inappropriateContent: How inappropriate this is for school setting
- urgencyLevel: How quickly this needs intervention
- confidence: Your confidence in this analysis

Also determine:
- concernCategories: Array of specific concern types
- suggestedInterventions: Immediate actions to take
- requiresParentNotification: Should parents be notified?
- requiresCounselorAlert: Should school counselor be alerted?
- requiresAdminEscalation: Does this need principal involvement?

Respond in JSON format only.`
        },
        {
          role: "user",
          content: `Analyze this student content for safety concerns: "${content}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Very low temperature for consistent safety analysis
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * 🛡️ Basic keyword-based safety check (fast fallback)
   */
  private performBasicSafetyCheck(content: string): any {
    const lowerContent = content.toLowerCase();
    
    const criticalKeywords = [
      'hurt myself', 'kill myself', 'want to die', 'hate myself',
      'nobody cares', 'everyone hates me', 'worthless', 'stupid idiot'
    ];
    
    const bullyingKeywords = [
      'stupid', 'loser', 'freak', 'weirdo', 'nobody likes you',
      'kill yourself', 'go die', 'fat', 'ugly', 'gay' // when used as insult
    ];
    
    const distressKeywords = [
      'crying', 'scared', 'afraid', 'anxious', 'depressed',
      'alone', 'lonely', 'isolated', 'help me'
    ];

    const hasCritical = criticalKeywords.some(keyword => lowerContent.includes(keyword));
    const hasBullying = bullyingKeywords.some(keyword => lowerContent.includes(keyword));
    const hasDistress = distressKeywords.some(keyword => lowerContent.includes(keyword));

    return {
      isSafe: !hasCritical && !hasBullying,
      hasCriticalIndicators: hasCritical,
      hasBullyingLanguage: hasBullying,
      hasDistressSignals: hasDistress,
      riskLevel: hasCritical ? 'critical' : hasBullying ? 'high' : hasDistress ? 'medium' : 'safe'
    };
  }

  /**
   * 📊 Analyze student's historical context for pattern detection
   */
  private async analyzeStudentContext(
    studentUserId: string, 
    schoolId: string, 
    gradeLevel: string
  ): Promise<any> {
    try {
      // Get recent posts 
      const recentPosts = await storage.getUserPosts(studentUserId, { limit: 10 });
      const recentConflicts: any[] = []; // TODO: Implement conflict tracking

      // Use existing bullying prevention AI for context analysis
      const bullyingRisk = BullyingPreventionAI.analyzeBullyingRisk(
        schoolId,
        gradeLevel,
        recentConflicts,
        recentPosts || []
      );

      return {
        hasRecentConflicts: (recentConflicts?.length || 0) > 0,
        recentPostCount: recentPosts?.length || 0,
        bullyingRiskAssessment: bullyingRisk,
        socialDynamicsScore: bullyingRisk.socialDynamicsScore
      };

    } catch (error) {
      console.error('Context analysis error:', error);
      return {
        hasRecentConflicts: false,
        recentPostCount: 0,
        bullyingRiskAssessment: null,
        socialDynamicsScore: 50
      };
    }
  }

  /**
   * 🔄 Combine all analysis results into final safety assessment
   */
  private combineSafetyResults(
    basicSafety: any, 
    advancedAnalysis: any, 
    contextualRisk: any
  ): SafetyAnalysis {
    const bullyingRisk = Math.max(
      advancedAnalysis.bullyingRisk || 0,
      basicSafety.hasBullyingLanguage ? 70 : 0
    );

    const emotionalDistress = Math.max(
      advancedAnalysis.emotionalDistress || 0,
      basicSafety.hasDistressSignals ? 60 : 0
    );

    const overallRisk = Math.max(bullyingRisk, emotionalDistress);
    
    let riskLevel: SafetyAnalysis['riskLevel'] = 'safe';
    if (basicSafety.hasCriticalIndicators) riskLevel = 'critical';
    else if (overallRisk >= 80) riskLevel = 'high';
    else if (overallRisk >= 60) riskLevel = 'medium';
    else if (overallRisk >= 30) riskLevel = 'low';

    const concerns: string[] = [
      ...(basicSafety.hasCriticalIndicators ? ['Critical self-harm indicators detected'] : []),
      ...(basicSafety.hasBullyingLanguage ? ['Bullying language detected'] : []),
      ...(basicSafety.hasDistressSignals ? ['Emotional distress signals'] : []),
      ...(advancedAnalysis.concernCategories || [])
    ];

    return {
      isSafe: riskLevel === 'safe',
      riskLevel,
      concerns,
      bullyingRisk,
      emotionalDistress,
      immediateAction: riskLevel === 'critical' || riskLevel === 'high',
      suggestedInterventions: advancedAnalysis.suggestedInterventions || [
        'Monitor student closely',
        'Consider counselor check-in'
      ],
      parentNotification: advancedAnalysis.requiresParentNotification || riskLevel === 'critical',
      counselorAlert: advancedAnalysis.requiresCounselorAlert || riskLevel === 'high' || riskLevel === 'critical',
      adminEscalation: advancedAnalysis.requiresAdminEscalation || riskLevel === 'critical',
      confidence: Math.min(95, advancedAnalysis.confidence || 75)
    };
  }

  /**
   * 🚨 Generate and store safety alert for administrators
   */
  private async generateSafetyAlert(
    safetyAnalysis: SafetyAnalysis,
    studentUserId: string,
    schoolId: string,
    postId?: string
  ): Promise<void> {
    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${studentUserId}`,
      type: this.determineAlertType(safetyAnalysis),
      severity: this.mapRiskToSeverity(safetyAnalysis.riskLevel),
      studentUserId,
      postId,
      title: this.generateAlertTitle(safetyAnalysis),
      description: this.generateAlertDescription(safetyAnalysis),
      riskFactors: safetyAnalysis.concerns,
      recommendedActions: safetyAnalysis.suggestedInterventions,
      requiresParentNotification: safetyAnalysis.parentNotification,
      requiresCounselorAlert: safetyAnalysis.counselorAlert,
      requiresAdminEscalation: safetyAnalysis.adminEscalation,
      confidence: safetyAnalysis.confidence,
      createdAt: new Date(),
      status: 'active'
    };

    // Store alert in database (we'll implement this storage method)
    console.log('🚨 SAFETY ALERT GENERATED:', {
      type: alert.type,
      severity: alert.severity,
      student: studentUserId,
      concerns: alert.riskFactors
    });

    // TODO: Implement storage.createSafetyAlert(alert);
  }

  /**
   * 📧 Trigger immediate parent notification for concerning content
   */
  private async triggerParentNotification(
    studentUserId: string,
    safetyAnalysis: SafetyAnalysis,
    content: string
  ): Promise<void> {
    try {
      // Get parent information - TODO: Implement getStudentParentLinks method
      const parentLinks: any[] = []; // await storage.getStudentParentLinks(studentUserId);
      
      if (parentLinks && parentLinks.length > 0) {
        for (const link of parentLinks) {
          const notification = {
            parentAccountId: link.parentAccountId,
            studentUserId: studentUserId,
            notificationType: 'concern' as const,
            title: this.generateParentNotificationTitle(safetyAnalysis),
            message: this.generateParentNotificationMessage(safetyAnalysis, content),
            relatedData: {
              riskLevel: safetyAnalysis.riskLevel,
              concerns: safetyAnalysis.concerns,
              recommendedActions: safetyAnalysis.suggestedInterventions
            },
            isRead: 0,
            isSent: 0
          };

          await storage.createParentNotification(notification);
          
          console.log('📧 Parent notification queued for:', {
            parent: link.parentAccountId,
            student: studentUserId,
            riskLevel: safetyAnalysis.riskLevel
          });
        }
      }
    } catch (error) {
      console.error('Parent notification error:', error);
    }
  }

  // Helper methods for generating alerts and notifications
  private determineAlertType(analysis: SafetyAnalysis): MonitoringAlert['type'] {
    if (analysis.bullyingRisk > 70) return 'bullying_risk';
    if (analysis.emotionalDistress > 70) return 'emotional_distress';
    if (analysis.riskLevel === 'critical') return 'crisis_indicator';
    return 'safety_concern';
  }

  private mapRiskToSeverity(riskLevel: SafetyAnalysis['riskLevel']): MonitoringAlert['severity'] {
    const mapping = {
      'safe': 'low',
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical'
    } as const;
    return mapping[riskLevel];
  }

  private generateAlertTitle(analysis: SafetyAnalysis): string {
    if (analysis.riskLevel === 'critical') return '🚨 CRITICAL: Immediate Intervention Required';
    if (analysis.bullyingRisk > 70) return '⚠️ Potential Bullying Situation Detected';
    if (analysis.emotionalDistress > 70) return '💙 Student Emotional Distress Alert';
    return '👀 Safety Concern Flagged for Review';
  }

  private generateAlertDescription(analysis: SafetyAnalysis): string {
    return `AI monitoring has detected ${analysis.concerns.join(', ').toLowerCase()}. ` +
           `Risk level: ${analysis.riskLevel.toUpperCase()}. ` +
           `Confidence: ${analysis.confidence}%. ` +
           `${analysis.immediateAction ? 'REQUIRES IMMEDIATE ATTENTION.' : 'Monitoring recommended.'}`;
  }

  private generateParentNotificationTitle(analysis: SafetyAnalysis): string {
    if (analysis.riskLevel === 'critical') return 'Important: Your Child Needs Support';
    if (analysis.bullyingRisk > 70) return 'School Safety Update: Monitoring Your Child';
    return 'EchoDeed Safety Check: Your Child\'s Wellbeing';
  }

  private generateParentNotificationMessage(analysis: SafetyAnalysis, content: string): string {
    const baseMessage = "Our AI safety monitoring has flagged some content that suggests your child may need additional support. ";
    const actionMessage = analysis.riskLevel === 'critical' 
      ? "We're taking immediate steps to ensure their wellbeing and will be in touch soon."
      : "We're monitoring the situation and here to help. No immediate action needed, but we wanted to keep you informed.";
    
    return baseMessage + actionMessage + " Your child's safety and emotional wellbeing are our top priority.";
  }
}

export const realTimeMonitoring = new RealTimeMonitoringService();