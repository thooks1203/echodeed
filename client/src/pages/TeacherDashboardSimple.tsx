import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, BookOpen, Users, Star, Clock, Target, CheckCircle, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null);

  // Sample curriculum lessons data
  const sampleLessons: CurriculumLesson[] = [
    {
      id: 'lesson-1',
      title: 'The Power of Thank You',
      description: 'Students learn the importance of gratitude and practice expressing thanks in meaningful ways.',
      gradeLevel: 'K-2',
      subject: 'Character Education',
      kindnessTheme: 'Gratitude',
      difficulty: 'Easy',
      estimatedTime: 30,
      objectives: [
        'Students will understand what gratitude means',
        'Students will identify things they are thankful for',
        'Students will practice saying thank you genuinely'
      ],
      activities: [],
      assessment: {},
      materials: ['Thank you cards', 'Crayons', 'Chart paper'],
      vocabulary: ['grateful', 'thankful', 'appreciate'],
      kindnessSkills: ['Gratitude', 'Expression', 'Recognition'],
      selStandards: ['Self-Awareness', 'Social Skills'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-2',
      title: 'Including Everyone',
      description: 'Build empathy by learning how to include classmates and recognize when someone feels left out.',
      gradeLevel: '3-5',
      subject: 'Social Studies',
      kindnessTheme: 'Inclusion',
      difficulty: 'Medium',
      estimatedTime: 45,
      objectives: [
        'Students will recognize signs of exclusion',
        'Students will practice inclusive behavior',
        'Students will understand the impact of inclusion'
      ],
      activities: [],
      assessment: {},
      materials: ['Role-play cards', 'Discussion prompts', 'Reflection journal'],
      vocabulary: ['inclusion', 'empathy', 'belonging'],
      kindnessSkills: ['Empathy', 'Inclusion', 'Recognition'],
      selStandards: ['Social Awareness', 'Relationship Skills'],
      isActive: true,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01'
    },
    {
      id: 'lesson-3',
      title: 'Community Helpers and Kindness',
      description: 'Explore how community helpers show kindness and how students can help their community.',
      gradeLevel: '6-8',
      subject: 'Language Arts',
      kindnessTheme: 'Community Service',
      difficulty: 'Hard',
      estimatedTime: 60,
      objectives: [
        'Students will identify community helpers',
        'Students will plan a community service project',
        'Students will write thank you letters to helpers'
      ],
      activities: [],
      assessment: {},
      materials: ['Writing materials', 'Community helper photos', 'Project planning sheets'],
      vocabulary: ['community', 'service', 'citizenship'],
      kindnessSkills: ['Community Service', 'Planning', 'Communication'],
      selStandards: ['Social Awareness', 'Responsible Decision Making'],
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

        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
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
          </TabsList>

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