import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Heart, 
  Star, 
  Gift, 
  Mail, 
  MessageSquare, 
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  monthlyInvestment: number;
  description: string;
  specialOffers: string[];
  studentReach: number;
  partnerSince: string;
}

// Sample sponsor data - replace with real API data
const sponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Burlington Sock Puppets Baseball',
    logo: '⚾',
    tier: 'gold',
    monthlyInvestment: 5000,
    description: 'Supporting youth character development through sports and community engagement.',
    specialOffers: ['Free game tickets', 'Team gear discounts', 'Meet & greet events'],
    studentReach: 800,
    partnerSince: '2024'
  },
  {
    id: '2', 
    name: 'Burlington City Park & Recreation',
    logo: '🏞️',
    tier: 'platinum',
    monthlyInvestment: 8000,
    description: 'Promoting outdoor activities and healthy lifestyles for families.',
    specialOffers: ['Free park passes', 'Activity program discounts', 'Special events access'],
    studentReach: 1200,
    partnerSince: '2023'
  },
  {
    id: '3',
    name: 'Putt-Putt Fun Center Burlington',
    logo: '⛳',
    tier: 'gold',
    monthlyInvestment: 4500,
    description: 'Burlington\'s premier mini golf destination with arcade games and family fun.',
    specialOffers: ['Free game tokens', 'Birthday party discounts', 'Family fun pack deals'],
    studentReach: 750,
    partnerSince: '2024'
  },
  {
    id: '4',
    name: 'Chick-fil-A Burlington',
    logo: '🐔',
    tier: 'gold',
    monthlyInvestment: 6000,
    description: 'Nourishing bodies and supporting education in our community.',
    specialOffers: ['Free meals for achievements', 'Family night discounts', 'Fundraising support'],
    studentReach: 900,
    partnerSince: '2024'
  },
  {
    id: '5',
    name: 'Buffalo Wild Wings Burlington',
    logo: '🔥',
    tier: 'gold',
    monthlyInvestment: 5500,
    description: 'Wings, sports, and family dining with an energetic atmosphere middle schoolers love.',
    specialOffers: ['Team celebration meals', 'Family game day specials', 'Student achievement rewards'],
    studentReach: 850,
    partnerSince: '2024'
  }
];

const getTierColor = (tier: Sponsor['tier']) => {
  switch (tier) {
    case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function SponsorsPage() {
  const totalRevenue = sponsors.reduce((sum, sponsor) => sum + sponsor.monthlyInvestment, 0);
  const totalStudentReach = sponsors.reduce((sum, sponsor) => sum + sponsor.studentReach, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Community Sponsors
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the amazing local businesses and organizations that make EchoDeed possible. Our sponsors are the backbone of our platform, enabling us to provide free character education to students.
          </p>
        </div>

        {/* Family Benefits Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Local Sponsors</p>
                  <p className="text-3xl font-bold text-green-700">{sponsors.length}</p>
                  <p className="text-sm text-green-600">Burlington area partners</p>
                </div>
                <Building2 className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Family Benefits</p>
                  <p className="text-3xl font-bold text-purple-700">FREE</p>
                  <p className="text-sm text-purple-600">Discounts & offers</p>
                </div>
                <Gift className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surprise Offers Alert */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Gift className="w-5 h-5" />
              🎉 Surprise Sponsor Offers Coming Your Way!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get exclusive discount codes and free offers sent directly to your inbox</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-800">SMS Alerts</p>
                    <p className="text-sm text-gray-600">Receive instant notifications for limited-time flash offers and free items</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Recent Surprise Offers:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free Chick-fil-A meal (48hr notice)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>50% off Burlington Sock Puppets tickets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free family park pass weekend</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{sponsor.logo}</div>
                    <div>
                      <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                      <CardDescription>Partner since {sponsor.partnerSince}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getTierColor(sponsor.tier)}>
                    {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)} Partner
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{sponsor.description}</p>
                
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{sponsor.studentReach}+</p>
                  <p className="text-sm text-blue-700">Burlington families served</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Special Offers Available:
                  </h4>
                  <div className="space-y-1">
                    {sponsor.specialOffers.map((offer, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{offer}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Thank This Sponsor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Get Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-500" />
              🎯 How to Access Sponsor Benefits
            </CardTitle>
            <CardDescription>
              Three easy ways to enjoy exclusive offers from our Burlington community sponsors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Mail className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="font-semibold text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-600">Automatic notifications for special offers</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="font-semibold text-gray-900">SMS Offers</p>
                <p className="text-sm text-gray-600">Flash deals sent directly to your phone</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                <p className="font-semibold text-gray-900">Thank Sponsors</p>
                <p className="text-sm text-gray-600">Show appreciation and strengthen partnerships</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}