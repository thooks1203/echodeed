import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { BackButton } from '@/components/BackButton';
import { Heart, Users, Calendar, Clock, Target, Trophy, Camera, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WeeklyFamilyTheme {
  week: number;
  theme: string;
  description: string;
  focus: string;
  color: string;
  emoji: string;
}

interface FamilyChallenge {
  id: string;
  week: number;
  title: string;
  description: string;
  theme: string;
  difficulty: string;
  kidPoints: number;
  parentPoints: number;
  ageGroup: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface FamilyActivity {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  kidInstructions: string;
  parentInstructions: string;
  timeEstimate: number;
  materialsNeeded: string;
  locationSuggestion: string;
  discussionPrompts: string;
}

export default function FamilyChallenges() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'k-2' | '3-5' | '6-8' | 'family'>('family');
  const [selectedChallenge, setSelectedChallenge] = useState<FamilyChallenge | null>(null);
  const [familyReflection, setFamilyReflection] = useState('');
  const [photoSubmitted, setPhotoSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get current week and theme
  const { data: currentWeek } = useQuery({
    queryKey: ['/api/family-challenges/current-week'],
  });

  // Get family challenges for selected age group
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/family-challenges/challenges', selectedAgeGroup],
    enabled: !!selectedAgeGroup,
  });

  // Get activities for selected challenge
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/family-challenges/activities', selectedChallenge?.id],
    enabled: !!selectedChallenge?.id,
  });

  // Complete family challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async (data: { studentId: string; parentId?: string; challengeId: string; familyReflection: string; photoSubmitted: boolean }) => {
      return await apiRequest('/api/family-challenges/complete', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "🎉 Challenge Completed!",
        description: "Both you and your child earned rewards! Great job working together.",
      });
      setFamilyReflection('');
      setPhotoSubmitted(false);
      setSelectedChallenge(null);
      queryClient.invalidateQueries({ queryKey: ['/api/family-challenges/challenges'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompleteChallenge = () => {
    if (!selectedChallenge || !familyReflection.trim()) {
      toast({
        title: "Missing Information",
        description: "Please add a family reflection about your experience.",
        variant: "destructive",
      });
      return;
    }

    completeChallengeMutation.mutate({
      studentId: 'demo-student', // In real app, get from auth
      parentId: 'demo-parent', // In real app, get from auth
      challengeId: selectedChallenge.id,
      familyReflection,
      photoSubmitted,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton 
            onClick={() => setLocation('/#roles')} 
            label="Back to Home"
            variant="minimal"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="header-title">
              👨‍👩‍👧‍👦 Family Kindness Challenges
            </h1>
            <p className="text-gray-600">Strengthen family bonds through acts of kindness together</p>
          </div>
        </div>

        {/* Current Week Theme */}
        {currentWeek && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{currentWeek.theme.emoji}</div>
                <div>
                  <CardTitle className="text-xl text-purple-900" data-testid="current-week-theme">
                    Week {currentWeek.week}: {currentWeek.theme.theme}
                  </CardTitle>
                  <CardDescription className="text-purple-700 font-medium">
                    {currentWeek.theme.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <Target className="h-4 w-4" />
                <span>Focus: {currentWeek.theme.focus}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Age Group Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Choose Your Family's Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'k-2', label: 'K-2nd Grade', icon: '🧸' },
                { value: '3-5', label: '3rd-5th Grade', icon: '📚' },
                { value: '6-8', label: '6th-8th Grade', icon: '🎯' },
                { value: 'family', label: 'All Family', icon: '👨‍👩‍👧‍👦' },
              ].map((group) => (
                <Button
                  key={group.value}
                  variant={selectedAgeGroup === group.value ? 'default' : 'outline'}
                  onClick={() => setSelectedAgeGroup(group.value as any)}
                  className="h-16 flex-col gap-1"
                  data-testid={`age-group-${group.value}`}
                >
                  <span className="text-lg">{group.icon}</span>
                  <span className="text-xs">{group.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              This Week's Family Challenges
            </CardTitle>
            <CardDescription>
              Complete challenges together and earn dual rewards for both kids and parents!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challengesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No challenges available for this age group this week.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => apiRequest('/api/family-challenges/initialize', { method: 'POST' })}
                  data-testid="button-initialize-challenges"
                >
                  Initialize Family Challenges
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge: FamilyChallenge) => (
                  <div
                    key={challenge.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedChallenge?.id === challenge.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedChallenge(challenge)}
                    data-testid={`challenge-card-${challenge.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                        
                        {/* ENHANCED REWARDS SECTION - Large and Colorful! */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-dashed border-purple-300 mb-3">
                          <div className="text-center mb-2">
                            <span className="text-sm font-semibold text-purple-700 bg-white px-3 py-1 rounded-full">
                              🎁 DUAL REWARDS EARNED! 🎁
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-6">
                            <div className="text-center bg-blue-100 px-4 py-3 rounded-lg border-2 border-blue-300">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-2xl">🧒</span>
                                <Trophy className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="text-lg font-bold text-blue-700">
                                {challenge.kidPoints}
                              </div>
                              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                Kid Points
                              </div>
                            </div>
                            
                            <div className="text-4xl animate-pulse">+</div>
                            
                            <div className="text-center bg-purple-100 px-4 py-3 rounded-lg border-2 border-purple-300">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                                <Trophy className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="text-lg font-bold text-purple-700">
                                {challenge.parentPoints}
                              </div>
                              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                Parent Points
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Week indicator - smaller and subtle */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Week {challenge.week}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Challenge Details */}
        {selectedChallenge && activities.length > 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Challenge Instructions: {selectedChallenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activities.map((activity: FamilyActivity) => (
                <div key={activity.id} className="bg-white rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900">{activity.title}</h4>
                  <p className="text-gray-600">{activity.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Instructions for Kids */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        🧒 For Kids:
                      </h5>
                      <p className="text-blue-800 text-sm">{activity.kidInstructions}</p>
                    </div>
                    
                    {/* Instructions for Parents */}
                    {activity.parentInstructions && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                          👨‍👩‍👧‍👦 For Parents:
                        </h5>
                        <p className="text-purple-800 text-sm">{activity.parentInstructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{activity.timeEstimate} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{activity.locationSuggestion}</span>
                    </div>
                    {activity.materialsNeeded && (
                      <div className="col-span-2 text-gray-600">
                        <strong>Materials:</strong> {activity.materialsNeeded}
                      </div>
                    )}
                  </div>

                  {/* Discussion Prompts */}
                  {activity.discussionPrompts && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="font-medium text-yellow-900 mb-2">💬 Family Discussion:</h5>
                      <p className="text-yellow-800 text-sm">{activity.discussionPrompts}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Completion Form */}
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                <h5 className="font-semibold text-gray-900 mb-4">Complete This Challenge</h5>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Reflection *
                    </label>
                    <Textarea
                      value={familyReflection}
                      onChange={(e) => setFamilyReflection(e.target.value)}
                      placeholder="Tell us about your family's experience with this challenge. What did you learn? How did it make you feel?"
                      className="min-h-24"
                      data-testid="textarea-family-reflection"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photo"
                      checked={photoSubmitted}
                      onCheckedChange={(checked) => setPhotoSubmitted(checked as boolean)}
                      data-testid="checkbox-photo-submitted"
                    />
                    <label htmlFor="photo" className="text-sm text-gray-600 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      We took a photo of our kindness act (optional)
                    </label>
                  </div>

                  <Button
                    onClick={handleCompleteChallenge}
                    disabled={completeChallengeMutation.isPending || !familyReflection.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    data-testid="button-complete-challenge"
                  >
                    {completeChallengeMutation.isPending ? 'Completing...' : '🎉 Complete Family Challenge'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}