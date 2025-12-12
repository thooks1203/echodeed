import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, MapPin, Users, Award, CheckCircle, Clock as Clock2, XCircle, Upload, Heart, Star, Sparkles, Trophy, Rocket, Compass, Map } from 'lucide-react';
import { ObjectUploader } from '@/components/ObjectUploader';
import { ServiceVerificationFormDownload } from '@/components/ServiceVerificationForm';
import { KindnessConnectModal } from '@/components/KindnessConnectModal';
import type { UploadResult } from '@uppy/core';

// ==========================================
// MIDDLE SCHOOL: Kindness Explorer Experience
// ==========================================
function MiddleSchoolKindnessExplorer({ onBack }: { onBack?: () => void }) {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fun quest categories for middle schoolers
  const kindnessQuests = [
    {
      id: 'helper-hero',
      title: '🦸 Helper Hero',
      description: 'Help someone in your school or neighborhood today!',
      examples: ['Help a classmate with homework', 'Hold the door for someone', 'Help clean up after lunch'],
      tokens: 10,
      color: 'from-blue-400 to-cyan-400',
      icon: '💪'
    },
    {
      id: 'eco-warrior',
      title: '🌱 Eco Warrior',
      description: 'Do something good for the planet!',
      examples: ['Pick up litter at recess', 'Start a recycling habit', 'Plant something'],
      tokens: 15,
      color: 'from-green-400 to-emerald-400',
      icon: '🌍'
    },
    {
      id: 'friendship-builder',
      title: '🤝 Friendship Builder',
      description: 'Make someone feel included and valued!',
      examples: ['Invite someone new to sit with you', 'Write a thank-you note', 'Give a genuine compliment'],
      tokens: 10,
      color: 'from-pink-400 to-rose-400',
      icon: '💝'
    },
    {
      id: 'community-champion',
      title: '🏆 Community Champion',
      description: 'Help make your community better!',
      examples: ['Volunteer with family', 'Donate toys or books', 'Visit someone who needs company'],
      tokens: 25,
      color: 'from-purple-400 to-violet-400',
      icon: '🌟'
    },
    {
      id: 'creative-kindness',
      title: '🎨 Creative Kindness',
      description: 'Use your talents to spread joy!',
      examples: ['Make cards for seniors', 'Perform for family', 'Create artwork to donate'],
      tokens: 20,
      color: 'from-orange-400 to-amber-400',
      icon: '✨'
    },
    {
      id: 'animal-friend',
      title: '🐾 Animal Friend',
      description: 'Show kindness to our furry friends!',
      examples: ['Help at an animal shelter', 'Make bird feeders', 'Care for a pet'],
      tokens: 15,
      color: 'from-teal-400 to-cyan-400',
      icon: '🐕'
    }
  ];

  // Explorer badges (achievements)
  const explorerBadges = [
    { id: 'first-quest', name: 'First Quest!', description: 'Complete your first kindness quest', icon: '🌟', earned: true },
    { id: 'week-warrior', name: 'Week Warrior', description: 'Complete quests 5 days in a row', icon: '🔥', earned: true },
    { id: 'helper-10', name: 'Super Helper', description: 'Help 10 people', icon: '🦸', earned: false },
    { id: 'eco-5', name: 'Planet Protector', description: 'Complete 5 eco quests', icon: '🌍', earned: false },
    { id: 'friend-maker', name: 'Friend Maker', description: 'Include 5 new people', icon: '👋', earned: true },
    { id: 'kindness-100', name: 'Kindness Legend', description: 'Earn 100 Echo Tokens', icon: '👑', earned: false }
  ];

  return (
    <div className="space-y-6 p-6 md:pl-24" data-testid="kindness-explorer-page">
      {/* Fun Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <BackButton 
              onClick={onBack} 
              label="Back"
              variant="minimal"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="h-7 w-7 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Kindness Explorer
              </span>
            </h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Discover fun ways to spread kindness in your world!
            </p>
          </div>
        </div>
      </div>

      {/* Explorer Stats Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-6 text-white">
        <div className="absolute top-0 right-0 opacity-20">
          <Map className="h-32 w-32 -rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-xl font-bold">Your Adventure Map</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">💎</div>
              <div className="text-2xl font-bold">47</div>
              <div className="text-xs opacity-90">Echo Tokens</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">🎯</div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs opacity-90">Quests Done</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">🏅</div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs opacity-90">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Featured Quest */}
      <Card className="border-2 border-dashed border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🌟</span>
            <CardTitle className="text-lg text-orange-600">Today's Special Quest!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-3">
            <strong>Operation Smile:</strong> Give 3 genuine compliments to classmates, teachers, or family members today!
          </p>
          <div className="flex items-center justify-between">
            <Badge className="bg-yellow-400 text-yellow-900">+15 Echo Tokens!</Badge>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              data-testid="button-start-special-quest"
            >
              <Rocket className="h-4 w-4 mr-1" /> Accept Quest!
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quest Categories */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Choose Your Kindness Quest
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kindnessQuests.map((quest) => (
            <Card 
              key={quest.id}
              className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                selectedQuest === quest.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedQuest(quest.id)}
              data-testid={`quest-card-${quest.id}`}
            >
              <CardContent className="p-4">
                <div className={`h-2 rounded-full bg-gradient-to-r ${quest.color} mb-3`} />
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-base">{quest.title}</h4>
                  <span className="text-2xl">{quest.icon}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                <div className="space-y-1 mb-3">
                  {quest.examples.map((example, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-green-500">✓</span> {example}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                    💎 {quest.tokens} tokens
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    data-testid={`button-start-quest-${quest.id}`}
                  >
                    Start Quest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Explorer Badges Collection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Your Badge Collection</CardTitle>
          </div>
          <CardDescription>Complete quests to unlock awesome badges!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {explorerBadges.map((badge) => (
              <div 
                key={badge.id}
                className={`text-center p-3 rounded-xl transition-all ${
                  badge.earned 
                    ? 'bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-300' 
                    : 'bg-gray-100 opacity-50 grayscale'
                }`}
                data-testid={`badge-${badge.id}`}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <p className="text-xs font-semibold">{badge.name}</p>
                {badge.earned && (
                  <Badge className="mt-1 bg-green-500 text-white text-xs py-0">Earned!</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fun Kindness Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <CardTitle className="text-purple-700">Kindness Explorer Tips!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold text-sm">Start Small</p>
                <p className="text-xs text-gray-600">Even a smile counts as kindness! Every little act matters.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
              <span className="text-2xl">📸</span>
              <div>
                <p className="font-semibold text-sm">Capture Moments</p>
                <p className="text-xs text-gray-600">Ask a parent to help you take photos of your kindness adventures!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
              <span className="text-2xl">👨‍👩‍👧</span>
              <div>
                <p className="font-semibold text-sm">Family Quests</p>
                <p className="text-xs text-gray-600">Invite your family to join kindness quests with you!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
              <span className="text-2xl">✍️</span>
              <div>
                <p className="font-semibold text-sm">Tell Your Story</p>
                <p className="text-xs text-gray-600">Share how your kindness made someone feel!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Community Service interfaces
interface ServiceLog {
  id: string;
  userId: string;
  schoolId?: string;
  serviceName: string;
  serviceDescription: string;
  organizationName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  hoursLogged: string;
  serviceDate: string;
  location?: string;
  category: string;
  studentReflection: string;
  verificationPhotoUrl?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  tokensEarned: number;
  parentNotified: boolean;
  createdAt: string;
  updatedAt?: string;
  // v2.1 IPARD fields
  ipardPhase?: 'investigation' | 'preparation' | 'action' | 'reflection' | 'demonstration' | 'complete';
  approvalFormSubmitted?: boolean;
  approvalFormSubmittedAt?: string;
  reflectionQualityApproved?: boolean;
  reflectionApprovedAt?: string;
  demonstrationCompleted?: boolean;
  demonstrationUrl?: string;
  demonstrationCompletedAt?: string;
  ipardBonusTokensEarned?: number;
}

interface ServiceSummary {
  id: string;
  userId: string;
  schoolId?: string;
  totalHours: string;
  verifiedHours: string;
  pendingHours: string;
  rejectedHours?: string;
  totalTokensEarned: number;
  totalServiceSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastServiceDate?: string;
  lastUpdated?: string;
  createdAt?: string;
}

interface CommunityServiceProps {
  onBack?: () => void;
}

// Form validation schema
const serviceLogSchema = z.object({
  serviceName: z.string().min(3, 'Service name must be at least 3 characters'),
  serviceDescription: z.string().min(10, 'Please provide a detailed description (at least 10 characters)'),
  organizationName: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  hoursLogged: z.number().min(0.5, 'Minimum 0.5 hours required').max(24, 'Cannot exceed 24 hours per day'),
  serviceDate: z.string().min(1, 'Service date is required'),
  location: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  studentReflection: z.string().min(20, 'Reflection must be at least 20 characters'),
  verificationPhotoUrl: z.string().optional()
});

type ServiceLogForm = z.infer<typeof serviceLogSchema>;

export function CommunityService({ onBack }: CommunityServiceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isKindnessConnectOpen, setIsKindnessConnectOpen] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedTraitIds, setSelectedTraitIds] = useState<string[]>([]);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get school level to determine which experience to show
  const { schoolLevel, isLoading: isLoadingSchoolLevel } = useSchoolLevel();
  const isMiddleSchool = schoolLevel === 'middle_school';

  // Use authenticated user ID
  const userId = user?.id;
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS (React Rules of Hooks)
  
  // Form setup - always initialize
  const form = useForm<ServiceLogForm>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      serviceName: '',
      serviceDescription: '',
      organizationName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      hoursLogged: 2,
      serviceDate: new Date().toISOString().split('T')[0],
      location: '',
      category: '',
      studentReflection: '',
      verificationPhotoUrl: ''
    }
  });

  // Get student's service summary - only fetch if we have a userId (HS experience)
  const { data: summary, isLoading: summaryLoading, isPending: summaryPending } = useQuery<ServiceSummary>({
    queryKey: ['/api/community-service/summary', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/community-service/summary/${userId}`);
      return response.json();
    },
    enabled: !!userId && !isMiddleSchool && !isLoadingSchoolLevel
  });

  // Get student's service log history
  const { data: logs = [], isLoading: logsLoading } = useQuery<ServiceLog[]>({
    queryKey: ['/api/community-service/logs', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/community-service/logs/${userId}`);
      return response.json();
    },
    enabled: !!userId && !isMiddleSchool
  });

  // Get reflection skills and traits for tagging
  const { data: skillsAndTraits, isLoading: skillsTraitsLoading } = useQuery<{
    skills: Array<{ id: string; skillName: string; description: string }>;
    traits: Array<{ id: string; traitName: string; description: string }>;
  }>({
    queryKey: ['/api/reflection/skills-and-traits'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/reflection/skills-and-traits');
      return response.json();
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && !isMiddleSchool
  });

  // Submit service hours mutation - must be called before conditional returns
  const submitServiceMutation = useMutation({
    mutationFn: async (data: ServiceLogForm) => {
      return await apiRequest('POST', '/api/community-service/log', {
        ...data,
        userId,
        schoolId: user?.schoolId || 'bc016cad-fa89-44fb-aab0-76f82c574f78', // Use user's school, fallback to Eastern Guilford HS
        serviceDate: new Date(data.serviceDate)
      });
    },
    onSuccess: async (createdLog: any) => {
      // Tag reflections if any skills or traits were selected
      if (selectedSkillIds.length > 0 || selectedTraitIds.length > 0) {
        try {
          await apiRequest('POST', `/api/community-service/${createdLog.id}/tag-reflections`, {
            skillIds: selectedSkillIds,
            traitIds: selectedTraitIds
          });
          console.log(`Tagged service log with ${selectedSkillIds.length} skills and ${selectedTraitIds.length} traits`);
        } catch (error) {
          console.error('Failed to tag reflections:', error);
        }
      }

      toast({
        title: '✅ Service Hours Logged!',
        description: 'Your community service has been submitted for verification. You\'ll receive tokens once approved.',
      });
      form.reset();
      setSelectedSkillIds([]);
      setSelectedTraitIds([]);
      // Invalidate community service queries
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/summary', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/community-service/logs', userId] });
      // Invalidate token balance and rewards data
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/offers/all/all'] });
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({
        title: '❌ Submission Failed',
        description: error.message || 'Failed to submit service hours. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: ServiceLogForm) => {
    submitServiceMutation.mutate(data);
  };
  
  // NOW we can do conditional returns after all hooks are called
  
  // Don't render if no user is authenticated
  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">Please log in to access community service features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show loading while school level is still being determined
  if (isLoadingSchoolLevel) {
    return (
      <div className="space-y-6 p-6 md:pl-24">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading service dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // MIDDLE SCHOOL: Show fun Kindness Explorer instead of formal Service Hours
  if (isMiddleSchool) {
    return <MiddleSchoolKindnessExplorer onBack={onBack} />;
  }

  // Service categories
  const categories = [
    'Education & Tutoring',
    'Environment & Conservation', 
    'Healthcare & Medicine',
    'Community Development',
    'Senior Care',
    'Animal Welfare',
    'Homeless & Food Services',
    'Youth Programs',
    'Religious Organizations',
    'Arts & Culture',
    'Special Events',
    'Other'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock2 className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Get IPARD phase display information
  const getIpardPhaseInfo = (phase?: string) => {
    switch (phase) {
      case 'investigation':
        return { label: 'Investigation', color: 'bg-blue-100 text-blue-800', icon: '🔍' };
      case 'preparation':
        return { label: 'Preparation', color: 'bg-indigo-100 text-indigo-800', icon: '📋' };
      case 'action':
        return { label: 'Action', color: 'bg-purple-100 text-purple-800', icon: '💪' };
      case 'reflection':
        return { label: 'Reflection', color: 'bg-pink-100 text-pink-800', icon: '💭' };
      case 'demonstration':
        return { label: 'Demonstration', color: 'bg-orange-100 text-orange-800', icon: '🎬' };
      case 'complete':
        return { label: 'Complete', color: 'bg-green-100 text-green-800', icon: '✅' };
      default:
        return { label: 'Investigation', color: 'bg-gray-100 text-gray-800', icon: '🔍' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // DEBUG: Log component state for troubleshooting
  console.log('🔧 CommunityService render state:', {
    userId,
    isMiddleSchool,
    isLoadingSchoolLevel,
    summaryLoading,
    summaryPending,
    hasSummary: !!summary,
    summary: summary ? { verifiedHours: summary.verifiedHours, pendingHours: summary.pendingHours, totalTokensEarned: summary.totalTokensEarned } : null
  });

  // Wait for summary data if not middle school - check ALL loading states and missing data
  // This MUST happen BEFORE computing derived values to prevent crashes
  const isDataLoading = !isMiddleSchool && (summaryLoading || summaryPending || !summary);
  
  // If still loading, show loading state BEFORE computing any derived values
  if (isDataLoading) {
    console.log('🔧 CommunityService: showing loading state', { isMiddleSchool, summaryLoading, summaryPending, hasSummary: !!summary });
    return (
      <div className="space-y-6 p-6 md:pl-24">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading your service record...</p>
          </div>
        </div>
      </div>
    );
  }

  // Final safety check - ensure we have the data we need before rendering
  if (!summary) {
    console.warn('CommunityService: Summary is unexpectedly null/undefined after loading check');
    return (
      <div className="space-y-6 p-6 md:pl-24">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Preparing your service dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ONLY compute values AFTER we've confirmed we have valid summary data
  const goalHours = 30; // Dudley's 30-hour yearly requirement
  
  // Compute safe values with defensive defaults to prevent NaN/undefined crashes
  const hoursVerified = summary.verifiedHours ? parseFloat(String(summary.verifiedHours)) : 0;
  const hoursPending = summary.pendingHours ? parseFloat(String(summary.pendingHours)) : 0;
  const progressPercentage = goalHours > 0 ? (hoursVerified / goalHours) * 100 : 0;
  const tokensEarned = summary.totalTokensEarned ?? 0;
  
  // Ensure all computed values are valid numbers (not NaN)
  const safeHoursVerified = Number.isFinite(hoursVerified) ? hoursVerified : 0;
  const safeHoursPending = Number.isFinite(hoursPending) ? hoursPending : 0;
  const safeProgressPercentage = Number.isFinite(progressPercentage) ? progressPercentage : 0;
  const safeTokensEarned = Number.isFinite(tokensEarned) ? tokensEarned : 0;
  
  console.log('🔧 CommunityService: computed values', { safeHoursVerified, safeHoursPending, safeProgressPercentage, safeTokensEarned });

  // TEMPORARY: Simplified render to debug crash
  return (
    <div className="space-y-6 p-6 md:pl-24" data-testid="community-service-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <BackButton 
              onClick={onBack} 
              label="Back"
              variant="minimal"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">Service Hours</h1>
            <p className="text-muted-foreground">Track your service toward the 30+ hour yearly requirement</p>
          </div>
        </div>
      </div>

      {/* Simple stats display */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-hours-verified">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{safeHoursVerified}</div>
            <p className="text-xs text-muted-foreground">+{safeTokensEarned} tokens earned</p>
          </CardContent>
        </Card>

        <Card data-testid="card-hours-pending">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Pending</CardTitle>
            <Clock2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{safeHoursPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card data-testid="card-goal-progress">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(safeProgressPercentage)}%</div>
            <p className="text-xs text-muted-foreground">{safeHoursVerified} of {goalHours} hours</p>
          </CardContent>
        </Card>

        <Card data-testid="card-tokens-earned">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{safeTokensEarned}</div>
            <p className="text-xs text-muted-foreground">5 tokens per verified hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Full service dashboard temporarily simplified for debugging. 
            Your data: {safeHoursVerified} verified hours, {safeHoursPending} pending hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
