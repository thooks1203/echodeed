import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, CheckCircle, Users, GraduationCap, Shield } from 'lucide-react';
import { Link } from 'wouter';
import LogoSparkEffect from '@/components/LogoSparkEffect';

export default function Landing() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
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
                  className="w-48 h-48 md:w-56 md:h-56 drop-shadow-2xl"
                />
              </LogoSparkEffect>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-3 tracking-tight bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              EchoDeed™
            </h1>
            <p className="text-xl text-white font-medium">
              Anonymous Kindness Platform
            </p>
          </div>

          {/* Pre-Headline */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold tracking-wide uppercase border border-white/30">
              Backed by Character Education Research
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight px-2">
            Kindness Solves More Than You Think.
          </h1>

          {/* Sub-Headline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 leading-relaxed px-2">
            Transform abstract character education into daily, measurable action.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-12 italic px-2">
            Not just a mission—a proven methodology.
          </p>

          {/* Proof Points */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto px-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-4 sm:p-5 border-2 border-emerald-300 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base md:text-lg">95% reduction in service-hour paperwork</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-4 sm:p-5 border-2 border-cyan-300 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base md:text-lg">Privacy-first design & AI safety</span>
              </div>
            </div>
          </div>

          {/* CTA Section - Three Audience Paths */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Explore EchoDeed:
            </h2>
            <p className="text-white/80 text-sm">
              See what EchoDeed can do for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
            {/* Students CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 whitespace-nowrap">For Students</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Turn kindness into tokens, earn rewards, track service hours
                </p>
                <Link href="/explore/students">
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    data-testid="button-explore-student"
                  >
                    Explore for Students
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
                <h3 className="text-lg font-bold mb-2 text-gray-900 whitespace-nowrap">For Parents</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track your child's growth, earn dual rewards together
                </p>
                <Link href="/explore/parents">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                    data-testid="button-explore-parent"
                  >
                    Explore for Parents
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
                <h3 className="text-lg font-bold mb-2 text-gray-900 whitespace-nowrap">For Teachers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verify service hours, manage classroom, reduce workload
                </p>
                <Link href="/explore/teachers">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    data-testid="button-explore-teacher"
                  >
                    Explore for Teachers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* School Leaders CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 whitespace-nowrap">For School Leaders</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the data, see measurable character outcomes
                </p>
                <Link href="/explore/school-leaders">
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    data-testid="button-explore-admin"
                  >
                    For School Leaders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              Currently piloting at Eastern Guilford High School, Gibsonville, NC
            </p>
            <p className="text-xs text-white/60 mt-2">
              Grades 9-12 • 1,200 Students • Led by Principal Dr. Darrell Harris
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
