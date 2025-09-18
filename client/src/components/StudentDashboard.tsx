import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BackButton } from '@/components/BackButton';

interface StudentStats {
  totalKindnessPoints: number;
  weeklyProgress: number;
  monthlyGoal: number;
  completedChallenges: number;
  currentStreak: number;
}

interface StudentDashboardProps {
  onNavigateToTab?: (tab: string) => void;
  activeBottomTab?: string;
}

export function StudentDashboard({ onNavigateToTab, activeBottomTab = 'feed' }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'progress'>('overview');

  // Fetch student's personal data only (no access to other students' data)
  const { data: studentStats } = useQuery<StudentStats>({
    queryKey: ['/api/students/my-stats'],
    queryFn: () => {
      // Mock data for student - in production this would be a secure endpoint
      return Promise.resolve({
        totalKindnessPoints: 245,
        weeklyProgress: 15,
        monthlyGoal: 50,
        completedChallenges: 8,
        currentStreak: 5
      });
    }
  });

  const stats = studentStats || {
    totalKindnessPoints: 245,
    weeklyProgress: 15,
    monthlyGoal: 50,
    completedChallenges: 8,
    currentStreak: 5
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
        {/* Back Button */}
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <BackButton 
            onClick={() => onNavigateToTab ? onNavigateToTab('feed') : window.location.href = '/'}
            label="Feed"
            variant="minimal"
            style={{
              color: '#6B7280',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '32px' }}>👨‍🎓</span>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            My Kindness Journey
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Welcome back, {user.name}! • Grade {user.grade}
        </p>
      </div>

      {/* Student Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌟</div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
          {stats.totalKindnessPoints} Kindness Points
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
          You're making a difference every day!
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        background: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'challenges', label: '🎯 Challenges' },
          { id: 'progress', label: '📈 Progress' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? '#10B981' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280'
            }}
            data-testid={`student-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Personal Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>
                {stats.weeklyProgress}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>This Week</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>
                {stats.currentStreak}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Day Streak</div>
            </div>
          </div>

          {/* Monthly Progress */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              📅 Monthly Goal Progress
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                {stats.weeklyProgress} / {stats.monthlyGoal} points
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {Math.round((stats.weeklyProgress / stats.monthlyGoal) * 100)}% complete
              </div>
            </div>
            <div style={{
              background: '#F3F4F6',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                height: '100%',
                width: `${Math.min((stats.weeklyProgress / stats.monthlyGoal) * 100, 100)}%`,
                borderRadius: '8px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Recent Achievements */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              🏆 Recent Achievements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎯</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Kindness Streak Master</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>5 days in a row!</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>⭐</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Helping Hand</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Completed 8 challenges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Challenge Center
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Complete kindness challenges to earn points and make a difference!
          </p>
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('summer')}
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            data-testid="button-view-challenges"
          >
            View Available Challenges
          </button>
        </div>
      )}

      {activeTab === 'progress' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Progress Tracking
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Track your kindness journey and see how you're growing!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                {stats.completedChallenges}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Challenges Done</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#06B6D4' }}>
                {stats.totalKindnessPoints}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Important Security Notice - Only for Demo */}
      <div style={{
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          🔒 Student Dashboard
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          You only see your own data - no access to other students' information
        </div>
      </div>
    </div>
  );
}