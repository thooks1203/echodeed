import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { LeftSidebar } from '@/components/LeftSidebar';
import { BackButton } from '@/components/BackButton';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { StudentNotificationPreferences } from '@/components/StudentNotificationPreferences';
import { SchoolRewardsView } from '@/components/SchoolRewardsView';
import { DemoSchoolLevelSwitcher } from '@/components/DemoSchoolLevelSwitcher';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { featureFlags } from '@shared/featureFlags';
import { Heart } from 'lucide-react';
import { HelpButton, helpContent } from '@/components/HelpButton';

interface StudentStats {
  totalKindnessPoints: number;
  weeklyProgress: number;
  monthlyGoal: number;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
}

interface StudentDashboardProps {
  onNavigateToTab?: (tab: string) => void;
  activeBottomTab?: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeEstimate: number;
  week: number;
  gradeLevel: string;
}

interface WeekTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
}

// Challenge reflection form schema
const challengeReflectionSchema = z.object({
  reflection: z.string().min(10, 'Reflection must be at least 10 characters').max(1000, 'Reflection must be less than 1000 characters')
});

type ChallengeReflectionForm = z.infer<typeof challengeReflectionSchema>;

function WeeklyChallengesView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current week theme
  const { data: currentWeek } = useQuery({
    queryKey: ['/api/school-year/current-week'],
    queryFn: () => fetch('/api/school-year/current-week').then(r => r.json())
  });

  // Determine grade level from user data
  const gradeLevel = user?.grade ? 
    (parseInt(user.grade) >= 6 && parseInt(user.grade) <= 8) ? '6-8' : '9-12'
    : '6-8'; // Default fallback

  // Fetch challenges based on user's grade level
  const { data: challenges, isLoading } = useQuery<WeeklyChallenge[]>({
    queryKey: ['/api/school-year/challenges', gradeLevel],
    queryFn: () => fetch(`/api/school-year/challenges/${gradeLevel}`).then(r => r.json())
  });

  // Mutation for completing challenges
  const completeMutation = useMutation({
    mutationFn: async ({ challengeId, reflection }: { challengeId: string; reflection: string }) => {
      const response = await apiRequest('POST', '/api/school-year/complete', {
        challengeId,
        studentReflection: reflection
        // userId no longer needed - server gets it from auth token
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Challenge Completed!',
        description: 'Your challenge submission has been sent for teacher approval.',
      });
      // Fixed cache invalidation to match API route pattern
      queryClient.invalidateQueries({ queryKey: ['/api/school-year/progress', user?.id] });
      // Also invalidate challenges and tokens so UI refreshes immediately
      queryClient.invalidateQueries({ queryKey: ['/api/school-year/challenges', gradeLevel] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete challenge.',
        variant: 'destructive',
      });
    },
  });

  // State for challenge completion dialog
  const [selectedChallenge, setSelectedChallenge] = useState<WeeklyChallenge | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCompleteChallenge = (challenge: WeeklyChallenge) => {
    setSelectedChallenge(challenge);
    setIsDialogOpen(true);
  };

  // Form for challenge reflection
  const form = useForm<ChallengeReflectionForm>({
    resolver: zodResolver(challengeReflectionSchema),
    defaultValues: {
      reflection: ''
    }
  });

  const handleSubmitReflection = (data: ChallengeReflectionForm) => {
    if (selectedChallenge && data.reflection.trim()) {
      completeMutation.mutate({ 
        challengeId: selectedChallenge.id, 
        reflection: data.reflection.trim() 
      });
      setIsDialogOpen(false);
      setSelectedChallenge(null);
      form.reset();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading challenges...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Current Week Theme */}
      {currentWeek && (
        <div style={{
          background: `linear-gradient(135deg, ${currentWeek.theme?.color || '#10B981'}, ${currentWeek.theme?.color || '#10B981'}CC)`,
          color: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            Week {currentWeek.week}: {currentWeek.theme?.theme}
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
            {currentWeek.theme?.description}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>
            Focus: {currentWeek.theme?.focus}
          </p>
        </div>
      )}

      {/* Challenges List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          🎯 This Week's Challenges
        </h3>
        
        {challenges && challenges.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', flex: 1 }}>
                    {challenge.title}
                  </h4>
                  <div style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: getDifficultyColor(challenge.difficulty),
                    color: 'white',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {challenge.difficulty}
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  {challenge.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <span>⚡ {challenge.points} points</span>
                    <span>⏱️ {challenge.timeEstimate} min</span>
                  </div>
                  
                  <button
                    onClick={() => handleCompleteChallenge(challenge)}
                    disabled={completeMutation.isPending}
                    style={{
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: completeMutation.isPending ? 0.7 : 1
                    }}
                    data-testid={`complete-challenge-${challenge.id}`}
                  >
                    {completeMutation.isPending ? 'Submitting...' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              No challenges available for this week yet.
            </p>
          </div>
        )}
      </div>

      {/* Challenge Completion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Complete Challenge</DialogTitle>
          </DialogHeader>
          {selectedChallenge && (
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm">{selectedChallenge.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{selectedChallenge.description}</p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitReflection)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reflection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Reflection *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe how you completed this challenge and what you learned..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-challenge-reflection"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedChallenge(null);
                        form.reset();
                      }}
                      data-testid="button-cancel-challenge"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={completeMutation.isPending}
                      data-testid="button-submit-challenge"
                    >
                      {completeMutation.isPending ? 'Submitting...' : 'Submit Challenge'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StudentDashboard({ onNavigateToTab, activeBottomTab = 'feed' }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'progress' | 'rewards' | 'settings'>('overview');

  // Fetch student's personal data from tokens endpoint
  const { data: userTokens } = useQuery({
    queryKey: ['/api/tokens'],
    queryFn: () => fetch('/api/tokens').then(r => r.json())
  });

  // Fetch student's personal data only (no access to other students' data)
  const { data: studentStats } = useQuery<StudentStats>({
    queryKey: ['/api/students/my-stats'],
    queryFn: () => {
      // Combine real token data with calculated stats
      const tokens = userTokens || { echoBalance: 0, streakDays: 0, longestStreak: 0 };
      return Promise.resolve({
        totalKindnessPoints: tokens.echoBalance || 245,
        weeklyProgress: 15, // Would be calculated from recent posts
        monthlyGoal: 50,
        completedChallenges: 8,
        currentStreak: tokens.streakDays || 0,
        longestStreak: tokens.longestStreak || 0
      });
    },
    enabled: !!userTokens // Only run after tokens are loaded
  });

  // Fetch service hours summary
  const { data: serviceHoursSummary } = useQuery({
    queryKey: ['/api/community-service/summary', user?.id],
    queryFn: async () => {
      const userId = user?.id || 'student-001'; // Fallback to demo user
      console.log('🔍 Fetching service hours for user:', userId);
      const response = await fetch(`/api/community-service/summary/${userId}`);
      const data = await response.json();
      console.log('📊 Service hours data:', data);
      return data;
    },
    enabled: true // Always enabled for demo
  });

  // Fetch school-level configuration (MS vs HS)
  const { schoolLevel, config: schoolConfig, isLoading: isLoadingConfig } = useSchoolLevel();
  
  // Determine if this is a middle school experience
  const isMiddleSchool = schoolLevel === 'middle_school';
  
  // Helper: Calculate service hour progress with safe division
  const calculateServiceProgress = (verifiedHours: string | number, goal: number): number => {
    if (!goal || goal === 0) return 0; // Avoid division by zero (e.g., MS diploma goal)
    const hours = typeof verifiedHours === 'string' ? parseFloat(verifiedHours) : verifiedHours;
    return Math.min(Math.round((hours / goal) * 100), 100);
  };

  const stats = studentStats || {
    totalKindnessPoints: 245,
    weeklyProgress: 15,
    monthlyGoal: 50,
    completedChallenges: 8,
    currentStreak: 5,
    longestStreak: 5
  };

  return (
    <div className="md:pl-24" style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header - Differentiated by school level */}
      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
        {/* Navigation Buttons */}
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onNavigateToTab ? onNavigateToTab('feed') : window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #10B981, #06B6D4)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            data-testid="button-back-to-feed"
          >
            <span style={{ fontSize: '18px' }}>🏠</span>
            <span>FEED</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
            data-testid="button-main-menu"
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>EXIT</span>
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '32px' }}>{isMiddleSchool ? '🌈' : '👨‍🎓'}</span>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: isMiddleSchool 
              ? 'linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)'
              : 'linear-gradient(135deg, #10B981, #06B6D4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            {isMiddleSchool ? 'My Kindness Adventure' : 'My Kindness Journey'}
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {isMiddleSchool 
            ? `Hey ${user?.name?.split(' ')[0] || 'Explorer'}! Ready for today's adventure? • Grade 7th`
            : `Welcome back, ${user?.name || 'Student'}! • Grade ${user?.grade || '10'}th`
          }
        </p>
      </div>

      {/* Student Profile Card - Differentiated by school level */}
      <div style={{
        background: isMiddleSchool
          ? 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)'
          : 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '24px',
        boxShadow: isMiddleSchool
          ? '0 4px 20px rgba(236, 72, 153, 0.3)'
          : '0 4px 12px rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {isMiddleSchool ? '✨' : '🌟'}
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
          {stats.totalKindnessPoints} {isMiddleSchool ? 'Echo Tokens' : 'Echo Tokens'}
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
          {isMiddleSchool 
            ? "You're a Kindness Superstar! Keep shining! 🌟"
            : "You're making a difference every day!"
          }
        </p>
      </div>

      {/* MS ONLY: Kindness Companion - A fun creature that grows with kindness */}
      {isMiddleSchool && (
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Sparkle background effects */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            fontSize: '20px',
            opacity: 0.6,
            animation: 'pulse 2s infinite'
          }}>✨</div>
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '20px',
            fontSize: '16px',
            opacity: 0.5
          }}>💫</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Kindness Companion creature */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #FDE68A, #FBBF24)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: stats.totalKindnessPoints >= 500 ? '50px' : stats.totalKindnessPoints >= 200 ? '45px' : '40px',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.3)'
            }}>
              {stats.totalKindnessPoints >= 1000 ? '🦋' : 
               stats.totalKindnessPoints >= 500 ? '🐣' : 
               stats.totalKindnessPoints >= 200 ? '🥚' : '🌱'}
            </div>
            
            <div style={{ flex: 1, color: 'white' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
                Your Kindness Companion
              </h3>
              <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, marginBottom: '8px' }}>
                {stats.totalKindnessPoints >= 1000 
                  ? "Sparkle has transformed into a beautiful butterfly! 🎉"
                  : stats.totalKindnessPoints >= 500 
                    ? "Sparkle hatched! Keep being kind to help them grow!"
                    : stats.totalKindnessPoints >= 200 
                      ? "Your egg is starting to glow! Almost ready to hatch!"
                      : "Plant your kindness seed and watch Sparkle grow!"
                }
              </p>
              {/* Progress to next evolution */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #FDE68A, #FBBF24)',
                  height: '100%',
                  width: `${Math.min(
                    stats.totalKindnessPoints >= 1000 ? 100 :
                    stats.totalKindnessPoints >= 500 ? ((stats.totalKindnessPoints - 500) / 500) * 100 :
                    stats.totalKindnessPoints >= 200 ? ((stats.totalKindnessPoints - 200) / 300) * 100 :
                    (stats.totalKindnessPoints / 200) * 100
                  , 100)}%`,
                  borderRadius: '10px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: 0, marginTop: '4px' }}>
                {stats.totalKindnessPoints >= 1000 
                  ? "Max level reached! You're amazing!"
                  : stats.totalKindnessPoints >= 500 
                    ? `${1000 - stats.totalKindnessPoints} tokens until butterfly transformation!`
                    : stats.totalKindnessPoints >= 200 
                      ? `${500 - stats.totalKindnessPoints} tokens until hatching!`
                      : `${200 - stats.totalKindnessPoints} tokens until your egg appears!`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kindness Connect Promotional Card - MS: Fun Adventures, HS: Service Opportunities */}
      <div style={{
        background: isMiddleSchool
          ? 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)'
          : 'linear-gradient(135deg, #EC4899 0%, #EF4444 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: isMiddleSchool
          ? '0 4px 12px rgba(6, 182, 212, 0.25)'
          : '0 4px 12px rgba(236, 72, 153, 0.25)',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>{isMiddleSchool ? '🗺️' : '💝'}</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '4px' }}>
              {isMiddleSchool 
                ? 'Kindness Adventures Await!'
                : 'Discover Kindness Connect'
              }
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
              {isMiddleSchool
                ? 'Explore fun ways to help your community!'
                : 'Find verified service opportunities in your community'
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab ? onNavigateToTab('community-service') : window.location.href = '/app?tab=community-service'}
          style={{
            width: '100%',
            background: 'white',
            color: isMiddleSchool ? '#06B6D4' : '#EC4899',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
          }}
          data-testid="button-kindness-connect-promo"
        >
          {isMiddleSchool 
            ? 'Discover Adventures 🚀'
            : 'Browse Service Opportunities →'
          }
        </button>
      </div>

      {/* MS: Kindness Quests | HS: Service Hours Action Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => onNavigateToTab ? onNavigateToTab('community-service') : window.location.href = '/app?tab=community-service'}
          style={{
            width: '100%',
            background: isMiddleSchool
              ? 'linear-gradient(135deg, #F59E0B, #EF4444, #EC4899)'
              : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: isMiddleSchool
              ? '0 8px 25px rgba(245, 158, 11, 0.3)'
              : '0 8px 25px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = isMiddleSchool
              ? '0 12px 30px rgba(245, 158, 11, 0.4)'
              : '0 12px 30px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = isMiddleSchool
              ? '0 8px 25px rgba(245, 158, 11, 0.3)'
              : '0 8px 25px rgba(139, 92, 246, 0.3)';
          }}
          data-testid="button-log-service-hours"
        >
          <span style={{ fontSize: '24px' }}>{isMiddleSchool ? '⚡' : '🏥'}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              {isMiddleSchool ? 'Start a Kindness Quest!' : 'Log Service Hours'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              {isMiddleSchool 
                ? 'Earn tokens by helping others!'
                : 'Track your community service activities'
              }
            </div>
          </div>
          <span style={{ fontSize: '20px', marginLeft: 'auto' }}>→</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: featureFlags.schoolYearChallenges ? '1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
        background: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          ...(featureFlags.schoolYearChallenges ? [{ id: 'challenges', label: '🎯 Challenges' }] : []),
          { id: 'rewards', label: '🎁 Rewards' },
          { id: 'progress', label: '📈 Progress' },
          { id: 'settings', label: '⚙️ Settings' }
        ].map((tab) => {
          // Permanent vibrant colors for each tab
          const tabColors = {
            overview: { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102, 126, 234, 0.4)' },
            challenges: { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', shadow: 'rgba(240, 147, 251, 0.4)' },
            rewards: { bg: 'linear-gradient(135deg, #8B5CF6, #EC4899)', shadow: 'rgba(139, 92, 246, 0.4)' },
            progress: { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', shadow: 'rgba(79, 172, 254, 0.4)' },
            settings: { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', shadow: 'rgba(67, 233, 123, 0.4)' }
          };
          
          const colors = tabColors[tab.id as keyof typeof tabColors] || { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102, 126, 234, 0.4)' };
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '2px solid white' : '2px solid transparent',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: colors.bg,
                color: 'white',
                opacity: activeTab === tab.id ? 1 : 0.7,
                boxShadow: activeTab === tab.id ? `0 4px 12px ${colors.shadow}` : 'none',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none'
              }}
              data-testid={`student-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Personal Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>
                {stats.weeklyProgress}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>This Week</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: stats.currentStreak >= 3 ? '2px solid #F59E0B' : 'none'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {stats.currentStreak >= 3 ? '🔥' : '⚡'} {stats.currentStreak}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Current Streak</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>
                🏆{stats.longestStreak}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Best Streak</div>
            </div>
          </div>

          {/* Monthly Progress */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                📅 Monthly Goal Progress
              </h3>
              <HelpButton content={helpContent.student.dashboard} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                {stats.weeklyProgress} / {stats.monthlyGoal} points
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {Math.round((stats.weeklyProgress / stats.monthlyGoal) * 100)}% complete
              </div>
            </div>
            <div style={{
              background: '#F3F4F6',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                height: '100%',
                width: `${Math.min((stats.weeklyProgress / stats.monthlyGoal) * 100, 100)}%`,
                borderRadius: '8px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Service Hours Reminder Card - shows if there are pending hours */}
          {serviceHoursSummary && serviceHoursSummary.pendingHours > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              color: 'white',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>⏳</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', margin: 0 }}>
                    Verification Pending
                  </h3>
                  <p style={{ fontSize: '13px', opacity: 0.95, marginBottom: '12px', margin: '6px 0 12px 0' }}>
                    You have <strong>{serviceHoursSummary.pendingHours} hours</strong> waiting for teacher verification. Upload your verification letter to speed up approval!
                  </p>
                  <button
                    onClick={() => onNavigateToTab ? onNavigateToTab('community-service') : window.location.href = '/app?tab=community-service'}
                    style={{
                      background: 'white',
                      color: '#F59E0B',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                    data-testid="button-upload-verification"
                  >
                    📸 Upload Verification →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Hours Summary */}
          {serviceHoursSummary && serviceHoursSummary.totalHours > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
              color: 'white'
            }}>
              {/* Service Hour Goal Section - Only shown for high school (required), hidden for middle school (optional) */}
              {!isLoadingConfig && schoolConfig && schoolConfig.annualServiceHoursGoal > 0 && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
                        {schoolConfig.features.serviceLearningDiploma 
                          ? '📜 Service-Learning Diploma Goal'
                          : '📚 Annual Service Goal'}
                      </h3>
                      <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                        {schoolConfig.features.serviceLearningDiploma 
                          ? '4-Year Requirement'
                          : `${schoolConfig.displayName} Explorer Track`}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigateToTab ? onNavigateToTab('community-service') : window.location.href = '/app?tab=community-service'}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                      data-testid="button-view-all-hours"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {/* Progress toward goal (diploma for HS, annual for MS) */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>
                      {parseFloat(serviceHoursSummary.verifiedHours || '0')} / {schoolConfig.features.serviceLearningDiploma ? schoolConfig.diplomaServiceHoursGoal : schoolConfig.annualServiceHoursGoal} hours
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>
                      {calculateServiceProgress(
                        serviceHoursSummary.verifiedHours || '0',
                        schoolConfig.features.serviceLearningDiploma 
                          ? schoolConfig.diplomaServiceHoursGoal 
                          : schoolConfig.annualServiceHoursGoal
                      )}% Complete
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    height: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'white',
                      height: '100%',
                      width: `${calculateServiceProgress(
                        serviceHoursSummary.verifiedHours || '0',
                        schoolConfig.features.serviceLearningDiploma 
                          ? schoolConfig.diplomaServiceHoursGoal 
                          : schoolConfig.annualServiceHoursGoal
                      )}%`,
                      borderRadius: '8px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
              
              {/* Loading state - avoid flashing stale data */}
              {isLoadingConfig && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', opacity: 0.7 }}>
                  <p style={{ fontSize: '14px', margin: 0 }}>Loading service goals...</p>
                </div>
              )}

              {/* Current Hours Breakdown */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, opacity: 0.9 }}>
                  Current Status
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>
                    {serviceHoursSummary.totalHours}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>Total Hours</div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>
                    {serviceHoursSummary.verifiedHours}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>Verified</div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>
                    {serviceHoursSummary.pendingHours}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* My Legacy Impact Section - v2.0 Feature */}
          {serviceHoursSummary && serviceHoursSummary.totalHours > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#1F2937' }}>
                🌟 My Legacy Impact
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                Your service creates ripples of positive change. Here's your impact breakdown.
              </p>

              {/* Kindness Footprint - Service Category Breakdown */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                  📊 Kindness Footprint (Last 90 Days)
                </h4>
                
                {/* Category bars with sample data - will connect to real data later */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Peer Support */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>💙 Peer Support</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>40%</span>
                    </div>
                    <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', height: '100%', width: '40%', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Community Service */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>🌍 Community Service</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>30%</span>
                    </div>
                    <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #10B981, #34D399)', height: '100%', width: '30%', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Tutoring/Mentoring */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>📚 Tutoring & Mentoring</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>20%</span>
                    </div>
                    <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)', height: '100%', width: '20%', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Environmental */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>🌱 Environmental</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>10%</span>
                    </div>
                    <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #059669, #10B981)', height: '100%', width: '10%', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 3 Emerging Virtues - Character Strengths */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                  ✨ Your Top 3 Emerging Virtues
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #EBF4FF, #DBEAFE)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '20px' }}>💙</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E40AF' }}>Compassion</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>28 acts of peer support</div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '20px' }}>🎯</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#7C3AED' }}>Leadership</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>15 mentoring sessions</div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '20px' }}>🌍</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Service</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>12 community projects</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#FEF3C7',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#92400E'
              }}>
                💡 <strong>What This Means:</strong> Your character strengths are based on your service patterns over the last 90 days. Share these with your parents and teachers to show your personal growth!
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              🏆 Recent Achievements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎯</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Kindness Streak Master</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>5 days in a row!</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>⭐</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Helping Hand</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Completed 8 challenges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && <WeeklyChallengesView />}

      {activeTab === 'rewards' && <SchoolRewardsView />}

      {activeTab === 'progress' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Progress Tracking
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Track your kindness journey and see how you're growing!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                {stats.completedChallenges}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Challenges Done</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#06B6D4' }}>
                {stats.totalKindnessPoints}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Points</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StudentNotificationPreferences />
          <NotificationPreferences />
        </div>
      )}

      {/* Important Security Notice - Only for Demo */}
      <div style={{
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '24px',
        marginBottom: '24px', // Space adjusted for left sidebar
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          🔒 Student Dashboard
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          You only see your own data - no access to other students' information
        </div>
      </div>
      
      {/* Left Sidebar for easy access back to Feed */}
      <LeftSidebar 
        activeTab="student-dashboard" 
        onTabChange={(tab) => {
          if (onNavigateToTab) {
            onNavigateToTab(tab);
          }
        }} 
      />
      
      {/* Demo School Level Switcher - Only visible in demo mode */}
      <DemoSchoolLevelSwitcher />
    </div>
  );
}