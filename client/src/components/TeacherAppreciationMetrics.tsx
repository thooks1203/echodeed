import { useQuery } from '@tanstack/react-query';
import { GraduationCap, TrendingUp, Heart } from 'lucide-react';

interface TeacherAppreciationMetricsProps {
  schoolId: string;
}

export function TeacherAppreciationMetrics({ schoolId }: TeacherAppreciationMetricsProps) {
  // Fetch teacher kudos stats for the school
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/teacher-kudos/stats', schoolId],
    enabled: !!schoolId,
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          Loading teacher appreciation data...
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const topTeachers = stats.teacherStats?.slice(0, 3) || [];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px' 
      }}>
        <GraduationCap style={{ color: '#ec4899' }} size={20} />
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#ec4899' }}>
          💝 Teacher Uplift Pulse
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', padding: '12px', background: '#fdf2f8', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ec4899' }}>
            {stats.totalTeachers || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Teachers</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
            {stats.totalKudos || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Student Kudos</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>
            {stats.averageKudosPerTeacher?.toFixed(1) || '0.0'}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg per Teacher</div>
        </div>
      </div>

      {topTeachers.length > 0 && (
        <>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px',
            color: '#374151'
          }}>
            ⭐ Most Appreciated Teachers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topTeachers.map((teacher: any, index: number) => (
              <div
                key={teacher.teacherId}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: index === 0 ? '#fef2f2' : '#f9fafb',
                  border: `1px solid ${index === 0 ? '#fecaca' : '#e5e7eb'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {teacher.teacherName}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: '#ec4899',
                  fontWeight: '600'
                }}>
                  <Heart size={14} />
                  <span style={{ fontSize: '14px' }}>{teacher.kudosCount}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '8px',
        border: '1px solid #bfdbfe'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#1e40af',
          margin: 0,
          lineHeight: '1.5'
        }}>
          💡 <strong>Teacher Uplift Pulse</strong> tracks student appreciation. When students share kindness acts, they can tag teachers who inspired them—boosting teacher morale and recognition!
        </p>
      </div>
    </div>
  );
}
