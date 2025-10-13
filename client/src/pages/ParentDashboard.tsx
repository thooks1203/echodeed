/**
 * 🚀 REVOLUTIONARY: Real-Time Parent Engagement Dashboard
 * Parents receive instant notifications when their child posts kindness acts
 * Creates powerful family engagement and dual reward system
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Building2,
  Zap,
  BookOpen,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useLocation } from 'wouter';
import PushNotificationSetup from '@/components/PushNotificationSetup';
import { SponsorsPage } from '@/components/SponsorsPage';
import { BottomNavigation } from '@/components/BottomNavigation';
import { featureFlags } from '@shared/featureFlags';
import { useDemoSchool } from '@/contexts/DemoSchoolContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

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

interface RewardOffer {
  id: string;
  partnerId: string;
  offerType: string;
  title: string;
  description: string;
  offerValue: string;
  echoCost: number;
  isDualReward?: number;
  kidReward?: string;
  parentReward?: string;
  isFeatured?: number;
  isActive?: number;
  imageUrl?: string;
  termsAndConditions?: string;
}

interface RewardPartner {
  id: string;
  partnerName: string;
  partnerLogo?: string;
  location?: string;
  description?: string;
}

// Rewards Section Component - Parent reward offers
function RewardsSection({ currentStats }: { currentStats: ParentStats }) {
  const { toast } = useToast();
  
  // Fetch reward offers
  const { data: offers = [], isLoading: offersLoading } = useQuery<RewardOffer[]>({
    queryKey: ['/api', 'rewards', 'offers', 'all', 'all'],
  });

  // Fetch reward partners
  const { data: partners = [] } = useQuery<RewardPartner[]>({
    queryKey: ['/api', 'rewards', 'partners'],
  });

  // Filter for dual reward offers
  const dualRewardOffers = offers.filter(offer => offer.isDualReward === 1 && offer.isActive === 1);

  if (offersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            💰 Revolutionary Dual Reward System
          </CardTitle>
          <CardDescription>Loading reward offers...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold text-blue-600">${currentStats.totalRewardsEarned}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Greensboro area high school rewards</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">👨‍👩‍👧‍👦 Parent Rewards</h4>
              <p className="text-2xl font-bold text-green-600">${currentStats.parentRewardsEarned}</p>
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

      {/* Dual Reward Offers */}
      {dualRewardOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Available Dual Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dualRewardOffers.map((offer) => {
              const partner = partners.find((p) => p.id === offer.partnerId);
              return (
                <Card key={offer.id} className="overflow-hidden border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{offer.title}</CardTitle>
                        {partner && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {partner.partnerName}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                        {offer.echoCost} $ECHO
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {offer.description}
                    </p>
                    
                    {offer.kidReward && offer.parentReward && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">👶 Child Gets:</p>
                          <p className="text-blue-700 dark:text-blue-300">{offer.kidReward}</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="font-semibold text-green-900 dark:text-green-100 mb-1">👨‍👩‍👧‍👦 Parent Gets:</p>
                          <p className="text-green-700 dark:text-green-300">{offer.parentReward}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="sm"
                      data-testid={`button-view-offer-${offer.id}`}
                      onClick={() => {
                        toast({
                          title: "Reward Details",
                          description: `Your child can redeem this offer from their Student Dashboard for ${offer.echoCost} $ECHO tokens!`,
                        });
                      }}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      View Offer Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Service Hours Section Component - Parent view of child's community service
function ServiceHoursSection() {
  // Demo parent viewing child's service hours (Sofia Rodriguez is the primary demo child)
  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['/api/community-service/parent', 'demo-parent', 'child', 'student-001'],
    enabled: true
  });

  if (serviceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            🏥 Verified Service Hours
          </CardTitle>
          <CardDescription>Loading your child's community service verification history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = (serviceData as any)?.summary;
  const logs = (serviceData as any)?.recentLogs || [];
  const notificationsSent = (serviceData as any)?.totalNotificationsSent || 0;

  return (
    <div className="space-y-6">
      {/* Service Hours Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            🏥 Verified Service Hours
          </CardTitle>
          <CardDescription>
            Track your child's community service progress and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalHoursCompleted || 0}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Hours Logged</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalHoursVerified || 0}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Hours Verified</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.totalHoursPending || 0}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Awaiting Verification</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{notificationsSent}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Email Notifications</div>
              </div>
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>No Service Hours Yet</AlertTitle>
              <AlertDescription>
                Your child hasn't logged any service hours yet. Encourage them to get started!
              </AlertDescription>
            </Alert>
          )}

          {summary && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress toward 30-hour goal</span>
                <span className="text-sm text-gray-600">{summary.goalProgress || 0}% complete</span>
              </div>
              <Progress value={parseFloat(summary.goalProgress || '0')} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Service Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            📋 Recent Service Activity
          </CardTitle>
          <CardDescription>
            Your child's latest community service submissions and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{log.serviceName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{log.organizationName || 'Organization not specified'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={log.verificationStatus === 'verified' ? 'default' : log.verificationStatus === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {log.verificationStatus === 'verified' ? 'Verified ✅' : 
                         log.verificationStatus === 'pending' ? 'Pending Review ⏳' : 'Needs Review ⚠️'}
                      </Badge>
                      <span className="text-sm font-medium text-blue-600">{log.hoursLogged} hours</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                    {log.serviceDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{log.category} • {new Date(log.serviceDate).toLocaleDateString()}</span>
                    {log.parentNotified && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Email sent
                      </span>
                    )}
                  </div>
                  {log.studentReflection && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <strong>Student Reflection:</strong> {log.studentReflection}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>No Service Hours Yet</AlertTitle>
              <AlertDescription>
                Your child hasn't logged any service hours. Once they do, you'll see their activity here and receive email notifications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Parent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            👨‍👩‍👧‍👦 Parent Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">Email Notifications Active</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-200">
              You'll receive an email every time your child submits service hours for verification. 
              Total notifications sent: <strong>{notificationsSent}</strong>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              data-testid="button-refresh-service-hours"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled
              data-testid="button-view-certificates"
            >
              <Award className="h-4 w-4 mr-2" />
              View Certificates (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'rewards' | 'service-hours' | 'faq' | 'fundraising' | 'insights'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [, navigate] = useLocation();
  const [activeBottomTab, setActiveBottomTab] = useState('parent-dashboard');
  const { schoolConfig } = useDemoSchool();

  // Conversation Starters for parent-child engagement
  const conversationStarters = [
    {
      category: "Character Development",
      icon: "💭",
      question: "What does being a good person mean to you? How do you try to show that in your daily life?",
      tip: "Listen without judgment - this builds trust and encourages open sharing."
    },
    {
      category: "Kindness & Empathy",
      icon: "❤️",
      question: "Can you tell me about a time this week when you helped someone? How did it make you feel?",
      tip: "Celebrate specific acts - this reinforces positive behavior patterns."
    },
    {
      category: "Service & Impact",
      icon: "🤝",
      question: "If you could solve one problem in our community, what would it be and why?",
      tip: "This sparks critical thinking about social issues and personal agency."
    },
    {
      category: "Goals & Growth",
      icon: "🎯",
      question: "What's one character strength you want to develop this year? How can our family support you?",
      tip: "Co-create action steps - involvement increases commitment and follow-through."
    },
    {
      category: "Peer Relationships",
      icon: "👥",
      question: "Who at school makes a positive difference? What do they do that inspires you?",
      tip: "Identifying role models helps teens clarify their own values."
    },
    {
      category: "Gratitude & Reflection",
      icon: "🙏",
      question: "What are three things you're grateful for today, and why do they matter to you?",
      tip: "Daily gratitude practice builds resilience and positive mindset."
    },
    {
      category: "Courage & Integrity",
      icon: "💪",
      question: "Have you ever stood up for something you believed in, even when it was hard? What happened?",
      tip: "Share your own stories of standing up for values - modeling is powerful."
    },
    {
      category: "Community Connection",
      icon: "🌍",
      question: "How does your service work connect to things you care about personally?",
      tip: "Linking service to personal passions increases long-term engagement."
    },
    {
      category: "Future Vision",
      icon: "✨",
      question: "What kind of person do you want to be known as when you graduate? What steps can you take now?",
      tip: "Future-focused questions help teens see the big picture of character development."
    },
    {
      category: "Daily Choices",
      icon: "🔄",
      question: "When you had a choice today between the easy thing and the right thing, what did you choose?",
      tip: "Discuss the 'why' behind choices - this builds moral reasoning skills."
    },
    {
      category: "Mentorship & Leadership",
      icon: "🌟",
      question: "Is there someone younger who looks up to you? How does that influence your actions?",
      tip: "Recognition of influence encourages responsible leadership behavior."
    },
    {
      category: "Challenges & Resilience",
      icon: "🛡️",
      question: "What's the hardest part about trying to be kind every day? How do you overcome it?",
      tip: "Normalize struggles - growth happens through challenges, not despite them."
    }
  ];

  const [currentStarterIndex, setCurrentStarterIndex] = useState(Math.floor(Math.random() * conversationStarters.length));

  const getNewConversationStarter = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * conversationStarters.length);
    } while (newIndex === currentStarterIndex && conversationStarters.length > 1);
    setCurrentStarterIndex(newIndex);
  };

  const handleBottomTabChange = (tab: string) => {
    setActiveBottomTab(tab);
    if (tab === 'family-dashboard') {
      navigate('/family-dashboard');
    } else if (tab === 'parent-dashboard') {
      // Already on parent dashboard
    } else if (tab === 'feed') {
      navigate('/');
    } else if (tab === 'support') {
      navigate('/?tab=support');
    } else if (tab === 'rewards') {
      navigate('/rewards');
    }
  };

  // Mock parent data - in production, get from auth context
  const parentInfo = {
    id: 'parent-001',
    name: schoolConfig.users.parent.name,
    email: schoolConfig.users.parent.email,
    children: [schoolConfig.users.student.id]
  };

  // Mock linked students
  const linkedStudents: LinkedStudent[] = [
    {
      userId: schoolConfig.users.student.id,
      name: schoolConfig.users.student.name,
      grade: schoolConfig.users.student.grade + 'th',
      school: schoolConfig.school.name,
      isActive: true,
      lastActivity: new Date().toISOString(),
      weeklyKindnessCount: 8,
      totalKindnessCount: 47,
      currentStreak: 5
    }
  ];

  // 🔥 REAL-TIME NOTIFICATIONS: Parents get instant alerts when children post kindness!
  const mockNotifications: ParentNotification[] = [
    {
      id: 'notif-001',
      type: 'kindness_post',
      title: '🌟 Your child shared a kindness act!',
      message: 'Your child just posted about helping a classmate with their homework. You both earned rewards!',
      studentName: 'Child',
      studentUserId: 'student-001',
      createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      isRead: false,
      priority: 'medium',
      relatedData: {
        postContent: 'I helped a classmate with their math homework during lunch',
        rewardAmount: 5
      }
    },
    {
      id: 'notif-002',
      type: 'milestone',
      title: '🏆 Your child reached a milestone!',
      message: 'Your child completed 5 kindness acts this week and earned the "Helper Hero" badge!',
      studentName: 'Child',
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
      studentUserId: schoolConfig.users.student.id,
      studentName: schoolConfig.users.student.name,
      content: 'I helped a classmate with their math homework during lunch',
      category: 'helping',
      location: schoolConfig.school.name,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      heartsCount: 12,
      echoesCount: 3,
      impactScore: 85,
      isParentFavorite: false
    },
    {
      id: 'activity-002',
      studentUserId: schoolConfig.users.student.id,
      studentName: schoolConfig.users.student.name,
      content: 'I shared my snack with a friend who forgot theirs',
      category: 'sharing',
      location: schoolConfig.school.name,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      heartsCount: 8,
      echoesCount: 2,
      impactScore: 72,
      isParentFavorite: true
    },
    {
      id: 'activity-003',
      studentUserId: schoolConfig.users.student.id,
      studentName: schoolConfig.users.student.name,
      content: 'I included a new student in our group during recess',
      category: 'including',
      location: schoolConfig.school.name,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      heartsCount: 15,
      echoesCount: 4,
      impactScore: 92,
      isParentFavorite: true
    }
  ];

  // 💎 DUAL REWARD SYSTEM STATS: Individual stats for each child + combined family stats
  const individualStats: Record<string, ParentStats> = {
    'student-001': { // Emma Johnson
      totalKindnessActs: 47,
      weeklyKindnessActs: 8,
      totalRewardsEarned: 235,
      currentStreak: 5,
      impactScore: 820,
      parentRewardsEarned: 75, // Parent rewards from Emma's activities
      familyRanking: 8,
      milestonesAchieved: 8
    },
    'student-002': { // Alex Johnson
      totalKindnessActs: 23,
      weeklyKindnessActs: 6,
      totalRewardsEarned: 115,
      currentStreak: 3,
      impactScore: 420,
      parentRewardsEarned: 50, // Parent rewards from Alex's activities
      familyRanking: 8,
      milestonesAchieved: 4
    }
  };

  // Combined family stats when viewing all children
  const combinedStats: ParentStats = {
    totalKindnessActs: 70,
    weeklyKindnessActs: 14,
    totalRewardsEarned: 350,
    currentStreak: 5,
    impactScore: 1240,
    parentRewardsEarned: 125, // Total parent rewards from both children
    familyRanking: 8,
    milestonesAchieved: 12
  };

  // Get current stats based on selected student
  const currentStats = selectedStudent === '' ? combinedStats : (individualStats[selectedStudent] || combinedStats);

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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/?tab=feed')}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  data-testid="back-to-platform"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Platform
                </Button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    Parent Dashboard
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {parentInfo.name}! Track your {linkedStudents.length === 1 ? "child's" : "children's"} kindness journey in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {linkedStudents.length} {linkedStudents.length === 1 ? 'Child' : 'Children'}
              </Badge>
              <Badge variant="destructive" className="px-3 py-1">
                <Bell className="w-4 h-4 mr-1" />
                {mockNotifications.filter(n => !n.isRead).length} Unread
              </Badge>
            </div>
          </div>
        </div>

        {/* Safety & Privacy Disclosure for Parents */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/10 overflow-hidden">
          <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Safety & Privacy Notice
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-200 text-sm">
            <p className="mb-2">
              <strong>Student Privacy:</strong> Your children can post anonymously to support each other through challenges. 
              Posts are completely anonymous with no identifying information.
            </p>
            <p>
              <strong>Safety Protocols:</strong> Our AI system flags concerning content and routes it to school staff for review. 
              Teachers and administrators review flagged posts and make decisions about appropriate interventions to ensure student safety.
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
          <TabsList className="flex w-full flex-wrap justify-center gap-1 h-auto p-1 bg-transparent">
            <TabsTrigger value="overview" className="flex-1 min-w-fit px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:shadow-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 min-w-fit px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 data-[state=active]:bg-purple-700 data-[state=active]:shadow-lg">
              Activity
            </TabsTrigger>
            <TabsTrigger value="service-hours" className="flex-1 min-w-fit px-3 py-2 bg-teal-600 text-white hover:bg-teal-700 data-[state=active]:bg-teal-700 data-[state=active]:shadow-lg">
              <Shield className="h-3 w-3 mr-1" />
              Service
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1 min-w-fit px-3 py-2 bg-amber-600 text-white hover:bg-amber-700 data-[state=active]:bg-amber-700 data-[state=active]:shadow-lg">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-1 min-w-fit px-3 py-2 bg-rose-600 text-white hover:bg-rose-700 data-[state=active]:bg-rose-700 data-[state=active]:shadow-lg">
              <HelpCircle className="h-3 w-3 mr-1" />
              FAQ
            </TabsTrigger>
            {featureFlags.fundraising && (
              <TabsTrigger value="fundraising" className="flex-1 min-w-fit px-3 py-2 bg-green-600 text-white hover:bg-green-700 data-[state=active]:bg-green-700 data-[state=active]:shadow-lg">
                <Target className="h-3 w-3 mr-1" />
                Fundraising
              </TabsTrigger>
            )}
            {featureFlags.aiWellness && (
              <TabsTrigger value="insights" className="flex-1 min-w-fit px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 data-[state=active]:bg-indigo-700 data-[state=active]:shadow-lg">
                Insights
              </TabsTrigger>
            )}
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
                        {currentStats.totalKindnessActs}
                      </p>
                      <p className="text-xs text-green-600">+{currentStats.weeklyKindnessActs} this week</p>
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
                        {currentStats.currentStreak} days
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
                        ${currentStats.parentRewardsEarned}
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
                        #{currentStats.familyRanking}
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
                    <span className="text-sm font-medium">{currentStats.weeklyKindnessActs}/20 acts</span>
                  </div>
                  <Progress value={(currentStats.weeklyKindnessActs / 20) * 100} className="h-3" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {20 - currentStats.weeklyKindnessActs} more to reach your family goal!
                    </span>
                    <span className="text-green-600 font-medium">
                      +${Math.floor((currentStats.weeklyKindnessActs / 20) * 50)} parent bonus earned
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Starters */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    💬 Conversation Starters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={getNewConversationStarter}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                    data-testid="button-new-conversation-starter"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-indigo-700 dark:text-indigo-300">
                  Start meaningful conversations about character development with your children
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{conversationStarters[currentStarterIndex].icon}</span>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300">
                      {conversationStarters[currentStarterIndex].category}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-4 leading-relaxed">
                    "{conversationStarters[currentStarterIndex].question}"
                  </p>
                  <Alert className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <AlertTitle className="text-indigo-900 dark:text-indigo-100">Parent Tip</AlertTitle>
                    <AlertDescription className="text-indigo-700 dark:text-indigo-300">
                      {conversationStarters[currentStarterIndex].tip}
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Question {currentStarterIndex + 1} of {conversationStarters.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getNewConversationStarter}
                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                    data-testid="button-next-conversation-starter"
                  >
                    Next Question
                    <RefreshCw className="h-3 w-3 ml-2" />
                  </Button>
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
                <Badge variant="outline">
                  {mockActivities.filter(activity => selectedStudent === '' || activity.studentUserId === selectedStudent).length} activities this week
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockActivities
                .filter(activity => selectedStudent === '' || activity.studentUserId === selectedStudent)
                .map((activity) => (
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

          {/* Dual Rewards Tab */}
          <TabsContent value="rewards">
            <RewardsSection currentStats={currentStats} />
          </TabsContent>

          {/* Service Hours Tab - NEW FEATURE! */}
          <TabsContent value="service-hours">
            <ServiceHoursSection />
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rose-600" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions about EchoDeed and how to support your child's character development journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I know if my child's service hours are verified?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300">
                        Service hours appear in the "Service" tab with clear verification status badges:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                        <li><strong className="text-green-600">Verified ✓</strong> - Teacher has approved the hours with photo evidence</li>
                        <li><strong className="text-orange-600">Pending Review</strong> - Awaiting teacher verification</li>
                        <li><strong className="text-gray-600">Rejected</strong> - Hours need correction or re-submission</li>
                      </ul>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        You'll receive instant push notifications when hours are verified!
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>What are Echo Tokens and how do children earn them?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Echo Tokens are the currency of kindness in EchoDeed. Children earn tokens for:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Posting anonymous acts of kindness (10-50 tokens based on impact)</li>
                        <li>Completing verified community service hours (100 tokens per hour)</li>
                        <li>Maintaining daily kindness streaks (bonus tokens)</li>
                        <li>Receiving "hearts" from peers on their posts</li>
                      </ul>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Tokens can be redeemed for rewards at 20+ local Greensboro partners!
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>How does the dual reward system work for parents?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Revolutionary concept:</strong> When your children earn rewards, YOU earn rewards too!
                      </p>
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg mt-3">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          <li>Child redeems a reward → You receive a matching parent reward</li>
                          <li>Example: Child gets free Cook Out meal → You get Starbucks coffee</li>
                          <li>Both rewards funded by local business sponsors</li>
                          <li>Zero cost to families - 100% sponsor-funded</li>
                        </ul>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Check the "Rewards" tab to see available dual reward offers!
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Is my child's activity truly anonymous?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Yes - complete anonymity is guaranteed:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Kindness posts never show student names or identifiable information</li>
                        <li>Only parents and teachers can see which specific child posted what</li>
                        <li>Other students only see anonymous posts in the community feed</li>
                        <li>FERPA compliant - no personal data shared without consent</li>
                      </ul>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        You can view YOUR children's posts in the "Activity" tab, but they remain anonymous to other families.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I set up notifications for my child's achievements?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Instant push notifications keep you connected:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Scroll to the "Overview" tab notification setup card</li>
                        <li>Click "Enable Push Notifications" button</li>
                        <li>Allow browser notifications when prompted</li>
                        <li>You're all set! You'll receive instant alerts for:
                          <ul className="list-disc list-inside ml-6 mt-1">
                            <li>New kindness posts from your children</li>
                            <li>Service hours verified by teachers</li>
                            <li>Milestones & achievements unlocked</li>
                            <li>Rewards earned & available for redemption</li>
                          </ul>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>What rewards can my children redeem?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>20+ local Greensboro partners offer rewards:</strong>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                          <p className="font-semibold text-orange-900 dark:text-orange-100">🍔 Food & Treats</p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Cook Out, Chick-fil-A, Dave's Hot Chicken, Dames Chicken & Waffles, Yum Yum Ice Cream</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <p className="font-semibold text-purple-900 dark:text-purple-100">🎮 Entertainment</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">Boxcar Bar + Arcade, Red Cinemas, Triad Lanes, Urban Air Trampoline Park</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="font-semibold text-blue-900 dark:text-blue-100">🎓 Education</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Barnes & Noble, Greensboro Public Library, Scholastic Books</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="font-semibold text-green-900 dark:text-green-100">🏃 Activities</p>
                          <p className="text-sm text-green-700 dark:text-green-300">Greensboro Science Center, YMCA, Greensboro Grasshoppers games</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>How does the streak system work?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Streaks encourage daily kindness habits:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li><strong>Daily Goal:</strong> Post at least one act of kindness per day</li>
                        <li><strong>Streak Bonus:</strong> Earn extra tokens for consecutive days (10-100 bonus tokens)</li>
                        <li><strong>Streak Shield:</strong> One "sick day" allowed per week without losing streak</li>
                        <li><strong>Family Streak:</strong> When all children maintain streaks, family ranking multiplier activates</li>
                      </ul>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Visible in the "Overview" tab - help your children stay motivated! 🔥
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>How do I track multiple children?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Easy multi-child management:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Look for the student selector cards above the main tabs</li>
                        <li>Click on any child's card to view their individual stats</li>
                        <li>Click "Family Overview" to see combined family totals</li>
                        <li>All tabs (Activity, Service, Rewards) filter based on your selection</li>
                      </ol>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Each child's data stays separate but contributes to your family ranking!
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger>What happens if my child posts inappropriate content?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Multi-layer safety system protects students:</strong>
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-3">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Pre-Screening:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                          <li>Filters profanity and negative keywords before posting</li>
                          <li>Flags concerning content for teacher review queue</li>
                          <li>Blocks posts with bullying or harmful language</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Teacher Moderation:</p>
                        <ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                          <li>All flagged posts reviewed by licensed educators</li>
                          <li>Teachers contact parents directly about concerns</li>
                          <li>Content removed if inappropriate</li>
                          <li>Student receives character education guidance</li>
                        </ul>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        You'll be notified immediately if any concerning content is flagged from your child.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>How do I contact teachers or administrators?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Direct communication channels:</strong>
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Your Child's Teacher</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Contact via Eastern Guilford High School main office: (336) 449-4521
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Principal Dr. Darrell Harris</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Character education program lead - Available via school office
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">EchoDeed Support</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Technical issues or platform questions - Contact through school administration
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Fundraising Tab */}
          {featureFlags.fundraising && (
            <TabsContent value="fundraising">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  🎯 Dudley High School Campaigns
                </CardTitle>
                <CardDescription>
                  Support your school's fundraising goals and earn double tokens for donations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/10">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-900 dark:text-purple-100">
                    ⚡ Double Token Rewards Active!
                  </AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-200">
                    All donations to school fundraising campaigns earn 2x tokens as part of our dual reward system.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  {/* Playground Campaign */}
                  <Card className="border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🏰 New Playground Fund</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Help us build a new playground for our students! Every donation earns DOUBLE tokens for your family.</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress toward $20,000 goal</span>
                          <span className="text-green-600 font-medium">58% complete</span>
                        </div>
                        <Progress value={58} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>$11,600 raised</span>
                          <span>$8,400 remaining</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-purple-600 hover:bg-purple-700" size="sm" data-testid="button-donate-playground">
                          <Heart className="h-4 w-4 mr-2" />
                          Donate $5 (10 tokens)
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" data-testid="button-donate-playground-10">
                          Donate $10 (20 tokens)
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" data-testid="button-donate-playground-25">
                          Donate $25 (50 tokens)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Library Books Campaign */}
                  <Card className="border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📚 New Library Equipment</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Expanding our library with new books and technology for middle school students</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress toward $15,000 goal</span>
                          <span className="text-blue-600 font-medium">34% complete</span>
                        </div>
                        <Progress value={34} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>$5,100 raised</span>
                          <span>$9,900 remaining</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700" size="sm" data-testid="button-donate-library">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Donate $5 (10 tokens)
                        </Button>
                        <Button className="bg-sky-600 hover:bg-sky-700 text-white" size="sm" data-testid="button-donate-library-10">
                          Donate $10 (20 tokens)
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" data-testid="button-donate-library-25">
                          Donate $25 (50 tokens)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🏫 Why Support School Fundraising?</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-200 mb-4">
                        Your donations directly improve the learning environment for Emma and all students at Dudley High School.
                        Plus, you earn double tokens that can be redeemed for family rewards!
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="text-center">
                          <div className="text-purple-600 font-bold">💝 Direct Impact</div>
                          <div className="text-purple-600">Every dollar goes to your child's school</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-600 font-bold">⚡ Double Rewards</div>
                          <div className="text-purple-600">2x tokens for family rewards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-600 font-bold">🏆 School Pride</div>
                          <div className="text-purple-600">Building stronger community</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Insights Tab */}
          {featureFlags.aiWellness && (
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
          )}
        </Tabs>
      </div>
      
      {/* Bottom Navigation for Parents */}
      <BottomNavigation 
        activeTab={activeBottomTab} 
        onTabChange={handleBottomTabChange} 
      />
    </div>
  );
}