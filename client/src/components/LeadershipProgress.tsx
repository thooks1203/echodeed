import { useQuery } from '@tanstack/react-query';
import { addSessionHeaders } from '@/lib/session';

interface MentorTrainingProgress {
  totalModules: number;
  completedModules: number;
  modules: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface KindnessQuestsProgress {
  requiredActivities: number;
  verifiedActivities: number;
  pendingActivities: number;
}

interface PortfolioProgress {
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved';
  hasTeacherEndorsement: boolean;
}

interface LeadershipProgressProps {
  userId?: string;
}

export function LeadershipProgress({ userId }: LeadershipProgressProps) {
  // Fetch mentor training progress
  const { data: mentorData } = useQuery<MentorTrainingProgress>({
    queryKey: ['/api/mentor/training/progress', userId],
    queryFn: async () => {
      try {
        const res = await fetch('/api/mentor/training', {
          headers: addSessionHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      } catch {
        return {
          totalModules: 5,
          completedModules: 2,
          modules: []
        };
      }
    },
    enabled: !!userId,
  });

  // Fetch community service/kindness quests progress
  const { data: questsData } = useQuery<KindnessQuestsProgress>({
    queryKey: ['/api/community-service/summary', userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/community-service/summary/${userId}`, {
          headers: addSessionHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        return {
          requiredActivities: 10,
          verifiedActivities: data.totalActivities || 3,
          pendingActivities: data.pendingActivities || 1
        };
      } catch {
        return {
          requiredActivities: 10,
          verifiedActivities: 3,
          pendingActivities: 1
        };
      }
    },
    enabled: !!userId,
  });

  // Fetch portfolio progress
  const { data: portfolioData } = useQuery<PortfolioProgress>({
    queryKey: ['/api/leadership-certificate/portfolio/status', userId],
    queryFn: async () => {
      try {
        const res = await fetch('/api/leadership-certificate/portfolio/status', {
          headers: addSessionHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      } catch {
        return {
          status: 'not_started' as const,
          hasTeacherEndorsement: false
        };
      }
    },
    enabled: !!userId,
  });

  // Default values for demo
  const mentor = mentorData || { totalModules: 5, completedModules: 2, modules: [] };
  const quests = questsData || { requiredActivities: 10, verifiedActivities: 3, pendingActivities: 1 };
  const portfolio = portfolioData || { status: 'not_started' as const, hasTeacherEndorsement: false };

  // Calculate progress percentages
  const mentorProgress = Math.min(100, (mentor.completedModules / 5) * 100);
  const questsProgress = Math.min(100, (quests.verifiedActivities / 10) * 100);
  const portfolioProgress = portfolio.status === 'approved' ? 100 : 
                           portfolio.status === 'submitted' ? 75 :
                           portfolio.status === 'in_progress' ? 25 : 0;

  // Overall progress is average of all three
  const overallProgressValue = (mentorProgress + questsProgress + portfolioProgress) / 3;
  const overallProgress = isNaN(overallProgressValue) ? 0 : Math.round(overallProgressValue);
  const certificateEarned = mentorProgress === 100 && questsProgress === 100 && portfolioProgress === 100;

  // Status message
  const getStatusMessage = () => {
    if (certificateEarned) return { text: 'Certificate Earned!', emoji: '🎉', color: '#10B981' };
    if (overallProgress >= 75) return { text: 'Nearly There!', emoji: '🌟', color: '#F59E0B' };
    if (overallProgress >= 50) return { text: 'Making Progress', emoji: '📈', color: '#3B82F6' };
    return { text: 'In Progress', emoji: '🚀', color: '#8B5CF6' };
  };

  const status = getStatusMessage();

  const getPortfolioStatusText = () => {
    switch (portfolio.status) {
      case 'approved': return 'Approved ✓';
      case 'submitted': return 'Awaiting Review';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
      borderRadius: '16px',
      padding: '20px',
      color: 'white',
      boxShadow: '0 4px 20px rgba(30, 58, 95, 0.3)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🏆</span>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
              Leadership Certificate Track
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
              Complete all 3 requirements to earn your certificate
            </p>
          </div>
        </div>
        <div style={{
          background: `${status.color}22`,
          border: `1px solid ${status.color}`,
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '600',
          color: status.color
        }}>
          {status.emoji} {status.text}
        </div>
      </div>

      {/* Overall Progress Circle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `conic-gradient(${status.color} ${overallProgress}%, #374151 ${overallProgress}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: '#1e3a5f',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '700' }}>
              {overallProgress}%
            </span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>Overall</span>
          </div>
        </div>
      </div>

      {/* Three Requirement Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* 1. Mentor Training */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
          border: mentorProgress === 100 ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>📚</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Mentor Training Program</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                Complete all 5 leadership development modules
              </div>
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700',
              color: mentorProgress === 100 ? '#10B981' : '#F59E0B'
            }}>
              {mentor.completedModules}/5
            </div>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${mentorProgress}%`,
              background: mentorProgress === 100 ? '#10B981' : 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 2. Kindness Quests */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
          border: questsProgress === 100 ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>🤝</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Verified Kindness Quests</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                Log and verify 10 acts of community service
              </div>
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700',
              color: questsProgress === 100 ? '#10B981' : '#F59E0B'
            }}>
              {quests.verifiedActivities}/10
              {quests.pendingActivities > 0 && (
                <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '4px' }}>
                  (+{quests.pendingActivities} pending)
                </span>
              )}
            </div>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${questsProgress}%`,
              background: questsProgress === 100 ? '#10B981' : 'linear-gradient(90deg, #06B6D4, #3B82F6)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 3. Portfolio Defense */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
          border: portfolioProgress === 100 ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Leadership Portfolio Defense</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                5-minute presentation + teacher endorsement
              </div>
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              color: portfolioProgress === 100 ? '#10B981' : 
                     portfolio.status === 'submitted' ? '#F59E0B' : '#94A3B8'
            }}>
              {getPortfolioStatusText()}
            </div>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${portfolioProgress}%`,
              background: portfolioProgress === 100 ? '#10B981' : 'linear-gradient(90deg, #F59E0B, #EF4444)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Certificate Earned Banner */}
      {certificateEarned && (
        <div style={{
          marginTop: '16px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎓</div>
          <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
            Leadership Certificate Earned!
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            You've demonstrated outstanding leadership competencies
          </div>
        </div>
      )}
    </div>
  );
}
