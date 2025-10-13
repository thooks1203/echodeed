import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ArrowLeft, 
  CheckCircle, 
  Zap,
  Gift,
  Shield,
  TrendingUp,
  Users,
  Target,
  Award,
  Clock,
  BarChart3
} from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { switchDemoRole } from '@/hooks/useAuth';
import DemoRoleSwitcher from '@/components/DemoRoleSwitcher';

interface RoleConfig {
  role: 'student' | 'parent' | 'admin' | 'teacher';
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDescription: string;
  benefits: Array<{
    icon: any;
    title: string;
    description: string;
  }>;
  proofPoints: Array<{
    stat: string;
    label: string;
  }>;
  ctaText: string;
  gradient: string;
  iconGradient: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  students: {
    role: 'student',
    title: 'EchoDeed for Students',
    subtitle: 'Turn Your Kindness Into Real Rewards',
    heroTitle: 'Make Kindness Count',
    heroDescription: 'Every kind act you do earns you tokens you can spend on real rewards from local businesses. Track your service hours automatically, inspire others around the world anonymously, and build character while having fun.',
    benefits: [
      {
        icon: Zap,
        title: 'Earn $ECHO Tokens',
        description: 'Get rewarded for every kind act. Turn kindness into movie tickets, food, entertainment, and more from local businesses.'
      },
      {
        icon: Clock,
        title: 'Photo Proof = Instant Approval',
        description: 'Upload verification photos with your service details. Teachers see visual proof and approve in 30 seconds. Exports to x2vol when verified.'
      },
      {
        icon: Gift,
        title: 'Real Rewards, Real Fast',
        description: 'Redeem at Chick-fil-A, Cook Out, Greensboro Grasshoppers, Urban Air, and 20+ local Greensboro partners.'
      },
      {
        icon: Target,
        title: 'Inspire the World',
        description: 'Your anonymous posts inspire classmates, students across the country, and people worldwide to spread kindness.'
      }
    ],
    proofPoints: [
      { stat: '30 sec', label: 'service hour verification' },
      { stat: '20+ partners', label: 'local reward businesses' },
      { stat: '100%', label: 'anonymous & safe' }
    ],
    ctaText: 'Sign Up as Student',
    gradient: 'from-emerald-500 to-teal-600',
    iconGradient: 'from-emerald-400 to-teal-500'
  },
  parents: {
    role: 'parent',
    title: 'EchoDeed for Parents',
    subtitle: 'See Your Child Grow Through Kindness',
    heroTitle: 'Stay Connected to Your Child\'s Character Development',
    heroDescription: 'Character development happens daily, not just during organized service events. Get real-time notifications when your child posts kind acts. Earn dual rewards together - they get student rewards, you get family rewards. Watch their growth with verified service hours and measurable character outcomes.',
    benefits: [
      {
        icon: Heart,
        title: 'Real-Time Activity Feed',
        description: 'See every kind act your child posts. Get instant notifications and celebrate their growth together.'
      },
      {
        icon: Gift,
        title: 'Dual Rewards System',
        description: 'Your child earns tokens for dining, entertainment, and gift cards. You earn family rewards at Target and Amazon.'
      },
      {
        icon: Shield,
        title: 'See Hours Instantly Verified',
        description: 'Watch your child\'s hours get approved in real-time with photo proof. No more asking "did my hours get recorded?" - you see everything as it happens.'
      },
      {
        icon: TrendingUp,
        title: 'Measurable Growth',
        description: 'Track kindness streaks, service hour progress, and character development with real data.'
      }
    ],
    proofPoints: [
      { stat: '100%', label: 'anonymous & safe' },
      { stat: '2x', label: 'family rewards together' },
      { stat: 'Real-time', label: 'see their kindness acts' }
    ],
    ctaText: 'Sign Up as Parent',
    gradient: 'from-rose-500 to-pink-600',
    iconGradient: 'from-rose-400 to-pink-500'
  },
  teachers: {
    role: 'teacher',
    title: 'EchoDeed for Teachers',
    subtitle: 'Students Actually WANT to Submit Service Hours',
    heroTitle: 'Photo Verification = Instant Trust',
    heroDescription: 'Students are motivated to submit hours because they earn rewards. You verify in 30 seconds with visual proof - no more "did they really do it?" questions. Parents see hours instantly, eliminating follow-up emails. Spend less time chasing paperwork, more time building culture.',
    benefits: [
      {
        icon: Clock,
        title: 'Visual Proof You Can Trust',
        description: 'Students upload verification photos showing real evidence. One glance tells you everything - no more doubting if hours are legitimate or chasing down confirmation.'
      },
      {
        icon: Zap,
        title: 'Kids Are Motivated to Submit',
        description: 'Students earn Echo Tokens for verified hours, redeemable at 20+ local businesses. They WANT to submit because there\'s an instant reward - no more nagging.'
      },
      {
        icon: Users,
        title: 'Parents See Everything Instantly',
        description: 'Real-time parent visibility means zero "where are my hours?" emails. Parents watch progress automatically - you never have to send status updates again.'
      },
      {
        icon: Award,
        title: 'You Get Rewarded Too',
        description: 'Earn Coffee Carafes, Spa Days, and Restaurant Cards for fostering classroom community. Recognition for the culture you build, not just the hours you verify.'
      }
    ],
    proofPoints: [
      { stat: '30 sec', label: 'verification with photo proof' },
      { stat: '95%', label: 'fewer parent emails' },
      { stat: '100%', label: 'student participation' }
    ],
    ctaText: 'Access Teacher Dashboard',
    gradient: 'from-blue-500 to-indigo-600',
    iconGradient: 'from-blue-400 to-indigo-500'
  },
  'school-leaders': {
    role: 'admin',
    title: 'EchoDeed for School Leaders',
    subtitle: 'The Culture Engine That Complements x2vol',
    heroTitle: 'Capture the "Quiet Good" x2vol Doesn\'t Track',
    heroDescription: 'x2vol tracks formal service hours for graduation requirements. EchoDeed captures daily informal kindness - the spontaneous acts that build school culture. Character development happens daily, not just during organized service events. Parent engagement = better student outcomes + reduced behavioral issues.',
    benefits: [
      {
        icon: BarChart3,
        title: 'Culture Data x2vol Can\'t Capture',
        description: 'Track anonymous daily kindness acts that build school culture. x2vol handles formal service hours, EchoDeed tracks the "quiet good" that creates belonging.'
      },
      {
        icon: Users,
        title: 'Parent Engagement Engine',
        description: 'Parents see real-time kindness acts, earn family rewards together. Higher parent engagement = better student outcomes + reduced behavioral issues.'
      },
      {
        icon: Shield,
        title: 'Anonymous by Design (Reduces Cyberbullying)',
        description: 'No profiles, no names, no performative kindness. Privacy-first 9-12 engagement gives you a legal moat x2vol doesn\'t have.'
      },
      {
        icon: Clock,
        title: 'Works With x2vol (Export Ready)',
        description: 'Verified service hours export to x2vol CSV format. Administrative ledger (x2vol) + culture engine (EchoDeed) = complete picture.'
      }
    ],
    proofPoints: [
      { stat: '100%', label: 'anonymous (no cyberbullying)' },
      { stat: 'Daily', label: 'culture data x2vol misses' },
      { stat: 'x2vol', label: 'export compatible' }
    ],
    ctaText: 'Sign Up as School Leader',
    gradient: 'from-amber-500 to-orange-600',
    iconGradient: 'from-amber-400 to-orange-500'
  }
};

export default function ExploreRolePage() {
  const [match, params] = useRoute('/explore/:role');
  const roleKey = params?.role || 'students';
  const config = roleConfigs[roleKey];

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <Card className="max-w-md p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignUp = () => {
    switchDemoRole(config.role);
  };

  const Icon = config.benefits[0].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Demo Role Switcher */}
          <div className="mb-6">
            <DemoRoleSwitcher />
          </div>

          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* EchoDeed Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/electric-heart-logo.png" 
                alt="EchoDeed Logo" 
                className="w-48 h-48 md:w-56 md:h-56 drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              {config.title}
            </h1>
            <p className="text-xl text-white/90">
              {config.subtitle}
            </p>
          </div>

          {/* Hero Message */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-12">
            <CardContent className="p-8 md:p-12">
              <div className={`w-20 h-20 bg-gradient-to-br ${config.iconGradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                {config.heroTitle}
              </h2>
              <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
                {config.heroDescription}
              </p>
            </CardContent>
          </Card>

          {/* Administrative ROI Section - Only for School Leaders */}
          {roleKey === 'school-leaders' && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-12">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
                  The Administrative ROI: Why EchoDeed Pays for Itself
                </h2>
                <p className="text-lg text-gray-600 mb-6 text-center font-medium">
                  Beyond culture, the platform is designed as an operational efficiency tool.
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
                  <p className="text-base text-gray-700 leading-relaxed">
                    "It's an essential administrative tool. We mitigate operational risk with advanced data security, provide clear legal audit trails for behavioral insights, and reduce teacher workload by automating recognition and reporting. <strong className="text-amber-700">The platform pays for itself in saved staff time and operational efficiency.</strong>"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proof Points - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-12">
            {config.proofPoints.map((point, index) => (
              <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className={`text-xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                    {point.stat}
                  </div>
                  <div className="text-[10px] sm:text-sm text-gray-600 font-medium leading-tight">
                    {point.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {config.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${config.iconGradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <BenefitIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-700">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Join EchoDeed today and start making kindness count. It's free to sign up.
              </p>
              <Button
                onClick={handleSignUp}
                className={`text-lg px-8 py-6 h-auto bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white shadow-lg`}
                data-testid={`button-signup-${config.role}`}
              >
                {config.ctaText}
              </Button>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>FERPA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Safe & Anonymous</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-white/70 text-sm">
              Currently piloting at Eastern Guilford High School, Gibsonville, NC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
