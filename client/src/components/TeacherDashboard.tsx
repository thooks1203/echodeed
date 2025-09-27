import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KindnessFeed } from '@/components/KindnessFeed';
import { 
  Users, 
  Heart, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Award,
  Target,
  Download,
  Share,
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

interface ClassroomStats {
  totalStudents: number;
  activeStudents: number;
  kindnessActsThisWeek: number;
  characterGoalProgress: number;
  averageParticipation: number;
}

interface StudentParticipation {
  id: string;
  name: string;
  kindnessActs: number;
  lastActive: string;
  characterTraits: string[];
  needsEncouragement: boolean;
}

interface LessonPlan {
  id: string;
  title: string;
  characterTrait: string;
  duration: string;
  ageGroup: string;
  description: string;
  activities: string[];
  materials: string[];
  standards: string[];
}

const sampleClassroomStats: ClassroomStats = {
  totalStudents: 24,
  activeStudents: 21,
  kindnessActsThisWeek: 47,
  characterGoalProgress: 78,
  averageParticipation: 87
};

const sampleStudents: StudentParticipation[] = [
  {
    id: '1',
    name: 'Emma S.',
    kindnessActs: 8,
    lastActive: '2025-09-24',
    characterTraits: ['Empathy', 'Helpfulness'],
    needsEncouragement: false
  },
  {
    id: '2',
    name: 'Marcus R.',
    kindnessActs: 3,
    lastActive: '2025-09-20',
    characterTraits: ['Respect'],
    needsEncouragement: true
  },
  {
    id: '3',
    name: 'Sophia L.',
    kindnessActs: 12,
    lastActive: '2025-09-24',
    characterTraits: ['Leadership', 'Empathy', 'Kindness'],
    needsEncouragement: false
  },
  {
    id: '4',
    name: 'James W.',
    kindnessActs: 1,
    lastActive: '2025-09-18',
    characterTraits: [],
    needsEncouragement: true
  }
];

const sampleLessonPlans: LessonPlan[] = [
  {
    id: '1',
    title: 'Acts of Kindness Around School',
    characterTrait: 'Kindness',
    duration: '45 minutes',
    ageGroup: '3rd-5th Grade',
    description: 'Students identify opportunities for kindness in their school environment and create action plans.',
    activities: [
      'Kindness scavenger hunt around school',
      'Small group brainstorming of kind acts',
      'Create personal kindness goals',
      'Share and practice kind words'
    ],
    materials: ['Clipboards', 'Kindness cards', 'Chart paper', 'Markers'],
    standards: ['SEL.1.A', 'Character Ed.2.B', 'Social Studies.3.C']
  },
  {
    id: '2',
    title: 'Empathy Circle Time',
    characterTrait: 'Empathy',
    duration: '30 minutes',
    ageGroup: 'K-2nd Grade',
    description: 'Students practice understanding others\' feelings through stories and role-play.',
    activities: [
      'Read empathy-focused story',
      'Discuss character feelings',
      'Role-play scenarios',
      'Create empathy cards'
    ],
    materials: ['Picture books', 'Emotion cards', 'Art supplies'],
    standards: ['SEL.2.A', 'Language Arts.1.B']
  },
  {
    id: '3',
    title: 'Community Helpers Appreciation',
    characterTrait: 'Gratitude',
    duration: '60 minutes',
    ageGroup: '1st-4th Grade',
    description: 'Students learn about community helpers and create thank you cards.',
    activities: [
      'Community helper presentations',
      'Thank you card creation',
      'Practice gratitude expressions',
      'Plan appreciation delivery'
    ],
    materials: ['Card stock', 'Art supplies', 'Helper photos'],
    standards: ['Social Studies.2.A', 'Character Ed.1.C']
  }
];

export function TeacherDashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [filterNeedsEncouragement, setFilterNeedsEncouragement] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch pending service hours for verification
  const { data: pendingServiceHours = [], isLoading: serviceHoursLoading } = useQuery({
    queryKey: ['/api/community-service/pending-verifications'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/community-service/pending-verifications?schoolId=bc016cad-fa89-44fb-aab0-76f82c574f78&verifierType=teacher');
        if (!response.ok) {
          console.log('Service hours API not available, using mock data');
          return [];
        }
        return response.json();
      } catch (error) {
        console.log('Service hours API error:', error);
        return [];
      }
    },
  });

  // Fetch posts for student feed
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Mutation for approving service hours
  const approveServiceHoursMutation = useMutation({
    mutationFn: async ({ serviceLogId }: { serviceLogId: string }) => {
      return apiRequest('/api/community-service/verify', 'POST', {
        serviceLogId,
        verifierType: 'teacher',
        verificationMethod: 'teacher_review',
        status: 'approved',
        feedback: 'Service hours approved by teacher'
        // Remove tokensAwarded and verifierId - let backend compute from auth and service hours
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Service Hours Approved!",
        description: "Tokens have been awarded to the student.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/logs'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve service hours. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleApproveServiceHours = (serviceLogId: string) => {
    approveServiceHoursMutation.mutate({ serviceLogId });
  };

  // Calculate tokens for display (5 tokens per hour, rounded)
  const calculateTokens = (hours: number) => Math.round(hours * 5);

  const stats = sampleClassroomStats;
  const students = filterNeedsEncouragement 
    ? sampleStudents.filter(s => s.needsEncouragement)
    : sampleStudents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => navigate('/?tab=feed')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                data-testid="back-to-platform"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Platform
              </Button>

              {/* Teacher Wellness Alert Button */}
              <Button
                size="sm"
                onClick={() => navigate('/wellness-checkin?from=teacher-dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 animate-pulse"
                style={{
                  animation: 'pulse 2s infinite'
                }}
                data-testid="teacher-wellness-alert"
              >
                <HeartPulse className="w-4 h-4" />
                Wellness Check Needed
              </Button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  📚 Teacher Dashboard
                </h1>
                <p className="text-gray-600">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}'s Class` 
                    : user?.name 
                    ? `${user.name}'s Class`
                    : "Teacher's Class"} • Character Education & Kindness Tracking
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Class Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.kindnessActsThisWeek}</div>
              <div className="text-sm text-gray-600">Acts of Kindness</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.characterGoalProgress}%</div>
              <div className="text-sm text-gray-600">Goal Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-pink-600">{stats.averageParticipation}%</div>
              <div className="text-sm text-gray-600">Participation Rate</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="student-feed" className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Student Feed
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Lesson Plans
            </TabsTrigger>
            <TabsTrigger value="service-hours" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Service Hours
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Student Posts Feed */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🏠</span>
                  </div>
                  Student Kindness Posts
                </CardTitle>
                <CardDescription>
                  Recent kindness acts shared by your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <KindnessFeed posts={Array.isArray(posts) ? posts : []} isLoading={postsLoading} />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    This Week's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Character Goal (60 acts of kindness)</span>
                        <span>{stats.kindnessActsThisWeek}/60</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(stats.kindnessActsThisWeek / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">87%</div>
                        <div className="text-xs text-gray-600">Participation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">2.1</div>
                        <div className="text-xs text-gray-600">Avg per student</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Character Traits Focus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Character Traits This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { trait: 'Kindness', count: 18, color: 'bg-pink-500' },
                      { trait: 'Empathy', count: 12, color: 'bg-purple-500' },
                      { trait: 'Respect', count: 9, color: 'bg-blue-500' },
                      { trait: 'Responsibility', count: 8, color: 'bg-green-500' }
                    ].map((item) => (
                      <div key={item.trait} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.trait}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">New Activity</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Award className="w-6 h-6" />
                    <span className="text-sm">Give Recognition</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Share className="w-6 h-6" />
                    <span className="text-sm">Share with Parents</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Target className="w-6 h-6" />
                    <span className="text-sm">Set Class Goal</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Participation</CardTitle>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filterNeedsEncouragement}
                        onChange={(e) => setFilterNeedsEncouragement(e.target.checked)}
                        className="rounded"
                      />
                      Show only students needing encouragement
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          student.needsEncouragement ? 'bg-orange-100' : 'bg-green-100'
                        }`}>
                          {student.needsEncouragement ? '⚠️' : '✅'}
                        </div>
                        <div>
                          <div className="font-semibold">{student.name}</div>
                          <div className="text-sm text-gray-600">
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{student.kindnessActs}</div>
                          <div className="text-xs text-gray-600">Kind acts</div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {student.characterTraits.map((trait) => (
                            <Badge key={trait} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Feed Tab */}
          <TabsContent value="student-feed" className="space-y-6" data-testid="tab-content-student-feed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Student Kindness Posts
                </CardTitle>
                <CardDescription>
                  Monitor student posts for character development and community building
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading student posts...</p>
                  </div>
                ) : (
                  <KindnessFeed posts={Array.isArray(posts) ? posts : []} isLoading={postsLoading} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lesson Plans Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Character Education Lesson Plans</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Lesson
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleLessonPlans.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <Badge className="bg-purple-100 text-purple-800">
                        {lesson.characterTrait}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {lesson.ageGroup}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{lesson.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Activities</h4>
                        <div className="space-y-1">
                          {lesson.activities.slice(0, 2).map((activity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {activity}
                            </div>
                          ))}
                          {lesson.activities.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{lesson.activities.length - 2} more activities
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          Use This Lesson
                        </Button>
                        <Button size="sm" variant="outline">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Service Hours Verification Tab */}
          <TabsContent value="service-hours" className="space-y-6" data-testid="tab-content-service-hours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Service Hours Pending Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceHoursLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading pending service hours...</p>
                  </div>
                ) : pendingServiceHours.length > 0 ? (
                  <div className="space-y-4">
                    {pendingServiceHours.map((serviceHour: any) => {
                      // Normalize data structure - API returns nested objects
                      const serviceLog = serviceHour.serviceLog || serviceHour;
                      const student = serviceHour.student || {};
                      
                      const hours = parseFloat(serviceLog.hoursLogged?.toString() || '0');
                      const tokens = calculateTokens(hours);
                      
                      // Handle date formatting with fallback
                      let serviceDate = 'Invalid Date';
                      try {
                        const date = new Date(serviceLog.serviceDate);
                        if (!isNaN(date.getTime())) {
                          serviceDate = date.toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          });
                        }
                      } catch (e) {
                        serviceDate = 'Date not available';
                      }
                      
                      // Build student name from nested structure
                      const studentName = student.firstName && student.lastName 
                        ? `${student.firstName} ${student.lastName}`
                        : serviceLog.studentName || 'Student';
                      
                      return (
                        <div key={serviceLog.id || serviceHour.id} className="border rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{serviceLog.serviceName}</h4>
                              <p className="text-sm text-gray-600">
                                {studentName} • {hours} hours • {serviceDate}
                              </p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">{serviceLog.verificationStatus || 'Pending'}</Badge>
                          </div>
                          <p className="text-sm mb-3">
                            <strong>Organization:</strong> {serviceLog.organizationName}<br />
                            {serviceLog.contactPerson && (
                              <><strong>Contact:</strong> {serviceLog.contactPerson} 
                              {serviceLog.contactEmail && ` (${serviceLog.contactEmail})`}<br /></>
                            )}
                            <strong>Description:</strong> {serviceLog.serviceDescription}
                          </p>
                          {serviceLog.studentReflection && (
                            <p className="text-sm mb-4 italic">
                              <strong>Student Reflection:</strong> "{serviceLog.studentReflection}"
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveServiceHours(serviceLog.id)}
                              disabled={approveServiceHoursMutation.isPending}
                              data-testid={`button-approve-service-${serviceLog.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {approveServiceHoursMutation.isPending ? 'Processing...' : `Approve (Award ${tokens} tokens)`}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 border-red-300">
                              ❌ Request More Info
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>All service hours have been verified.</p>
                    <p className="text-sm">Great job keeping up with verifications!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Week of September 22-28, 2025</strong>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>• 47 acts of kindness shared by students</div>
                      <div>• 87% class participation rate</div>
                      <div>• Top character traits: Kindness (18), Empathy (12)</div>
                      <div>• 4 students need additional encouragement</div>
                      <div>• Goal progress: 78% toward monthly target</div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Share with Principal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parent Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Send positive updates to parents about their child's character development
                    </p>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start">
                        📧 Send Individual Praise Notes
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📊 Share Class Progress
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📝 Monthly Character Newsletter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reports Tab - Moved from top navigation */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Weekly Summary Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Comprehensive weekly analysis of character development progress
                    </p>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start">
                        📈 Generate Class Report
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📋 Individual Student Reports
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📧 Email Reports to Principal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parent Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Send positive updates to parents about their child's character development
                    </p>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start">
                        📧 Send Individual Praise Notes
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📊 Share Class Progress
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        📝 Monthly Character Newsletter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation for Teacher Tools */}
      <BottomNavigation 
        activeTab="teacher-dashboard" 
        onTabChange={(tab) => {
          // Handle tab navigation properly
          if (tab === 'feed') {
            // Navigate to main app with feed
            navigate('/app');
          } else if (tab === 'reports') {
            // Switch to reports tab in the current teacher dashboard
            setSelectedTab('reports');
          } else if (tab === 'support') {
            // Navigate to support page
            navigate('/support');
          } else if (tab === 'rewards') {
            // Navigate to rewards page  
            navigate('/rewards');
          } else if (tab === 'sign-in') {
            // Handle role switching - go to landing page
            navigate('/');
          } else if (tab === 'teacher-dashboard') {
            // Stay on teacher dashboard but switch to overview
            setSelectedTab('overview');
          }
        }} 
      />
    </div>
  );
}