import { useQuery } from "@tanstack/react-query";
import { SchoolRole } from "@shared/schema";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolRole?: SchoolRole;
  schoolId?: string;
  grade?: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Development fallback: Use localStorage demo role if real auth fails
  const getDemoUser = (): AuthUser | null => {
    if (import.meta.env.NODE_ENV !== 'development') return null;
    
    const storedRole = localStorage.getItem('echodeed_demo_role') as SchoolRole;
    if (!storedRole) return null;
    
    const demoUsers = {
      student: {
        id: 'student-001',
        name: 'Emma Johnson',
        email: 'emma.johnson@student.edu',
        schoolRole: 'student' as SchoolRole,
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
        grade: '9th'
      },
      teacher: {
        id: 'teacher-001', 
        name: 'Ms. Sarah Wilson',
        email: 'sarah.wilson@school.edu',
        schoolRole: 'teacher' as SchoolRole,
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      admin: {
        id: 'admin-001',
        name: 'Dr. Michael Brown',
        email: 'michael.brown@district.edu', 
        schoolRole: 'admin' as SchoolRole,
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      parent: {
        id: 'parent-001',
        name: 'Mrs. Sarah Johnson',
        email: 'sarah.johnson@parent.edu',
        schoolRole: 'parent' as SchoolRole,
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      }
    };
    
    return demoUsers[storedRole] || null;
  };

  // Use real user if available, otherwise fallback to demo user in development
  const finalUser = user || (error ? getDemoUser() : null);

  return {
    user: finalUser,
    isLoading,
    isAuthenticated: !!finalUser,
    // Helper methods for role checking
    isStudent: finalUser?.schoolRole === 'student',
    isTeacher: finalUser?.schoolRole === 'teacher',
    isAdmin: finalUser?.schoolRole === 'admin',
    isParent: finalUser?.schoolRole === 'parent',
  };
}

// Demo utility functions (maintained for development compatibility)
export function switchDemoRole(role: SchoolRole) {
  // In production, redirect to login
  if (import.meta.env.NODE_ENV === 'production') {
    window.location.href = '/api/login';
    return;
  }
  
  // In development, maintain localStorage behavior for testing
  localStorage.setItem('echodeed_demo_role', role);
  window.location.reload();
}

// Get available demo roles for testing
export function getDemoRoles() {
  return [
    { role: 'student' as const, label: 'Student (Emma Johnson)', description: 'Limited access - can only see own data' },
    { role: 'teacher' as const, label: 'Teacher (Ms. Wilson)', description: 'Can access classroom tools and some school data' },
    { role: 'admin' as const, label: 'Admin (Dr. Brown)', description: 'Full access to school management dashboard' },
    { role: 'parent' as const, label: 'Parent (Mrs. Smith)', description: 'Track children\'s kindness journey and approve activities' }
  ] as const;
}