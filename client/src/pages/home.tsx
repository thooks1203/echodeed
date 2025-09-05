import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '@/components/AppHeader';
import { FilterBar } from '@/components/FilterBar';
import { KindnessFeed } from '@/components/KindnessFeed';
import { PostDeedModal } from '@/components/PostDeedModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useWebSocket } from '@/hooks/use-websocket';
import { useGeolocation } from '@/hooks/use-geolocation';
import { KindnessPost, KindnessCounter, UserTokens, BrandChallenge } from '@shared/schema';
import { PostFilters, WebSocketMessage, Achievement, UserAchievement, AchievementNotification, TokenEarning, CorporateDashboardData, CorporateMetric, ChallengeTemplate } from '@/lib/types';
import { getSessionId, addSessionHeaders } from '@/lib/session';

export default function Home() {
  const queryClient = useQueryClient();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('global');
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState<PostFilters>({});
  const [counterPulse, setCounterPulse] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tokenEarning, setTokenEarning] = useState<TokenEarning | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<AchievementNotification | null>(null);

  const { location } = useGeolocation();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<KindnessPost[]>({
    queryKey: ['/api/posts', filters],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, filterParams] = queryKey;
      const searchParams = new URLSearchParams();
      
      if (filterParams && typeof filterParams === 'object') {
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) searchParams.set(key, value as string);
        });
      }
      
      const url = searchParams.toString() ? `${baseUrl}?${searchParams}` : baseUrl as string;
      const response = await fetch(url, { 
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  // Fetch counter
  const { data: counter, refetch: refetchCounter } = useQuery<KindnessCounter>({
    queryKey: ['/api/counter'],
  });

  // Fetch user tokens
  const { data: tokens, refetch: refetchTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
    retry: 2,
  });

  // Fetch brand challenges
  const { data: challenges = [] } = useQuery<BrandChallenge[]>({
    queryKey: ['/api/challenges'],
  });

  // Fetch completed challenges
  const { data: completedChallenges = [] } = useQuery<string[]>({
    queryKey: ['/api/challenges/completed'],
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  // Fetch user achievements
  const { data: userAchievements = [], refetch: refetchUserAchievements } = useQuery<UserAchievement[]>({
    queryKey: ['/api/achievements/user'],
  });

  // Fetch corporate dashboard data (sample company for demo)
  const { data: corporateDashboard } = useQuery<CorporateDashboardData>({
    queryKey: ['/api/corporate/accounts/demo/dashboard'],
    retry: false, // Don't retry if no corporate account
    enabled: activeTab === 'corporate' // Only fetch when corporate tab is active
  });

  // Fetch corporate accounts for admin panel
  const { data: corporateAccounts = [] } = useQuery({
    queryKey: ['/api/corporate/accounts'],
    enabled: activeTab === 'admin' // Only fetch when admin tab is active
  });

  // Fetch challenge templates for corporate dashboard
  const { data: challengeTemplates = [] } = useQuery({
    queryKey: ['/api/corporate/challenge-templates'],
    enabled: activeTab === 'corporate' && !!corporateDashboard // Only fetch when corporate tab is active and dashboard is loaded
  });

  // Achievement checking helper
  const checkAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: addSessionHeaders()
      });
      
      if (response.ok) {
        const newAchievements = await response.json();
        if (newAchievements && newAchievements.length > 0) {
          // Show first achievement notification
          const firstAchievement = newAchievements[0];
          const achievement = achievements.find(a => a.id === firstAchievement.achievementId);
          if (achievement) {
            setAchievementNotification({
              achievement,
              echoReward: achievement.echoReward
            });
            
            // Auto-hide after 4 seconds
            setTimeout(() => setAchievementNotification(null), 4000);
          }
          
          // Refetch user achievements and tokens
          refetchUserAchievements();
          refetchTokens();
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [achievements, refetchUserAchievements, refetchTokens]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'NEW_POST') {
      refetchPosts();
    } else if (message.type === 'COUNTER_UPDATE') {
      refetchCounter();
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 600);
    } else if (message.type === 'POST_UPDATE') {
      refetchPosts(); // Refetch posts to get updated counts
      refetchTokens(); // Refetch tokens to get updated balance
    }
  }, [refetchPosts, refetchCounter, refetchTokens]);

  // Initialize WebSocket
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const handleFilterChange = (filter: string, newFilters: PostFilters) => {
    setActiveFilter(filter);
    setFilters(newFilters);
  };

  const handleHeartPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/heart`, { 
        method: 'POST',
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to add heart');
      
      // Show earning feedback popup
      setTokenEarning({ amount: 1, reason: 'Showing love! 💜' });
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Post and tokens will update via WebSocket
      refetchTokens(); // Force refresh tokens
      
      // Check for new achievements
      await checkAchievements();
    } catch (error) {
      console.error('Failed to add heart:', error);
    }
  };

  const handleEchoPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/echo`, { 
        method: 'POST',
        headers: addSessionHeaders()
      });
      if (!response.ok) throw new Error('Failed to add echo');
      
      // Show earning feedback popup
      setTokenEarning({ amount: 2, reason: 'Echoing kindness! 🌊' });
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Post and tokens will update via WebSocket  
      refetchTokens(); // Force refresh tokens
      
      // Check for new achievements
      await checkAchievements();
    } catch (error) {
      console.error('Failed to add echo:', error);
    }
  };

  const handleCompleteChallenge = async (challengeId: string, brandName: string, reward: number) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: addSessionHeaders({
          'Content-Type': 'application/json',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const data = await response.json();
      
      // Show token earning popup
      setTokenEarning({
        amount: reward,
        reason: `${brandName} challenge! 🏆`,
      });
      
      setTimeout(() => setTokenEarning(null), 3000);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/completed'] });
      refetchTokens();
      
      // Check for new achievements
      await checkAchievements();
    } catch (error: any) {
      console.error('Failed to complete challenge:', error);
      alert(error.message || 'Failed to complete challenge');
    }
  };

  const defaultCounter: KindnessCounter = {
    id: 'global',
    count: 247891,
    updatedAt: new Date(),
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#8B5CF6',
    color: 'white'
  };

  // Helper function to get tier colors and styling
  const getTierStyling = (tier: string, isUnlocked: boolean) => {
    const baseStyle = {
      opacity: isUnlocked ? 1 : 0.4,
      filter: isUnlocked ? 'none' : 'grayscale(50%)'
    };
    
    switch (tier) {
      case 'bronze':
        return { ...baseStyle, backgroundColor: '#F59E0B', color: 'white' };
      case 'silver':
        return { ...baseStyle, backgroundColor: '#6B7280', color: 'white' };
      case 'gold':
        return { ...baseStyle, backgroundColor: '#EAB308', color: 'white' };
      case 'diamond':
        return { ...baseStyle, backgroundColor: '#06B6D4', color: 'white' };
      case 'legendary':
        return { ...baseStyle, backgroundColor: '#8B5CF6', color: 'white' };
      default:
        return baseStyle;
    }
  };

  // Corporate Dashboard tab content
  const renderCorporateTab = () => {
    if (!corporateDashboard) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '8px' }}>
            Corporate Wellness
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Connect your corporate account to view team analytics and manage employee wellness programs.
          </p>
          
          {/* Employee Enrollment Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
              Employee Enrollment
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
              Join your company's kindness and wellness program
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const email = formData.get('email') as string;
              const company = formData.get('company') as string;
              
              // Simple enrollment simulation
              alert(`Enrollment request sent!\n\nEmail: ${email}\nCompany: ${company}\n\nYour HR team will activate your account within 24 hours.`);
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Company Domain
                </label>
                <select
                  name="company"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <option value="">Select your company...</option>
                  <option value="techflow.com">TechFlow Solutions</option>
                  <option value="wellnesscorp.com">Wellness Corp</option>
                  <option value="other">Other (Contact HR)</option>
                </select>
              </div>
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Request Access
              </button>
            </form>
          </div>
          
          {/* Demo Access */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>💼</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
              View Demo Dashboard
            </div>
            <div style={{ fontSize: '12px', color: '#075985', marginBottom: '12px' }}>
              See how TechFlow Solutions uses EchoDeed™
            </div>
            <button 
              onClick={() => {
                // Force refresh the corporate dashboard query to load demo data
                queryClient.invalidateQueries({ queryKey: ['/api/corporate/accounts/demo/dashboard'] });
              }}
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View Demo
            </button>
          </div>
        </div>
      );
    }

    const { account, overview, teams, employees, recentChallenges, analytics } = corporateDashboard;
    
    // Calculate trends (simplified)
    const lastWeekEngagement = analytics.length >= 7 ? analytics[analytics.length - 7].averageEngagementScore : overview.engagementScore;
    const engagementTrend = overview.engagementScore - lastWeekEngagement;
    
    const metrics: CorporateMetric[] = [
      {
        label: 'Total Employees',
        value: overview.totalEmployees,
        icon: '👥',
        color: '#8B5CF6'
      },
      {
        label: 'Active Teams',
        value: overview.activeTeams,
        icon: '🔥',
        color: '#EF4444'
      },
      {
        label: 'Challenge Completions',
        value: overview.totalChallengeCompletions,
        icon: '🏆',
        color: '#F59E0B'
      },
      {
        label: 'Total $ECHO Earned',
        value: overview.totalTokensEarned.toLocaleString(),
        icon: '🪙',
        color: '#10B981'
      },
      {
        label: 'Engagement Score',
        value: `${overview.engagementScore}%`,
        change: engagementTrend,
        icon: '📈',
        color: '#06B6D4'
      },
      {
        label: 'Wellness Impact',
        value: `${overview.wellnessScore}%`,
        icon: '💚',
        color: '#84CC16'
      }
    ];

    return (
      <div style={{ padding: '20px', paddingBottom: '100px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '8px', 
          textAlign: 'center',
          background: `linear-gradient(135deg, ${account.primaryColor}, #06B6D4)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {account.companyName} Dashboard
        </h2>
        
        <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
          Employee Wellness & Kindness Analytics • {account.subscriptionTier.charAt(0).toUpperCase() + account.subscriptionTier.slice(1)} Plan
        </div>

        {/* Key Metrics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '12px', 
          marginBottom: '24px' 
        }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${metric.color}20`,
              position: 'relative'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '8px' 
              }}>
                <div style={{ 
                  fontSize: '24px',
                  backgroundColor: `${metric.color}15`,
                  borderRadius: '8px',
                  padding: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {metric.icon}
                </div>
                {metric.change !== undefined && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: metric.change >= 0 ? '#10B981' : '#EF4444',
                    backgroundColor: metric.change >= 0 ? '#10B98110' : '#EF444410',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: metric.color,
                marginBottom: '4px' 
              }}>
                {metric.value}
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Team Performance */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            Team Performance
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gap: '8px' 
          }}>
            {teams.slice(0, 4).map((team) => {
              const progress = team.targetSize ? (team.currentSize || 0) / team.targetSize * 100 : 0;
              const goalProgress = team.monthlyKindnessGoal ? Math.min(100, (team.currentSize || 0) * 5 / team.monthlyKindnessGoal * 100) : 0; // Estimate

              return (
                <div key={team.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {team.teamName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {team.department} • {team.currentSize || 0}/{team.targetSize || 0} members
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: goalProgress >= 80 ? '#10B981' : goalProgress >= 50 ? '#F59E0B' : '#6b7280',
                      backgroundColor: goalProgress >= 80 ? '#10B98110' : goalProgress >= 50 ? '#F59E0B10' : '#6b728010',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {goalProgress.toFixed(0)}% Goal
                    </div>
                  </div>
                  
                  {/* Team Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${Math.min(100, progress)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${account.primaryColor}, #06B6D4)`,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    Monthly Goal: {team.monthlyKindnessGoal || 0} acts of kindness
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Corporate Challenges */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              Active Challenges
            </h3>
            <button style={{
              backgroundColor: account.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              + New Challenge
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {recentChallenges.slice(0, 3).map((challenge) => {
              const participationRate = challenge.currentParticipation / overview.totalEmployees * 100;
              
              return (
                <div key={challenge.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {challenge.challengeType.replace('_', ' ')} • {challenge.currentParticipation} participants • {challenge.echoReward} $ECHO reward
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: participationRate >= 50 ? '#10B981' : participationRate >= 25 ? '#F59E0B' : '#6b7280',
                      backgroundColor: participationRate >= 50 ? '#10B98115' : participationRate >= 25 ? '#F59E0B15' : '#6b728015',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {participationRate.toFixed(0)}% Participation
                    </div>
                  </div>
                  
                  {/* Challenge Progress */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, participationRate)}%`,
                      height: '100%',
                      backgroundColor: participationRate >= 50 ? '#10B981' : participationRate >= 25 ? '#F59E0B' : '#6b7280',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Challenge Templates */}
        {challengeTemplates.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>📋</span>
                Challenge Templates
              </h3>
              <div style={{ fontSize: '11px', color: '#6b7280', padding: '2px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                {challengeTemplates.length} Available
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {challengeTemplates.slice(0, 4).map((template: ChallengeTemplate) => (
                <div key={template.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: `1px solid ${template.color}20`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-2px)'
                  }
                }} onClick={() => {
                  alert(`Create "${template.title}" Challenge?\n\n${template.description}\n\nReward: ${template.echoReward} $ECHO\nDuration: ${template.suggestedDuration} days\nTarget: ${template.participationGoal}% participation\n\n(Challenge creation will be implemented in the next phase)`);
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      fontSize: '24px',
                      backgroundColor: `${template.color}15`,
                      borderRadius: '8px',
                      padding: '6px',
                      minWidth: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {template.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {template.title}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: template.color,
                          backgroundColor: `${template.color}15`,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {template.echoReward} $ECHO
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                        {template.category} • {template.suggestedDuration} days • {template.participationGoal}% target
                      </div>
                      
                      <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.3' }}>
                        {template.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {challengeTemplates.length > 4 && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px dashed #d1d5db',
                  cursor: 'pointer'
                }} onClick={() => {
                  alert(`View All Templates\n\n${challengeTemplates.length} total templates available:\n\n${challengeTemplates.map(t => `${t.icon} ${t.title} (${t.category})`).join('\n')}\n\n(Full template browser coming soon!)`);
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    View All {challengeTemplates.length} Templates →
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            Quick Actions
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Export Analytics', icon: '📊', color: '#8B5CF6', action: 'export' },
              { label: 'Add Employees', icon: '👤', color: '#10B981' },
              { label: 'Browse Templates', icon: '📋', color: '#F59E0B' },
              { label: 'Team Settings', icon: '⚙️', color: '#6B7280' }
            ].map((action, index) => (
              <button key={index} style={{
                backgroundColor: `${action.color}10`,
                color: action.color,
                border: `1px solid ${action.color}20`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }} onClick={() => {
                if (action.label === 'Browse Templates') {
                  alert(`Challenge Template Library\n\n${challengeTemplates.length} templates available across 8 categories:\n\n• Health & Wellness\n• Team Building\n• Community Service\n• Mental Health\n• Innovation & Creativity\n• Environmental\n• Professional Development\n• General Kindness\n\n(Full template management coming soon!)`);
                } else if (action.action === 'export') {
                  // Generate export functionality
                  const accountId = corporateDashboard?.account?.id || 'demo';
                  const fileName = `${corporateDashboard?.account?.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Company'}_wellness_report_${new Date().toISOString().split('T')[0]}.csv`;
                  
                  // Create download link
                  const exportUrl = `/api/corporate/accounts/${accountId}/analytics/export?format=csv&period=30`;
                  
                  // Trigger download
                  const link = document.createElement('a');
                  link.href = exportUrl;
                  link.download = fileName;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // Show success message
                  alert(`📊 Analytics Export Generated!\n\nDownloading: ${fileName}\n\nIncludes:\n• Company summary & metrics\n• Daily analytics data (30 days)\n• Team performance data\n• Challenge completion statistics\n• Employee engagement scores\n\nPerfect for executive reports and stakeholder updates!`);
                } else {
                  alert(`${action.label} feature coming soon!`);
                }
              }}>
                <span style={{ fontSize: '16px' }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Badges tab content
  const renderBadgesTab = () => {
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    const unlockedCount = userAchievements.length;
    const totalCount = achievements.length;
    const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    
    // Group achievements by category
    const achievementsByCategory = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) acc[achievement.category] = [];
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, Achievement[]>);

    return (
      <div style={{ padding: '20px', paddingBottom: '100px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '16px', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🏅 Achievement Badges
        </h2>
        
        <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '24px', color: '#6b7280' }}>
          Collect badges by spreading kindness and completing challenges!
        </div>
        
        {/* Progress Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            🎯
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {unlockedCount} / {totalCount}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
            Badges Collected ({completionPercentage}%)
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #F59E0B, #EAB308)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Achievement Categories */}
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
          const categoryIcons = {
            kindness: '💝',
            challenges: '🏆',
            social: '🤝',
            milestones: '🎯',
            special: '⭐'
          };
          
          const categoryTitles = {
            kindness: 'Kindness Achievements',
            challenges: 'Challenge Master',
            social: 'Social Engagement',
            milestones: 'Milestone Rewards',
            special: 'Special Recognition'
          };

          return (
            <div key={category} style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '16px' 
              }}>
                {categoryAchievements.map((achievement) => {
                  const isUnlocked = unlockedAchievementIds.has(achievement.id);
                  const tierStyling = getTierStyling(achievement.tier, isUnlocked);
                  
                  return (
                    <div key={achievement.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: isUnlocked ? '2px solid #F59E0B' : '2px solid #e5e7eb',
                      transform: isUnlocked ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      ...tierStyling
                    }}>
                      {/* Tier Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        ...getTierStyling(achievement.tier, true),
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {achievement.tier}
                      </div>
                      
                      {/* Badge Icon */}
                      <div style={{ 
                        fontSize: '32px', 
                        marginBottom: '8px',
                        filter: isUnlocked ? 'none' : 'grayscale(100%)'
                      }}>
                        {achievement.badge}
                      </div>
                      
                      {/* Title */}
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        marginBottom: '4px',
                        color: isUnlocked ? '#1f2937' : '#9ca3af'
                      }}>
                        {achievement.title}
                      </div>
                      
                      {/* Description */}
                      <div style={{ 
                        fontSize: '12px', 
                        color: isUnlocked ? '#6b7280' : '#9ca3af',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {achievement.description}
                      </div>
                      
                      {/* Reward */}
                      <div style={{ 
                        fontSize: '11px', 
                        color: isUnlocked ? '#10B981' : '#9ca3af',
                        fontWeight: '600'
                      }}>
                        {achievement.echoReward > 0 && `+${achievement.echoReward} $ECHO`}
                      </div>
                      
                      {/* Unlocked Indicator */}
                      {isUnlocked && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: '#10B981',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Motivational Message */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '24px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🌟</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            Keep spreading kindness!
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Every act of kindness brings you closer to new badges and rewards.
          </div>
        </div>
      </div>
    );
  };

  // Admin tab content
  const renderAdminTab = () => (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '16px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        EchoDeed™ Admin Panel ⚙️
      </h2>
      
      {/* Analytics Overview */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>📊 Analytics Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
              {(counter || defaultCounter).count.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Kindness Acts</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6' }}>
              {challenges.reduce((sum, c) => sum + c.completionCount, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Challenge Completions</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06B6D4' }}>
              {challenges.length}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Challenges</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
              {new Set(challenges.map(c => c.brandName)).size}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Partner Brands</div>
          </div>
        </div>
      </div>

      {/* Corporate Account Management */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏢</span>
          Corporate Accounts ({corporateAccounts.length})
        </h3>
        
        {corporateAccounts.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {corporateAccounts.slice(0, 3).map((account: any) => (
              <div key={account.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${account.primaryColor}20`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {account.companyName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {account.domain} • {account.industry} • {account.subscriptionTier.charAt(0).toUpperCase() + account.subscriptionTier.slice(1)} Plan
                    </div>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: account.billingStatus === 'active' ? '#10B981' : '#F59E0B',
                    backgroundColor: account.billingStatus === 'active' ? '#10B98115' : '#F59E0B15',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {account.billingStatus}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: account.primaryColor }}>
                      {account.maxEmployees}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Max Employees</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: account.primaryColor }}>
                      ${(account.monthlyBudget / 1000).toFixed(1)}k
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Monthly Budget</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: account.primaryColor }}>
                      {new Date(account.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Created</div>
                  </div>
                </div>
              </div>
            ))}
            
            {corporateAccounts.length > 3 && (
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                border: '1px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  +{corporateAccounts.length - 3} more corporate accounts
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏢</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>No corporate accounts yet</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Companies will appear here as they join the platform</div>
          </div>
        )}
      </div>

      {/* Challenge Management */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🏆 Challenge Management</h3>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Active Challenges</h4>
            <button style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              + Add Challenge
            </button>
          </div>
          
          {challenges.slice(0, 3).map((challenge) => (
            <div key={challenge.id} style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {challenge.brandLogo} {challenge.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {challenge.brandName} • {challenge.completionCount} completions • {challenge.echoReward + (challenge.bonusReward || 0)} $ECHO
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}>
                  Edit
                </button>
                <button style={{
                  backgroundColor: challenge.isActive ? '#EF4444' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}>
                  {challenge.isActive ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Management */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🤝 Partner Management</h3>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Partner Relationships</h4>
            <button style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              + Add Partner
            </button>
          </div>
          
          {Array.from(new Set(challenges.map(c => c.brandName))).slice(0, 4).map((brandName) => {
            const brandChallenges = challenges.filter(c => c.brandName === brandName);
            const totalCompletions = brandChallenges.reduce((sum, c) => sum + c.completionCount, 0);
            const totalReward = brandChallenges.reduce((sum, c) => sum + (c.echoReward + (c.bonusReward || 0)) * c.completionCount, 0);
            
            return (
              <div key={brandName} style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {brandChallenges[0]?.brandLogo} {brandName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {brandChallenges.length} challenges • {totalCompletions} completions • {totalReward} $ECHO distributed
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  Active
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Metrics */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>💰 Revenue Metrics</h3>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                $12,450
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Monthly Revenue</div>
            </div>
            
            <div style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
                $2,890
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg Per Partner</div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            fontSize: '12px',
            color: '#4b5563'
          }}>
            <strong>Revenue Breakdown:</strong> Brand Challenges (73%), Premium Features (18%), Data Insights (9%)
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>⚡ Quick Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button style={{
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            🎄 Create Holiday Campaign
          </button>
          
          <button style={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            📊 Export Analytics
          </button>
          
          <button style={{
            backgroundColor: '#06B6D4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            🚀 Launch Feature
          </button>
          
          <button style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            👥 User Insights
          </button>
        </div>
      </div>
    </div>
  );

  // Partners tab content
  const renderPartnersTab = () => (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '16px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Our Kindness Partners 🤝
      </h2>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#6b7280', 
        marginBottom: '24px',
        fontSize: '14px'
      }}>
        Companies supporting our mission to amplify kindness worldwide
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {challenges.map((challenge) => (
          <div key={challenge.id} style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #f3f4f6'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>
                {challenge.brandLogo}
              </span>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  color: '#1f2937'
                }}>
                  {challenge.brandName}
                </h3>
                <div style={{
                  fontSize: '12px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  Partner Sponsor
                </div>
              </div>
            </div>
            
            <p style={{ 
              color: '#4b5563', 
              fontSize: '14px', 
              lineHeight: '1.5',
              margin: '0 0 12px 0'
            }}>
              Supporting kindness through: <strong>{challenge.category}</strong>
            </p>
            
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <strong>Current Challenge:</strong> {challenge.title}
              <br />
              <strong>Type:</strong> {challenge.challengeType} 
              {challenge.difficulty && <span> • <strong>Difficulty:</strong> {challenge.difficulty}</span>}
              <br />
              <strong>Reward:</strong> {challenge.echoReward} $ECHO
              {challenge.bonusReward && challenge.bonusReward > 0 && (
                <span style={{ color: '#10B981' }}> + {challenge.bonusReward} bonus</span>
              )}
              <br />
              <strong>Completions:</strong> {challenge.completionCount} kindness acts inspired
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          Interested in Partnering?
        </h4>
        <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
          Contact us to sponsor kindness challenges and support positive community impact
        </p>
      </div>
    </div>
  );

  // Welcome Page
  if (showWelcome) {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#0f0f23',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 15%, #ff8a80 30%, #ffab91 45%, #ffcc80 60%, #fff59d 75%, #f8bbd9 90%, #e1bee7 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite'
        }} />
        
        {/* Floating Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,107,107,0.5), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,138,128,0.4), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,171,145,0.4), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(255,204,128,0.3), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'sparkle 6s linear infinite'
        }} />

        {/* Welcome Header */}
        <div style={{ 
          position: 'relative',
          zIndex: 2,
          color: 'white', 
          padding: '60px 20px 40px', 
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{ 
            width: '400px', 
            height: '400px', 
            margin: '0 auto 32px',
            position: 'relative',
            filter: 'drop-shadow(0 12px 48px rgba(255,107,107,0.6))',
            animation: 'logoFloat 3s ease-in-out infinite'
          }}>
            <img 
              src="/logo.png" 
              alt="EchoDeed™ Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'brightness(1.1) contrast(1.1)'
              }} 
            />
          </div>
          
          {/* Brand Name */}
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '42px', 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8a80 20%, #ffab91 40%, #ffcc80 60%, #fff59d 80%, #f8bbd9 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'titleShimmer 4s ease-in-out infinite',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em',
            textShadow: '0 0 30px rgba(139,92,246,0.3)'
          }}>
            EchoDeed™
          </h1>
          
          {/* Tagline */}
          <p style={{ 
            fontSize: '22px', 
            fontWeight: '600', 
            margin: '0 0 32px 0', 
            background: 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.01em',
            textShadow: '0 2px 20px rgba(255,255,255,0.1)'
          }}>
            Your Kindness, Amplified ✨
          </p>
          
          {/* Global Counter */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', 
            borderRadius: '20px', 
            padding: '24px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            animation: counterPulse ? 'counterPulse 0.6s ease-in-out' : 'none'
          }}>
            <div style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              opacity: 0.9,
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              🌍 Acts of Kindness Shared Globally
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '900', 
              margin: '8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {(counter || defaultCounter).count.toLocaleString()}
              <span style={{ fontSize: '36px' }}>❤️</span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              acts of kindness shared worldwide
            </div>
          </div>
        </div>

        {/* Mission & Examples */}
        <div style={{ padding: '30px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: '0 0 15px 0',
              color: '#374151'
            }}>
              Inspire Kindness Everywhere
            </h2>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              Share your anonymous acts of kindness and inspire others to spread positivity. 
              Every small gesture creates ripples of goodness across the world.
            </p>
          </div>

          {/* How It Works */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '30px',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 15px 0',
              color: '#374151',
              textAlign: 'center'
            }}>
              How to Amplify Kindness:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#8B5CF6', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>💜</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Purple Heart
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    Tap to show love and appreciation for an act of kindness
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#06B6D4', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>🌊</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                    Echo Ripple
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    Tap when you're inspired to duplicate this act of kindness
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Posts */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 15px 0',
              color: '#374151'
            }}>
              Recent Acts of Kindness:
            </h3>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #f3f4f6'
            }}>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.5', color: '#374151' }}>
                "Helped an elderly woman carry her groceries up three flights of stairs. Her smile made my whole week brighter."
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                📍 San Francisco, CA • Helping Others
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #f3f4f6'
            }}>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.5', color: '#374151' }}>
                "Left encouraging sticky notes on random cars in the parking lot. Hope it brightens someone's day!"
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                📍 Austin, TX • Spreading Positivity
              </div>
            </div>
          </div>

          {/* Call to Action Button */}
          <div style={{ 
            position: 'relative',
            zIndex: 2,
            padding: '10px 20px 20px',
            textAlign: 'center' 
          }}>
            <button 
              onClick={() => setShowWelcome(false)}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8a80, #ffab91)',
                backgroundSize: '200% 200%',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(255,107,107,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
                animation: 'buttonGlow 2s ease-in-out infinite, titleShimmer 3s ease-in-out infinite',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                width: '280px',
                maxWidth: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,107,0.6), 0 0 0 1px rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,107,0.4), 0 0 0 1px rgba(255,255,255,0.2)';
              }}
            >
              🚀 Start Spreading Kindness ❤️
            </button>
            
            {/* Magical Footer Text */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '16px',
              fontWeight: '500',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Join 250,000+ people spreading kindness worldwide 🌍✨
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show Badges tab if selected
  if (activeTab === 'badges') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                🏅
              </div>
              <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™</h1>
            </div>
            
            {/* $ECHO Balance */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>🪙</span>
              <span>{tokens?.echoBalance || 0} $ECHO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Your Kindness, Amplified</div>
        </div>

        {renderBadgesTab()}

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '430px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100
        }}>
          {[
            { id: 'feed', label: 'Feed', icon: '🏠' },
            { id: 'local', label: 'Local', icon: '📍' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'corporate', label: 'Corporate', icon: '🏢' },
            { id: 'admin', label: 'Admin', icon: '⚙️' },
          ].map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} style={{ width: '32px' }} />;
            }
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#F59E0B' : '#6b7280',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Achievement Notification */}
        {achievementNotification && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '90%',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>{achievementNotification.achievement.badge}</span>
            <div>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎉 Achievement Unlocked!</div>
              <div style={{ fontWeight: 'bold' }}>{achievementNotification.achievement.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                +{achievementNotification.echoReward} $ECHO earned!
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show Corporate tab if selected
  if (activeTab === 'corporate') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                🏢
              </div>
              <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™ B2B</h1>
            </div>
            
            {/* $ECHO Balance */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>🪙</span>
              <span>{tokens?.echoBalance || 0} $ECHO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Corporate Wellness & Kindness Platform</div>
        </div>

        {renderCorporateTab()}

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '430px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100
        }}>
          {[
            { id: 'feed', label: 'Feed', icon: '🏠' },
            { id: 'local', label: 'Local', icon: '📍' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'corporate', label: 'Corporate', icon: '🏢' },
            { id: 'admin', label: 'Admin', icon: '⚙️' },
          ].map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} style={{ width: '32px' }} />;
            }
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Show Admin tab if selected
  if (activeTab === 'admin') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                ⚙️
              </div>
              <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™ Admin</h1>
            </div>
            
            {/* $ECHO Balance */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>🪙</span>
              <span>{tokens?.echoBalance || 0} $ECHO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Platform Management Dashboard</div>
        </div>

        {renderAdminTab()}

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '430px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100
        }}>
          {[
            { id: 'feed', label: 'Feed', icon: '🏠' },
            { id: 'local', label: 'Local', icon: '📍' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'corporate', label: 'Corporate', icon: '🏢' },
            { id: 'admin', label: 'Admin', icon: '⚙️' },
          ].map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} style={{ width: '32px' }} />;
            }
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Token Earning Popup */}
        {tokenEarning && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🪙</span>
            <div>
              <div>+{tokenEarning.amount} $ECHO</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{tokenEarning.reason}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show Partners tab if selected
  if (activeTab === 'partners') {
    return (
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                ❤️
              </div>
              <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™</h1>
            </div>
            
            {/* $ECHO Balance */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>🪙</span>
              <span>{tokens?.echoBalance || 0} $ECHO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Your Kindness, Amplified</div>
        </div>

        {renderPartnersTab()}

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '430px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100
        }}>
          {[
            { id: 'feed', label: 'Feed', icon: '🏠' },
            { id: 'local', label: 'Local', icon: '📍' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'corporate', label: 'Corporate', icon: '🏢' },
            { id: 'admin', label: 'Admin', icon: '⚙️' },
          ].map((tab) => {
            if (tab.id === 'spacer') {
              return <div key={tab.id} style={{ width: '32px' }} />;
            }
            
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                  backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Token Earning Popup */}
        {tokenEarning && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🪙</span>
            <div>
              <div>+{tokenEarning.amount} $ECHO</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{tokenEarning.reason}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main App
  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              ❤️
            </div>
            <h1 style={{ margin: '0', fontSize: '20px' }}>EchoDeed™</h1>
          </div>
          
          {/* $ECHO Balance */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '16px' }}>🪙</span>
            <span>{tokens?.echoBalance || 0} $ECHO</span>
          </div>
        </div>
        
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.9 }}>Global Kindness Counter</div>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: '8px 0',
          className: counterPulse ? 'counter-pulse' : ''
        }}>
          {(counter || defaultCounter).count.toLocaleString()} ❤️
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>acts of kindness shared</div>
      </div>
      
      {/* Filter Bar */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <button 
          style={activeFilter === 'global' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('global', {})}
        >
          🌍 Global
        </button>
        <button 
          style={activeFilter === 'helping' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('helping', { category: 'Helping Others' })}
        >
          🤝 Helping Others
        </button>
        <button 
          style={activeFilter === 'community' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('community', { category: 'Community Action' })}
        >
          👥 Community
        </button>
        <button 
          style={activeFilter === 'positivity' ? activeButtonStyle : buttonStyle}
          onClick={() => handleFilterChange('positivity', { category: 'Spreading Positivity' })}
        >
          😊 Positivity
        </button>
      </div>
      
      {/* Feed */}
      <div style={{ backgroundColor: '#f8f9fa', paddingBottom: '100px' }}>
        
        {/* Brand Challenges Section */}
        {challenges.length > 0 && (
          <div style={{ padding: '16px 16px 0 16px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              🏆 Brand Challenges - Higher Rewards!
            </h3>
            {challenges.slice(0, 2).map((challenge) => { // Show only 2 challenges in feed
              const isCompleted = completedChallenges.includes(challenge.id);
              return (
                <div key={challenge.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #10B981',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Sponsored Label */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}>
                    SPONSORED
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    paddingRight: '80px' // Make room for sponsored label
                  }}>
                    <span style={{ fontSize: '32px', marginRight: '12px' }}>
                      {challenge.brandLogo}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          margin: 0,
                          color: '#1f2937'
                        }}>
                          {challenge.title}
                        </h4>
                        
                        {/* Difficulty Badge */}
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          backgroundColor: challenge.difficulty === 'advanced' ? '#EF4444' : 
                                         challenge.difficulty === 'intermediate' ? '#F59E0B' : '#10B981',
                          color: 'white'
                        }}>
                          {challenge.difficulty?.toUpperCase()}
                        </span>
                        
                        {/* Priority/Featured Badge */}
                        {challenge.isPriority === 1 && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            backgroundColor: '#8B5CF6',
                            color: 'white'
                          }}>
                            FEATURED
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#10B981', 
                          margin: 0,
                          fontWeight: '600'
                        }}>
                          by {challenge.brandName}
                        </p>
                        
                        {/* Challenge Type Indicator */}
                        {challenge.challengeType === 'seasonal' && challenge.seasonalTheme && (
                          <span style={{
                            fontSize: '10px',
                            color: '#8B5CF6',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            🎄 {challenge.seasonalTheme.toUpperCase()}
                          </span>
                        )}
                        
                        {challenge.challengeType === 'recurring' && (
                          <span style={{
                            fontSize: '10px',
                            color: '#06B6D4',
                            backgroundColor: '#F0F9FF',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            🔄 {challenge.recurringPeriod?.toUpperCase()}
                          </span>
                        )}
                        
                        {challenge.challengeType === 'location' && (
                          <span style={{
                            fontSize: '10px',
                            color: '#059669',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            📍 LOCAL
                          </span>
                        )}
                        
                        {(challenge.minParticipants && challenge.minParticipants > 1) && (
                          <span style={{
                            fontSize: '10px',
                            color: '#7C3AED',
                            backgroundColor: '#F5F3FF',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            👥 TEAM ({challenge.minParticipants}-{challenge.maxParticipants})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: '#4b5563', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {challenge.content}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        backgroundColor: '#fef3c7', 
                        color: '#92400e',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontWeight: '500'
                      }}>
                        {challenge.category}
                      </span>
                      
                      <div>
                        <strong>{challenge.echoReward} $ECHO</strong>
                        {challenge.bonusReward && challenge.bonusReward > 0 && (
                          <span style={{ 
                            color: '#10B981',
                            fontWeight: '600',
                            marginLeft: '4px'
                          }}>
                            + {challenge.bonusReward} bonus
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCompleteChallenge(challenge.id, challenge.brandName, challenge.echoReward + (challenge.bonusReward || 0))}
                      disabled={isCompleted}
                      style={{
                        backgroundColor: isCompleted ? '#9ca3af' : '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isCompleted ? 'not-allowed' : 'pointer',
                        opacity: isCompleted ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isCompleted ? '✅ Completed' : 
                        `Complete (+${challenge.echoReward + (challenge.bonusReward || 0)} $ECHO)`}
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#9ca3af',
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    {challenge.completionCount} people have completed this challenge
                  </div>
                </div>
              );
            })}
            
            {/* View more challenges link */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('partners')}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View All Partner Challenges 🤝
              </button>
            </div>
          </div>
        )}
        
        {postsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div>Loading acts of kindness...</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No acts of kindness found</h3>
            <p>Be the first to share a kind deed in this area!</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} style={{ 
              backgroundColor: 'white',
              margin: '1px 0',
              padding: '20px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  ❤️
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    lineHeight: '1.5',
                    color: '#374151'
                  }}>
                    {post.content}
                  </p>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📍 {post.location}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span style={{ 
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {post.category}
                    </span>
                  </div>
                  
                  {/* Interaction Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}>
                    <button
                      onClick={() => handleHeartPost(post.id)}
                      title="Show love for this kindness! (Earn 1 $ECHO 🪙)"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#8B5CF6';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#8B5CF6';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>💜</span>
                      <span>{post.heartsCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleEchoPost(post.id)}
                      title="Echo this kindness! Commit to doing it too! (Earn 2 $ECHO 🪙)"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#06B6D4';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#06B6D4';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>🌊</span>
                      <span>{post.echoesCount || 0} Echo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          backgroundColor: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        +
      </button>
      
      {/* Post Modal */}
      <PostDeedModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        location={location}
      />
      
      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '430px',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        zIndex: 100
      }}>
        {[
          { id: 'feed', label: 'Feed', icon: '🏠' },
          { id: 'local', label: 'Local', icon: '📍' },
          { id: 'badges', label: 'Badges', icon: '🏅' },
          { id: 'corporate', label: 'Corporate', icon: '🏢' },
          { id: 'admin', label: 'Admin', icon: '⚙️' },
        ].map((tab) => {
          if (tab.id === 'spacer') {
            return <div key={tab.id} style={{ width: '32px' }} />;
          }
          
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                color: activeTab === tab.id ? '#8B5CF6' : '#6b7280',
                fontSize: '12px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Token Earning Popup */}
      {tokenEarning && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>🪙</span>
          <div>
            <div>+{tokenEarning.amount} $ECHO</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{tokenEarning.reason}</div>
          </div>
        </div>
      )}
      
    </div>
  );
}
