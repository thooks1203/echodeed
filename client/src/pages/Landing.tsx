import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, CheckCircle, Users, GraduationCap, Shield } from 'lucide-react';
import { switchDemoRole } from '@/hooks/useAuth';

export default function Landing() {
  const handleRoleSelect = (role: 'student' | 'teacher' | 'admin' | 'parent') => {
    switchDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pre-Headline */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold tracking-wide uppercase border border-white/30">
              Backed by SEL Science
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Kindness Solves More Than You Think.
          </h1>

          {/* Sub-Headline */}
          <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed">
            Transform abstract character education into daily, measurable action.
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-12 italic">
            Not just a mission—a proven methodology.
          </p>

          {/* Proof Points */}
          <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="font-semibold">95% reduction in service-hour paperwork</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="font-semibold">Built-in COPPA compliance & AI safety</span>
              </div>
            </div>
          </div>

          {/* CTA Section - Three Audience Paths */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Discover EchoDeed:
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {/* Students CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For Students</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Turn kindness into tokens, earn rewards, track service hours
                </p>
                <Button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  data-testid="button-explore-student"
                >
                  Explore Now
                </Button>
              </CardContent>
            </Card>

            {/* Parents CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For Parents</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track your child's growth, earn dual rewards together
                </p>
                <Button
                  onClick={() => handleRoleSelect('parent')}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  data-testid="button-explore-parent"
                >
                  See How It Works
                </Button>
              </CardContent>
            </Card>

            {/* School Leaders CTA */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">For School Leaders</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the data, see measurable character outcomes
                </p>
                <Button
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  data-testid="button-explore-admin"
                >
                  Get the Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Teacher Quick Access */}
          <div className="mt-8">
            <Button
              onClick={() => handleRoleSelect('teacher')}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              data-testid="button-explore-teacher"
            >
              <Users className="w-4 h-4 mr-2" />
              Teacher View
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              Currently piloting at Eastern Guilford High School, Gibsonville, NC
            </p>
            <p className="text-xs text-white/60 mt-2">
              Grades 9-12 • 1,200 Students • Led by 2024 Principal of the Year Dr. Darrell Harris
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
