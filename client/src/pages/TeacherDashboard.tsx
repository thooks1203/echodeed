import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, BookOpen, Users, Star, Clock, Target, CheckCircle, Filter, Search, Award, Gift, Coffee, Trophy, Shield, AlertTriangle, FileText, Download, MessageCircle, ArrowLeft, BarChart3, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { featureFlags } from '@shared/featureFlags';
import { KindnessFeed } from '@/components/KindnessFeed';
import { KindnessConnectModal } from '@/components/KindnessConnectModal';
import { BackButton } from '@/components/BackButton';
import { ServiceVerificationFormDownload } from '@/components/ServiceVerificationForm';

interface CurriculumLesson {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  subject: string;
  kindnessTheme: string;
  difficulty: string;
  estimatedTime: number;
  objectives: string[];
  activities: any[];
  assessment: any;
  materials: string[];
  vocabulary: string[];
  kindnessSkills: string[];
  characterStandards: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CurriculumProgress {
  id: string;
  teacherId: string;
  lessonId: string;
  implementedAt: string;
  effectiveness: number;
  studentEngagement: number;
  lessonReflection: string;
  adaptations: string;
  challenges: string;
  successStories: string;
  followUpPlanned: boolean;
}

interface ModerationQueueItem {
  id: string;
  schoolId: string;
  contentType: string;
  contentId: string;
  originalContent: string;
  moderationCategory: string;
  flaggedReason: string;
  severityLevel: string;
  sentimentScore: number;
  patternTags: string[];
  reviewStatus: string;
  actionTaken: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  flaggedAt: string;
}

interface TeacherDashboardProps {
  teacherId?: string;
  initialTab?: string;
}

export default function TeacherDashboard({ teacherId = "teacher-demo", initialTab = "feed" }: TeacherDashboardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tab state that syncs with initialTab prop
  const [activeTab, setActiveTab] = useState(initialTab.toLowerCase());
  
  // Sync activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab.toLowerCase());
  }, [initialTab]);
  
  // Filter states
  const [gradeFilter, setGradeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null);
  const [isKindnessConnectOpen, setIsKindnessConnectOpen] = useState(false);

  // Fetch curriculum lessons with filters
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['/api/curriculum/lessons', gradeFilter, subjectFilter, themeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (gradeFilter) params.append('gradeLevel', gradeFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      if (themeFilter) params.append('kindnessTheme', themeFilter);
      
      const response = await fetch(`/api/curriculum/lessons?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return response.json();
    },
  });

  // Fetch teacher's implementation progress
  const { data: teacherProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['/api/curriculum/progress', teacherId],
    queryFn: async () => {
      const response = await fetch(`/api/curriculum/progress/${teacherId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
  });

  // Fetch moderation queue
  const { data: moderationData, isLoading: moderationLoading } = useQuery<any>({
    queryKey: ['/api/moderation/queue'],
    queryFn: async () => {
      const response = await fetch('/api/moderation/queue', {
        headers: {
          'x-session-id': 'demo-session',
          'x-demo-role': 'teacher'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch moderation queue');
      return response.json();
    },
  });
  
  const moderationQueue = moderationData?.queue || [];

  // Resolve moderation item (approve/reject)
  const resolveModerationMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }) => {
      return await apiRequest('PATCH', `/api/moderation/resolve/${id}`, {
        action,
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/queue'] });
      toast({
        title: "Content Reviewed",
        description: "Your moderation decision has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve moderation item",
        variant: "destructive",
      });
    },
  });

  // Mark lesson as implemented
  const implementLessonMutation = useMutation({
    mutationFn: async (lessonData: {
      lessonId: string;
      effectiveness: number;
      studentEngagement: number;
      lessonReflection: string;
    }) => {
      return await apiRequest('POST', '/api/curriculum/progress', {
        teacherId,
        ...lessonData,
        implementedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/progress', teacherId] });
      toast({
        title: "Lesson Implemented!",
        description: "Your lesson implementation has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record lesson implementation",
        variant: "destructive",
      });
    },
  });

  // Filter lessons based on search term
  const filteredLessons = lessons.filter((lesson: CurriculumLesson) =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.kindnessTheme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if lesson is already implemented
  const isLessonImplemented = (lessonId: string) => {
    return teacherProgress.some((progress: CurriculumProgress) => progress.lessonId === lessonId);
  };

  const handleImplementLesson = (lesson: CurriculumLesson) => {
    implementLessonMutation.mutate({
      lessonId: lesson.id,
      effectiveness: 4, // Default good rating
      studentEngagement: 4,
      lessonReflection: `Successfully implemented ${lesson.title} for ${lesson.gradeLevel} students.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Feed content component
  const FeedContent = () => {
    const { data: posts = [], isLoading } = useQuery<any[]>({
      queryKey: ['/api/posts'],
      staleTime: 60000, // 1 minute
    });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kindness posts...</p>
          </div>
        </div>
      );
    }

    return <KindnessFeed posts={posts} isLoading={isLoading} />;
  };

  // Service Hours content component
  const ServiceHoursContent = () => {
    const { data: pendingHours, isLoading } = useQuery<any>({
      queryKey: ['/api/community-service/pending-verifications?schoolId=bc016cad-fa89-44fb-aab0-76f82c574f78&verifierType=teacher'],
      staleTime: 30000, // 30 seconds
    });

    const approveMutation = useMutation({
      mutationFn: async (logId: string) => {
        return await apiRequest('PATCH', `/api/community-service/verify/${logId}`, {
          approved: true,
          verifiedBy: 'teacher-001',
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/community-service/pending-verifications'] });
        toast({
          title: "Service Hours Approved",
          description: "Student will receive tokens for their community service.",
        });
      },
    });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending service hours...</p>
          </div>
        </div>
      );
    }

    const pending = pendingHours || [];

    if (pending.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending service hours to verify at this time.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pending.map((item: any) => {
          const log = item.serviceLog || item;
          const student = item.student;
          return (
            <Card key={log.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">{log.category}</Badge>
                      <span className="text-sm text-gray-600">{log.hoursLogged} hours</span>
                      {student && (
                        <span className="text-xs text-gray-500">
                          by {student.firstName} {student.lastName} ({student.grade || 'N/A'})
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{log.serviceName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{log.organizationName}</p>
                    <p className="text-sm text-gray-700 mb-2">{log.serviceDescription}</p>
                    <p className="text-sm text-gray-700 italic bg-purple-50 p-2 rounded">
                      💭 Student Reflection: "{log.studentReflection}"
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      Service Date: {new Date(log.serviceDate).toLocaleDateString()} • 
                      Submitted: {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    onClick={() => approveMutation.mutate(log.id)}
                    disabled={approveMutation.isPending}
                    className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`button-approve-${log.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Teacher Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Eastern Guilford High School (Grades 9-12) - Empowering kindness and character through community service
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${featureFlags.curriculum ? 'grid-cols-11' : 'grid-cols-8'} mb-6 bg-transparent p-1 h-auto gap-1 sm:gap-2 overflow-x-auto`}>
            <TabsTrigger 
              value="feed" 
              data-testid="tab-feed"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Kindness Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
            <TabsTrigger 
              value="service-hours" 
              data-testid="tab-service-hours"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Service Hours</span>
              <span className="sm:hidden">Hours</span>
            </TabsTrigger>
            {featureFlags.curriculum && (
              <>
                <TabsTrigger 
                  value="lessons" 
                  data-testid="tab-lessons"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Lesson Library</span>
                  <span className="sm:hidden">Lessons</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  data-testid="tab-progress"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">My Progress</span>
                  <span className="sm:hidden">Progress</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  data-testid="tab-resources"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
                >
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Resources</span>
                  <span className="sm:hidden">Files</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger 
              value="moderation" 
              data-testid="tab-moderation"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Review Queue</span>
              <span className="sm:hidden">Queue</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              data-testid="tab-reports"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              data-testid="tab-rewards"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Teacher Rewards</span>
              <span className="sm:hidden">Rewards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin-rewards" 
              data-testid="tab-admin-rewards"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Admin Rewards</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
            <TabsTrigger 
              value="character-excellence" 
              data-testid="tab-character-excellence"
              className="bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Character Excellence</span>
              <span className="sm:hidden">Excel</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              data-testid="tab-leaderboard"
              className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg hover:shadow-xl data-[state=active]:shadow-2xl data-[state=active]:scale-105 py-2 sm:py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-1 px-1 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Top 5</span>
            </TabsTrigger>
          </TabsList>

          {/* Kindness Feed Tab - Teachers can see student posts */}
          <TabsContent value="feed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Anonymous Kindness Feed
                </CardTitle>
                <CardDescription>
                  View all kindness posts from Eastern Guilford High School students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedContent />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Hours Verification Tab - ALWAYS VISIBLE (Core Feature) */}
          <TabsContent value="service-hours" className="space-y-6">
            {/* Verification Form Download for Teachers */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-orange-600" />
                  Print Verification Forms for Students
                </CardTitle>
                <CardDescription>
                  Students without printer access? Download and print the official verification form for them right here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>When to use:</strong> Student needs a form but doesn't have access to a printer at home. 
                    You can print it for them and they'll bring it to their service organization.
                  </p>
                  <ServiceVerificationFormDownload />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Service Hours Verification
                </CardTitle>
                <CardDescription>
                  Review and approve student community service submissions with photo proof
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceHoursContent />
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Time Savings:</strong> Reduces verification from 15 minutes to 30 seconds per student with one-click approval
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {featureFlags.curriculum && (
            <>
            <TabsContent value="lessons" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Find the Perfect Lesson
                </CardTitle>
                <CardDescription>
                  Filter by grade level, subject, and kindness theme to find lessons that fit your curriculum
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="grade-filter">Grade Level</Label>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger data-testid="select-grade">
                        <SelectValue placeholder="All grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All middle school grades</SelectItem>
                        <SelectItem value="6">Grade 6</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject-filter">Subject</Label>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger data-testid="select-subject">
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All subjects</SelectItem>
                        <SelectItem value="Character Education">Character Education</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Language Arts">Language Arts</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Morning Meeting">Morning Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="theme-filter">Kindness Theme</Label>
                    <Select value={themeFilter} onValueChange={setThemeFilter}>
                      <SelectTrigger data-testid="select-theme">
                        <SelectValue placeholder="All themes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All themes</SelectItem>
                        <SelectItem value="Empathy">Empathy</SelectItem>
                        <SelectItem value="Inclusion">Inclusion</SelectItem>
                        <SelectItem value="Gratitude">Gratitude</SelectItem>
                        <SelectItem value="Helping Others">Helping Others</SelectItem>
                        <SelectItem value="Community Service">Community Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="search">Search Lessons</Label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by title or theme..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons Grid */}
            {lessonsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-gray-600">Loading kindness lessons...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson: CurriculumLesson) => (
                  <Card 
                    key={lesson.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isLessonImplemented(lesson.id) ? 'border-green-200 bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedLesson(lesson)}
                    data-testid={`card-lesson-${lesson.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-2">{lesson.title}</CardTitle>
                          <CardDescription className="line-clamp-3">{lesson.description}</CardDescription>
                        </div>
                        {isLessonImplemented(lesson.id) && (
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Grade {lesson.gradeLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lesson.subject}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}>
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lesson.estimatedTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {lesson.kindnessTheme}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          variant={isLessonImplemented(lesson.id) ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLessonImplemented(lesson.id)) {
                              handleImplementLesson(lesson);
                            }
                          }}
                          disabled={implementLessonMutation.isPending}
                          data-testid={`button-implement-${lesson.id}`}
                        >
                          {isLessonImplemented(lesson.id) ? 'Implemented ✓' : 'Mark as Implemented'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredLessons.length === 0 && !lessonsLoading && (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Implementation Progress
                </CardTitle>
                <CardDescription>
                  Track your kindness curriculum implementation and student engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading your progress...</p>
                  </div>
                ) : teacherProgress.length > 0 ? (
                  <div className="space-y-4">
                    {teacherProgress.map((progress: CurriculumProgress) => {
                      const lesson = lessons.find((l: CurriculumLesson) => l.id === progress.lessonId);
                      return (
                        <Card key={progress.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">
                                {lesson?.title || 'Unknown Lesson'}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Implemented:</span> {' '}
                                  {new Date(progress.implementedAt).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Effectiveness:</span> {' '}
                                  {'★'.repeat(progress.effectiveness)}{'☆'.repeat(5-progress.effectiveness)}
                                </div>
                                <div>
                                  <span className="font-medium">Student Engagement:</span> {' '}
                                  {'★'.repeat(progress.studentEngagement)}{'☆'.repeat(5-progress.studentEngagement)}
                                </div>
                              </div>
                              {progress.lessonReflection && (
                                <div className="mt-3">
                                  <span className="font-medium">Reflection:</span>
                                  <p className="text-gray-600 mt-1">{progress.lessonReflection}</p>
                                </div>
                              )}
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-4" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons implemented yet</h3>
                    <p className="text-gray-600 mb-4">Start implementing kindness lessons to track your progress</p>
                    <Button onClick={() => setGradeFilter('')} data-testid="button-browse-lessons">
                      Browse Lesson Library
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Teaching Resources
                </CardTitle>
                <CardDescription>
                  Additional materials and tools to enhance your kindness curriculum
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="text-center">
                      <Heart className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Kindness Tracking Charts</h3>
                      <p className="text-sm text-gray-600 mb-4">Visual tools to track student kindness acts</p>
                      <Button variant="outline" size="sm" data-testid="button-download-charts">Download</Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Community Helpers Guide</h3>
                      <p className="text-sm text-gray-600 mb-4">Connect lessons with local community service</p>
                      <Button variant="outline" size="sm" data-testid="button-download-guide">Download</Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Assessment Rubrics</h3>
                      <p className="text-sm text-gray-600 mb-4">Tools to measure character development</p>
                      <Button variant="outline" size="sm" data-testid="button-download-rubrics">Download</Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            </>
          )}

          {/* Reports Tab */}
          {/* Moderation Queue Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Content Review Queue
                    </CardTitle>
                    <CardDescription>
                      Review flagged content from behavioral mitigation system - human approval required
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/api/export/moderation-queue', '_blank')}
                    data-testid="button-export-queue"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {moderationLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-gray-600">Loading review queue...</p>
                  </div>
                ) : moderationQueue.length === 0 ? (
                  <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">All Clear!</h3>
                    <p className="text-green-700">No content requires review at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationQueue.map((item: ModerationQueueItem) => (
                      <Card key={item.id} className="border-l-4" style={{
                        borderLeftColor: item.severityLevel === 'high' ? '#ef4444' : item.severityLevel === 'medium' ? '#f59e0b' : '#3b82f6'
                      }}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getSeverityIcon(item.severityLevel)}
                                <Badge className={getSeverityColor(item.severityLevel)}>
                                  {item.severityLevel.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{item.moderationCategory}</Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(item.flaggedAt).toLocaleDateString()} at {new Date(item.flaggedAt).toLocaleTimeString()}
                                </span>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Flagged Content:</p>
                                <p className="text-gray-900">{item.originalContent}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Reason:</span>
                                  <p className="text-gray-600">{item.flaggedReason}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Pattern Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.patternTags.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => resolveModerationMutation.mutate({ id: item.id, action: 'approve', notes: 'Content approved after review' })}
                                disabled={resolveModerationMutation.isPending}
                                data-testid={`button-approve-${item.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => resolveModerationMutation.mutate({ id: item.id, action: 'reject', notes: 'Content rejected - policy violation' })}
                                disabled={resolveModerationMutation.isPending}
                                data-testid={`button-reject-${item.id}`}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-5 w-5" />
                  About the Review Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 space-y-2">
                <p className="text-sm">
                  <strong>No Automatic Interventions:</strong> This system provides documentation and decision-support only. All flagged content requires your human review and approval.
                </p>
                <p className="text-sm">
                  <strong>Severity Levels:</strong> Low (informational), Medium (needs attention), High (requires immediate review)
                </p>
                <p className="text-sm">
                  <strong>Export Data:</strong> Click "Export to CSV" above to download review queue data for Google Sheets integration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection />
          </TabsContent>

          {/* Teacher Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <TeacherRewardsSection />
          </TabsContent>

          {/* v2.1 Admin Rewards Portal Tab */}
          <TabsContent value="admin-rewards" className="space-y-6">
            <AdminRewardsPortal />
          </TabsContent>

          {/* v2.1 Character Excellence Awards Tab */}
          <TabsContent value="character-excellence" className="space-y-6">
            <CharacterExcellence />
          </TabsContent>

          {/* v2.1 Monthly Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <MonthlyLeaderboard />
          </TabsContent>
        </Tabs>

        {/* Lesson Detail Modal */}
        {selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{selectedLesson.title}</CardTitle>
                    <CardDescription className="text-lg">{selectedLesson.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLesson(null)}
                    data-testid="button-close-modal"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>Grade {selectedLesson.gradeLevel}</Badge>
                  <Badge variant="outline">{selectedLesson.subject}</Badge>
                  <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
                    {selectedLesson.difficulty}
                  </Badge>
                  <Badge variant="outline">{selectedLesson.estimatedTime} minutes</Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Learning Objectives</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedLesson.objectives?.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Materials Needed</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedLesson.materials?.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Kindness Skills Developed</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.kindnessSkills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => {
                      if (!isLessonImplemented(selectedLesson.id)) {
                        handleImplementLesson(selectedLesson);
                      }
                      setSelectedLesson(null);
                    }}
                    disabled={isLessonImplemented(selectedLesson.id) || implementLessonMutation.isPending}
                    data-testid="button-implement-selected"
                  >
                    {isLessonImplemented(selectedLesson.id) ? 'Already Implemented ✓' : 'Mark as Implemented'}
                  </Button>
                  <Button variant="outline" data-testid="button-download-lesson">
                    Download Lesson Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedLesson.title}</CardTitle>
                    <CardDescription className="mt-2">{selectedLesson.description}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedLesson(null)}
                    data-testid="button-close-lesson-modal"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Grade Level</Label>
                      <p className="text-sm text-gray-600">{selectedLesson.gradeLevel}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm text-gray-600">{selectedLesson.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-gray-600">{selectedLesson.estimatedTime} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Difficulty</Label>
                      <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
                        {selectedLesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Learning Objectives</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedLesson.objectives?.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Required Materials</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedLesson.materials?.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Kindness Skills Developed</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.kindnessSkills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => {
                        if (!isLessonImplemented(selectedLesson.id)) {
                          handleImplementLesson(selectedLesson);
                        }
                        setSelectedLesson(null);
                      }}
                      disabled={isLessonImplemented(selectedLesson.id) || implementLessonMutation.isPending}
                      data-testid="button-implement-selected"
                    >
                      {isLessonImplemented(selectedLesson.id) ? 'Already Implemented ✓' : 'Mark as Implemented'}
                    </Button>
                    <Button variant="outline" data-testid="button-download-lesson">
                      Download Lesson Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Kindness Connect FAB */}
      <div
        onClick={() => setIsKindnessConnectOpen(true)}
        data-testid="button-kindness-connect-fab"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          cursor: 'pointer',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <button
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            border: '3px solid white',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            animation: 'pulse-kindness 2s infinite'
          }}
        >
          <span style={{ fontSize: '32px' }}>💝</span>
        </button>
        <div
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            whiteSpace: 'nowrap',
            border: '2px solid white'
          }}
        >
          Kindness Connect
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-kindness {
          0%, 100% {
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
      `}</style>
      
      <KindnessConnectModal 
        isOpen={isKindnessConnectOpen}
        onClose={() => setIsKindnessConnectOpen(false)}
      />
    </div>
  );
}

// Teacher Rewards Component
function TeacherRewardsSection() {
  const { toast } = useToast();
  
  // Fetch teacher reward progress
  const { data: rewardProgress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ['/api/teacher/rewards/progress'],
    staleTime: 300000 // 5 minutes
  });
  
  // Fetch available rewards
  const { data: availableRewards, isLoading: rewardsLoading } = useQuery<any>({
    queryKey: ['/api/teacher/rewards/available'],
    staleTime: 300000 // 5 minutes
  });

  if (progressLoading || rewardsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your teacher rewards...</p>
        </div>
      </div>
    );
  }

  const progress = rewardProgress?.progress || {};
  const rewards = availableRewards?.availableRewards || [];
  const sponsorMessage = rewardProgress?.sponsorMessage || "Discover local Burlington partners supporting your teaching excellence!";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-8 w-8" />
            <CardTitle className="text-2xl">Teacher Recognition Program</CardTitle>
          </div>
          <CardDescription className="text-purple-100">
            {sponsorMessage}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Hours Excellence */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${progress.serviceHoursExcellence?.eligible ? 'bg-green-100' : 'bg-blue-100'}`}>
                <CheckCircle className={`h-6 w-6 ${progress.serviceHoursExcellence?.eligible ? 'text-green-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Service Hours Excellence</CardTitle>
                <CardDescription>{progress.serviceHoursExcellence?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="font-semibold">{progress.serviceHoursExcellence?.monthlyProgress || 0}/{progress.serviceHoursExcellence?.monthlyThreshold || 10}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${progress.serviceHoursExcellence?.eligible ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(((progress.serviceHoursExcellence?.monthlyProgress || 0) / (progress.serviceHoursExcellence?.monthlyThreshold || 10)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">{progress.serviceHoursExcellence?.reward}</span>
              </div>
              {progress.serviceHoursExcellence?.eligible && (
                <Badge className="bg-green-100 text-green-800">Reward Earned! 🎉</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wellness Champion - Hidden unless AI wellness features enabled */}
        {featureFlags.aiWellness && (
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${progress.wellnessChampion?.eligible ? 'bg-green-100' : 'bg-purple-100'}`}>
                  <Heart className={`h-6 w-6 ${progress.wellnessChampion?.eligible ? 'text-green-600' : 'text-purple-600'}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Wellness Champion</CardTitle>
                  <CardDescription>{progress.wellnessChampion?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly Progress</span>
                  <span className="font-semibold">{progress.wellnessChampion?.weeklyProgress || 0}/{progress.wellnessChampion?.weeklyThreshold || 3}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${progress.wellnessChampion?.eligible ? 'bg-green-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min(((progress.wellnessChampion?.weeklyProgress || 0) / (progress.wellnessChampion?.weeklyThreshold || 3)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">{progress.wellnessChampion?.reward}</span>
                </div>
                {progress.wellnessChampion?.eligible && (
                  <Badge className="bg-green-100 text-green-800">Reward Earned! 🎉</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Builder */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${progress.communityBuilder?.eligible ? 'bg-green-100' : 'bg-orange-100'}`}>
                <Users className={`h-6 w-6 ${progress.communityBuilder?.eligible ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Community Builder</CardTitle>
                <CardDescription>{progress.communityBuilder?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Posts</span>
                <span className="font-semibold">{progress.communityBuilder?.monthlyProgress || 0}/{progress.communityBuilder?.monthlyThreshold || 5}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${progress.communityBuilder?.eligible ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(((progress.communityBuilder?.monthlyProgress || 0) / (progress.communityBuilder?.monthlyThreshold || 5)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">{progress.communityBuilder?.reward}</span>
              </div>
              {progress.communityBuilder?.eligible && (
                <Badge className="bg-green-100 text-green-800">Reward Earned! 🎉</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Award className="h-5 w-5" />
            Your Achievement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Current Month Progress</h4>
              <p className="text-blue-700">
                🏆 <strong>{rewardProgress?.summary?.totalEligibleRewards || 0}</strong> rewards earned this period
              </p>
              <p className="text-blue-600 mt-1">
                📅 Tracking period: {rewardProgress?.currentPeriod?.month || 'Current month'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Next Goal</h4>
              <p className="text-blue-700">
                🎯 {rewardProgress?.summary?.nextReward || 'All current rewards achieved!'}
              </p>
              <p className="text-blue-600 mt-1">Keep up the excellent work! 🌟</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Earned Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Your Earned Rewards
          </CardTitle>
          <CardDescription>
            Rewards you've earned and can redeem for building classroom culture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coffee Carafe - Earned */}
            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">☕</span>
                  <Badge className="bg-green-600">Ready to Claim</Badge>
                </div>
                <CardTitle className="text-lg mt-2">Coffee Carafe</CardTitle>
                <CardDescription className="text-green-800">Monthly classroom engagement goal achieved!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                  Claim Reward
                </Button>
                <p className="text-xs text-green-700 mt-2">
                  Sponsored by A Special Blend Coffee
                </p>
              </CardContent>
            </Card>

            {/* Spa Day - In Progress */}
            <Card className="border-2 border-amber-300 bg-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">💆</span>
                  <Badge className="bg-amber-600">85% Complete</Badge>
                </div>
                <CardTitle className="text-lg mt-2">Spa Day</CardTitle>
                <CardDescription className="text-amber-800">Verify 3 more service hours to unlock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-amber-700">
                  17/20 hours verified this quarter
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Sponsored by Green Valley Spa
                </p>
              </CardContent>
            </Card>

            {/* Restaurant Card - Available */}
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🍽️</span>
                  <Badge className="bg-blue-600">Available</Badge>
                </div>
                <CardTitle className="text-lg mt-2">$50 Restaurant Card</CardTitle>
                <CardDescription className="text-blue-800">Earned for exceptional student engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  Claim Reward
                </Button>
                <p className="text-xs text-blue-700 mt-2">
                  Valid at Dames Chicken & Waffles
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// v2.1 Admin Rewards Portal Component
function AdminRewardsPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    rewardName: '',
    description: '',
    tokenCost: 0,
    quantityAvailable: 1,
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin-rewards'],
    staleTime: 30000,
  });

  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin-rewards/redemptions'],
    staleTime: 30000,
  });

  const createRewardMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin-rewards', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-rewards'] });
      toast({ title: "Success", description: "School reward created successfully!" });
      setIsCreateDialogOpen(false);
      setNewReward({ rewardName: '', description: '', tokenCost: 0, quantityAvailable: 1 });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create reward", variant: "destructive" });
    },
  });

  const updateRedemptionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approved' | 'denied' | 'fulfilled' }) => {
      return await apiRequest('PATCH', `/api/admin-rewards/redemptions/${id}`, { status: action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-rewards/redemptions'] });
      toast({ title: "Success", description: "Redemption status updated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update redemption", variant: "destructive" });
    },
  });

  if (rewardsLoading || redemptionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-purple-600" />
            Admin School Rewards Portal
          </CardTitle>
          <CardDescription>
            Manage high-value non-token rewards like VIP parking passes, homework passes, and field trip vouchers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              data-testid="button-create-reward"
            >
              <Gift className="h-4 w-4 mr-2" />
              Create New Reward
            </Button>
          </div>

          {isCreateDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle>Create School Reward</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Reward Name</Label>
                    <Input
                      value={newReward.rewardName}
                      onChange={(e) => setNewReward({ ...newReward, rewardName: e.target.value })}
                      placeholder="VIP Parking Pass"
                      data-testid="input-reward-name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      placeholder="Reserved parking spot for one month"
                      data-testid="input-reward-description"
                    />
                  </div>
                  <div>
                    <Label>Token Cost (0 for admin-approval-only)</Label>
                    <Input
                      type="number"
                      value={newReward.tokenCost}
                      onChange={(e) => setNewReward({ ...newReward, tokenCost: parseInt(e.target.value) || 0 })}
                      data-testid="input-token-cost"
                    />
                  </div>
                  <div>
                    <Label>Quantity Available</Label>
                    <Input
                      type="number"
                      value={newReward.quantityAvailable}
                      onChange={(e) => setNewReward({ ...newReward, quantityAvailable: parseInt(e.target.value) || 1 })}
                      data-testid="input-quantity"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createRewardMutation.mutate(newReward)}
                      disabled={!newReward.rewardName || createRewardMutation.isPending}
                      className="flex-1"
                      data-testid="button-submit-reward"
                    >
                      {createRewardMutation.isPending ? 'Creating...' : 'Create Reward'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel-reward"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No rewards created yet. Click "Create New Reward" to get started!</p>
              </div>
            ) : (
              rewards.map((reward: any) => (
                <Card key={reward.id} data-testid={`reward-card-${reward.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{reward.rewardName}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Token Cost:</strong> {reward.tokenCost === 0 ? 'Admin Approval Only' : `${reward.tokenCost} tokens`}</p>
                      <p><strong>Available:</strong> {reward.quantityAvailable}</p>
                      <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                        {reward.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pending Redemption Requests
          </CardTitle>
          <CardDescription>
            Review and approve student applications for school rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.filter((r: any) => r.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No pending redemption requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions
                .filter((r: any) => r.status === 'pending')
                .map((redemption: any) => (
                  <Card key={redemption.id} className="border-2 border-yellow-200" data-testid={`redemption-${redemption.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{redemption.rewardName}</h4>
                          <p className="text-sm text-gray-600">Student: {redemption.studentName}</p>
                          <p className="text-sm text-gray-500">Applied: {new Date(redemption.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateRedemptionMutation.mutate({ id: redemption.id, action: 'approved' })}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-${redemption.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRedemptionMutation.mutate({ id: redemption.id, action: 'denied' })}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            data-testid={`button-deny-${redemption.id}`}
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// v2.1 Character Excellence Awards Component
function CharacterExcellence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [tokensAwarded, setTokensAwarded] = useState(500);
  const [narrative, setNarrative] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/users', 'student'],
    queryFn: async () => {
      const response = await fetch('/api/users?role=student');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    staleTime: 60000,
  });

  const awardMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/character-excellence/award', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ 
        title: "Character Excellence Award Granted!", 
        description: `${data.studentName} awarded ${tokensAwarded} tokens for exceptional character demonstration.` 
      });
      setSelectedStudentId('');
      setTokensAwarded(500);
      setNarrative('');
      setSearchTerm('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to award tokens", variant: "destructive" });
    },
  });

  const filteredStudents = students.filter((s: any) => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-rose-600" />
            Character Excellence Recognition
          </CardTitle>
          <CardDescription>
            Award 500-1000 bonus tokens to students who demonstrate exceptional character traits and leadership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white p-6 rounded-lg border-2 border-rose-200 space-y-4">
            <div>
              <Label htmlFor="student-search">Search for Student</Label>
              <Input
                id="student-search"
                placeholder="Type student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-student-search"
                className="mb-2"
              />
              {searchTerm && (
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.slice(0, 10).map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name || student.email} {student.gradeLevel && `(Grade ${student.gradeLevel})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="token-amount">Token Amount (500-1000)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="token-amount"
                  type="range"
                  min="500"
                  max="1000"
                  step="50"
                  value={tokensAwarded}
                  onChange={(e) => setTokensAwarded(parseInt(e.target.value))}
                  className="flex-1"
                  data-testid="slider-tokens"
                />
                <Badge className="w-24 justify-center text-lg" variant="secondary">
                  {tokensAwarded}
                </Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="narrative">Narrative Justification (Required, min 20 characters)</Label>
              <textarea
                id="narrative"
                placeholder="Describe why this student deserves this recognition. What character traits did they demonstrate? What impact did their actions have?"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full min-h-[120px] p-3 border rounded-md"
                data-testid="textarea-narrative"
              />
              <p className="text-sm text-gray-500 mt-1">
                {narrative.length}/20 characters minimum
              </p>
            </div>

            <Button
              onClick={() => awardMutation.mutate({
                studentId: selectedStudentId,
                tokensAwarded,
                narrative,
              })}
              disabled={!selectedStudentId || narrative.length < 20 || awardMutation.isPending}
              className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
              data-testid="button-award-excellence"
            >
              <Trophy className="h-4 w-4 mr-2" />
              {awardMutation.isPending ? 'Awarding Tokens...' : 'Award Character Excellence Tokens'}
            </Button>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recognition Guidelines
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Awards range from 500-1000 tokens based on impact</li>
              <li>• Narrative should describe specific character traits demonstrated</li>
              <li>• Examples: Consistent kindness leadership, organizing service events, mentoring peers</li>
              <li>• All awards are logged in transaction history for audit trail</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// v2.1 Monthly Leaderboard Component
function MonthlyLeaderboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaderboardData, isLoading, refetch } = useQuery<any>({
    queryKey: ['/api/leaderboard/monthly-top-earners'],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border-2 border-fuchsia-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-fuchsia-600" />
                Monthly Top 5 Token Earners - {currentMonth}
              </CardTitle>
              <CardDescription>
                Recognition for Principal's Corner announcements and positive reinforcement
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                refetch();
                toast({ title: "Refreshed", description: "Leaderboard data updated!" });
              }}
              variant="outline"
              size="sm"
              data-testid="button-refresh-leaderboard"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!leaderboardData || Object.keys(leaderboardData).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>No leaderboard data available for this month</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[9, 10, 11, 12].map((grade) => {
                const gradeKey = `grade${grade}`;
                const topStudents = leaderboardData[gradeKey] || [];
                
                return (
                  <Card key={grade} className="border-2 border-fuchsia-200" data-testid={`leaderboard-grade-${grade}`}>
                    <CardHeader className="bg-gradient-to-r from-fuchsia-100 to-pink-100 pb-3">
                      <CardTitle className="text-lg text-center">
                        Grade {grade}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {topStudents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No students yet</p>
                      ) : (
                        <div className="space-y-3">
                          {topStudents.map((student: any, index: number) => (
                            <div 
                              key={student.userId}
                              className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-fuchsia-50 to-pink-50"
                              data-testid={`student-rank-${index + 1}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold w-8">
                                  {getMedal(index + 1)}
                                </span>
                                <div>
                                  <p className="font-semibold text-sm">{student.userName}</p>
                                  <p className="text-xs text-gray-500">{student.tokensEarned} tokens</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Principal's Corner Recognition
            </h4>
            <p className="text-sm text-blue-800">
              Share these top performers in your weekly Principal's Corner announcements to celebrate student achievement and encourage positive behavior across the school.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reports Component
function ReportsSection() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Users className="h-8 w-8" />
            <CardTitle className="text-2xl">Teacher Reports</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Generate comprehensive reports for students, parents, and administration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Class Reports
            </CardTitle>
            <CardDescription>
              Generate reports for your entire class progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                data-testid="button-class-progress"
                onClick={() => toast({ title: "Class Progress Report", description: "Generating comprehensive class report..." })}
              >
                📊 Weekly Class Progress
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-kindness-summary"
                onClick={() => toast({ title: "Kindness Summary", description: "Generating kindness activities summary..." })}
              >
                💝 Kindness Activities Summary
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-service-hours"
                onClick={() => toast({ title: "Service Hours Report", description: "Generating service hours report..." })}
              >
                🏥 Service Hours
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Student Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Student Reports
            </CardTitle>
            <CardDescription>
              Individual progress and achievement reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                data-testid="button-individual-progress"
                onClick={() => toast({ title: "Individual Reports", description: "Generating individual student reports..." })}
              >
                📋 Individual Progress Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-parent-updates"
                onClick={() => toast({ title: "Parent Updates", description: "Preparing parent communication..." })}
              >
                📧 Parent Progress Updates
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-achievement-certificates"
                onClick={() => toast({ title: "Achievement Certificates", description: "Generating achievement certificates..." })}
              >
                🏆 Achievement Certificates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Administrative Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Administrative Reports
            </CardTitle>
            <CardDescription>
              Reports for school administration and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                data-testid="button-principal-summary"
                onClick={() => toast({ title: "Principal Summary", description: "Generating administrative summary..." })}
              >
                🏫 Principal Summary Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-curriculum-alignment"
                onClick={() => toast({ title: "Curriculum Alignment", description: "Generating curriculum alignment report..." })}
              >
                📚 Curriculum Alignment Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-character-assessment"
                onClick={() => toast({ title: "Character Assessment", description: "Generating character assessment report..." })}
              >
                🧠 Character Assessment Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parent Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Parent Communication
            </CardTitle>
            <CardDescription>
              Positive communication tools for parent engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                data-testid="button-positive-notes"
                onClick={() => toast({ title: "Positive Notes", description: "Preparing positive parent communication..." })}
              >
                💌 Send Positive Notes Home
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-character-highlights"
                onClick={() => toast({ title: "Character Highlights", description: "Generating character development highlights..." })}
              >
                ⭐ Character Development Highlights
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-monthly-newsletter"
                onClick={() => toast({ title: "Monthly Newsletter", description: "Creating monthly character education newsletter..." })}
              >
                📰 Monthly Character Newsletter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Clock className="h-5 w-5" />
            Quick Report Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">One-Click Reports</h4>
              <p className="text-green-700 text-sm">
                📊 Generate weekly class summaries instantly
              </p>
              <p className="text-green-700 text-sm">
                💝 Export kindness activity logs for parents
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Scheduled Reports</h4>
              <p className="text-green-700 text-sm">
                📅 Automated monthly progress reports
              </p>
              <p className="text-green-700 text-sm">
                📧 Weekly parent communication summaries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}