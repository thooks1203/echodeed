import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { BottomNavigation } from '@/components/BottomNavigation';

interface School {
  id: string;
  name: string;
  type: 'elementary' | 'middle' | 'high' | 'university';
  studentCount: number;
  teacherCount: number;
  totalKindnessActs: number;
  avgKindnessScore: number;
}

interface StudentKindnessPoint {
  studentId: string;
  studentName: string;
  className: string;
  grade: string;
  totalPoints: number;
  weeklyProgress: number;
}

interface SchoolsDashboardProps {
  onNavigateToTab?: (tab: string) => void;
  activeBottomTab?: string;
}

export function SchoolsDashboard({ onNavigateToTab, activeBottomTab = 'schools' }: SchoolsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'student' | 'teacher' | 'admin' | 'parent'>('overview');
  const [, navigate] = useLocation();

  // Fetch schools data
  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  // Fetch student points
  const { data: studentPoints = [] } = useQuery<StudentKindnessPoint[]>({
    queryKey: ['/api/schools/student-points'],
  });

  // Sample data for demonstration
  const sampleSchools: School[] = schools.length > 0 ? schools : [
    {
      id: '1',
      name: 'Riverside Elementary School',
      type: 'elementary',
      studentCount: 345,
      teacherCount: 28,
      totalKindnessActs: 1247,
      avgKindnessScore: 8.4
    },
    {
      id: '2', 
      name: 'Jefferson Middle School',
      type: 'middle',
      studentCount: 567,
      teacherCount: 42,
      totalKindnessActs: 2156,
      avgKindnessScore: 7.9
    },
    {
      id: '3',
      name: 'Lincoln High School', 
      type: 'high',
      studentCount: 892,
      teacherCount: 67,
      totalKindnessActs: 3489,
      avgKindnessScore: 8.1
    },
    {
      id: '4',
      name: 'State University',
      type: 'university', 
      studentCount: 12450,
      teacherCount: 234,
      totalKindnessActs: 8967,
      avgKindnessScore: 7.6
    }
  ];

  const sampleStudentPoints: StudentKindnessPoint[] = studentPoints.length > 0 ? studentPoints : [
    { studentId: '1', studentName: 'Emma Johnson', className: '6A', grade: '6th', totalPoints: 245, weeklyProgress: 15 },
    { studentId: '2', studentName: 'Liam Smith', className: '6B', grade: '6th', totalPoints: 198, weeklyProgress: 12 },
    { studentId: '3', studentName: 'Olivia Davis', className: '7A', grade: '7th', totalPoints: 267, weeklyProgress: 18 },
    { studentId: '4', studentName: 'Noah Wilson', className: '7B', grade: '7th', totalPoints: 189, weeklyProgress: 9 },
    { studentId: '5', studentName: 'Sophia Brown', className: '8A', grade: '8th', totalPoints: 321, weeklyProgress: 22 }
  ];

  const getSchoolIcon = (type: string) => {
    switch (type) {
      case 'elementary': return '🏫';
      case 'middle': return '🏤';
      case 'high': return '🏛️';
      case 'university': return '🎓';
      default: return '🏫';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '32px' }}>🎓</span>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            EchoDeed™ for Schools
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Social-Emotional Learning through acts of kindness
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'student', label: '👨‍🎓 Student' },
          { id: 'teacher', label: '👩‍🏫 Teacher' },
          { id: 'admin', label: '👩‍💼 Admin' },
          { id: 'parent', label: '👨‍👩‍👧‍👦 Parents' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'parent') {
                navigate('/parent');
              } else if (tab.id === 'admin') {
                navigate('/admin');
              } else {
                setActiveTab(tab.id as any);
              }
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? '#7C3AED' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
            data-testid={`school-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Direct Parent Portal Access */}
      <div style={{ 
        background: '#EEF2FF', 
        border: '1px solid #C7D2FE', 
        borderRadius: '8px', 
        padding: '12px', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4338CA' }}>
          👨‍👩‍👧‍👦 Are you a parent? Track your child's kindness journey
        </p>
        <button
          onClick={() => navigate('/parent')}
          style={{
            background: '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          data-testid="parent-portal-access"
        >
          Access Parent Dashboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Schools Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {sampleSchools.map((school) => (
              <div
                key={school.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{getSchoolIcon(school.type)}</span>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#111827' }}>
                      {school.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                      {school.type} • {school.studentCount} students
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#f0f9ff', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '700', color: '#1e40af' }}>{school.totalKindnessActs}</div>
                    <div style={{ color: '#6b7280' }}>Kind Acts</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '700', color: '#166534' }}>{school.avgKindnessScore}/10</div>
                    <div style={{ color: '#6b7280' }}>Avg Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(236,72,153,0.1) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#7C3AED' }}>
                📊 Lincoln Unified School District
              </h3>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: '#7C3AED',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                data-testid="district-admin-access"
              >
                👩‍💼 District Admin
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#7C3AED' }}>
                  {sampleSchools.reduce((sum, school) => sum + school.studentCount, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Students</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#EC4899' }}>
                  {sampleSchools.reduce((sum, school) => sum + school.totalKindnessActs, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Kindness Acts</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                  {sampleSchools.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Schools</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'student' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Student Profile Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>👨‍🎓</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
              Emma Johnson
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              6th Grade • Riverside Middle School
            </p>
          </div>

          {/* My Kindness Stats */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#7C3AED' }}>
              📊 My Kindness Journey
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>245</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Kindness Points</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#166534' }}>15</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>This Week</div>
              </div>
            </div>
          </div>

          {/* My Recent Acts */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              🌟 My Recent Kind Acts
            </h3>
            {[
              { act: 'Helped classmate with math homework', points: 5, date: 'Today' },
              { act: 'Shared lunch with new student', points: 8, date: 'Yesterday' },
              { act: 'Cleaned up classroom without being asked', points: 6, date: '2 days ago' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.act}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.date}</div>
                </div>
                <div style={{
                  background: '#7C3AED',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  +{item.points}
                </div>
              </div>
            ))}
          </div>

          {/* New Kind Act Button */}
          <button style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center'
          }}>
            ✨ Record New Kind Act
          </button>
        </div>
      )}

      {activeTab === 'teacher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Teacher Profile */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>👩‍🏫</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
              Mrs. Sarah Davis
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              5th Grade Teacher • Room 12A
            </p>
          </div>

          {/* Class Statistics */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>
              📚 My Class Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>28</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Students</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>156</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Class Points</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>8.2</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg Score</div>
              </div>
            </div>
          </div>

          {/* Active Assignments */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              📋 Active Kindness Assignments
            </h3>
            {[
              { title: 'Lunch Buddy Challenge', due: 'Dec 15', completed: 18, total: 28 },
              { title: 'Compliment Chain', due: 'Dec 20', completed: 24, total: 28 },
              { title: 'Helper of the Week', due: 'Dec 22', completed: 28, total: 28 }
            ].map((assignment, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{assignment.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Due: {assignment.due}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                    {assignment.completed}/{assignment.total}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>completed</div>
                </div>
              </div>
            ))}
            
            <button style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              marginTop: '12px'
            }}>
              + Create New Assignment
            </button>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Admin Profile */}
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>👩‍💼</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
              Principal Johnson
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              School Administrator • Riverside Elementary
            </p>
          </div>

          {/* School-Wide Statistics */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>
              🏫 School-Wide Impact
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>345</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Students</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#166534' }}>1247</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Kind Acts This Month</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>28</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Teachers</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>8.4</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>School Kindness Score</div>
              </div>
            </div>
          </div>

          {/* Recent Highlights */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              ⭐ Recent Highlights
            </h3>
            {[
              { event: 'School-wide Kindness Week completed', impact: '98% participation', date: 'Dec 10' },
              { event: 'Anti-bullying program launch', impact: '100% teacher training', date: 'Dec 8' },
              { event: 'Parent-Teacher kindness conference', impact: '85% attendance', date: 'Dec 5' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.event}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>{item.impact}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <button style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              📊 Generate Report
            </button>
            <button style={{
              background: '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              ⚙️ Manage Settings
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      {onNavigateToTab && (
        <div style={{ paddingBottom: '100px' }}>
          <BottomNavigation 
            activeTab={activeBottomTab} 
            onTabChange={onNavigateToTab}
          />
        </div>
      )}
    </div>
  );
}