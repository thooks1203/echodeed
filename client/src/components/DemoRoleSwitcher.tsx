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
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-gray-900">
              Try EchoDeed Demo:
            </p>
          </div>
          <div className="flex gap-2">
            {roles.map(({ role, label, icon: Icon, color, testid }) => (
              <Button
                key={role}
                onClick={() => switchDemoRole(role)}
                variant="outline"
                size="sm"
                className={`bg-gradient-to-r ${color} text-white border-0 hover:opacity-90 transition-opacity`}
                data-testid={testid}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
