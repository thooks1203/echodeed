import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Users, 
  Star, 
  Clock, 
  Target, 
  Trophy, 
  Calendar, 
  Gift, 
  ArrowLeft,
  Home,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  isActive: boolean;
  startDate: string;
  endDate: string;
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

interface FamilyProgress {
  id: string;
  challengeId: string;
  studentId: string;
  parentId: string;
  completedAt: string;
  kidPointsEarned: number;
  parentPointsEarned: number;
  familyReflection: string;
  photoSubmitted: boolean;
  teacherApproved: boolean;
}

interface FamilyDashboardProps {
  familyId?: string;
  studentId?: string;
  parentId?: string;
}

export default function FamilyDashboard({ 
  familyId = "family-demo", 
  studentId = "student-demo",
  parentId = "parent-demo" 
}: FamilyDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'k-2' | '3-5' | '6-8' | 'family'>('family');
  const [selectedChallenge, setSelectedChallenge] = useState<FamilyChallenge | null>(null);

  // Fetch current week and theme
  const { data: currentWeek, isLoading: currentWeekLoading } = useQuery({
    queryKey: ['/api/family-challenges/current-week'],
    retry: false,
  });

  // Fetch family challenges for age group
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/family-challenges/challenges', selectedAgeGroup],
    retry: false,
  });

  // Fetch activities for selected challenge
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/family-challenges/activities', selectedChallenge?.id],
    enabled: !!selectedChallenge?.id,
    retry: false,
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async (data: {
      studentId: string;
      parentId: string;
      challengeId: string;
      familyReflection: string;
      photoSubmitted: boolean;
    }) => {
      await apiRequest('POST', '/api/family-challenges/complete', data);
    },
    onSuccess: () => {
      toast({
        title: "Challenge Completed! 🎉",
        description: "Both you and your child earned kindness tokens!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/family-challenges'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompleteChallenge = (challenge: FamilyChallenge) => {
    completeChallengeMutation.mutate({
      studentId,
      parentId,
      challengeId: challenge.id,
      familyReflection: "We had a wonderful time doing this activity together!",
      photoSubmitted: false,
    });
  };

  if (currentWeekLoading || challengesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setLocation('/');
              setTimeout(() => {
                const rolesElement = document.getElementById('roles');
                if (rolesElement) {
                  rolesElement.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Family Kindness Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Where families earn kindness tokens together! Complete challenges as a team and watch your dual rewards grow.
          </p>
        </header>

        {/* Current Week Banner */}
        {currentWeek && typeof currentWeek === 'object' && 'week' in currentWeek && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Week {(currentWeek as any).week}: {
                      typeof (currentWeek as any).theme === 'object' && (currentWeek as any).theme?.theme
                        ? `${(currentWeek as any).theme.emoji || '🌟'} ${(currentWeek as any).theme.theme}`
                        : (currentWeek as any).theme || 'Kindness Week'
                    }
                  </h2>
                  <p className="text-blue-100">This week's family kindness theme</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Age Group Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Choose Age Group
            </CardTitle>
            <CardDescription>
              Select the appropriate age group to see tailored family challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {(['k-2', '3-5', '6-8', 'family'] as const).map((age) => (
                <Button
                  key={age}
                  variant={selectedAgeGroup === age ? "default" : "outline"}
                  onClick={() => setSelectedAgeGroup(age)}
                  className="flex items-center gap-2"
                  data-testid={`button-age-${age}`}
                >
                  <Users className="h-4 w-4" />
                  {age === 'family' ? 'All Ages' : `Grades ${age.toUpperCase()}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="challenges">Current Challenges</TabsTrigger>
            <TabsTrigger value="progress">Family Progress</TabsTrigger>
            <TabsTrigger value="rewards">Dual Rewards</TabsTrigger>
            <TabsTrigger value="fundraising">School Fundraising</TabsTrigger>
          </TabsList>

          {/* Current Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(challenges) && challenges.map((challenge: FamilyChallenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge variant={challenge.difficulty === 'easy' ? 'secondary' : challenge.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Theme:</span>
                        <Badge variant="outline">{challenge.theme}</Badge>
                      </div>
                      
                      {/* Dual Reward Display */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-green-800">Dual Rewards 🎁</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{challenge.kidPoints}</div>
                            <div className="text-sm text-gray-600">Kid Tokens</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{challenge.parentPoints}</div>
                            <div className="text-sm text-gray-600">Parent Tokens</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedChallenge(challenge)}
                          className="flex-1"
                          data-testid={`button-view-${challenge.id}`}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteChallenge(challenge)}
                          disabled={completeChallengeMutation.isPending}
                          className="flex-1"
                          data-testid={`button-complete-${challenge.id}`}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Challenge Details Modal */}
            {selectedChallenge && (
              <Card className="mt-8 border-2 border-purple-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedChallenge.title}</CardTitle>
                      <CardDescription className="mt-2">{selectedChallenge.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedChallenge(null)}
                      data-testid="button-close-details"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Array.isArray(activities) && activities.map((activity: FamilyActivity) => (
                        <div key={activity.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{activity.title}</h4>
                          <p className="text-gray-600 mb-4">{activity.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-blue-600 mb-2">👦 For Kids:</h5>
                              <p className="text-sm">{activity.kidInstructions}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-purple-600 mb-2">👪 For Parents:</h5>
                              <p className="text-sm">{activity.parentInstructions}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {activity.timeEstimate} min
                            </span>
                            <span>📍 {activity.locationSuggestion}</span>
                          </div>

                          {activity.materialsNeeded && (
                            <div className="mt-3">
                              <span className="font-medium">Materials: </span>
                              <span className="text-sm">{activity.materialsNeeded}</span>
                            </div>
                          )}

                          {activity.discussionPrompts && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded">
                              <span className="font-medium">💬 Discussion: </span>
                              <span className="text-sm">{activity.discussionPrompts}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Family Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Family Progress Overview
                </CardTitle>
                <CardDescription>
                  Track your family's kindness journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">This Week's Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Challenges Completed</span>
                        <span>3 of 5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Family Participation</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>Completed "Family Game Night Kindness"</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span>Earned 50 dual reward tokens</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Submitted family reflection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dual Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Gift className="h-5 w-5" />
                    Kid Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">245</div>
                    <div className="text-sm text-blue-600">Total Kid Tokens</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="text-blue-600">+35 tokens</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Reward</span>
                      <span className="text-blue-600">@ 300 tokens</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Trophy className="h-5 w-5" />
                    Parent Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">128</div>
                    <div className="text-sm text-purple-600">Total Parent Tokens</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="text-purple-600">+18 tokens</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Reward</span>
                      <span className="text-purple-600">@ 150 tokens</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
                <CardDescription>
                  Redeem your family tokens for awesome rewards!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="font-medium">Family Game Night</div>
                    <div className="text-sm text-gray-600">100 tokens</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🍕</div>
                    <div className="font-medium">Pizza Family Dinner</div>
                    <div className="text-sm text-gray-600">200 tokens</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="font-medium">Movie Theatre Tickets</div>
                    <div className="text-sm text-gray-600">300 tokens</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Fundraising Tab */}
          <TabsContent value="fundraising" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  School Fundraising Campaigns
                </CardTitle>
                <CardDescription>
                  Support your school and earn DOUBLE tokens for donations!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">New Playground Equipment</h4>
                        <p className="text-sm text-gray-600">Help us build a better playground for all students</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">2x Tokens!</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>$8,500 of $15,000</span>
                      </div>
                      <Progress value={57} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" data-testid="button-donate-playground">
                        Donate Now
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-learn-more-playground">
                        Learn More
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">Art Supplies Drive</h4>
                        <p className="text-sm text-gray-600">Supporting creativity in our classrooms</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">2x Tokens!</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>$2,100 of $3,000</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" data-testid="button-donate-art">
                        Donate Now
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-learn-more-art">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}