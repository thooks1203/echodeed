import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

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

export function SchoolsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'reports'>('overview');

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
    { studentId: '1', studentName: 'Emma Johnson', className: '5A', grade: '5th', totalPoints: 245, weeklyProgress: 15 },
    { studentId: '2', studentName: 'Liam Smith', className: '5A', grade: '5th', totalPoints: 198, weeklyProgress: 12 },
    { studentId: '3', studentName: 'Olivia Davis', className: '5B', grade: '5th', totalPoints: 267, weeklyProgress: 18 },
    { studentId: '4', studentName: 'Noah Wilson', className: '6A', grade: '6th', totalPoints: 189, weeklyProgress: 9 },
    { studentId: '5', studentName: 'Sophia Brown', className: '6A', grade: '6th', totalPoints: 321, weeklyProgress: 22 }
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
        display: 'flex',
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'students', label: '👥 Students' },
          { id: 'assignments', label: '📋 Assignments' },
          { id: 'reports', label: '📈 Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? '#7C3AED' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280'
            }}
          >
            {tab.label}
          </button>
        ))}
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#7C3AED' }}>
              📊 District Overview
            </h3>
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

      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              🏆 Top Students This Week
            </h3>
            
            {sampleStudentPoints
              .sort((a, b) => b.weeklyProgress - a.weeklyProgress)
              .slice(0, 5)
              .map((student, index) => (
              <div
                key={student.studentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  background: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : index === 2 ? '#fed7aa' : '#f9fafb',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#fb923c' : '#6b7280',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{student.studentName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {student.className} • {student.grade} Grade
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#7C3AED' }}>
                    +{student.weeklyProgress}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>
                    {student.totalPoints} total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Kindness Assignments
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Create and manage kindness challenges for your students
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Create New Assignment
          </button>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            SEL Analytics & Reports
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Track social-emotional learning progress and kindness impact
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}