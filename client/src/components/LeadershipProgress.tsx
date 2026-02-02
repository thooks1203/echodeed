import { useQuery } from '@tanstack/react-query';
import { addSessionHeaders } from '@/lib/session';

interface ServiceSummary {
  totalHours: number;
  verifiedHours: number;
  pendingHours: number;
  annualGoal: number;
  progressPercentage: number;
  totalActivities: number;
  recentActivities: Array<{
    id: string;
    activityName: string;
    hours: number;
    status: string;
    loggedAt: string;
  }>;
}

interface LeadershipProgressProps {
  userId?: string;
}

export function LeadershipProgress({ userId }: LeadershipProgressProps) {
  const { data: summary, isLoading, error } = useQuery<ServiceSummary>({
    queryKey: ['/api/community-service/summary', userId],
    queryFn: async () => {
      const res = await fetch(`/api/community-service/summary/${userId || 'student-001'}`, {
        headers: addSessionHeaders()
      });
      if (!res.ok) {
        // Return default data for demo mode
        return {
          totalHours: 47.5,
          verifiedHours: 42,
          pendingHours: 5.5,
          annualGoal: 200,
          progressPercentage: 21,
          totalActivities: 8,
          recentActivities: []
        };
      }
      return res.json();
    },
    enabled: !!userId,
  });

  // Use demo data if loading or error
  const displayData = summary || {
    totalHours: 47.5,
    verifiedHours: 42,
    pendingHours: 5.5,
    annualGoal: 200,
    progressPercentage: 21,
    totalActivities: 8,
    recentActivities: []
  };

  const progressPercent = Math.min(100, (displayData.verifiedHours / displayData.annualGoal) * 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
      borderRadius: '16px',
      padding: '20px',
      color: 'white',
      boxShadow: '0 4px 20px rgba(30, 58, 95, 0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '32px' }}>🎓</span>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
            Service-Learning Diploma
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
            200-Hour Community Service Achievement
          </p>
        </div>
      </div>

      {/* Progress Circle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(#10B981 ${progressPercent}%, #374151 ${progressPercent}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#1e3a5f',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px', fontWeight: '700' }}>
              {displayData.verifiedHours}
            </span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              of {displayData.annualGoal} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px', 
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
            {displayData.verifiedHours}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Verified</div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px', 
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
            {displayData.pendingHours}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Pending</div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px', 
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#06B6D4' }}>
            {displayData.totalActivities}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Activities</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '6px',
          fontSize: '12px'
        }}>
          <span>Progress to Diploma</span>
          <span style={{ color: '#10B981', fontWeight: '600' }}>{progressPercent.toFixed(1)}%</span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #10B981, #06B6D4)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Milestone Badges */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[
          { hours: 50, icon: '🌱', label: 'Starter' },
          { hours: 100, icon: '🌿', label: 'Growing' },
          { hours: 150, icon: '🌳', label: 'Thriving' },
          { hours: 200, icon: '🎓', label: 'Graduate' }
        ].map((milestone) => {
          const achieved = displayData.verifiedHours >= milestone.hours;
          return (
            <div key={milestone.hours} style={{ 
              textAlign: 'center',
              opacity: achieved ? 1 : 0.4
            }}>
              <div style={{ 
                fontSize: '24px', 
                marginBottom: '4px',
                filter: achieved ? 'none' : 'grayscale(100%)'
              }}>
                {milestone.icon}
              </div>
              <div style={{ fontSize: '10px', fontWeight: '600' }}>{milestone.hours}h</div>
              <div style={{ fontSize: '9px', opacity: 0.7 }}>{milestone.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
