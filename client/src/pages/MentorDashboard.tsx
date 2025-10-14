import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Trophy, 
  BookOpen, 
  Star, 
  Heart, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useState } from "react";
import { useLocation } from "wouter";

type Mentorship = {
  id: string;
  menteeId: string;
  menteeName: string;
  status: string;
  startedAt: string;
  kindnessGoal: string;
  progressNotes: string;
  nextSessionAt?: string;
};

type MentorBadge = {
  id: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
  category: string;
  tier: string;
  tokenReward: number;
  earnedAt?: string;
};

type MentorActivity = {
  id: string;
  activityType: string;
  description: string;
  scheduledAt: string;
  isCompleted: boolean;
  mentorReflection?: string;
  menteeReflection?: string;
};

type MentorStats = {
  totalMentees: number;
  activeMentorships: number;
  totalSessions: number;
  avgRating: number;
  totalKindnessActsGuided: number;
  totalTokensEarned: number;
  badgesEarned: number;
  mentorLevel: number;
  nextLevelProgress: number;
  impactScore: number;
};

type TrainingModule = {
  id: string;
  title: string;
  description: string;
  trainingType: string;
  durationMinutes: number;
  isRequired: boolean;
  certificateReward: number;
  completed?: boolean;
};

export default function MentorDashboard() {
  const [selectedTab, setSelectedTab] = useState("training");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch mentor data
  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/mentor/mentorships"]
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery<MentorBadge[]>({
    queryKey: ["/api/mentor/badges"]
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<MentorActivity[]>({
    queryKey: ["/api/mentor/activities"]
  });

  const { data: stats, isLoading: statsLoading } = useQuery<MentorStats>({
    queryKey: ["/api/mentor/stats"]
  });

  const { data: trainingRaw = [], isLoading: trainingLoading } = useQuery<TrainingModule[]>({
    queryKey: ["/api/mentor/training"]
  });

  // Add completed field if missing (backend compatibility)
  const training = trainingRaw.map(module => ({
    ...module,
    completed: module.completed ?? false
  }));

  // Quick stats for overview
  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const upcomingSessions = activities.filter(a => !a.isCompleted && new Date(a.scheduledAt) > new Date());
  const recentBadges = badges.filter(b => b.earnedAt).sort((a, b) => 
    new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime()
  ).slice(0, 3);

  if (statsLoading || mentorshipsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
        <div className="container mx-auto">
          <BackButton 
          onClick={() => {
            console.log('🔙 Back button clicked, navigating to /app');
            setLocation('/app');
          }} 
          variant="minimal" 
        />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <BackButton 
          onClick={() => {
            console.log('🔙 Back button clicked in MentorDashboard, navigating to /app');
            setLocation('/app');
          }} 
          variant="minimal" 
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600">Guide young hearts to spread kindness everywhere</p>
            </div>
          </div>
          
          {/* Quick Instructions for New Mentors */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">New to Mentoring? Start Here! 🎯</h3>
                <p className="text-blue-700 text-sm mb-2">
                  Complete your training modules first, then you'll be ready to guide other students in spreading kindness.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedTab("training")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start Training
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTab("overview")}
                  >
                    View Overview
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {stats && (
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>Level {stats.mentorLevel} Mentor</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{stats.impactScore} Impact Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span>{(Number(stats.avgRating) || 0).toFixed(1)} Average Rating</span>
              </div>
            </div>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2 p-0">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:shadow-lg transition-all"
            >
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="mentorships" 
              className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:shadow-lg transition-all"
            >
              <Users className="h-4 w-4" />
              My Mentees
            </TabsTrigger>
            <TabsTrigger 
              value="activities" 
              className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 data-[state=active]:bg-green-700 data-[state=active]:shadow-lg transition-all"
            >
              <Calendar className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 data-[state=active]:bg-amber-700 data-[state=active]:shadow-lg transition-all"
            >
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 data-[state=active]:bg-teal-700 data-[state=active]:shadow-lg transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Training
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Active Mentees</p>
                      <p className="text-3xl font-bold">{activeMentorships.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Acts Guided</p>
                      <p className="text-3xl font-bold">{stats?.totalKindnessActsGuided || 0}</p>
                    </div>
                    <Heart className="h-8 w-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Badges Earned</p>
                      <p className="text-3xl font-bold">{stats?.badgesEarned || 0}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-orange-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Sessions</p>
                      <p className="text-3xl font-bold">{stats?.totalSessions || 0}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Mentor Level Progress
                  </CardTitle>
                  <CardDescription>
                    You're currently a Level {stats?.mentorLevel || 1} Mentor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={stats?.nextLevelProgress || 0} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {stats?.nextLevelProgress || 0}% to Level {(stats?.mentorLevel || 1) + 1}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Keep Going!</h4>
                      <p className="text-sm text-blue-700">
                        Continue mentoring and completing training modules to advance your level.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>
                    {upcomingSessions.length} sessions scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming sessions scheduled</p>
                      <Button className="mt-4" size="sm">
                        Schedule a Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{activity.activityType}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges */}
            {recentBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>
                    Your latest badges and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{badge.badgeIcon}</div>
                        <div>
                          <p className="font-semibold text-yellow-900">{badge.badgeName}</p>
                          <p className="text-sm text-yellow-700">{badge.tier} • {badge.tokenReward} tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mentorships Tab */}
          <TabsContent value="mentorships" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Mentees</h2>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Users className="h-4 w-4 mr-2" />
                Find New Mentee
              </Button>
            </div>

            {activeMentorships.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Active Mentorships</h3>
                  <p className="text-gray-600 mb-6">Start your mentoring journey by connecting with a student who needs guidance.</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Get Matched with a Mentee
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {activeMentorships.map((mentorship) => (
                  <Card key={mentorship.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {mentorship.menteeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle>{mentorship.menteeName}</CardTitle>
                            <CardDescription>
                              Started {new Date(mentorship.startedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={mentorship.status === 'active' ? 'default' : 'secondary'}>
                          {mentorship.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Kindness Goal</h4>
                          <p className="text-gray-600">{mentorship.kindnessGoal}</p>
                        </div>
                        
                        {mentorship.progressNotes && (
                          <div>
                            <h4 className="font-semibold mb-2">Recent Progress</h4>
                            <p className="text-gray-600">{mentorship.progressNotes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Start Session
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Meeting
                          </Button>
                          <Button size="sm" variant="outline">
                            View Progress
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentoring Activities</h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Activity
              </Button>
            </div>

            <div className="grid gap-4">
              {activities.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">No Activities Yet</h3>
                    <p className="text-gray-600 mb-6">Start creating meaningful mentoring experiences.</p>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                      Plan Your First Activity
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activity.isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Clock className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{activity.activityType}</h3>
                            <p className="text-gray-600">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.scheduledAt).toLocaleDateString()} at {' '}
                              {new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {activity.isCompleted ? (
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          ) : (
                            <Button size="sm">
                              {new Date(activity.scheduledAt) <= new Date() ? 'Start Now' : 'View Details'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentor Badges</h2>
              <div className="text-sm text-gray-600">
                {badges.filter(b => b.earnedAt).length} of {badges.length} earned
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={`hover:shadow-lg transition-all ${
                  badge.earnedAt 
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`text-6xl mb-4 ${badge.earnedAt ? '' : 'grayscale opacity-50'}`}>
                      {badge.badgeIcon}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      badge.earnedAt ? 'text-yellow-900' : 'text-gray-600'
                    }`}>
                      {badge.badgeName}
                    </h3>
                    <p className={`text-sm mb-4 ${
                      badge.earnedAt ? 'text-yellow-700' : 'text-gray-500'
                    }`}>
                      {badge.description}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant={badge.earnedAt ? 'default' : 'secondary'}>
                        {badge.tier}
                      </Badge>
                      <Badge variant="outline">
                        {badge.tokenReward} tokens
                      </Badge>
                    </div>

                    {badge.earnedAt ? (
                      <div className="text-xs text-yellow-600">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full">
                        View Requirements
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mentor Training</h2>
              <div className="text-sm text-gray-600">
                {training.filter(t => t.completed).length} of {training.length} completed
              </div>
            </div>

            <div className="grid gap-6">
              {training.map((module) => (
                <Card key={module.id} className={`hover:shadow-md transition-shadow ${
                  module.completed ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          module.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <BookOpen className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <p className="text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {module.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {module.certificateReward} tokens
                            </span>
                            {module.isRequired && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {module.completed ? (
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        ) : (
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                            Start Training
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}