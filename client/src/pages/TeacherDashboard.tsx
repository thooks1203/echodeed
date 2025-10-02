import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, BookOpen, Users, Star, Clock, Target, CheckCircle, Filter, Search, Award, Gift, Coffee, Trophy, Shield, AlertTriangle, FileText, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { featureFlags } from '@shared/featureFlags';

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

export default function TeacherDashboard({ teacherId = "teacher-demo", initialTab = "lessons" }: TeacherDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter states
  const [gradeFilter, setGradeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null);

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
  const { data: moderationQueue = [], isLoading: moderationLoading } = useQuery({
    queryKey: ['/api/moderation/queue'],
    queryFn: async () => {
      const response = await fetch('/api/moderation/queue');
      if (!response.ok) throw new Error('Failed to fetch moderation queue');
      return response.json();
    },
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Teacher Curriculum Hub</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            K-8 kindness lesson plans designed to build empathy, character, and community in your classroom
          </p>
        </header>

        <Tabs defaultValue={initialTab.toLowerCase()} className="w-full">
          <TabsList className={`grid w-full ${featureFlags.curriculum ? 'grid-cols-6' : 'grid-cols-3'} mb-6`}>
            {featureFlags.curriculum && (
              <>
                <TabsTrigger value="lessons" data-testid="tab-lessons">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lesson Library
                </TabsTrigger>
                <TabsTrigger value="progress" data-testid="tab-progress">
                  <Target className="h-4 w-4 mr-2" />
                  My Progress
                </TabsTrigger>
                <TabsTrigger value="resources" data-testid="tab-resources">
                  <Star className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="moderation" data-testid="tab-moderation">
              <Shield className="h-4 w-4 mr-2" />
              Review Queue
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <Users className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Award className="h-4 w-4 mr-2" />
              Teacher Rewards
            </TabsTrigger>
          </TabsList>

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
    </div>
  );
}

// Teacher Rewards Component
function TeacherRewardsSection() {
  const { toast } = useToast();
  
  // Fetch teacher reward progress
  const { data: rewardProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/teacher/rewards/progress'],
    staleTime: 300000 // 5 minutes
  });
  
  // Fetch available rewards
  const { data: availableRewards, isLoading: rewardsLoading } = useQuery({
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

      {/* Available Partner Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Partner Rewards
          </CardTitle>
          <CardDescription>
            Local Burlington businesses supporting our educators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((partner: any) => (
              <Card key={partner.id} className="border-2 hover:border-purple-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{partner.partnerName}</CardTitle>
                  <CardDescription>{partner.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {partner.rewardTypes?.map((rewardType: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Coffee className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="font-medium text-sm">{rewardType.name}</p>
                          <p className="text-xs text-gray-600">{rewardType.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                data-testid="button-sel-assessment"
                onClick={() => toast({ title: "SEL Assessment", description: "Generating SEL assessment report..." })}
              >
                🧠 SEL Assessment Report
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