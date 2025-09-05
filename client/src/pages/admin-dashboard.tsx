import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Award, 
  DollarSign, 
  BarChart3, 
  Building2,
  Shield,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/corporate/employee"],
    retry: false,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["/api/corporate/account"],
    retry: false,
    enabled: !!employee,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/corporate/teams"],
    retry: false,
    enabled: !!employee,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/corporate/analytics"],
    retry: false,
    enabled: !!employee,
  });

  // Check if user is authorized to access admin features
  const isAdmin = employee?.role === 'hr_admin' || employee?.role === 'corporate_admin';

  // Redirect if not authenticated
  useEffect(() => {
    if (!employeeLoading && !employee) {
      toast({
        title: "Access Denied",
        description: "You need to be part of a corporate account to access this dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [employee, employeeLoading, toast]);

  if (employeeLoading || accountLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-purple-600" />
                {account?.companyName || 'Corporate Dashboard'}
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4" />
                {employee.displayName || employee.employeeEmail} • {employee.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <Badge variant={account?.billingStatus === 'active' ? 'default' : 'secondary'}>
              {account?.subscriptionTier?.toUpperCase()} Plan
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams?.reduce((sum, team) => sum + team.currentSize, 0) || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {account?.maxEmployees} max capacity
              </p>
              <Progress 
                value={((teams?.reduce((sum, team) => sum + team.currentSize, 0) || 0) / (account?.maxEmployees || 1)) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${account?.monthlyBudget || 0}</div>
              <p className="text-xs text-muted-foreground">
                $ECHO tokens available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Count</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Company Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industry</p>
                    <p className="text-lg">{account?.industry || 'Technology'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Size</p>
                    <p className="text-lg capitalize">{account?.companySize || 'medium'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Domain</p>
                    <p className="text-lg">@{account?.domain}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Billing Status</p>
                    <Badge variant={account?.billingStatus === 'active' ? 'default' : 'secondary'}>
                      {account?.billingStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Team Challenge Completed</p>
                        <p className="text-xs text-gray-500">Engineering team - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Kindness Goal Achieved</p>
                        <p className="text-xs text-gray-500">Marketing team - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">New Employee Enrolled</p>
                        <p className="text-xs text-gray-500">HR team - 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams?.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{team.teamName}</CardTitle>
                    <CardDescription>{team.department}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Team Size</span>
                        <span>{team.currentSize} / {team.targetSize}</span>
                      </div>
                      <Progress 
                        value={(team.currentSize / team.targetSize) * 100} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monthly Kindness Goal</p>
                      <p className="text-xl font-bold">{team.monthlyKindnessGoal}</p>
                    </div>
                    {team.teamLead && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Team Lead</p>
                        <p className="text-sm">{team.teamLead}</p>
                      </div>
                    )}
                    <Badge variant={team.isActive ? 'default' : 'secondary'}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Wellness Analytics
                </CardTitle>
                <CardDescription>
                  Track employee wellness metrics and engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Analytics Dashboard</p>
                    <p className="text-sm">Coming soon - Real-time wellness metrics and trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    AI Wellness Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-medium text-sm">Medium Priority</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Engineering team shows 15% decline in wellness metrics. Consider team building activities.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Predicted 2 days ago</p>
                  </div>
                  <div className="border-l-4 border-red-400 pl-4">
                    <p className="font-medium text-sm">High Priority</p>
                    <p className="text-sm text-gray-600 mt-1">
                      4 employees showing early burnout indicators. Immediate intervention recommended.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Predicted 1 day ago</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Success Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-green-400 pl-4">
                    <p className="font-medium text-sm">Positive Trend</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sales team wellness scores improved by 23% after implementing daily kindness challenges.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">87% confidence</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <p className="font-medium text-sm">Recommendation</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Expand peer recognition program to other teams based on Marketing team success.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">AI Suggestion</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Administrative tools for managing your company's wellness program
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Manage Teams
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}