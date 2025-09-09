import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Star,
  Waves,
  Circle
} from 'lucide-react';

interface KindnessRipple {
  id: string;
  originalAct: string;
  originalAuthor: string;
  rippleEffects: {
    id: string;
    inspiredAct: string;
    inspiredBy: string;
    timeDelay: string;
    generation: number;
  }[];
  totalInspired: number;
  currentGeneration: number;
  impact: 'local' | 'school' | 'community';
}

interface RippleChain {
  id: string;
  generation: number;
  act: string;
  author: string;
  timeDelay: string;
  inspirationSource?: string;
}

const sampleRipples: KindnessRipple[] = [
  {
    id: '1',
    originalAct: 'Sarah helped a classmate who dropped their books',
    originalAuthor: 'Sarah M.',
    rippleEffects: [
      {
        id: '1-1',
        inspiredAct: 'Alex saw Sarah helping and helped another student tie their shoes',
        inspiredBy: 'Alex K.',
        timeDelay: '2 hours later',
        generation: 1
      },
      {
        id: '1-2',
        inspiredAct: 'Maya helped her neighbor carry groceries after school',
        inspiredBy: 'Maya T.',
        timeDelay: '1 day later',
        generation: 1
      },
      {
        id: '1-3',
        inspiredAct: 'Class organized a help-others challenge',
        inspiredBy: 'Mrs. Johnson',
        timeDelay: '3 days later',
        generation: 2
      }
    ],
    totalInspired: 8,
    currentGeneration: 3,
    impact: 'school'
  },
  {
    id: '2',
    originalAct: 'Marcus shared his lunch with a student who forgot theirs',
    originalAuthor: 'Marcus R.',
    rippleEffects: [
      {
        id: '2-1',
        inspiredAct: 'Emma brought extra snacks to share the next day',
        inspiredBy: 'Emma S.',
        timeDelay: '1 day later',
        generation: 1
      },
      {
        id: '2-2',
        inspiredAct: 'Parents started a classroom snack fund',
        inspiredBy: 'Parent volunteers',
        timeDelay: '1 week later',
        generation: 2
      }
    ],
    totalInspired: 5,
    currentGeneration: 2,
    impact: 'community'
  },
  {
    id: '3',
    originalAct: 'Lily wrote thank you notes to the cafeteria staff',
    originalAuthor: 'Lily W.',
    rippleEffects: [
      {
        id: '3-1',
        inspiredAct: 'Other classes started writing thank you notes too',
        inspiredBy: '3rd & 4th grade',
        timeDelay: '2 days later',
        generation: 1
      },
      {
        id: '3-2',
        inspiredAct: 'School started monthly appreciation program',
        inspiredBy: 'Principal Davis',
        timeDelay: '2 weeks later',
        generation: 2
      }
    ],
    totalInspired: 12,
    currentGeneration: 3,
    impact: 'school'
  }
];

const impactColors = {
  local: 'bg-blue-100 text-blue-800',
  school: 'bg-green-100 text-green-800',
  community: 'bg-purple-100 text-purple-800'
};

const rippleChains: RippleChain[] = [
  {
    id: 'original-1',
    generation: 0,
    act: 'Sarah helped a classmate who dropped their books',
    author: 'Sarah M.',
    timeDelay: 'Original act'
  },
  {
    id: 'gen1-1',
    generation: 1,
    act: 'Alex helped another student tie their shoes',
    author: 'Alex K.',
    timeDelay: '2 hours later',
    inspirationSource: 'Saw Sarah helping'
  },
  {
    id: 'gen1-2',
    generation: 1,
    act: 'Maya helped her neighbor carry groceries',
    author: 'Maya T.',
    timeDelay: '1 day later',
    inspirationSource: 'Heard about Sarah\'s kindness'
  },
  {
    id: 'gen2-1',
    generation: 2,
    act: 'Class organized a help-others challenge',
    author: 'Mrs. Johnson',
    timeDelay: '3 days later',
    inspirationSource: 'Inspired by student examples'
  },
  {
    id: 'gen2-2',
    generation: 2,
    act: 'Students helped in the school garden',
    author: '5 students',
    timeDelay: '1 week later',
    inspirationSource: 'Challenge participation'
  },
  {
    id: 'gen3-1',
    generation: 3,
    act: 'Other classes joined the garden project',
    author: '2nd grade class',
    timeDelay: '2 weeks later',
    inspirationSource: 'Saw garden improvements'
  }
];

export function KindnessRippleTracker() {
  const [selectedRipple, setSelectedRipple] = useState<string>(sampleRipples[0].id);
  const [viewMode, setViewMode] = useState<'overview' | 'chain'>('overview');
  const [animatedChain, setAnimatedChain] = useState<boolean>(false);

  const currentRipple = sampleRipples.find(r => r.id === selectedRipple) || sampleRipples[0];
  const totalRippleImpact = sampleRipples.reduce((sum, ripple) => sum + ripple.totalInspired, 0);

  useEffect(() => {
    if (viewMode === 'chain') {
      setAnimatedChain(true);
      const timer = setTimeout(() => setAnimatedChain(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Kindness Ripple Tracker
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            See how your kindness creates waves of good that spread through our community
          </p>
          <p className="text-sm text-gray-500">
            Every act of kindness you share can inspire others to be kind too! 🌊
          </p>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalRippleImpact}</div>
              <div className="text-sm text-gray-600">People Inspired</div>
              <div className="text-xs text-gray-500 mt-1">by your kindness</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{sampleRipples.length}</div>
              <div className="text-sm text-gray-600">Active Ripples</div>
              <div className="text-xs text-gray-500 mt-1">still spreading</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <div className="text-sm text-gray-600">Max Generations</div>
              <div className="text-xs text-gray-500 mt-1">ripple depth</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">72%</div>
              <div className="text-sm text-gray-600">Inspiration Rate</div>
              <div className="text-xs text-gray-500 mt-1">acts that inspire others</div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'overview'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌊 Ripple Overview
            </button>
            <button
              onClick={() => setViewMode('chain')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'chain'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔗 Ripple Chain
            </button>
          </div>
        </div>

        {viewMode === 'overview' ? (
          /* Overview Mode */
          <div className="space-y-6">
            {/* Ripple Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Choose a Kindness Ripple to Explore
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleRipples.map((ripple) => (
                    <button
                      key={ripple.id}
                      onClick={() => setSelectedRipple(ripple.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedRipple === ripple.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {ripple.originalAct}
                          </div>
                          <div className="text-sm text-gray-600">
                            by {ripple.originalAuthor}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={impactColors[ripple.impact]}>
                            {ripple.impact}
                          </Badge>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                              {ripple.totalInspired}
                            </div>
                            <div className="text-xs text-gray-500">inspired</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Ripple Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Ripple Effects from: "{currentRipple.originalAct}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Original Act */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        0
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Original Act</div>
                        <div className="text-sm text-gray-600">by {currentRipple.originalAuthor}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-11">{currentRipple.originalAct}</p>
                  </div>

                  {/* Ripple Effects */}
                  {currentRipple.rippleEffects.map((effect, index) => (
                    <div key={effect.id} className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          effect.generation === 1 ? 'bg-green-500' : 
                          effect.generation === 2 ? 'bg-orange-500' : 'bg-purple-500'
                        }`}>
                          {effect.generation}
                        </div>
                      </div>
                      <div className="flex-1 p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {effect.inspiredAct}
                            </div>
                            <div className="text-sm text-gray-600">
                              by {effect.inspiredBy}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {effect.timeDelay}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Impact Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          This kindness ripple has inspired {currentRipple.totalInspired} people across {currentRipple.currentGeneration} generations!
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Your simple act of kindness created a wave of good that's still spreading! 🌊✨
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Chain Mode */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Kindness Chain Animation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rippleChains.map((chain, index) => (
                  <div 
                    key={chain.id}
                    className={`transition-all duration-1000 ${
                      animatedChain ? `opacity-0 translate-x-10 delay-${index * 200}` : 'opacity-100 translate-x-0'
                    }`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          chain.generation === 0 ? 'bg-blue-500' :
                          chain.generation === 1 ? 'bg-green-500' :
                          chain.generation === 2 ? 'bg-orange-500' : 'bg-purple-500'
                        }`}>
                          {chain.generation === 0 ? '🌱' : '🌊'}
                        </div>
                        {index < rippleChains.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            Generation {chain.generation}: {chain.act}
                          </div>
                          <Badge variant="outline">
                            {chain.timeDelay}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>by {chain.author}</span>
                          {chain.inspirationSource && (
                            <>
                              <span>•</span>
                              <span className="italic">{chain.inspirationSource}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Button onClick={() => setAnimatedChain(true)} disabled={animatedChain}>
                  <Star className="w-4 h-4 mr-2" />
                  {animatedChain ? 'Animating...' : 'Replay Animation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your Own Kindness Ripple?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Every act of kindness has the power to inspire others. Your simple gesture could create a wave that reaches hundreds of people!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                🌊 Share an Act of Kindness
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                💫 View My Impact
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              🌟 Your kindness matters • 🌊 Create ripples of good • ✨ Inspire others to be kind
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}