import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Shield, Heart } from 'lucide-react';
import { switchDemoRole } from '@/hooks/useAuth';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';

export default function DemoLogin() {
  const { schoolLevel } = useSchoolLevel();
  const isMiddleSchool = schoolLevel === 'middle_school';
  
  const handleRoleSelect = (role: 'student' | 'teacher' | 'admin' | 'parent') => {
    switchDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">EchoDeed™</CardTitle>
          <CardDescription className="text-base">
            {isMiddleSchool 
              ? 'Eastern Guilford Middle School - Gibsonville, NC'
              : 'Eastern Guilford High School - Gibsonville, NC'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground mb-4">
              🎓 Demo Mode - One-click login for testing
            </p>
            
            <Button
              onClick={() => handleRoleSelect('student')}
              className="w-full h-14 text-base font-medium bg-blue-500 hover:bg-blue-600 text-white"
              data-testid="button-demo-student"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Try as Student (Sofia Rodriguez)
            </Button>
            
            <Button
              onClick={() => handleRoleSelect('teacher')}
              className="w-full h-14 text-base font-medium bg-green-500 hover:bg-green-600 text-white"
              data-testid="button-demo-teacher"
            >
              <Users className="w-5 h-5 mr-2" />
              Try as Teacher (Ms. Kim Jones)
            </Button>
            
            <Button
              onClick={() => handleRoleSelect('admin')}
              className="w-full h-14 text-base font-medium bg-purple-500 hover:bg-purple-600 text-white"
              data-testid="button-demo-admin"
            >
              <Shield className="w-5 h-5 mr-2" />
              Try as Principal ({isMiddleSchool ? 'Ms McNeil' : 'Dr. Darrell Harris'})
            </Button>
            
            <Button
              onClick={() => handleRoleSelect('parent')}
              className="w-full h-14 text-base font-medium bg-pink-500 hover:bg-pink-600 text-white"
              data-testid="button-demo-parent"
            >
              <Heart className="w-5 h-5 mr-2" />
              Try as Parent (Maria Rodriguez)
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              {isMiddleSchool 
                ? 'Eastern Guilford Middle School, Gibsonville • Grades 6-8 • 800 Students'
                : 'Eastern Guilford High School, Gibsonville • Grades 9-12 • 1,200 Students'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
