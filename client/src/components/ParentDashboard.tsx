import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PushNotificationSetup from '@/components/PushNotificationSetup';

interface UserSummerProgress {
  progress: {
    id: string;
    userId: string;
    challengeId: string;
    completedAt: string | null;
    pointsEarned: number;
    parentApproved: boolean;
    notes: string | null;
    createdAt: string;
  };
  challenge: {
    id: string;
    week: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    points: number;
    ageGroup: string;
  } | null;
}

interface WeeklySummary {
  week: number;
  theme: {
    theme: string;
    description: string;
    color: string;
  };
  completedChallenges: UserSummerProgress[];
  totalPoints: number;
  parentApprovalNeeded: number;
}

interface SummerNotification {
  id: string;
  parentId: string;
  studentId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor: string;
  sentAt: string | null;
  createdAt: string;
}

export function ParentDashboard() {
  const [selectedChild] = useState('demo-user'); // In real app, parents could select which child
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'notifications'>('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get child's progress
  const { data: childProgress = [], isLoading: progressLoading } = useQuery<UserSummerProgress[]>({
    queryKey: ['/api/summer/progress', selectedChild],
    queryFn: () => fetch(`/api/summer/progress/${selectedChild}`).then(r => r.json()),
  });

  // Get current week for weekly summary
  const { data: currentWeek } = useQuery({
    queryKey: ['/api/summer/current-week'],
    queryFn: () => fetch('/api/summer/current-week').then(r => r.json())
  });

  // Get weekly summary
  const { data: weeklySummary } = useQuery<WeeklySummary>({
    queryKey: ['/api/summer/summary', selectedChild, currentWeek?.week],
    queryFn: () => fetch(`/api/summer/summary/${selectedChild}/${currentWeek?.week}`).then(r => r.json()),
    enabled: !!currentWeek?.week
  });

  // Approve challenge mutation
  const approveChallengeMutation = useMutation({
    mutationFn: async ({ progressId, pointsAwarded }: { progressId: string; pointsAwarded: number }) => {
      return apiRequest(`/api/summer/approve/${progressId}`, 'POST', { pointsAwarded });
    },
    onSuccess: () => {
      toast({
        title: "✅ Challenge Approved!",
        description: "Points have been awarded to your child.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/summer/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summer/summary'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleApproveChallenge = (progressId: string, maxPoints: number) => {
    approveChallengeMutation.mutate({ progressId, pointsAwarded: maxPoints });
  };

  const pendingApprovals = childProgress.filter(
    item => item.progress.completedAt && !item.progress.parentApproved
  );

  const approvedChallenges = childProgress.filter(
    item => item.progress.parentApproved
  );

  const totalPointsEarned = approvedChallenges.reduce(
    (sum, item) => sum + item.progress.pointsEarned, 0
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (progressLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#6B7280' 
      }}>
        Loading your child's progress...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667EEA, #764BA2)',
        color: 'white',
        padding: '24px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          👨‍👩‍👧‍👦 Parent Dashboard
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Track your child's summer kindness journey
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
              {totalPointsEarned}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Points</div>
            <div style={{ fontSize: '10px', color: '#8B5CF6', marginTop: '4px' }}>
              {totalPointsEarned >= 100 ? '🎁 Milestone reached!' : `${250 - totalPointsEarned} to next reward`}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
              {approvedChallenges.length}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Completed</div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
              {pendingApprovals.length}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Need Approval</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          background: 'white',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'approvals', label: `Approvals ${pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ''}`, icon: '✅' },
            { id: 'notifications', label: 'Updates', icon: '🔔' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                background: activeTab === tab.id ? '#3B82F6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6B7280',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Current Week Progress */}
            {weeklySummary && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${weeklySummary.theme.color}, ${weeklySummary.theme.color}CC)`,
                  color: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    Week {weeklySummary.week}: {weeklySummary.theme.theme}
                  </h3>
                  <p style={{ fontSize: '13px', opacity: 0.9 }}>
                    {weeklySummary.theme.description}
                  </p>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '12px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                      {weeklySummary.completedChallenges.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>This Week</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>
                      {weeklySummary.totalPoints}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Points</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                      {weeklySummary.parentApprovalNeeded}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Need Review</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                Recent Activity
              </h3>
              
              {childProgress.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
                  <p>Your child hasn't started any challenges yet!</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Encourage them to explore the Summer tab.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {childProgress.slice(0, 5).map((item) => (
                    <div
                      key={item.progress.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#1F2937' }}>
                          {item.challenge?.title || 'Unknown Challenge'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {item.progress.completedAt ? (
                            <>Completed {formatDate(item.progress.completedAt)}</>
                          ) : (
                            'In Progress'
                          )}
                        </div>
                        {item.progress.notes && (
                          <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '4px', fontStyle: 'italic' }}>
                            "{item.progress.notes}"
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.challenge && (
                          <span
                            style={{
                              background: getDifficultyColor(item.challenge.difficulty),
                              color: 'white',
                              fontSize: '9px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {item.challenge.difficulty}
                          </span>
                        )}
                        {item.progress.parentApproved ? (
                          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                            ✓ {item.progress.pointsEarned} pts
                          </span>
                        ) : item.progress.completedAt ? (
                          <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: '600' }}>
                            ⏳ Pending
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                Challenges Awaiting Approval
              </h3>
              
              {pendingApprovals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <p>All caught up! No challenges need approval.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingApprovals.map((item) => (
                    <div
                      key={item.progress.id}
                      style={{
                        border: '2px solid #F59E0B',
                        borderRadius: '12px',
                        padding: '16px',
                        background: '#FFF7ED'
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                            {item.challenge?.title || 'Unknown Challenge'}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {item.challenge && (
                              <span
                                style={{
                                  background: getDifficultyColor(item.challenge.difficulty),
                                  color: 'white',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {item.challenge.difficulty}
                              </span>
                            )}
                            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                              {item.challenge?.points || 0} pts
                            </span>
                          </div>
                        </div>
                        
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                          {item.challenge?.description}
                        </p>
                        
                        <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '8px' }}>
                          Completed: {item.progress.completedAt ? formatDate(item.progress.completedAt) : 'Unknown'}
                        </div>
                        
                        {item.progress.notes && (
                          <div style={{ 
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '8px',
                            marginBottom: '12px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
                              Your child's reflection:
                            </div>
                            <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                              "{item.progress.notes}"
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleApproveChallenge(item.progress.id, item.challenge?.points || 0)}
                        disabled={approveChallengeMutation.isPending}
                        style={{
                          width: '100%',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          opacity: approveChallengeMutation.isPending ? 0.7 : 1
                        }}
                        data-testid={`approve-${item.progress.id}`}
                      >
                        {approveChallengeMutation.isPending ? 
                          '⏳ Approving...' : 
                          `✅ Approve & Award ${item.challenge?.points || 0} Points`
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {/* Push Notification Setup */}
            <div style={{ marginBottom: '20px' }}>
              <PushNotificationSetup userType="parent" />
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                Summer Program Updates
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Partner Milestone Reward */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #FDF2F8, #F3E8FF)',
                  borderRadius: '8px',
                  border: '2px solid #E879F9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <img 
                          src="https://logos-world.net/wp-content/uploads/2020/09/Starbucks-Logo.png" 
                          alt="Starbucks" 
                          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#7C3AED' }}>
                          🎁 Milestone Reward Earned!
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B46C1' }}>
                        Your child earned a $5 Starbucks Gift Card for reaching 100 summer kindness points! Code: STAR-KND-A7B9
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>30m ago</div>
                  </div>
                </div>

                {/* Demo notifications - in real app, these would come from API */}
                <div style={{
                  padding: '16px',
                  background: '#EBF8FF',
                  borderRadius: '8px',
                  border: '1px solid #BEE3F8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF', marginBottom: '4px' }}>
                        🎉 Challenge Completed!
                      </div>
                      <div style={{ fontSize: '13px', color: '#1E3A8A' }}>
                        Your child completed "Little Helper Hero" challenge. Review their work to approve points.
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>2h ago</div>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  border: '1px solid #BBF7D0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#15803D', marginBottom: '4px' }}>
                        📅 New Week Starting
                      </div>
                      <div style={{ fontSize: '13px', color: '#14532D' }}>
                        Week 2: Family Appreciation starts tomorrow! New challenges are now available.
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>1d ago</div>
                  </div>
                </div>

                {/* Upcoming Milestone Reward */}
                <div style={{
                  padding: '16px',
                  background: '#FFF7ED',
                  borderRadius: '8px',
                  border: '1px solid #FDBA74'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
                          alt="Amazon" 
                          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#EA580C' }}>
                          🎯 Next Milestone: 150 points left
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#C2410C' }}>
                        Your child is 150 points away from earning a $10 Amazon Gift Card! Keep up the great kindness work!
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Active</div>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: '#FFFBEB',
                  borderRadius: '8px',
                  border: '1px solid #FDE68A'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400E', marginBottom: '4px' }}>
                        💡 Tip from EchoDeed
                      </div>
                      <div style={{ fontSize: '13px', color: '#78350F' }}>
                        Consider doing family challenges together! They create stronger bonds and lasting memories.
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>3d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}