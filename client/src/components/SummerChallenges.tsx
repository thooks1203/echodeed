import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface SummerChallenge {
  id: string;
  week: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  ageGroup: string;
  isActive: boolean;
  createdAt: string;
}

interface SummerActivity {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  instructions: string;
  timeEstimate: number;
  materialsNeeded: string;
  parentInvolvement: boolean;
}

interface WeekTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
}

interface SummerChallengesProps {
  onBack?: () => void;
}

export function SummerChallenges({ onBack }: SummerChallengesProps) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'6-12'>('6-12');
  const [selectedChallenge, setSelectedChallenge] = useState<SummerChallenge | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current week and theme
  const { data: currentWeek } = useQuery({
    queryKey: ['/api/summer/current-week'],
    queryFn: () => fetch('/api/summer/current-week').then(r => r.json())
  });

  // Get challenges for selected age group
  const { data: challenges = [], isLoading } = useQuery<SummerChallenge[]>({
    queryKey: ['/api/summer/challenges', selectedAgeGroup],
    queryFn: () => fetch(`/api/summer/challenges/${selectedAgeGroup}`).then(r => r.json()),
    enabled: !!selectedAgeGroup
  });

  // Get activities for selected challenge
  const { data: activities = [] } = useQuery<SummerActivity[]>({
    queryKey: ['/api/summer/activities', selectedChallenge?.id],
    queryFn: () => fetch(`/api/summer/activities/${selectedChallenge?.id}`).then(r => r.json()),
    enabled: !!selectedChallenge?.id
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, notes }: { challengeId: string; notes?: string }) => {
      return apiRequest('/api/summer/complete', 'POST', {
        userId: 'demo-user', // In real app, get from auth context
        challengeId,
        notes
      });
    },
    onSuccess: () => {
      toast({
        title: "🎉 Challenge Completed!",
        description: "Your challenge has been submitted for parent approval!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/summer/progress'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCompleteChallenge = (challengeId: string) => {
    completeChallengeMutation.mutate({ challengeId });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTimeEstimateText = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#6B7280' 
      }}>
        Loading summer challenges...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F9FF' }}>
      {/* Kid-Friendly Back Button */}
      {onBack && (
        <div style={{ padding: '16px 20px 0' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg border-2 border-yellow-300 hover:scale-105"
            data-testid="summer-back-button"
            style={{ 
              fontSize: '14px',
              fontWeight: '700'
            }}
          >
            <ArrowLeft size={18} />
            <span>🏠 Back to My Dashboard</span>
          </button>
        </div>
      )}
      {/* Header with current week theme */}
      {currentWeek && (
        <div style={{ 
          background: `linear-gradient(135deg, ${currentWeek.theme.color}, ${currentWeek.theme.color}CC)`,
          color: 'white',
          padding: '24px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            Week {currentWeek.week} • Summer 2026
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            {currentWeek.theme.theme}
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, maxWidth: '400px', margin: '0 auto' }}>
            {currentWeek.theme.description}
          </p>
        </div>
      )}

      {/* Age Group Selector */}
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
            Choose Your Grade Level
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['6-8'] as const).map((ageGroup) => (
              <button
                key={ageGroup}
                onClick={() => setSelectedAgeGroup(ageGroup)}
                style={{
                  background: selectedAgeGroup === ageGroup ? '#3B82F6' : 'white',
                  color: selectedAgeGroup === ageGroup ? 'white' : '#374151',
                  border: '2px solid #E5E7EB',
                  borderColor: selectedAgeGroup === ageGroup ? '#3B82F6' : '#E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                data-testid={`age-group-${ageGroup}`}
              >
                6th-8th Grade
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
            This Week's Challenges
          </h3>
          
          {challenges.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#6B7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌞</div>
              <p>No challenges available for this week yet!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setSelectedChallenge(challenge);
                    setShowActivities(true);
                  }}
                  data-testid={`challenge-${challenge.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                      {challenge.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          background: getDifficultyColor(challenge.difficulty),
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {challenge.difficulty}
                      </span>
                      <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                        {challenge.points} pts
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.4' }}>
                    {challenge.description}
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                    Tap to see activities →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activities Modal */}
      {showActivities && selectedChallenge && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowActivities(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="activities-modal"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                {selectedChallenge.title}
              </h3>
              <button
                onClick={() => setShowActivities(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
                data-testid="close-activities-modal"
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
              {selectedChallenge.description}
            </p>

            {activities.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  Activities to Complete:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                          {activity.title}
                        </h5>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span style={{ color: '#6B7280' }}>
                            ⏱️ {getTimeEstimateText(activity.timeEstimate)}
                          </span>
                          {activity.parentInvolvement && (
                            <span style={{ color: '#F59E0B' }}>👨‍👩‍👧‍👦 Parent Help</span>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                        {activity.description}
                      </p>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '12px', color: '#374151' }}>Instructions:</strong>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0', lineHeight: '1.4' }}>
                          {activity.instructions}
                        </p>
                      </div>
                      {activity.materialsNeeded && (
                        <div>
                          <strong style={{ fontSize: '12px', color: '#374151' }}>Materials needed:</strong>
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0' }}>
                            {activity.materialsNeeded}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowActivities(false)}
                style={{
                  flex: 1,
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                data-testid="cancel-challenge"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCompleteChallenge(selectedChallenge.id);
                  setShowActivities(false);
                }}
                disabled={completeChallengeMutation.isPending}
                style={{
                  flex: 1,
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  opacity: completeChallengeMutation.isPending ? 0.7 : 1
                }}
                data-testid="complete-challenge"
              >
                {completeChallengeMutation.isPending ? 'Completing...' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}