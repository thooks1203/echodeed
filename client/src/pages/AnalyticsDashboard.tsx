import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Heart, 
  Star, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Brain,
  Shield,
  Activity,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface AnalyticsProps {
  schoolId?: string;
  teacherId?: string;
  gradeLevel?: string;
}

interface StudentEngagement {
  studentId: string;
  participationRate: number;
  kindnessPostsCount: number;
  lastActivity: string;
  wellnessScore: number;
  selProgress: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ClassroomMetrics {
  totalStudents: number;
  activeParticipants: number;
  averageEngagement: number;
  kindnessActsThisWeek: number;
  wellnessAverage: number;
  alertsCount: number;
}

export default function AnalyticsDashboard({ 
  schoolId = "school-demo", 
  teacherId = "teacher-demo",
  gradeLevel = "all"
}: AnalyticsProps) {
  const [, setLocation] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'semester'>('week');
  const [selectedGrade, setSelectedGrade] = useState<string>(gradeLevel);

  // Fetch analytics data using existing endpoints
  const { data: wellnessCheckIns, isLoading: wellnessLoading } = useQuery({
    queryKey: ['/api/wellness-checkins', { schoolId, gradeLevel: selectedGrade !== 'all' ? selectedGrade : undefined }],
    retry: false,
  });

  const { data: wellnessTrends, isLoading: trendsLoading } = useQuery({
    queryKey: [`/api/wellness-trends/${schoolId}`],
    retry: false,
  });

  const { data: kindnessPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
    retry: false,
  });

  const { data: selStandards, isLoading: selLoading } = useQuery({
    queryKey: [`/api/school/sel-standards/grade/${selectedGrade !== 'all' ? selectedGrade : '6-8'}`],
    retry: false,
  });

  // Mock data for demonstration (replace with real API data)
  const mockClassroomMetrics: ClassroomMetrics = {
    totalStudents: 156,
    activeParticipants: 142,
    averageEngagement: 87,
    kindnessActsThisWeek: 89,
    wellnessAverage: 82,
    alertsCount: 3
  };

  const mockStudentEngagement: StudentEngagement[] = [
    {
      studentId: "student-001",
      participationRate: 95,
      kindnessPostsCount: 12,
      lastActivity: "2 hours ago",
      wellnessScore: 85,
      selProgress: "proficient",
      riskLevel: "low"
    },
    {
      studentId: "student-002", 
      participationRate: 45,
      kindnessPostsCount: 3,
      lastActivity: "5 days ago",
      wellnessScore: 62,
      selProgress: "developing",
      riskLevel: "medium"
    },
    {
      studentId: "student-003",
      participationRate: 25,
      kindnessPostsCount: 1,
      lastActivity: "2 weeks ago",
      wellnessScore: 45,
      selProgress: "beginning",
      riskLevel: "high"
    }
  ];

  if (wellnessLoading || trendsLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics from real data
  const totalStudents = 156; // Could be calculated from real data
  const activeStudents = Array.isArray(kindnessPosts) ? new Set(kindnessPosts.map(p => p.authorId)).size : 142;
  const kindnessCount = Array.isArray(kindnessPosts) ? kindnessPosts.length : 89;
  const avgWellness = Array.isArray(wellnessCheckIns) && wellnessCheckIns.length > 0 
    ? Math.round(wellnessCheckIns.reduce((sum, c) => sum + (c.moodScore || 3), 0) / wellnessCheckIns.length * 20)
    : 82;

  const metrics = {
    totalStudents,
    activeParticipants: activeStudents,
    averageEngagement: Math.round((activeStudents / totalStudents) * 100),
    kindnessActsThisWeek: kindnessCount,
    wellnessAverage: avgWellness,
    alertsCount: Array.isArray(wellnessCheckIns) ? wellnessCheckIns.filter(c => c.moodScore <= 2).length : 3
  };
  
  const engagement = mockStudentEngagement;

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

        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <BarChart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Engagement Analytics
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Data-driven insights into student participation, kindness trends, and character development progress
          </p>
        </header>

        {/* Time Range & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex gap-2">
                <span className="text-sm font-medium">Time Range:</span>
                {(['week', 'month', 'semester'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                    data-testid={`button-time-${range}`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <span className="text-sm font-medium">Grade:</span>
                {(['all', 'K-2', '3-5', '6-8'] as const).map((grade) => (
                  <Button
                    key={grade}
                    variant={selectedGrade === grade ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGrade(grade)}
                    data-testid={`button-grade-${grade}`}
                  >
                    {grade === 'all' ? 'All Grades' : `Grades ${grade}`}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{metrics.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Participants</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.activeParticipants}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((metrics.activeParticipants / metrics.totalStudents) * 100)}% participation
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kindness Acts</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.kindnessActsThisWeek}</p>
                  <p className="text-xs text-gray-500">This {selectedTimeRange}</p>
                </div>
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wellness Score</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.wellnessAverage}</p>
                  <p className="text-xs text-gray-500">Average mood rating</p>
                </div>
                <Brain className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
            <TabsTrigger value="wellness">Wellness Trends</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum Progress</TabsTrigger>
            <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Student Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Individual Student Engagement
                </CardTitle>
                <CardDescription>
                  Track participation rates, kindness activity, and character development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagement.map((student, index) => (
                    <div key={student.studentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">Student {index + 1}</div>
                            <div className="text-sm text-gray-500">Last active: {student.lastActivity}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={student.riskLevel === 'low' ? 'secondary' : 
                                  student.riskLevel === 'medium' ? 'default' : 'destructive'}
                        >
                          {student.riskLevel} risk
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Participation Rate</div>
                          <div className="flex items-center gap-2">
                            <Progress value={student.participationRate} className="flex-1" />
                            <span className="text-sm font-medium">{student.participationRate}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Kindness Posts</div>
                          <div className="text-xl font-bold text-purple-600">{student.kindnessPostsCount}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Wellness Score</div>
                          <div className="text-xl font-bold text-orange-600">{student.wellnessScore}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">SEL Progress</div>
                          <Badge variant="outline">{student.selProgress}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wellness Trends Tab */}
          <TabsContent value="wellness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Student Wellness Overview
                </CardTitle>
                <CardDescription>
                  Daily mood tracking and wellbeing insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
                    <div className="text-sm text-gray-600">Students feeling positive</div>
                    <div className="text-xs text-gray-500">Mood score 4-5</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">18%</div>
                    <div className="text-sm text-gray-600">Neutral mood</div>
                    <div className="text-xs text-gray-500">Mood score 3</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">4%</div>
                    <div className="text-sm text-gray-600">Need attention</div>
                    <div className="text-xs text-gray-500">Mood score 1-2</div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="font-semibold">Recent Wellness Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Overall mood improving</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Stress levels stable</span>
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm">Sleep quality concerns in Grade 6</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curriculum Progress Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Curriculum Implementation Progress
                </CardTitle>
                <CardDescription>
                  Track kindness lesson completion and student engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Lessons Completed This Month</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">The Power of Thank You</span>
                            <span className="text-sm">100%</span>
                          </div>
                          <Progress value={100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Including Everyone at Play</span>
                            <span className="text-sm">85%</span>
                          </div>
                          <Progress value={85} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Empathy Detectives</span>
                            <span className="text-sm">60%</span>
                          </div>
                          <Progress value={60} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Student Response Quality</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Thoughtful reflections</span>
                          <Badge>92%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Active participation</span>
                          <Badge>88%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Peer interactions</span>
                          <Badge>76%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Student Risk Alerts
                </CardTitle>
                <CardDescription>
                  Early intervention alerts for students needing additional support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Medium Risk - 2 students</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Participation has decreased over past 2 weeks. Consider personalized check-ins.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="font-medium">High Risk - 1 student</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Low wellness scores and minimal engagement. Immediate intervention recommended.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Low Risk - 153 students</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Students are engaged and participating well in kindness activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Generate Reports
                </CardTitle>
                <CardDescription>
                  Create detailed reports for administrators, parents, and stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Available Reports</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-weekly-report">
                        📊 Weekly Engagement Summary
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-sel-progress">
                        📈 SEL Progress Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-wellness-report">
                        🧠 Student Wellness Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-curriculum-report">
                        📚 Curriculum Impact Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-family-engagement">
                        👪 Family Engagement Report
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Quick Insights</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800">Top Performing Grade</div>
                        <div className="text-blue-600">Grade 4 - 94% participation</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">Most Popular Activity</div>
                        <div className="text-green-600">Gratitude Thank You Cards</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-medium text-purple-800">Growth Area</div>
                        <div className="text-purple-600">Digital Kindness (68% completion)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}