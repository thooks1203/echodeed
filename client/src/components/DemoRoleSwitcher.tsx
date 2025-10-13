import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Heart, Shield, Users } from 'lucide-react';
import { switchDemoRole } from '@/hooks/useAuth';

export default function DemoRoleSwitcher() {
  const roles = [
    { 
      role: 'student' as const, 
      label: 'Student',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-600',
      testid: 'demo-student'
    },
    { 
      role: 'parent' as const, 
      label: 'Parent',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      testid: 'demo-parent'
    },
    { 
      role: 'teacher' as const, 
      label: 'Teacher',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      testid: 'demo-teacher'
    },
    { 
      role: 'admin' as const, 
      label: 'School Leader',
      icon: Shield,
      color: 'from-amber-500 to-orange-600',
      testid: 'demo-admin'
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 shadow-xl">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              Try EchoDeed Demo:
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {roles.map(({ role, label, icon: Icon, color, testid }) => (
              <Button
                key={role}
                onClick={() => switchDemoRole(role)}
                variant="outline"
                size="sm"
                className={`bg-gradient-to-r ${color} text-white border-0 hover:opacity-90 transition-opacity text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-initial min-w-0`}
                data-testid={testid}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
