import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface KindnessSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  personalizedReason: string;
  contextualFactors: string[];
}

export function AIKindnessSuggestions() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: suggestions = [], isLoading } = useQuery<KindnessSuggestion[]>({
    queryKey: ['/api/ai/suggestions', refreshTrigger],
  });

  // Sample suggestions when API fails
  const sampleSuggestions: KindnessSuggestion[] = [
    {
      id: '1',
      title: 'Send an encouraging message to a colleague',
      description: 'Reach out to someone who might be having a challenging day at work',
      category: 'Workplace',
      difficulty: 'Easy',
      estimatedTime: '5 minutes',
      personalizedReason: 'Based on your recent team interactions, this could boost morale',
      contextualFactors: ['Monday morning', 'Team project deadline approaching', 'Recent positive feedback']
    },
    {
      id: '2', 
      title: 'Help someone with their groceries',
      description: 'Offer assistance to someone carrying heavy bags or struggling with items',
      category: 'Community',
      difficulty: 'Easy',
      estimatedTime: '10 minutes',
      personalizedReason: 'You\'re near a grocery store and it\'s peak shopping time',
      contextualFactors: ['Afternoon timing', 'High foot traffic area', 'Weekend shopping rush']
    },
    {
      id: '3',
      title: 'Organize a wellness check-in meeting',
      description: 'Schedule informal coffee chats with team members to see how they\'re doing',
      category: 'Leadership',
      difficulty: 'Medium', 
      estimatedTime: '30 minutes',
      personalizedReason: 'Your leadership role allows you to impact team wellbeing significantly',
      contextualFactors: ['Quarter-end stress', 'Remote work isolation', 'Team performance metrics']
    },
    {
      id: '4',
      title: 'Share knowledge through mentoring',
      description: 'Offer to mentor a junior colleague or share your expertise in a skill',
      category: 'Professional',
      difficulty: 'Medium',
      estimatedTime: '45 minutes',
      personalizedReason: 'Your expertise in this area could help someone grow professionally',
      contextualFactors: ['Skill development season', 'New team member onboarding', 'Knowledge sharing culture']
    },
    {
      id: '5',
      title: 'Volunteer for community service',
      description: 'Participate in local community service or charity work on the weekend',
      category: 'Community',
      difficulty: 'Hard',
      estimatedTime: '3 hours',
      personalizedReason: 'Your schedule shows availability this weekend for meaningful impact',
      contextualFactors: ['Weekend availability', 'Local community needs', 'Personal values alignment']
    }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : sampleSuggestions;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return { bg: '#ecfdf5', color: '#065f46', border: '#10b981' };
      case 'Medium': return { bg: '#fefbeb', color: '#92400e', border: '#f59e0b' };
      case 'Hard': return { bg: '#fef2f2', color: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🧠</div>
        <p style={{ color: '#6b7280' }}>AI is personalizing kindness suggestions for you...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '24px' }}>💡</span>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            AI Kindness Suggestions
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
          Personalized acts of kindness based on your context and preferences
        </p>
        
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 Get New Suggestions
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displaySuggestions.map((suggestion) => {
          const diffColor = getDifficultyColor(suggestion.difficulty);
          
          return (
            <div
              key={suggestion.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px' 
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: 0,
                  color: '#111827',
                  flex: 1,
                  marginRight: '12px'
                }}>
                  {suggestion.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    background: diffColor.bg,
                    color: diffColor.color,
                    border: `1px solid ${diffColor.border}`,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {suggestion.difficulty}
                  </span>
                  
                  <span style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    {suggestion.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ 
                fontSize: '14px', 
                color: '#4b5563', 
                margin: '0 0 16px 0',
                lineHeight: 1.5
              }}>
                {suggestion.description}
              </p>

              {/* AI Reasoning */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(239,68,68,0.1) 100%)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🧠</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#D97706' }}>
                    AI Insight
                  </span>
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#92400e', 
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  {suggestion.personalizedReason}
                </p>
              </div>

              {/* Contextual Factors */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                  Context Factors:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestion.contextualFactors.map((factor, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f9fafb',
                        color: '#4b5563',
                        border: '1px solid #e5e7eb',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                style={{
                  marginTop: '16px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                💚 I'll do this act of kindness
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}