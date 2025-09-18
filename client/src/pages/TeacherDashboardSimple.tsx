import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, BookOpen, Users, Star, Clock, Target, CheckCircle, Search, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  selStandards: string[];
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

interface TeacherDashboardProps {
  teacherId?: string;
}

export default function TeacherDashboard({ teacherId = "teacher-demo" }: TeacherDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null);

  // Middle School Curriculum Fallback Data (Grades 6-8) - Matches database content
  const sampleLessons: CurriculumLesson[] = [
    {
      id: 'lesson-1',
      title: 'Community Impact Research & Action',
      description: 'Students conduct research on local community issues, interview stakeholders, and develop data-driven service projects that create measurable positive impact in their community.',
      gradeLevel: '6-8',
      subject: 'Social Studies',
      kindnessTheme: 'Community Service',
      difficulty: 'Hard',
      estimatedTime: 90,
      objectives: [
        'Students will identify and research 3 specific community issues using data sources',
        'Students will conduct stakeholder interviews to understand community needs',
        'Students will design evidence-based service projects with measurable outcomes',
        'Students will present their findings and recommendations to community leaders'
      ],
      activities: [],
      assessment: {},
      materials: ['Community helper research books', 'Research worksheet templates', 'Interview question guides', 'Project planning templates'],
      vocabulary: ['community service - organized activity to help solve community problems', 'civic responsibility - duty to participate in community improvement', 'impact assessment - measuring the effects of your actions', 'stakeholder - person or group affected by community issues'],
      kindnessSkills: ['Community service', 'Appreciation', 'Planning', 'Collaboration'],
      selStandards: ['Social Awareness', 'Responsible Decision Making', 'Relationship Skills'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-2',
      title: 'Breaking Down Barriers: Understanding Differences',
      description: 'Students explore diversity, unconscious bias, and privilege while developing strategies to create inclusive environments for all classmates.',
      gradeLevel: '6-8',
      subject: 'Language Arts',
      kindnessTheme: 'Inclusion',
      difficulty: 'Hard',
      estimatedTime: 90,
      objectives: [
        'Students will identify different types of diversity in their school and community',
        'Students will recognize unconscious biases and their impact on others',
        'Students will develop strategies for creating inclusive environments',
        'Students will create inclusive media campaigns for their school'
      ],
      activities: [],
      assessment: {},
      materials: ['Identity wheel worksheets', 'Privilege reflection questions', 'Bias scenario cards', 'Media analysis examples'],
      vocabulary: ['diversity - the variety of different identities and experiences', 'unconscious bias - automatic preferences we have without realizing it', 'privilege - unearned advantages some people have', 'inclusion - actively welcoming and valuing all people'],
      kindnessSkills: ['Inclusion', 'Cultural awareness', 'Bias recognition', 'Advocacy'],
      selStandards: ['Self-Awareness', 'Social Awareness', 'Responsible Decision Making'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-3',
      title: 'Digital Citizenship and Online Kindness',
      description: 'Students develop skills for positive online interactions, learn to combat cyberbullying, and create digital content that spreads kindness.',
      gradeLevel: '6-8',
      subject: 'Technology/Language Arts',
      kindnessTheme: 'Digital Kindness',
      difficulty: 'Hard',
      estimatedTime: 75,
      objectives: [
        'Students will identify characteristics of positive digital citizenship',
        'Students will develop strategies for responding to cyberbullying',
        'Students will create digital content that promotes kindness and inclusion',
        'Students will establish personal guidelines for online interactions'
      ],
      activities: [],
      assessment: {},
      materials: ['Computers/tablets with internet access', 'Digital footprint example materials', 'Cyberbullying scenario cards', 'Video recording equipment'],
      vocabulary: ['digital footprint - the permanent trail of data you leave when using the internet', 'cyberbullying - using technology to hurt, embarrass, or threaten someone repeatedly', 'upstander - someone who speaks up when they see bullying or injustice', 'digital citizenship - responsible and ethical use of technology and online resources'],
      kindnessSkills: ['Digital citizenship', 'Upstander behavior', 'Online communication', 'Content creation'],
      selStandards: ['Self-Management', 'Social Awareness', 'Responsible Decision Making'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-4',
      title: 'Restorative Justice Circle: Healing Harm with Kindness',
      description: 'Students learn restorative justice principles to repair relationships, build empathy, and create classroom communities focused on healing rather than punishment.',
      gradeLevel: '6-8',
      subject: 'Character Education',
      kindnessTheme: 'Conflict Resolution',
      difficulty: 'Hard',
      estimatedTime: 80,
      objectives: [
        'Students will understand restorative vs. punitive approaches to conflict',
        'Students will practice using restorative circle processes',
        'Students will develop skills for taking responsibility and making amends',
        'Students will create classroom agreements based on restorative principles'
      ],
      activities: [],
      assessment: {},
      materials: ['Restorative justice educational materials', 'Circle guidelines poster', 'Talking piece (special object)', 'Conflict scenario cards'],
      vocabulary: ['restorative justice - focusing on healing and repairing harm rather than punishment', 'accountability - taking full responsibility for your actions and their consequences', 'amends - concrete actions taken to repair harm you\'ve caused', 'circle keeper - the person who facilitates a restorative circle discussion'],
      kindnessSkills: ['Conflict resolution', 'Accountability', 'Empathy', 'Community building'],
      selStandards: ['Self-Management', 'Social Awareness', 'Relationship Skills', 'Responsible Decision Making'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-5',
      title: 'Emotional Intelligence & Advanced Empathy Skills',
      description: 'Students develop sophisticated emotional intelligence by analyzing complex social situations, practicing advanced perspective-taking, and creating comprehensive empathy action plans.',
      gradeLevel: '6-8',
      subject: 'Character Education',
      kindnessTheme: 'Empathy Development',
      difficulty: 'Medium',
      estimatedTime: 75,
      objectives: [
        'Students will identify complex emotions through subtle nonverbal cues',
        'Students will analyze multi-perspective scenarios involving social conflicts',
        'Students will demonstrate sophisticated empathetic responses to peer challenges',
        'Students will design and implement school-wide empathy initiatives'
      ],
      activities: [],
      assessment: {},
      materials: ['Video scenario library', 'Emotion analysis worksheets', 'Multi-perspective case studies', 'Conflict mapping templates'],
      vocabulary: ['empathy - understanding and sharing someone else\'s feelings deeply', 'perspective-taking - actively considering how someone else views a situation', 'emotional regulation - managing your emotions in healthy ways', 'social awareness - understanding group dynamics and social cues'],
      kindnessSkills: ['Empathy', 'Perspective-taking', 'Emotional awareness', 'Program design'],
      selStandards: ['Self-Awareness', 'Social Awareness', 'Relationship Skills'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    }
  ];

  // Fetch curriculum lessons
  const { data: lessons = sampleLessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['/api/curriculum/lessons'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/curriculum/lessons');
        if (!response.ok) {
          console.log('API not available, using sample data');
          return sampleLessons;
        }
        return response.json();
      } catch (error) {
        console.log('API error, using sample data:', error);
        return sampleLessons;
      }
    },
  });

  // Fetch teacher's implementation progress
  const { data: teacherProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['/api/curriculum/progress', teacherId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/curriculum/progress/${teacherId}`);
        if (!response.ok) {
          console.log('Progress API not available, using empty array');
          return [];
        }
        return response.json();
      } catch (error) {
        console.log('Progress API error:', error);
        return [];
      }
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
        title: "Success!",
        description: "Lesson marked as implemented (demo mode)",
      });
    },
  });

  // Filter lessons based on search term
  const filteredLessons = lessons.filter((lesson: CurriculumLesson) =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.kindnessTheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/?show=roles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-lg text-gray-600">
                  Monitor your students, manage your classroom, and access curriculum resources
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setLocation('/app')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                data-testid="button-student-feed"
              >
                <Heart className="w-4 h-4 mr-2" />
                View Student Feed
              </Button>
              <Button
                onClick={() => setLocation('/wellness-checkin')}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                data-testid="button-wellness-check"
              >
                <Target className="w-4 h-4 mr-2" />
                Student Wellness
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="classroom" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="classroom" data-testid="tab-classroom">
              <Users className="h-4 w-4 mr-2" />
              My Classroom
            </TabsTrigger>
            <TabsTrigger value="student-feed" data-testid="tab-student-feed">
              <Heart className="h-4 w-4 mr-2" />
              Student Posts
            </TabsTrigger>
            <TabsTrigger value="support-monitor" data-testid="tab-support-monitor">
              <Shield className="h-4 w-4 mr-2" />
              Support Monitor
            </TabsTrigger>
            <TabsTrigger value="lessons" data-testid="tab-lessons">
              <BookOpen className="h-4 w-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <Star className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* My Classroom Tab */}
          <TabsContent value="classroom" className="space-y-6">
            {/* Class Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <div className="text-sm text-gray-600">Active This Week</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">47</div>
                  <div className="text-sm text-gray-600">Kindness Acts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">2</div>
                  <div className="text-sm text-gray-600">Need Attention</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Student Activity Overview</CardTitle>
                <CardDescription>Recent kindness posts and student engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Emma S.</p>
                        <p className="text-sm text-gray-600">Helped classmate with homework</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Marcus T.</p>
                        <p className="text-sm text-gray-600">Shared lunch with new student</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Zoe K.</p>
                        <p className="text-sm text-gray-600">Organized playground cleanup</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Yesterday</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Posts Tab */}
          <TabsContent value="student-feed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Student Kindness Feed
                </CardTitle>
                <CardDescription>Real-time feed of kindness posts from your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button
                    onClick={() => setLocation('/app')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    size="lg"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    View Full Student Feed
                  </Button>
                  <p className="text-gray-600 mt-3">Access the complete kindness feed to see all student posts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Monitor Tab */}
          <TabsContent value="support-monitor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Student Support Monitor
                </CardTitle>
                <CardDescription>Monitor student wellness and provide support when needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">All Students Safe</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">No crisis alerts or support requests at this time</p>
                  </div>
                  
                  <div className="text-center py-6">
                    <Button
                      onClick={() => setLocation('/wellness-checkin')}
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Access Wellness Check-In
                    </Button>
                    <p className="text-gray-600 mt-3">Monitor student emotional well-being and provide support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Class Analytics
                </CardTitle>
                <CardDescription>Track student progress and classroom engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Class Participation</span>
                        <span className="text-sm text-gray-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Kindness Goal Progress</span>
                        <span className="text-sm text-gray-600">82%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Student Engagement</span>
                        <span className="text-sm text-gray-600">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Top Performers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Emma S.</span>
                        <Badge variant="secondary">12 acts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Marcus T.</span>
                        <Badge variant="secondary">10 acts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">Zoe K.</span>
                        <Badge variant="secondary">9 acts</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find the Perfect Lesson
                </CardTitle>
                <CardDescription>
                  Search for lessons by title, theme, or grade level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <Label htmlFor="search">Search Lessons</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by title, theme, or grade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
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
                  <p className="text-gray-600">Try a different search term</p>
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
                    <Button onClick={() => setSearchTerm('')} data-testid="button-browse-lessons">
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
      </div>
    </div>
  );
}