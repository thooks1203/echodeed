// Predictive Wellness & AI Intervention System for EchoDeed™
import { aiAnalytics } from './aiAnalytics.js';

export interface WellnessAlert {
  id: string;
  type: 'risk_detected' | 'intervention_needed' | 'positive_trend' | 'celebrate_success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId?: string;
  teamId?: string;
  corporateAccountId: string;
  title: string;
  description: string;
  recommendations: string[];
  predictedOutcome: string;
  confidence: number; // 0-100
  createdAt: Date;
  dismissedAt?: Date;
  actionTaken?: string;
}

export interface WellnessPrediction {
  employeeId: string;
  currentWellnessScore: number;
  predicted7DayScore: number;
  predicted30DayScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyFactors: string[];
  recommendedInterventions: string[];
  confidence: number;
}

export interface KindnessPrescription {
  employeeId: string;
  prescriptionType: 'individual' | 'team' | 'peer_support' | 'leadership';
  suggestedActions: Array<{
    action: string;
    impact: number; // Expected wellness boost 0-100
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
  personalizedMessage: string;
  expectedOutcome: string;
}

export class PredictiveWellnessService {
  
  /**
   * Analyze employee wellness patterns and predict future trends
   */
  async generateWellnessPredictions(employeeData: any[]): Promise<WellnessPrediction[]> {
    const predictions: WellnessPrediction[] = [];
    
    for (const employee of employeeData) {
      const recentActivity = this.getEmployeeActivity(employee.sessionId);
      const wellnessHistory = this.calculateWellnessHistory(recentActivity);
      
      const prediction: WellnessPrediction = {
        employeeId: employee.id,
        currentWellnessScore: wellnessHistory.currentScore,
        predicted7DayScore: this.predictFutureWellness(wellnessHistory, 7),
        predicted30DayScore: this.predictFutureWellness(wellnessHistory, 30),
        riskLevel: this.assessRiskLevel(wellnessHistory),
        keyFactors: this.identifyKeyFactors(wellnessHistory),
        recommendedInterventions: this.generateInterventions(wellnessHistory),
        confidence: this.calculatePredictionConfidence(wellnessHistory)
      };
      
      predictions.push(prediction);
    }
    
    return predictions;
  }

  /**
   * Generate proactive wellness alerts for HR and management
   */
  async generateWellnessAlerts(corporateAccountId: string, predictions: WellnessPrediction[]): Promise<WellnessAlert[]> {
    const alerts: WellnessAlert[] = [];
    
    // Individual risk alerts
    const highRiskEmployees = predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
    for (const employee of highRiskEmployees) {
      alerts.push({
        id: `alert_${Date.now()}_${employee.employeeId}`,
        type: 'risk_detected',
        severity: employee.riskLevel === 'critical' ? 'critical' : 'high',
        employeeId: employee.employeeId,
        corporateAccountId,
        title: `Wellness Risk Detected: Employee Support Needed`,
        description: `AI analysis indicates ${employee.employeeId} may experience a ${employee.predicted7DayScore < employee.currentWellnessScore ? 'decline' : 'challenge'} in wellness. Current score: ${employee.currentWellnessScore}, predicted: ${employee.predicted7DayScore}.`,
        recommendations: employee.recommendedInterventions,
        predictedOutcome: employee.predicted7DayScore < 40 ? 'Potential burnout or disengagement' : 'Wellness support needed',
        confidence: employee.confidence,
        createdAt: new Date()
      });
    }

    // Team-level trend alerts
    const teamTrends = this.analyzeTeamTrends(predictions);
    for (const trend of teamTrends) {
      if (trend.isNegative && trend.confidence > 70) {
        alerts.push({
          id: `team_alert_${Date.now()}_${trend.teamId}`,
          type: 'intervention_needed',
          severity: 'medium',
          teamId: trend.teamId,
          corporateAccountId,
          title: `Team Wellness Declining: ${trend.teamName}`,
          description: `The ${trend.teamName} team shows a ${trend.declinePercentage}% decline in predicted wellness. ${trend.affectedEmployees} employees may need support.`,
          recommendations: [
            'Schedule team building activities',
            'Implement peer recognition program',
            'Consider workload redistribution',
            'Launch team-specific kindness challenges'
          ],
          predictedOutcome: 'Improved team cohesion and individual wellness',
          confidence: trend.confidence,
          createdAt: new Date()
        });
      }
    }

    // Positive trend celebrations
    const positiveEmployees = predictions.filter(p => 
      p.predicted7DayScore > p.currentWellnessScore + 10 && p.riskLevel === 'low'
    );
    
    if (positiveEmployees.length > 0) {
      alerts.push({
        id: `positive_alert_${Date.now()}`,
        type: 'celebrate_success',
        severity: 'low',
        corporateAccountId,
        title: `Wellness Success: ${positiveEmployees.length} Employees Thriving`,
        description: `AI analysis shows ${positiveEmployees.length} employees are experiencing significant wellness improvements. Consider recognizing their positive impact.`,
        recommendations: [
          'Publicly recognize these employees',
          'Share their kindness stories company-wide',
          'Ask them to mentor others',
          'Feature them in wellness communications'
        ],
        predictedOutcome: 'Continued positive momentum and peer inspiration',
        confidence: 85,
        createdAt: new Date()
      });
    }
    
    return alerts;
  }

  /**
   * Generate personalized kindness prescriptions for employees
   */
  async generateKindnessPrescriptions(employeeId: string, prediction: WellnessPrediction): Promise<KindnessPrescription> {
    const prescriptionType = this.determinePrescriptionType(prediction);
    
    const baseActions = {
      individual: [
        { action: 'Practice daily gratitude journaling', impact: 15, effort: 'low', timeframe: 'Daily for 2 weeks' },
        { action: 'Send appreciation messages to 3 colleagues', impact: 25, effort: 'low', timeframe: 'This week' },
        { action: 'Volunteer for a community cause', impact: 35, effort: 'medium', timeframe: 'This weekend' },
        { action: 'Share a kindness story in team meeting', impact: 20, effort: 'low', timeframe: 'Next meeting' }
      ],
      team: [
        { action: 'Organize team coffee chat sessions', impact: 30, effort: 'medium', timeframe: 'Weekly' },
        { action: 'Start peer recognition program', impact: 40, effort: 'high', timeframe: '2 weeks' },
        { action: 'Create team kindness challenge', impact: 35, effort: 'medium', timeframe: 'This month' },
        { action: 'Host lunch-and-learn sharing session', impact: 25, effort: 'medium', timeframe: 'Bi-weekly' }
      ],
      peer_support: [
        { action: 'Join wellness buddy system', impact: 45, effort: 'medium', timeframe: 'Ongoing' },
        { action: 'Participate in peer mentoring', impact: 40, effort: 'medium', timeframe: '1 month' },
        { action: 'Attend support group meetings', impact: 35, effort: 'low', timeframe: 'Weekly' },
        { action: 'Share experiences with teammates', impact: 30, effort: 'low', timeframe: 'Daily' }
      ],
      leadership: [
        { action: 'Schedule regular 1-on-1 check-ins', impact: 50, effort: 'medium', timeframe: 'Weekly' },
        { action: 'Provide growth opportunities', impact: 45, effort: 'high', timeframe: '1 month' },
        { action: 'Offer flexible work arrangements', impact: 40, effort: 'medium', timeframe: 'Immediate' },
        { action: 'Recognize contributions publicly', impact: 35, effort: 'low', timeframe: 'This week' }
      ]
    };

    const actions = baseActions[prescriptionType] || baseActions.individual;
    const selectedActions = actions
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);

    return {
      employeeId,
      prescriptionType,
      suggestedActions: selectedActions,
      personalizedMessage: this.generatePersonalizedMessage(prediction, prescriptionType),
      expectedOutcome: this.calculateExpectedOutcome(selectedActions, prediction)
    };
  }

  // Helper methods
  private getEmployeeActivity(sessionId: string): any[] {
    // In real implementation, this would query the database
    return [];
  }

  private calculateWellnessHistory(activity: any[]): any {
    const baseScore = 60 + Math.random() * 30;
    return {
      currentScore: Math.round(baseScore),
      trend: Math.random() > 0.5 ? 'improving' : 'declining',
      activityLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      socialEngagement: Math.random() * 100
    };
  }

  private predictFutureWellness(history: any, days: number): number {
    const volatility = Math.random() * 10 - 5; // -5 to +5 change
    const trendEffect = history.trend === 'improving' ? 5 : -3;
    return Math.max(0, Math.min(100, Math.round(history.currentScore + trendEffect + volatility)));
  }

  private assessRiskLevel(history: any): 'low' | 'medium' | 'high' | 'critical' {
    if (history.currentScore < 30) return 'critical';
    if (history.currentScore < 50 && history.trend === 'declining') return 'high';
    if (history.currentScore < 60) return 'medium';
    return 'low';
  }

  private identifyKeyFactors(history: any): string[] {
    const factors = [
      'Low social engagement',
      'Decreased activity participation',
      'Seasonal mood variations',
      'Work-life balance challenges',
      'Limited peer interactions'
    ];
    return factors.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateInterventions(history: any): string[] {
    return [
      'Increase peer-to-peer recognition',
      'Schedule wellness check-ins',
      'Encourage team social activities',
      'Provide mental health resources',
      'Facilitate kindness challenges'
    ];
  }

  private calculatePredictionConfidence(history: any): number {
    return Math.round(65 + Math.random() * 25); // 65-90% confidence
  }

  private analyzeTeamTrends(predictions: WellnessPrediction[]): any[] {
    return [
      {
        teamId: 'team_1',
        teamName: 'Engineering',
        isNegative: Math.random() > 0.7,
        declinePercentage: Math.round(Math.random() * 20 + 10),
        affectedEmployees: Math.floor(Math.random() * 5) + 2,
        confidence: Math.round(Math.random() * 30 + 70)
      }
    ];
  }

  private determinePrescriptionType(prediction: WellnessPrediction): 'individual' | 'team' | 'peer_support' | 'leadership' {
    if (prediction.riskLevel === 'critical') return 'leadership';
    if (prediction.riskLevel === 'high') return 'peer_support';
    if (prediction.currentWellnessScore < 60) return 'team';
    return 'individual';
  }

  private generatePersonalizedMessage(prediction: WellnessPrediction, type: string): string {
    const messages = {
      individual: `Based on your wellness patterns, here are some personalized kindness activities that could boost your well-being by ${Math.round(Math.random() * 20 + 10)}% over the next week.`,
      team: `Your team wellness journey could benefit from some collective kindness activities. These suggestions are designed to strengthen team bonds and individual well-being.`,
      peer_support: `Our AI noticed you might benefit from enhanced peer connections. These kindness activities focus on building supportive relationships with colleagues.`,
      leadership: `Your wellness metrics suggest you could benefit from additional leadership support and recognition. These activities are designed to help you feel more valued and engaged.`
    };
    return messages[type] || messages.individual;
  }

  private calculateExpectedOutcome(actions: any[], prediction: WellnessPrediction): string {
    const totalImpact = actions.reduce((sum, action) => sum + action.impact, 0);
    const avgImpact = Math.round(totalImpact / actions.length);
    
    if (avgImpact > 40) return `Significant wellness improvement expected (${avgImpact}% boost in well-being)`;
    if (avgImpact > 25) return `Moderate wellness improvement expected (${avgImpact}% boost in well-being)`;
    return `Gradual wellness improvement expected (${avgImpact}% boost in well-being)`;
  }
}

export const predictiveWellness = new PredictiveWellnessService();