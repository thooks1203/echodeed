import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Star, Zap, Target, TrendingUp } from 'lucide-react';

interface SponsorshipTier {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  premiumFeatures: string[];
  analytics: {
    impressions: string;
    priority: string;
    reporting: string;
    support: string;
  };
  branding: {
    logo: boolean;
    colors: boolean;
    messaging: boolean;
    placement: string;
  };
  roi: string;
  popular?: boolean;
}

const sponsorshipTiers: SponsorshipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Supporter',
    price: 2000,
    icon: <span style={{ fontSize: '24px' }}>🥉</span>,
    color: 'linear-gradient(135deg, #CD7F32, #D4AF37)',
    description: 'Perfect for local businesses starting their community impact journey',
    features: [
      'Basic sponsor mentions in rewards',
      'Company name display',
      'Website link inclusion',
      'Monthly engagement report',
      'Email support'
    ],
    premiumFeatures: [],
    analytics: {
      impressions: '5K-10K monthly',
      priority: 'Standard rotation',
      reporting: 'Monthly summary',
      support: 'Email support'
    },
    branding: {
      logo: false,
      colors: false,
      messaging: false,
      placement: 'Standard'
    },
    roi: '120-180%'
  },
  {
    id: 'silver',
    name: 'Silver Partner',
    price: 5000,
    icon: <span style={{ fontSize: '24px' }}>🥈</span>,
    color: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
    description: 'Enhanced visibility with custom branding and detailed analytics',
    features: [
      'Custom brand colors & gradients',
      'Logo integration',
      'Custom call-to-action messages',
      'Detailed analytics dashboard',
      'Click & impression tracking',
      'Impact reporting with ROI metrics',
      'Priority support'
    ],
    premiumFeatures: [
      'Advanced engagement scoring',
      'Brand sentiment analysis',
      'Community impact stories'
    ],
    analytics: {
      impressions: '15K-25K monthly',
      priority: 'Enhanced visibility',
      reporting: 'Real-time dashboard',
      support: 'Priority support'
    },
    branding: {
      logo: true,
      colors: true,
      messaging: true,
      placement: 'Enhanced'
    },
    roi: '200-300%',
    popular: true
  },
  {
    id: 'gold',
    name: 'Gold Champion',
    price: 8000,
    icon: <span style={{ fontSize: '24px' }}>🥇</span>,
    color: 'linear-gradient(135deg, #FFD700, #FFA500)',
    description: 'Premium placement with exclusive features and campaign management',
    features: [
      'All Silver features',
      'Featured placement in rewards',
      'Custom campaign creation',
      'A/B testing for messaging',
      'Advanced demographic targeting',
      'Weekly strategy calls',
      'Dedicated account manager'
    ],
    premiumFeatures: [
      'Exclusive content placement',
      'Custom reward partnerships',
      'Viral sharing optimization',
      'Corporate wellness integration'
    ],
    analytics: {
      impressions: '30K-50K monthly',
      priority: 'Featured placement',
      reporting: 'Advanced analytics suite',
      support: 'Dedicated account manager'
    },
    branding: {
      logo: true,
      colors: true,
      messaging: true,
      placement: 'Featured'
    },
    roi: '350-500%'
  },
  {
    id: 'platinum',
    name: 'Platinum Exclusive',
    price: 12000,
    icon: <span style={{ fontSize: '24px' }}>💎</span>,
    color: 'linear-gradient(135deg, #E5E4E2, #BCC6CC)',
    description: 'Ultimate sponsorship with exclusive access and custom integrations',
    features: [
      'All Gold features',
      'Exclusive sponsor category',
      'Custom app integration',
      'Co-branded content creation',
      'Executive advisory access',
      'Custom KPI development',
      'White-label opportunities'
    ],
    premiumFeatures: [
      'Product integration partnerships',
      'Thought leadership content',
      'Executive networking events',
      'Custom API integrations'
    ],
    analytics: {
      impressions: '100K+ monthly',
      priority: 'Exclusive placement',
      reporting: 'Custom analytics suite',
      support: 'Executive relationship manager'
    },
    branding: {
      logo: true,
      colors: true,
      messaging: true,
      placement: 'Exclusive'
    },
    roi: '600-800%'
  }
];

export function SponsorshipTiers() {
  const [selectedTier, setSelectedTier] = useState<string>('silver');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 EchoDeed™ Sponsorship Tiers
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Invest in community kindness while driving measurable business results
          </p>
          <p className="text-lg text-gray-500">
            Join companies already seeing 200-800% ROI through meaningful community engagement
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sponsorshipTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedTier === tier.id ? 'ring-4 ring-blue-500 shadow-2xl' : 'shadow-lg'
              } ${tier.popular ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="mb-4">
                  {tier.icon}
                </div>
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${tier.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {tier.premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Crown className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-purple-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{tier.roi}</div>
                    <div className="text-xs text-gray-600">Expected ROI</div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  style={{ 
                    background: tier.color,
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {tier.id === selectedTier ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Comparison */}
        {selectedTier && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {sponsorshipTiers.find(t => t.id === selectedTier)?.name} - Detailed Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const tier = sponsorshipTiers.find(t => t.id === selectedTier);
                if (!tier) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📊 Analytics</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Impressions:</strong> {tier.analytics.impressions}</div>
                        <div><strong>Priority:</strong> {tier.analytics.priority}</div>
                        <div><strong>Reporting:</strong> {tier.analytics.reporting}</div>
                        <div><strong>Support:</strong> {tier.analytics.support}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">🎨 Branding</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Logo Integration:</span>
                          {tier.branding.logo ? 
                            <Check className="w-4 h-4 text-green-500" /> : 
                            <span className="text-gray-400">✗</span>
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Custom Colors:</span>
                          {tier.branding.colors ? 
                            <Check className="w-4 h-4 text-green-500" /> : 
                            <span className="text-gray-400">✗</span>
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Custom Messaging:</span>
                          {tier.branding.messaging ? 
                            <Check className="w-4 h-4 text-green-500" /> : 
                            <span className="text-gray-400">✗</span>
                          }
                        </div>
                        <div><strong>Placement:</strong> {tier.branding.placement}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">🎯 Value Proposition</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Expected ROI:</strong> {tier.roi}</div>
                        <div><strong>Monthly Cost:</strong> ${tier.price.toLocaleString()}</div>
                        <div><strong>Cost per 1K impressions:</strong> ${Math.round((tier.price / parseInt(tier.analytics.impressions.split('-')[0].replace('K', '000').replace('+', ''))) * 1000)}</div>
                        <div><strong>Break-even:</strong> ~{Math.round(tier.price / 50)} new customers</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📈 Growth Potential</h4>
                      <div className="space-y-2 text-sm">
                        <div>Brand awareness lift</div>
                        <div>Community engagement</div>
                        <div>Customer acquisition</div>
                        <div>Positive brand association</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Make a Measurable Impact?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join forward-thinking companies already seeing incredible ROI through community kindness
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                📞 Schedule Strategy Call
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                📊 View Success Stories
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              💡 Free consultation • 📈 ROI guarantee • 🚀 Launch in 48 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}