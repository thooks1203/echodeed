import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { featureFlags } from '@shared/featureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, switchDemoRole, getDemoRoles } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { KindnessFeed } from '@/components/KindnessFeed';
import { KindnessConnectModal } from '@/components/KindnessConnectModal';
import { BackButton } from '@/components/BackButton';
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
  ChevronDown,
  Monitor,
  EyeOff,
  School2,
  FileSpreadsheet,
  Download,
  Printer,
  CalendarDays,
  CalendarRange,
  Zap
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

function FundraisingContent() {
  // Demo campaigns - same data parents see on their dashboard
  const campaigns = [
    {
      id: 'playground-2025',
      title: '🏰 New Playground Fund',
      description: 'Building a new playground for our students',
      category: 'Facilities',
      status: 'active',
      goal_amount: 2000000, // $20,000 in cents
      current_amount: 1160000, // $11,600 in cents
      donor_count: 87
    },
    {
      id: 'library-2025',
      title: '📚 New Library Equipment',
      description: 'Expanding our library with new books and technology for middle school students',
      category: 'Education',
      status: 'active',
      goal_amount: 1500000, // $15,000 in cents
      current_amount: 510000, // $5,100 in cents
      donor_count: 34
    }
  ];

  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');
  const completedCampaigns = campaigns.filter((c: any) => c.status === 'completed');
  const totalRaised = campaigns.reduce((sum: number, c: any) => sum + (c.current_amount || 0), 0);
  const totalGoal = campaigns.reduce((sum: number, c: any) => sum + (c.goal_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(totalRaised / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${(totalGoal / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign: any) => {
              const progress = campaign.goal_amount > 0 
                ? (campaign.current_amount / campaign.goal_amount) * 100 
                : 0;
              
              return (
                <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{campaign.title}</h4>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                      <Badge className="mt-2">{campaign.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${(campaign.current_amount / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        of ${(campaign.goal_amount / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-600">
                      {campaign.donor_count || 0} donors • {Math.round(progress)}% complete
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          // Show external payment link or manual donation form
                          alert('For Eastern Guilford High School demo:\n\nParents contribute via:\n• School payment portal link\n• GoFundMe/external platform\n• Check/cash tracked manually\n\nNo Stripe needed - admin updates totals from external systems');
                        }}
                        data-testid={`button-contribute-${campaign.id}`}
                      >
                        💳 Contribute (External)
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => window.open(`https://school-payment-portal.com/donate/${campaign.id}`, '_blank')}
                      >
                        🔗 Share Link
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Campaigns */}
      {completedCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Completed Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{campaign.title}</h4>
                    <p className="text-sm text-gray-600">{campaign.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">
                      ${(campaign.current_amount / 100).toLocaleString()}
                    </div>
                    <Badge className="bg-green-600 text-white">✓ Completed</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No fundraising campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start raising funds for your school</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              + Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
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
                      className="bg-green-600 hover:bg-green-700 text-white"
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
  const { user, isAdmin, isTeacher, isStudent, isParent } = useAuth();
  const demoRoles = getDemoRoles();
  const [isKindnessConnectOpen, setIsKindnessConnectOpen] = useState(false);
  
  // ROLE-BASED ACCESS CONTROL: Only admins can access this dashboard
  useEffect(() => {
    if (!user) return; // Wait for auth to load
    
    // Redirect non-admins to their appropriate dashboards
    if (isTeacher) {
      navigate('/teacher-dashboard');
      return;
    }
    if (isStudent) {
      navigate('/app');
      return;
    }
    if (isParent) {
      navigate('/parent-dashboard');
      return;
    }
    if (!isAdmin) {
      navigate('/'); // Redirect to landing page if no valid role
      return;
    }
  }, [user, isAdmin, isTeacher, isStudent, isParent, navigate]);
  
  // Show loading state while checking authorization
  if (!user || !isAdmin) {
    return null;
  }
  
  // BCA Demo Mode State
  const [bcaDemoMode, setBcaDemoMode] = useState(() => 
    localStorage.getItem('echodeed_bca_demo_mode') === 'true'
  );
  const [privacyMode, setPrivacyMode] = useState(() => 
    localStorage.getItem('echodeed_privacy_mode') === 'true'
  );
  
  // Toggle BCA Demo Mode
  const toggleBcaDemoMode = () => {
    const newMode = !bcaDemoMode;
    setBcaDemoMode(newMode);
    localStorage.setItem('echodeed_bca_demo_mode', newMode.toString());
  };
  
  // Toggle Privacy Mode
  const togglePrivacyMode = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    localStorage.setItem('echodeed_privacy_mode', newMode.toString());
  };

  // Fetch posts data for the Student Feed tab
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts', {
        headers: {
          'X-Session-ID': localStorage.getItem('echodeed_session') || 'demo-session',
          'X-Demo-Role': localStorage.getItem('echodeed_demo_role') || 'admin'
        },
        credentials: 'include'
      });
      return response.json();
    },
    staleTime: 5000,
    refetchOnWindowFocus: false
  });
  
  // Mock admin data (in production, get from auth context)
  const currentAdmin: SchoolAdmin = {
    id: 'admin-001',
    name: 'Dr. Darrell Harris',
    role: 'principal',
    districtId: 'district-001',
    email: 'dharris@easterngs.gcsnc.com'
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
    districtName: 'Guilford County Schools',
    totalSchools: 1,
    totalStudents: 1200,
    totalTeachers: 85,
    totalKindnessActs: 18450,
    avgSelScore: 8.9,
    topPerformingSchools: ['Eastern Guilford High School'],
    complianceStatus: 'compliant'
  };

  const mockSchoolMetrics: SchoolMetrics[] = [
    {
      schoolId: 'eastern-guilford-hs',
      schoolName: 'Eastern Guilford High School',
      totalStudents: 1200,
      totalTeachers: 85,
      kindnessActsThisWeek: 287,
      kindnessActsThisMonth: 1068,
      avgSelScore: 8.9,
      parentEngagementRate: 82,
      teacherAdoptionRate: 91
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

  // Privacy masking utility
  const maskName = (name: string) => {
    if (!privacyMode) return name;
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0] + '***';
    return parts[0][0] + '*** ' + parts[parts.length - 1][0] + '***';
  };

  // Dudley Data filtering (for demo mode)
  const filterDudleyData = (data: any) => {
    if (!bcaDemoMode) return data;
    // In demo mode, ensure we only show Dudley-specific data
    return data;
  };

  // Export handler functions
  const handleExportCSV = async () => {
    try {
      const schoolSelect = document.getElementById('export-school') as HTMLSelectElement;
      const startDateInput = document.getElementById('start-date') as HTMLInputElement;
      const endDateInput = document.getElementById('end-date') as HTMLInputElement;
      const anonymizeCheckbox = document.getElementById('anonymize-csv') as HTMLInputElement;
      
      const schoolId = schoolSelect?.value || 'all';
      const startDate = startDateInput?.value;
      const endDate = endDateInput?.value;
      const anonymize = anonymizeCheckbox?.checked || false;
      
      const params = new URLSearchParams({
        schoolId,
        startDate,
        endDate,
        anonymize: anonymize.toString()
      });
      
      // Create a download link
      const url = `/api/admin/export/posts?${params}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `kindness-posts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV export initiated successfully');
    } catch (error) {
      console.error('❌ CSV export failed:', error);
    }
  };

  const handleGenerateReport = async (isPrint: boolean = false) => {
    try {
      const schoolSelect = document.getElementById('report-school') as HTMLSelectElement;
      const weekOfInput = document.getElementById('week-of') as HTMLInputElement;
      const anonymizeCheckbox = document.getElementById('anonymize-report') as HTMLInputElement;
      
      const schoolId = schoolSelect?.value || 'bca-demo';
      const weekOf = weekOfInput?.value;
      const anonymize = anonymizeCheckbox?.checked || false;
      
      const params = new URLSearchParams({
        schoolId,
        weekOf,
        anonymize: anonymize.toString()
      });
      
      const response = await fetch(`/api/admin/export/report?${params}`);
      const reportData = await response.json();
      
      if (isPrint) {
        // Create printable report window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(generatePrintableReport(reportData));
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } else {
        // Show report preview
        alert(`Weekly Report Preview:\n\nSchool: ${reportData.schoolName}\nPeriod: ${reportData.weekPeriod}\n\nTotal Kindness Acts: ${reportData.summary.totalKindnessActs}\nTotal Hearts: ${reportData.summary.totalHeartsReceived}\nParticipating Students: ${reportData.summary.participatingStudents}\n\nTop Categories: ${reportData.topCategories.map((c: any) => `${c.category} (${c.count})`).join(', ')}`);
      }
      
      console.log('✅ Report generated successfully:', reportData);
    } catch (error) {
      console.error('❌ Report generation failed:', error);
    }
  };

  const handleQuickExport = async (type: string) => {
    try {
      const today = new Date();
      let startDate, endDate, schoolId = bcaDemoMode ? 'bca-demo' : 'all';
      
      switch (type) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'bca-report':
          // Generate BCA-specific weekly report
          const weekOf = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const params = new URLSearchParams({
            schoolId: 'bca-demo',
            weekOf,
            anonymize: 'false'
          });
          
          const response = await fetch(`/api/admin/export/report?${params}`);
          const reportData = await response.json();
          
          // Create printable Dudley report
          const printWindow = window.open('', '_blank', 'width=800,height=600');
          if (printWindow) {
            printWindow.document.write(generateDudleyReport(reportData));
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
          return;
      }
      
      const params = new URLSearchParams();
      params.append('schoolId', schoolId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('anonymize', privacyMode.toString());
      
      // Create download link for quick export
      const url = `/api/admin/export/posts?${params}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `kindness-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Quick export (${type}) initiated successfully`);
    } catch (error) {
      console.error(`❌ Quick export (${type}) failed:`, error);
    }
  };

  const generatePrintableReport = (data: any): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
          .highlight { background: #f0f8ff; }
          .category-list { margin: 20px 0; }
          .category-item { margin: 5px 0; padding: 5px 10px; background: #f9f9f9; border-radius: 3px; }
          .recent-posts { margin-top: 30px; }
          .post-item { margin: 10px 0; padding: 10px; border-left: 4px solid #4f46e5; background: #f8fafc; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.reportTitle}</h1>
          <h2>${data.schoolName}</h2>
          <p><strong>Report Period:</strong> ${data.weekPeriod}</p>
          <p><em>Generated: ${new Date(data.generatedAt).toLocaleString()}</em></p>
        </div>
        
        <div class="summary-grid">
          <div class="stat-box highlight">
            <h3>${data.summary.totalKindnessActs}</h3>
            <p>Total Kindness Acts</p>
          </div>
          <div class="stat-box">
            <h3>${data.summary.totalHeartsReceived}</h3>
            <p>Hearts Received</p>
          </div>
          <div class="stat-box">
            <h3>${data.summary.averageHeartsPerAct}</h3>
            <p>Average Hearts per Act</p>
          </div>
          <div class="stat-box">
            <h3>${data.summary.participatingStudents}</h3>
            <p>Participating Students</p>
          </div>
        </div>
        
        <div class="category-list">
          <h3>Top Categories This Week</h3>
          ${data.topCategories.map((cat: any) => `
            <div class="category-item">
              <strong>${cat.category}</strong> - ${cat.count} acts
            </div>
          `).join('')}
        </div>
        
        <div class="recent-posts">
          <h3>Recent Highlights</h3>
          ${data.recentHighlights.map((post: any) => `
            <div class="post-item">
              <p><strong>${post.student}</strong> (${post.hearts} ❤️)</p>
              <p><em>${post.category}</em></p>
              <p>"${post.content}"</p>
            </div>
          `).join('')}
        </div>
        
        ${data.isAnonymized ? '<p><em>This report has been anonymized for FERPA compliance.</em></p>' : ''}
      </body>
      </html>
    `;
  };

  const generateDudleyReport = (data: any): string => {
    return generatePrintableReport({
      ...data,
      reportTitle: 'Eastern Guilford High School - Kindness Impact Report',
      schoolName: 'Eastern Guilford High School'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Mode Banner */}
      {(bcaDemoMode || privacyMode) && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-center">
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            {bcaDemoMode && (
              <div className="flex items-center gap-2">
                <School2 className="w-4 h-4" />
                <span>Eastern Guilford Demo - Eastern Guilford High School, Gibsonville, NC</span>
              </div>
            )}
            {privacyMode && (
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                <span>Privacy Mode Active - Student Names Hidden</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="container mx-auto p-6 space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Remove duplicate back button for cleaner UI */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-dashboard-title">
              Administrator Dashboard
              {bcaDemoMode && (
                <Badge variant="outline" className="ml-2 text-blue-600 border-blue-600">
                  <Monitor className="w-3 h-3 mr-1" />
                  EGHS Demo
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {maskName(currentAdmin.name)} • Principal • Eastern Guilford High School, Gibsonville
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/?tab=feed')}
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
                <span className="font-medium truncate max-w-32">{user?.firstName || user?.name}</span>
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
                Demo Controls:
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={toggleBcaDemoMode}
                className="cursor-pointer"
                data-testid="toggle-bca-demo-mode"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <School2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Eastern Guilford Demo</span>
                  </div>
                  <Badge variant={bcaDemoMode ? "default" : "secondary"} className="text-xs">
                    {bcaDemoMode ? "ON" : "OFF"}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={togglePrivacyMode}
                className="cursor-pointer"
                data-testid="toggle-privacy-mode"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Privacy Mode</span>
                  </div>
                  <Badge variant={privacyMode ? "default" : "secondary"} className="text-xs">
                    {privacyMode ? "ON" : "OFF"}
                  </Badge>
                </div>
              </DropdownMenuItem>
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
        <TabsList className="grid w-full grid-cols-5 gap-1 bg-transparent">
          <TabsTrigger value="overview" className="bg-blue-600 text-white hover:bg-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:shadow-lg">Overview</TabsTrigger>
          <TabsTrigger value="schools" className="bg-purple-600 text-white hover:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:shadow-lg">Schools</TabsTrigger>
          <TabsTrigger value="feed" className="bg-pink-600 text-white hover:bg-pink-700 data-[state=active]:bg-pink-700 data-[state=active]:shadow-lg">
            <Heart className="w-4 h-4 mr-1" />
            Student Feed
          </TabsTrigger>
          <TabsTrigger value="reports" className="bg-cyan-600 text-white hover:bg-cyan-700 data-[state=active]:bg-cyan-700 data-[state=active]:shadow-lg">
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="compliance" className="bg-emerald-600 text-white hover:bg-emerald-700 data-[state=active]:bg-emerald-700 data-[state=active]:shadow-lg">Compliance</TabsTrigger>
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
                <CardTitle className="text-sm font-medium">Service Hours Logged</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600" data-testid="total-service-hours">
                  156
                </div>
                <p className="text-xs text-muted-foreground">
                  Total hours verified this year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Redeemed</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600" data-testid="total-tokens-redeemed">
                  2,847
                </div>
                <p className="text-xs text-muted-foreground">
                  At 17 local business partners
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
                  FERPA compliance status
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 🎯 Principal's At-a-Glance Impact Summary */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Principal's Impact Dashboard
              </CardTitle>
              <CardDescription>
                Key metrics for school board presentations and program justification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-100">
                  <div className="text-sm font-semibold text-gray-600 mb-1">This Week's Impact</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">1,068 acts</div>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>• 156 service hours logged</div>
                    <div>• 89% student participation</div>
                    <div>• 2,847 tokens redeemed</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-green-100">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Teacher Time Saved</div>
                  <div className="text-2xl font-bold text-green-600 mb-2">93% reduction</div>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>• Was: 15 min per student</div>
                    <div>• Now: 30 seconds per student</div>
                    <div>• Photo verification = instant approval</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-purple-100">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Community ROI</div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">$12,000</div>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>• Local business engagement</div>
                    <div>• 23 Burlington Rd partners</div>
                    <div>• Student rewards + parent engagement</div>
                  </div>
                </div>
              </div>
              
              {/* One-Click Enrollment Share */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Share Student Enrollment</h4>
                    <p className="text-sm text-blue-100">One-click copy to share with parents and students</p>
                  </div>
                  <Button
                    onClick={() => {
                      const enrollmentText = `Join EchoDeed™ at Eastern Guilford High School!\n\nEnrollment Code: EGHS-2025\nWebsite: www.echodeed.com\n\nTrack kindness, earn rewards, log service hours!`;
                      navigator.clipboard.writeText(enrollmentText);
                      // Show toast notification
                      const toast = document.createElement('div');
                      toast.textContent = '✅ Enrollment info copied!';
                      toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                    }}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                    data-testid="button-copy-enrollment"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Copy Enrollment Info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🌟 Success Story Ripple Effect Preview */}
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-900">
                <Heart className="w-6 h-6 text-pink-600" />
                Kindness Ripple Effect - Real Impact Stories
              </CardTitle>
              <CardDescription>
                See how individual acts of kindness inspire school-wide behavior change
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-pink-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-2xl">👵</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Original Act: "Helped elderly neighbor with groceries"</div>
                      <div className="text-sm text-gray-600">Posted by anonymous student</div>
                    </div>
                  </div>
                  <div className="ml-13 pl-4 border-l-4 border-pink-300 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">3 students echoed "I'll do this too!"</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>12 hearts from inspired classmates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>Result: 15 new elderly assistance posts this week</span>
                    </div>
                  </div>
                </div>
                
                {/* Platform Impact - BOLD & PROMINENT */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
                  <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2">
                          Platform Impact
                        </h3>
                        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                          One student's kindness inspired a school-wide movement. 
                          <span className="text-blue-700"> This is character education in action, not just data tracking.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Performance</CardTitle>
              <CardDescription>
                Schools ranked by student engagement and service hours
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
                    <div className="text-lg font-bold text-teal-600">
                      {school.kindnessActsThisMonth}
                    </div>
                    <p className="text-xs text-gray-500">Acts This Month</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks for district management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-14 flex flex-col gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="text-sm">District Report</span>
                </Button>
                <Button className="h-14 flex flex-col gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Send Update</span>
                </Button>
                <Button className="h-14 flex flex-col gap-1 bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Export Data</span>
                </Button>
                <Button className="h-14 flex flex-col gap-1 bg-orange-600 hover:bg-orange-700 text-white">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">District Settings</span>
                </Button>
              </div>
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

        {/* Student Feed Tab - Admin Monitoring */}
        <TabsContent value="feed" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Anonymous Kindness Feed - Monitoring Dashboard
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Monitor student kindness posts for content moderation and safety. All posts are anonymous to protect student privacy.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  <Shield className="w-3 h-3 mr-1" />
                  Privacy Protected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Admin Monitoring Guidelines</AlertTitle>
                <AlertDescription className="text-blue-800">
                  This feed displays anonymous kindness posts for oversight purposes only. Use moderation tools to flag inappropriate content. Student identities remain protected per FERPA compliance.
                </AlertDescription>
              </Alert>

              {/* Feed Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Posts Today</p>
                      <p className="text-2xl font-bold text-pink-600">24</p>
                    </div>
                    <Heart className="w-8 h-8 text-pink-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Students</p>
                      <p className="text-2xl font-bold text-green-600">187</p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold text-blue-600">94%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Flagged Posts</p>
                      <p className="text-2xl font-bold text-amber-600">0</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Kindness Feed Component */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Live Anonymous Kindness Posts
                </h3>
                <KindnessFeed posts={posts || []} isLoading={postsLoading} />
              </div>

              {/* Admin Actions */}
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View All Posts
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
                <Button variant="outline" className="flex items-center gap-2 text-amber-600 border-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  Review Flagged (0)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports & Exports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            {/* Export Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Data Export Tools
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Export kindness data for analysis and reporting. All exports include FERPA compliance options.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* CSV Export Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">CSV Data Export</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="export-school">School Filter</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="export-school" data-testid="select-export-school">
                            <SelectValue placeholder="Select School" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Schools</SelectItem>
                            <SelectItem value="eastern-guilford-hs">Eastern Guilford High School</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <input
                            type="date"
                            id="start-date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            data-testid="input-start-date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <input
                            type="date"
                            id="end-date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            data-testid="input-end-date"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anonymize-csv"
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          data-testid="checkbox-anonymize-csv"
                        />
                        <Label htmlFor="anonymize-csv" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          <Shield className="w-4 h-4 inline mr-1" />
                          FERPA Compliant (Anonymize student data)
                        </Label>
                      </div>
                      
                      <Button
                        onClick={() => handleExportCSV()}
                        className="w-full"
                        data-testid="button-export-csv"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV Data
                      </Button>
                    </div>
                  </div>

                  {/* Weekly Report Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Weekly Impact Report</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="report-school">School</Label>
                        <Select defaultValue="dudley-demo">
                          <SelectTrigger id="report-school" data-testid="select-report-school">
                            <SelectValue placeholder="Select School" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eastern-guilford-hs">Eastern Guilford High School</SelectItem>
                            <SelectItem value="all">District Summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="week-of">Week Of</Label>
                        <input
                          type="date"
                          id="week-of"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          data-testid="input-week-of"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anonymize-report"
                          className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          data-testid="checkbox-anonymize-report"
                        />
                        <Label htmlFor="anonymize-report" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          <Shield className="w-4 h-4 inline mr-1" />
                          FERPA Compliant (Anonymize student data)
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleGenerateReport(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          data-testid="button-preview-report"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Report
                        </Button>
                        <Button
                          onClick={() => handleGenerateReport(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-print-report"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Export Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Export Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleQuickExport('today')}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                    data-testid="button-export-today"
                  >
                    <Calendar className="w-4 h-4" />
                    Today's Data
                  </Button>
                  <Button
                    onClick={() => handleQuickExport('week')}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                    data-testid="button-export-week"
                  >
                    <CalendarDays className="w-4 h-4" />
                    This Week
                  </Button>
                  <Button
                    onClick={() => handleQuickExport('month')}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
                    data-testid="button-export-month"
                  >
                    <CalendarRange className="w-4 h-4" />
                    This Month
                  </Button>
                  <Button
                    onClick={() => handleQuickExport('bca-report')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-bca-report"
                  >
                    <School2 className="w-4 h-4" />
                    BCA Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                FERPA and state compliance monitoring
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
      </Tabs>
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
          zIndex: 9999,
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