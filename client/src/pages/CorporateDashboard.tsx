import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Building2, 
  Award,
  Target,
  Activity,
  Download,
  Calendar,
  BarChart3,
  Heart,
  Zap,
  Shield,
  Globe,
  UserCheck,
  Settings
} from 'lucide-react';

interface CorporateAccount {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  subscriptionTier: string;
  maxEmployees: number;
  employeeCount: number;
  monthlyRevenue: number;
}

interface TeamMetrics {
  teamId: string;
  teamName: string;
  department: string;
  currentSize: number;
  targetSize: number;
  monthlyKindnessGoal: number;
  actualKindnessActs: number;
  engagementRate: number;
  wellnessScore: number;
}

interface CorporateAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  totalKindnessPosts: number;
  averageEngagementScore: number;
  wellnessImpactScore: number;
  monthlyGrowth: number;
  retentionRate: number;
}

export default function CorporateDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'analytics' | 'wellness' | 'exports'>('overview');
  
  // Mock current corporate account (in production, get from auth context)
  const currentAccount: CorporateAccount = {
    id: 'corp-001',
    companyName: 'Innovate Tech Solutions',
    domain: 'innovatetech.com',
    industry: 'Technology',
    subscriptionTier: 'Enterprise',
    maxEmployees: 500,
    employeeCount: 342,
    monthlyRevenue: 4800 // $8-15 per employee * 342 employees
  };

  // Mock analytics data showcasing strong metrics for investors
  const mockAnalytics: CorporateAnalytics = {
    totalEmployees: 342,
    activeEmployees: 289,
    totalKindnessPosts: 1247,
    averageEngagementScore: 78,
    wellnessImpactScore: 83,
    monthlyGrowth: 15.2,
    retentionRate: 94.3
  };

  const mockTeamMetrics: TeamMetrics[] = [
    {
      teamId: 'team-001',
      teamName: 'Engineering',
      department: 'Product Development',
      currentSize: 45,
      targetSize: 50,
      monthlyKindnessGoal: 150,
      actualKindnessActs: 167,
      engagementRate: 89,
      wellnessScore: 85
    },
    {
      teamId: 'team-002',
      teamName: 'Sales',
      department: 'Revenue',
      currentSize: 28,
      targetSize: 35,
      monthlyKindnessGoal: 100,
      actualKindnessActs: 134,
      engagementRate: 92,
      wellnessScore: 88
    },
    {
      teamId: 'team-003',
      teamName: 'Marketing',
      department: 'Growth',
      currentSize: 22,
      targetSize: 25,
      monthlyKindnessGoal: 80,
      actualKindnessActs: 89,
      engagementRate: 87,
      wellnessScore: 82
    },
    {
      teamId: 'team-004',
      teamName: 'HR & Operations',
      department: 'People',
      currentSize: 15,
      targetSize: 18,
      monthlyKindnessGoal: 60,
      actualKindnessActs: 78,
      engagementRate: 95,
      wellnessScore: 91
    }
  ];

  const handleExportData = async (format: 'csv' | 'pdf') => {
    // In production, this would call the actual API
    console.log(`Exporting data in ${format} format...`);
    // Simulate download
    alert(`${format.toUpperCase()} export started. Download will begin shortly.`);
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="corporate-dashboard">
      {/* Enterprise Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {currentAccount.companyName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="corporate-dashboard-title">
              {currentAccount.companyName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Corporate Wellness Dashboard • {currentAccount.domain}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getSubscriptionTierColor(currentAccount.subscriptionTier)}>
            <Shield className="w-4 h-4 mr-1" />
            {currentAccount.subscriptionTier}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {mockAnalytics.activeEmployees}/{currentAccount.employeeCount} Active
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-green-600 border-green-600">
            ${(currentAccount.monthlyRevenue).toLocaleString()}/mo
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="teams" data-testid="tab-teams">👥 Teams</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="wellness" data-testid="tab-wellness">❤️ Wellness</TabsTrigger>
          <TabsTrigger value="exports" data-testid="tab-exports">📤 Exports</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Key Metrics for Investors */}
        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="monthly-revenue">
                  ${currentAccount.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">
                  +{mockAnalytics.monthlyGrowth}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employee Engagement</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="engagement-score">
                  {mockAnalytics.averageEngagementScore}%
                </div>
                <p className="text-xs text-blue-600">
                  {mockAnalytics.activeEmployees} of {currentAccount.employeeCount} active
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wellness Impact</CardTitle>
                <Heart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="wellness-impact">
                  {mockAnalytics.wellnessImpactScore}/100
                </div>
                <p className="text-xs text-purple-600">
                  {mockAnalytics.totalKindnessPosts} kindness acts this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="retention-rate">
                  {mockAnalytics.retentionRate}%
                </div>
                <p className="text-xs text-orange-600">
                  Above industry average (91%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Live Activity Feed
                </CardTitle>
                <CardDescription>
                  Real-time employee engagement across all departments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { user: 'Sarah M. (Engineering)', action: 'completed team challenge', time: '2 minutes ago', impact: '+15 wellness points' },
                  { user: 'Mike R. (Sales)', action: 'shared kindness act', time: '5 minutes ago', impact: '+8 engagement' },
                  { user: 'Lisa K. (Marketing)', action: 'mentored colleague', time: '12 minutes ago', impact: '+12 collaboration' },
                  { user: 'David L. (HR)', action: 'organized team lunch', time: '18 minutes ago', impact: '+20 morale boost' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-gray-500">{activity.time}</p>
                      <p className="text-green-600 font-medium">{activity.impact}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Department Performance
                </CardTitle>
                <CardDescription>
                  Team wellness goals and achievement rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTeamMetrics.map((team) => (
                  <div key={team.teamId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{team.teamName}</span>
                      <span className="text-sm text-gray-600">
                        {team.actualKindnessActs}/{team.monthlyKindnessGoal} acts
                      </span>
                    </div>
                    <Progress 
                      value={(team.actualKindnessActs / team.monthlyKindnessGoal) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{team.currentSize} employees</span>
                      <span>{team.engagementRate}% engaged</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teams Tab - Multi-tenant Team Management */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid gap-6">
            {mockTeamMetrics.map((team) => (
              <Card key={team.teamId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {team.teamName}
                      </CardTitle>
                      <CardDescription>
                        {team.department} • {team.currentSize} employees
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={team.engagementRate >= 90 ? "default" : "secondary"}>
                        {team.engagementRate}% Engaged
                      </Badge>
                      <Badge variant={team.wellnessScore >= 85 ? "default" : "secondary"}>
                        Wellness: {team.wellnessScore}/100
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {team.actualKindnessActs}
                      </div>
                      <div className="text-xs text-gray-600">Kindness Acts</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round((team.actualKindnessActs / team.monthlyKindnessGoal) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">Goal Achievement</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {team.currentSize}/{team.targetSize}
                      </div>
                      <div className="text-xs text-gray-600">Team Size</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {team.wellnessScore}
                      </div>
                      <div className="text-xs text-gray-600">Wellness Score</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Goal Progress</span>
                      <span>{Math.round((team.actualKindnessActs / team.monthlyKindnessGoal) * 100)}%</span>
                    </div>
                    <Progress value={(team.actualKindnessActs / team.monthlyKindnessGoal) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab - Business Intelligence */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Subscription metrics and growth trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Recurring Revenue</span>
                    <span className="font-bold text-green-600">${currentAccount.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Per-Employee Revenue</span>
                    <span className="font-bold">${Math.round(currentAccount.monthlyRevenue / currentAccount.employeeCount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Contract Value</span>
                    <span className="font-bold text-blue-600">${(currentAccount.monthlyRevenue * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Rate</span>
                    <span className="font-bold text-green-600">+{mockAnalytics.monthlyGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform Metrics
                </CardTitle>
                <CardDescription>
                  Usage and engagement analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-bold">{Math.round(mockAnalytics.activeEmployees * 0.85)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly Active Users</span>
                    <span className="font-bold">{mockAnalytics.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Feature Adoption Rate</span>
                    <span className="font-bold text-blue-600">{mockAnalytics.averageEngagementScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-bold text-green-600">4.8/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Positioning</CardTitle>
              <CardDescription>
                How your organization compares to industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Employee Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Company</span>
                      <span className="text-green-600 font-medium">{mockAnalytics.averageEngagementScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Industry Average</span>
                      <span className="text-gray-600">67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Top Quartile</span>
                      <span className="text-blue-600">82%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Wellness Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Wellness Score</span>
                      <span className="text-green-600 font-medium">{mockAnalytics.wellnessImpactScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sector Median</span>
                      <span className="text-gray-600">74/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best-in-Class</span>
                      <span className="text-blue-600">89/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Retention</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Rate</span>
                      <span className="text-green-600 font-medium">{mockAnalytics.retentionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Industry Avg</span>
                      <span className="text-gray-600">91.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Top Companies</span>
                      <span className="text-blue-600">96.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wellness Tab - AI-Powered Insights */}
        <TabsContent value="wellness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Wellness Intelligence Dashboard
              </CardTitle>
              <CardDescription>
                Anonymous insights into team wellness and engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Overall Wellness</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-gray-600">Team Collaboration</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">78%</div>
                  <div className="text-sm text-gray-600">Stress Management</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <div className="text-2xl font-bold text-orange-600">94%</div>
                  <div className="text-sm text-gray-600">Positive Sentiment</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Early Warning Indicators</h4>
                  <div className="space-y-3">
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Marketing Team</span>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Watch</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Engagement down 8% this week. Consider team check-in.
                      </p>
                    </div>
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sales Team</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">Excellent</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        High collaboration and wellness scores this month.
                      </p>
                    </div>
                    <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Engineering</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">Good</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Consistent wellness patterns. No concerns detected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Wellness Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Team Building Opportunity</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Cross-department collaboration up 15%. Consider inter-team challenges.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Recognition Program</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        High-performing teams could benefit from peer recognition features.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Wellness Week</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Optimal time for company-wide wellness initiative launch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exports Tab - Enterprise Reporting */}
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Exports & Reports
              </CardTitle>
              <CardDescription>
                Export comprehensive analytics for compliance, reporting, and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Standard Reports</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Monthly Wellness Report</span>
                        <Button size="sm" onClick={() => handleExportData('pdf')} data-testid="export-wellness-pdf">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Comprehensive wellness metrics, team performance, and insights
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Employee Engagement Data</span>
                        <Button size="sm" variant="outline" onClick={() => handleExportData('csv')} data-testid="export-engagement-csv">
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Raw engagement metrics for advanced analysis
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">ROI Analysis</span>
                        <Button size="sm" onClick={() => handleExportData('pdf')} data-testid="export-roi-pdf">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Financial impact analysis and cost-benefit metrics
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Compliance Reports</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">GDPR Compliance Report</span>
                        <Button size="sm" variant="outline" onClick={() => handleExportData('pdf')} data-testid="export-gdpr-pdf">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Data privacy and compliance verification
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">HR Analytics Export</span>
                        <Button size="sm" variant="outline" onClick={() => handleExportData('csv')} data-testid="export-hr-csv">
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Anonymous HR metrics for strategic planning
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Audit Trail</span>
                        <Button size="sm" onClick={() => handleExportData('pdf')} data-testid="export-audit-pdf">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Complete activity log for compliance auditing
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Custom Export Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h5 className="font-medium mb-2">Date Range Selection</h5>
                    <p className="text-sm text-gray-600">
                      Export data for custom time periods (last 30 days, quarter, year)
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h5 className="font-medium mb-2">Department Filtering</h5>
                    <p className="text-sm text-gray-600">
                      Generate reports for specific teams or departments
                    </p>
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