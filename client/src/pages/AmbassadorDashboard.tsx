import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Award, Users, Target, TrendingUp, Gift, CheckCircle2, Trophy, ChevronRight } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { useNavigate } from 'wouter';

interface Ambassador {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ambassadorCode: string;
  ambassadorTier: 'founding' | 'associate';
  ambassadorGoal: number;
  totalReferrals: number;
  ambassadorRewardEarned: boolean;
  createdAt: string;
}

interface AmbassadorStats {
  totalAmbassadors: number;
  foundingAmbassadors: number;
  associateAmbassadors: number;
  totalRecruits: number;
  avgRecruitsPerAmbassador: number;
  rewardsEarned: number;
  goalProgress: number;
}

export default function AmbassadorDashboard() {
  const { user, isAdmin, isTeacher } = useAuth();
  const [, navigate] = useNavigate();

  // Fetch all ambassadors
  const { data: ambassadors, isLoading } = useQuery<Ambassador[]>({
    queryKey: ['/api/ambassadors'],
    enabled: isAdmin || isTeacher,
  });

  // Fetch stats
  const { data: stats } = useQuery<AmbassadorStats>({
    queryKey: ['/api/ambassadors/stats'],
    enabled: isAdmin || isTeacher,
  });

  if (!isAdmin && !isTeacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Access denied. Admin or teacher access required.</p>
            <Button onClick={() => navigate('/')} className="mt-4">Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const foundingAmbassadors = ambassadors?.filter((a: Ambassador) => a.ambassadorTier === 'founding') || [];
  const associateAmbassadors = ambassadors?.filter((a: Ambassador) => a.ambassadorTier === 'associate') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BackButton onClick={() => navigate('/admin-dashboard')} />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-8 h-8 text-amber-600" />
                Student Ambassador Program
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Track ambassador performance and campaign progress
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-amber-200 dark:border-amber-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ambassadors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats?.totalAmbassadors || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.foundingAmbassadors || 0} Founding · {stats?.associateAmbassadors || 0} Associates
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Students Recruited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.totalRecruits || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Goal: 400 ({stats?.goalProgress || 0}%)
              </p>
              <Progress value={stats?.goalProgress || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Per Ambassador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.avgRecruitsPerAmbassador?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-gray-500 mt-1">students recruited</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Rewards Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats?.rewardsEarned || 0}</div>
              <p className="text-xs text-gray-500 mt-1">ambassadors qualified</p>
            </CardContent>
          </Card>
        </div>

        {/* Founding Ambassadors Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
              Founding Ambassadors (Top Performers)
            </CardTitle>
            <CardDescription>
              Goal: 15 recruits to earn $10 Allegacy gift card
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading ambassadors...</div>
            ) : foundingAmbassadors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No founding ambassadors yet</div>
            ) : (
              <div className="space-y-3">
                {foundingAmbassadors
                  .sort((a: Ambassador, b: Ambassador) => b.totalReferrals - a.totalReferrals)
                  .map((ambassador: Ambassador, index: number) => {
                    const progress = (ambassador.totalReferrals / ambassador.ambassadorGoal) * 100;
                    const isTop3 = index < 3;
                    
                    return (
                      <div
                        key={ambassador.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isTop3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="text-gray-400 font-medium">#{index + 1}</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {ambassador.firstName} {ambassador.lastName}
                              </p>
                              {ambassador.ambassadorRewardEarned && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  <Gift className="w-3 h-3 mr-1" />
                                  Reward Earned
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">Code: {ambassador.ambassadorCode}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Progress value={Math.min(progress, 100)} className="flex-1 h-2" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] text-right">
                                {ambassador.totalReferrals} / {ambassador.ambassadorGoal}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-amber-600">
                            {ambassador.totalReferrals}
                          </div>
                          <div className="text-xs text-gray-500">recruits</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Associate Ambassadors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Users className="w-5 h-5" />
              Ambassador Associates
            </CardTitle>
            <CardDescription>
              Goal: 5 recruits to earn recognition certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading ambassadors...</div>
            ) : associateAmbassadors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No associate ambassadors yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {associateAmbassadors
                  .sort((a: Ambassador, b: Ambassador) => b.totalReferrals - a.totalReferrals)
                  .map((ambassador: Ambassador) => {
                    const progress = (ambassador.totalReferrals / ambassador.ambassadorGoal) * 100;
                    
                    return (
                      <div
                        key={ambassador.id}
                        className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {ambassador.firstName} {ambassador.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{ambassador.ambassadorCode}</p>
                          </div>
                          {ambassador.ambassadorRewardEarned && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(progress, 100)} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {ambassador.totalReferrals}/{ambassador.ambassadorGoal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-700/30">
          <CardHeader>
            <CardTitle>Campaign Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-between" variant="outline">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Add New Ambassadors
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Export Campaign Report
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Update Campaign Goals
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
