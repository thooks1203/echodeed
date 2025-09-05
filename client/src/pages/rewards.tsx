import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Star, Gift, ShoppingBag, Coffee, Music, Trophy, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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
  echoTokens: number;
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

const getOfferIcon = (type: string) => {
  switch (type) {
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

export default function RewardsPage() {
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedOfferType, setSelectedOfferType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user tokens
  const { data: userTokens } = useQuery<UserTokens>({
    queryKey: ['/api/tokens'],
  });

  // Fetch reward partners
  const { data: partners = [] } = useQuery<RewardPartner[]>({
    queryKey: ['/api/rewards/partners'],
  });

  // Fetch reward offers
  const { data: offers = [] } = useQuery<RewardOffer[]>({
    queryKey: ['/api/rewards/offers', selectedPartner, selectedOfferType],
  });

  // Fetch user redemptions
  const { data: redemptions = [] } = useQuery<Redemption[]>({
    queryKey: ['/api/rewards/my-redemptions'],
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
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards/my-redemptions'] });
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
    if (!userTokens || userTokens.echoTokens < offer.echoCost) {
      toast({
        title: "Insufficient $ECHO Tokens",
        description: `You need ${offer.echoCost} $ECHO tokens but only have ${userTokens?.echoTokens || 0}`,
        variant: "destructive",
      });
      return;
    }

    redeemMutation.mutate(offer);
  };

  // Get partner info for offers
  const enrichedOffers = offers.map((offer: RewardOffer) => {
    const partner = partners.find((p: RewardPartner) => p.id === offer.partnerId);
    return {
      ...offer,
      partnerName: partner?.partnerName,
      partnerLogo: partner?.partnerLogo,
    };
  });

  // Filter featured offers
  const featuredOffers = enrichedOffers.filter((offer: RewardOffer) => offer.isFeatured);
  const featuredPartners = partners.filter((partner: RewardPartner) => partner.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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
              {userTokens?.echoTokens || 0} $ECHO
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

                <Select value={selectedOfferType} onValueChange={setSelectedOfferType}>
                  <SelectTrigger className="w-48" data-testid="filter-offer-type">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="discount">Discounts</SelectItem>
                    <SelectItem value="freebie">Free Items</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="experience">Experiences</SelectItem>
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
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      
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
                          disabled={redeemMutation.isPending || !userTokens || userTokens.echoTokens < offer.echoCost}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrichedOffers.map((offer: RewardOffer) => (
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
                        disabled={redeemMutation.isPending || !userTokens || userTokens.echoTokens < offer.echoCost}
                        className="w-full"
                        data-testid={`redeem-offer-${offer.id}`}
                      >
                        {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  const offer = enrichedOffers.find((o: RewardOffer) => o.id === redemption.offerId);
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