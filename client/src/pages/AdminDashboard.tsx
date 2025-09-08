import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Award, 
  Building2,
  Shield,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  BarChart3,
  BookOpen,
  UserCheck,
  Settings
} from 'lucide-react';

interface SchoolAdmin {
  id: string;
  name: string;
  role: 'principal' | 'vice_principal' | 'district_admin' | 'superintendent';
  schoolId?: string;
  districtId: string;
  email: string;
}

interface SchoolMetrics {
  schoolId: string;
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  kindnessActsThisWeek: number;
  kindnessActsThisMonth: number;
  avgSelScore: number;
  parentEngagementRate: number;
  teacherAdoptionRate: number;
}

interface DistrictMetrics {
  districtId: string;
  districtName: string;
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalKindnessActs: number;
  avgSelScore: number;
  topPerformingSchools: string[];
  complianceStatus: 'compliant' | 'partial' | 'non_compliant';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'analytics' | 'compliance' | 'integrations'>('overview');
  const [, navigate] = useLocation();
  
  // Mock admin data (in production, get from auth context)
  const currentAdmin: SchoolAdmin = {
    id: 'admin-001',
    name: 'Dr. Sarah Wilson',
    role: 'district_admin',
    districtId: 'district-001',
    email: 'swilson@district.edu'
  };

  // Mock API calls - replace with real endpoints
  const { data: districtMetrics } = useQuery<DistrictMetrics>({
    queryKey: ['/api/admin/district-metrics', currentAdmin.districtId],
    enabled: false // Disabled for demo
  });

  const { data: schoolMetrics = [] } = useQuery<SchoolMetrics[]>({
    queryKey: ['/api/admin/school-metrics', currentAdmin.districtId],
    enabled: false // Disabled for demo
  });

  // Mock data for demonstration
  const mockDistrictMetrics: DistrictMetrics = {
    districtId: 'district-001',
    districtName: 'Riverside Unified School District',
    totalSchools: 12,
    totalStudents: 8450,
    totalTeachers: 425,
    totalKindnessActs: 15670,
    avgSelScore: 8.2,
    topPerformingSchools: ['Lincoln Elementary', 'Roosevelt Middle', 'Washington High'],
    complianceStatus: 'compliant'
  };

  const mockSchoolMetrics: SchoolMetrics[] = [
    {
      schoolId: 'school-001',
      schoolName: 'Lincoln Elementary',
      totalStudents: 425,
      totalTeachers: 28,
      kindnessActsThisWeek: 89,
      kindnessActsThisMonth: 342,
      avgSelScore: 8.7,
      parentEngagementRate: 78,
      teacherAdoptionRate: 95
    },
    {
      schoolId: 'school-002',
      schoolName: 'Roosevelt Middle School',
      totalStudents: 680,
      totalTeachers: 45,
      kindnessActsThisWeek: 134,
      kindnessActsThisMonth: 523,
      avgSelScore: 8.3,
      parentEngagementRate: 65,
      teacherAdoptionRate: 88
    },
    {
      schoolId: 'school-003',
      schoolName: 'Washington High School',
      totalStudents: 1240,
      totalTeachers: 78,
      kindnessActsThisWeek: 156,
      kindnessActsThisMonth: 612,
      avgSelScore: 7.9,
      parentEngagementRate: 58,
      teacherAdoptionRate: 82
    }
  ];

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'non_compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="w-4 h-4" />;
      case 'partial': return <AlertTriangle className="w-4 h-4" />;
      case 'non_compliant': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Store the target tab in localStorage
              localStorage.setItem('echodeed_target_tab', 'schools');
              // Navigate to home
              navigate('/');
            }}
            className="flex items-center gap-2"
            data-testid="back-to-schools"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-dashboard-title">
              Administrator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {currentAdmin.name} • {currentAdmin.role.replace('_', ' ')} • {mockDistrictMetrics.districtName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Building2 className="w-4 h-4 mr-1" />
            {mockDistrictMetrics.totalSchools} Schools
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {mockDistrictMetrics.totalStudents.toLocaleString()} Students
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-students">
                  {mockDistrictMetrics.totalStudents.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {mockDistrictMetrics.totalSchools} schools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kindness Acts</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-kindness-acts">
                  {mockDistrictMetrics.totalKindnessActs.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  District total this year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEL Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="avg-sel-score">
                  {mockDistrictMetrics.avgSelScore}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  District average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${getComplianceColor(mockDistrictMetrics.complianceStatus)}`}>
                  {getComplianceIcon(mockDistrictMetrics.complianceStatus)}
                  {mockDistrictMetrics.complianceStatus}
                </div>
                <p className="text-xs text-muted-foreground">
                  COPPA & FERPA status
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Schools</CardTitle>
              <CardDescription>
                Schools with highest SEL engagement and kindness activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSchoolMetrics.slice(0, 3).map((school, index) => (
                <div key={school.schoolId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{school.schoolName}</h4>
                      <p className="text-sm text-gray-600">
                        {school.totalStudents} students • {school.totalTeachers} teachers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {school.avgSelScore}/10
                    </div>
                    <p className="text-xs text-gray-500">SEL Score</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <div className="grid gap-6">
            {mockSchoolMetrics.map((school) => (
              <Card key={school.schoolId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        {school.schoolName}
                      </CardTitle>
                      <CardDescription>
                        {school.totalStudents} students • {school.totalTeachers} teachers
                      </CardDescription>
                    </div>
                    <Badge variant={school.avgSelScore >= 8 ? "default" : "secondary"}>
                      SEL: {school.avgSelScore}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {school.kindnessActsThisWeek}
                      </div>
                      <div className="text-xs text-gray-600">This Week</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {school.kindnessActsThisMonth}
                      </div>
                      <div className="text-xs text-gray-600">This Month</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {school.parentEngagementRate}%
                      </div>
                      <div className="text-xs text-gray-600">Parent Engagement</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {school.teacherAdoptionRate}%
                      </div>
                      <div className="text-xs text-gray-600">Teacher Adoption</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Teacher Adoption Progress</span>
                      <span>{school.teacherAdoptionRate}%</span>
                    </div>
                    <Progress value={school.teacherAdoptionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                District Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive insights into SEL performance and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Monthly Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Kindness Acts Growth</span>
                      <span className="text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Parent Engagement</span>
                      <span className="text-blue-600">+15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Teacher Usage</span>
                      <span className="text-purple-600">+18%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">SEL Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Self-Awareness</span>
                      <Badge variant="secondary">8.1/10</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Social Awareness</span>
                      <Badge variant="secondary">8.4/10</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Responsible Decision Making</span>
                      <Badge variant="secondary">7.9/10</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Benchmarking</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>vs State Average</span>
                      <span className="text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>vs Similar Districts</span>
                      <span className="text-green-600">+8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>National Percentile</span>
                      <Badge variant="default">78th</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Dashboard
              </CardTitle>
              <CardDescription>
                COPPA, FERPA, and state compliance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Federal Compliance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>COPPA Compliance</span>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>FERPA Compliance</span>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Student Data Privacy</span>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">State Requirements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>SEL Standards Alignment</span>
                      </div>
                      <Badge variant="default">Met</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span>Monthly Reporting</span>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Audit Trail Maintenance</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Integrations
              </CardTitle>
              <CardDescription>
                Connect EchoDeed with your existing school systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Google Workspace</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          📚
                        </div>
                        <span>Google Classroom</span>
                      </div>
                      <Badge variant="outline">Connect</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sync student rosters and assignments automatically
                    </p>
                    <Button size="sm" className="w-full" data-testid="connect-google-classroom">
                      Connect Google Classroom
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Student Information Systems</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <span>PowerSchool</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <span>Infinite Campus</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <span>Skyward</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}