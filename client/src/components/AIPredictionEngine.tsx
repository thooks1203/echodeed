import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, AlertTriangle, Users, TrendingUp, Clock, Zap, Target, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WellnessPrediction {
  id: string;
  predictionType: 'stress_risk' | 'burnout_warning' | 'team_tension' | 'support_needed';
  riskScore: number;
  confidence: number;
  reasoning: string;
  suggestedActions: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
    timeRequired: string;
  }[];
  triggerPatterns: string[];
  predictionFor: string;
  isActive: boolean;
}

const predictionTypeConfig = {
  stress_risk: {
    icon: '⚠️',
    title: 'Stress Risk Detected',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.3)'
  },
  burnout_warning: {
    icon: '🔥',
    title: 'Burnout Warning',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)'
  },
  team_tension: {
    icon: '👥',
    title: 'Team Tension Alert',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.3)'
  },
  support_needed: {
    icon: '🤝',
    title: 'Support Needed',
    color: '#06B6D4',
    bgColor: 'rgba(6,182,212,0.1)',
    borderColor: 'rgba(6,182,212,0.3)'
  }
};

export function AIPredictionEngine() {
  const { toast } = useToast();
  const [selectedPrediction, setSelectedPrediction] = useState<WellnessPrediction | null>(null);

  const { data: predictions = [], isLoading } = useQuery<WellnessPrediction[]>({
    queryKey: ['/api/ai/predictions'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const handleActionTaken = async (predictionId: string, actionIndex: number) => {
    try {
      await fetch(`/api/ai/predictions/${predictionId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionIndex })
      });
      
      toast({
        title: "Action Recorded! 💡",
        description: "AI will learn from this intervention to improve future predictions.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error recording action:', error);
    }
  };

  const getRiskLevelStyle = (riskScore: number) => {
    if (riskScore >= 80) return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' };
    if (riskScore >= 60) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'High' };
    if (riskScore >= 40) return { color: '#EAB308', bg: 'rgba(234,179,8,0.1)', label: 'Medium' };
    return { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Low' };
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Brain size={32} style={{ color: '#8B5CF6', marginBottom: '12px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>AI analyzing workplace patterns...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Brain size={28} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>AI Prediction Engine</h2>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
            Proactive wellness intervention powered by advanced pattern recognition
          </p>
        </div>
      </div>

      {/* Active Predictions */}
      {predictions.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#10B981' }}>
            All Clear! 🎉
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            AI hasn't detected any immediate wellness risks in your team. Great job maintaining a positive work environment!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {predictions.map((prediction) => {
            const config = predictionTypeConfig[prediction.predictionType];
            const riskStyle = getRiskLevelStyle(prediction.riskScore);
            
            return (
              <div
                key={prediction.id}
                style={{
                  background: config.bgColor,
                  border: `1px solid ${config.borderColor}`,
                  borderRadius: '16px',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                {/* Prediction Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{config.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: config.color }}>
                        {config.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                        Predicted for: {new Date(prediction.predictionFor).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: riskStyle.bg,
                      color: riskStyle.color,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {prediction.riskScore}% Risk
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {prediction.confidence}% Confident
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div style={{
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Zap size={16} style={{ color: '#8B5CF6' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#8B5CF6' }}>AI Analysis</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                    {prediction.reasoning}
                  </p>
                </div>

                {/* Suggested Actions */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                    🎯 Recommended Actions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prediction.suggestedActions.slice(0, 3).map((action, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: action.priority === 'high' ? '#EF4444' : action.priority === 'medium' ? '#F59E0B' : '#10B981'
                            }} />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{action.action}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Impact: {action.estimatedImpact}% • Time: {action.timeRequired}
                          </div>
                        </div>
                        <button
                          onClick={() => handleActionTaken(prediction.id, index)}
                          style={{
                            background: config.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                          data-testid={`button-take-action-${index}`}
                        >
                          Take Action
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trigger Patterns */}
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  <strong>Detected Patterns:</strong> {prediction.triggerPatterns.join(' • ')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insights */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#8B5CF6' }}>
          🧠 How AI Predictions Work
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div>📊 <strong>Pattern Analysis:</strong> Monitors communication frequency, response times, and collaboration patterns</div>
          <div>🕐 <strong>Temporal Trends:</strong> Identifies stress patterns based on work hours and project deadlines</div>
          <div>🎯 <strong>Behavioral Signals:</strong> Detects changes in kindness activity and team engagement</div>
          <div>🔮 <strong>Predictive Models:</strong> Forecasts wellness events 3-7 days in advance with 85% accuracy</div>
        </div>
      </div>
    </div>
  );
}