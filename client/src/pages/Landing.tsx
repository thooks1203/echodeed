import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, CheckCircle, Users, GraduationCap, Shield, Star, Trophy, Sparkles, Award } from 'lucide-react';
import { Link } from 'wouter';
import LogoSparkEffect from '@/components/LogoSparkEffect';

const DEMO_SCHOOL_LEVEL_KEY = 'demo_school_level_override';

export default function Landing() {
  const [demoLevel, setDemoLevel] = useState<'middle_school' | 'high_school'>('high_school');

  // Check for demo override in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_SCHOOL_LEVEL_KEY);
      if (stored === 'middle_school' || stored === 'high_school') {
        setDemoLevel(stored);
      }
    }
  }, []);

  const isMiddleSchool = demoLevel === 'middle_school';

  return (
    <div className={`min-h-screen ${
      isMiddleSchool 
        ? 'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 dark:from-pink-700 dark:via-purple-700 dark:to-indigo-700'
        : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900'
    }`}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* EchoDeed Brand Logo */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-2">
              <LogoSparkEffect>
                <img 
                  src="/electric-heart-logo.png" 
                  alt="EchoDeed Logo" 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 drop-shadow-2xl"
                />
              </LogoSparkEffect>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 tracking-tight bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              EchoDeed™
            </h1>
            <p className="text-xl text-white font-medium">
              {isMiddleSchool ? 'Where Kindness Earns Cool Rewards' : 'Anonymous Kindness Platform'}
            </p>
          </div>

          {/* Pre-Headline - Different for MS vs HS */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold tracking-wide uppercase border border-white/30">
              {isMiddleSchool 
                ? '✨ Fun, Safe, & Rewarding for Grades 6-8'
                : 'Backed by Character Education Research'
              }
            </span>
          </div>

          {/* Master Headline - Different for MS vs HS */}
          {isMiddleSchool ? (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight px-2">
                Be Kind. Earn Rewards. Have Fun! 🎉
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 leading-relaxed px-2">
                Explore kindness at your own pace—no pressure, all rewards!
              </p>
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-12 italic px-2">
                Make friends while making a difference in your community.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight px-2">
                Kindness Solves More Than You Think.
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 leading-relaxed px-2">
                Transform abstract character education into daily, measurable action.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-12 italic px-2">
                Not just a mission—a proven methodology.
              </p>
            </>
          )}

          {/* Proof Points - Different for MS vs HS */}
          {isMiddleSchool ? (
            <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto px-2">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 sm:p-5 border-2 border-yellow-300 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">Earn tokens for every kind act!</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl p-4 sm:p-5 border-2 border-pink-300 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">Trade tokens for awesome prizes</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto px-2">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-4 sm:p-5 border-2 border-emerald-300 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">95% reduction in service-hour paperwork</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-4 sm:p-5 border-2 border-cyan-300 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base md:text-lg">Earn 200-hour Service Diploma</span>
                </div>
              </div>
            </div>
          )}

          {/* Primary CTAs for Real Use */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/school-register">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-white text-purple-600 hover:bg-gray-100 shadow-xl"
                data-testid="button-register-school"
              >
                <Shield className="w-5 h-5 mr-2" />
                Register Your School
              </Button>
            </Link>
            <Link href="/student-signup">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-xl"
                data-testid="button-student-signup"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Student Sign Up
              </Button>
            </Link>
          </div>

          {/* CTA Section - Different messaging for MS vs HS */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {isMiddleSchool ? 'Who Can Join?' : 'Explore EchoDeed:'}
            </h2>
            <p className="text-white/80 text-sm">
              {isMiddleSchool 
                ? 'Find out what EchoDeed can do for you!'
                : 'See what EchoDeed can do for you'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
            {/* Students CTA - Different wording for MS vs HS */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isMiddleSchool 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {isMiddleSchool ? <Sparkles className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For Students</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isMiddleSchool 
                    ? 'Do kind stuff, earn tokens, get cool rewards!'
                    : 'Turn kindness into tokens, earn rewards, track service hours'
                  }
                </p>
                <Link href="/explore/students">
                  <Button
                    className={`w-full text-white ${
                      isMiddleSchool
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                    }`}
                    data-testid="button-explore-student"
                  >
                    {isMiddleSchool ? 'Explore for Students ✨' : 'Explore for Students'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Parents CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For Parents</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isMiddleSchool
                    ? 'Watch your kid grow & earn rewards together'
                    : 'Track your child\'s growth, earn dual rewards together'
                  }
                </p>
                <Link href="/explore/parents">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                    data-testid="button-explore-parent"
                  >
                    {isMiddleSchool ? 'Explore for Parents ❤️' : 'Explore for Parents'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Teachers CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For Teachers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isMiddleSchool
                    ? 'Make character ed easy & fun for your class'
                    : 'Verify service hours, manage classroom, reduce workload'
                  }
                </p>
                <Link href="/explore/teachers">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    data-testid="button-explore-teacher"
                  >
                    {isMiddleSchool ? 'Explore for Teachers 📚' : 'Explore for Teachers'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* School Leaders CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isMiddleSchool ? <Award className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For School Leaders</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isMiddleSchool
                    ? 'Build character culture & measure outcomes'
                    : 'Get the data, see measurable character outcomes'
                  }
                </p>
                <Link href="/explore/school-leaders">
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    data-testid="button-explore-admin"
                  >
                    {isMiddleSchool ? 'For School Leaders 🏆' : 'For School Leaders'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info - Welcoming to all schools */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              {isMiddleSchool 
                ? '🌟 Perfect for Middle Schools (Grades 6-8)'
                : '🎓 Available for All K-12 Schools Nationwide'
              }
            </p>
            <p className="text-xs text-white/60 mt-2">
              {isMiddleSchool 
                ? 'Optional Community Service • Fun Character Building • Age-Appropriate Rewards'
                : 'Character Education • Service-Learning Tracking • Student Rewards • FERPA Compliant'
              }
            </p>
            <p className="text-xs text-white/50 mt-4">
              Questions? Contact us at hello@echodeed.com
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
