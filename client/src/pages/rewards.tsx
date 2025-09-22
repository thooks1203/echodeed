import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNavigation } from '@/hooks/useNavigation';
import { BackButton } from '@/components/BackButton';
import { Building2, Shield, Star, Gift, ShoppingBag, Coffee, Music, Trophy, CheckCircle2, AlertCircle, Clock, Bell } from 'lucide-react';
import { testRewardProximity } from '@/components/RewardNotificationManager';

interface RewardOffer {
  id: string;
  partnerId: string;
  partnerName?: string;
  partnerLogo?: string;
  offerType: 'discount' | 'freebie' | 'cashback' | 'experience';
  title: string;
  description: string;
  offerValue: string;
  echoCost: number;
  badgeRequirement?: string;
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: number;
  isFeatured: number;
  requiresVerification: number;
  termsAndConditions?: string;
  imageUrl?: string;
  expiresAt?: string;
  // Corporate Sponsorship Fields
  sponsorCompany?: string;
  sponsorLogo?: string;
  sponsorshipType?: 'full' | 'partial' | 'co-sponsor';
  sponsorshipMessage?: string;
  monthlySponsorship?: number;
}

interface RewardPartner {
  id: string;
  partnerName: string;
  partnerLogo?: string;
  partnerType: string;
  description: string;
  isActive: number;
  isFeatured: number;
}

interface UserTokens {
  echoBalance: number;
  totalEarned: number;
}

interface Redemption {
  id: string;
  offerId: string;
  partnerId: string;
  echoSpent: number;
  redemptionCode?: string;
  status: 'pending' | 'active' | 'used' | 'expired' | 'refunded';
  redeemedAt: string;
}

interface RewardsPageProps {
  onBack?: () => void;
}

const getOfferIcon = (type: string) => {
  switch (type) {
    case 'dual_reward': return <Gift className="w-5 h-5" />;
    case 'entertainment': return <ShoppingBag className="w-5 h-5" />;
    case 'meal': return <Trophy className="w-5 h-5" />;
    case 'treat': return <Star className="w-5 h-5" />;
    case 'educational': return <ShoppingBag className="w-5 h-5" />;
    // Legacy support
    case 'discount': return <ShoppingBag className="w-5 h-5" />;
    case 'freebie': return <Gift className="w-5 h-5" />;
    case 'cashback': return <Trophy className="w-5 h-5" />;
    default: return <Star className="w-5 h-5" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'used': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'expired': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

export default function RewardsPage({ onBack }: RewardsPageProps) {
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedOfferType, setSelectedOfferType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canGoBack, goBack } = useNavigation();

  // Fetch user tokens
  const { data: userTokens } = useQuery<UserTokens>({
    queryKey: ['/api', 'tokens'],
  });

  // Fetch reward partners
  const { data: partners = [] } = useQuery<RewardPartner[]>({
    queryKey: ['/api', 'rewards', 'partners'],
  });

  // Fetch reward offers - using the correct endpoint that has Burlington rewards
  const { data: offers = [], isLoading: offersLoading } = useQuery<RewardOffer[]>({
    queryKey: ['/api', 'rewards', 'offers', 'all', 'all'],
  });

  // Fetch user redemptions
  const { data: redemptions = [] } = useQuery<Redemption[]>({
    queryKey: ['/api', 'rewards', 'my-redemptions'],
  });

  // Redeem offer mutation
  const redeemMutation = useMutation({
    mutationFn: async (offer: RewardOffer) => {
      const partner = partners.find((p: RewardPartner) => p.id === offer.partnerId);
      return apiRequest('/api/rewards/redeem', 'POST', {
        offerId: offer.id,
        partnerId: offer.partnerId,
        echoSpent: offer.echoCost,
        verificationRequired: offer.requiresVerification,
        expiresAt: offer.expiresAt
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api', 'tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api', 'rewards', 'my-redemptions'] });
      toast({
        title: "Reward Redeemed! 🎉",
        description: data.redemptionCode ? 
          `Your discount code: ${data.redemptionCode}` : 
          "Check your redemptions for details",
        duration: 6000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRedeem = (offer: RewardOffer) => {
    if (!userTokens || userTokens.echoBalance < offer.echoCost) {
      toast({
        title: "Insufficient $ECHO Tokens",
        description: `You need ${offer.echoCost} $ECHO tokens but only have ${userTokens?.echoBalance || 0}`,
        variant: "destructive",
      });
      return;
    }

    redeemMutation.mutate(offer);
  };

  // Get partner info for offers (unfiltered for My Rewards tab)
  const allEnrichedOffers = offers.map((offer: RewardOffer) => {
    const partner = partners.find((p: RewardPartner) => p.id === offer.partnerId);
    return {
      ...offer, // This preserves ALL fields including sponsorCompany, sponsorshipMessage, etc.
      partnerName: partner?.partnerName || offer.partnerName, // Use existing partnerName if partner lookup fails
      partnerLogo: partner?.partnerLogo || offer.partnerLogo, // Use existing partnerLogo if partner lookup fails
    };
  });

  // Apply filters for Browse Rewards tab - but default to showing all when filters are set to 'all'
  const filteredOffers = allEnrichedOffers.filter((offer: RewardOffer) => {
    // Filter by partner - only filter if NOT 'all'
    if (selectedPartner !== 'all' && offer.partnerId !== selectedPartner) {
      return false;
    }
    
    // Filter by offer type - only filter if NOT 'all' 
    if (selectedOfferType !== 'all' && offer.offerType !== selectedOfferType) {
      return false;
    }
    
    return true;
  });

  // Filter featured offers from filtered list
  const featuredOffers = filteredOffers.filter((offer: RewardOffer) => offer.isFeatured);
  const featuredPartners = partners.filter((partner: RewardPartner) => partner.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute left-0 top-0">
            <BackButton 
              onClick={() => onBack ? onBack() : window.location.href = '/'}
              variant="minimal"
              style={{ color: '#6b7280' }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            💎 Rewards Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Turn your kindness into real rewards
          </p>
          
          {/* Token Balance */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-6 py-3 rounded-full border border-purple-200 dark:border-purple-700">
            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-lg text-purple-800 dark:text-purple-200">
              {userTokens?.echoBalance || 0} $ECHO
            </span>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="browse" data-testid="tab-browse-rewards">Browse Rewards</TabsTrigger>
            <TabsTrigger value="partners" data-testid="tab-partners">Partners</TabsTrigger>
            <TabsTrigger value="my-rewards" data-testid="tab-my-rewards">My Rewards</TabsTrigger>
          </TabsList>

          {/* Browse Rewards Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex flex-wrap gap-4">
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="w-48" data-testid="filter-partner">
                    <SelectValue placeholder="Filter by partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    {partners.map((partner: RewardPartner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.partnerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Test Proximity Notifications */}
                <Button
                  onClick={() => testRewardProximity.testWithMockData()}
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hidden md:flex"
                  data-testid="test-proximity-notifications"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Test Alerts
                </Button>

                <Select value={selectedOfferType} onValueChange={setSelectedOfferType}>
                  <SelectTrigger className="w-48" data-testid="filter-offer-type">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dual_reward">Dual Rewards</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="meal">Meals</SelectItem>
                    <SelectItem value="treat">Treats</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Offers */}
            {featuredOffers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Offers</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredOffers.map((offer: RewardOffer) => (
                    <Card key={offer.id} className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border border-yellow-200 dark:border-yellow-700/30 hover:shadow-lg transition-all">
                      {offer.sponsorCompany ? (
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg shadow-lg border border-blue-500/30">
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Building2 className="w-3.5 h-3.5" />
                              SPONSORED BY
                            </div>
                            <div className="text-xs font-medium mt-0.5 text-blue-100">
                              {offer.sponsorCompany}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      
                      {offer.imageUrl && (
                        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${offer.imageUrl})` }} />
                      )}
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {offer.partnerLogo && (
                              <img src={offer.partnerLogo} alt={offer.partnerName} className="w-8 h-8 rounded object-contain" />
                            )}
                            <div>
                              <CardTitle className="text-lg">{offer.title}</CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{offer.partnerName}</p>
                              {offer.sponsorCompany && offer.sponsorshipMessage && (
                                <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    💼 {offer.sponsorshipMessage}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {getOfferIcon(offer.offerType)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <CardDescription>{offer.description}</CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-lg font-bold">
                            {offer.offerValue}
                          </Badge>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {offer.echoCost} $ECHO
                            </p>
                          </div>
                        </div>
                        
                        {offer.badgeRequirement && (
                          <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                            <Shield className="w-4 h-4" />
                            Badge Required: {offer.badgeRequirement}
                          </div>
                        )}
                        
                        {offer.requiresVerification === 1 && (
                          <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Verification Required
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => handleRedeem(offer)}
                          disabled={redeemMutation.isPending || !userTokens || userTokens.echoBalance < offer.echoCost}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          data-testid={`redeem-offer-${offer.id}`}
                        >
                          {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Offers */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Rewards</h2>
              {offersLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading rewards...</p>
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No rewards available - check filters above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOffers.map((offer: RewardOffer) => (
                  <Card key={offer.id} className="hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                    {offer.imageUrl && (
                      <div className="h-32 bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${offer.imageUrl})` }} />
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {offer.partnerLogo && (
                            <img src={offer.partnerLogo} alt={offer.partnerName} className="w-8 h-8 rounded object-contain" />
                          )}
                          <div>
                            <CardTitle className="text-lg">{offer.title}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{offer.partnerName}</p>
                            {offer.sponsorCompany && (
                              <div className="mt-2">
                                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                                  <Building2 className="w-3 h-3" />
                                  SPONSORED BY {offer.sponsorCompany.toUpperCase()}
                                </div>
                                {offer.sponsorshipMessage && (
                                  <div className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium italic">
                                    💼 {offer.sponsorshipMessage}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {getOfferIcon(offer.offerType)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <CardDescription>{offer.description}</CardDescription>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-lg font-bold">
                          {offer.offerValue}
                        </Badge>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {offer.echoCost} $ECHO
                          </p>
                        </div>
                      </div>
                      
                      {offer.badgeRequirement && (
                        <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                          <Shield className="w-4 h-4" />
                          Badge Required: {offer.badgeRequirement}
                        </div>
                      )}
                      
                      {offer.requiresVerification === 1 && (
                        <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Verification Required
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => handleRedeem(offer)}
                        disabled={redeemMutation.isPending || !userTokens || userTokens.echoBalance < offer.echoCost}
                        className="w-full"
                        data-testid={`redeem-offer-${offer.id}`}
                      >
                        {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner: RewardPartner) => (
                <Card key={partner.id} className={`hover:shadow-lg transition-all ${partner.isFeatured ? 'ring-2 ring-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-white/80 dark:bg-gray-800/80'} backdrop-blur-sm border border-white/20 dark:border-gray-700/20`}>
                  {partner.isFeatured && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {partner.partnerLogo && (
                        <img src={partner.partnerLogo} alt={partner.partnerName} className="w-16 h-16 rounded-lg object-contain" />
                      )}
                      <div>
                        <CardTitle className="text-xl">{partner.partnerName}</CardTitle>
                        <Badge variant="outline">{partner.partnerType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-base">{partner.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Rewards Tab */}
          <TabsContent value="my-rewards" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Redemptions</h2>
            
            {redemptions.length === 0 ? (
              <Card className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                <CardContent>
                  <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No rewards yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Start earning $ECHO tokens and redeem your first reward!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {redemptions.map((redemption: Redemption) => {
                  const offer = allEnrichedOffers.find((o: RewardOffer) => o.id === redemption.offerId);
                  const partner = partners.find((p: RewardPartner) => p.id === redemption.partnerId);
                  
                  return (
                    <Card key={redemption.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {partner?.partnerLogo && (
                              <img src={partner.partnerLogo} alt={partner.partnerName} className="w-10 h-10 rounded object-contain" />
                            )}
                            <div>
                              <CardTitle className="text-lg">{offer?.title || 'Reward'}</CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{partner?.partnerName}</p>
                            </div>
                          </div>
                          {getStatusIcon(redemption.status)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                          <span className="font-semibold">{redemption.echoSpent} $ECHO</span>
                        </div>
                        
                        {redemption.redemptionCode && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                              {redemption.redemptionCode}
                            </code>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          <Badge variant={redemption.status === 'active' ? 'default' : 'secondary'}>
                            {redemption.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Redeemed:</span>
                          <span className="text-sm">{new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}