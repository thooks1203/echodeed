import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth, switchDemoRole, getDemoRoles } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Settings,
  Bell,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  ChevronDown
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

interface SafetyAlert {
  id: string;
  type: 'bullying_risk' | 'emotional_distress' | 'crisis_indicator' | 'safety_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  studentUserId: string;
  postId?: string;
  title: string;
  description: string;
  riskFactors: string[];
  recommendedActions: string[];
  requiresParentNotification: boolean;
  requiresCounselorAlert: boolean;
  requiresAdminEscalation: boolean;
  confidence: number;
  createdAt: string;
  status: 'active' | 'reviewed' | 'resolved';
  postContent?: string;
}

interface AdminSafetyStats {
  totalAlerts: number;
  criticalAlerts: number;
  studentsAtRisk: number;
  postsToday: number;
  resolutionRate: number;
  averageResponseTime: number;
}

function SafetyMonitoringContent() {
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Mock data for demonstration - in production, these would be real API calls
  const mockSafetyStats: AdminSafetyStats = {
    totalAlerts: 3,
    criticalAlerts: 1,
    studentsAtRisk: 2,
    postsToday: 47,
    resolutionRate: 94,
    averageResponseTime: 12
  };

  const mockAlerts: SafetyAlert[] = [
    {
      id: 'alert-001',
      type: 'bullying_risk',
      severity: 'high',
      studentUserId: 'student-001',
      postId: 'post-001',
      title: 'Potential Bullying Language Detected',
      description: 'AI detected language patterns suggesting bullying behavior toward another student',
      riskFactors: ['Exclusion language', 'Repetitive targeting', 'Negative peer interaction'],
      recommendedActions: ['Immediate counselor intervention', 'Parent notification', 'Peer mediation'],
      requiresParentNotification: true,
      requiresCounselorAlert: true,
      requiresAdminEscalation: false,
      confidence: 87,
      createdAt: new Date().toISOString(),
      status: 'active',
      postContent: 'I helped my friend with their homework when everyone else was being mean to them'
    },
    {
      id: 'alert-002',
      type: 'emotional_distress',
      severity: 'medium',
      studentUserId: 'student-002',
      title: 'Emotional Distress Indicators',
      description: 'Student content shows signs of emotional stress or anxiety',
      riskFactors: ['Isolation indicators', 'Low self-esteem language'],
      recommendedActions: ['Wellness check-in', 'Monitor student closely'],
      requiresParentNotification: false,
      requiresCounselorAlert: true,
      requiresAdminEscalation: false,
      confidence: 72,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'active'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const handleMarkAsReviewed = async (alertId: string) => {
    console.log('Marking alert as reviewed:', alertId);
    // In production: API call to update alert status
  };

  const handleResolveAlert = async (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // In production: API call to resolve alert
  };

  return (
    <div className="space-y-6">
      {/* Safety Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockSafetyStats.totalAlerts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockSafetyStats.criticalAlerts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockSafetyStats.studentsAtRisk}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockSafetyStats.postsToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolution</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockSafetyStats.resolutionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockSafetyStats.averageResponseTime}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🚨 Active Safety Alerts ({mockAlerts.length})
            </h3>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm bg-white dark:bg-gray-800"
              data-testid="select-alert-status"
            >
              <option value="active">Active</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          {mockAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  All Clear! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No active safety alerts. Our AI monitoring is keeping students safe.
                </p>
              </CardContent>
            </Card>
          ) : (
            mockAlerts.map((alert) => (
              <Card 
                key={alert.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500' : ''
                } ${alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : ''}`}
                onClick={() => setSelectedAlert(alert)}
                data-testid={`alert-card-${alert.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Student: {alert.studentUserId.slice(0, 8)}...</span>
                          <span>Confidence: {alert.confidence}%</span>
                          <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Alert Details */}
        <div>
          {selectedAlert ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getSeverityIcon(selectedAlert.severity)}
                    Alert Details
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkAsReviewed(selectedAlert.id)}
                      variant="outline"
                      size="sm"
                      data-testid="button-mark-reviewed"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Mark Reviewed
                    </Button>
                    <Button
                      onClick={() => handleResolveAlert(selectedAlert.id)}
                      variant="default"
                      size="sm"
                      data-testid="button-resolve-alert"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk Factors */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Risk Factors Detected
                  </h4>
                  <div className="space-y-1">
                    {selectedAlert.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {factor}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Recommended Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Recommended Actions
                  </h4>
                  <div className="space-y-1">
                    {selectedAlert.recommendedActions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Escalation Requirements */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Required Actions
                  </h4>
                  <div className="space-y-2">
                    {selectedAlert.requiresParentNotification && (
                      <Alert>
                        <Bell className="h-4 w-4" />
                        <AlertTitle>Parent Notification Required</AlertTitle>
                        <AlertDescription>
                          Parents should be notified about this safety concern.
                        </AlertDescription>
                      </Alert>
                    )}
                    {selectedAlert.requiresCounselorAlert && (
                      <Alert>
                        <Heart className="h-4 w-4" />
                        <AlertTitle>Counselor Alert</AlertTitle>
                        <AlertDescription>
                          School counselor should be informed for immediate support.
                        </AlertDescription>
                      </Alert>
                    )}
                    {selectedAlert.requiresAdminEscalation && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Administrative Escalation</AlertTitle>
                        <AlertDescription>
                          This situation requires immediate principal involvement.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Post Content (if available) */}
                {selectedAlert.postContent && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Original Post Content
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{selectedAlert.postContent}"
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select an Alert
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on any alert from the list to view detailed information and take action.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'analytics' | 'compliance' | 'safety' | 'integrations'>('overview');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const demoRoles = getDemoRoles();
  
  // Mock admin data (in production, get from auth context)
  const currentAdmin: SchoolAdmin = {
    id: 'admin-001',
    name: 'Dr. Sarah Wilson',
    role: 'district_admin',
    districtId: 'district-001',
    email: 'swilson@district.edu'
  };

  // Real API calls for customer validation
  const { data: districtMetrics } = useQuery<DistrictMetrics>({
    queryKey: ['/api/admin/district-metrics', currentAdmin.districtId],
    enabled: true // Enabled for customer validation
  });

  const { data: schoolMetrics = [] } = useQuery<SchoolMetrics[]>({
    queryKey: ['/api/admin/school-metrics', currentAdmin.districtId],
    enabled: true // Enabled for customer validation
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
          {activeTab !== 'overview' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('overview');
              }}
              className="flex items-center gap-2"
              data-testid="back-to-overview"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
          )}
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
          <Button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            data-testid="back-to-platform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Platform
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            <Building2 className="w-4 h-4 mr-1" />
            {mockDistrictMetrics.totalSchools} Schools
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {mockDistrictMetrics.totalStudents.toLocaleString()} Students
          </Badge>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                data-testid="user-menu"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs opacity-90">({user?.schoolRole})</span>
                <ChevronDown className="w-3 h-3 ml-1 opacity-75" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs font-medium text-blue-600">{user?.schoolRole?.toUpperCase()}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Switch Demo User:
              </DropdownMenuLabel>
              {demoRoles.map((roleInfo) => (
                <DropdownMenuItem
                  key={roleInfo.role}
                  onClick={() => switchDemoRole(roleInfo.role)}
                  className={`cursor-pointer ${user?.schoolRole === roleInfo.role ? 'bg-muted' : ''}`}
                  data-testid={`switch-to-${roleInfo.role}`}
                >
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">{roleInfo.label}</span>
                    <span className="text-xs text-muted-foreground">{roleInfo.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem('echodeed_demo_role');
                  window.location.reload();
                }}
                className="text-red-600 cursor-pointer"
                data-testid="sign-out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out (Reset to Default)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="safety">Safety Monitor</TabsTrigger>
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

              {/* Quick Access Section */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Detailed Consent Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Access Burlington, NC consent tracking and renewal system
                    </p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/admin/consents'}
                    className="flex items-center gap-2"
                    data-testid="button-consent-management"
                  >
                    <Shield className="w-4 h-4" />
                    View Consent Dashboard
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">Student Tracking</div>
                    <div className="text-muted-foreground">Individual consent status</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">Annual Renewals</div>
                    <div className="text-muted-foreground">Automated processing</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">Audit Reports</div>
                    <div className="text-muted-foreground">Compliance documentation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Monitoring Tab */}
        <TabsContent value="safety" className="space-y-6">
          <SafetyMonitoringContent />
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