import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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
  Sparkles,
  ChevronRight,
  Play,
  Lightbulb,
  GraduationCap,
  X
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
  content?: any;
};

const trainingContent: Record<string, {
  lessons: { title: string; content: string; activity?: string }[];
  quiz: { question: string; options: string[]; correct: number }[];
  reflection: string;
}> = {
  'Welcome to Kindness Mentoring': {
    lessons: [
      {
        title: 'What is Kindness Mentoring?',
        content: 'As a Kindness Mentor, you help younger students discover the joy of spreading kindness. You\'re not just teaching - you\'re inspiring! Your role is to guide, support, and celebrate their kindness journey.',
        activity: 'Think about a time someone showed you kindness. How did it make you feel?'
      },
      {
        title: 'The Four Pillars of Mentoring',
        content: '1. GUIDE, don\'t direct - Ask questions that help mentees think for themselves\n2. LISTEN actively - Pay full attention to their ideas and feelings\n3. ENCOURAGE creativity - Support their unique kindness ideas\n4. CELEBRATE progress - Recognize every act of kindness, big or small',
        activity: 'Practice asking "What do you think would help?" instead of giving direct answers.'
      },
      {
        title: 'Being a Role Model',
        content: 'Your mentee will look up to you! Show kindness in your own actions, be patient when things don\'t go perfectly, and always speak positively about others.',
      }
    ],
    quiz: [
      {
        question: 'What should you do when your mentee has a kindness idea?',
        options: ['Tell them your better idea', 'Support and encourage their idea', 'Ignore it and move on', 'Say it won\'t work'],
        correct: 1
      },
      {
        question: 'Which is the BEST way to help a mentee?',
        options: ['Do everything for them', 'Ask questions that help them think', 'Give them all the answers', 'Tell them what to do'],
        correct: 1
      }
    ],
    reflection: 'What quality do you think makes the best mentor? How will you use that quality with your mentee?'
  },
  'Building Trust and Connection': {
    lessons: [
      {
        title: 'Why Trust Matters',
        content: 'Trust is the foundation of any great mentoring relationship. When your mentee trusts you, they\'ll feel safe to share ideas, try new things, and even make mistakes.',
        activity: 'Remember a teacher or coach you really trusted. What did they do to earn that trust?'
      },
      {
        title: 'Building Connection',
        content: 'Use these trust-building strategies:\n• Use their name frequently - it shows you care\n• Show genuine interest in their world - ask about their hobbies and friends\n• Share appropriate experiences from your own life first\n• Be reliable and consistent - always keep your promises',
        activity: 'Practice introducing yourself and finding 3 things in common with someone new.'
      },
      {
        title: 'Active Listening Skills',
        content: 'Active listening means giving your full attention. Put away distractions, make eye contact, nod to show understanding, and ask follow-up questions. Never interrupt!',
        activity: 'Try the 2-minute challenge: Listen to a friend for 2 minutes without interrupting, then summarize what they said.'
      },
      {
        title: 'When Things Get Hard',
        content: 'Sometimes mentees feel shy, frustrated, or don\'t want to participate. That\'s okay! Stay patient, offer encouragement, and remember that building trust takes time.',
      }
    ],
    quiz: [
      {
        question: 'What helps build trust with your mentee?',
        options: ['Being unreliable', 'Using their name and showing interest', 'Talking about yourself the whole time', 'Looking at your phone while they talk'],
        correct: 1
      },
      {
        question: 'What should you do if your mentee is shy?',
        options: ['Force them to talk', 'Get frustrated', 'Be patient and encouraging', 'Give up on them'],
        correct: 2
      }
    ],
    reflection: 'Think of a time you felt really listened to. How will you create that feeling for your mentee?'
  },
  'Inspiring Kindness Creativity': {
    lessons: [
      {
        title: 'The SPARK Framework',
        content: 'Use SPARK to help mentees discover their unique kindness style:\n\nS - Strengths: Connect kindness to what they\'re already good at\nP - Problem-solving: Turn their concerns into kindness opportunities\nA - Action-oriented: Move from ideas to reality with small steps\nR - Ripple effect: Help them see the broader impact of their kindness\nK - Keep sustainable: Make kindness a lasting habit, not just one-time',
        activity: 'Think of your own strengths. How could you use them to spread kindness?'
      },
      {
        title: 'Brainstorming Kindness Ideas',
        content: 'Great mentors help generate ideas! Try these techniques:\n• "What If" questions - "What if everyone in your class smiled at one new person today?"\n• Building on interests - If they love art, maybe they can make cards for lonely classmates\n• Small + consistent > Big + rare - Daily small kindnesses create bigger impact',
        activity: 'Generate 5 kindness ideas that a 4th grader could do in just 5 minutes.'
      },
      {
        title: 'Overcoming Obstacles',
        content: 'What happens when kindness gets rejected? Help your mentee understand that:\n• Not everyone will respond positively, and that\'s okay\n• The VALUE is in the intention and effort, not just the outcome\n• Every "no" brings them closer to a meaningful "yes"\n• Rejection is part of being brave enough to try',
        activity: 'Role-play: How would you respond if your mentee\'s kindness was ignored?'
      },
      {
        title: 'Celebrating Kindness Wins',
        content: 'Recognition fuels motivation! Celebrate every win:\n• High-fives and genuine praise\n• Share their success stories (with permission)\n• Help them see the impact they\'ve made\n• Encourage them to celebrate others too',
      },
      {
        title: 'Creating Kindness Ripples',
        content: 'One act of kindness creates ripples that spread far beyond what we can see. Help your mentee understand that their small actions can inspire others, change someone\'s day, or even start a kindness chain!',
        activity: 'Can you think of a time when one person\'s kindness inspired you to be kind to someone else?'
      }
    ],
    quiz: [
      {
        question: 'What does the "S" in SPARK stand for?',
        options: ['Sharing', 'Strengths', 'Smiling', 'Speaking'],
        correct: 1
      },
      {
        question: 'If your mentee\'s kindness gets rejected, what should you do?',
        options: ['Tell them to stop being kind', 'Help them understand the value was in trying', 'Ignore the situation', 'Be angry at the person who rejected them'],
        correct: 1
      },
      {
        question: 'What creates more impact over time?',
        options: ['One big random act of kindness', 'Many small consistent acts of kindness', 'Only being kind on holidays', 'Kindness only when others are watching'],
        correct: 1
      }
    ],
    reflection: 'What unique kindness "superpower" do you have? How will you help your mentee discover theirs?'
  }
};

export default function MentorDashboard() {
  const [selectedTab, setSelectedTab] = useState("training");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedTraining, setSelectedTraining] = useState<TrainingModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

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

  const startTrainingMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await apiRequest(`/api/mentor/training/${trainingId}/start`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/training'] });
    },
    onError: (error: any) => {
      console.error('Error starting training:', error);
    }
  });

  const completeTrainingMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await apiRequest(`/api/mentor/training/${trainingId}/complete`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/training'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      if (data.tokensAwarded > 0) {
        toast({
          title: "Training Completed!",
          description: `Congratulations! You earned ${data.tokensAwarded} tokens for completing this training module.`,
        });
      }
      closeTrainingModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to complete training. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startTraining = (module: TrainingModule) => {
    startTrainingMutation.mutate(module.id);
    setSelectedTraining(module);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers([]);
    setShowReflection(false);
    setIsCompleting(false);
    setQuizPassed(false);
  };

  const closeTrainingModal = () => {
    setSelectedTraining(null);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers([]);
    setShowReflection(false);
    setIsCompleting(false);
    setQuizPassed(false);
  };

  const handleNextLesson = () => {
    const content = selectedTraining ? trainingContent[selectedTraining.title] : null;
    if (!content) return;
    
    if (currentLessonIndex < content.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    const content = selectedTraining ? trainingContent[selectedTraining.title] : null;
    if (!content) return;
    
    const correctAnswers = quizAnswers.filter((answer, index) => 
      answer === content.quiz[index].correct
    ).length;
    
    if (correctAnswers >= content.quiz.length - 1) {
      setQuizPassed(true);
      setShowReflection(true);
      setShowQuiz(false);
    } else {
      toast({
        title: "Almost there!",
        description: "Let's review the lessons and try again. You need to get most questions right.",
        variant: "destructive"
      });
      setShowQuiz(false);
      setCurrentLessonIndex(0);
      setQuizAnswers([]);
      setQuizPassed(false);
    }
  };

  const handleCompleteTraining = async () => {
    if (!selectedTraining || !quizPassed) {
      toast({
        title: "Cannot Complete",
        description: "Please pass the quiz first before completing the training.",
        variant: "destructive"
      });
      return;
    }
    setIsCompleting(true);
    completeTrainingMutation.mutate(selectedTraining.id);
  };

  if (statsLoading || mentorshipsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:pl-24">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:pl-24">
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
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-purple-500"
                            onClick={() => startTraining(module)}
                            data-testid={`start-training-${module.id}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
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

      {/* Training Modal */}
      <Dialog open={selectedTraining !== null} onOpenChange={(open) => !open && closeTrainingModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTraining && trainingContent[selectedTraining.title] && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  {selectedTraining.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedTraining.durationMinutes} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {selectedTraining.certificateReward} tokens
                  </span>
                  {selectedTraining.isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {showReflection ? 'Final Reflection' : showQuiz ? 'Quiz Time' : `Lesson ${currentLessonIndex + 1} of ${trainingContent[selectedTraining.title].lessons.length}`}
                  </span>
                </div>
                <Progress 
                  value={
                    showReflection ? 100 : 
                    showQuiz ? 80 : 
                    ((currentLessonIndex + 1) / trainingContent[selectedTraining.title].lessons.length) * 70
                  } 
                  className="h-2" 
                />
              </div>

              {/* Lesson Content */}
              {!showQuiz && !showReflection && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {trainingContent[selectedTraining.title].lessons[currentLessonIndex].title}
                    </h3>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {trainingContent[selectedTraining.title].lessons[currentLessonIndex].content}
                    </div>
                  </div>

                  {trainingContent[selectedTraining.title].lessons[currentLessonIndex].activity && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Think About It</h4>
                          <p className="text-yellow-700">
                            {trainingContent[selectedTraining.title].lessons[currentLessonIndex].activity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentLessonIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextLesson}
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      {currentLessonIndex < trainingContent[selectedTraining.title].lessons.length - 1 
                        ? 'Next Lesson' 
                        : 'Take Quiz'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Quiz Section */}
              {showQuiz && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-purple-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Knowledge Check
                    </h3>
                    <p className="text-purple-700 text-sm">Answer these questions to show what you've learned!</p>
                  </div>

                  {trainingContent[selectedTraining.title].quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white border rounded-lg p-4">
                      <p className="font-semibold mb-3">{qIndex + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => handleQuizAnswer(qIndex, oIndex)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              quizAnswers[qIndex] === oIndex 
                                ? 'border-purple-500 bg-purple-50 text-purple-800' 
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => { setShowQuiz(false); setCurrentLessonIndex(trainingContent[selectedTraining.title].lessons.length - 1); }}
                    >
                      Review Lessons
                    </Button>
                    <Button 
                      onClick={handleSubmitQuiz}
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                      disabled={quizAnswers.length < trainingContent[selectedTraining.title].quiz.length}
                    >
                      Submit Answers
                    </Button>
                  </div>
                </div>
              )}

              {/* Reflection Section */}
              {showReflection && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5" />
                      Great job! Time for Reflection
                    </h3>
                    <p className="text-green-700 mb-4">
                      {trainingContent[selectedTraining.title].reflection}
                    </p>
                    <p className="text-green-600 text-sm italic">
                      Take a moment to think about this. Your personal insights will help you become an amazing mentor!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-6 text-center">
                    <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="font-bold text-xl text-yellow-800 mb-2">You're Ready!</h3>
                    <p className="text-yellow-700 mb-4">
                      Complete this training to earn <span className="font-bold">{selectedTraining.certificateReward} tokens</span> and unlock the next step in your mentoring journey!
                    </p>
                    <Button 
                      onClick={handleCompleteTraining}
                      disabled={isCompleting || completeTrainingMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 text-lg"
                    >
                      {isCompleting || completeTrainingMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Training
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}