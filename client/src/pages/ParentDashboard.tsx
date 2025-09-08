import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Star, Calendar, Bell, TrendingUp, Award, BookOpen, Users, ArrowLeft } from 'lucide-react';

interface ParentNotification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: number;
  createdAt: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface KindnessPost {
  id: string;
  content: string;
  category: string;
  hearts: number;
  echoes: number;
  createdAt: string;
}

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [, navigate] = useLocation();
  
  // Mock parent account ID for demo (in real app this would come from auth)
  const parentId = 'parent-demo-id';
  
  // Mock API calls (replace with real API calls once parent accounts are set up)
  const { data: notifications = [] } = useQuery<ParentNotification[]>({
    queryKey: ['/api/school/parent-notifications', parentId],
    enabled: false // Disabled for demo since we need real parent accounts
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/school/parents/students', parentId],
    enabled: false // Disabled for demo
  });

  // Mock data for demonstration
  const mockStudents: Student[] = [
    { id: 'student-1', firstName: 'Emma', lastName: 'Johnson', email: 'emma.j@school.edu' },
    { id: 'student-2', firstName: 'Liam', lastName: 'Johnson', email: 'liam.j@school.edu' }
  ];

  const mockNotifications: ParentNotification[] = [
    {
      id: '1',
      title: 'Weekly Kindness Report',
      message: 'Emma shared 5 acts of kindness this week!',
      notificationType: 'weekly_report',
      isRead: 0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Achievement Unlocked!',
      message: 'Liam earned the "Helper Hero" badge for assisting classmates',
      notificationType: 'achievement',
      isRead: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Kindness Milestone',
      message: 'Emma reached 50 acts of kindness this semester!',
      notificationType: 'milestone',
      isRead: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockKindnessData = {
    'student-1': {
      thisWeek: 5,
      thisMonth: 18,
      totalActs: 127,
      favoriteCategory: 'helping',
      streak: 12,
      recentPosts: [
        {
          id: '1',
          content: 'I helped my classmate with math homework during lunch',
          category: 'helping',
          hearts: 8,
          echoes: 3,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          content: 'Shared my snacks with a friend who forgot theirs',
          category: 'sharing',
          hearts: 12,
          echoes: 5,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    'student-2': {
      thisWeek: 3,
      thisMonth: 14,
      totalActs: 89,
      favoriteCategory: 'including',
      streak: 7,
      recentPosts: [
        {
          id: '3',
          content: 'Invited the new student to play with our group at recess',
          category: 'including',
          hearts: 15,
          echoes: 7,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  };

  useEffect(() => {
    if (mockStudents.length > 0 && !selectedChild) {
      setSelectedChild(mockStudents[0].id);
    }
  }, [selectedChild]);

  const selectedStudentData = selectedChild ? mockKindnessData[selectedChild as keyof typeof mockKindnessData] : null;
  const selectedStudent = mockStudents.find(s => s.id === selectedChild);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="parent-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            data-testid="back-to-schools"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="dashboard-title">
              Parent Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Track your children's kindness journey and character development
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {mockStudents.length} Children
          </Badge>
        </div>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Select Child
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {mockStudents.map((student) => (
              <Button
                key={student.id}
                variant={selectedChild === student.id ? "default" : "outline"}
                onClick={() => setSelectedChild(student.id)}
                data-testid={`student-button-${student.id}`}
              >
                {student.firstName} {student.lastName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && selectedStudentData && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="progress">SEL Progress</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="week-count">{selectedStudentData.thisWeek}</div>
                  <p className="text-xs text-muted-foreground">acts of kindness</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="month-count">{selectedStudentData.thisMonth}</div>
                  <p className="text-xs text-muted-foreground">acts shared</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kindness Streak</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="streak-count">{selectedStudentData.streak}</div>
                  <p className="text-xs text-muted-foreground">consecutive days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Acts</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="total-count">{selectedStudentData.totalActs}</div>
                  <p className="text-xs text-muted-foreground">all time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Character Development Summary</CardTitle>
                <CardDescription>
                  {selectedStudent.firstName}'s favorite way to show kindness is <strong>{selectedStudentData.favoriteCategory}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Helping Others</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sharing & Caring</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Including Others</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Kindness Activities</CardTitle>
                <CardDescription>
                  {selectedStudent.firstName}'s latest acts of kindness shared with the school community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStudentData.recentPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-3" data-testid={`activity-${post.id}`}>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.hearts} hearts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{post.echoes} echoes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEL Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social-Emotional Learning Progress</CardTitle>
                <CardDescription>
                  Character development aligned with educational standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Self-Awareness</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Emotional Recognition</span>
                        <Badge variant="secondary">Proficient</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Social Awareness</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Empathy & Caring</span>
                        <Badge variant="secondary">Advanced</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Relationship Skills</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Collaboration</span>
                        <Badge variant="secondary">Developing</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Responsible Decision Making</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ethical Choices</span>
                        <Badge variant="secondary">Proficient</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Parent Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on your child's kindness activities and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border rounded-lg p-4 space-y-2 ${notification.isRead ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{notification.message}</p>
                    <Badge variant="outline" className="text-xs">
                      {notification.notificationType.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}