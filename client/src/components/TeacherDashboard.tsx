import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from '@/components/BottomNavigation';
import { featureFlags } from '@shared/featureFlags';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TeacherWellnessOverview } from '@/components/TeacherWellnessOverview';
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
  HeartPulse,
  X
} from 'lucide-react';
import { HelpButton, helpContent } from '@/components/HelpButton';

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
    standards: ['CE.1.A', 'Character Ed.2.B', 'Social Studies.3.C']
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
    standards: ['CE.2.A', 'Language Arts.1.B']
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

// Teacher Rewards Tab Component
function RewardsTabContent() {
  const { data: rewardsData, isLoading } = useQuery({
    queryKey: ['/api/teacher/rewards/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/rewards/available');
      if (!response.ok) return { criteria: { service_hours: [], wellness: [], engagement: [] }, sponsors: [], totalMonthlyBudget: 0 };
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading teacher rewards...</p>
      </div>
    );
  }

  const { criteria, sponsors, totalMonthlyBudget = 0, sponsorMessage } = rewardsData || {};
  const serviceHours = criteria?.service_hours || [];
  const wellness = criteria?.wellness || [];
  const engagement = criteria?.engagement || [];

  return (
    <div className="space-y-6">
      {/* Sponsor Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Teacher Recognition Program
          </CardTitle>
          <CardDescription className="text-base">
            {sponsorMessage || 'Local sponsors supporting our dedicated educators!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-lg mb-3">Our Generous Sponsors</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sponsors && sponsors.map((sponsor: any) => (
                <div key={sponsor.id} className="border rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
                  <h5 className="font-semibold text-purple-700">{sponsor.companyName}</h5>
                  <p className="text-sm text-gray-600">{sponsor.location}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    ${(sponsor.monthlyBudget / 100).toFixed(0)}/month
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              <strong>Total Monthly Budget:</strong> ${(totalMonthlyBudget / 100).toFixed(0)} for teacher recognition
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Hours Excellence */}
      {serviceHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Service Hours Excellence Rewards
            </CardTitle>
            <CardDescription>Recognition for exceptional service hour verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceHours.map((criterion: any) => (
              <div key={criterion.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                <h4 className="font-semibold text-lg text-green-800">{criterion.name}</h4>
                <p className="text-sm text-gray-700 mt-1">{criterion.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <Badge className="bg-green-600 text-white">
                    {criterion.period === 'monthly' ? 'Monthly' : criterion.period === 'quarterly' ? 'Quarterly' : 'Annual'}
                  </Badge>
                  <span className="text-gray-600">
                    <strong>Goal:</strong> {criterion.threshold}{criterion.period === 'quarterly' ? '%' : '+'} {criterion.description.includes('response') ? 'response rate' : 'approvals'}
                  </span>
                  <span className="text-green-700 font-medium">
                    → {criterion.reward_type === 'coffee_carafe' ? '☕ Coffee Carafe' : '🍽️ Restaurant Card'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Wellness Champions */}
      {wellness.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-blue-600" />
              Wellness Champion Rewards
            </CardTitle>
            <CardDescription>Recognition for promoting student wellness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wellness.map((criterion: any) => (
              <div key={criterion.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-lg text-blue-800">{criterion.name}</h4>
                <p className="text-sm text-gray-700 mt-1">{criterion.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <Badge className="bg-blue-600 text-white">
                    {criterion.period === 'monthly' ? 'Monthly' : criterion.period === 'quarterly' ? 'Quarterly' : 'Annual'}
                  </Badge>
                  <span className="text-gray-600">
                    <strong>Goal:</strong> {criterion.threshold}{criterion.period === 'quarterly' ? '%' : '+'} {criterion.description.includes('participation') ? 'participation' : 'check-ins'}
                  </span>
                  <span className="text-blue-700 font-medium">
                    → {criterion.reward_type === 'coffee_carafe' ? '☕ Coffee Carafe' : '🍽️ Restaurant Card'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Community Builders */}
      {engagement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Community Builder Rewards
            </CardTitle>
            <CardDescription>Recognition for fostering classroom community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagement.map((criterion: any) => (
              <div key={criterion.id} className="border rounded-lg p-4 bg-pink-50 border-pink-200">
                <h4 className="font-semibold text-lg text-pink-800">{criterion.name}</h4>
                <p className="text-sm text-gray-700 mt-1">{criterion.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <Badge className="bg-pink-600 text-white">
                    {criterion.period === 'monthly' ? 'Monthly' : criterion.period === 'quarterly' ? 'Quarterly' : 'Annual'}
                  </Badge>
                  <span className="text-gray-600">
                    <strong>Goal:</strong> {criterion.threshold}+ {criterion.description.includes('posts') ? 'posts' : 'engagements'}
                  </span>
                  <span className="text-pink-700 font-medium">
                    → {criterion.reward_type === 'coffee_carafe' ? '☕ Coffee Carafe' : criterion.reward_type === 'spa_day' ? '💆 Spa Day' : '🍽️ Restaurant Card'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function TeacherDashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [filterNeedsEncouragement, setFilterNeedsEncouragement] = useState<boolean>(false);
  const [showWellnessModal, setShowWellnessModal] = useState(featureFlags.aiWellness); // Only auto-open if AI wellness enabled
  const [selectedStudent, setSelectedStudent] = useState<StudentParticipation | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Ensure teacher role is set for demo authentication
  useEffect(() => {
    console.log('🔧 Setting up teacher authentication...');
    localStorage.setItem('echodeed_demo_role', 'teacher');
    localStorage.setItem('echodeed_session', 'demo-session');
    console.log('✅ Teacher role set:', localStorage.getItem('echodeed_demo_role'));
  }, []);

  // Fetch pending service hours for verification
  const { data: pendingServiceHours = [], isLoading: serviceHoursLoading, error: serviceHoursError } = useQuery({
    queryKey: ['/api/community-service/pending-verifications'],
    queryFn: async () => {
      console.log('🔍 Fetching pending service hours...');
      const response = await apiRequest('GET', '/api/community-service/pending-verifications?schoolId=bc016cad-fa89-44fb-aab0-76f82c574f78&verifierType=teacher');
      const data = await response.json();
      console.log('✅ Pending service hours response:', data);
      return data;
    },
  });
  
  // Log any errors
  useEffect(() => {
    if (serviceHoursError) {
      console.error('❌ Service hours error:', serviceHoursError);
    }
  }, [serviceHoursError]);

  // Fetch recently approved service hours
  const { data: approvedServiceHours = [], isLoading: approvedHoursLoading } = useQuery({
    queryKey: ['/api/community-service/recently-approved'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/community-service/recently-approved?schoolId=bc016cad-fa89-44fb-aab0-76f82c574f78&limit=10');
        if (!response.ok) {
          console.log('Recently approved hours API not available');
          return [];
        }
        return response.json();
      } catch (error) {
        console.log('Recently approved hours API error:', error);
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
      console.log('🔍 Attempting to approve service hours:', serviceLogId);
      
      try {
        const response = await apiRequest('POST', '/api/community-service/verify', {
          serviceLogId,
          verifierType: 'teacher',
          verificationMethod: 'teacher_review',
          status: 'approved',
          feedback: 'Service hours approved by teacher'
        });
        
        console.log('✅ Service hours approval response:', response);
        return response;
      } catch (error) {
        console.error('❌ Service hours approval error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Service hours approved successfully:', data);
      toast({
        title: "✅ Service Hours Approved!",
        description: "Tokens have been awarded to the student.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/recently-approved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/logs'] });
    },
    onError: (error: any) => {
      console.error('❌ Service hours approval failed:', error);
      toast({
        title: "Error",
        description: `Failed to approve service hours: ${error?.message || 'Please try again.'}`,
        variant: "destructive"
      });
    }
  });

  const handleApproveServiceHours = (serviceLogId: string) => {
    console.log('🎯 handleApproveServiceHours called with:', serviceLogId);
    console.log('🎯 Mutation state:', {
      isPending: approveServiceHoursMutation.isPending,
      isError: approveServiceHoursMutation.isError,
      error: approveServiceHoursMutation.error
    });
    
    approveServiceHoursMutation.mutate({ serviceLogId });
  };

  // Calculate tokens for display (5 tokens per hour, rounded)
  const calculateTokens = (hours: number) => Math.round(hours * 5);

  const stats = sampleClassroomStats;
  const students = filterNeedsEncouragement 
    ? sampleStudents.filter(s => s.needsEncouragement)
    : sampleStudents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Top Button Row - Balanced Layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Button
                size="sm"
                onClick={() => navigate('/?tab=feed')}
                className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4"
                data-testid="back-to-platform"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back to Platform</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Teacher Wellness Alert Button - PROMINENT */}
              {featureFlags.aiWellness && (
                <Button
                  size="lg"
                  onClick={() => navigate('/wellness-checkin?from=teacher-dashboard')}
                  className="flex items-center gap-1 sm:gap-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 border-2 sm:border-4 border-orange-300 hover:border-orange-200 px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-lg"
                  style={{
                    animation: 'flash 1s infinite alternate, bounce 2s infinite'
                  }}
                  data-testid="teacher-wellness-alert"
                >
                  <HeartPulse className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Wellness Check Needed</span>
                  <span className="sm:hidden">Wellness</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm px-2 sm:px-4">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/class-settings')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                data-testid="button-class-settings"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Class Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </div>
          </div>

          {/* Title Section - Clean and Centered */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Teacher Dashboard
              <HelpButton content={helpContent.teacher.dashboard} />
            </h1>
            <p className="text-gray-600 text-lg">
              {user?.firstName && user?.lastName 
                ? `Ms. ${user.firstName} ${user.lastName}'s Class` 
                : user?.name 
                ? `${user.name}'s Class`
                : "Ms. Sarah Wilson's Class"} • Character Education & Kindness Tracking
            </p>
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
          <TabsList className={`grid w-full ${featureFlags.curriculum ? 'grid-cols-6' : 'grid-cols-5'} gap-1 bg-transparent`}>
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-blue-600 text-white hover:bg-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
              <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-purple-600 text-white hover:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
              <Users className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Students</span>
              <span className="sm:hidden">Kids</span>
            </TabsTrigger>
            <TabsTrigger value="student-feed" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-pink-600 text-white hover:bg-pink-700 data-[state=active]:bg-pink-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
              <Heart className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Student Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
            {featureFlags.curriculum && (
              <TabsTrigger value="lessons" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-emerald-600 text-white hover:bg-emerald-700 data-[state=active]:bg-emerald-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
                <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Lesson Plans</span>
                <span className="sm:hidden">Plans</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="service-hours" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-teal-600 text-white hover:bg-teal-700 data-[state=active]:bg-teal-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Service Hours</span>
              <span className="sm:hidden">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-amber-600 text-white hover:bg-amber-700 data-[state=active]:bg-amber-700 data-[state=active]:shadow-lg px-1 sm:px-3 py-2 text-[10px] sm:text-sm" data-testid="tab-rewards">
              <Award className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Rewards</span>
              <span className="sm:hidden">Gifts</span>
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
                  <Button className="h-20 flex flex-col gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                    <Award className="w-6 h-6" />
                    <span className="text-sm">Give Recognition</span>
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                    <Share className="w-6 h-6" />
                    <span className="text-sm">Share with Parents</span>
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-rose-600 hover:bg-rose-700 text-white">
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
                        
                        <Button 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => setSelectedStudent(student)}
                          data-testid={`button-view-details-${student.id}`}
                        >
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
          {featureFlags.curriculum && (
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
          )}

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
                          {serviceLog.verificationPhotoUrl && (
                            <div className="mb-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={serviceLog.verificationPhotoUrl} 
                                  alt="Verification evidence" 
                                  className="w-20 h-20 object-cover rounded border border-gray-300"
                                  data-testid={`img-verification-${serviceLog.id}`}
                                />
                                <div>
                                  <p className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Verification Photo
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Photo provided by student
                                  </p>
                                </div>
                              </div>
                            </div>
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
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
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

            {/* Recently Approved Service Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Recently Approved Service Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedHoursLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading approved hours...</p>
                  </div>
                ) : approvedServiceHours.length > 0 ? (
                  <div className="space-y-4">
                    {approvedServiceHours.map((serviceHour: any) => {
                      const serviceLog = serviceHour.serviceLog || serviceHour;
                      const student = serviceHour.student || {};
                      
                      const hours = parseFloat(serviceLog.hoursLogged?.toString() || '0');
                      const tokens = calculateTokens(hours);
                      const studentName = student.firstName && student.lastName 
                        ? `${student.firstName} ${student.lastName}` 
                        : 'Student';
                      
                      let verifiedDate = 'Recently';
                      try {
                        const date = new Date(serviceLog.verifiedAt);
                        if (!isNaN(date.getTime())) {
                          verifiedDate = date.toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric' 
                          });
                        }
                      } catch (e) {
                        // Use default
                      }
                      
                      return (
                        <div key={serviceLog.id} className="border rounded-lg p-4 bg-green-50 border-green-200" data-testid={`approved-service-${serviceLog.id}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{serviceLog.serviceName}</h4>
                              <p className="text-sm text-gray-600">
                                {studentName} • {hours} hours • Approved {verifiedDate}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-white">✓ Approved</Badge>
                          </div>
                          <p className="text-sm text-gray-700">
                            <strong>Organization:</strong> {serviceLog.organizationName}
                          </p>
                          <p className="text-sm text-green-700 font-medium mt-2">
                            ✅ {tokens} tokens awarded
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recently approved service hours.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6" data-testid="tab-content-rewards">
            <RewardsTabContent />
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
          // Don't navigate away if wellness modal is open
          if (showWellnessModal) {
            console.log('🚫 Blocked navigation while wellness modal is open:', tab);
            return;
          }
          
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

      {/* Student Details Modal */}
      <Dialog open={selectedStudent !== null} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-student-details">
          {selectedStudent && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  selectedStudent.needsEncouragement ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  {selectedStudent.needsEncouragement ? '⚠️' : '✅'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-sm text-gray-600">Last active: {new Date(selectedStudent.lastActive).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedStudent.kindnessActs}</div>
                    <div className="text-sm text-gray-600">Kind Acts</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedStudent.id === '1' ? '7.5' : selectedStudent.id === '2' ? '0' : selectedStudent.id === '3' ? '5.0' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Service Hours</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedStudent.id === '1' ? '45' : selectedStudent.id === '2' ? '15' : selectedStudent.id === '3' ? '60' : '5'}
                    </div>
                    <div className="text-sm text-gray-600">Tokens</div>
                  </CardContent>
                </Card>
              </div>

              {/* Character Traits */}
              <div>
                <h3 className="font-semibold mb-3">Character Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.characterTraits.map((trait) => (
                    <Badge key={trait} className="bg-purple-100 text-purple-800 border-purple-300">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Service Hours Details (for Emma) */}
              {selectedStudent.id === '1' && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Service Hours</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Food Bank Volunteer</p>
                          <p className="text-sm text-gray-600">Greensboro Community Food Bank</p>
                        </div>
                        <Badge className="bg-green-600 text-white">4.5 hrs</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Park Cleanup</p>
                          <p className="text-sm text-gray-600">Greensboro Parks & Recreation</p>
                        </div>
                        <Badge className="bg-green-600 text-white">3.0 hrs</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wellness Status */}
              <div>
                <h3 className="font-semibold mb-3">Wellness Check-ins</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">
                        {selectedStudent.id === '1' ? 'Completed 4 check-ins this week' : 
                         selectedStudent.id === '2' ? 'Last check-in: 6 days ago' :
                         selectedStudent.id === '3' ? 'Completed 5 check-ins this week' : 
                         'Last check-in: 8 days ago'}
                      </span>
                    </div>
                    <Badge className={selectedStudent.id === '1' || selectedStudent.id === '3' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {selectedStudent.id === '1' || selectedStudent.id === '3' ? 'Active' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Parent Engagement */}
              <div>
                <h3 className="font-semibold mb-3">Parent Engagement</h3>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-sm">
                        {selectedStudent.id === '1' ? 'Parent reviewed service hours yesterday' :
                         selectedStudent.id === '2' ? 'No recent parent activity' :
                         selectedStudent.id === '3' ? 'Parent approved activities this week' :
                         'Parent engaged last week'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  📧 Contact Parent
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  📊 View Full Report
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto-opening Teacher Wellness Overview Modal */}
      {featureFlags.aiWellness && (
        <Dialog open={showWellnessModal} onOpenChange={setShowWellnessModal}>
          <DialogContent className="max-w-lg border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <TeacherWellnessOverview
              onClose={() => setShowWellnessModal(false)}
              onStartCheck={() => {
                setShowWellnessModal(false);
                navigate('/wellness-checkin?from=teacher-dashboard');
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}