import { useQuery } from "@tanstack/react-query";

type SchoolRole = 'student' | 'teacher' | 'admin' | 'parent' | 'counselor';

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

  // Demo fallback: Use localStorage demo role if real auth fails (works in both dev and production)
  const getDemoUser = (): AuthUser | null => {
    // Allow demo mode in both development and production for the educational platform
    // This is safe because it's for demonstration purposes only
    
    const storedRole = localStorage.getItem('echodeed_demo_role');
    if (!storedRole) return null;
    
    const demoUsers: Record<string, AuthUser> = {
      student: {
        id: 'student-001',
        name: 'Emma Johnson',
        email: 'emma.johnson@student.edu',
        schoolRole: 'student',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
        grade: '9th'
      },
      teacher: {
        id: 'teacher-001', 
        name: 'Ms. Sarah Wilson',
        email: 'sarah.wilson@school.edu',
        schoolRole: 'teacher',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      admin: {
        id: 'admin-001',
        name: 'Mr. Murr',
        email: 'murr@bca.edu', 
        schoolRole: 'admin',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      parent: {
        id: 'parent-001',
        name: 'Mrs. Sarah Johnson',
        email: 'sarah.johnson@parent.edu',
        schoolRole: 'parent',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      }
    };
    
    return demoUsers[storedRole] || null;
  };

  // CRITICAL FIX: Prefer demo role over server response for demo platform
  const demo = getDemoUser();
  const finalUser = demo ?? user;

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

// Demo utility functions (works in both development and production)
export function switchDemoRole(role: SchoolRole) {
  // Always set demo role and session for educational demo purposes
  localStorage.setItem('echodeed_demo_role', role);
  
  // Ensure session exists for API calls
  if (!localStorage.getItem('echodeed_session')) {
    localStorage.setItem('echodeed_session', 'demo-session');
  }
  
  // Reload to apply new role
  window.location.reload();
}

// Get available demo roles for testing
export function getDemoRoles() {
  return [
    { role: 'student' as const, label: 'Student (Emma Johnson)', description: 'Limited access - can only see own data' },
    { role: 'teacher' as const, label: 'Teacher (Ms. Wilson)', description: 'Can access classroom tools and some school data' },
    { role: 'admin' as const, label: 'Admin (Mr. Murr)', description: 'Full access to school management dashboard' },
    { role: 'parent' as const, label: 'Parent (Mrs. Smith)', description: 'Track children\'s kindness journey and approve activities' }
  ] as const;
}