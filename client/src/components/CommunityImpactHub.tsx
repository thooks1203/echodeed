import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Users, 
  MapPin, 
  Calendar,
  TrendingUp,
  Star,
  Gift,
  Smile,
  HandHeart,
  TreePine,
  Home
} from 'lucide-react';

interface CommunityImpact {
  id: string;
  type: 'local_business' | 'senior_center' | 'food_bank' | 'animal_shelter' | 'environmental' | 'neighbor_help';
  title: string;
  description: string;
  location: string;
  kindnessCount: number;
  realWorldImpact: string;
  partnerOrganization?: string;
  icon: string;
  color: string;
  updatedAt: string;
}

const communityImpacts: CommunityImpact[] = [
  {
    id: '1',
    type: 'senior_center',
    title: 'Letters to Sunny Manor Senior Center',
    description: 'Students wrote encouraging letters to residents',
    location: 'Downtown Community Center',
    kindnessCount: 47,
    realWorldImpact: '47 seniors received hand-written letters bringing smiles and connection during their week',
    partnerOrganization: 'Sunny Manor Senior Living',
    icon: '💌',
    color: 'bg-pink-100 text-pink-800',
    updatedAt: '2024-12-09T10:30:00Z'
  },
  {
    id: '2',
    type: 'food_bank',
    title: 'Weekend Backpack Program',
    description: 'Students helped pack weekend meals for families in need',
    location: 'Local Food Bank',
    kindnessCount: 23,
    realWorldImpact: '23 families received weekend meal packages, ensuring kids had food over the weekend',
    partnerOrganization: 'Community Food Bank',
    icon: '🎒',
    color: 'bg-green-100 text-green-800',
    updatedAt: '2024-12-08T14:15:00Z'
  },
  {
    id: '3',
    type: 'environmental',
    title: 'School Garden Care',
    description: 'Students maintained the community garden and donated vegetables',
    location: 'School Community Garden',
    kindnessCount: 31,
    realWorldImpact: '150+ pounds of fresh vegetables donated to local families and food bank',
    partnerOrganization: 'Green Schools Initiative',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-800',
    updatedAt: '2024-12-07T16:45:00Z'
  },
  {
    id: '4',
    type: 'animal_shelter',
    title: 'Pet Comfort Project',
    description: 'Students made blankets and toys for shelter animals',
    location: 'City Animal Shelter',
    kindnessCount: 18,
    realWorldImpact: '35 shelter animals received handmade blankets and toys for comfort',
    partnerOrganization: 'City Animal Rescue',
    icon: '🐕',
    color: 'bg-blue-100 text-blue-800',
    updatedAt: '2024-12-06T11:20:00Z'
  },
  {
    id: '5',
    type: 'local_business',
    title: 'Thank You Cards for Essential Workers',
    description: 'Students created appreciation cards for local essential workers',
    location: 'Various Local Businesses',
    kindnessCount: 52,
    realWorldImpact: '52 essential workers (grocery, medical, postal) received personalized thank you cards',
    partnerOrganization: 'Chamber of Commerce',
    icon: '👏',
    color: 'bg-purple-100 text-purple-800',
    updatedAt: '2024-12-05T09:10:00Z'
  }
];

const impactTypes = [
  { id: 'all', label: 'All Impact', icon: Heart, count: 171 },
  { id: 'senior_center', label: 'Seniors', icon: Home, count: 47 },
  { id: 'food_bank', label: 'Hunger Relief', icon: Gift, count: 23 },
  { id: 'environmental', label: 'Environment', icon: TreePine, count: 31 },
  { id: 'animal_shelter', label: 'Animals', icon: HandHeart, count: 18 },
  { id: 'local_business', label: 'Community', icon: Users, count: 52 }
];

export function CommunityImpactHub() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const filteredImpacts = selectedType === 'all' 
    ? communityImpacts 
    : communityImpacts.filter(impact => impact.type === selectedType);

  const totalKindnessActs = communityImpacts.reduce((sum, impact) => sum + impact.kindnessCount, 0);
  const uniquePartners = new Set(communityImpacts.map(impact => impact.partnerOrganization)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Community Impact Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            See how your kindness creates real change in our community
          </p>
          <p className="text-sm text-gray-500">
            Every act of kindness shared here helps real people and organizations in our neighborhood
          </p>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalKindnessActs}</div>
              <div className="text-sm text-gray-600">Total Acts of Kindness</div>
              <div className="text-xs text-gray-500 mt-1">Creating real community change</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{uniquePartners}</div>
              <div className="text-sm text-gray-600">Community Partners</div>
              <div className="text-xs text-gray-500 mt-1">Organizations we're helping</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-sm text-gray-600">Types of Impact</div>
              <div className="text-xs text-gray-500 mt-1">Different ways we help</div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Type Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Choose Impact Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {impactTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <IconComponent className={`w-6 h-6 ${
                        selectedType === type.id ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <Badge variant="secondary" className="text-xs">
                        {type.count} acts
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Grid View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Timeline View
            </button>
          </div>
        </div>

        {/* Impact Stories */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
          {filteredImpacts.map((impact, index) => (
            <Card key={impact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {impact.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{impact.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {impact.location}
                      </div>
                    </div>
                  </div>
                  <Badge className={impact.color}>
                    {impact.kindnessCount} acts
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-4">{impact.description}</p>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900">Real World Impact</span>
                  </div>
                  <p className="text-sm text-gray-700">{impact.realWorldImpact}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Partner: {impact.partnerOrganization}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(impact.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Create More Impact?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Every act of kindness you share helps us support more community organizations and neighbors in need
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                💝 Share a Kind Act
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                🤝 Suggest a Community Partner
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              💡 Your kindness matters • 🌟 Real impact in our community • 🚀 Together we make a difference
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}