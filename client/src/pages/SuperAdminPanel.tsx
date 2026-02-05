import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from '@/components/BackButton';
import { 
  Users, 
  School, 
  Download, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  FileSpreadsheet,
  Eye
} from 'lucide-react';

interface SchoolSignups {
  schoolId: string;
  schoolName: string;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  parentCount: number;
  totalUsers: number;
}

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolRole: string;
  schoolName: string;
  grade?: string;
  createdAt: string;
}

interface PendingQuest {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  hoursLogged: number;
  submittedAt: string;
  evidenceUrl?: string;
}

export default function SuperAdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch school signups
  const { data: schoolSignups, isLoading: loadingSchools } = useQuery<SchoolSignups[]>({
    queryKey: ['/api/super-admin/school-signups'],
  });

  // Fetch all users
  const { data: allUsers, isLoading: loadingUsers } = useQuery<UserRecord[]>({
    queryKey: ['/api/super-admin/users'],
  });

  // Fetch pending quests
  const { data: pendingQuests, isLoading: loadingQuests } = useQuery<PendingQuest[]>({
    queryKey: ['/api/super-admin/pending-quests'],
  });

  const totalSignups = schoolSignups?.reduce((sum, s) => sum + s.totalUsers, 0) || 0;
  const totalStudents = schoolSignups?.reduce((sum, s) => sum + s.studentCount, 0) || 0;

  const downloadCSV = () => {
    if (!allUsers || allUsers.length === 0) {
      alert('No users to export');
      return;
    }

    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'School', 'Grade', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...allUsers.map(u => [
        u.id,
        u.email,
        u.firstName || '',
        u.lastName || '',
        u.schoolRole,
        u.schoolName || '',
        u.grade || '',
        u.createdAt
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `echodeed_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <BackButton onClick={() => setLocation('/admin')} label="Back to Admin Dashboard" />
      
      <div style={{ marginTop: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Shield size={32} style={{ color: '#DC2626' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Super Admin Panel</h1>
          <Badge style={{ background: '#DC2626', color: 'white' }}>Restricted Access</Badge>
        </div>
        <p style={{ color: '#6B7280' }}>
          Platform-wide analytics and user management
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '14px', color: '#6B7280' }}>Total Sign-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#4F46E5' }}>{totalSignups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '14px', color: '#6B7280' }}>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '14px', color: '#6B7280' }}>Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>{schoolSignups?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '14px', color: '#6B7280' }}>Pending Quests</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>{pendingQuests?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList style={{ marginBottom: '24px' }}>
          <TabsTrigger value="overview">
            <School size={16} style={{ marginRight: '8px' }} />
            Schools Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users size={16} style={{ marginRight: '8px' }} />
            All Users
          </TabsTrigger>
          <TabsTrigger value="quests">
            <Clock size={16} style={{ marginRight: '8px' }} />
            Pending Quests
          </TabsTrigger>
        </TabsList>

        {/* Schools Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Sign-ups by School</CardTitle>
              <CardDescription>Total registrations across all participating schools</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSchools ? (
                <p>Loading...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>School</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Students</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Teachers</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Admins</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Parents</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolSignups?.map((school) => (
                        <tr key={school.schoolId} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px' }}>{school.schoolName}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{school.studentCount}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{school.teacherCount}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{school.adminCount}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{school.parentCount}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{school.totalUsers}</td>
                        </tr>
                      ))}
                      {(!schoolSignups || schoolSignups.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                            No school data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Complete list of registered users</CardDescription>
                </div>
                <Button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <p>Loading...</p>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Role</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>School</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Grade</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px' }}>{user.firstName} {user.lastName}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{user.email}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <Badge variant={user.schoolRole === 'student' ? 'default' : 'secondary'}>
                              {user.schoolRole}
                            </Badge>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{user.schoolName || '-'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{user.grade || '-'}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                      {(!allUsers || allUsers.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Quests Tab */}
        <TabsContent value="quests">
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} style={{ color: '#F59E0B' }} />
                Pending Verification Quests
              </CardTitle>
              <CardDescription>Community service quests awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQuests ? (
                <p>Loading...</p>
              ) : pendingQuests && pendingQuests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingQuests.map((quest) => (
                    <div 
                      key={quest.id} 
                      style={{ 
                        padding: '16px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        background: '#FFFBEB'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{quest.title}</h4>
                          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                            {quest.description}
                          </p>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                            <span><strong>Student:</strong> {quest.userName}</span>
                            <span><strong>Hours:</strong> {quest.hoursLogged}</span>
                            <span><strong>Submitted:</strong> {new Date(quest.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {quest.evidenceUrl && (
                            <Button variant="outline" size="sm">
                              <Eye size={14} style={{ marginRight: '4px' }} />
                              View Evidence
                            </Button>
                          )}
                          <Button variant="outline" size="sm" style={{ color: '#10B981', borderColor: '#10B981' }}>
                            <CheckCircle size={14} style={{ marginRight: '4px' }} />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                            <XCircle size={14} style={{ marginRight: '4px' }} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                  <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#10B981' }} />
                  <p>No pending quests to review!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
