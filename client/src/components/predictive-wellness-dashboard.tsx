import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface WellnessAlert {
  id: string;
  type: 'risk_detected' | 'intervention_needed' | 'positive_trend' | 'celebrate_success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId?: string;
  teamId?: string;
  title: string;
  description: string;
  recommendations: string[];
  predictedOutcome: string;
  confidence: number;
  createdAt: string;
}

interface WellnessPrediction {
  employeeId: string;
  currentWellnessScore: number;
  predicted7DayScore: number;
  predicted30DayScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyFactors: string[];
  recommendedInterventions: string[];
  confidence: number;
}

interface KindnessPrescription {
  employeeId: string;
  prescriptionType: 'individual' | 'team' | 'peer_support' | 'leadership';
  suggestedActions: Array<{
    action: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
  personalizedMessage: string;
  expectedOutcome: string;
}

export function PredictiveWellnessDashboard() {
  const [activeAlert, setActiveAlert] = useState<WellnessAlert | null>(null);

  // Mock data for demonstration - in real app this would come from API
  const mockAlerts: WellnessAlert[] = [
    {
      id: '1',
      type: 'risk_detected',
      severity: 'high',
      employeeId: 'emp_001',
      title: 'Wellness Risk Detected: Employee Support Needed',
      description: 'AI analysis indicates an employee may experience a decline in wellness. Current score: 65, predicted: 45.',
      recommendations: [
        'Schedule wellness check-in',
        'Assign wellness buddy',
        'Reduce workload temporarily',
        'Offer mental health resources'
      ],
      predictedOutcome: 'Prevent potential burnout',
      confidence: 87,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'intervention_needed',
      severity: 'medium',
      teamId: 'team_eng',
      title: 'Team Wellness Declining: Engineering Team',
      description: 'The Engineering team shows a 15% decline in predicted wellness. 4 employees may need support.',
      recommendations: [
        'Schedule team building activities',
        'Implement peer recognition program',
        'Consider workload redistribution',
        'Launch team-specific kindness challenges'
      ],
      predictedOutcome: 'Improved team cohesion and individual wellness',
      confidence: 78,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      type: 'celebrate_success',
      severity: 'low',
      title: 'Wellness Success: 8 Employees Thriving',
      description: 'AI analysis shows 8 employees are experiencing significant wellness improvements.',
      recommendations: [
        'Publicly recognize these employees',
        'Share their kindness stories company-wide',
        'Ask them to mentor others',
        'Feature them in wellness communications'
      ],
      predictedOutcome: 'Continued positive momentum and peer inspiration',
      confidence: 92,
      createdAt: new Date().toISOString()
    }
  ];

  const mockPrescription: KindnessPrescription = {
    employeeId: 'current_user',
    prescriptionType: 'individual',
    suggestedActions: [
      { action: 'Send appreciation messages to 3 colleagues', impact: 25, effort: 'low', timeframe: 'This week' },
      { action: 'Practice daily gratitude journaling', impact: 15, effort: 'low', timeframe: 'Daily for 2 weeks' },
      { action: 'Share a kindness story in team meeting', impact: 20, effort: 'low', timeframe: 'Next meeting' }
    ],
    personalizedMessage: 'Based on your wellness patterns, here are some personalized kindness activities that could boost your well-being by 15% over the next week.',
    expectedOutcome: 'Gradual wellness improvement expected (20% boost in well-being)'
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      default: return '#059669';
    }
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      default: return '✅';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'risk_detected': return '🎯';
      case 'intervention_needed': return '🤝';
      case 'celebrate_success': return '🎉';
      default: return '📈';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      default: return '#059669';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>🔮</span>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #DC2626, #EA580C)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Predictive Wellness System
          </h2>
          <span style={{ fontSize: '24px' }}>⚡</span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0 
        }}>
          AI-powered intervention alerts and personalized kindness prescriptions
        </p>
      </div>

      {/* Status Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(234,88,12,0.1) 100%)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#DC2626' }}>
            Live Wellness Monitoring
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#DC2626' }}>2</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Alerts</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>87%</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Prediction Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#7C3AED' }}>15</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Interventions Today</div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(220,38,38,0.05) 100%)',
        border: '1px solid rgba(239,68,68,0.1)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🚨</span>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#DC2626' }}>
            Wellness Alerts & Interventions
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id}
              style={{
                background: 'white',
                border: `1px solid ${getSeverityColor(alert.severity)}30`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveAlert(activeAlert?.id === alert.id ? null : alert)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{getSeverityEmoji(alert.severity)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {alert.description}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '600',
                  color: getSeverityColor(alert.severity),
                  textTransform: 'uppercase'
                }}>
                  {alert.confidence}% confidence
                </div>
              </div>
              
              {activeAlert?.id === alert.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Recommended Actions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {alert.recommendations.map((rec, index) => (
                      <div key={index} style={{ 
                        fontSize: '12px', 
                        color: '#374151',
                        padding: '4px 8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px'
                      }}>
                        • {rec}
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#059669', 
                    fontStyle: 'italic',
                    marginTop: '8px'
                  }}>
                    Expected outcome: {alert.predictedOutcome}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Kindness Prescription */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>💊</span>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#7C3AED' }}>
            Your Personal Kindness Prescription
          </h3>
        </div>
        
        <div style={{ 
          fontSize: '14px', 
          color: '#374151', 
          marginBottom: '16px',
          fontStyle: 'italic'
        }}>
          {mockPrescription.personalizedMessage}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockPrescription.suggestedActions.map((action, index) => (
            <div key={index} style={{
              background: 'white',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                +{action.impact}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                  {action.action}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  {action.timeframe}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: getEffortColor(action.effort),
                textTransform: 'uppercase'
              }}>
                {action.effort} effort
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(124,58,237,0.05)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#7C3AED', 
            fontWeight: '600'
          }}>
            🎯 {mockPrescription.expectedOutcome}
          </div>
        </div>
      </div>

      {/* AI Powered Badge */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span style={{
          background: 'linear-gradient(90deg, #DC2626, #EA580C)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🔮</span>
          Powered by Predictive AI
        </span>
      </div>
    </div>
  );
}