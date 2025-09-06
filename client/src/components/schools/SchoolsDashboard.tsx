import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Award, TrendingUp, Heart, Star, CheckCircle, Calendar, Bell, User, Settings, BarChart } from 'lucide-react';

interface SchoolUser {
  id: string;
  role: 'student' | 'teacher' | 'admin' | 'principal';
  gradeLevel?: string;
  className?: string;
}

interface StudentStats {
  totalPoints: number;
  weeklyPoints: number;
  currentStreak: number;
  level: number;
  badges: string[];
  rank: number;
}

interface ClassroomStats {
  name: string;
  teacherName: string;
  studentCount: number;
  totalKindnessPoints: number;
  averageScore: number;
}

export function SchoolsDashboard() {
  const [userRole, setUserRole] = useState<string>('student'); // Default to student view
  const [selectedView, setSelectedView] = useState<string>('dashboard');

  // Student Dashboard Component
  const StudentDashboard = () => {
    const mockStudentStats: StudentStats = {
      totalPoints: 245,
      weeklyPoints: 45,
      currentStreak: 7,
      level: 3,
      badges: ['helper', 'sharer', 'kind_heart'],
      rank: 12
    };

    const mockAssignments = [
      { id: '1', title: 'Help a New Student', dueDate: '2025-09-10', points: 15, category: 'helping' },
      { id: '2', title: 'Share School Supplies', dueDate: '2025-09-12', points: 10, category: 'sharing' },
      { id: '3', title: 'Thank a Teacher', dueDate: '2025-09-15', points: 12, category: 'caring' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
        {/* Student Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <BookOpen size={28} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>My Kindness Journey 🌟</h2>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>3rd Grade • Mrs. Johnson's Class</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{mockStudentStats.totalPoints}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Points</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>#{mockStudentStats.rank}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Class Rank</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{mockStudentStats.currentStreak}🔥</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Day Streak</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>Lv.{mockStudentStats.level}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Kindness Level</div>
            </div>
          </div>
        </div>

        {/* Active Assignments */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#8B5CF6" />
            My Kindness Assignments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockAssignments.map(assignment => (
              <div key={assignment.id} style={{
                background: 'rgba(139,92,246,0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(139,92,246,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#374151' }}>{assignment.title}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#8B5CF6' }}>+{assignment.points}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Badges */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#F59E0B" />
            My Kindness Badges
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤝</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>Helper</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Helped 10 friends</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245,158,11,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#F59E0B' }}>Sharer</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Shared 15 times</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>❤️</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>Kind Heart</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Showed caring</div>
            </div>
          </div>
        </div>

        {/* Class Leaderboard */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="#3B82F6" />
            Class Kindness Leaders
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Emma S. (285 pts)', 'Marcus T. (267 pts)', 'You! (245 pts)', 'Lily R. (231 pts)', 'James K. (218 pts)'].map((student, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: index === 2 ? 'rgba(139,92,246,0.1)' : 'rgba(243,244,246,0.5)',
                borderRadius: '8px',
                fontWeight: index === 2 ? '600' : '400',
                color: index === 2 ? '#8B5CF6' : '#374151'
              }}>
                <span>#{index + 1} {student.split(' (')[0]}</span>
                <span>{student.split('(')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Teacher Dashboard Component
  const TeacherDashboard = () => {
    const mockClassroomStats: ClassroomStats[] = [
      { name: "3rd Grade Class A", teacherName: "You", studentCount: 24, totalKindnessPoints: 3420, averageScore: 142.5 },
      { name: "School Average", teacherName: "All Teachers", studentCount: 456, totalKindnessPoints: 45280, averageScore: 99.3 }
    ];

    const pendingApprovals = [
      { id: '1', studentName: 'Emma S.', activity: 'Helped new student find classroom', points: 15, timeAgo: '2 hours ago' },
      { id: '2', studentName: 'Marcus T.', activity: 'Shared lunch with friend who forgot', points: 12, timeAgo: '5 hours ago' },
      { id: '3', studentName: 'Lily R.', activity: 'Picked up trash in hallway', points: 8, timeAgo: '1 day ago' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
        {/* Teacher Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Users size={28} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Teacher Dashboard 🍎</h2>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Mrs. Johnson • 3rd Grade Class A</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>24</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Students</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>3,420</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Class Points</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>142.5</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Avg Score</div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#F59E0B" />
            Pending Approvals ({pendingApprovals.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApprovals.map(approval => (
              <div key={approval.id} style={{
                background: 'rgba(245,158,11,0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#374151' }}>{approval.studentName}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{approval.activity}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>{approval.timeAgo}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✓ Approve (+{approval.points})
                  </button>
                  <button style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Performance Grid */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart size={20} color="#8B5CF6" />
            Top Performing Students This Week
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { name: 'Emma S.', points: 67, activities: 8, trend: '+12%' },
              { name: 'Marcus T.', points: 54, activities: 6, trend: '+8%' },
              { name: 'Lily R.', points: 48, activities: 7, trend: '+15%' },
              { name: 'James K.', points: 42, activities: 5, trend: '+3%' }
            ].map(student => (
              <div key={student.name} style={{
                background: 'rgba(139,92,246,0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(139,92,246,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>{student.name}</span>
                  <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '600' }}>{student.trend}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {student.points} points • {student.activities} activities
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard Component  
  const AdminDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
        {/* Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Settings size={28} />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>School Administration 🏫</h2>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Lincoln Elementary School District</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>456</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Students</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>23</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Teachers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>18,542</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Acts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>94%</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Participation</div>
            </div>
          </div>
        </div>

        {/* School-wide Analytics */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📊 School-wide Kindness Analytics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>Anti-Bullying Impact</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                73% reduction in reported incidents
              </div>
            </div>
            <div style={{ background: 'rgba(59,130,246,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>SEL Compliance</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                98% meeting state standards
              </div>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>Parent Engagement</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                86% active participation
              </div>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>Academic Impact</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                12% increase in test scores
              </div>
            </div>
          </div>
        </div>

        {/* District Reporting */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📋 District Reporting & Compliance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Monthly SEL Report', status: 'Ready', color: '#10B981' },
              { title: 'Anti-Bullying Analytics', status: 'Ready', color: '#10B981' },
              { title: 'Parent Communication Log', status: 'Generating', color: '#F59E0B' },
              { title: 'Grant Funding Documentation', status: 'Ready', color: '#10B981' }
            ].map(report => (
              <div key={report.title} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: `rgba(${report.color === '#10B981' ? '16,185,129' : '245,158,11'},0.05)`,
                borderRadius: '8px',
                border: `1px solid rgba(${report.color === '#10B981' ? '16,185,129' : '245,158,11'},0.2)`
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>{report.title}</span>
                <span style={{ color: report.color, fontWeight: '600' }}>{report.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const roleOptions = [
    { id: 'student', label: '🎒 Student View', description: 'Age-appropriate kindness journey' },
    { id: 'teacher', label: '🍎 Teacher Dashboard', description: 'Classroom management & analytics' },
    { id: 'admin', label: '🏫 School Admin', description: 'District reporting & compliance' }
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Role Selector */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 16px 0', textAlign: 'center' }}>
          🏫 EchoDeed for Schools
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 20px 0', textAlign: 'center' }}>
          Transforming school culture through measurable kindness
        </p>

        {/* Role Selector */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {roleOptions.map(role => (
            <button
              key={role.id}
              onClick={() => setUserRole(role.id)}
              style={{
                background: userRole === role.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                border: `2px solid ${userRole === role.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                minWidth: '130px'
              }}
              data-testid={`button-role-${role.id}`}
            >
              <div>{role.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>{role.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        {userRole === 'student' && <StudentDashboard />}
        {userRole === 'teacher' && <TeacherDashboard />}
        {userRole === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}