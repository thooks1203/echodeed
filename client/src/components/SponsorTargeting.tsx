import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  Globe,
  School,
  Heart,
  Calendar,
  BarChart3
} from 'lucide-react';

interface TargetingCampaign {
  id: string;
  name: string;
  sponsor: string;
  tier: string;
  status: 'active' | 'paused' | 'completed';
  targeting: {
    geographic: string[];
    demographic: string[];
    behavioral: string[];
    temporal: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
  };
  roi: number;
}

const sampleCampaigns: TargetingCampaign[] = [
  {
    id: '1',
    name: 'Local Coffee Community',
    sponsor: 'Local Coffee Co',
    tier: 'Silver',
    status: 'active',
    targeting: {
      geographic: ['San Francisco Bay Area', 'Within 10 miles'],
      demographic: ['Ages 25-45', 'Working professionals'],
      behavioral: ['Morning kindness acts', 'Coffee/food category'],
      temporal: ['Monday-Friday', '7-9 AM peak']
    },
    performance: {
      impressions: 15420,
      clicks: 847,
      ctr: 5.5,
      cost: 5000
    },
    roi: 285
  },
  {
    id: '2',
    name: 'Tech Innovation Campaign',
    sponsor: 'TechFlow Inc',
    tier: 'Gold',
    status: 'active',
    targeting: {
      geographic: ['Silicon Valley', 'Austin', 'Seattle'],
      demographic: ['Ages 22-40', 'Tech professionals', 'College educated'],
      behavioral: ['Innovation-related kindness', 'High engagement users'],
      temporal: ['Tuesday-Thursday', 'Peak hours']
    },
    performance: {
      impressions: 32150,
      clicks: 1926,
      ctr: 6.0,
      cost: 8000
    },
    roi: 420
  }
];

const geographicOptions = [
  { id: 'sf-bay', label: 'San Francisco Bay Area', category: 'Metro Area' },
  { id: 'la-metro', label: 'Los Angeles Metro', category: 'Metro Area' },
  { id: 'nyc-metro', label: 'New York Metro', category: 'Metro Area' },
  { id: 'austin', label: 'Austin, TX', category: 'City' },
  { id: 'seattle', label: 'Seattle, WA', category: 'City' },
  { id: 'chicago', label: 'Chicago, IL', category: 'City' },
  { id: 'california', label: 'California', category: 'State' },
  { id: 'texas', label: 'Texas', category: 'State' },
  { id: 'new-york', label: 'New York', category: 'State' },
  { id: 'west-coast', label: 'West Coast', category: 'Region' },
  { id: 'northeast', label: 'Northeast', category: 'Region' },
  { id: 'south', label: 'Southern States', category: 'Region' }
];

const demographicOptions = [
  { id: 'age-18-25', label: 'Ages 18-25', category: 'Age' },
  { id: 'age-26-35', label: 'Ages 26-35', category: 'Age' },
  { id: 'age-36-45', label: 'Ages 36-45', category: 'Age' },
  { id: 'age-46-55', label: 'Ages 46-55', category: 'Age' },
  { id: 'students', label: 'Students', category: 'Education' },
  { id: 'college-grad', label: 'College Graduates', category: 'Education' },
  { id: 'working-prof', label: 'Working Professionals', category: 'Profession' },
  { id: 'tech-workers', label: 'Tech Workers', category: 'Profession' },
  { id: 'teachers', label: 'Teachers & Educators', category: 'Profession' },
  { id: 'parents', label: 'Parents', category: 'Family' },
  { id: 'income-50k', label: 'Household Income $50K+', category: 'Income' },
  { id: 'income-100k', label: 'Household Income $100K+', category: 'Income' }
];

const behavioralOptions = [
  { id: 'high-engage', label: 'High Engagement Users', category: 'Activity' },
  { id: 'frequent-post', label: 'Frequent Posters', category: 'Activity' },
  { id: 'reward-active', label: 'Reward Active Users', category: 'Activity' },
  { id: 'cat-food', label: 'Food & Hospitality Kindness', category: 'Categories' },
  { id: 'cat-community', label: 'Community Building Acts', category: 'Categories' },
  { id: 'cat-wellness', label: 'Health & Wellness Acts', category: 'Categories' },
  { id: 'cat-education', label: 'Education Support Acts', category: 'Categories' },
  { id: 'morning-active', label: 'Morning Active (6-10 AM)', category: 'Time Patterns' },
  { id: 'evening-active', label: 'Evening Active (6-10 PM)', category: 'Time Patterns' },
  { id: 'weekend-active', label: 'Weekend Active', category: 'Time Patterns' }
];

export function SponsorTargeting() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>(sampleCampaigns[0].id);
  const [targetingSelections, setTargetingSelections] = useState({
    geographic: [] as string[],
    demographic: [] as string[],
    behavioral: [] as string[]
  });

  const currentCampaign = sampleCampaigns.find(c => c.id === selectedCampaign);

  const handleTargetingChange = (category: 'geographic' | 'demographic' | 'behavioral', optionId: string, checked: boolean) => {
    setTargetingSelections(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], optionId]
        : prev[category].filter(id => id !== optionId)
    }));
  };

  const calculateEstimatedReach = () => {
    const baseReach = 50000; // Base audience size
    const geoMultiplier = targetingSelections.geographic.length * 0.3;
    const demoMultiplier = targetingSelections.demographic.length * 0.25;
    const behavioralMultiplier = targetingSelections.behavioral.length * 0.2;
    
    const totalMultiplier = Math.max(0.1, 1 - geoMultiplier - demoMultiplier - behavioralMultiplier);
    return Math.floor(baseReach * totalMultiplier);
  };

  const estimatedReach = calculateEstimatedReach();
  const estimatedCTR = 3.5 + (targetingSelections.behavioral.length * 0.5);
  const estimatedClicks = Math.floor(estimatedReach * (estimatedCTR / 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Advanced Sponsor Targeting
          </h1>
          <p className="text-gray-600">
            Precision targeting for maximum ROI - reach exactly the right audience at the perfect moment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Management */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCampaign === campaign.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCampaign(campaign.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.tier}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        {campaign.sponsor}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Impressions</div>
                          <div className="font-semibold">{campaign.performance.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">CTR</div>
                          <div className="font-semibold">{campaign.performance.ctr}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Clicks</div>
                          <div className="font-semibold">{campaign.performance.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">ROI</div>
                          <div className="font-semibold text-green-600">{campaign.roi}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estimated Performance */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estimated Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Reach</span>
                    <span className="font-semibold">{estimatedReach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expected CTR</span>
                    <span className="font-semibold">{estimatedCTR.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expected Clicks</span>
                    <span className="font-semibold text-green-600">{estimatedClicks.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500 mb-1">Targeting Specificity</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, (targetingSelections.geographic.length + targetingSelections.demographic.length + targetingSelections.behavioral.length) * 8)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Targeting Configuration */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configure Campaign Targeting</CardTitle>
                <p className="text-sm text-gray-600">
                  Build precise audience segments for maximum engagement and ROI
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="geographic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="geographic" className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Geographic
                    </TabsTrigger>
                    <TabsTrigger value="demographic" className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Demographic
                    </TabsTrigger>
                    <TabsTrigger value="behavioral" className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Behavioral
                    </TabsTrigger>
                    <TabsTrigger value="temporal" className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Temporal
                    </TabsTrigger>
                  </TabsList>

                  {/* Geographic Targeting */}
                  <TabsContent value="geographic" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">🗺️ Geographic Targeting</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Target users in specific locations for local relevance and higher conversion rates
                      </p>
                      
                      {['Metro Area', 'City', 'State', 'Region'].map(category => (
                        <div key={category} className="mb-6">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {geographicOptions
                              .filter(option => option.category === category)
                              .map(option => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={option.id}
                                    checked={targetingSelections.geographic.includes(option.id)}
                                    onCheckedChange={(checked) => 
                                      handleTargetingChange('geographic', option.id, checked as boolean)
                                    }
                                  />
                                  <label 
                                    htmlFor={option.id} 
                                    className="text-sm cursor-pointer"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Demographic Targeting */}
                  <TabsContent value="demographic" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">👥 Demographic Targeting</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Reach specific demographic segments that align with your brand and objectives
                      </p>
                      
                      {['Age', 'Education', 'Profession', 'Family', 'Income'].map(category => (
                        <div key={category} className="mb-6">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {demographicOptions
                              .filter(option => option.category === category)
                              .map(option => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={option.id}
                                    checked={targetingSelections.demographic.includes(option.id)}
                                    onCheckedChange={(checked) => 
                                      handleTargetingChange('demographic', option.id, checked as boolean)
                                    }
                                  />
                                  <label 
                                    htmlFor={option.id} 
                                    className="text-sm cursor-pointer"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Behavioral Targeting */}
                  <TabsContent value="behavioral" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">❤️ Behavioral Targeting</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Target users based on their kindness patterns, engagement levels, and interests
                      </p>
                      
                      {['Activity', 'Categories', 'Time Patterns'].map(category => (
                        <div key={category} className="mb-6">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {behavioralOptions
                              .filter(option => option.category === category)
                              .map(option => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={option.id}
                                    checked={targetingSelections.behavioral.includes(option.id)}
                                    onCheckedChange={(checked) => 
                                      handleTargetingChange('behavioral', option.id, checked as boolean)
                                    }
                                  />
                                  <label 
                                    htmlFor={option.id} 
                                    className="text-sm cursor-pointer"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Temporal Targeting */}
                  <TabsContent value="temporal" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">🕐 Temporal Targeting</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Optimize timing for maximum engagement based on user activity patterns
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Days of Week</h4>
                          <div className="space-y-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox id={day} />
                                <label htmlFor={day} className="text-sm cursor-pointer">{day}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Time Periods</h4>
                          <div className="space-y-2">
                            {[
                              'Early Morning (6-9 AM)',
                              'Morning (9 AM-12 PM)',
                              'Afternoon (12-5 PM)',
                              'Evening (5-8 PM)',
                              'Night (8-11 PM)'
                            ].map(time => (
                              <div key={time} className="flex items-center space-x-2">
                                <Checkbox id={time} />
                                <label htmlFor={time} className="text-sm cursor-pointer">{time}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm text-blue-900 mb-2">📈 Optimal Timing Insights</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>• <strong>Peak Engagement:</strong> Tuesday-Thursday, 7-9 AM & 6-8 PM</div>
                          <div>• <strong>Weekend Activity:</strong> Saturday mornings show 40% higher kindness posting</div>
                          <div>• <strong>Local Business:</strong> Target morning commute (7-9 AM) for maximum visibility</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Total targeting selections: <strong>{targetingSelections.geographic.length + targetingSelections.demographic.length + targetingSelections.behavioral.length}</strong>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      💾 Save Campaign
                    </Button>
                    <Button>
                      🚀 Launch Campaign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Campaign Details */}
        {currentCampaign && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campaign Performance: {currentCampaign.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🗺️ Geographic Targeting</h4>
                  <div className="space-y-1">
                    {currentCampaign.targeting.geographic.map((target, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">👥 Demographics</h4>
                  <div className="space-y-1">
                    {currentCampaign.targeting.demographic.map((target, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">❤️ Behavioral</h4>
                  <div className="space-y-1">
                    {currentCampaign.targeting.behavioral.map((target, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🕐 Timing</h4>
                  <div className="space-y-1">
                    {currentCampaign.targeting.temporal.map((target, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}