import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Award, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';

interface AdminReward {
  id: string;
  schoolId: string;
  rewardName: string;
  rewardType: string;
  description: string | null;
  quantityAvailable: number;
  quantityAllocated: number;
  tokenCost: number;
  eligibilityRequirements: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  schoolId: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'revoked';
  tokensSpent: number;
  approvedBy: string | null;
  fulfilledBy: string | null;
  fulfilledAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  rewardName?: string;
  rewardType?: string;
}

interface TokenBalance {
  echoBalance: number;
}

export function SchoolRewardsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { schoolLevel } = useSchoolLevel();
  const isMiddleSchool = schoolLevel === 'middle_school';
  const [selectedReward, setSelectedReward] = useState<AdminReward | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'available' | 'pending' | 'redeemed'>('available');

  // Helper to get demo headers for API calls
  const getDemoHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const demoRole = localStorage.getItem('echodeed_demo_role');
    const demoSession = localStorage.getItem('echodeed_session');
    
    if (demoRole && demoSession) {
      headers['x-session-id'] = demoSession;
      headers['x-demo-role'] = demoRole;
    }
    return headers;
  }, []);

  // Fetch student's token balance
  const { data: tokenData } = useQuery<TokenBalance>({
    queryKey: ['/api/tokens'],
    queryFn: () => fetch('/api/tokens', { headers: getDemoHeaders }).then(r => r.json())
  });

  const tokenBalance = tokenData?.echoBalance || 0;

  // Fetch available admin rewards for student's school
  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery<AdminReward[]>({
    queryKey: ['/api/admin-rewards'],
    queryFn: async () => {
      const res = await fetch('/api/admin-rewards', { headers: getDemoHeaders });
      if (!res.ok) {
        console.log('Admin rewards fetch error:', res.status);
        return [];
      }
      return res.json();
    }
  });

  // Fetch student's reward applications
  const { data: myRedemptions = [], isLoading: isLoadingRedemptions } = useQuery<RewardRedemption[]>({
    queryKey: ['/api/admin-rewards/my-redemptions'],
    queryFn: async () => {
      const res = await fetch('/api/admin-rewards/my-redemptions', { headers: getDemoHeaders });
      if (!res.ok) {
        console.log('My redemptions fetch error:', res.status);
        return [];
      }
      return res.json();
    }
  });

  // Mutation for applying to redeem a reward
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await apiRequest('POST', `/api/admin-rewards/${rewardId}/redeem`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted!',
        description: 'Your reward application is pending approval. Check back soon!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-rewards/my-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      setIsRedeemDialogOpen(false);
      setSelectedReward(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Application Failed',
        description: error.message || 'Unable to submit application. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleRedeemClick = (reward: AdminReward) => {
    setSelectedReward(reward);
    setIsRedeemDialogOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedReward) {
      redeemMutation.mutate(selectedReward.id);
    }
  };

  // Filter rewards based on active tab
  const availableRewards = rewards.filter(r => r.isActive && (r.quantityAvailable - r.quantityAllocated) > 0);
  const pendingRedemptions = myRedemptions.filter(r => r.status === 'pending');
  const redeemedRewards = myRedemptions.filter(r => r.status === 'approved' || r.status === 'fulfilled');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'revoked':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-blue-500';
      case 'fulfilled':
        return 'bg-green-500';
      case 'revoked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRewardEmoji = (rewardType: string) => {
    switch (rewardType) {
      case 'vip_parking':
        return '🚗';
      case 'homework_pass':
        return '📝';
      case 'lunch_skip':
        return '🍕';
      case 'principal_lunch':
        return '🍽️';
      case 'field_trip':
        return '🚌';
      case 'early_dismissal':
        return '🏃';
      default:
        return '🎁';
    }
  };

  return (
    <div style={{ padding: '0', minHeight: '60vh' }}>
      {/* Token Balance Header - Sticky - School level appropriate styling */}
      <div style={{
        background: isMiddleSchool 
          ? 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: isMiddleSchool
          ? '0 4px 12px rgba(139, 92, 246, 0.3)'
          : '0 4px 12px rgba(139, 92, 246, 0.3)',
        textAlign: 'center',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sparkles className="w-6 h-6" />
          <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
            {isMiddleSchool ? 'Your Echo Tokens' : 'Your Token Balance'}
          </h3>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
          {tokenBalance} {isMiddleSchool ? 'Echo Tokens ✨' : 'Tokens'}
        </div>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
          {isMiddleSchool 
            ? 'Trade your tokens for awesome prizes!'
            : 'Redeem tokens for exclusive school rewards!'
          }
        </p>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="available" className="w-full" onValueChange={(v) => setActiveFilter(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="available" data-testid="tab-available-rewards">
            <Gift className="w-4 h-4 mr-2" />
            Available ({availableRewards.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-applications">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingRedemptions.length})
          </TabsTrigger>
          <TabsTrigger value="redeemed" data-testid="tab-redeemed-rewards">
            <Award className="w-4 h-4 mr-2" />
            Redeemed ({redeemedRewards.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Rewards Tab */}
        <TabsContent value="available">
          {isLoadingRewards ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-gray-600">Loading rewards...</p>
            </div>
          ) : availableRewards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold mb-2">No Rewards Available</h3>
              <p className="text-gray-600">Check back soon for new rewards!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map((reward) => (
                <Card key={reward.id} data-testid={`reward-card-${reward.id}`}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{getRewardEmoji(reward.rewardType)}</div>
                    <CardTitle className="text-lg">{reward.rewardName}</CardTitle>
                    <CardDescription>{reward.description || 'Exclusive school reward'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Cost:</span>
                        <Badge variant="secondary" className="text-purple-600">
                          {reward.tokenCost} tokens
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Available:</span>
                        <span className="text-sm text-gray-600">
                          {reward.quantityAvailable - reward.quantityAllocated} remaining
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleRedeemClick(reward)}
                      disabled={tokenBalance < reward.tokenCost || redeemMutation.isPending}
                      className="w-full"
                      data-testid={`button-apply-reward-${reward.id}`}
                    >
                      {tokenBalance < reward.tokenCost ? 'Insufficient Tokens' : 'Apply Now'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Applications Tab */}
        <TabsContent value="pending">
          {isLoadingRedemptions ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : pendingRedemptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold mb-2">No Pending Applications</h3>
              <p className="text-gray-600">Apply for rewards from the Available tab!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRedemptions.map((redemption) => (
                <Card key={redemption.id} data-testid={`pending-redemption-${redemption.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(redemption.status)}
                      <CardTitle className="text-lg">{redemption.rewardName || 'Reward'}</CardTitle>
                    </div>
                    <CardDescription>
                      Applied {new Date(redemption.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className={getStatusColor(redemption.status)}>
                          {redemption.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tokens:</span>
                        <span className="text-sm text-gray-600">{redemption.tokensSpent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Redeemed Rewards Tab */}
        <TabsContent value="redeemed">
          {isLoadingRedemptions ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : redeemedRewards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">No Rewards Redeemed Yet</h3>
              <p className="text-gray-600">Start applying for rewards to build your collection!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {redeemedRewards.map((redemption) => (
                <Card key={redemption.id} data-testid={`redeemed-reward-${redemption.id}`} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(redemption.status)}
                      <CardTitle className="text-lg text-green-700">{redemption.rewardName || 'Reward'}</CardTitle>
                    </div>
                    <CardDescription>
                      {redemption.status === 'fulfilled' && redemption.fulfilledAt
                        ? `Fulfilled ${new Date(redemption.fulfilledAt).toLocaleDateString()}`
                        : `Approved ${new Date(redemption.updatedAt).toLocaleDateString()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className="bg-green-500">
                          {redemption.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tokens Spent:</span>
                        <span className="text-sm text-gray-600">{redemption.tokensSpent}</span>
                      </div>
                      {redemption.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Note:</strong> {redemption.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent data-testid="dialog-redeem-confirmation">
          <DialogHeader>
            <DialogTitle>Apply for Reward</DialogTitle>
            <DialogDescription>
              Confirm your application for this exclusive school reward.
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">{getRewardEmoji(selectedReward.rewardType)}</div>
                <h3 className="text-xl font-semibold mb-2">{selectedReward.rewardName}</h3>
                <p className="text-gray-600">{selectedReward.description}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Cost:</span>
                  <span className="text-purple-600 font-bold">{selectedReward.tokenCost} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Your Balance:</span>
                  <span className="font-bold">{tokenBalance} tokens</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">After Application:</span>
                  <span className={`font-bold ${tokenBalance - selectedReward.tokenCost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {tokenBalance - selectedReward.tokenCost} tokens
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Your application will be reviewed by school administrators. Tokens will be deducted upon approval.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRedeemDialogOpen(false);
                setSelectedReward(null);
              }}
              data-testid="button-cancel-redeem"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRedeem}
              disabled={redeemMutation.isPending || !selectedReward || tokenBalance < (selectedReward?.tokenCost || 0)}
              data-testid="button-confirm-redeem"
            >
              {redeemMutation.isPending ? 'Submitting...' : 'Confirm Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
