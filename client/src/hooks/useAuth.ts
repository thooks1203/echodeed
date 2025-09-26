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
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    // Helper methods for role checking
    isStudent: user?.schoolRole === 'student',
    isTeacher: user?.schoolRole === 'teacher',
    isAdmin: user?.schoolRole === 'admin',
    isParent: user?.schoolRole === 'parent',
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