/**
 * 🚀 REVOLUTIONARY: Real-Time Parent Engagement Dashboard
 * Parents receive instant notifications when their child posts kindness acts
 * Creates powerful family engagement and dual reward system
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Bell, 
  Star, 
  Calendar, 
  Trophy,
  Users,
  Gift,
  MessageSquare,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Award,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { useLocation } from 'wouter';
import PushNotificationSetup from '@/components/PushNotificationSetup';
import { SponsorsPage } from '@/components/SponsorsPage';

interface ParentNotification {
  id: string;
  type: 'kindness_post' | 'reward_earned' | 'milestone' | 'concern' | 'weekly_summary';
  title: string;
  message: string;
  studentName: string;
  studentUserId: string;
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedData?: {
    postContent?: string;
    rewardAmount?: number;
    milestoneType?: string;
    riskLevel?: string;
  };
}

interface StudentActivity {
  id: string;
  studentUserId: string;
  studentName: string;
  content: string;
  category: string;
  location: string;
  createdAt: string;
  heartsCount: number;
  echoesCount: number;
  impactScore: number;
  isParentFavorite: boolean;
}

interface ParentStats {
  totalKindnessActs: number;
  weeklyKindnessActs: number;
  totalRewardsEarned: number;
  currentStreak: number;
  impactScore: number;
  parentRewardsEarned: number;
  familyRanking: number;
  milestonesAchieved: number;
}

interface LinkedStudent {
  userId: string;
  name: string;
  grade: string;
  school: string;
  isActive: boolean;
  lastActivity: string;
  weeklyKindnessCount: number;
  totalKindnessCount: number;
  currentStreak: number;
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notifications' | 'rewards' | 'insights' | 'sponsors'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [, navigate] = useLocation();

  // Mock parent data - in production, get from auth context
  const parentInfo = {
    id: 'parent-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    children: ['student-001', 'student-002']
  };

  // Mock linked students
  const linkedStudents: LinkedStudent[] = [
    {
      userId: 'student-001',
      name: 'Emma Johnson',
      grade: '6th',
      school: 'Burlington Christian Academy',
      isActive: true,
      lastActivity: new Date().toISOString(),
      weeklyKindnessCount: 8,
      totalKindnessCount: 47,
      currentStreak: 5
    },
    {
      userId: 'student-002', 
      name: 'Alex Johnson',
      grade: '2nd',
      school: 'Burlington Christian Academy',
      isActive: true,
      lastActivity: new Date(Date.now() - 7200000).toISOString(),
      weeklyKindnessCount: 6,
      totalKindnessCount: 23,
      currentStreak: 3
    }
  ];

  // 🔥 REAL-TIME NOTIFICATIONS: Parents get instant alerts when children post kindness!
  const mockNotifications: ParentNotification[] = [
    {
      id: 'notif-001',
      type: 'kindness_post',
      title: '🌟 Emma shared a kindness act!',
      message: 'Emma just posted about helping a classmate with their homework. You both earned rewards!',
      studentName: 'Emma',
      studentUserId: 'student-001',
      createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      isRead: false,
      priority: 'medium',
      relatedData: {
        postContent: 'I helped my friend Sarah with her math homework during lunch',
        rewardAmount: 5
      }
    },
    {
      id: 'notif-002',
      type: 'milestone',
      title: '🏆 Alex reached a milestone!',
      message: 'Alex completed 5 kindness acts this week and earned the "Helper Hero" badge!',
      studentName: 'Alex',
      studentUserId: 'student-002',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: true,
      priority: 'high',
      relatedData: {
        milestoneType: 'Helper Hero',
        rewardAmount: 15
      }
    },
    {
      id: 'notif-003',
      type: 'reward_earned',
      title: '🎁 You earned parent rewards!',
      message: 'Your dual reward system bonus: $5 Target gift card for family shopping!',
      studentName: 'Family Reward',
      studentUserId: 'family',
      createdAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      isRead: false,
      priority: 'high',
      relatedData: {
        rewardAmount: 25 // Parent reward value
      }
    }
  ];

  // Recent activities from children
  const mockActivities: StudentActivity[] = [
    {
      id: 'activity-001',
      studentUserId: 'student-001',
      studentName: 'Emma',
      content: 'I helped my friend Sarah with her math homework during lunch',
      category: 'helping',
      location: 'Burlington Elementary',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      heartsCount: 12,
      echoesCount: 3,
      impactScore: 85,
      isParentFavorite: false
    },
    {
      id: 'activity-002',
      studentUserId: 'student-002',
      studentName: 'Alex',
      content: 'I shared my snack with a friend who forgot theirs',
      category: 'sharing',
      location: 'Burlington Elementary',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      heartsCount: 8,
      echoesCount: 2,
      impactScore: 72,
      isParentFavorite: true
    },
    {
      id: 'activity-003',
      studentUserId: 'student-001',
      studentName: 'Emma',
      content: 'I included a new student in our group during recess',
      category: 'including',
      location: 'Burlington Elementary',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      heartsCount: 15,
      echoesCount: 4,
      impactScore: 92,
      isParentFavorite: true
    }
  ];

  // 💎 DUAL REWARD SYSTEM STATS: Both kids AND parents earn rewards!
  const mockStats: ParentStats = {
    totalKindnessActs: 70,
    weeklyKindnessActs: 14,
    totalRewardsEarned: 350,
    currentStreak: 5,
    impactScore: 1240,
    parentRewardsEarned: 125, // REVOLUTIONARY: Parents earn rewards too!
    familyRanking: 8,
    milestonesAchieved: 12
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kindness_post': return <Heart className="h-5 w-5 text-pink-500" />;
      case 'reward_earned': return <Gift className="h-5 w-5 text-green-500" />;
      case 'milestone': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'concern': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'weekly_summary': return <Calendar className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    // In production: API call to mark notification as read
  };

  const handleFavoriteActivity = async (activityId: string) => {
    console.log('Favoriting activity:', activityId);
    // In production: API call to favorite activity
  };

  // 🔄 Real-time updates: In production, this would use WebSocket for instant notifications
  useEffect(() => {
    console.log('🔔 Setting up real-time parent notifications...');
    // WebSocket connection for instant parent notifications would be initialized here
    return () => {
      console.log('🔌 Cleaning up real-time connections...');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                  data-testid="back-to-platform"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Platform
                </Button>
                <Heart className="h-8 w-8 text-pink-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Parent Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {parentInfo.name}! Track your children's kindness journey in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {linkedStudents.length} Children
              </Badge>
              <Badge variant="destructive" className="px-3 py-1">
                <Bell className="w-4 h-4 mr-1" />
                {mockNotifications.filter(n => !n.isRead).length} Unread
              </Badge>
            </div>
          </div>
        </div>

        {/* Safety & Privacy Disclosure for Parents */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safety & Privacy Notice
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-200">
            <p className="mb-2">
              <strong>Student Privacy:</strong> Your children can post anonymously to support each other through challenges. 
              Posts are completely anonymous with no identifying information.
            </p>
            <p>
              <strong>Safety Protocols:</strong> If posts indicate immediate danger (self-harm, abuse, or crisis situations), 
              school counselors and appropriate authorities will be notified to ensure student safety, following all legal requirements.
            </p>
          </AlertDescription>
        </Alert>

        {/* 🌟 REVOLUTIONARY: Real-time notification banner */}
        {mockNotifications.filter(n => !n.isRead).length > 0 && (
          <Alert className="mb-6 border-pink-200 bg-pink-50 dark:bg-pink-900/10">
            <Heart className="h-4 w-4 text-pink-600" />
            <AlertTitle className="text-pink-900 dark:text-pink-100">
              🔥 Live Activity Alert!
            </AlertTitle>
            <AlertDescription className="text-pink-700 dark:text-pink-200">
              Your children have {mockNotifications.filter(n => !n.isRead).length} new kindness activities! 
              Check the notifications tab to see what amazing things they've been doing.
            </AlertDescription>
          </Alert>
        )}

        {/* Student Selector */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Card 
              className={`min-w-[200px] cursor-pointer transition-all hover:shadow-md ${
                selectedStudent === '' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedStudent('')}
              data-testid="card-all-children"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">All Children</h3>
                    <p className="text-sm text-gray-600">Combined view</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {linkedStudents.map((student) => (
              <Card 
                key={student.userId}
                className={`min-w-[200px] cursor-pointer transition-all hover:shadow-md ${
                  selectedStudent === student.userId ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedStudent(student.userId)}
                data-testid={`card-student-${student.userId}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade} Grade</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-green-600">{student.weeklyKindnessCount} this week</span>
                    <span className="text-orange-600">{student.currentStreak} day streak</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Live Activity</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="rewards">Dual Rewards</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="sponsors">
              <Building2 className="h-4 w-4 mr-1" />
              Sponsors
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* 💎 DUAL REWARD SYSTEM: Key Stats showing both child and parent rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-pink-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Kindness Acts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.totalKindnessActs}
                      </p>
                      <p className="text-xs text-green-600">+{mockStats.weeklyKindnessActs} this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockStats.currentStreak} days
                      </p>
                      <p className="text-xs text-orange-600">Keep it going! 🔥</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">💰 Your Parent Rewards</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${mockStats.parentRewardsEarned}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Dual reward system! 🎉</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Family Ranking</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{mockStats.familyRanking}
                      </p>
                      <p className="text-xs text-blue-600">Top 10 families! 🌟</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 📱 Push Notification Setup */}
            <PushNotificationSetup 
              userId={parentInfo.id}
              userType="parent"
              onSubscriptionChange={(isSubscribed) => {
                console.log('Push notification subscription changed:', isSubscribed);
              }}
            />

            {/* 🔔 Recent Real-time Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  🔥 Live Notifications
                  <Badge variant="destructive" className="ml-2">
                    {mockNotifications.filter(n => !n.isRead).length} New
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Get instant alerts when your children share kindness acts - both of you earn rewards!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : 'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Badge variant="destructive" className="text-xs">LIVE</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Family Kindness Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Family progress this week</span>
                    <span className="text-sm font-medium">{mockStats.weeklyKindnessActs}/20 acts</span>
                  </div>
                  <Progress value={(mockStats.weeklyKindnessActs / 20) * 100} className="h-3" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {20 - mockStats.weeklyKindnessActs} more to reach your family goal!
                    </span>
                    <span className="text-green-600 font-medium">
                      +${Math.floor((mockStats.weeklyKindnessActs / 20) * 50)} parent bonus earned
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔥 Live Kindness Feed
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </div>
                <Badge variant="outline">{mockActivities.length} activities this week</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockActivities.map((activity) => (
                <Card key={activity.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {activity.studentName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.studentName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                          {activity.createdAt > new Date(Date.now() - 3600000).toISOString() && (
                            <Badge variant="destructive" className="text-xs">NEW</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          "{activity.content}"
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {activity.heartsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {activity.echoesCount}
                          </span>
                          <span>Impact: {activity.impactScore}/100</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleFavoriteActivity(activity.id)}
                        variant={activity.isParentFavorite ? "default" : "outline"}
                        size="sm"
                        data-testid={`button-favorite-${activity.id}`}
                      >
                        <Star className={`h-4 w-4 ${activity.isParentFavorite ? 'text-white' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📱 All Notifications
              </h3>
              <Button variant="outline" size="sm" data-testid="button-mark-all-read">
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            </div>

            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <Card key={notification.id} className={!notification.isRead ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <Badge variant={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant="destructive" className="text-xs">UNREAD</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        {notification.relatedData?.postContent && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md mb-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your child wrote:</p>
                            <p className="text-sm">"{notification.relatedData.postContent}"</p>
                          </div>
                        )}
                        {notification.relatedData?.rewardAmount && (
                          <div className="flex items-center gap-1 mb-2">
                            <Gift className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">
                              Reward earned: ${notification.relatedData.rewardAmount}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          {!notification.isRead && (
                            <Button
                              onClick={() => handleMarkAsRead(notification.id)}
                              variant="outline"
                              size="sm"
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dual Rewards Tab */}
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  💰 Revolutionary Dual Reward System
                </CardTitle>
                <CardDescription>
                  When your children earn rewards, you earn rewards too! Our unique family engagement multiplier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">👶 Children's Rewards</h4>
                    <p className="text-2xl font-bold text-blue-600">${mockStats.totalRewardsEarned}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Burlington area kid-friendly rewards</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">👨‍👩‍👧‍👦 Parent Rewards</h4>
                    <p className="text-2xl font-bold text-green-600">${mockStats.parentRewardsEarned}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Family shopping & experiences</p>
                  </div>
                </div>
                
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <Gift className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900 dark:text-green-100">
                    🎉 How Dual Rewards Work
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-200">
                    Every time your child earns rewards for kindness acts, you automatically earn parent rewards too! 
                    This creates powerful family engagement and makes kindness a shared family value.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  🧠 AI-Powered Family Kindness Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced analytics showing your family's kindness patterns, growth opportunities, and impact measurement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            <SponsorsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}